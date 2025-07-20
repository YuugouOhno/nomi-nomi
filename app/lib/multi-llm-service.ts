import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import { Schema } from "@/amplify/data/resource";

// GraphQLクライアントの初期化
const client = generateClient<Schema>({ authMode: "apiKey" });

/**
 * マルチLLMサービスのレスポンス型
 */
export interface MultiLLMResponse {
  success: boolean;
  data?: any; // JSONまたは文字列
  error?: string;
}

/**
 * LLM_Aのレスポンス型（レストラン検索条件）
 */
export interface LLMAResponse {
  id: string;
  name: string;
  description: string;
  address: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
  cuisine: string[];
  priceMin: number | null;
  priceMax: number | null;
  priceCategory: string;
  openingHours: any | null;
  ratingAverage: number | null;
  ratingCount: number | null;
  images: string[];
}

/**
 * LLM_Bのレスポンス型（キーワード配列）
 */
export type LLMBResponse = string[];

/**
 * リトライ用のヘルパー関数
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 2000
): Promise<T> => {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // ThrottlingExceptionの場合のみリトライ
      if (lastError.message.includes("ThrottlingException") && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 2000;
        console.warn(`ThrottlingException detected. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // その他のエラーは即座に失敗
      throw lastError;
    }
  }
  
  throw lastError;
};

/**
 * マルチLLMサービスクラス
 * LLM_A、B、Cを管理
 */
export class MultiLLMService {
  /**
   * 統合AI - 全てのLLM（A、B、C）を順次実行して回答を合成
   * @param prompt ユーザーからのプロンプト
   * @returns 統合された回答
   */
  static async queryIntegratedAI(prompt: string): Promise<MultiLLMResponse> {
    try {
      if (!prompt?.trim()) {
        throw new Error("プロンプトが空です");
      }

      const trimmedPrompt = prompt.trim();
      const successfulResponses: Array<{type: string; data: any}> = [];

      // A、B、Cを順次実行（レート制限回避のため）
      console.log("統合AI: LLM_Aを呼び出し中...");
      try {
        const llmAResponse = await this.queryLLMA(trimmedPrompt);
        if (llmAResponse.success) {
          successfulResponses.push({
            type: 'LLM_A',
            data: llmAResponse.data!
          });
        }
      } catch (error) {
        console.warn("LLM_Aの呼び出しに失敗:", error);
      }

      // 待機してから次のAPIを呼び出し（レート制限対策）
      await new Promise(resolve => setTimeout(resolve, 10000));

      console.log("統合AI: LLM_Bを呼び出し中...");
      try {
        const llmBResponse = await this.queryLLMB(trimmedPrompt);
        if (llmBResponse.success) {
          successfulResponses.push({
            type: 'LLM_B',
            data: llmBResponse.data!
          });
        }
      } catch (error) {
        console.warn("LLM_Bの呼び出しに失敗:", error);
      }

      // 待機してから次のAPIを呼び出し（レート制限対策）
      await new Promise(resolve => setTimeout(resolve, 20000));

      console.log("統合AI: LLM_Cを呼び出し中...");
      try {
        const llmCResponse = await this.queryLLMC(trimmedPrompt);
        if (llmCResponse.success) {
          successfulResponses.push({
            type: 'LLM_C',
            data: llmCResponse.data!
          });
        }
      } catch (error) {
        console.warn("LLM_Cの呼び出しに失敗:", error);
      }

      if (successfulResponses.length === 0) {
        throw new Error("すべてのLLMで回答を取得できませんでした");
      }

      // 回答を合成
      let integratedResponse = "# LLM統合回答\n\n";
      integratedResponse += `**質問:** ${trimmedPrompt}\n\n`;

      successfulResponses.forEach((response, index) => {
        integratedResponse += `## ${response.type}からの回答\n\n`;
        
        // データ型に応じて適切に表示
        if (response.type === 'LLM_A' && typeof response.data === 'object') {
          // レストラン検索条件 (LLMAResponse)
          integratedResponse += `**抽出された検索条件:**\n\n`;
          integratedResponse += `\`\`\`json\n${JSON.stringify(response.data, null, 2)}\n\`\`\`\n\n`;
        } else if (response.type === 'LLM_B' && Array.isArray(response.data)) {
          // キーワード配列 (string[])
          integratedResponse += `**抽出されたキーワード:**\n\n`;
          integratedResponse += `- ${response.data.join('\n- ')}\n\n`;
        } else if (response.type === 'LLM_C' && typeof response.data === 'string') {
          // 推薦文 (string)
          integratedResponse += `**推薦文:**\n\n`;
          integratedResponse += `${response.data}\n\n`;
        } else {
          // フォールバック
          integratedResponse += `\`\`\`\n${JSON.stringify(response.data, null, 2)}\n\`\`\`\n\n`;
        }
        
        if (index < successfulResponses.length - 1) {
          integratedResponse += "---\n\n";
        }
      });

      return {
        success: true,
        data: integratedResponse,
      };
    } catch (error) {
      console.error("MultiLLMService.queryIntegratedAI error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "統合AIでエラーが発生しました",
      };
    }
  }

  /**
   * LLM_A
   * @param prompt プロンプト
   * @returns LLM_Aからの回答
   */
  static async queryLLMA(prompt: string): Promise<MultiLLMResponse> {
    try {
      console.log("LLM_A | 質問:", prompt?.slice(0, 50) + "...");
      
      if (!prompt?.trim()) {
        throw new Error("プロンプトが空です");
      }

      const response = await retryWithBackoff(() =>
        client.generations.llmA({
          prompt: prompt.trim(),
        })
      );

      if (response.errors) {
        console.error("LLM_A | 詳細エラー:", response.errors);
        response.errors.forEach((error, index) => {
          console.error(`LLM_A | エラー ${index + 1}:`, {
            message: error.message,
            errorType: error.errorType,
            errorInfo: error.errorInfo,
            locations: error.locations,
            path: error.path,
            extensions: error.extensions
          });
        });
        
        const errorMessage = response.errors[0]?.message || "";
        const errorType = response.errors[0]?.errorType || "";
        
        if (errorMessage.includes("ThrottlingException")) {
          throw new Error("現在リクエストが集中しています。しばらく待ってからもう一度お試しください。");
        }
        
        // mapping templateエラーの詳細分析
        if (errorMessage.includes("mapping template")) {
          console.error("LLM_A | Mapping Template エラー - 生データ確認:", {
            responseData: response.data,
            dataType: typeof response.data,
            isNull: response.data === null,
            isUndefined: response.data === undefined
          });
        }
        
        throw new Error(`LLM_A ${errorType}: ${errorMessage}`);
      }

      console.log("LLM_A | 生データ:", response.data);
      console.log("LLM_A | データ型:", typeof response.data);
      
      // customType レスポンスの検証とフォールバック
      let restaurantData = response.data as LLMAResponse;
      
      // nullまたはundefinedの場合のフォールバック
      if (!restaurantData) {
        console.warn("LLM_A | レスポンスがnull/undefined - デフォルト値を使用");
        restaurantData = {
          id: "",
          name: "",
          description: "",
          address: "",
          area: "",
          latitude: null,
          longitude: null,
          cuisine: [],
          priceMin: null,
          priceMax: null,
          priceCategory: "",
          openingHours: null,
          ratingAverage: null,
          ratingCount: null,
          images: []
        };
      }
      
      console.log("LLM_A | 構造化データ:", restaurantData);

      return {
        success: true,
        data: restaurantData,
      };
    } catch (error) {
      console.error("LLM_A | エラー:", error instanceof Error ? error.message : String(error));
      return {
        success: false,
        error: error instanceof Error ? error.message : "不明なエラーが発生しました",
      };
    }
  }

  /**
   * LLM_B
   * @param prompt プロンプト
   * @returns LLM_Bからの回答
   */
  static async queryLLMB(prompt: string): Promise<MultiLLMResponse> {
    try {
      console.log("LLM_B | 質問:", prompt?.slice(0, 50) + "...");
      
      if (!prompt?.trim()) {
        throw new Error("プロンプトが空です");
      }

      const response = await retryWithBackoff(() =>
        client.generations.llmB({
          prompt: prompt.trim(),
        })
      );

      if (response.errors) {
        console.error("LLM_B | エラー:", response.errors[0]?.message);
        const errorMessage = response.errors[0]?.message || "";
        if (errorMessage.includes("ThrottlingException")) {
          throw new Error("現在リクエストが集中しています。しばらく待ってからもう一度お試しください。");
        }
        throw new Error(errorMessage || "LLM_Bでエラーが発生しました");
      }

      console.log("LLM_B | 生データ:", response.data);
      console.log("LLM_B | データ型:", typeof response.data);
      
      // string[] レスポンスはそのまま使用
      const keywordArray = response.data as LLMBResponse;
      console.log("LLM_B | キーワード配列:", keywordArray);

      return {
        success: true,
        data: keywordArray,
      };
    } catch (error) {
      console.error("LLM_B | エラー:", error instanceof Error ? error.message : String(error));
      return {
        success: false,
        error: error instanceof Error ? error.message : "不明なエラーが発生しました",
      };
    }
  }

  /**
   * LLM_C
   * @param prompt プロンプト
   * @returns LLM_Cからの回答
   */
  static async queryLLMC(prompt: string): Promise<MultiLLMResponse> {
    try {
      console.log("LLM_C | 質問 (最初の100文字):", prompt?.slice(0, 100) + "...");
      console.log("LLM_C | 質問の長さ:", prompt?.length);
      
      if (!prompt?.trim()) {
        throw new Error("プロンプトが空です");
      }

      const response = await retryWithBackoff(() =>
        client.generations.llmC({
          prompt: prompt.trim(),
        })
      );

      if (response.errors) {
        console.error("LLM_C | 詳細エラー:", response.errors);
        response.errors.forEach((error, index) => {
          console.error(`LLM_C | エラー ${index + 1}:`, {
            message: error.message,
            errorType: error.errorType,
            errorInfo: error.errorInfo,
            locations: error.locations,
            path: error.path
          });
        });
        
        const errorMessage = response.errors[0]?.message || "";
        if (errorMessage.includes("ThrottlingException")) {
          throw new Error("現在リクエストが集中しています。しばらく待ってからもう一度お試しください。");
        }
        throw new Error(errorMessage || "LLM_Cでエラーが発生しました");
      }

      console.log("LLM_C | 生データ:", response.data);
      console.log("LLM_C | データ型:", typeof response.data);
      console.log("LLM_C | 回答の長さ:", response.data?.length);
      
      // エコーレスポンスの検出
      const responseStr = String(response.data || "");
      if (responseStr.includes('"prompt"') || responseStr === prompt.trim()) {
        console.warn("LLM_C | エコーレスポンスを検出:", responseStr);
      }
      
      return {
        success: true,
        data: response.data || "",
      };
    } catch (error) {
      console.error("LLM_C | エラー:", error instanceof Error ? error.message : String(error));
      return {
        success: false,
        error: error instanceof Error ? error.message : "不明なエラーが発生しました",
      };
    }
  }
}

/**
 * 会話メッセージの型定義（マルチLLM対応）
 */
export interface MultiLLMMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  error?: boolean;
  source?: "integrated" | "llmA" | "llmB" | "llmC"; // どのLLMからの応答か
}

/**
 * LLM_Aのレスポンスを使ってレストランを検索する関数
 */
export async function searchRestaurantsWithLLMAResponse(llmAResponse: LLMAResponse): Promise<any[]> {
  try {
    console.log("レストラン検索開始:", llmAResponse);

    // GraphQLクエリを構築するためのフィルター条件
    const filters: any = {};

    // エリアでフィルタリング
    if (llmAResponse.area && llmAResponse.area.trim()) {
      filters.area = { contains: llmAResponse.area.trim() };
    }

    // 料理タイプでフィルタリング
    if (llmAResponse.cuisine && llmAResponse.cuisine.length > 0) {
      // 複数の料理タイプのうち、いずれかが含まれるレストランを検索
      filters.or = llmAResponse.cuisine.map(cuisineType => ({
        cuisine: { contains: cuisineType }
      }));
    }

    // 価格範囲でフィルタリング
    if (llmAResponse.priceMin !== null || llmAResponse.priceMax !== null) {
      if (llmAResponse.priceMin !== null) {
        filters.priceMin = { ge: llmAResponse.priceMin };
      }
      if (llmAResponse.priceMax !== null) {
        filters.priceMax = { le: llmAResponse.priceMax };
      }
    }

    // 価格カテゴリでフィルタリング
    if (llmAResponse.priceCategory && llmAResponse.priceCategory.trim()) {
      filters.priceCategory = { eq: llmAResponse.priceCategory.trim() };
    }

    // 評価でフィルタリング
    if (llmAResponse.ratingAverage !== null) {
      filters.ratingAverage = { ge: llmAResponse.ratingAverage };
    }

    // レストラン名での部分一致検索
    if (llmAResponse.name && llmAResponse.name.trim()) {
      filters.name = { contains: llmAResponse.name.trim() };
    }

    console.log("検索フィルター:", filters);

    // GraphQLクエリを実行
    const response = await client.models.Restaurant.list({
      filter: Object.keys(filters).length > 0 ? filters : undefined,
      limit: 50, // 結果数を制限
    });

    if (response.errors) {
      console.error("レストラン検索エラー:", response.errors);
      throw new Error("レストラン検索中にエラーが発生しました");
    }

    const restaurants = response.data || [];
    console.log(`${restaurants.length}件のレストランが見つかりました`);

    // 位置情報による距離フィルタリング（オプション）
    let filteredRestaurants = restaurants;
    if (llmAResponse.latitude !== null && llmAResponse.longitude !== null) {
      // 緯度経度が指定されている場合、距離による絞り込みを行う
      const targetLat = llmAResponse.latitude;
      const targetLng = llmAResponse.longitude;
      const maxDistance = 5; // 5km以内

      filteredRestaurants = restaurants.filter(restaurant => {
        if (restaurant.latitude === null || restaurant.longitude === null) {
          return true; // 位置情報がないレストランは除外しない
        }

        // ハーバーサイン公式で距離を計算
        const distance = calculateDistance(
          targetLat, 
          targetLng, 
          restaurant.latitude, 
          restaurant.longitude
        );

        return distance <= maxDistance;
      });

      console.log(`距離フィルター後: ${filteredRestaurants.length}件`);
    }

    return filteredRestaurants;

  } catch (error) {
    console.error("searchRestaurantsWithLLMAResponse error:", error);
    throw error;
  }
}

/**
 * ハーバーサイン公式で2点間の距離を計算（km）
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 地球の半径（km）
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 度をラジアンに変換
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * LLM_Bのキーワードを使ってレストランを検索する関数
 */
export async function searchRestaurantsWithKeywords(keywords: LLMBResponse): Promise<any[]> {
  try {
    console.log("キーワード検索開始:", keywords);

    if (!keywords || keywords.length === 0) {
      console.log("キーワードが空のため、全レストランを返します");
      const response = await client.models.Restaurant.list({ limit: 50 });
      return response.data || [];
    }

    // キーワードに基づいてKeywordRestaurant経由でレストランを検索
    const restaurantIds = new Set<string>();

    // 各キーワードに対してKeywordテーブルを検索
    for (const keyword of keywords) {
      try {
        // キーワードを検索
        const keywordResponse = await client.models.Keyword.list({
          filter: {
            keyword: { contains: keyword.trim() }
          }
        });

        if (keywordResponse.data) {
          for (const keywordRecord of keywordResponse.data) {
            // そのキーワードに関連するレストランを取得
            const keywordRestaurantResponse = await client.models.KeywordRestaurant.list({
              filter: {
                keywordId: { eq: keywordRecord.id }
              }
            });

            if (keywordRestaurantResponse.data) {
              keywordRestaurantResponse.data.forEach(kr => {
                if (kr.restaurantId) {
                  restaurantIds.add(kr.restaurantId);
                }
              });
            }
          }
        }
      } catch (error) {
        console.warn(`キーワード "${keyword}" の検索でエラー:`, error);
      }
    }

    console.log(`キーワード検索で ${restaurantIds.size} 件のレストランIDが見つかりました`);

    // 見つかったレストランIDからレストラン情報を取得
    const restaurants: any[] = [];
    
    if (restaurantIds.size > 0) {
      // IDの配列に変換
      const idArray = Array.from(restaurantIds);
      
      // バッチでレストラン情報を取得（IDごとに個別取得）
      for (const restaurantId of idArray) {
        try {
          const restaurantResponse = await client.models.Restaurant.get({ id: restaurantId });
          if (restaurantResponse.data) {
            restaurants.push(restaurantResponse.data);
          }
        } catch (error) {
          console.warn(`レストランID ${restaurantId} の取得でエラー:`, error);
        }
      }
    }

    console.log(`最終的に ${restaurants.length} 件のレストランを取得しました`);
    return restaurants;

  } catch (error) {
    console.error("searchRestaurantsWithKeywords error:", error);
    throw error;
  }
}

/**
 * LLM_AとLLM_Bの結果を組み合わせてレストランを検索し、結果をLLM_Cに渡す統合関数
 */
export async function searchRestaurantsIntegrated(
  llmAResponse: LLMAResponse, 
  llmBResponse: LLMBResponse,
  originalPrompt: string
): Promise<{ restaurants: any[], llmCResponse?: string }> {
  try {
    console.log("=== 統合レストラン検索開始 ===");
    console.log("LLM_Aレスポンス:", llmAResponse);
    console.log("LLM_Bキーワード:", llmBResponse);

    // 1. LLM_Bのキーワードからレストランを検索
    const keywordRestaurants = await searchRestaurantsWithKeywords(llmBResponse);
    console.log("キーワード検索結果:", keywordRestaurants.length, "件");

    // 2. キーワード検索結果からLLM_Aの条件に合うものを絞り込み
    let filteredRestaurants: any[] = [];

    if (keywordRestaurants.length > 0) {
      // LLM_Aの条件でフィルタリング
      filteredRestaurants = keywordRestaurants.filter(restaurant => {
        let matches = true;

        // エリアでの絞り込み
        if (llmAResponse.area && llmAResponse.area.trim()) {
          const areaMatch = restaurant.area?.toLowerCase().includes(llmAResponse.area.toLowerCase());
          if (!areaMatch) matches = false;
        }

        // 料理タイプでの絞り込み
        if (llmAResponse.cuisine && llmAResponse.cuisine.length > 0) {
          const cuisineMatch = llmAResponse.cuisine.some(cuisineType => 
            restaurant.cuisine?.some((restCuisine: string) => 
              restCuisine.toLowerCase().includes(cuisineType.toLowerCase())
            )
          );
          if (!cuisineMatch) matches = false;
        }

        // 価格範囲での絞り込み
        if (llmAResponse.priceMin !== null && restaurant.priceMin !== null) {
          if (restaurant.priceMax < llmAResponse.priceMin) matches = false;
        }
        if (llmAResponse.priceMax !== null && restaurant.priceMax !== null) {
          if (restaurant.priceMin > llmAResponse.priceMax) matches = false;
        }

        // 価格カテゴリでの絞り込み
        if (llmAResponse.priceCategory && llmAResponse.priceCategory.trim()) {
          if (restaurant.priceCategory !== llmAResponse.priceCategory) matches = false;
        }

        // 評価での絞り込み
        if (llmAResponse.ratingAverage !== null && restaurant.ratingAverage !== null) {
          if (restaurant.ratingAverage < llmAResponse.ratingAverage) matches = false;
        }

        // レストラン名での絞り込み
        if (llmAResponse.name && llmAResponse.name.trim()) {
          const nameMatch = restaurant.name?.toLowerCase().includes(llmAResponse.name.toLowerCase());
          if (!nameMatch) matches = false;
        }

        return matches;
      });

      // 位置情報による距離フィルタリング
      if (llmAResponse.latitude !== null && llmAResponse.longitude !== null) {
        const targetLat = llmAResponse.latitude;
        const targetLng = llmAResponse.longitude;
        const maxDistance = 5; // 5km以内

        filteredRestaurants = filteredRestaurants.filter(restaurant => {
          if (restaurant.latitude === null || restaurant.longitude === null) {
            return true; // 位置情報がないレストランは除外しない
          }

          const distance = calculateDistance(
            targetLat, 
            targetLng, 
            restaurant.latitude, 
            restaurant.longitude
          );

          return distance <= maxDistance;
        });
      }
    } else {
      // キーワード検索で結果がない場合は、LLM_Aの条件のみで検索
      console.log("キーワード検索で結果がないため、LLM_Aの条件のみで検索します");
      filteredRestaurants = await searchRestaurantsWithLLMAResponse(llmAResponse);
    }

    console.log("=== 検索結果 ===");
    console.log(`絞り込み後: ${filteredRestaurants.length}件のレストランが見つかりました`);
    
    // 結果をコンソールに表示
    filteredRestaurants.forEach((restaurant, index) => {
      console.log(`--- レストラン ${index + 1} ---`);
      console.log(`名前: ${restaurant.name}`);
      console.log(`エリア: ${restaurant.area}`);
      console.log(`料理: ${restaurant.cuisine?.join(', ') || '未設定'}`);
      console.log(`価格帯: ${restaurant.priceCategory || '未設定'} (${restaurant.priceMin}-${restaurant.priceMax}円)`);
      console.log(`評価: ${restaurant.ratingAverage || '未設定'} (${restaurant.ratingCount || 0}件)`);
      console.log(`住所: ${restaurant.address}`);
      console.log(`説明: ${restaurant.description || '未設定'}`);
    });

    // 3. 結果をLLM_Cに渡して推薦文を生成
    let llmCResponse: string | undefined;
    
    if (filteredRestaurants.length > 0) {
      console.log("=== LLM_Cで推薦文を生成中 ===");
      
      // レストラン情報を整理してLLM_Cに渡す
      const restaurantSummary = filteredRestaurants.map((restaurant, index) => 
        `${index + 1}. ${restaurant.name} (${restaurant.area}) - ${restaurant.cuisine?.join(', ') || '料理タイプ未設定'} - ${restaurant.priceCategory || '価格未設定'} - 評価${restaurant.ratingAverage || 'なし'}`
      ).join('\n');

      const llmCPrompt = `あなたは飲食店検索システムの一部として、検索結果に基づいて推薦文を生成するAIです。
以下のレストラン情報と元のユーザークエリに基づいて、魅力的な推薦文を作成してください。

ユーザークエリ: "${originalPrompt}"

レストラン情報: ${JSON.stringify(filteredRestaurants, null, 2)}

以下の要件で推薦文を作成してください：
1. 自然な日本語で200文字程度
2. ユーザーの要望に合った理由を説明
3. レストランの特徴や魅力を簡潔に伝える
4. 親しみやすく、説得力のある文章にする
5. 「以下のレストランがおすすめです」のような結びで終わる

推薦文のみを返してください（JSONや他の形式は不要）：`;

      try {
        const llmCResult = await MultiLLMService.queryLLMC(llmCPrompt);
        if (llmCResult.success) {
          llmCResponse = llmCResult.data as string;
          console.log("=== LLM_C推薦文 ===");
          console.log(llmCResponse);
        }
      } catch (error) {
        console.warn("LLM_Cの呼び出しに失敗:", error);
      }
    } else {
      console.log("検索結果が0件のため、LLM_Cは呼び出しません");
    }

    return {
      restaurants: filteredRestaurants,
      llmCResponse
    };

  } catch (error) {
    console.error("searchRestaurantsIntegrated error:", error);
    throw error;
  }
}

/**
 * マルチLLM会話管理クラス
 */
export class MultiLLMConversationManager {
  private messages: MultiLLMMessage[] = [];
  private conversationId?: string;

  /**
   * メッセージを追加
   */
  addMessage(
    role: MultiLLMMessage["role"], 
    content: string, 
    source?: MultiLLMMessage["source"],
    error?: boolean
  ): MultiLLMMessage {
    const message: MultiLLMMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
      source,
      error,
    };
    this.messages.push(message);
    return message;
  }

  /**
   * 全メッセージを取得
   */
  getMessages(): MultiLLMMessage[] {
    return [...this.messages];
  }

  /**
   * 会話履歴をクリア
   */
  clear(): void {
    this.messages = [];
    this.conversationId = undefined;
  }

  /**
   * 会話IDを設定
   */
  setConversationId(id: string): void {
    this.conversationId = id;
  }

  /**
   * 会話IDを取得
   */
  getConversationId(): string | undefined {
    return this.conversationId;
  }

}
import { invokeLLM } from './bedrock';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import type { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';

// Amplify設定
Amplify.configure(outputs);
const client = generateClient<Schema>();

// LLM_A: クエリ分類の結果型
export interface QueryClassificationResult {
  structuredData: {
    location?: string;
    cuisine?: string[];
    priceRange?: {
      category?: string;
    };
    openingHours?: {
      day?: string;
      time?: string;
    };
    features?: string[];
  };
  keywords: string[];
}

// LLM_A: クエリ分類
export async function classifyQuery(userQuery: string): Promise<QueryClassificationResult> {
  const prompt = `あなたは飲食店検索システムの一部として、ユーザーの質問を分析するAIです。
以下のユーザークエリから、構造化データ（場所、料理タイプ、価格帯、営業時間など）と
キーワード（雰囲気、特徴など）に分類してください。

ユーザークエリ: "${userQuery}"

以下のJSON形式で出力してください（JSONのみを返してください）:
{
  "structuredData": {
    "location": "場所（例：渋谷、新宿など）",
    "cuisine": ["料理タイプの配列（例：和食、イタリアン、居酒屋など）"],
    "priceRange": {
      "category": "価格カテゴリ（¥、¥¥、¥¥¥、¥¥¥¥のいずれか）"
    },
    "openingHours": {
      "day": "曜日（例：月曜日、土日など）",
      "time": "時間（例：深夜、ランチタイムなど）"
    },
    "features": ["特徴の配列（例：個室あり、禁煙、ペット可など）"]
  },
  "keywords": ["雰囲気や特徴を表すキーワードの配列（例：雰囲気が良い、デート向け、カジュアルなど）"]
}

注意：
- 該当しない項目は空文字列や空配列にしてください
- 価格について言及がない場合は、料理タイプから推測してください
- 曖昧な表現（例：「良い雰囲気」「おしゃれ」）はkeywordsに含めてください`;

  try {
    const response = await invokeLLM(prompt);
    const result = JSON.parse(response);
    return result;
  } catch (error) {
    console.error('Query classification error:', error);
    // フォールバック: 基本的な分類を返す
    return {
      structuredData: {
        location: extractLocation(userQuery),
        cuisine: extractCuisine(userQuery),
        priceRange: {},
        openingHours: {},
        features: []
      },
      keywords: [userQuery]
    };
  }
}

// 簡単な場所抽出（フォールバック用）
function extractLocation(query: string): string {
  const locations = ['渋谷', '新宿', '原宿', '六本木', '銀座', '表参道', '恵比寿', '代官山', '中目黒'];
  for (const location of locations) {
    if (query.includes(location)) {
      return location;
    }
  }
  return '';
}

// 簡単な料理タイプ抽出（フォールバック用）
function extractCuisine(query: string): string[] {
  const cuisines = ['和食', '洋食', '中華', 'イタリアン', 'フレンチ', '居酒屋', 'ラーメン', '寿司', '焼肉'];
  const found: string[] = [];
  for (const cuisine of cuisines) {
    if (query.includes(cuisine)) {
      found.push(cuisine);
    }
  }
  return found;
}

// LLM_B: 構造化データ抽出の結果型
export interface DatabaseQueryParams {
  area?: string;
  cuisine?: string[];
  priceCategory?: string;
  day?: string;
  openTime?: string;
  closeTime?: string;
  features?: string[];
}

// LLM_B: 構造化データ抽出
export async function extractStructuredData(classificationResult: QueryClassificationResult): Promise<DatabaseQueryParams> {
  const prompt = `あなたは飲食店検索システムの一部として、構造化データをデータベースクエリに変換するAIです。
以下の構造化データから、データベース検索に使用できるパラメータを抽出してください。

構造化データ: ${JSON.stringify(classificationResult.structuredData, null, 2)}

以下のJSON形式で出力してください（JSONのみを返してください）:
{
  "area": "検索エリア（例：渋谷、新宿など）",
  "cuisine": ["料理タイプの配列"],
  "priceCategory": "価格カテゴリ（¥、¥¥、¥¥¥、¥¥¥¥のいずれか）",
  "day": "曜日（例：月曜日、土日など）",
  "openTime": "開店時間（HH:MM形式）",
  "closeTime": "閉店時間（HH:MM形式）",
  "features": ["特徴の配列"]
}

注意：
- 該当しない項目は空文字列や空配列にしてください
- 時間の表現は24時間形式に変換してください
- 「深夜」は「22:00」以降、「ランチタイム」は「11:00-14:00」として解釈してください`;

  try {
    const response = await invokeLLM(prompt);
    const result = JSON.parse(response);
    return result;
  } catch (error) {
    console.error('Structured data extraction error:', error);
    // フォールバック: 基本的な変換を返す
    return {
      area: classificationResult.structuredData.location,
      cuisine: classificationResult.structuredData.cuisine,
      priceCategory: classificationResult.structuredData.priceRange?.category,
      features: classificationResult.structuredData.features || []
    };
  }
}

// LLM_C: キーワード抽出の結果型
export interface SearchableKeywords {
  searchableKeywords: string[];
}

// LLM_C: キーワード抽出
export async function extractKeywords(keywords: string[]): Promise<SearchableKeywords> {
  const prompt = `あなたは飲食店検索システムの一部として、あいまいなキーワードを検索可能な形式に変換するAIです。
以下のキーワードから、データベース検索に使用できるキーワードを抽出してください。

キーワード: ${JSON.stringify(keywords)}

以下のJSON形式で出力してください（JSONのみを返してください）:
{
  "searchableKeywords": ["検索可能なキーワードの配列"]
}

変換例：
- "雰囲気が良い" → ["おしゃれ", "落ち着いた", "雰囲気"]
- "デートにぴったり" → ["デート", "ロマンチック", "二人向け"]
- "カジュアル" → ["カジュアル", "気軽", "普段使い"]
- "高級感がある" → ["高級", "上質", "フォーマル"]
- "美味しい" → ["美味", "絶品", "評判"]

注意：
- 具体的で検索しやすいキーワードに変換してください
- 同義語や関連語も含めてください
- 日本語の料理や店舗の特徴を考慮してください`;

  try {
    const response = await invokeLLM(prompt);
    const result = JSON.parse(response);
    return result;
  } catch (error) {
    console.error('Keyword extraction error:', error);
    // フォールバック: 基本的な変換を返す
    return {
      searchableKeywords: keywords.length > 0 ? keywords : ['レストラン', '食事']
    };
  }
}

// LLM_D: 推薦文生成
export async function generateRecommendation(
  userQuery: string,
  restaurants: any[]
): Promise<string> {
  const prompt = `あなたは飲食店検索システムの一部として、検索結果に基づいて推薦文を生成するAIです。
以下のレストラン情報と元のユーザークエリに基づいて、魅力的な推薦文を作成してください。

ユーザークエリ: "${userQuery}"

レストラン情報: ${JSON.stringify(restaurants, null, 2)}

以下の要件で推薦文を作成してください：
1. 自然な日本語で200文字程度
2. ユーザーの要望に合った理由を説明
3. レストランの特徴や魅力を簡潔に伝える
4. 親しみやすく、説得力のある文章にする
5. 「以下のレストランがおすすめです」のような結びで終わる

推薦文のみを返してください（JSONや他の形式は不要）：`;

  try {
    const response = await invokeLLM(prompt);
    return response.trim();
  } catch (error) {
    console.error('Recommendation generation error:', error);
    // フォールバック: 基本的な推薦文を返す
    return `「${userQuery}」に関するお求めの条件に合うレストランを見つけました。各店舗の特徴や雰囲気を参考に、お気に入りのお店を見つけてください。以下のレストランがおすすめです。`;
  }
}

// データベース検索の関数
async function searchRestaurants(
  structuredParams: DatabaseQueryParams,
  keywordParams: SearchableKeywords
): Promise<any[]> {
  try {
    // Amplify DataStoreから全レストランを取得
    const response = await client.models.Restaurant.list();
    let restaurants = response.data;
    
    // フィルタリング
    if (structuredParams.area) {
      restaurants = restaurants.filter(r => 
        r.area.toLowerCase().includes(structuredParams.area!.toLowerCase())
      );
    }
    
    if (structuredParams.cuisine && structuredParams.cuisine.length > 0) {
      restaurants = restaurants.filter(r => {
        // r.cuisine が null/undefined でないこと、かつ配列であることを確認
        if (!r.cuisine || !Array.isArray(r.cuisine)) {
          return false;
        }
        // 検索条件の料理タイプ（structuredParams.cuisine）のいずれかが、
        // レストランの料理タイプ（r.cuisine）のいずれかに含まれているかを確認
        return structuredParams.cuisine!.some(searchCuisine =>
          r.cuisine!.some(restaurantCuisine =>
            restaurantCuisine!.toLowerCase().includes(searchCuisine.toLowerCase())
          )
        );
      });
    }
    
    if (structuredParams.priceCategory) {
      restaurants = restaurants.filter(r => 
        r.priceCategory === structuredParams.priceCategory
      );
    }
    
    // キーワード検索
    if (keywordParams.searchableKeywords.length > 0) {
      restaurants = restaurants.filter(r => {
        const searchText = `${r.name} ${r.description} ${r.cuisine} ${r.features} ${r.ambience} ${r.keywords}`.toLowerCase();
        return keywordParams.searchableKeywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    }
    
    // 結果を整形して返す
    return restaurants.slice(0, 10).map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description || '',
      address: restaurant.address,
      area: restaurant.area,
      cuisine: restaurant.cuisine,
      features: restaurant.features || [],
      ambience: restaurant.ambience,
      rating: restaurant.ratingAverage || 0,
      priceCategory: restaurant.priceCategory || '¥¥',
      openingHours: restaurant.openingHours || '',
      
      images: restaurant.images || [],
      keywords: restaurant.keywords || ''
    }));
  } catch (error) {
    console.error('Database search error:', error);
    return [];
  }
}

// メインのLLMオーケストレーター
export async function orchestrateLLMSearch(userQuery: string): Promise<{
  message: string;
  restaurants: any[];
}> {
  try {
    // Step 1: LLM_A - クエリ分類
    console.log('Step 1: Classifying query...');
    const classificationResult = await classifyQuery(userQuery);
    console.log('Classification result:', classificationResult);

    // Step 2: LLM_B - 構造化データ抽出
    console.log('Step 2: Extracting structured data...');
    const structuredParams = await extractStructuredData(classificationResult);
    console.log('Structured params:', structuredParams);

    // Step 3: LLM_C - キーワード抽出
    console.log('Step 3: Extracting keywords...');
    const keywordParams = await extractKeywords(classificationResult.keywords);
    console.log('Keyword params:', keywordParams);

    // Step 4: データベース検索
    console.log('Step 4: Searching restaurants...');
    const restaurants = await searchRestaurants(structuredParams, keywordParams);
    console.log('Found restaurants:', restaurants.length);

    // Step 5: LLM_D - 推薦文生成
    console.log('Step 5: Generating recommendation...');
    const recommendation = await generateRecommendation(userQuery, restaurants);
    console.log('Recommendation generated');

    return {
      message: recommendation,
      restaurants: restaurants
    };

  } catch (error) {
    console.error('LLM orchestration error:', error);
    
    // フォールバック: エラー時の基本的な応答
    return {
      message: 'お探しの条件に合うレストランを検索中にエラーが発生しました。申し訳ございませんが、もう一度お試しください。',
      restaurants: []
    };
  }
}
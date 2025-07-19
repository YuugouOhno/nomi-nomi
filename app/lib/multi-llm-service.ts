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
  data?: string;
  error?: string;
}

/**
 * リトライ用のヘルパー関数
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // ThrottlingExceptionの場合のみリトライ
      if (lastError.message.includes("ThrottlingException") && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
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
 * LLM_A（masterOrchestrator）と専門LLM（B,C,D）を管理
 */
export class MultiLLMService {
  /**
   * LLM_A: マスターオーケストレーター
   * 複数の専門AIを適切に使い分けるメインAI
   * @param message ユーザーからのメッセージ
   * @param conversationId 会話ID（オプション）
   * @returns AIからの統合された回答
   */
  static async queryMasterOrchestrator(
    message: string, 
    conversationId?: string
  ): Promise<MultiLLMResponse> {
    try {
      // APIキー認証を使用（認証チェック不要）

      if (!message?.trim()) {
        throw new Error("メッセージが空です");
      }

      // Amplify AI conversation APIの正しい呼び出し方法（リトライ付き）
      const response = await retryWithBackoff(() => 
        client.mutations.masterOrchestrator({
          conversationId: conversationId || undefined,
          content: [{ text: message.trim() }],
        })
      );

      if (response.errors && response.errors.length > 0) {
        console.error("MasterOrchestrator errors:", response.errors);
        const errorMessage = response.errors[0]?.message || "";
        if (errorMessage.includes("ThrottlingException")) {
          throw new Error("現在リクエストが集中しています。しばらく待ってからもう一度お試しください。");
        }
        throw new Error(errorMessage || "マスターオーケストレーターでエラーが発生しました");
      }

      // レスポンスデータの取得
      const messageData = response.data;
      if (!messageData) {
        throw new Error("応答データが空です");
      }

      // contentブロックからテキストを抽出
      const textContent = messageData.content?.find(c => c.text)?.text;
      if (!textContent) {
        throw new Error("テキスト応答が見つかりません");
      }

      return {
        success: true,
        data: textContent,
      };
    } catch (error) {
      console.error("MultiLLMService.queryMasterOrchestrator error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "不明なエラーが発生しました",
      };
    }
  }

  /**
   * LLM_B: レストラン専門AI
   * @param query 検索クエリ
   * @param location 場所（オプション）
   * @param budget 予算（オプション）
   * @param occasion シーン（オプション）
   * @returns レストラン情報
   */
  static async queryRestaurantSpecialist(
    query: string,
    location?: string,
    budget?: string,
    occasion?: string
  ): Promise<MultiLLMResponse> {
    try {
      if (!query?.trim()) {
        throw new Error("検索クエリが空です");
      }

      const response = await retryWithBackoff(() =>
        client.generations.restaurantSpecialist({
          query: query.trim(),
          location,
          budget,
          occasion,
        })
      );

      if (response.errors) {
        console.error("RestaurantSpecialist errors:", response.errors);
        const errorMessage = response.errors[0]?.message || "";
        if (errorMessage.includes("ThrottlingException")) {
          throw new Error("現在リクエストが集中しています。しばらく待ってからもう一度お試しください。");
        }
        throw new Error(errorMessage || "レストラン専門AIでエラーが発生しました");
      }

      return {
        success: true,
        data: response.data || "",
      };
    } catch (error) {
      console.error("MultiLLMService.queryRestaurantSpecialist error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "不明なエラーが発生しました",
      };
    }
  }

  /**
   * LLM_C: 旅行計画専門AI
   * @param destination 目的地
   * @param duration 期間（オプション）
   * @param budget 予算（オプション）
   * @param interests 興味・関心（オプション）
   * @returns 旅行プラン
   */
  static async queryTripPlanner(
    destination: string,
    duration?: string,
    budget?: string,
    interests?: string
  ): Promise<MultiLLMResponse> {
    try {
      if (!destination?.trim()) {
        throw new Error("目的地が空です");
      }

      const response = await retryWithBackoff(() =>
        client.generations.tripPlanner({
          destination: destination.trim(),
          duration,
          budget,
          interests,
        })
      );

      if (response.errors) {
        console.error("TripPlanner errors:", response.errors);
        const errorMessage = response.errors[0]?.message || "";
        if (errorMessage.includes("ThrottlingException")) {
          throw new Error("現在リクエストが集中しています。しばらく待ってからもう一度お試しください。");
        }
        throw new Error(errorMessage || "旅行計画専門AIでエラーが発生しました");
      }

      return {
        success: true,
        data: response.data || "",
      };
    } catch (error) {
      console.error("MultiLLMService.queryTripPlanner error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "不明なエラーが発生しました",
      };
    }
  }

  /**
   * LLM_D: フードクリティック専門AI
   * @param foodItem 料理・食品
   * @param restaurant レストラン名（オプション）
   * @param context 評価の文脈（オプション）
   * @returns グルメ評価・レビュー
   */
  static async queryFoodCritic(
    foodItem: string,
    restaurant?: string,
    context?: string
  ): Promise<MultiLLMResponse> {
    try {
      if (!foodItem?.trim()) {
        throw new Error("料理名が空です");
      }

      const response = await retryWithBackoff(() =>
        client.generations.foodCritic({
          foodItem: foodItem.trim(),
          restaurant,
          context,
        })
      );

      if (response.errors) {
        console.error("FoodCritic errors:", response.errors);
        const errorMessage = response.errors[0]?.message || "";
        if (errorMessage.includes("ThrottlingException")) {
          throw new Error("現在リクエストが集中しています。しばらく待ってからもう一度お試しください。");
        }
        throw new Error(errorMessage || "フードクリティック専門AIでエラーが発生しました");
      }

      return {
        success: true,
        data: response.data || "",
      };
    } catch (error) {
      console.error("MultiLLMService.queryFoodCritic error:", error);
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
  source?: "master" | "restaurant" | "trip" | "food"; // どのLLMからの応答か
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

  /**
   * マスターオーケストレーターとの会話
   */
  async sendMessageToMaster(message: string): Promise<MultiLLMMessage> {
    // ユーザーメッセージを追加
    this.addMessage("user", message);

    // マスターオーケストレーターに送信
    const response = await MultiLLMService.queryMasterOrchestrator(
      message, 
      this.conversationId
    );

    // 応答メッセージを追加
    const assistantMessage = this.addMessage(
      "assistant",
      response.success ? response.data! : response.error!,
      "master",
      !response.success
    );

    return assistantMessage;
  }
}
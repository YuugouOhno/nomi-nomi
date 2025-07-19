import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { 
  masterOrchestratorPrompt,
  restaurantSpecialistPrompt,
  tripPlannerPrompt,
  foodCriticPrompt
} from "../prompts/multi-llm";


const schema = a.schema({
  Restaurant: a
    .model({
      id: a.string().required(), // Google Place ID
      name: a.string().required(),
      description: a.string(),
      address: a.string().required(),
      area: a.string().required(),
      latitude: a.float(),
      longitude: a.float(),
      cuisine: a.string().array(),
      priceMin: a.integer(),
      priceMax: a.integer(),
      priceCategory: a.string(),
      openingHours: a.json(),
      ratingAverage: a.float(),
      ratingCount: a.integer(),
      images: a.string().array(),
      keywords: a.hasMany("KeywordRestaurant", "restaurantId"),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["create", "read", "update", "delete"]),
      allow.group("admin").to(["create", "read", "update", "delete"]),
    ]),

  User: a
    .model({
      email: a.string().required(),
      name: a.string(),
      role: a.string().required(),
    })
    .authorization((allow) => [
      allow.owner().to(["read", "update"]),
      allow.group("admin").to(["create", "read", "update", "delete"]),
    ]),
  
  Keyword: a
    .model({
      id: a.id().required(),
      keyword: a.string().required(),
      restaurants: a.hasMany("KeywordRestaurant", "keywordId"),
    })
    .authorization((allow) => [
      allow.owner().to(["read", "update"]),
      allow.group("admin").to(["create", "read", "update", "delete"]),
    ]),
  
  KeywordRestaurant: a
    .model({
      keywordId: a.id().required(),
      restaurantId: a.id().required(),

      // 双方向リレーション
      keyword: a.belongsTo("Keyword", "keywordId"),
      restaurant: a.belongsTo("Restaurant", "restaurantId"),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["create", "read", "delete"]),
      allow.group("admin").to(["create", "read", "update", "delete"]),
    ]),

  SearchQuery: a
    .model({
      rawQuery: a.string().required(),
      structuredData: a.json(),
      keywords: a.string().array(),
      userId: a.string(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["create"]),
      allow.owner().to(["read"]),
      allow.group("admin").to(["read", "delete"]),
    ]),

  /**
   * LLM_B: レストラン専門AI
   * レストラン情報、検索、推薦に特化
   */
  restaurantSpecialist: a
    .generation({
      aiModel: a.ai.model("Claude 3.5 Sonnet"),
      systemPrompt: restaurantSpecialistPrompt,
      inferenceConfiguration: {
        temperature: 0.7,
        maxTokens: 1000,
      },
    })
    .arguments({ 
      query: a.string().required(),
      location: a.string(),
      budget: a.string(),
      occasion: a.string(),
    })
    .returns(a.string())
    .authorization((allow) => [allow.authenticated(), allow.publicApiKey()]),

  /**
   * LLM_C: 旅行計画専門AI
   * 旅行プラン、観光地情報、ルート提案に特化
   */
  tripPlanner: a
    .generation({
      aiModel: a.ai.model("Claude 3.5 Sonnet"),
      systemPrompt: tripPlannerPrompt,
      inferenceConfiguration: {
        temperature: 0.8,
        maxTokens: 1200,
      },
    })
    .arguments({ 
      destination: a.string().required(),
      duration: a.string(),
      budget: a.string(),
      interests: a.string(),
    })
    .returns(a.string())
    .authorization((allow) => [allow.authenticated(), allow.publicApiKey()]),

  /**
   * LLM_D: フードクリティック専門AI
   * 料理レビュー、味覚分析、グルメ評価に特化
   */
  foodCritic: a
    .generation({
      aiModel: a.ai.model("Claude 3.5 Sonnet"),
      systemPrompt: foodCriticPrompt,
      inferenceConfiguration: {
        temperature: 0.6,
        maxTokens: 800,
      },
    })
    .arguments({ 
      foodItem: a.string().required(),
      restaurant: a.string(),
      context: a.string(),
    })
    .returns(a.string())
    .authorization((allow) => [allow.authenticated(), allow.publicApiKey()]),

  /**
   * LLM_A: マスターオーケストレーター
   * 複数の専門AIを適切に使い分けるメインAI
   */
  masterOrchestrator: a
    .conversation({
      aiModel: a.ai.model("Claude 3.5 Sonnet"),
      systemPrompt: masterOrchestratorPrompt,
      inferenceConfiguration: {
        temperature: 0.5,
        maxTokens: 1500,
      },
      tools: [
        a.ai.dataTool({
          name: "restaurant_specialist",
          description: "レストラン情報、グルメ検索、店舗詳細を提供する専門AI",
          query: a.ref("restaurantSpecialist"),
        }),
        a.ai.dataTool({
          name: "trip_planner",
          description: "旅行計画、観光地情報、ルート提案を行う専門AI",
          query: a.ref("tripPlanner"),
        }),
        a.ai.dataTool({
          name: "food_critic",
          description: "料理レビュー、味の分析、グルメ評価を行う専門AI",
          query: a.ref("foodCritic"),
        }),
      ],
    })
    .authorization((allow) => allow.owner()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
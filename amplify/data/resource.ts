import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Izakaya: a
    .model({
      name: a.string().required(),
      address: a.string().required(),
      phone: a.string(),
      priceRange: a.enum(['LOW', 'MEDIUM', 'HIGH']),
      hasPrivateRoom: a.boolean().default(false),
      rating: a.float().default(0),
      totalReviews: a.integer().default(0),
      googlePlaceId: a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Review: a
    .model({
      izakayaId: a.id().required(),
      content: a.string().required(),
      rating: a.integer().required(),
      keywords: a.string().array(),
      izakaya: a.belongsTo('Izakaya', 'izakayaId'),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  SearchQuery: a
    .model({
      query: a.string().required(),
      extractedKeywords: a.string().array(),
      extractedConditions: a.json(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  extractKeywords: a
    .generation({
      aiModel: a.ai.model('Claude 3.5 Haiku'),
      systemPrompt: `あなたは居酒屋検索システムのキーワード抽出エキスパートです。
ユーザーの検索クエリから関連するキーワードを抽出し、JSON形式で返してください。

以下のカテゴリーでキーワードを抽出してください：
- 料理タイプ（焼き鳥、刺身、など）
- 価格帯（安い、高級、など）
- 設備（個室、駅近、など）
- 地域（新宿、渋谷、など）
- 雰囲気（静か、賑やか、など）

回答は以下の形式で返してください：
{
  "keywords": ["キーワード1", "キーワード2"],
  "conditions": {
    "priceRange": "LOW/MEDIUM/HIGH",
    "hasPrivateRoom": true/false,
    "minRating": 4.0
  }
}`
    })
    .arguments({
      query: a.string().required()
    })
    .returns(a.customType({
      keywords: a.string().array(),
      conditions: a.json()
    }))
    .authorization((allow) => [allow.publicApiKey()]),

  // Note: conversation routes require owner-based authorization
  // searchChat: a
  //   .conversation({
  //     aiModel: a.ai.model('Claude 3.5 Haiku'),
  //     systemPrompt: `あなたは居酒屋検索の専門アシスタントです。`
  //   })
  //   .authorization((allow) => [allow.owner()]),
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

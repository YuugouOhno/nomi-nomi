import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

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
      allow.publicApiKey().to(["create", "read", "update", "delete"]),
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


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

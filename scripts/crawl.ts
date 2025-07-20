import { config } from 'dotenv';
import { Client as GoogleMapsClient } from "@googlemaps/google-maps-services-js";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import dotenv from 'dotenv';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { readFileSync } from 'fs';
import { join } from 'path';

function loadPrompt(fileName: string): string {
  const filePath = join(__dirname, '..', 'scripts/prompts', fileName);
  return readFileSync(filePath, 'utf-8');
}

// Amplifyの設定を読み込む
Amplify.configure(outputs);

// .env.localファイルから環境変数を読み込む
config({ path: '.env.local' });

// Amplifyのデータクライアントを生成
const client = generateClient<Schema>();

// Google Maps APIクライアントを初期化
const googleMapsClient = new GoogleMapsClient({});

// --- 設定項目 ---

// Google Places APIキー
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// 検索対象の都市リスト (緯度・経度)
const TARGET_CITIES = [
    { name: 'Shibuya', location: { lat: 35.6585, lng: 139.6513 } },
];

// 検索半径 (メートル)
const SEARCH_RADIUS = 5000;

// --- ヘルパー関数 ---

function convertPriceLevel(priceLevel: number | undefined): {
    priceMin: number | null;
    priceMax: number | null;
    priceCategory: string | null;
} {
    if (priceLevel === undefined || priceLevel === null) {
        return { priceMin: null, priceMax: null, priceCategory: null };
    }
    switch (priceLevel) {
        case 1: return { priceMin: 0, priceMax: 1999, priceCategory: '¥' };
        case 2: return { priceMin: 2000, priceMax: 3999, priceCategory: '¥¥' };
        case 3: return { priceMin: 4000, priceMax: 6999, priceCategory: '¥¥¥' };
        case 4: return { priceMin: 7000, priceMax: 9999, priceCategory: '¥¥¥¥' };
        default: return { priceMin: null, priceMax: null, priceCategory: null };
    }
}

//bedrock関連

// ClaudeモデルID（必要に応じて変更）
const CLAUDE_MODEL_ID =  'us.anthropic.claude-3-7-sonnet-20250219-v1:0';

// AWSクライアント初期化
const bedrock_client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});



// --- メイン処理 ---

async function main() {
    console.log("クローラー処理を開始します。");

    if (!GOOGLE_PLACES_API_KEY) {
        console.error("エラー: GOOGLE_PLACES_API_KEYが.env.localに設定されていません。");
        return;
    }

    for (const city of TARGET_CITIES) {
        console.log(`\n[${city.name}] の周辺の飲食店を検索します...`);
        await crawlCity(city);
    }


    console.log("\nすべての処理が完了しました。");
}

async function crawlCity(city: { name: string; location: { lat: number; lng: number } }) {
    try {
        let nextPageToken: string | undefined = undefined;
        let processedCount = 0; // 処理した店舗数をカウント

        do {
            const response = await googleMapsClient.placesNearby({
                params: {
                    location: city.location,
                    radius: SEARCH_RADIUS,
                    type: 'restaurant',
                    language: 'ja' as any,
                    key: GOOGLE_PLACES_API_KEY!,
                    pagetoken: nextPageToken,
                },
            });

            const places = response.data.results;
            console.log(`[${city.name}] ${places.length}件の店舗が見つかりました。`);

            for (const place of places) {
                if (processedCount >= 100) { // 100件に達したらループを抜ける
                    break;
                }
                if (!place.place_id || !place.name) {
                    continue;
                }

                const { data: existing } = await client.models.Restaurant.list({
                    filter: {
                        id: { eq: place.place_id }
                    }
                });

                if (existing.length > 0) {
                    console.log(`  - [スキップ] ${place.name} は既に存在します。`);
                    processedCount++; // スキップした場合もカウント
                    continue;
                }

                console.log(`  - [新規] ${place.name} の詳細情報を取得します...`);

                const detailsResponse = await googleMapsClient.placeDetails({
                    params: {
                        place_id: place.place_id,
                        fields: ["editorial_summary", "opening_hours", "serves_beer", "serves_wine", "price_level", "reviews"],
                        language: 'ja' as any,
                        key: GOOGLE_PLACES_API_KEY!,
                    },
                });
                
                const rawTemplate = loadPrompt('extractKeywords.txt');
                const details = detailsResponse.data.result;
                const shop_info = details.editorial_summary?.overview ?? '' + place.name;
                const prompt = rawTemplate.replace('{{TEXT}}', shop_info);  // inputText: 対象文章
                await extractKeywords(prompt, place.place_id);
                await new Promise(resolve => setTimeout(resolve, 10000));
                const priceInfo = convertPriceLevel(details.price_level);

                const restaurantData = {
                    id: place.place_id,
                    name: place.name,
                    description: details.editorial_summary?.overview || null,
                    address: place.formatted_address || '住所不明',
                    area: place.vicinity || 'エリア不明',
                    latitude: place.geometry?.location.lat || null,
                    longitude: place.geometry?.location.lng || null,
                    cuisine: place.types?.filter(t => t !== 'food' && t !== 'restaurant' && t !== 'point_of_interest' && t !== 'establishment') || [],
                    priceMin: priceInfo.priceMin,
                    priceMax: priceInfo.priceMax,
                    priceCategory: priceInfo.priceCategory,
                    openingHours: details.opening_hours ? JSON.stringify(details.opening_hours.weekday_text) : null,
                    ratingAverage: place.rating || null,
                    ratingCount: place.user_ratings_total || null,
                    images: place.photos?.map(p => p.photo_reference || '') || [],
                };

                const { data: newRestaurant, errors } = await client.models.Restaurant.create(restaurantData);

                if (errors) {
                    console.error(`  - [エラー] ${place.name} の保存に失敗しました:`, errors);
                } else if (newRestaurant) {
                    console.log(`  - [成功] ${newRestaurant.name} をデータベースに保存しました。`);
                }

                processedCount++; // 処理した店舗数をインクリメント
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            if (processedCount >= 100) { // 100件に達したら次のページも取得しない
                break;
            }

            nextPageToken = response.data.next_page_token;

            if (nextPageToken) {
                console.log("次のページを取得します...");
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } while (nextPageToken);

    } catch (error) {
        console.error(`[${city.name}] の処理中にエラーが発生しました:`, error);
    }
}

main().catch(error => {
    console.error("クローラーの実行中に予期せぬエラーが発生しました:", error);
});

async function extractKeywords(text: string, restaurantId: string): Promise<string[]> {

  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1000,
    messages: [{ role: 'user', content: text }],
  };

  const command = new InvokeModelCommand({
    modelId: CLAUDE_MODEL_ID,
    body: JSON.stringify(body),
    contentType: 'application/json',
    accept: 'application/json',
  });

  try {
    const response = await bedrock_client.send(command);
    const responseBody = new TextDecoder().decode(response.body);
    const parsed = JSON.parse(responseBody);
    console.log(parsed);

    const rawText = parsed.content?.[0]?.text?.trim();
    if (!rawText) throw new Error("Claudeからの応答が空です");

    // ```json ... ``` を削除してパース
    const cleaned = rawText.replace(/^```json\s*|\s*```$/g, '');
    const keywords: string[] = JSON.parse(cleaned);

    // 🔁 各キーワードごとに保存＋リレーション
    for (const keyword of keywords) {
      await saveKeywordIfNotExists(keyword, restaurantId, client);
    }

    return keywords || [];
  } catch (e: any) {
    console.error("❌ エラー:", e.message);
    throw e;
  }
}

async function saveKeywordIfNotExists(keyword: string, restaurantId: string, client: ReturnType<typeof generateClient<Schema>>) {
  try {
    // 既存のキーワードを確認
    const { data: existingKeywords } = await client.models.Keyword.list({
      filter: { keyword: { eq: keyword } }
    });

    let keywordRecord = existingKeywords[0];

    // キーワードが存在しなければ作成
    if (!keywordRecord) {
      const { data: newKeyword, errors } = await client.models.Keyword.create({ keyword });
      if (errors) {
        console.error(`❌ キーワード [${keyword}] の作成に失敗:`, errors);
        return;
      }
      keywordRecord = newKeyword!;
    }

    // キーワードとレストランのリレーションが存在するか確認
    const { data: existingRel } = await client.models.KeywordRestaurant.list({
      filter: {
        keywordId: { eq: keywordRecord.id },
        restaurantId: { eq: restaurantId },
      }
    });

    // リレーションがなければ作成
    if (existingRel.length === 0) {
      const { errors } = await client.models.KeywordRestaurant.create({
        keywordId: keywordRecord.id,
        restaurantId: restaurantId,
      });
      if (errors) {
        console.error(`❌ リレーション作成に失敗 (${keywordRecord.keyword} ⇔ ${restaurantId}):`, errors);
      }
    }

  } catch (e: any) {
    console.error(`❌ saveKeywordIfNotExists エラー:`, e.message);
  }
}
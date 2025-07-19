import { config } from 'dotenv';
import { Client as GoogleMapsClient } from "@googlemaps/google-maps-services-js";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

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
    { name: 'Shibuya', location: { lat: 35.6585, lng: 139.7013 } },
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
                    language: 'ja',
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
                        placeId: { eq: place.place_id }
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
                        language: 'ja',
                        key: GOOGLE_PLACES_API_KEY!,
                    },
                });

                const details = detailsResponse.data.result;
                const priceInfo = convertPriceLevel(details.price_level);

                const restaurantData = {
                    Id: place.place_id,
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
                } else {
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
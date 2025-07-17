import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';

// Amplifyの設定
Amplify.configure(outputs);
const client = generateClient<Schema>();

// シードデータ - 必須フィールドと定義されているフィールドのみ
const seedRestaurants = [
  {
    name: '海鮮居酒屋 魚心',
    description: '新鮮な海鮮と豊富な日本酒が自慢の居酒屋。毎日市場から仕入れる新鮮な魚介類を使った料理が楽しめます。',
    address: '東京都渋谷区道玄坂1-5-8',
    area: '渋谷',
    reservationRequired: false
  },
  {
    name: 'ビストロ サクラ',
    description: 'フランス料理をカジュアルに楽しめるビストロ。デートや記念日にぴったりの落ち着いた雰囲気です。',
    address: '東京都渋谷区神南1-12-16',
    area: '渋谷',
    reservationRequired: true
  },
  {
    name: 'ラーメン横丁 太郎',
    description: '濃厚な豚骨スープが自慢のラーメン店。深夜まで営業しているので、飲んだ後の〆にも最適。',
    address: '東京都渋谷区宇田川町15-1',
    area: '渋谷',
    reservationRequired: false
  },
  {
    name: '炭火焼肉 牛蔵',
    description: '厳選された和牛を炭火で楽しめる高級焼肉店。接待や特別な日のディナーに最適です。',
    address: '東京都渋谷区松濤1-29-1',
    area: '渋谷',
    reservationRequired: true
  },
  {
    name: 'トラットリア ソーレ',
    description: '本格的なイタリア料理をリーズナブルに楽しめるトラットリア。パスタとピザが特に人気。',
    address: '東京都渋谷区神泉町8-16',
    area: '渋谷',
    reservationRequired: false
  },
  {
    name: '和食処 花鳥',
    description: '季節の食材を使った会席料理が楽しめる和食店。静かな個室で大切な方との時間を。',
    address: '東京都渋谷区広尾5-4-16',
    area: '広尾',
    reservationRequired: true
  },
  {
    name: 'アジアンダイニング スパイス',
    description: 'タイ、ベトナム、インドなどアジア各国の料理が楽しめるエスニックレストラン。',
    address: '東京都渋谷区恵比寿西1-10-6',
    area: '恵比寿',
    reservationRequired: false
  },
  {
    name: '鉄板焼き 青山',
    description: '目の前で焼き上げる鉄板焼きのパフォーマンスが楽しめる。A5ランクの黒毛和牛を使用。',
    address: '東京都渋谷区神宮前5-50-6',
    area: '表参道',
    reservationRequired: true
  }
];

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // 既存のデータを確認
    const existingRestaurants = await client.models.Restaurant.list();
    console.log(`Found ${existingRestaurants.data.length} existing restaurants`);
    
    // 各レストランを作成
    for (const restaurant of seedRestaurants) {
      try {
        console.log(`Creating restaurant: ${restaurant.name}`);
        const result = await client.models.Restaurant.create(restaurant);
        if (result.data) {
          console.log(`✓ Successfully created: ${result.data.name}`);
        } else if (result.errors) {
          console.error(`✗ Error creating ${restaurant.name}:`, result.errors);
        }
      } catch (error) {
        console.error(`✗ Exception creating restaurant ${restaurant.name}:`, error);
      }
    }
    
    // 作成後の確認
    const allRestaurants = await client.models.Restaurant.list();
    console.log(`\nSeeding completed! Total restaurants in database: ${allRestaurants.data.length}`);
    
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// スクリプトを実行
seedDatabase();
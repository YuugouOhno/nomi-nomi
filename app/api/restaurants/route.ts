import { NextResponse, NextRequest } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import type { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';

// Amplify設定
Amplify.configure(outputs);
const client = generateClient<Schema>();

export async function GET() {
  try {
    // Amplify DataStoreから全レストランを取得
    const response = await client.models.Restaurant.list();
    const restaurants = response.data;
    
    // データを整形
    const formattedRestaurants = restaurants.map(restaurant => ({
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
      openingHours: typeof restaurant.openingHours === 'string' 
        ? restaurant.openingHours 
        : JSON.parse(restaurant.openingHours || '{}'),
      
      images: restaurant.images || [],
      keywords: restaurant.keywords || ''
    }));
    
    return NextResponse.json({
      restaurants: formattedRestaurants,
      total: formattedRestaurants.length
    });
  } catch (error) {
    console.error('Restaurants API error:', error);
    return NextResponse.json(
      { error: 'レストラン一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 必須フィールドの検証
    if (!body.name || !body.address || !body.area) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }
    
    // データの型変換と検証
    const restaurantData = {
      name: body.name,
      description: body.description || '',
      address: body.address,
      area: body.area,
      cuisine: body.cuisine || [],
      features: body.features || [],
      ambience: body.ambience || [],
      ratingAverage: body.rating || body.ratingAverage || 0,
      ratingCount: body.ratingCount || 0,
      priceCategory: body.priceCategory || '¥¥',
      openingHours: JSON.stringify(body.openingHours || '11:00-22:00'),
      images: body.images || [],
      keywords: body.keywords || [],
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      priceMin: body.priceMin || null,
      priceMax: body.priceMax || null
    };
    
    console.log('Creating restaurant with data:', restaurantData);
    
    // レストランを作成 - APIキー認証を使用
    const response = await client.models.Restaurant.create(restaurantData, {
      authMode: 'apiKey'
    });
    
    if (response.errors) {
      console.error('GraphQL errors:', response.errors);
      throw new Error(response.errors.map(e => e.message).join(', '));
    }
    
    return NextResponse.json({
      restaurant: response.data,
      message: 'レストランが追加されました'
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    const errorMessage = error instanceof Error ? error.message : 'レストランの追加に失敗しました';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
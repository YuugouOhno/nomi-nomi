import { NextResponse } from 'next/server';
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
      features: restaurant.features ? restaurant.features.split(',') : [],
      ambience: restaurant.ambience,
      rating: restaurant.rating || 0,
      priceRange: restaurant.priceRange || '¥¥',
      openingHours: restaurant.openingHours || '',
      reservationRequired: restaurant.reservationRequired || false,
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
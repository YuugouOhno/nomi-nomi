import { NextResponse } from 'next/server';
import { seedRestaurants } from '@/app/lib/seed-data';

export async function GET() {
  try {
    // 現在はシードデータを返す
    // TODO: 実際のAmplify DataStoreから取得
    return NextResponse.json({
      restaurants: seedRestaurants,
      total: seedRestaurants.length
    });
  } catch (error) {
    console.error('Restaurants API error:', error);
    return NextResponse.json(
      { error: 'レストラン一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
import { NextResponse, NextRequest } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import type { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';

// Amplify設定
Amplify.configure(outputs);
const client = generateClient<Schema>();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // レストランを更新
    const response = await client.models.Restaurant.update({
      id: params.id,
      name: body.name,
      description: body.description || '',
      address: body.address,
      area: body.area,
      cuisine: body.cuisine,
      ratingAverage: body.rating || 0,
      priceCategory: body.priceCategory || '¥¥',
      openingHours: body.openingHours || '',
      images: body.images || [],
    });
    
    if (response.errors) {
      throw new Error('Failed to update restaurant');
    }
    
    return NextResponse.json({
      restaurant: response.data,
      message: 'レストランが更新されました'
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    return NextResponse.json(
      { error: 'レストランの更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // レストランを削除
    const response = await client.models.Restaurant.delete({
      id: params.id
    });
    
    if (response.errors) {
      throw new Error('Failed to delete restaurant');
    }
    
    return NextResponse.json({
      message: 'レストランが削除されました'
    });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    return NextResponse.json(
      { error: 'レストランの削除に失敗しました' },
      { status: 500 }
    );
  }
}
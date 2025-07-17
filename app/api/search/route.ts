import { NextRequest, NextResponse } from 'next/server';
import { orchestrateLLMSearch } from '@/app/lib/llm-orchestrator';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'クエリが無効です' },
        { status: 400 }
      );
    }

    // LLMオーケストレーターを使用して検索を実行
    const result = await orchestrateLLMSearch(query);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: '検索中にエラーが発生しました',
        message: '申し訳ございませんが、もう一度お試しください。',
        restaurants: []
      },
      { status: 500 }
    );
  }
}
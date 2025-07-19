import { NextRequest, NextResponse } from 'next/server';
import { orchestrateLLMSearch } from '@/app/lib/llm-orchestrator';

export async function POST(request: NextRequest) {
  console.log("=== API /search 呼び出し開始 ===")
  console.log("リクエストURL:", request.url)
  console.log("リクエストメソッド:", request.method)
  
  try {
    const body = await request.json();
    console.log("リクエストボディ:", body)
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'クエリが無効です' },
        { status: 400 }
      );
    }

    // LLMオーケストレーターを使用して検索を実行
    console.log("orchestrateLLMSearchを叩く")
    console.log("query:", query)
    const result = await orchestrateLLMSearch(query);

    return NextResponse.json(result);
  } catch (error) {
    console.error('=== Search API エラー ===');
    console.error('エラータイプ:', typeof error);
    console.error('エラーメッセージ:', error instanceof Error ? error.message : error);
    console.error('スタックトレース:', error instanceof Error ? error.stack : 'なし');
    console.error('===========================');
    
    return NextResponse.json(
      { 
        error: '検索中にエラーが発生しました',
        message: '申し訳ございませんが、もう一度お試しください。',
        restaurants: [],
        debug: process.env.NODE_ENV === 'development' ? {
          errorType: typeof error,
          errorMessage: error instanceof Error ? error.message : String(error)
        } : undefined
      },
      { status: 500 }
    );
  }
}
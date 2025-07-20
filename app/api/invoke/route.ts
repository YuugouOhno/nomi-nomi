// app/api/invoke/route.ts
import { NextRequest } from 'next/server';
import { invokeLLM } from '../../lib/bedrock';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    const result = await invokeLLM(prompt);
    return Response.json({ result });
  } catch (e: any) {
    console.error('🔥 LLM Error:', {
      message: e?.message,
      stack: e?.stack,
      name: e?.name,
    });

    return new Response(
      JSON.stringify({
        error: e?.message || 'Unknown error',
        stack: e?.stack,
        name: e?.name,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

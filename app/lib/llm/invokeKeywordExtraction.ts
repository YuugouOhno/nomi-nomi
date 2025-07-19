// app/lib/llm/invokeKeywordExtraction.ts
import { invokeLLM } from '../bedrock';
import { keywordPrompt } from '../prompts/keywordPrompt';

export const extractKeywords = async (input: string): Promise<string[]> => {
  const prompt = keywordPrompt(input);
  const result = await invokeLLM(prompt);  // Claude APIを実行

  console.log('Claude応答内容:', result);  // 🔍デバッグ用

  try {
    const parsed = JSON.parse(result);
    return parsed.keywords || [];
  } catch (e) {
    console.error('JSONパース失敗:', result);
    return [];
  }
};

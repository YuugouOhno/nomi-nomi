// lib/prompts/keywordPrompt.ts
export const keywordPrompt = (input: string): string => `
以下の文章から重要なキーワードを5〜10個抽出してください。
出力は必ず JSON 形式で以下の形にしてください。

{
  "keywords": ["キーワード1", "キーワード2", ...]
}

文章:
${input}
`;

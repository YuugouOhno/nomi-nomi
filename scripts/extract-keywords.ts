// extractKeywords.ts
import dotenv from 'dotenv';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// .env.local を読み込む（必要であれば）
dotenv.config({ path: '.env.local' });

// ClaudeモデルID（必要に応じて変更）
const CLAUDE_MODEL_ID =  'us.anthropic.claude-3-7-sonnet-20250219-v1:0';

// AWSクライアント初期化
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function extractKeywords(text: string): Promise<string[]> {
  const prompt = `以下の文章から重要なキーワードを5〜10個抽出してください。\n\n出力形式: {"keywords": ["..."]}\n\n文章:\n${text}`;

  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  };

  const command = new InvokeModelCommand({
    modelId: CLAUDE_MODEL_ID,
    body: JSON.stringify(body),
    contentType: 'application/json',
    accept: 'application/json',
  });

  try {
    const response = await client.send(command);
    const responseBody = new TextDecoder().decode(response.body);
    const parsed = JSON.parse(responseBody);

    const rawText = parsed.content?.[0]?.text?.trim();
    if (!rawText) throw new Error("Claudeからの応答が空です");

    // ```json ... ``` を削除してパース
    const cleaned = rawText.replace(/^```json\s*|\s*```$/g, '');
    const json = JSON.parse(cleaned);

    return json.keywords || [];
  } catch (e: any) {
    console.error("❌ エラー:", e.message);
    throw e;
  }
}

// ===== 実行例（Node.js CLIとして使う場合） =====
if (require.main === module) {
  const input = process.argv.slice(2).join(" ");
  if (!input) {
    console.error("❗文章を引数として指定してください。");
    process.exit(1);
  }

  extractKeywords(input)
    .then((keywords) => {
      console.log("✅ 抽出されたキーワード:", keywords);
    })
    .catch(() => process.exit(1));
}

export { extractKeywords };

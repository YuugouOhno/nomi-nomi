import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// AWS Bedrock クライアント設定
export const bedrockClient = new BedrockRuntimeClient({
  region: 'us-east-1', // Claude は us-east-1 で利用可能
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Claude 3 Sonnet モデル ID
export const CLAUDE_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';

// Bedrock API 呼び出しヘルパー
export async function invokeClaude(prompt: string): Promise<string> {
  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: CLAUDE_MODEL_ID,
    body: JSON.stringify(body),
    contentType: 'application/json',
    accept: 'application/json',
  });

  try {
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  } catch (error) {
    console.error('Bedrock API error:', error);
    throw new Error('LLM処理中にエラーが発生しました');
  }
}

// 汎用的なLLM呼び出し（将来的に他のモデルも対応可能）
export async function invokeLLM(prompt: string, modelId: string = CLAUDE_MODEL_ID): Promise<string> {
  return invokeClaude(prompt);
}
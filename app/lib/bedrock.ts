import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// AWS Bedrock クライアント設定
export const bedrockClient = new BedrockRuntimeClient({
  region: 'us-east-1', // Claude は us-east-1 で利用可能
  // SSO認証の場合、AWS SDKは自動的に認証情報を検出
  // ~/.aws/credentials や環境変数から認証情報を取得
});

// Claude Inference Profile設定（優先順位順）
// 直接モデルIDではなくInference Profileを使用
export const CLAUDE_MODELS = [
  'us.anthropic.claude-3-5-sonnet-20241022-v2:0', // Claude 3.5 Sonnet v2 Inference Profile
  'us.anthropic.claude-3-7-sonnet-20250219-v1:0',  // Claude 3.7 Sonnet Inference Profile
  'us.anthropic.claude-3-5-sonnet-20240620-v1:0',  // Claude 3.5 Sonnet Inference Profile
  'us.anthropic.claude-3-5-haiku-20241022-v1:0',   // Claude 3.5 Haiku Inference Profile
  'us.anthropic.claude-3-sonnet-20240229-v1:0',    // Claude 3 Sonnet Inference Profile (フォールバック)
  'us.anthropic.claude-3-haiku-20240307-v1:0'      // Claude 3 Haiku Inference Profile (最終フォールバック)
];

// デフォルトモデル（環境変数で上書き可能）
export const DEFAULT_CLAUDE_MODEL = process.env.AWS_BEDROCK_MODEL_ID || CLAUDE_MODELS[0];

// Bedrock API 呼び出しヘルパー（フォールバック機能付き）
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

  // 複数モデルでフォールバック試行
  let lastError: any;
  
  for (const modelId of CLAUDE_MODELS) {
    try {
      console.log(`Attempting to use model: ${modelId}`);
      
      const command = new InvokeModelCommand({
        modelId,
        body: JSON.stringify(body),
        contentType: 'application/json',
        accept: 'application/json',
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log(`Successfully used model: ${modelId}`);
      return responseBody.content[0].text;
      
    } catch (error: any) {
      console.warn(`Model ${modelId} failed:`, error.message);
      lastError = error;
      
      // AccessDeniedExceptionの場合は次のモデルを試行
      if (error.name === 'AccessDeniedException' || error.message?.includes('access')) {
        continue;
      }
      
      // その他のエラーの場合も次のモデルを試行
      continue;
    }
  }
  
  // すべてのモデルが失敗した場合
  console.error('All Claude models failed. Last error:', lastError);
  throw new Error(`LLM処理中にエラーが発生しました: ${lastError?.message || 'Unknown error'}`);
}

// 汎用的なLLM呼び出し（将来的に他のモデルも対応可能）
export async function invokeLLM(prompt: string, preferredModelId?: string): Promise<string> {
  // 特定モデルが指定された場合は最優先で試行
  if (preferredModelId) {
    const modelsToTry = [preferredModelId, ...CLAUDE_MODELS.filter(m => m !== preferredModelId)];
    return invokeClaudeWithModels(prompt, modelsToTry);
  }
  
  return invokeClaude(prompt);
}

// 指定されたモデルリストで試行する内部関数
async function invokeClaudeWithModels(prompt: string, modelIds: string[]): Promise<string> {
  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  };

  let lastError: any;
  
  for (const modelId of modelIds) {
    try {
      console.log(`Attempting to use model: ${modelId}`);
      
      const command = new InvokeModelCommand({
        modelId,
        body: JSON.stringify(body),
        contentType: 'application/json',
        accept: 'application/json',
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log(`Successfully used model: ${modelId}`);
      return responseBody.content[0].text;
      
    } catch (error: any) {
      console.warn(`Model ${modelId} failed:`, error.message);
      lastError = error;
      continue;
    }
  }
  
  throw new Error(`LLM処理中にエラーが発生しました: ${lastError?.message || 'Unknown error'}`);
}
# CLAUDE.md

このファイルは、このリポジトリでコードを作業する際にClaude Code (claude.ai/code)にガイダンスを提供します。

## プロジェクト概要

nomi-nomiは、Next.js 14とAWS Amplify Gen2で構築されたAI駆動型レストラン検索アプリケーションです。ユーザーは自然言語クエリを使用してレストランを検索でき、複数のLLMオーケストレーションを通じてパーソナライズされた推薦を受けることができます。

## 開発コマンド

### ローカル開発
```bash
# 開発サーバーを起動
npm run dev

# 本番用にビルド
npm run build

# 本番サーバーを起動
npm start

# リントを実行
npm run lint
```

### AWS Amplifyコマンド
```bash
# Amplifyバックエンドを初期化（初回のみ）
npx ampx generate --branch main --app-id <app-id>

# バックエンドの変更をデプロイ
npx ampx pipeline-deploy --branch main --app-id $AWS_APP_ID

# バックエンドスキーマからTypeScript型を生成
npx ampx generate graphql-client-code --out ./src/API.ts

# Amplifyバックエンドのステータスを確認
npx ampx status

# Amplifyコンソールを開く
npx ampx console
```

## アーキテクチャ

### フロントエンド構造
- **Next.js 14** with App Router
- **Tailwind CSS** スタイリング用
- **TypeScript** 型安全性のため
- **AWS Amplify UI React** 認証とUIコンポーネント用

### バックエンド構造
- **AWS Amplify Gen2** バックエンド設定は `/amplify/` にあります
- **データ層**: `amplify/data/resource.ts` 経由でDynamoDBを使用したGraphQL API
- **認証層**: `amplify/auth/resource.ts` 経由でCognito認証
- **バックエンドエントリポイント**: `amplify/backend.ts` で完全なバックエンドを定義

### 重要なファイルとパターン

#### データスキーマ (`amplify/data/resource.ts`)
- Amplifyのスキーマビルダーを使用したGraphQLスキーマ定義を含む
- 現在は基本的なTodoモデルがある - レストランデータ用に更新が必要
- 認証ルールはモデルレベルで定義される

#### 認証 (`amplify/auth/resource.ts`)
- メールベースの認証で設定
- ユーザー管理にAWS Cognitoを使用

#### フロントエンドデータクライアント
- "aws-amplify/data" から `generateClient` をインポート
- `@/amplify/data/resource` から生成されたSchemaタイプを使用
- クライアント設定は page.tsx で `Amplify.configure(outputs)` を使用

### 期待されるアーキテクチャの発展

プロジェクト仕様に基づいて、このコードベースは以下を含むように発展する予定です：

1. **マルチLLMオーケストレーション**: 複数のLLMを調整するLambda関数
2. **レストランデータモデル**: Todoモデルを包括的なレストランスキーマに置き換え
3. **検索API**: 自然言語クエリ処理エンドポイント
4. **管理者インターフェース**: レストランデータの管理ダッシュボード
5. **ユーザーロール**: 管理者と一般ユーザーの認証

## 重要な開発メモ

### Amplify設定
- バックエンド設定は `/amplify/` ディレクトリにあります
- フロントエンドは `amplify_outputs.json`（自動生成）から設定を取得
- `ampx` CLIコマンドを使用（古い `amplify` CLIではなく）

### データクライアントの使用
- 型安全性のため、常に生成されたTypeScriptクライアントを使用
- データクライアントは使用前に `Amplify.configure()` で設定する必要があります
- クライアントは `amplify/data/resource.ts` のスキーマ定義から生成されます

### TypeScript設定
- パスエイリアス `@/*` はプロジェクトルートにマップ
- AmplifyディレクトリはTypeScriptコンパイルから除外
- すべてのデータ操作に生成されたSchemaタイプを使用

### デプロイメント
- バックエンドは `amplify.yml` 設定経由でデプロイ
- フロントエンドは `npm run build` でビルドし、`.next/` に出力
- バックエンドの変更にはパイプラインデプロイを使用

## 現在の状態

コードベースは初期開発段階で、以下を含んでいます：
- Tailwind CSSを使用した基本的なNext.js 14セットアップ
- AWS Amplify Gen2バックエンドの骨組み
- シンプルな認証設定
- プレースホルダーのTodoデータモデル（置き換えが必要）
- 基本的な"hello world"フロントエンド

アプリケーションは、プロジェクトドキュメントで概説されているAIレストラン検索仕様に合わせるために、大幅な開発が必要です。
# nomi-nomi

AI駆動型レストラン検索アプリケーション

## 概要

nomi-nomiは、自然言語クエリを使用してレストランを検索できるAI駆動型アプリケーションです。複数のLLM（大規模言語モデル）を使用してユーザーの質問を分析し、パーソナライズされたレストラン推薦を提供します。

## 主な機能

- **自然言語検索**: 「渋谷にある海鮮が美味しい居酒屋教えて」や「彼女と行ける雰囲気の良い和食屋さん教えて」などの自然な質問でレストランを検索
- **マルチLLMオーケストレーション**: 複数の専門化されたLLMが連携して最適な結果を提供
- **レスポンシブデザイン**: デスクトップとモバイルデバイスの両方に対応
- **管理者機能**: レストランデータの管理とユーザー管理

## 技術スタック

### フロントエンド
- Next.js 14
- React 18
- Tailwind CSS
- AWS Amplify UI コンポーネント

### バックエンド
- AWS Amplify Gen2
- AWS Lambda
- Amazon Bedrock（LLMサービス）
- Amazon DynamoDB

### 認証
- AWS Cognito

## クイックスタート

開発環境をすぐに立ち上げるための手順：

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd nomi-nomi

# 2. 依存関係をインストール
npm install

# 3. 開発サーバーを起動
npm run dev
```

アプリケーションは http://localhost:3000 でアクセスできます。

> **注意**: フル機能を使用するにはAWS設定が必要です。詳細は下記の「開発環境の設定」を参照してください。

## 開発環境の設定

### 前提条件
- Node.js 18以上
- AWS CLI
- AWS Amplify CLI

### 詳細なセットアップ手順

#### 1. リポジトリの準備

```bash
# リポジトリをクローン
git clone <repository-url>
cd nomi-nomi

# 依存関係をインストール
npm install
```

#### 2. AWS設定

```bash
# AWS CLIの設定（初回のみ）
aws configure

# Amplify CLIの設定（初回のみ）
npx amplify configure
```

#### 3. バックエンドの初期化

```bash
# Amplifyバックエンドの初期化
npx amplify init

# バックエンドリソースをデプロイ
npx amplify push
```

#### 4. 環境変数の設定

```bash
# .env.local ファイルを作成
cp .env.example .env.local

# 必要な環境変数を設定
# - AWS_REGION
# - AMPLIFY_APP_ID
# - その他のAWS設定
```

#### 5. 開発サーバーの起動

```bash
# 開発サーバーを起動
npm run dev
```

### 開発時の便利なコマンド

```bash
# コードのリント
npm run lint

# 型チェック
npm run type-check

# テスト実行
npm run test

# Amplifyステータス確認
npx amplify status

# Amplifyコンソールを開く
npx amplify console

# ローカルでのAmplifyサービスのモッキング
npx amplify mock
```

## 使用方法

### 基本的な検索
1. アプリケーションを開く
2. 検索ボックスに自然言語でクエリを入力
   - 例: 「新宿で深夜までやってるラーメン屋さん」
   - 例: 「デートにぴったりなイタリアン」
3. 検索結果とパーソナライズされた推薦テキストを確認

### 管理者機能
1. 管理者アカウントでログイン
2. 管理ダッシュボードにアクセス
3. レストランデータの追加・編集・削除を実行

## API エンドポイント

- `POST /api/search` - 自然言語検索クエリの処理
- `GET /api/restaurants` - レストラン一覧の取得
- `POST /api/restaurants` - レストランの追加（管理者のみ）
- `PUT /api/restaurants/:id` - レストランの更新（管理者のみ）
- `DELETE /api/restaurants/:id` - レストランの削除（管理者のみ）

## データモデル

### レストラン
```typescript
type Restaurant = {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    area: string;
    coordinates: {
      latitude: number;
      longitude: number;
    }
  };
  cuisine: string[];
  priceRange: {
    min: number;
    max: number;
    category: "¥" | "¥¥" | "¥¥¥" | "¥¥¥¥";
  };
  openingHours: {
    [day: string]: {
      open: string;
      close: string;
    }
  };
  features: string[];
  ambience: string[];
  ratings: {
    average: number;
    count: number;
  };
  images: string[];
  keywords: string[];
  createdAt: string;
  updatedAt: string;
};
```

## LLMアーキテクチャ

システムは4つの専門化されたLLMを使用して検索処理を実行します：

1. **LLM_A**: クエリ分類 - ユーザークエリを構造化データとキーワードに分類
2. **LLM_B**: 構造化データ抽出 - 構造化データをデータベースクエリパラメータに変換
3. **LLM_C**: キーワード抽出 - あいまいなキーワードを検索可能な形式に変換
4. **LLM_D**: 推薦文生成 - 検索結果に基づいてパーソナライズされた推薦テキストを生成

## スクリプト

```bash
# 開発サーバーを起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバーを起動
npm start

# コードのリント
npm run lint
```

## デプロイ

### AWS Amplifyへのデプロイ

```bash
# バックエンドリソースをデプロイ
npx amplify push

# フロントエンドをデプロイ
npx amplify publish
```

詳細なデプロイ手順については、[AWS Amplifyドキュメント](https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/#deploy-a-fullstack-app-to-aws)を参照してください。

## 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMIT-0ライセンスの下でライセンスされています。詳細はLICENSEファイルを参照してください。

## サポート

問題や質問がある場合は、GitHubのIssuesページでお知らせください。
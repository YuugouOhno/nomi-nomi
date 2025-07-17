# 技術スタックと開発ガイドライン

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 14（App Router使用）
- **UIライブラリ**: React 18
- **スタイリング**: Tailwind CSS 4.x
- **UIコンポーネント**: AWS Amplify UI Reactコンポーネント

### バックエンド
- **インフラストラクチャ**: AWS Amplify Gen2
- **認証**: AWS Cognito（Amplify Authで構成）
- **データベース**: Amazon DynamoDB（Amplify Data経由）
- **AI/ML**: LLMサービス用のAmazon Bedrock
- **サーバーレス関数**: AWS Lambda

## 開発環境

### 前提条件
- Node.js 18以上
- npm/yarn
- AWS CLI
- AWS Amplify CLI

## 一般的なコマンド

### プロジェクトセットアップ
```bash
# 依存関係のインストール
npm install

# AWSの設定
aws configure

# Amplifyの設定
npx amplify configure
```

### 開発ワークフロー
```bash
# 開発サーバーの起動
npm run dev

# リントの実行
npm run lint

# 本番用ビルド
npm run build

# 本番サーバーの起動
npm start
```

### Amplifyコマンド
```bash
# Amplifyバックエンドの初期化
npx amplify init

# バックエンドリソースのデプロイ
npx amplify push

# Amplifyステータスの確認
npx amplify status

# Amplifyコンソールを開く
npx amplify console

# Amplifyサービスをローカルでモック
npx amplify mock
```

## コードスタイルと規約

### TypeScript
- すべての新しいコードにはTypeScriptを使用
- すべてのコンポーネント、関数、変数に適切な型を定義
- 可能な限り`any`型の使用を避ける

### Reactコンポーネント
- フック付きの関数コンポーネントを使用
- クライアントコンポーネントには"use client"ディレクティブを使用
- コンポーネントは単一の責任に焦点を当てる
- 再利用可能なUI要素は別のコンポーネントに抽出

### データ取得
- データベース操作にはAWS Amplify Dataクライアントを使用
- データクライアント生成にはコードベースに示されているパターンに従う

### スタイリング
- スタイリングにはTailwind CSSを使用
- モバイルファーストのレスポンシブデザインアプローチに従う
- 適切な場合はAmplify UIコンポーネントを使用

## テストと品質保証
- 重要な機能にはテストを書く
- コードをコミットする前にリントを実行
- レスポンシブデザインがすべてのターゲットデバイスで動作することを確認
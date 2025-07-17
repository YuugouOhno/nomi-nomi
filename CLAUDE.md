# CLAUDE.md

このファイルは、このリポジトリで作業する際のClaude Code (claude.ai/code) へのガイダンスを提供します。

## プロジェクト概要

これはAWS Amplify Gen2 + Next.jsのスターターテンプレートで、サーバーレスなフルスタックアプリケーションを実装しています。Next.js App RouterとAWS Amplifyのバックエンドサービス（Cognito認証、AppSync GraphQL API、DynamoDB）を使用しています。

## 必須コマンド

### 開発
```bash
npm run dev          # 開発サーバーを起動 (http://localhost:3000)
npm run build        # プロダクション用にビルド
npm run start        # プロダクションサーバーを起動
npm run lint         # リンティングを実行
```

### Amplifyバックエンド
プロジェクトはAWS Amplify Gen2 CLIを使用しています。バックエンドのデプロイはAmplifyコンソールまたは`amplify.yml`で設定されたCI/CDパイプラインを通じて行われます。

## アーキテクチャ

### バックエンド構造 (`/amplify`)
- **auth/resource.ts**: Cognito認証設定（メールベースのログイン）
- **data/resource.ts**: データモデル定義とAPI設定。現在はパブリックAPIキー認証付きのTodoモデルを定義
- **backend.ts**: authとdataの設定をエクスポートする中央バックエンドリソース定義

### フロントエンド構造 (`/app`)
- Next.js 14 App Routerパターンを使用
- **page.tsx**: リアルタイムサブスクリプション付きのTodo CRUD操作を実装するメインアプリケーションページ
- **layout.tsx**: Interフォント設定を含むルートレイアウト
- CSSモジュールとAWS Amplify UI Reactコンポーネントによるスタイリング

### 主要な実装詳細

1. **リアルタイムデータ同期**: アプリはGraphQLサブスクリプションを使用してデータ変更時に自動的にUIを更新
2. **API設定**: 現在パブリックAPIキー認証（30日間有効）を使用。本番アプリではユーザーベースの認証を実装すべき
3. **型安全性**: TypeScript strictモードが有効。GraphQL操作にはAWS Amplifyの生成型を使用
4. **ビルドプロセス**: `amplify.yml`は`.next/cache`、`.npm`、`node_modules`のキャッシングを含むCI/CDパイプラインを定義

### 重要なファイル
- **amplify_outputs.json**: デプロイ時に生成、フロントエンド設定を含む（リポジトリには含まれない）
- **amplify/data/resource.ts**: データモデルを定義 - APIスキーマを変更するにはこのファイルを修正
- **app/page.tsx**: Todo操作のメインアプリケーションロジック

## 開発メモ

- フロントエンドがバックエンドサービスに接続するために`amplify_outputs.json`が必要
- 現在テストフレームワークは設定されていない
- @composio/mcpパッケージが最近インストールされたがまだ統合されていない
- **重要**: `.kiro`ディレクトリの内容に従って開発を進めること

## コミット規則

### 基本ルール
- **エラーがないことを必ず確認**してからコミット
- **機能ごとに細かくコミット**を切る（大きな変更をまとめない）
- コミット前に必ず以下を実行：
  ```bash
  npm run lint     # リントエラーがないか確認
  npm run build    # ビルドエラーがないか確認
  ```

### コミットメッセージの形式
- 機能追加: `feat: 〇〇機能を追加`
- バグ修正: `fix: 〇〇の不具合を修正`
- リファクタリング: `refactor: 〇〇を改善`
- スタイル変更: `style: 〇〇のスタイルを調整`
- ドキュメント: `docs: 〇〇の説明を追加`

## 重要な制約事項

### スタイリング
- **Tailwind CSS v4** - ゼロ設定、自動コンテンツ検出
- **Amplify UIコンポーネント禁止** - 独自のコンポーネントのみ使用
- **カスタムCSS禁止** - Tailwindユーティリティのみ使用
- **アイコンはHeroIconsのみ** - app/components/ui/Icon.tsxラッパー経由で使用

### TypeScript
- **TypeScript Strictモード** - any型は原則禁止
- 未使用の変数は警告（本番ビルドではエラー）
- 明示的な型注釈を推奨

## スタイリングガイドライン

### 基本ルール
- **Tailwindユーティリティのみ** - カスタムCSSファイルやインラインスタイル禁止
- **globals.cssの内容**: `@import "tailwindcss";` のみ
- **アイコン使用方法**: Iconコンポーネントでサイズ（xs/sm/md/lg/xl）とsolid属性を指定

## デザインシステム（重要）

### 統一されたクラス構築パターン
- `cn()` ユーティリティ関数を使用してクラス名を構築
- 複雑な条件分岐やテンプレートリテラルは避ける
- 例: `className={cn(baseClasses, variantClasses[variant], className)}`

### セマンティック色トークン
- **primary-\***: メインカラー（青系）
- **error-\***: エラー状態（赤系）
- **success-\***: 成功状態（緑系）
- **warning-\***: 警告状態（黄系）
- **info-\***: 情報表示（青系）

### デザイントークン（CSS変数）
- **--color-primary-\***: プライマリカラー
- **--font-size-\***: タイポグラフィスケール
- **--spacing-\***: スペーシングスケール
- **--z-index-\***: z-indexレイヤー

### コンポーネントのバリアント管理
- オブジェクト形式でバリアントを定義
- 型安全なバリアント選択を実装
- サイズ・カラー・状態の統一パターン

## インポートパス

### TypeScriptのパスエイリアス
```typescript
// @/で始まるパスはプロジェクトルートを指す
import { Component } from '@/app/components/ui/Component'
import { useAuth } from '@/app/hooks/useAuth'
```

## テスト

**注意**: 現在テストスイートは未実装です。以下のテスト戦略が計画されています：
- ユニットテスト（Jest + React Testing Library）
- 統合テスト
- APIテスト（Supertest）
- セキュリティテスト（OWASP ZAP）
- パフォーマンステスト（Lighthouse CI）
- アクセシビリティテスト（axe-core）
- 視覚回帰テスト（Percy/Chromatic）

## トラブルシューティング

### amplify_outputs.jsonが見つからない
```bash
npx ampx generate outputs --branch main --app-id <your-app-id>
```

### スキーマ変更が反映されない
```bash
npx ampx sandbox delete
npx ampx sandbox
```

### LinkTracker/LinkClick作成エラー
```bash
npx ampx sandbox --once  # サンドボックスを再起動
```

### TypeScript Strictモード違反
- any型の使用は避ける
- 未使用の変数は警告（本番ビルドではエラー）
- 明示的な型注釈を推奨

## 参考ドキュメント

開発で困ったときは以下の最新ドキュメントを参照：

### AWS Amplify
- **Amplify + Next.js**: https://docs.amplify.aws/nextjs/
- **Amplify AI**: https://docs.amplify.aws/nextjs/ai/

### Google Maps
- **Places API**: https://developers.google.com/maps/documentation/places/web-service/overview?hl=ja
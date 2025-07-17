# nomi-nomi

## 🚀 クイックスタート

### 前提条件

- Node.js 18以上
- AWS CLIの設定
- Amplify CLIのインストール

### セットアップ手順

```bash
# 1. 依存関係のインストール
npm install

# 2. Amplifyサンドボックスの起動
npx ampx sandbox

# 3. 開発サーバーの起動
npm run dev
```

### 初期設定

#### 開発環境での管理者アカウント作成

1. 開発サーバーを起動 (`npm run dev`)
2. ログイン画面 (http://localhost:3000) にアクセス
3. 画面下部の「【開発用】管理者アカウント登録」リンクをクリック
4. 必要な情報を入力して管理者アカウントを作成

**注意**: この機能は開発環境でのみ利用可能です。

#### 環境変数の設定

`.env.local`ファイルを作成：

```env
# トラッキングリンクのベースURL
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # ローカル環境
```

## 開発

### 利用可能なスクリプト

```bash
# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プロダクションモードでの起動
npm start

# リンター実行
npm run lint
```

### プロジェクト構成

```
.
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # UIコンポーネント
│   ├── lib/             # ユーティリティ関数
│   └── types/           # TypeScript型定義
├── amplify/             # Amplify設定
├── public/              # 静的ファイル
└── package.json
```

## トラブルシューティング

### Amplifyサンドボックスが起動しない

1. AWS CLIが正しく設定されているか確認
2. Amplify CLIが最新バージョンであることを確認
3. `npx ampx sandbox --debug` でデバッグ情報を確認

### 開発サーバーがポート3000で起動しない

別のプロセスがポート3000を使用している可能性があります：

```bash
# ポート3000を使用しているプロセスを確認
lsof -i :3000

# 別のポートで起動
npm run dev -- -p 3001
```

## ライセンス

[ライセンス情報をここに記載]
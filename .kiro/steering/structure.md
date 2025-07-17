# プロジェクト構造と組織

## ディレクトリ構造

```
nomi-nomi/
├── .kiro/                  # Kiro AIアシスタント設定
├── amplify/                # AWS Amplifyバックエンド設定
│   ├── auth/               # 認証設定
│   ├── data/               # データモデルとスキーマ
│   └── backend.ts          # バックエンド定義
├── app/                    # Next.js App Routerコンポーネント
│   ├── api/                # APIルート
│   ├── (routes)/           # アプリケーションルート/ページ
│   ├── components/         # 共有UIコンポーネント
│   ├── hooks/              # カスタムReactフック
│   ├── lib/                # ユーティリティ関数とヘルパー
│   ├── app.css             # グローバルCSS
│   ├── globals.css         # グローバルスタイル
│   ├── layout.tsx          # ルートレイアウトコンポーネント
│   └── page.tsx            # ホームページコンポーネント
├── public/                 # 静的アセット
└── [設定ファイル]           # 各種設定ファイル
```

## 主要ファイル

- `amplify/backend.ts`: メインのバックエンド設定ファイル
- `amplify/data/resource.ts`: データモデルとスキーマ定義
- `amplify/auth/resource.ts`: 認証設定
- `app/layout.tsx`: すべてのページをラップするルートレイアウトコンポーネント
- `app/page.tsx`: メインアプリケーションページ/エントリーポイント
- `package.json`: プロジェクトの依存関係とスクリプト

## アーキテクチャパターン

### フロントエンドアーキテクチャ

- **App Routerパターン**: ルーティングにNext.js App Routerを使用
- **クライアントコンポーネント**: クライアント側のインタラクティブ性のための"use client"ディレクティブを持つコンポーネント
- **サーバーコンポーネント**: サーバー上でレンダリングされるデフォルトのコンポーネント
- **レスポンシブデザイン**: Tailwind CSSを使用したモバイルファーストアプローチ

### バックエンドアーキテクチャ

- **Amplify Gen2**: TypeScriptを使用したインフラストラクチャのコード定義
- **データモデル**: `amplify/data/resource.ts`で定義
- **認証**: `amplify/auth/resource.ts`で設定
- **API統合**: データベース操作にAmplify Dataクライアントを使用

### 状態管理

- **Reactフック**: Reactの組み込み状態管理をフックで使用
- **Context API**: 必要に応じてグローバル状態に使用
- **Amplify Dataクライアント**: データの取得と変更に使用

## 命名規則

- **ファイルとフォルダ**: ファイルとフォルダ名にはケバブケース（kebab-case）を使用
- **コンポーネント**: コンポーネント名にはパスカルケース（PascalCase）を使用
- **関数**: 関数名にはキャメルケース（camelCase）を使用
- **TypeScript型**: 型とインターフェース名にはパスカルケース（PascalCase）を使用
- **CSSクラス**: CSSクラス名にはケバブケース（kebab-case）を使用

## ベストプラクティス

- 関連するファイルを同じディレクトリにグループ化する
- コンポーネントは単一の責任に焦点を当てる
- 再利用可能なロジックはカスタムフックに抽出する
- ユーティリティ関数は`app/lib`ディレクトリに配置する
- 共有コンポーネントは`app/components`ディレクトリに保存する
- ルーティングにはNext.js App Routerの規則に従う
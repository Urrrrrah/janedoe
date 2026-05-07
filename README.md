# PMS システム

## 概要

本プロジェクトは、Next.js を用いて開発した業務向けの管理システムです。

ユーザー管理、ログイン認証、データ登録・更新機能などを実装しており、フロントエンドからバックエンドまで TypeScript による型安全な構成を意識して開発しています。

現在も継続的に改善・機能追加を行っています。

---

# 使用技術

## Frontend

- Next.js (App Router)
- React
- TypeScript
- React Hook Form
- Zod

## Backend

- Next.js Route Handler
- Prisma ORM
- MySQL

## Authentication

- Auth.js
- Session Authentication

---

# 主な機能

- ログイン認証
- セッション管理
- ユーザー登録
- ユーザー更新
- バリデーションチェック
- 権限制御
- CRUD 処理

---

# プロジェクト構成

```text
app/
 ├── api/
 ├── login/
 ├── pms/
 ├── service/
 └── types/

lib/
 ├── prisma.ts
 └── auth.ts
```

---

# 工夫した点

## 型安全を意識した設計

TypeScript と Zod を組み合わせることで、フロントエンド・バックエンド双方で入力値の整合性を保証しています。

## Service 層による責務分離

API Route にロジックを集中させず、Service 層へ分離することで保守性を向上させています。

## セッションベースの認証制御

未ログイン状態でのアクセス制限を実装し、認証状態に応じた画面遷移を行っています。

---

# 今後改善予定の内容

- エラーハンドリングの強化
- UI/UX の改善
- テストコード追加
- Docker 対応
- CI/CD 対応
- 権限制御の細分化

---

# 起動方法

## 1. リポジトリを clone

```bash
git clone <repository-url>
```

## 2. パッケージインストール

```bash
npm install
```

## 3. 環境変数設定

`.env` ファイルを作成し、必要な環境変数を設定してください。

例:

```env
DATABASE_URL=
AUTH_SECRET=
```

## 4. Prisma 実行

```bash
npx prisma generate
npx prisma migrate dev
```

## 5. 開発サーバー起動

```bash
npm run dev
```

---

# 初期管理者アカウント

seed 実行時に、初期管理者ユーザーを自動生成できます。

`.env` に以下を設定してください。

```env
DATABASE_URL=
NEXTAUTH_URL=
SEED_ADMIN_PASSWORD="admin123"
SEED_ADMIN_EMAIL="originadmin@janedoe.com"
```

seed 実行:

```bash
npx prisma db seed
```

作成される管理者アカウント:

- Email: `originadmin@janedoe.com`
- Password: `admin123`

※ 本番環境では必ず安全なパスワードへ変更してください。

---

# 補足

本プロジェクトは個人学習および技術力向上を目的として開発しています。

実務での開発経験を踏まえ、保守性・可読性・型安全性を意識した設計を行っています。


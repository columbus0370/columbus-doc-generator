# Columbus AI 書類ジェネレーター

## 概要

業務書類（見積書・提案書・業務レポート）をAIで自動生成するWebアプリ。
必要事項を入力するだけで、プロ品質の書類が数秒で完成し、PDFでダウンロードできます。

## デモ

- フロントエンド: https://columbus-doc-generator.vercel.app （デプロイ後に更新）
- バックエンド API: https://columbus-doc-generator-api.onrender.com

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | React 18 (Vite) + Tailwind CSS |
| バックエンド | Python / FastAPI |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| PDF生成 | fpdf2（日本語フォント対応） |
| バックエンドデプロイ | Render.com |
| フロントエンドデプロイ | Vercel |

## 本番環境デプロイ手順

### 1. GitHubにプッシュ

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/<your-username>/columbus-doc-generator.git
git push -u origin main
```

### 2. Render.com バックエンドデプロイ

1. https://render.com でサインイン
2. 「New」→「Web Service」→ GitHubリポジトリを接続
3. `render.yaml` が自動検出される（または手動で設定）
4. 「Environment Variables」で以下を設定:
   - `ANTHROPIC_API_KEY`: Anthropic APIキー
   - `CORS_ORIGINS`: フロントエンドのVercel URL（例: `https://columbus-doc-generator.vercel.app`）
5. デプロイ完了後、サービスURLをメモ（例: `https://columbus-doc-generator-api.onrender.com`）

### 3. Vercel フロントエンドデプロイ

1. https://vercel.com でサインイン
2. 「New Project」→ GitHubリポジトリを接続
3. 「Root Directory」に `frontend` を指定
4. 「Environment Variables」で以下を設定:
   - `VITE_API_URL`: RenderのバックエンドURL（例: `https://columbus-doc-generator-api.onrender.com`）
5. デプロイ

---

## ローカル開発

### 前提条件

- Node.js 18+
- Python 3.11+
- Anthropic API キー

### バックエンド

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

cp ../.env.example .env
# .env に ANTHROPIC_API_KEY を設定

uvicorn main:app --reload --port 8081
```

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開く。

## ディレクトリ構成

```
columbus-doc-generator/
├── frontend/
│   ├── vercel.json                # Vercel SPAルーティング設定
│   ├── .env.production            # 本番環境変数（VITE_API_URL）
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── DocumentForm.jsx   # 入力フォーム
│       │   ├── PreviewPanel.jsx   # プレビュー表示
│       │   └── DownloadButton.jsx # PDFダウンロード
│       └── api/
│           └── generate.js        # APIクライアント
├── backend/
│   ├── main.py                    # FastAPIエントリーポイント
│   ├── requirements.txt
│   ├── routers/generate.py        # APIルーター
│   └── services/
│       ├── claude.py              # Claude API連携
│       └── pdf.py                 # PDF生成（fpdf2、日本語対応）
├── render.yaml                    # Render.com デプロイ設定
└── .env.example
```

## 開発者

Columbus | AI × 業務改善ツール開発

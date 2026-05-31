# Columbus AI 書類ジェネレーター

## 概要

業務書類（見積書・提案書・業務レポートなど）をAIで自動生成するWebアプリ。
ステップ形式のウィザードに沿って入力するだけで、プロ品質のビジネス書類がHTMLで生成され、PDFでダウンロードできます。

## デモ

- フロントエンド: https://columbus-doc-generator.vercel.app
- バックエンド API: https://columbus-doc-generator-api.onrender.com

## 主な機能

- **ウィザード形式の入力**: 書類種別・宛先・明細・詳細を段階的に入力
- **AI書類生成**: Claude API により日本語ビジネス書類を自動生成
- **インブラウザ編集**: 生成後にツールバーで内容を直接編集可能
- **PDFダウンロード**: 生成書類をPDFとして印刷・保存
- **事業者情報の永続化**: 自社名・住所・ロゴをlocalStorageに保存し、書類に自動反映
- **ロゴ挿入**: アップロードしたロゴ画像を書類ヘッダーに埋め込み
- **レートリミット**: APIへの過剰リクエストをサーバー側で制御

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | React 18 (Vite) + Tailwind CSS |
| バックエンド | Python / FastAPI |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| PDF生成 | fpdf2（日本語フォント: Noto Sans JP） |
| レートリミット | slowapi |
| バックエンドデプロイ | Render.com |
| フロントエンドデプロイ | Vercel |

## ディレクトリ構成

```
columbus-doc-generator/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/
│   │   │   └── generate.js              # APIクライアント
│   │   ├── components/
│   │   │   ├── wizard/
│   │   │   │   ├── WizardContainer.jsx  # ウィザード全体管理
│   │   │   │   ├── WizardProgress.jsx   # 進捗バー
│   │   │   │   ├── StepBasicInfo.jsx    # 書類種別・宛先入力
│   │   │   │   ├── StepQuestion.jsx     # 詳細質問
│   │   │   │   ├── StepLineItems.jsx    # 明細行入力
│   │   │   │   ├── StepTextInput.jsx    # テキスト入力
│   │   │   │   └── StepConfirm.jsx      # 確認・送信
│   │   │   ├── DocumentEditor.jsx       # インブラウザHTMLエディタ
│   │   │   ├── EditorToolbar.jsx        # 編集ツールバー
│   │   │   ├── BusinessProfileModal.jsx # 事業者情報モーダル
│   │   │   └── DownloadButton.jsx       # PDFダウンロード
│   │   ├── hooks/
│   │   │   └── useBusinessProfile.js    # localStorage永続化フック
│   │   ├── utils/
│   │   │   ├── logoInjector.js          # ロゴ画像の書類への挿入
│   │   │   └── htmlHelpers.js           # HTML操作ユーティリティ
│   │   └── config/
│   │       └── wizardConfig.js          # ウィザードステップ定義
│   ├── vercel.json                      # Vercel SPAルーティング設定
│   └── .env.production                  # 本番環境変数 (VITE_API_URL)
├── backend/
│   ├── main.py                          # FastAPIエントリーポイント・CORS・セキュリティヘッダー
│   ├── limiter.py                       # slowapi レートリミット設定
│   ├── requirements.txt
│   ├── routers/
│   │   └── generate.py                  # 書類生成エンドポイント
│   └── services/
│       ├── claude.py                    # Claude API連携
│       └── pdf.py                       # PDF生成（fpdf2・日本語対応）
├── render.yaml                          # Render.com デプロイ設定
└── .env.example
```

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

## 本番環境デプロイ

### 1. Render.com バックエンドデプロイ

1. https://render.com でサインイン
2. 「New」→「Web Service」→ GitHubリポジトリを接続
3. `render.yaml` が自動検出される
4. 「Environment Variables」で以下を設定:
   - `ANTHROPIC_API_KEY`: Anthropic APIキー
   - `CORS_ORIGINS`: フロントエンドのVercel URL（例: `https://columbus-doc-generator.vercel.app`）
   - `ENV`: `production`
5. デプロイ完了後、サービスURLをメモ

### 2. Vercel フロントエンドデプロイ

1. https://vercel.com でサインイン
2. 「New Project」→ GitHubリポジトリを接続
3. 「Root Directory」に `frontend` を指定
4. 「Environment Variables」で以下を設定:
   - `VITE_API_URL`: RenderのバックエンドURL
5. デプロイ

---

## 開発者

Columbus | AI × 業務改善ツール開発

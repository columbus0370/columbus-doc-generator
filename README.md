# Columbus AI 書類ジェネレーター

> 質問に答えるだけで見積書・提案書・業務レポートをAIが自動生成

🔗 **デモ**: https://columbus-doc-generator.vercel.app/
📦 **Backend**: Python / FastAPI / Render.com
🎨 **Frontend**: React 18 / Vite / Tailwind CSS
🤖 **AI**: Anthropic Claude API

## スクリーンショット

ホーム画面
<img width="1865" height="814" alt="image" src="https://github.com/user-attachments/assets/8ebb59db-5069-4a5d-af20-5e85b6aea3d0" />

事業者情報画面
<img width="833" height="681" alt="image" src="https://github.com/user-attachments/assets/cf075742-47a9-415f-b165-abedb0902de7" />

質問事項画面
<img width="1109" height="641" alt="image" src="https://github.com/user-attachments/assets/a4edd722-088f-458b-8e0b-a6fe6c35d318" />

明細記入画面
<img width="1254" height="715" alt="image" src="https://github.com/user-attachments/assets/19f9fd91-82be-4d43-a3a7-c070e15ae9de" />

確認画面
<img width="1142" height="713" alt="image" src="https://github.com/user-attachments/assets/eb0baeaa-1df6-4406-acb3-2e5f436c25f6" />

AI生成中画面
<img width="1087" height="549" alt="image" src="https://github.com/user-attachments/assets/57ffc2a8-5999-4d7f-b3e2-58029580b377" />

プレビュー画面
<img width="1872" height="803" alt="image" src="https://github.com/user-attachments/assets/2aec54b9-683b-471f-9345-fea38f0dece1" />

編集画面
<img width="1801" height="668" alt="image" src="https://github.com/user-attachments/assets/14b7e9ae-8664-4e6d-aa69-315d9f2b63b4" />

印刷、PDF出力画面
<img width="1603" height="840" alt="image" src="https://github.com/user-attachments/assets/410868b7-51dc-4681-88e3-6a3fbef75781" />

## 機能

- ウィザード形式で3種類の書類を生成（見積書・提案書・業務レポート）
- ブラウザ上でプレビュー・WYSIWYG編集
- ロゴ画像のアップロード・自動埋め込み
- 印刷 / PDF保存対応
- 事業者情報のローカル保存（localStorage）

## 技術的な工夫

- Claude API の prompt caching で応答速度を最適化
- SSRF防止・レート制限・CSPヘッダーなどセキュリティ対策済み
- iframeサンドボックスによる安全なHTML表示

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

## セットアップ（ローカル開発）

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

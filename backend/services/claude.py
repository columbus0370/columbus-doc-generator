import os
from datetime import date
import anthropic

_client: anthropic.Anthropic | None = None

_BASE_STYLE = """
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Yu Gothic','Meiryo','Hiragino Sans','MS PGothic',sans-serif;
  font-size: 12px; color: #222; background: #f0f2f5; padding: 24px 16px;
}
.doc {
  max-width: 800px; margin: 0 auto; background: #fff;
  padding: 36px 40px; box-shadow: 0 2px 12px rgba(0,0,0,.08);
}
h1 { font-size: 22px; color: #1a3a5c; }
h2 { font-size: 14px; color: #1a3a5c; border-bottom: 2px solid #1a3a5c; padding-bottom: 4px; margin: 20px 0 10px; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
th { background: #1a3a5c; color: #fff; padding: 7px 8px; font-size: 11px; text-align: center; }
td { padding: 6px 8px; border-bottom: 1px solid #e0e5ec; font-size: 11px; }
tr:nth-child(even) td { background: #f7f9fc; }
.right { text-align: right; }
.total-row td { font-weight: bold; background: #1a3a5c !important; color: #fff; font-size: 13px; }
.label { color: #555; font-size: 11px; }
.accent { color: #1a3a5c; font-weight: bold; }
.divider { height: 2px; background: linear-gradient(to right, #1a3a5c, #4a90d9, transparent); margin: 16px 0; }
.doc-logo-area { min-height: 0; margin-bottom: 8px; }
.doc-logo { max-height: 60px; max-width: 200px; object-fit: contain; display: block; }
@media print {
  body { background: #fff; padding: 0; }
  .doc { box-shadow: none; padding: 15mm 20mm; }
  .no-print { display: none; }
}
@media (max-width: 600px) {
  .doc { padding: 20px 16px; }
  .two-col { flex-direction: column; }
}
</style>
"""

_ESTIMATE_SYSTEM = f"""あなたは日本語の業務文書HTMLを生成するアシスタントです。
ユーザーの情報から「御見積書」の完全なHTMLを生成してください。

## 共通スタイル（必ず <head> に含めること）
{_BASE_STYLE}

## 見積書の構成
1. ヘッダー: 左=会社名ブロック（#1a3a5c背景・白文字）、右=「御 見 積 書」（20px bold・letter-spacing:4px）＋発行日・見積番号・有効期限。ヘッダー左ブロックの最上部に `<div class="doc-logo-area"></div>` を空で配置すること。
2. 区切り線（.divider）
3. 2カラム: 左=宛先（会社名・担当者）、右=発行者（会社名・住所・TEL・担当者）
4. 御見積金額ボックス: 背景#f0f4f9・border #1a3a5c、左=件名、右=合計金額（20px bold）
5. 明細テーブル: 品名 / 摘要 / 数量 / 単位 / 単価 / 金額 / 税率（列幅はcolgroup指定）
6. 合計欄（右寄せ）: 小計・消費税10%・合計（.total-row）
7. 備考欄: 納期・支払条件・特記事項

## 出力ルール
- <!DOCTYPE html> から </html> まで完全な1ファイルのHTML
- 外部CSSライブラリ不可。JSは不要（静的HTML）
- コードブロック記法（```）不要。HTMLをそのまま出力
- 業務内容から明細行を推定し、合計が入力金額に近くなるよう構成すること
"""

_PROPOSAL_SYSTEM = f"""あなたは日本語の業務文書HTMLを生成するアシスタントです。
ユーザーの情報から「提案書」の完全な1ページHTMLを生成してください。

## 共通スタイル（必ず <head> に含めること）
{_BASE_STYLE}

## 提案書の構成（スクロール1ページ、セクション区切りで表示）
1. カバーブロック: background #1a3a5c・白文字・padding 32px、提案タイトル（22px）・提案先・日付・担当者。ブロック内の先頭に `<div class="doc-logo-area"></div>` を空で配置すること。
2. エグゼクティブサマリー: 2〜3文の概要テキスト
3. 課題セクション（h2）: 2〜3件のカード（border-left:3px solid #e53935）、タイトル＋説明文
4. 解決策セクション（h2）: 2〜3件のカード（border-left:3px solid #1a3a5c）、ステップ番号＋タイトル＋説明
5. 費用・スケジュールセクション（h2）: 費用概算テーブル＋想定スケジュール（3〜4行）
6. お問い合わせ欄: 担当者・TEL・Email・会社名

## 出力ルール
- <!DOCTYPE html> から </html> まで完全な1ファイルのHTML
- 外部ライブラリ不可。JSは不要（静的HTML）
- コードブロック記法（```）不要。HTMLをそのまま出力
- 提案内容から課題・解決策・スケジュールを論理的に補完すること
"""

_REPORT_SYSTEM = f"""あなたは日本語の業務文書HTMLを生成するアシスタントです。
ユーザーの情報から「月次業務レポート」の完全なHTMLを生成してください。

## 共通スタイル（必ず <head> に含めること）
{_BASE_STYLE}

## レポートの構成
1. ヘッダー: background #1a3a5c・白文字、「業務月次レポート」タイトル＋対象期間、右側に作成者・提出先・作成日。ヘッダー内の先頭に `<div class="doc-logo-area"></div>` を空で配置すること。
2. KPI 4指標: 横並びボックス（各 background:#f0f4f9、数値18px bold #1a3a5c、前月比バッジ）
3. 売上推移サマリー: シンプルなテーブル（月 / 実績 / 目標 / 達成率 の6ヶ月分）
4. プロジェクト進捗テーブル: プロジェクト名 / 担当 / 期限 / 進捗(CSSバー) / 状況 / 備考
   - 進捗バー: <div style="background:#e0e7ef;height:6px"><div style="background:#1a3a5c;width:{{n}}%;height:6px"></div></div>
5. 課題・リスク: 優先度（高=赤・中=橙・低=緑）付きの箇条書きテーブル
6. 来月の目標と施策: 売上目標＋番号付きアクションリスト

## 出力ルール
- <!DOCTYPE html> から </html> まで完全な1ファイルのHTML
- 外部ライブラリ不可（Chart.jsも使わない）。JSは不要（静的HTML）
- コードブロック記法（```）不要。HTMLをそのまま出力
- レポート内容からKPI・プロジェクト・課題・施策を適切に補完すること
- 必ず </html> まで出力を完結させること（途中で切れないようコンパクトにまとめる）
"""

_SYSTEM_PROMPTS = {
    "estimate": _ESTIMATE_SYSTEM,
    "proposal": _PROPOSAL_SYSTEM,
    "report":   _REPORT_SYSTEM,
}

_USER_PROMPTS = {
    "estimate": """以下の情報から「御見積書」HTMLを生成してください。

会社名（発行者）: {company_name}
顧客名（宛先）: {client_name}
発行日: {today}
業務内容・件名: {content}
金額目安: {amount}円
備考: {notes}""",

    "proposal": """以下の情報から「提案書」HTMLを生成してください。

会社名（発行者）: {company_name}
提案先: {client_name}
提案日: {today}
提案内容・背景: {content}
費用感: {amount}円
備考: {notes}""",

    "report": """以下の情報から「月次業務レポート」HTMLを生成してください。

作成者（部署・担当）: {company_name}
提出先: {client_name}
作成日: {today}
レポート内容・期間・主要トピック: {content}
備考: {notes}""",
}

TITLES = {
    "estimate": "見積書",
    "proposal": "提案書",
    "report":   "業務レポート",
}


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY が設定されていません。backend/.env を確認してください。")
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


def _strip_code_fence(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("```"):
        lines = stripped.split("\n")
        start = 1
        end = len(lines) - 1 if lines[-1].strip().startswith("```") else len(lines)
        return "\n".join(lines[start:end])
    return stripped


def generate_document(
    doc_type: str,
    client_name: str,
    company_name: str,
    content: str,
    amount: str,
    notes: str,
) -> dict:
    system_prompt = _SYSTEM_PROMPTS.get(doc_type)
    if not system_prompt:
        raise ValueError(f"Unknown doc_type: {doc_type}")

    today = date.today().strftime("%Y年%m月%d日")
    user_prompt = _USER_PROMPTS[doc_type].format(
        client_name=client_name,
        company_name=company_name or "（自社名未入力）",
        content=content,
        amount=amount or "未定",
        notes=notes or "なし",
        today=today,
    )

    message = _get_client().messages.create(
        model="claude-opus-4-7",
        max_tokens=4096,
        system=[
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": user_prompt}],
    )

    if not message.content:
        raise RuntimeError("Claude API returned empty content")
    text_block = next((b for b in message.content if b.type == "text"), None)
    if text_block is None:
        raise RuntimeError("Claude API returned no text content")
    generated_html = _strip_code_fence(text_block.text)

    return {
        "generated_text": generated_html,
        "title": TITLES.get(doc_type, "文書"),
    }

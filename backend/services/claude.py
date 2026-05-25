import os
from datetime import date
import anthropic

_client: anthropic.Anthropic | None = None

PROMPTS = {
    "estimate": """あなたはプロの業務文書作成者です。
以下の情報をもとに、日本語の正式な見積書を作成してください。

顧客名：{client_name}
担当者名：{company_name}
業務内容：{content}
金額：{amount}円
備考：{notes}
今日の日付：{today}

出力フォーマット：
- 件名・タイトル
- 日付（今日の日付）
- 見積もり内容（箇条書き）
- 合計金額
- 有効期限（発行から30日）
- 備考欄

丁寧で信頼感のある文体で作成してください。""",

    "proposal": """あなたはプロの業務文書作成者です。
以下の情報をもとに、日本語の正式な提案書を作成してください。

顧客名：{client_name}
担当者名：{company_name}
提案内容：{content}
金額：{amount}円（任意）
備考：{notes}
今日の日付：{today}

出力フォーマット：
- 提案の背景・課題
- 提案内容の詳細
- 期待される効果
- スケジュール（想定）
- 費用感
- 次のステップ

説得力があり、顧客のメリットが伝わる文体で作成してください。""",

    "report": """あなたはプロの業務文書作成者です。
以下の情報をもとに、日本語の業務レポートを作成してください。

対象：{client_name}
担当者名：{company_name}
レポート内容：{content}
備考：{notes}
今日の日付：{today}

出力フォーマット：
- エグゼクティブサマリー（3行以内）
- 詳細レポート
- 課題・改善点
- 次のアクション

簡潔で読みやすいビジネス文体で作成してください。""",
}

TITLES = {
    "estimate": "見積書",
    "proposal": "提案書",
    "report": "業務レポート",
}


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY が設定されていません。backend/.env を確認してください。")
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


def generate_document(
    doc_type: str,
    client_name: str,
    company_name: str,
    content: str,
    amount: str,
    notes: str,
) -> dict:
    prompt_template = PROMPTS.get(doc_type)
    if not prompt_template:
        raise ValueError(f"Unknown doc_type: {doc_type}")

    today = date.today().strftime("%Y年%m月%d日")
    prompt = prompt_template.format(
        client_name=client_name,
        company_name=company_name or "未記入",
        content=content,
        amount=amount or "未定",
        notes=notes or "なし",
        today=today,
    )

    message = _get_client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system="あなたは日本語の業務文書作成の専門家です。正確で丁寧な文書を作成してください。",
        messages=[{"role": "user", "content": prompt}],
    )

    return {
        "generated_text": message.content[0].text,
        "title": TITLES.get(doc_type, "文書"),
    }

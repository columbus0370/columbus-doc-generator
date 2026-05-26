import re
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_FONT_DIR = Path(__file__).parent.parent / "fonts"
_NOTO_REGULAR = _FONT_DIR / "NotoSansJP-Regular.ttf"
_NOTO_BOLD    = _FONT_DIR / "NotoSansJP-Bold.ttf"
_EXTRACTED_TTF = _FONT_DIR / "cjk_extracted.ttf"

_PRINT_CSS = """
@page { size: A4; margin: 12mm 15mm; }
body { background: white !important; padding: 0 !important; }
.no-print, .toolbar, nav, button { display: none !important; }
.doc { box-shadow: none !important; padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
"""


def _find_ttc_source() -> str | None:
    candidates = [
        r"C:\Windows\Fonts\msgothic.ttc",
        r"C:\Windows\Fonts\meiryo.ttc",
        r"C:\Windows\Fonts\YuGothM.ttc",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    ]
    return next((p for p in candidates if Path(p).exists()), None)


def _get_cjk_ttf() -> Path | None:
    if _NOTO_REGULAR.exists():
        return _NOTO_REGULAR
    if _EXTRACTED_TTF.exists():
        return _EXTRACTED_TTF
    ttc_path = _find_ttc_source()
    if not ttc_path:
        return None
    try:
        from fontTools.ttLib import TTCollection
        _FONT_DIR.mkdir(parents=True, exist_ok=True)
        TTCollection(ttc_path).fonts[0].save(str(_EXTRACTED_TTF))
        logger.info("CJK font extracted to %s", _EXTRACTED_TTF)
        return _EXTRACTED_TTF
    except Exception as e:
        logger.warning("Failed to extract CJK font: %s", e)
        return None


_CJK_TTF: Path | None = _get_cjk_ttf()


# ──────────────────────────────────────────────
# WeasyPrint (Render.com Linux)
# ──────────────────────────────────────────────

def _inject_weasyprint_fonts(html: str) -> str:
    if not _NOTO_REGULAR.exists():
        return html
    regular_uri = _NOTO_REGULAR.as_uri()
    bold_uri    = _NOTO_BOLD.as_uri() if _NOTO_BOLD.exists() else regular_uri
    font_css = f"""<style>
@font-face {{ font-family: 'NotoSansJP'; src: url('{regular_uri}') format('truetype'); font-weight: normal; }}
@font-face {{ font-family: 'NotoSansJP'; src: url('{bold_uri}') format('truetype'); font-weight: bold; }}
body, * {{ font-family: 'NotoSansJP','Yu Gothic','Meiryo',sans-serif !important; }}
</style>"""
    if "</head>" in html:
        return html.replace("</head>", font_css + "\n</head>", 1)
    return font_css + html


def _generate_with_weasyprint(html_content: str) -> bytes:
    from weasyprint import HTML, CSS
    return HTML(string=_inject_weasyprint_fonts(html_content)).write_pdf(
        stylesheets=[CSS(string=_PRINT_CSS)]
    )


# ──────────────────────────────────────────────
# Reportlab fallback (Windows dev environment)
# ──────────────────────────────────────────────

_RL_FONT_R = "CJK-R"
_RL_FONT_B = "CJK-B"
_RL_FONTS_REGISTERED = False


def _register_rl_fonts() -> bool:
    global _RL_FONTS_REGISTERED
    if _RL_FONTS_REGISTERED:
        return True
    if not _CJK_TTF:
        return False
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    try:
        pdfmetrics.registerFont(TTFont(_RL_FONT_R, str(_CJK_TTF)))
        bold_ttf = _NOTO_BOLD if _NOTO_BOLD.exists() else _CJK_TTF
        pdfmetrics.registerFont(TTFont(_RL_FONT_B, str(bold_ttf)))
        pdfmetrics.registerFontFamily(_RL_FONT_R, normal=_RL_FONT_R, bold=_RL_FONT_B)
        _RL_FONTS_REGISTERED = True
        return True
    except Exception as e:
        logger.warning("RL font registration failed: %s", e)
        return False


def _html_to_paragraphs(html: str) -> list[dict]:
    """HTML からシンプルな段落リストを抽出する。"""
    # script/style を除去
    html = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)

    items: list[dict] = []

    def _clean(s: str) -> str:
        s = re.sub(r"<[^>]+>", "", s)
        s = re.sub(r"&nbsp;", " ", s)
        s = re.sub(r"&amp;", "&", s)
        s = re.sub(r"&lt;", "<", s)
        s = re.sub(r"&gt;", ">", s)
        return s.strip()

    # テーブルを先に抽出
    tables = re.findall(r"<table[^>]*>(.*?)</table>", html, re.DOTALL | re.IGNORECASE)
    table_positions = [(m.start(), m.end()) for m in re.finditer(
        r"<table[^>]*>.*?</table>", html, re.DOTALL | re.IGNORECASE)]

    # テーブルをプレースホルダーに置き換え
    html_no_tables = re.sub(r"<table[^>]*>.*?</table>", "<<TABLE>>", html,
                             flags=re.DOTALL | re.IGNORECASE)

    non_table_parts = html_no_tables.split("<<TABLE>>")

    for i, part in enumerate(non_table_parts):
        # 見出し
        for hm in re.finditer(r"<h([1-6])[^>]*>(.*?)</h\1>", part, re.DOTALL | re.IGNORECASE):
            level = int(hm.group(1))
            text = _clean(hm.group(2))
            if text:
                items.append({"type": "h", "level": level, "text": text})

        # 段落 / p
        for pm in re.finditer(r"<p[^>]*>(.*?)</p>", part, re.DOTALL | re.IGNORECASE):
            text = _clean(pm.group(1))
            if text:
                items.append({"type": "p", "text": text})

        # テーブル（次のテーブルを挿入）
        if i < len(tables):
            rows = []
            for rm in re.finditer(r"<tr[^>]*>(.*?)</tr>", tables[i], re.DOTALL | re.IGNORECASE):
                cells = [_clean(c) for c in re.findall(
                    r"<t[dh][^>]*>(.*?)</t[dh]>", rm.group(1), re.DOTALL | re.IGNORECASE)]
                if any(cells):
                    is_header = bool(re.search(r"<th", rm.group(1), re.IGNORECASE))
                    rows.append({"cells": cells, "header": is_header})
            if rows:
                items.append({"type": "table", "rows": rows})

    return items


def _generate_with_reportlab(html_content: str) -> bytes:
    from io import BytesIO
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.colors import HexColor, white
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    )
    from reportlab.lib import colors

    has_cjk = _register_rl_fonts()
    font_r = _RL_FONT_R if has_cjk else "Helvetica"
    font_b = _RL_FONT_B if has_cjk else "Helvetica-Bold"

    navy = HexColor("#1a3a5c")
    light_bg = HexColor("#f7f9fc")

    styles = {
        "h1": ParagraphStyle("h1", fontName=font_b, fontSize=16, textColor=navy,
                              spaceAfter=8, spaceBefore=4),
        "h2": ParagraphStyle("h2", fontName=font_b, fontSize=12, textColor=navy,
                              spaceAfter=6, spaceBefore=12),
        "h3": ParagraphStyle("h3", fontName=font_b, fontSize=10, textColor=navy,
                              spaceAfter=4, spaceBefore=8),
        "p":  ParagraphStyle("p",  fontName=font_r, fontSize=9,
                              spaceAfter=4, leading=14),
    }

    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=15*mm, rightMargin=15*mm,
        topMargin=12*mm, bottomMargin=12*mm,
    )

    story = []
    paragraphs = _html_to_paragraphs(html_content)

    for item in paragraphs:
        if item["type"] == "h":
            level = item["level"]
            key = f"h{min(level, 3)}"
            story.append(Paragraph(item["text"], styles[key]))
            if level <= 2:
                story.append(HRFlowable(width="100%", thickness=1 if level == 1 else 0.5,
                                         color=navy, spaceAfter=4))
        elif item["type"] == "p":
            story.append(Paragraph(item["text"], styles["p"]))
        elif item["type"] == "table":
            rows = item["rows"]
            if not rows:
                continue
            # 列数を統一
            max_cols = max(len(r["cells"]) for r in rows)
            table_data = []
            for row in rows:
                cells = row["cells"]
                # 不足列を空文字で補完
                while len(cells) < max_cols:
                    cells.append("")
                table_data.append([Paragraph(c, styles["p"]) for c in cells])

            col_w = (A4[0] - 30*mm) / max_cols
            tbl = Table(table_data, colWidths=[col_w] * max_cols, repeatRows=1)

            ts = TableStyle([
                ("FONTNAME",     (0, 0), (-1, -1), font_r),
                ("FONTSIZE",     (0, 0), (-1, -1), 8),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [white, light_bg]),
                ("LINEBELOW",    (0, 0), (-1, -1), 0.3, HexColor("#dde0e8")),
                ("TOPPADDING",   (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING",(0, 0), (-1, -1), 3),
                ("LEFTPADDING",  (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ])
            # ヘッダー行を navy 背景・白文字に
            for i, row in enumerate(rows):
                if row["header"]:
                    ts.add("BACKGROUND", (0, i), (-1, i), navy)
                    ts.add("FONTNAME",   (0, i), (-1, i), font_b)
                    ts.add("TEXTCOLOR",  (0, i), (-1, i), white)
                    ts.add("FONTSIZE",   (0, i), (-1, i), 8)
            tbl.setStyle(ts)
            story.append(tbl)
            story.append(Spacer(1, 6))

    if not story:
        story.append(Paragraph("(内容なし)", styles["p"]))

    doc.build(story)
    return buf.getvalue()


# ──────────────────────────────────────────────
# Public entry point
# ──────────────────────────────────────────────

def generate_pdf(html_content: str) -> bytes:
    try:
        return _generate_with_weasyprint(html_content)
    except Exception as e:
        logger.warning("WeasyPrint failed (%s), falling back to reportlab", e)
        return _generate_with_reportlab(html_content)

import re
import sys
import logging
from pathlib import Path
from fpdf import FPDF
from fpdf.enums import XPos, YPos

logger = logging.getLogger(__name__)

L_MARGIN = 20
R_MARGIN = 20
PAGE_W = 170  # 210 - 20 - 20


def _find_fonts() -> tuple[str, str]:
    """OS問わず日本語フォントを見つける。見つからない場合はNoneを返す。"""
    candidates = {
        "regular": [
            # Render.com bundled fonts (downloaded at build time)
            str(Path(__file__).parent.parent / "fonts" / "NotoSansJP-Regular.ttf"),
            # Windows
            r"C:\Windows\Fonts\msgothic.ttc",
            r"C:\Windows\Fonts\YuGothR.ttc",
            # Linux (Render.com / Ubuntu)
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
            "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
            "/usr/share/fonts/noto-cjk/NotoSansCJKjp-Regular.otf",
            "/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc",
        ],
        "bold": [
            # Render.com bundled fonts (downloaded at build time)
            str(Path(__file__).parent.parent / "fonts" / "NotoSansJP-Bold.ttf"),
            # Windows
            r"C:\Windows\Fonts\meiryob.ttc",
            r"C:\Windows\Fonts\YuGothB.ttc",
            r"C:\Windows\Fonts\msgothic.ttc",
            # Linux
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
            "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
            "/usr/share/fonts/noto-cjk/NotoSansCJKjp-Bold.otf",
            "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc",
        ],
    }
    regular = next((p for p in candidates["regular"] if Path(p).exists()), None)
    bold = next((p for p in candidates["bold"] if Path(p).exists()), regular)
    return regular, bold


FONT_REGULAR, FONT_BOLD = _find_fonts()
_USE_CJK = FONT_REGULAR is not None


def _cell(pdf: FPDF, w: float, h: float, txt: str) -> None:
    pdf.set_x(L_MARGIN)
    pdf.multi_cell(w, h, txt or " ", new_x=XPos.LEFT, new_y=YPos.NEXT)
    pdf.set_x(L_MARGIN)


def _parse_markdown(text: str) -> list[dict]:
    lines = []
    for line in text.split("\n"):
        s = line.strip()
        if s.startswith("### "):
            lines.append({"type": "h3", "content": s[4:]})
        elif s.startswith("## "):
            lines.append({"type": "h2", "content": s[3:]})
        elif s.startswith("# "):
            lines.append({"type": "h1", "content": s[2:]})
        elif re.match(r"^[-*] ", s):
            lines.append({"type": "li", "content": s[2:]})
        elif re.match(r"^-{3,}$", s):
            lines.append({"type": "hr", "content": ""})
        elif s == "":
            lines.append({"type": "blank", "content": ""})
        else:
            content = re.sub(r"\*\*(.+?)\*\*", r"\1", s)
            content = re.sub(r"\*(.+?)\*", r"\1", content)
            lines.append({"type": "p", "content": content})
    return lines


def _html_to_text(html: str) -> str:
    text = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<br\s*/?>", "\n", text)
    text = re.sub(r"<li[^>]*>", "- ", text)
    text = re.sub(r"</li>", "\n", text)
    text = re.sub(r"<[uo]l[^>]*>|</[uo]l>", "\n", text)
    text = re.sub(r"<h1[^>]*>", "# ", text)
    text = re.sub(r"<h2[^>]*>", "\n## ", text)
    text = re.sub(r"<h3[^>]*>", "\n### ", text)
    text = re.sub(r"</h[1-6]>", "\n", text)
    text = re.sub(r"<strong[^>]*>(.+?)</strong>", r"\1", text, flags=re.DOTALL)
    text = re.sub(r"<b[^>]*>(.+?)</b>", r"\1", text, flags=re.DOTALL)
    text = re.sub(r"<em[^>]*>(.+?)</em>", r"\1", text, flags=re.DOTALL)
    text = re.sub(r"<p[^>]*>", "", text)
    text = re.sub(r"</p>", "\n", text)
    text = re.sub(r"<hr[^>]*/?>", "\n---\n", text)
    text = re.sub(r"<thead[^>]*>|</thead>|<tbody[^>]*>|</tbody>", "", text)
    text = re.sub(r"</tr>", "\n", text)
    text = re.sub(r"<tr[^>]*>", "", text)
    text = re.sub(r"<t[dh][^>]*>(.*?)</t[dh]>", r" \1 |", text, flags=re.DOTALL)
    text = re.sub(r"<table[^>]*>|</table>", "\n", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"&lt;", "<", text)
    text = re.sub(r"&gt;", ">", text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def generate_pdf(html_content: str) -> bytes:
    text = _html_to_text(html_content)
    items = _parse_markdown(text)

    pdf = FPDF()
    pdf.add_page()

    if _USE_CJK:
        pdf.add_font("Regular", fname=FONT_REGULAR)
        pdf.add_font("Bold", fname=FONT_BOLD)
        font_r, font_b = "Regular", "Bold"
    else:
        # フォントが見つからない場合はデフォルトフォントで続行（文字化けするが落ちない）
        logger.warning("No CJK font found; using built-in font. Japanese may not render.")
        font_r, font_b = "Helvetica", "Helvetica"

    pdf.set_left_margin(L_MARGIN)
    pdf.set_right_margin(R_MARGIN)
    pdf.set_top_margin(20)
    pdf.set_auto_page_break(auto=True, margin=20)

    for idx, item in enumerate(items):
        t = item["type"]
        c = item["content"]
        pdf.set_left_margin(L_MARGIN)
        pdf.set_x(L_MARGIN)

        try:
            if t == "blank":
                pdf.ln(3)
            elif t == "hr":
                pdf.set_draw_color(74, 158, 255)
                pdf.set_line_width(0.3)
                y = pdf.get_y() + 2
                pdf.line(L_MARGIN, y, 210 - R_MARGIN, y)
                pdf.set_xy(L_MARGIN, y + 4)
            elif t == "h1":
                pdf.set_font(font_b, size=17)
                pdf.set_text_color(13, 21, 48)
                _cell(pdf, PAGE_W, 10, c)
                pdf.set_draw_color(74, 158, 255)
                pdf.set_line_width(0.5)
                pdf.line(L_MARGIN, pdf.get_y(), 210 - R_MARGIN, pdf.get_y())
                pdf.set_xy(L_MARGIN, pdf.get_y() + 5)
            elif t == "h2":
                pdf.set_font(font_b, size=13)
                pdf.set_text_color(30, 50, 100)
                pdf.ln(3)
                pdf.set_x(L_MARGIN)
                _cell(pdf, PAGE_W, 9, c)
                pdf.set_xy(L_MARGIN, pdf.get_y() + 2)
            elif t == "h3":
                pdf.set_font(font_b, size=11)
                pdf.set_text_color(50, 70, 120)
                _cell(pdf, PAGE_W, 8, c)
            elif t == "li":
                pdf.set_font(font_r, size=10)
                pdf.set_text_color(30, 30, 30)
                _cell(pdf, PAGE_W, 7, f"  · {c}")
            else:
                pdf.set_font(font_r, size=10)
                pdf.set_text_color(30, 30, 30)
                _cell(pdf, PAGE_W, 7, c)
        except Exception as e:
            logger.warning("PDF item [%d] type=%s failed: %s | content=%r", idx, t, e, c[:60])
            try:
                pdf.set_left_margin(L_MARGIN)
                pdf.set_x(L_MARGIN)
                pdf.set_font(font_r, size=10)
                pdf.set_text_color(80, 80, 80)
                pdf.multi_cell(PAGE_W, 7, c[:120] if c else " ",
                               new_x=XPos.LEFT, new_y=YPos.NEXT)
            except Exception:
                pass

    try:
        pdf.set_y(-15)
        pdf.set_font(font_r, size=8)
        pdf.set_text_color(150, 150, 150)
        pdf.cell(PAGE_W, 10, "Columbus AI 書類ジェネレーター", align="R",
                 new_x=XPos.RIGHT, new_y=YPos.TOP)
    except Exception:
        try:
            pdf.set_y(-15)
            pdf.set_font("Helvetica", size=8)
            pdf.set_text_color(150, 150, 150)
            pdf.cell(PAGE_W, 10, "Columbus AI Doc Generator", align="R",
                     new_x=XPos.RIGHT, new_y=YPos.TOP)
        except Exception:
            pass

    return bytes(pdf.output())

import re
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_FONT_DIR = Path(__file__).parent.parent / "fonts"
_NOTO_REGULAR     = _FONT_DIR / "NotoSansJP-Regular.ttf"
_NOTO_REGULAR_OTF = _FONT_DIR / "NotoSansJP-Regular.otf"
_NOTO_BOLD        = _FONT_DIR / "NotoSansJP-Bold.ttf"
_EXTRACTED_TTF    = _FONT_DIR / "cjk_extracted.ttf"

# System font candidates (checked in order)
_SYSTEM_CJK_CANDIDATES: list[tuple[Path, str]] = [
    # Noto CJK (fonts-noto-cjk apt package)
    (Path("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"), "truetype"),
    (Path("/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc"), "truetype"),
    (Path("/usr/share/fonts/opentype/noto/NotoSansJP-Regular.otf"),  "opentype"),
    (Path("/usr/share/fonts/noto-cjk/NotoSansCJKjp-Regular.otf"),    "opentype"),
    # IPA fonts (fonts-ipafont-gothic apt package — pre-installed on many Ubuntu images)
    (Path("/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf"),  "truetype"),
    (Path("/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf"), "truetype"),
    # macOS
    (Path("/Library/Fonts/NotoSansJP-Regular.ttf"), "truetype"),
]

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
    if _NOTO_REGULAR_OTF.exists():
        return _NOTO_REGULAR_OTF
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

def _find_weasyprint_font() -> tuple[str, str] | None:
    """Return (file_uri, css_format) for the best available CJK font."""
    # 1. Git-committed OTF (most reliable — always present)
    if _NOTO_REGULAR_OTF.exists():
        logger.info("Using bundled OTF: %s", _NOTO_REGULAR_OTF)
        return _NOTO_REGULAR_OTF.as_uri(), "opentype"

    # 2. Local downloaded TTF
    if _NOTO_REGULAR.exists():
        return _NOTO_REGULAR.as_uri(), "truetype"

    # 3. System fonts installed via apt
    for path, fmt in _SYSTEM_CJK_CANDIDATES:
        if path.exists():
            logger.info("Using system CJK font: %s", path)
            return path.as_uri(), fmt

    # 4. Previously extracted TTF
    if _EXTRACTED_TTF.exists():
        return _EXTRACTED_TTF.as_uri(), "truetype"

    logger.warning("No CJK font found — PDF Japanese rendering may be broken")
    return None


def _inject_weasyprint_fonts(html: str) -> str:
    font_info = _find_weasyprint_font()
    if not font_info:
        return html

    regular_uri, fmt = font_info
    bold_uri = _NOTO_BOLD.as_uri() if _NOTO_BOLD.exists() else regular_uri

    font_css = f"""<style>
@font-face {{ font-family: 'NotoSansJP'; src: url('{regular_uri}') format('{fmt}'); font-weight: normal; }}
@font-face {{ font-family: 'NotoSansJP'; src: url('{bold_uri}') format('{fmt}'); font-weight: bold; }}
body, * {{ font-family: 'NotoSansJP', 'Yu Gothic', 'Meiryo', sans-serif !important; }}
</style>"""

    if "</head>" in html:
        return html.replace("</head>", font_css + "\n</head>", 1)
    return font_css + html


def _blocked_url_fetcher(url, timeout=10, ssl_context=None):
    from weasyprint.urls import URLFetchingError
    if url.startswith("data:") or url.startswith("file:"):
        from weasyprint.urls import default_url_fetcher
        return default_url_fetcher(url, timeout=timeout, ssl_context=ssl_context)
    raise URLFetchingError(f"外部URLフェッチをブロックしました: {url}")


def _generate_with_weasyprint(html_content: str) -> bytes:
    from weasyprint import HTML, CSS
    return HTML(
        string=_inject_weasyprint_fonts(html_content),
        url_fetcher=_blocked_url_fetcher,
    ).write_pdf(
        stylesheets=[CSS(string=_PRINT_CSS)]
    )


# ──────────────────────────────────────────────
# fpdf2 fallback (Windows dev environment)
# ──────────────────────────────────────────────

def _prepare_html_for_fpdf2(html: str) -> str:
    html = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<head[^>]*>.*?</head>", "", html, flags=re.DOTALL | re.IGNORECASE)
    body_m = re.search(r"<body[^>]*>(.*?)</body>", html, re.DOTALL | re.IGNORECASE)
    if body_m:
        html = body_m.group(1)
    html = re.sub(r'\s+(?:style|class|id)="[^"]*"', "", html, flags=re.IGNORECASE)
    html = re.sub(r"\s+(?:style|class|id)='[^']*'", "", html, flags=re.IGNORECASE)
    return html.strip()


def _generate_with_reportlab(html_content: str) -> bytes:
    import fpdf as fpdf2

    ttf_path = _CJK_TTF

    pdf = fpdf2.FPDF(format="A4")
    pdf.set_margins(left=15, top=12, right=15)
    pdf.set_auto_page_break(auto=True, margin=12)

    if ttf_path and ttf_path.exists():
        pdf.add_font("CJK", fname=str(ttf_path))
        pdf.add_font("CJK", style="B", fname=str(ttf_path))
        pdf.set_font("CJK", size=10)
    else:
        pdf.add_font = lambda *a, **kw: None  # type: ignore
        pdf.set_font("Helvetica", size=10)

    pdf.add_page()

    clean_html = _prepare_html_for_fpdf2(html_content)

    if not clean_html.strip():
        pdf.cell(text="(内容なし)")
    else:
        try:
            pdf.write_html(clean_html)
        except Exception as e:
            logger.warning("fpdf2 write_html failed (%s), writing plain text", e)
            plain = re.sub(r"<[^>]+>", " ", clean_html)
            plain = re.sub(r"\s+", " ", plain).strip()
            pdf.multi_cell(w=0, text=plain)

    return bytes(pdf.output())


# ──────────────────────────────────────────────
# Public entry point
# ──────────────────────────────────────────────

def generate_pdf(html_content: str) -> bytes:
    try:
        return _generate_with_weasyprint(html_content)
    except Exception as e:
        logger.warning("WeasyPrint failed (%s), falling back to reportlab", e)
        return _generate_with_reportlab(html_content)

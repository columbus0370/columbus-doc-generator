import re
import base64
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_FONT_DIR = Path(__file__).parent.parent / "fonts"
_NOTO_REGULAR_TTF = _FONT_DIR / "NotoSansJP-Regular.ttf"
_NOTO_BOLD_TTF    = _FONT_DIR / "NotoSansJP-Bold.ttf"
_EXTRACTED_TTF    = _FONT_DIR / "cjk_extracted.ttf"

# System font candidates (fallback when bundled TTF unavailable)
_SYSTEM_CJK_CANDIDATES: list[tuple[Path, str]] = [
    (Path("/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf"),  "truetype"),
    (Path("/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf"), "truetype"),
]

_PRINT_CSS = """
@page { size: A4; margin: 12mm 15mm; }
body { background: white !important; padding: 0 !important; }
.no-print, .toolbar, nav, button { display: none !important; }
.doc { box-shadow: none !important; padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
"""


def _load_font_as_data_uri(path: Path, fmt: str) -> str | None:
    """Read font file and return CSS data URI string."""
    try:
        data = path.read_bytes()
        b64 = base64.b64encode(data).decode("ascii")
        mime = "font/otf" if fmt == "opentype" else "font/ttf"
        return f"data:{mime};base64,{b64}"
    except Exception as e:
        logger.warning("Failed to read font %s: %s", path, e)
        return None


def _build_font_css() -> str:
    """Build @font-face CSS with font embedded as base64 (no external file dependency)."""
    candidates = [
        (_NOTO_REGULAR_TTF, "truetype"),
        *_SYSTEM_CJK_CANDIDATES,
    ]
    for path, fmt in candidates:
        if not path.exists():
            continue
        uri = _load_font_as_data_uri(path, fmt)
        if uri:
            logger.info("Font loaded for PDF: %s (%s)", path.name, fmt)
            bold_uri = uri  # reuse regular as bold fallback
            if _NOTO_BOLD_TTF.exists():
                bold_data_uri = _load_font_as_data_uri(_NOTO_BOLD_TTF, "truetype")
                if bold_data_uri:
                    bold_uri = bold_data_uri
            return (
                f"@font-face {{ font-family: 'PDFJP'; "
                f"src: url('{uri}') format('{fmt}'); font-weight: normal; }}\n"
                f"@font-face {{ font-family: 'PDFJP'; "
                f"src: url('{bold_uri}') format('{fmt}'); font-weight: bold; }}\n"
                f"body, * {{ font-family: 'PDFJP', sans-serif !important; }}\n"
            )
    logger.warning("No CJK font found — PDF Japanese rendering may be broken")
    return ""


# Cache at startup so we don't re-read the font file on every request
_FONT_CSS: str = _build_font_css()


def _inject_font_css(html: str) -> str:
    if not _FONT_CSS:
        return html
    style = f"<style>\n{_FONT_CSS}</style>"
    if "</head>" in html:
        return html.replace("</head>", style + "\n</head>", 1)
    return style + html


def _blocked_url_fetcher(url, timeout=10, ssl_context=None):
    from weasyprint.urls import URLFetchingError
    if url.startswith("data:") or url.startswith("file:"):
        from weasyprint.urls import default_url_fetcher
        return default_url_fetcher(url, timeout=timeout, ssl_context=ssl_context)
    raise URLFetchingError(f"外部URLフェッチをブロックしました: {url}")


def _generate_with_weasyprint(html_content: str) -> bytes:
    from weasyprint import HTML, CSS
    return HTML(
        string=_inject_font_css(html_content),
        url_fetcher=_blocked_url_fetcher,
    ).write_pdf(
        stylesheets=[CSS(string=_PRINT_CSS)]
    )


# ──────────────────────────────────────────────
# fpdf2 fallback (Windows dev environment)
# ──────────────────────────────────────────────

def _get_cjk_ttf_for_fpdf() -> Path | None:
    for path in [_NOTO_REGULAR_TTF, _EXTRACTED_TTF]:
        if path.exists():
            return path
    for path, _ in _SYSTEM_CJK_CANDIDATES:
        if path.exists():
            return path
    return None


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


def _generate_with_fpdf2(html_content: str) -> bytes:
    import fpdf as fpdf2

    ttf_path = _get_cjk_ttf_for_fpdf()

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
        logger.warning("WeasyPrint failed (%s), falling back to fpdf2", e)
        return _generate_with_fpdf2(html_content)

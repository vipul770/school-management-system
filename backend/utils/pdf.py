"""Render a Django template to PDF with WeasyPrint (installed by production requirements)."""
from django.template.loader import render_to_string

def render_pdf(template_name: str, context: dict) -> bytes:
    try:
        from weasyprint import HTML
    except ImportError as exc:
        raise RuntimeError("Install requirements/production.txt to generate PDF reports.") from exc
    return HTML(string=render_to_string(template_name, context)).write_pdf()

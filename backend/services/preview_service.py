from pathlib import Path
from typing import Optional
import mammoth

def generate_html_preview(docx_path: str | Path) -> str:
    """
    Converts a .docx file into safe, rich HTML with embedded images
    for instantaneous client-side document preview.
    """
    path = Path(docx_path)
    if not path.exists():
        return "<p class='text-red-500'>Document file not found.</p>"

    try:
        with open(path, "rb") as docx_file:
            result = mammoth.convert_to_html(docx_file)
            html = result.value
            messages = result.messages # Warnings if any
            return html
    except Exception as e:
        return f"<p class='text-red-500'>Failed to generate preview: {str(e)}</p>"

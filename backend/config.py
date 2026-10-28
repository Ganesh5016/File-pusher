import os
import re
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
DATA_DIR = BASE_DIR / "data"
DOCS_DIR = DATA_DIR / "documents"
TEMP_UPLOADS_DIR = DATA_DIR / "temp_uploads"
DB_PATH = DATA_DIR / "snap2doc.db"

# Create required directories
DOCS_DIR.mkdir(parents=True, exist_ok=True)
TEMP_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# GitHub token from env if configured
DEFAULT_GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()

# Limits & Validation
MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024  # 25MB per image
MAX_TOTAL_UPLOAD_BYTES = 150 * 1024 * 1024  # 150MB total per document
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

def sanitize_filename(name: str, fallback: str = "Snap2Doc_Document") -> str:
    """
    Sanitize input string to make a clean, safe filename.
    Replaces special chars with underscores, strips trailing spaces/dots.
    Example: 'College Event Report' -> 'College_Event_Report'
    """
    if not name or not name.strip():
        name = fallback
    # Replace any character that is not alphanumeric, underscore, or hyphen with underscore
    clean = re.sub(r'[^a-zA-Z0-9_\-\s]', '', name.strip())
    # Replace whitespace sequences with a single underscore
    clean = re.sub(r'\s+', '_', clean)
    # Remove leading/trailing underscores or hyphens
    clean = clean.strip('_-')
    if not clean:
        clean = fallback
    return clean[:80]  # Cap length for safety

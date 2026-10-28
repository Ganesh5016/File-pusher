import os
import json
import shutil
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse, HTMLResponse, Response

from ..config import (
    DOCS_DIR, TEMP_UPLOADS_DIR, MAX_IMAGE_SIZE_BYTES,
    MAX_TOTAL_UPLOAD_BYTES, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_MIME_TYPES
)
from ..database import add_document, get_document, list_documents, delete_document
from ..services.docx_generator import generate_word_document
from ..services.preview_service import generate_html_preview
from ..models import DocumentGenerateResponse, DocumentDetail

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/generate", response_model=DocumentGenerateResponse)
async def generate_document(
    images: List[UploadFile] = File(...),
    title: str = Form(""),
    intro_text: Optional[str] = Form(""),
    page_orientation: str = Form("portrait"),
    image_alignment: str = Form("center"),
    image_size: str = Form("standard"),
    captions: Optional[str] = Form("[]"), # JSON array of caption strings or objects
    one_image_per_page: bool = Form(False)
):
    """
    Validates uploaded images, generates a genuine Microsoft Word (.docx) document,
    saves document metadata, and cleans up temporary uploads.
    """
    if not images or len(images) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one image is required to generate a Word document."
        )

    # Parse captions if provided
    parsed_captions = []
    if captions:
        try:
            parsed_captions = json.loads(captions)
        except Exception:
            parsed_captions = []

    # Temporary directory for this generation session
    session_id = str(uuid.uuid4())
    session_dir = TEMP_UPLOADS_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)

    total_bytes = 0
    saved_images_info = []

    try:
        for idx, file in enumerate(images):
            # 1. Validate file extension
            filename = file.filename or f"image_{idx}.jpg"
            ext = Path(filename).suffix.lower()
            if ext not in ALLOWED_IMAGE_EXTENSIONS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File '{filename}' has unsupported extension '{ext}'. Allowed: JPG, JPEG, PNG, WEBP."
                )

            # 2. Check content size while streaming
            temp_file_path = session_dir / f"{idx}_{filename}"
            size = 0
            with open(temp_file_path, "wb") as f_out:
                while chunk := await file.read(1024 * 1024): # 1MB chunk
                    size += len(chunk)
                    total_bytes += len(chunk)
                    if size > MAX_IMAGE_SIZE_BYTES:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"File '{filename}' exceeds maximum allowed size of 25MB."
                        )
                    if total_bytes > MAX_TOTAL_UPLOAD_BYTES:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Total upload size exceeds 150MB limit."
                        )
                    f_out.write(chunk)

            # Retrieve caption for this index
            caption_text = ""
            if idx < len(parsed_captions):
                c_item = parsed_captions[idx]
                if isinstance(c_item, str):
                    caption_text = c_item
                elif isinstance(c_item, dict):
                    caption_text = c_item.get("caption", "")

            saved_images_info.append({
                "filepath": str(temp_file_path),
                "original_filename": filename,
                "caption": caption_text
            })

        # Generate Word Document
        result = generate_word_document(
            title=title,
            intro_text=intro_text,
            images_data=saved_images_info,
            page_orientation=page_orientation,
            image_alignment=image_alignment,
            image_size=image_size,
            one_image_per_page=one_image_per_page
        )

        # Store in database
        saved_record = add_document(result)

        return saved_record

    finally:
        # Secure cleanup: Remove temporary image files
        try:
            shutil.rmtree(session_dir, ignore_errors=True)
        except Exception:
            pass

@router.get("", response_model=List[DocumentDetail])
async def get_all_documents():
    """Returns list of all generated documents with metadata."""
    return list_documents()

@router.get("/{doc_id}", response_model=DocumentDetail)
async def get_single_document(doc_id: str):
    """Retrieves metadata of a specific document."""
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.get("/{doc_id}/download")
async def download_document(doc_id: str):
    """Downloads the genuine Microsoft Word (.docx) binary file."""
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    filepath = Path(doc["filepath"])
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Document file does not exist on disk.")

    return FileResponse(
        path=str(filepath),
        filename=doc["filename"],
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

@router.get("/{doc_id}/preview", response_class=HTMLResponse)
async def preview_document(doc_id: str):
    """Returns rendered HTML preview of the generated document."""
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    filepath = Path(doc["filepath"])
    html = generate_html_preview(filepath)
    return HTMLResponse(content=html)

@router.delete("/{doc_id}")
async def remove_document(doc_id: str):
    """Deletes the document file and database entry."""
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    filepath = Path(doc["filepath"])
    if filepath.exists():
        try:
            filepath.unlink()
        except Exception:
            pass

    delete_document(doc_id)
    return {"success": True, "message": "Document deleted successfully."}

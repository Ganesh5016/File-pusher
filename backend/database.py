import sqlite3
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from .config import DB_PATH

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Table for documents history
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        created_at TEXT NOT NULL,
        image_count INTEGER NOT NULL DEFAULT 0,
        file_size_bytes INTEGER NOT NULL DEFAULT 0,
        page_orientation TEXT NOT NULL DEFAULT 'portrait',
        image_alignment TEXT NOT NULL DEFAULT 'center',
        image_size TEXT NOT NULL DEFAULT 'standard',
        intro_text TEXT,
        images_metadata TEXT,
        github_repo TEXT,
        github_branch TEXT,
        github_path TEXT,
        github_commit_sha TEXT,
        github_html_url TEXT,
        github_uploaded_at TEXT,
        upload_status TEXT NOT NULL DEFAULT 'not_uploaded'
    );
    """)

    # Table for GitHub configuration & authenticated session
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS github_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        token TEXT NOT NULL,
        username TEXT,
        name TEXT,
        avatar_url TEXT,
        html_url TEXT,
        updated_at TEXT NOT NULL
    );
    """)
    
    conn.commit()
    conn.close()

def add_document(doc: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO documents (
        id, title, filename, filepath, created_at, image_count, file_size_bytes,
        page_orientation, image_alignment, image_size, intro_text, images_metadata,
        upload_status
    ) VALUES (
        :id, :title, :filename, :filepath, :created_at, :image_count, :file_size_bytes,
        :page_orientation, :image_alignment, :image_size, :intro_text, :images_metadata,
        :upload_status
    );
    """, {
        "id": doc["id"],
        "title": doc["title"],
        "filename": doc["filename"],
        "filepath": doc["filepath"],
        "created_at": doc.get("created_at", datetime.utcnow().isoformat() + "Z"),
        "image_count": doc.get("image_count", 0),
        "file_size_bytes": doc.get("file_size_bytes", 0),
        "page_orientation": doc.get("page_orientation", "portrait"),
        "image_alignment": doc.get("image_alignment", "center"),
        "image_size": doc.get("image_size", "standard"),
        "intro_text": doc.get("intro_text", ""),
        "images_metadata": json.dumps(doc.get("images_metadata", [])),
        "upload_status": doc.get("upload_status", "not_uploaded")
    })
    conn.commit()
    conn.close()
    return get_document(doc["id"])

def get_document(doc_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    if d.get("images_metadata"):
        try:
            d["images_metadata"] = json.loads(d["images_metadata"])
        except Exception:
            d["images_metadata"] = []
    return d

def list_documents() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        d = dict(r)
        if d.get("images_metadata"):
            try:
                d["images_metadata"] = json.loads(d["images_metadata"])
            except Exception:
                d["images_metadata"] = []
        results.append(d)
    return results

def update_document_github(doc_id: str, github_info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE documents SET
        github_repo = :github_repo,
        github_branch = :github_branch,
        github_path = :github_path,
        github_commit_sha = :github_commit_sha,
        github_html_url = :github_html_url,
        github_uploaded_at = :github_uploaded_at,
        upload_status = :upload_status
    WHERE id = :id
    """, {
        "id": doc_id,
        "github_repo": github_info.get("repo"),
        "github_branch": github_info.get("branch"),
        "github_path": github_info.get("path"),
        "github_commit_sha": github_info.get("commit_sha"),
        "github_html_url": github_info.get("html_url"),
        "github_uploaded_at": github_info.get("uploaded_at", datetime.utcnow().isoformat() + "Z"),
        "upload_status": github_info.get("status", "uploaded")
    })
    conn.commit()
    conn.close()
    return get_document(doc_id)

def delete_document(doc_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def save_github_config(token: str, user_info: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat() + "Z"
    cursor.execute("""
    INSERT INTO github_config (id, token, username, name, avatar_url, html_url, updated_at)
    VALUES (1, :token, :username, :name, :avatar_url, :html_url, :updated_at)
    ON CONFLICT(id) DO UPDATE SET
        token = excluded.token,
        username = excluded.username,
        name = excluded.name,
        avatar_url = excluded.avatar_url,
        html_url = excluded.html_url,
        updated_at = excluded.updated_at;
    """, {
        "token": token,
        "username": user_info.get("login", ""),
        "name": user_info.get("name", ""),
        "avatar_url": user_info.get("avatar_url", ""),
        "html_url": user_info.get("html_url", ""),
        "updated_at": now
    })
    conn.commit()
    conn.close()
    return get_github_config()

def get_github_config(include_token: bool = False) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM github_config WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    if not include_token:
        # Mask the token for safety so frontend never sees raw secret
        raw = d.get("token", "")
        if raw:
            d["is_configured"] = True
            d["masked_token"] = raw[:4] + "..." + raw[-4:] if len(raw) > 8 else "***"
        else:
            d["is_configured"] = False
            d["masked_token"] = ""
        del d["token"]
    return d

def clear_github_config():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM github_config WHERE id = 1")
    conn.commit()
    conn.close()

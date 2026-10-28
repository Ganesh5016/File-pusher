import os
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Query

from ..config import DEFAULT_GITHUB_TOKEN
from ..database import (
    save_github_config, get_github_config, clear_github_config,
    get_document, update_document_github
)
from ..services.github_service import (
    verify_github_token, fetch_user_repositories, fetch_repo_branches,
    check_github_file_existence, upload_docx_to_github
)
from ..models import (
    GitHubTestRequest, GitHubTestResponse,
    GitHubSaveConfigRequest, GitHubConfigStatusResponse,
    GitHubRepoItem, GitHubBranchItem,
    GitHubCheckConflictRequest, GitHubCheckConflictResponse,
    GitHubUploadRequest, GitHubUploadResponse
)

router = APIRouter(prefix="/api/github", tags=["github"])

def get_active_token(override_token: Optional[str] = None) -> str:
    """
    Returns active token from:
    1. Explicit request token
    2. Saved database token
    3. Server environment variable GITHUB_TOKEN
    """
    if override_token and override_token.strip():
        return override_token.strip()
    
    saved = get_github_config(include_token=True)
    if saved and saved.get("token"):
        return saved["token"]
        
    if DEFAULT_GITHUB_TOKEN:
        return DEFAULT_GITHUB_TOKEN

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No GitHub token configured. Please connect your GitHub account in Settings."
    )

@router.post("/test-connection", response_model=GitHubTestResponse)
async def test_connection(req: Optional[GitHubTestRequest] = None):
    """
    Tests a GitHub Personal Access Token and returns user account information.
    """
    token_to_test = req.token if (req and req.token) else None
    if not token_to_test:
        # Fall back to saved token if any
        try:
            token_to_test = get_active_token()
        except HTTPException:
            raise HTTPException(
                status_code=400,
                detail="Please provide a GitHub Personal Access Token to test."
            )

    result = await verify_github_token(token_to_test)
    return result

@router.get("/settings", response_model=GitHubConfigStatusResponse)
async def get_settings():
    """
    Returns current GitHub integration status and profile without exposing raw token.
    """
    config = get_github_config(include_token=False)
    if config:
        return {
            "is_configured": True,
            "masked_token": config.get("masked_token"),
            "username": config.get("username"),
            "name": config.get("name"),
            "avatar_url": config.get("avatar_url"),
            "html_url": config.get("html_url"),
            "updated_at": config.get("updated_at")
        }
    
    # Check if env token is present
    if DEFAULT_GITHUB_TOKEN:
        return {
            "is_configured": True,
            "masked_token": DEFAULT_GITHUB_TOKEN[:4] + "..." + DEFAULT_GITHUB_TOKEN[-4:] if len(DEFAULT_GITHUB_TOKEN) > 8 else "***",
            "username": "Environment Token",
            "name": "Configured via Server Environment",
            "avatar_url": None,
            "html_url": None,
            "updated_at": None
        }

    return {
        "is_configured": False,
        "masked_token": None,
        "username": None,
        "name": None,
        "avatar_url": None,
        "html_url": None,
        "updated_at": None
    }

@router.post("/settings", response_model=GitHubConfigStatusResponse)
async def save_settings(req: GitHubSaveConfigRequest):
    """
    Validates and securely stores the GitHub Personal Access Token in the backend database.
    """
    token = req.token.strip()
    verification = await verify_github_token(token)
    if not verification.get("valid"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=verification.get("error", "Invalid GitHub Token")
        )

    saved = save_github_config(token, verification)
    return {
        "is_configured": True,
        "masked_token": saved.get("masked_token"),
        "username": saved.get("username"),
        "name": saved.get("name"),
        "avatar_url": saved.get("avatar_url"),
        "html_url": saved.get("html_url"),
        "updated_at": saved.get("updated_at")
    }

@router.delete("/settings")
async def clear_settings():
    """Disconnects and removes the saved GitHub token."""
    clear_github_config()
    return {"success": True, "message": "GitHub connection removed."}

@router.get("/repositories", response_model=List[GitHubRepoItem])
async def list_repositories(token_override: Optional[str] = Query(None)):
    """
    Lists repositories accessible to the user, indicating write/push permission.
    """
    token = get_active_token(token_override)
    try:
        repos = await fetch_user_repositories(token)
        return repos
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/branches", response_model=List[GitHubBranchItem])
async def list_branches(
    owner: str = Query(...),
    repo: str = Query(...),
    token_override: Optional[str] = Query(None)
):
    """
    Lists branches for the specified repository.
    """
    token = get_active_token(token_override)
    try:
        branches = await fetch_repo_branches(token, owner, repo)
        return branches
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/check-conflict", response_model=GitHubCheckConflictResponse)
async def check_file_conflict(req: GitHubCheckConflictRequest):
    """
    Checks if a target file already exists in repository to prompt user for overwrite confirmation.
    """
    token = get_active_token()
    # Parse owner and repo
    if "/" in req.repo:
        parts = req.repo.split("/", 1)
        owner, repo_name = parts[0], parts[1]
    else:
        raise HTTPException(status_code=400, detail="Invalid repository format. Expected 'owner/repo'.")

    full_path = f"{req.folder_path.strip('/ ')}/{req.filename}" if req.folder_path else req.filename
    result = await check_github_file_existence(token, owner, repo_name, req.branch, full_path)
    return result

@router.post("/upload", response_model=GitHubUploadResponse)
async def upload_document_to_github(req: GitHubUploadRequest):
    """
    Uploads the real generated binary .docx file directly to GitHub repository.
    """
    # 1. Fetch document record
    doc = get_document(req.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    filepath = Path(doc["filepath"])
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Word document file not found on disk.")

    # 2. Get active token
    token = get_active_token(req.custom_token)

    # 3. Parse owner and repo
    if "/" in req.repo:
        parts = req.repo.split("/", 1)
        owner, repo_name = parts[0], parts[1]
    else:
        raise HTTPException(status_code=400, detail="Invalid repository format. Expected 'owner/repo'.")

    # 4. Read binary file
    with open(filepath, "rb") as f:
        doc_bytes = f.read()

    # 5. Determine filename
    target_filename = req.filename or doc["filename"]
    if not target_filename.endswith(".docx"):
        target_filename = f"{target_filename}.docx"

    # 6. Execute upload
    try:
        upload_res = await upload_docx_to_github(
            token=token,
            owner=owner,
            repo=repo_name,
            branch=req.branch,
            folder_path=req.folder_path or "",
            filename=target_filename,
            file_bytes=doc_bytes,
            commit_message=req.commit_message,
            overwrite_sha=req.overwrite_sha
        )

        # 7. Update document history with GitHub upload details
        update_document_github(req.document_id, {
            "repo": req.repo,
            "branch": req.branch,
            "path": upload_res["path"],
            "commit_sha": upload_res["commit_sha"],
            "html_url": upload_res["html_url"],
            "status": "uploaded"
        })

        return {
            "success": True,
            "filename": target_filename,
            "path": upload_res["path"],
            "repo": req.repo,
            "branch": req.branch,
            "commit_sha": upload_res["commit_sha"],
            "commit_html_url": upload_res.get("commit_html_url"),
            "html_url": upload_res["html_url"],
            "message": f"Successfully committed and uploaded '{target_filename}' to {req.repo} ({req.branch})!"
        }

    except Exception as e:
        # Update status to failed if error
        update_document_github(req.document_id, {
            "repo": req.repo,
            "branch": req.branch,
            "path": req.folder_path,
            "commit_sha": None,
            "html_url": None,
            "status": "failed"
        })
        raise HTTPException(status_code=400, detail=str(e))

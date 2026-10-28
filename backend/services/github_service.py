import base64
import os
from typing import Dict, Any, List, Optional
import httpx
from ..config import sanitize_filename

GITHUB_API_BASE = "https://api.github.com"

def get_auth_headers(token: str) -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {token.strip()}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Snap2Doc-App"
    }

async def verify_github_token(token: str) -> Dict[str, Any]:
    """
    Validates GitHub Personal Access Token and retrieves user details & token scopes.
    """
    if not token or not token.strip():
        raise ValueError("GitHub access token is required")

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(
                f"{GITHUB_API_BASE}/user",
                headers=get_auth_headers(token)
            )
            
            if resp.status_code == 401:
                return {
                    "valid": False,
                    "error": "Invalid or expired GitHub Personal Access Token."
                }
            elif resp.status_code == 403:
                return {
                    "valid": False,
                    "error": "GitHub API rate limit exceeded or access forbidden."
                }
            elif resp.status_code != 200:
                return {
                    "valid": False,
                    "error": f"GitHub API error: {resp.status_code} - {resp.text}"
                }

            user_data = resp.json()
            scopes = resp.headers.get("x-oauth-scopes", "")
            scope_list = [s.strip() for s in scopes.split(",") if s.strip()]

            return {
                "valid": True,
                "login": user_data.get("login"),
                "name": user_data.get("name") or user_data.get("login"),
                "avatar_url": user_data.get("avatar_url"),
                "html_url": user_data.get("html_url"),
                "public_repos": user_data.get("public_repos", 0),
                "total_private_repos": user_data.get("total_private_repos", 0),
                "scopes": scope_list,
                "has_repo_scope": ("repo" in scope_list) or ("public_repo" in scope_list) or (len(scope_list) == 0) # fine-grained tokens don't use x-oauth-scopes
            }
        except httpx.RequestError as e:
            return {
                "valid": False,
                "error": f"Network error connecting to GitHub: {str(e)}"
            }

async def fetch_user_repositories(token: str, per_page: int = 100) -> List[Dict[str, Any]]:
    """
    Fetches repositories accessible to the authenticated user.
    """
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.get(
            f"{GITHUB_API_BASE}/user/repos",
            headers=get_auth_headers(token),
            params={"sort": "updated", "per_page": per_page, "affiliation": "owner,collaborator,organization_member"}
        )
        
        if resp.status_code != 200:
            raise Exception(f"Failed to fetch repositories ({resp.status_code}): {resp.text}")

        repos = resp.json()
        results = []
        for r in repos:
            permissions = r.get("permissions", {})
            results.append({
                "id": r.get("id"),
                "name": r.get("name"),
                "full_name": r.get("full_name"),
                "owner": r.get("owner", {}).get("login"),
                "private": r.get("private", False),
                "default_branch": r.get("default_branch", "main"),
                "html_url": r.get("html_url"),
                "description": r.get("description"),
                "can_push": permissions.get("push", True)
            })
        return results

async def fetch_repo_branches(token: str, owner: str, repo: str) -> List[Dict[str, Any]]:
    """
    Fetches all branches for the selected repository.
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}/branches",
            headers=get_auth_headers(token),
            params={"per_page": 100}
        )

        if resp.status_code == 404:
            raise Exception(f"Repository '{owner}/{repo}' not found or access denied.")
        elif resp.status_code != 200:
            raise Exception(f"Failed to fetch branches ({resp.status_code}): {resp.text}")

        branches = resp.json()
        return [{"name": b.get("name"), "protected": b.get("protected", False)} for b in branches]

async def check_github_file_existence(token: str, owner: str, repo: str, branch: str, file_path: str) -> Dict[str, Any]:
    """
    Checks if a file already exists at the given path in the repository and branch.
    Returns sha if it exists so caller can handle conflict / overwrite confirmation.
    """
    clean_path = file_path.strip("/ ")
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{clean_path}",
            headers=get_auth_headers(token),
            params={"ref": branch}
        )

        if resp.status_code == 200:
            data = resp.json()
            return {
                "exists": True,
                "sha": data.get("sha"),
                "size": data.get("size"),
                "html_url": data.get("html_url")
            }
        elif resp.status_code == 404:
            return {"exists": False}
        else:
            # Handle possible error
            return {"exists": False, "error": f"Status {resp.status_code}"}

async def upload_docx_to_github(
    token: str,
    owner: str,
    repo: str,
    branch: str,
    folder_path: str,
    filename: str,
    file_bytes: bytes,
    commit_message: Optional[str] = None,
    overwrite_sha: Optional[str] = None
) -> Dict[str, Any]:
    """
    Uploads a genuine binary .docx file directly to GitHub using the Contents API.
    Properly encodes the binary payload as Base64 to preserve Word document integrity.
    """
    # 1. Format clean path
    folder_clean = folder_path.strip("/ ") if folder_path else ""
    # Ensure filename ends with .docx
    if not filename.endswith(".docx"):
        filename = f"{filename}.docx"

    full_path = f"{folder_clean}/{filename}" if folder_clean else filename
    full_path = full_path.strip("/")

    # 2. Encode binary content to Base64
    base64_content = base64.b64encode(file_bytes).decode("ascii")

    # 3. Default commit message
    if not commit_message or not commit_message.strip():
        commit_message = f"Add {filename} via Snap2Doc"

    payload: Dict[str, Any] = {
        "message": commit_message.strip(),
        "content": base64_content,
        "branch": branch
    }

    if overwrite_sha:
        payload["sha"] = overwrite_sha

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.put(
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{full_path}",
            headers=get_auth_headers(token),
            json=payload
        )

        if resp.status_code in (200, 201):
            data = resp.json()
            content_info = data.get("content", {})
            commit_info = data.get("commit", {})
            return {
                "success": True,
                "path": full_path,
                "filename": filename,
                "commit_sha": commit_info.get("sha"),
                "commit_html_url": commit_info.get("html_url"),
                "html_url": content_info.get("html_url"),
                "download_url": content_info.get("download_url"),
                "branch": branch,
                "repo": f"{owner}/{repo}"
            }
        elif resp.status_code == 409:
            raise Exception("File conflict: A file with this name already exists in this branch. Please confirm overwrite.")
        elif resp.status_code == 401:
            raise Exception("Unauthorized: Invalid or expired GitHub token.")
        elif resp.status_code == 403:
            raise Exception("Forbidden: Token does not have write/push permissions to this repository.")
        elif resp.status_code == 404:
            raise Exception(f"Repository '{owner}/{repo}' or branch '{branch}' not found.")
        elif resp.status_code == 422:
            raise Exception(f"Validation error from GitHub: {resp.text}")
        else:
            raise Exception(f"GitHub API error ({resp.status_code}): {resp.text}")

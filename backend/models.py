from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class ImageMeta(BaseModel):
    original_filename: str
    caption: Optional[str] = ""
    order: int

class DocumentGenerateResponse(BaseModel):
    id: str
    title: str
    filename: str
    created_at: str
    image_count: int
    file_size_bytes: int
    page_orientation: str
    image_alignment: str
    image_size: str
    intro_text: Optional[str] = None
    upload_status: str
    images_metadata: List[Dict[str, Any]] = []

class DocumentDetail(BaseModel):
    id: str
    title: str
    filename: str
    created_at: str
    image_count: int
    file_size_bytes: int
    page_orientation: str
    image_alignment: str
    image_size: str
    intro_text: Optional[str] = None
    upload_status: str
    github_repo: Optional[str] = None
    github_branch: Optional[str] = None
    github_path: Optional[str] = None
    github_commit_sha: Optional[str] = None
    github_html_url: Optional[str] = None
    github_uploaded_at: Optional[str] = None
    images_metadata: List[Dict[str, Any]] = []

class GitHubTestRequest(BaseModel):
    token: str

class GitHubTestResponse(BaseModel):
    valid: bool
    login: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    html_url: Optional[str] = None
    public_repos: Optional[int] = 0
    total_private_repos: Optional[int] = 0
    scopes: List[str] = []
    has_repo_scope: bool = False
    error: Optional[str] = None

class GitHubSaveConfigRequest(BaseModel):
    token: str

class GitHubConfigStatusResponse(BaseModel):
    is_configured: bool
    masked_token: Optional[str] = None
    username: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    html_url: Optional[str] = None
    updated_at: Optional[str] = None

class GitHubRepoItem(BaseModel):
    id: int
    name: str
    full_name: str
    owner: str
    private: bool
    default_branch: str
    html_url: str
    description: Optional[str] = None
    can_push: bool

class GitHubBranchItem(BaseModel):
    name: str
    protected: bool

class GitHubCheckConflictRequest(BaseModel):
    repo: str # "owner/repo" or separate owner and repo
    branch: str
    folder_path: Optional[str] = ""
    filename: str

class GitHubCheckConflictResponse(BaseModel):
    exists: bool
    sha: Optional[str] = None
    html_url: Optional[str] = None

class GitHubUploadRequest(BaseModel):
    document_id: str
    repo: str # "owner/repo"
    branch: str
    folder_path: Optional[str] = ""
    filename: Optional[str] = None
    commit_message: Optional[str] = None
    overwrite_sha: Optional[str] = None
    custom_token: Optional[str] = None # Optional override if not using saved token

class GitHubUploadResponse(BaseModel):
    success: bool
    filename: str
    path: str
    repo: str
    branch: str
    commit_sha: str
    commit_html_url: Optional[str] = None
    html_url: str
    message: str

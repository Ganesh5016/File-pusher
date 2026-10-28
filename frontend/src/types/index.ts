export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
  name: string;
  size: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  filename: string;
  created_at: string;
  image_count: number;
  file_size_bytes: number;
  page_orientation: 'portrait' | 'landscape';
  image_alignment: 'center' | 'left' | 'right';
  image_size: 'standard' | 'large' | 'compact' | 'full';
  intro_text?: string;
  upload_status: 'not_uploaded' | 'uploaded' | 'failed';
  github_repo?: string;
  github_branch?: string;
  github_path?: string;
  github_commit_sha?: string;
  github_html_url?: string;
  github_uploaded_at?: string;
  images_metadata?: Array<{
    original_filename: string;
    caption: string;
    order: number;
  }>;
}

export interface GitHubConfigStatus {
  is_configured: boolean;
  masked_token?: string;
  username?: string;
  name?: string;
  avatar_url?: string;
  html_url?: string;
  updated_at?: string;
}

export interface GitHubTestResponse {
  valid: boolean;
  login?: string;
  name?: string;
  avatar_url?: string;
  html_url?: string;
  public_repos?: number;
  total_private_repos?: number;
  scopes?: string[];
  has_repo_scope?: boolean;
  error?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  private: boolean;
  default_branch: string;
  html_url: string;
  description?: string;
  can_push: boolean;
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
}

export interface GitHubUploadResult {
  success: boolean;
  filename: string;
  path: string;
  repo: string;
  branch: string;
  commit_sha: string;
  commit_html_url?: string;
  html_url: string;
  message: string;
}

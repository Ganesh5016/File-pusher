import type {
  DocumentItem,
  GitHubConfigStatus,
  GitHubTestResponse,
  GitHubRepo,
  GitHubBranch,
  GitHubUploadResult
} from '../types';

const API_BASE = '/api';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

// Documents API
export async function generateDocument(formData: FormData): Promise<DocumentItem> {
  const res = await fetch(`${API_BASE}/documents/generate`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to generate document' }));
    throw new Error(errorData.detail || 'Failed to generate document');
  }
  return res.json();
}

export async function getDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) {
    throw new Error('Failed to fetch documents');
  }
  return res.json();
}

export async function getDocument(id: string): Promise<DocumentItem> {
  const res = await fetch(`${API_BASE}/documents/${id}`);
  if (!res.ok) {
    throw new Error('Document not found');
  }
  return res.json();
}

export async function deleteDocument(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function getDocumentPreviewHtml(id: string): Promise<string> {
  const res = await fetch(`${API_BASE}/documents/${id}/preview`);
  if (!res.ok) {
    throw new Error('Failed to load document preview');
  }
  return res.text();
}

export function getDocumentDownloadUrl(id: string): string {
  return `${API_BASE}/documents/${id}/download`;
}

// GitHub API
export async function getGitHubSettings(): Promise<GitHubConfigStatus> {
  const res = await fetch(`${API_BASE}/github/settings`);
  if (!res.ok) {
    throw new Error('Failed to fetch GitHub settings');
  }
  return res.json();
}

export async function saveGitHubSettings(token: string): Promise<GitHubConfigStatus> {
  const res = await fetch(`${API_BASE}/github/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to connect token' }));
    throw new Error(err.detail || 'Failed to save GitHub settings');
  }
  return res.json();
}

export async function disconnectGitHub(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/github/settings`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function testGitHubConnection(token?: string): Promise<GitHubTestResponse> {
  const res = await fetch(`${API_BASE}/github/test-connection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token || '' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Connection test failed' }));
    throw new Error(err.detail || 'Connection test failed');
  }
  return res.json();
}

export async function getGitHubRepositories(): Promise<GitHubRepo[]> {
  const res = await fetch(`${API_BASE}/github/repositories`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch repositories' }));
    throw new Error(err.detail || 'Failed to fetch repositories');
  }
  return res.json();
}

export async function getGitHubBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
  const res = await fetch(`${API_BASE}/github/branches?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch branches' }));
    throw new Error(err.detail || 'Failed to fetch branches');
  }
  return res.json();
}

export async function checkGitHubConflict(payload: {
  repo: string;
  branch: string;
  folder_path?: string;
  filename: string;
}): Promise<{ exists: boolean; sha?: string; html_url?: string }> {
  const res = await fetch(`${API_BASE}/github/check-conflict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to check file conflict' }));
    throw new Error(err.detail || 'Failed to check file conflict');
  }
  return res.json();
}

export async function uploadDocumentToGitHub(payload: {
  document_id: string;
  repo: string;
  branch: string;
  folder_path?: string;
  filename?: string;
  commit_message?: string;
  overwrite_sha?: string;
}): Promise<GitHubUploadResult> {
  const res = await fetch(`${API_BASE}/github/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

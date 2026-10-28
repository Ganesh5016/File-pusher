import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileText,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  X,
  GitCommit
} from 'lucide-react';
import { GitHubIcon } from '../ui/GitHubIcon';
import type { DocumentItem, GitHubRepo, GitHubBranch, GitHubUploadResult } from '../../types';
import {
  getGitHubRepositories,
  getGitHubBranches,
  checkGitHubConflict,
  uploadDocumentToGitHub
} from '../../services/api';

interface GitHubUploadModalProps {
  document: DocumentItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: GitHubUploadResult) => void;
}

export const GitHubUploadModal: React.FC<GitHubUploadModalProps> = ({
  document,
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Repositories & Branches state
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [selectedRepoFullName, setSelectedRepoFullName] = useState<string>('');
  const [repoSearch, setRepoSearch] = useState('');

  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('main');

  // Folder & Filename state
  const [folderPath, setFolderPath] = useState<string>('documents');
  const [filename, setFilename] = useState<string>(document.filename);
  const [commitMessage, setCommitMessage] = useState<string>(`Add ${document.filename} via Snap2Doc`);

  // Conflict & Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<{ exists: boolean; sha?: string } | null>(null);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [uploadResult, setUploadResult] = useState<GitHubUploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load repositories on modal open
  useEffect(() => {
    if (!isOpen) {
      setUploadResult(null);
      setErrorMessage(null);
      setConflictWarning(null);
      return;
    }

    setFilename(document.filename);
    setCommitMessage(`Add ${document.filename} via Snap2Doc`);

    setIsLoadingRepos(true);
    setErrorMessage(null);
    getGitHubRepositories()
      .then((repoList) => {
        setRepos(repoList);
        if (repoList.length > 0) {
          // If document was previously uploaded to a repo, preselect it
          const matchPrev = repoList.find((r) => r.full_name === document.github_repo);
          const initialRepo = matchPrev || repoList[0];
          setSelectedRepoFullName(initialRepo.full_name);
          loadBranchesForRepo(initialRepo.owner, initialRepo.name, initialRepo.default_branch);
        }
      })
      .catch((err: any) => {
        setErrorMessage(err.message || 'Failed to load GitHub repositories. Please ensure your token is connected.');
      })
      .finally(() => {
        setIsLoadingRepos(false);
      });
  }, [isOpen, document]);

  const loadBranchesForRepo = async (owner: string, repo: string, defaultBranch: string = 'main') => {
    setIsLoadingBranches(true);
    try {
      const branchList = await getGitHubBranches(owner, repo);
      setBranches(branchList);
      if (branchList.length > 0) {
        const hasDefault = branchList.some((b) => b.name === defaultBranch);
        setSelectedBranch(hasDefault ? defaultBranch : branchList[0].name);
      } else {
        setSelectedBranch(defaultBranch);
      }
    } catch (err: any) {
      console.warn('Branch fetch warning:', err);
      setBranches([{ name: defaultBranch, protected: false }]);
      setSelectedBranch(defaultBranch);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const handleRepoChange = (newFullName: string) => {
    setSelectedRepoFullName(newFullName);
    setConflictWarning(null);
    const repoObj = repos.find((r) => r.full_name === newFullName);
    if (repoObj) {
      loadBranchesForRepo(repoObj.owner, repoObj.name, repoObj.default_branch);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepoFullName || !selectedBranch) {
      setErrorMessage('Please select a repository and branch.');
      return;
    }

    setErrorMessage(null);

    // 1. If we haven't checked conflict yet and user hasn't explicitly confirmed overwrite, check existence
    if (!confirmOverwrite && !conflictWarning) {
      try {
        const conflict = await checkGitHubConflict({
          repo: selectedRepoFullName,
          branch: selectedBranch,
          folder_path: folderPath.trim(),
          filename: filename.trim(),
        });

        if (conflict.exists) {
          setConflictWarning({ exists: true, sha: conflict.sha });
          return;
        }
      } catch (err: any) {
        console.warn('Conflict check error:', err);
      }
    }

    // 2. Perform actual upload
    setIsUploading(true);
    try {
      const res = await uploadDocumentToGitHub({
        document_id: document.id,
        repo: selectedRepoFullName,
        branch: selectedBranch,
        folder_path: folderPath.trim(),
        filename: filename.trim(),
        commit_message: commitMessage.trim(),
        overwrite_sha: conflictWarning?.sha,
      });

      setUploadResult(res);
      onSuccess(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'GitHub upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const filteredRepos = repos.filter(
    (r) =>
      r.full_name.toLowerCase().includes(repoSearch.toLowerCase()) ||
      r.name.toLowerCase().includes(repoSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <GitHubIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upload Word Document to GitHub</h3>
              <p className="text-xs text-slate-500">Commits genuine binary .docx file directly to repo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Document Summary Card */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{document.title}</p>
                <p className="font-mono text-[11px] text-slate-500">{document.filename}</p>
              </div>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-[11px]">
              {document.image_count} photos
            </span>
          </div>

          {/* Success Result View */}
          {uploadResult ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Successfully Uploaded to GitHub!</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Your document has been committed as a valid Microsoft Word binary file.
                </p>
                <div className="bg-white/80 p-3 rounded-lg border border-emerald-200/80 space-y-1.5 font-mono text-xs">
                  <div><span className="text-slate-400">Repository:</span> <span className="font-bold text-slate-800">{uploadResult.repo}</span></div>
                  <div><span className="text-slate-400">Branch:</span> <span className="text-slate-800">{uploadResult.branch}</span></div>
                  <div><span className="text-slate-400">Path:</span> <span className="text-slate-800">{uploadResult.path}</span></div>
                  <div><span className="text-slate-400">Commit SHA:</span> <span className="text-slate-600">{uploadResult.commit_sha.substring(0, 8)}</span></div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <a
                  href={uploadResult.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                >
                  <span>Open File on GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpload} className="space-y-4">
              {errorMessage && (
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Conflict Warning Alert */}
              {conflictWarning?.exists && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-xs text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>File Already Exists in this Repository</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    A file named <strong>{filename}</strong> already exists at <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono">{folderPath ? `${folderPath}/` : ''}{filename}</code> on branch <strong>{selectedBranch}</strong>.
                  </p>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-amber-900 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmOverwrite}
                      onChange={(e) => setConfirmOverwrite(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Yes, replace and overwrite the existing file on GitHub</span>
                  </label>
                </div>
              )}

              {/* Repository Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Target Repository *</span>
                  {isLoadingRepos && <span className="text-[10px] text-blue-600 font-normal">Loading repositories...</span>}
                </label>

                {repos.length > 5 && (
                  <input
                    type="text"
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    placeholder="Search your repositories..."
                    className="w-full mb-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-blue-500"
                  />
                )}

                <select
                  value={selectedRepoFullName}
                  onChange={(e) => handleRepoChange(e.target.value)}
                  disabled={isLoadingRepos || repos.length === 0}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 outline-none"
                >
                  {filteredRepos.map((r) => (
                    <option key={r.id} value={r.full_name}>
                      {r.full_name} {r.private ? '(Private)' : '(Public)'} {!r.can_push ? '⚠️ No push' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Branch *</span>
                  {isLoadingBranches && <span className="text-[10px] text-blue-600 font-normal">Fetching branches...</span>}
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setConflictWarning(null);
                  }}
                  disabled={isLoadingBranches || branches.length === 0}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 outline-none font-mono"
                >
                  {branches.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} {b.protected ? '(Protected)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Folder & Destination Filename */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Target Folder
                  </label>
                  <div className="relative">
                    <Folder className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={folderPath}
                      onChange={(e) => {
                        setFolderPath(e.target.value);
                        setConflictWarning(null);
                      }}
                      placeholder="e.g., documents/2026"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Leave empty for repository root</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Destination Filename *
                  </label>
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => {
                      setFilename(e.target.value);
                      setConflictWarning(null);
                    }}
                    placeholder="document.docx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Must end with .docx</span>
                </div>
              </div>

              {/* Commit Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Commit Message
                </label>
                <div className="relative">
                  <GitCommit className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Commit message..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Target Path Preview */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-center space-x-1.5">
                <span>Will commit to:</span>
                <span className="font-mono text-slate-700 font-semibold truncate">
                  {selectedRepoFullName} @ {selectedBranch}:/{folderPath ? `${folderPath}/` : ''}{filename}
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUploading || (conflictWarning?.exists && !confirmOverwrite)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold shadow-md transition active:scale-95"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading Binary .docx...</span>
                    </>
                  ) : (
                    <>
                      <GitHubIcon className="w-4 h-4" />
                      <span>{conflictWarning?.exists ? 'Overwrite on GitHub' : 'Commit to GitHub'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

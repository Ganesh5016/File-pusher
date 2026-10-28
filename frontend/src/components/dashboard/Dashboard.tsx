import React from 'react';
import {
  FileText,
  FilePlus,
  CheckCircle2,
  Download,
  Eye,
  Trash2,
  ArrowRight,
  Images,
  FolderGit2,
  ExternalLink
} from 'lucide-react';
import { GitHubIcon } from '../ui/GitHubIcon';
import type { DocumentItem, GitHubConfigStatus } from '../../types';
import { getDocumentDownloadUrl } from '../../services/api';

interface DashboardProps {
  documents: DocumentItem[];
  gitHubConfig: GitHubConfigStatus | null;
  onNavigate: (tab: string) => void;
  onPreviewDocument: (doc: DocumentItem) => void;
  onUploadGitHub: (doc: DocumentItem) => void;
  onDeleteDocument: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  documents,
  gitHubConfig,
  onNavigate,
  onPreviewDocument,
  onUploadGitHub,
  onDeleteDocument,
}) => {
  // Compute metrics
  const totalDocs = documents.length;
  const syncedDocs = documents.filter((d) => d.upload_status === 'uploaded').length;
  const totalPhotos = documents.reduce((sum, d) => sum + (d.image_count || 0), 0);
  const recentDocs = documents.slice(0, 5);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-lg shadow-blue-500/10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-blue-100 mb-3 border border-white/20">
            <span>✨ Turn Raw Photos Into Clean Word Documents</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to Snap2Doc
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-xl leading-relaxed">
            Upload your images, customize layout & captions, automatically build formatted Microsoft Word documents, and commit directly to GitHub.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('create')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 shadow-md active:scale-95 transition"
            >
              <FilePlus className="w-4 h-4" />
              <span>Create New Document</span>
            </button>
            <button
              onClick={() => onNavigate('github')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-800/60 hover:bg-blue-800 text-white font-medium text-sm border border-white/20 backdrop-blur-sm transition"
            >
              <GitHubIcon className="w-4 h-4" />
              <span>{gitHubConfig?.is_configured ? 'Manage GitHub Sync' : 'Connect GitHub'}</span>
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Documents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Word Docs</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalDocs}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Created locally</p>
          </div>
        </div>

        {/* GitHub Synced */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GitHub Synced</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{syncedDocs}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Committed binary .docx</p>
          </div>
        </div>

        {/* Photos Processed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Images className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Photos Handled</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalPhotos}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">EXIF auto-rotated</p>
          </div>
        </div>

        {/* GitHub Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${gitHubConfig?.is_configured ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            <GitHubIcon className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GitHub Integration</p>
            <p className={`text-sm font-bold truncate mt-0.5 ${gitHubConfig?.is_configured ? 'text-emerald-700' : 'text-slate-700'}`}>
              {gitHubConfig?.is_configured ? `@${gitHubConfig.username || 'Connected'}` : 'Not Connected'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {gitHubConfig?.is_configured ? 'Ready for uploads' : 'Configure token'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Documents Table / Card Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Documents</h2>
            <p className="text-xs text-slate-500">Word documents generated in your workspace</p>
          </div>
          {totalDocs > 0 && (
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View all ({totalDocs})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {totalDocs === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3">
              <FilePlus className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No documents yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Get started by uploading photos to generate your first beautifully formatted Word document.
            </p>
            <button
              onClick={() => onNavigate('create')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <FilePlus className="w-4 h-4" />
              <span>Create First Document</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
              >
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100/60">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {doc.title || doc.filename}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                      <span className="font-mono text-[11px] text-slate-600">{doc.filename}</span>
                      <span>•</span>
                      <span>{doc.image_count} {doc.image_count === 1 ? 'photo' : 'photos'}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.file_size_bytes)}</span>
                      <span>•</span>
                      <span>{formatDate(doc.created_at)}</span>
                    </div>

                    {/* GitHub commit badge */}
                    {doc.upload_status === 'uploaded' && doc.github_html_url && (
                      <div className="mt-1.5 flex items-center space-x-1.5">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Pushed to {doc.github_repo} ({doc.github_branch})</span>
                        </span>
                        <a
                          href={doc.github_html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline inline-flex items-center space-x-0.5"
                        >
                          <span>Open on GitHub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  {/* Preview */}
                  <button
                    onClick={() => onPreviewDocument(doc)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                    title="Preview Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Download */}
                  <a
                    href={getDocumentDownloadUrl(doc.id)}
                    download={doc.filename}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 transition"
                    title="Download Word (.docx)"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {/* GitHub Upload Button */}
                  <button
                    onClick={() => onUploadGitHub(doc)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                      doc.upload_status === 'uploaded'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <GitHubIcon className="w-3.5 h-3.5" />
                    <span>{doc.upload_status === 'uploaded' ? 'Re-sync' : 'Sync to GitHub'}</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

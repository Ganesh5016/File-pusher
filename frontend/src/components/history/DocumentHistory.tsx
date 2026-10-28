import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  FileQuestion
} from 'lucide-react';
import { GitHubIcon } from '../ui/GitHubIcon';
import type { DocumentItem } from '../../types';
import { getDocumentDownloadUrl } from '../../services/api';

interface DocumentHistoryProps {
  documents: DocumentItem[];
  onNavigate: (tab: string) => void;
  onPreviewDocument: (doc: DocumentItem) => void;
  onUploadGitHub: (doc: DocumentItem) => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentHistory: React.FC<DocumentHistoryProps> = ({
  documents,
  onNavigate,
  onPreviewDocument,
  onUploadGitHub,
  onDeleteDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'uploaded' | 'not_uploaded'>('all');

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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || doc.upload_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Document History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete archive of generated Word documents and GitHub commit links.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Document</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or filename..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">All Documents ({documents.length})</option>
            <option value="uploaded">Synced to GitHub ({documents.filter((d) => d.upload_status === 'uploaded').length})</option>
            <option value="not_uploaded">Local Workspace ({documents.filter((d) => d.upload_status !== 'uploaded').length})</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileQuestion className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No documents found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-5">
            {documents.length === 0
              ? 'You have not created any Word documents yet.'
              : 'No documents match your search criteria.'}
          </p>
          {documents.length === 0 && (
            <button
              onClick={() => onNavigate('create')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Document</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Document details */}
              <div className="flex items-start space-x-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {doc.title || doc.filename}
                    </h3>
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md hidden sm:inline-block">
                      {doc.filename}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>{doc.image_count} {doc.image_count === 1 ? 'photo' : 'photos'}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.file_size_bytes)}</span>
                    <span>•</span>
                    <span className="uppercase text-[10px] font-bold text-slate-600">{doc.page_orientation}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(doc.created_at)}</span>
                    </span>
                  </div>

                  {/* GitHub Status & Links */}
                  {doc.upload_status === 'uploaded' && doc.github_html_url ? (
                    <div className="pt-1.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Committed to {doc.github_repo} ({doc.github_branch})</span>
                      </span>
                      <a
                        href={doc.github_html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline inline-flex items-center space-x-1 font-medium"
                      >
                        <span>Open on GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="pt-1 text-[11px] text-slate-400">
                      Not yet synced to GitHub
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
                {/* Preview */}
                <button
                  onClick={() => onPreviewDocument(doc)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition flex items-center space-x-1.5"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Preview</span>
                </button>

                {/* Download Word Document */}
                <a
                  href={getDocumentDownloadUrl(doc.id)}
                  download={doc.filename}
                  className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
                  title="Download .docx"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .docx</span>
                </a>

                {/* GitHub Upload Button */}
                <button
                  onClick={() => onUploadGitHub(doc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 border ${
                    doc.upload_status === 'uploaded'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <GitHubIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{doc.upload_status === 'uploaded' ? 'Re-sync' : 'Sync GitHub'}</span>
                </button>

                {/* Delete Record */}
                <button
                  onClick={() => onDeleteDocument(doc.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Calendar,
  HardDrive,
  Images,
  ExternalLink,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { GitHubIcon } from '../ui/GitHubIcon';
import type { DocumentItem } from '../../types';
import { getDocumentPreviewHtml, getDocumentDownloadUrl } from '../../services/api';

interface DocumentPreviewScreenProps {
  document: DocumentItem;
  onBack: () => void;
  onUploadGitHub: (doc: DocumentItem) => void;
  onRegenerate: () => void;
}

export const DocumentPreviewScreen: React.FC<DocumentPreviewScreenProps> = ({
  document,
  onBack,
  onUploadGitHub,
  onRegenerate,
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingPreview(true);
    getDocumentPreviewHtml(document.id)
      .then((html) => {
        if (isMounted) {
          setHtmlContent(html);
          setIsLoadingPreview(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load preview:', err);
        if (isMounted) {
          setHtmlContent('<p class="text-red-500">Failed to render document preview.</p>');
          setIsLoadingPreview(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [document.id]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  const copyFilename = () => {
    navigator.clipboard.writeText(document.filename);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* GitHub Status pill */}
        {document.upload_status === 'uploaded' && document.github_html_url ? (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pushed to {document.github_repo} ({document.github_branch})</span>
            <a
              href={document.github_html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-900 underline inline-flex items-center ml-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-medium">
            Saved locally in workspace
          </div>
        )}
      </div>

      {/* Document Overview Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Metadata */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {document.title || document.filename}
                </h1>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {document.filename}
                  </span>
                  <button
                    onClick={copyFilename}
                    className="p-1 text-slate-400 hover:text-slate-700 transition"
                    title="Copy filename"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Badges Info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <Images className="w-3.5 h-3.5 text-blue-600" />
                <span>{document.image_count} photos embedded</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
                <span>{formatFileSize(document.file_size_bytes)}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatDate(document.created_at)}</span>
              </div>
              <div className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 uppercase text-[10px] font-bold text-slate-600">
                {document.page_orientation}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Download Button */}
            <a
              href={getDocumentDownloadUrl(document.id)}
              download={document.filename}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Word Document</span>
            </a>

            {/* Upload to GitHub */}
            <button
              onClick={() => onUploadGitHub(document)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md shadow-slate-900/10 active:scale-95 transition"
            >
              <GitHubIcon className="w-4 h-4" />
              <span>{document.upload_status === 'uploaded' ? 'Re-sync to GitHub' : 'Upload to GitHub'}</span>
            </button>

            {/* Regenerate */}
            <button
              onClick={onRegenerate}
              className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
              title="Create another document"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Microsoft Word Document Sheet */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-semibold text-slate-700">Microsoft Word Document Preview</span>
          <span>Standard .docx rendering</span>
        </div>

        <div className="bg-slate-200/60 p-4 sm:p-8 rounded-2xl border border-slate-300/80 flex justify-center shadow-inner overflow-x-auto">
          {isLoadingPreview ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-600 font-medium">Extracting Word preview...</p>
            </div>
          ) : (
            <div
              className={`word-sheet rounded-md bg-white border border-slate-200/90 p-8 sm:p-14 text-slate-800 ${
                document.page_orientation === 'landscape' ? 'w-full max-w-4xl' : 'w-full max-w-3xl'
              }`}
              style={{ minHeight: '600px' }}
            >
              {/* Document Header representation */}
              <div className="border-b border-slate-100 pb-3 mb-6 flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Snap2Doc Preview</span>
                <span>{document.title}</span>
              </div>

              {/* Rendered HTML from Mammoth */}
              <div
                className="docx-preview-content prose prose-slate max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />

              {/* Document Footer representation */}
              <div className="border-t border-slate-100 pt-6 mt-12 text-center text-[10px] text-slate-400 font-mono">
                Generated with Snap2Doc — Modern Photo to Word Document Generator
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

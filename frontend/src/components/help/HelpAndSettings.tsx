import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Lock
} from 'lucide-react';

interface HelpAndSettingsProps {
  backendHealthy: boolean;
  onNavigate: (tab: string) => void;
}

export const HelpAndSettings: React.FC<HelpAndSettingsProps> = ({
  backendHealthy,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Snap2Doc convert photos into a Microsoft Word (.docx) document?',
      a: 'When you upload photos and click Generate, Snap2Doc uses python-docx and Pillow on the backend. It automatically detects camera EXIF tags to rotate photos right-side-up, resizes large photos for optimal file size, formats page margins and headers, inserts captions, and outputs a genuine, standards-compliant .docx file that opens natively in Microsoft Word, LibreOffice, and Google Docs.'
    },
    {
      q: 'How does GitHub synchronization work?',
      a: 'Snap2Doc integrates directly with the GitHub Contents REST API. When you upload a document, the genuine binary .docx file is base64 encoded and committed directly to your chosen repository, branch, and directory path. It records the commit SHA and provides a direct URL to view the file on GitHub.'
    },
    {
      q: 'What GitHub token permissions are required?',
      a: 'For Classic Personal Access Tokens, check the "repo" scope (full control of private repositories and commits). For Fine-Grained Personal Access Tokens, grant "Contents: Read and write" permission for your target repositories. Tokens are never exposed in frontend code and remain secure on your server.'
    },
    {
      q: 'What image formats and file size limits are supported?',
      a: 'Snap2Doc supports JPG, JPEG, PNG, and WEBP images. Individual photos can be up to 25MB each, with a total upload limit of 150MB per document generation session.'
    },
    {
      q: 'How does Snap2Doc handle file conflicts on GitHub?',
      a: 'Before committing, Snap2Doc automatically queries GitHub to see if a file with the target filename already exists in the selected folder and branch. If it does, Snap2Doc asks for your explicit confirmation before overwriting the file with a new commit.'
    },
    {
      q: 'Are uploaded photos stored permanently?',
      a: 'No. Snap2Doc temporarily processes your images in memory and session directories solely to generate the Word document. Once the .docx file is created, raw temporary image files are wiped immediately to maintain user privacy.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
          <HelpCircle className="w-8 h-8 text-blue-600" />
          <span>Help & Documentation</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-xl">
          Everything you need to know about photo formatting, Word documents, and GitHub synchronization.
        </p>
      </div>

      {/* System Status Diagnostic Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-indigo-600" />
          <span>System Health & Engine Diagnostics</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase">FastAPI Backend</span>
            <div className="mt-1 flex items-center space-x-1.5 text-xs font-bold text-slate-800">
              <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span>{backendHealthy ? 'Active & Ready' : 'Offline'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Word Generator</span>
            <div className="mt-1 flex items-center space-x-1.5 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>python-docx v1.2</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase">EXIF Orientation</span>
            <div className="mt-1 flex items-center space-x-1.5 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pillow 11.3</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Document DB</span>
            <div className="mt-1 flex items-center space-x-1.5 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>SQLite Persistent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg space-y-4">
        <div className="flex items-center space-x-2.5">
          <Lock className="w-6 h-6 text-blue-300" />
          <h2 className="text-lg font-bold">Enterprise Security Standard</h2>
        </div>
        <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
          Snap2Doc is designed with strict security isolation. GitHub authentication tokens remain encrypted or protected within the backend database environment, file paths are sanitized against directory traversal, and raw image buffers are cleaned up immediately following document assembly.
        </p>
        <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-blue-200">
          <span>✓ No client token leakage</span>
          <span>✓ Binary base64 contents API</span>
          <span>✓ Session image purge</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-sm text-slate-800 hover:text-blue-600 transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed pr-6 animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

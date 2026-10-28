import React from 'react';
import {
  UploadCloud,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Images,
  FolderGit2,
  Compass
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onGoToDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onGoToDashboard,
}) => {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 text-center max-w-4xl mx-auto px-4">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Professional Word Document Generator & GitHub Syncer</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Turn Photos into <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Polished Word Documents</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Upload individual or batch photos, organize captions and orientations, automatically compile authentic Microsoft Word <code className="font-mono text-sm bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">.docx</code> documents, and commit directly to GitHub.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-95 transition"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Create Document Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onGoToDashboard}
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm shadow-sm active:scale-95 transition"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            <span>Go to Dashboard</span>
          </button>
        </div>

        {/* Feature Badges Bar */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs font-semibold text-slate-500">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Genuine .docx Binary Output</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>EXIF Camera Auto-Rotation</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>One-Click GitHub Commit</span>
          </div>
        </div>
      </section>

      {/* 3-Step Visual Workflow */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">How Snap2Doc Works</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">From raw image files to GitHub repository in three simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-200 transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Upload & Reorder Photos</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drag and drop JPG, JPEG, PNG, or WEBP photos. The engine auto-corrects orientation tags from smartphones and lets you reorder photos easily.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-200 transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Customize Layout & Captions</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Set document titles, add intro text, customize individual photo captions, select portrait or landscape layout, and pick image sizing presets.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-200 transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-extrabold text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Generate & Commit to GitHub</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download the genuine Word file immediately, or push the binary .docx directly to any GitHub repository and branch with conflict checking.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-8 sm:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Precision Engineering</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Built for High Fidelity & Complete Privacy
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Snap2Doc generates real Microsoft Word documents using <code className="text-blue-300">python-docx</code> rather than HTML compromises. File sizes are automatically optimized and credentials are kept strictly server-side.
              </p>
              <div className="pt-2">
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  <span>Start Creating Documents</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-white">Private & Safe</h4>
                <p className="text-slate-400">Tokens never leave your server; temporary photos purged after doc build.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <FileCheck2 className="w-5 h-5 text-blue-400" />
                <h4 className="font-bold text-white">Genuine .docx</h4>
                <p className="text-slate-400">Opens seamlessly in Microsoft Word, LibreOffice, and Google Docs.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <FolderGit2 className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-white">GitHub API Sync</h4>
                <p className="text-slate-400">Binary preservation with base64 payload to GitHub Contents API.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <Images className="w-5 h-5 text-sky-400" />
                <h4 className="font-bold text-white">Smart Scaling</h4>
                <p className="text-slate-400">Auto EXIF rotation and Lanczos image compression to prevent bloated docs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

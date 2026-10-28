import React from 'react';
import { FileText, CheckCircle2, PlusCircle } from 'lucide-react';
import { GitHubIcon } from '../ui/GitHubIcon';
import type { GitHubConfigStatus } from '../../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  gitHubConfig: GitHubConfigStatus | null;
  backendHealthy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  gitHubConfig,
  backendHealthy,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">Snap2Doc</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Photo to Word Document & GitHub Uploader</p>
            </div>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center space-x-3">
            {/* Backend health pill */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-600 border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span className="font-medium">{backendHealthy ? 'Backend Ready' : 'Connecting...'}</span>
            </div>

            {/* GitHub Status Pill */}
            {gitHubConfig?.is_configured ? (
              <button
                onClick={() => onNavigate('github')}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-sm"
              >
                {gitHubConfig.avatar_url ? (
                  <img src={gitHubConfig.avatar_url} alt="GitHub Avatar" className="w-4 h-4 rounded-full" />
                ) : (
                  <GitHubIcon className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="hidden sm:inline">Connected as</span>
                <span className="font-semibold text-emerald-800">@{gitHubConfig.username || 'user'}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('github')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition border border-slate-200"
              >
                <GitHubIcon className="w-3.5 h-3.5" />
                <span>Connect GitHub</span>
              </button>
            )}

            {/* New Document Button */}
            <button
              onClick={() => onNavigate('create')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-[0.98] transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">New Document</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

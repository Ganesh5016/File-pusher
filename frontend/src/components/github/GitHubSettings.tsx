import React, { useState } from 'react';
import {
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Trash2,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  HelpCircle
} from 'lucide-react';
import { GitHubIcon } from '../ui/GitHubIcon';
import type { GitHubConfigStatus, GitHubTestResponse } from '../../types';
import {
  saveGitHubSettings,
  disconnectGitHub,
  testGitHubConnection
} from '../../services/api';

interface GitHubSettingsProps {
  config: GitHubConfigStatus | null;
  onConfigUpdated: (config: GitHubConfigStatus | null) => void;
}

export const GitHubSettings: React.FC<GitHubSettingsProps> = ({
  config,
  onConfigUpdated,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTestToken = async () => {
    setIsTesting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await testGitHubConnection(tokenInput.trim() || undefined);
      if (!result.valid) {
        setErrorMessage(result.error || 'GitHub token test failed.');
      } else {
        setSuccessMessage(`Valid connection! Authenticated as @${result.login}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with GitHub.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setErrorMessage('Please enter a GitHub Personal Access Token.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedConfig = await saveGitHubSettings(tokenInput.trim());
      onConfigUpdated(updatedConfig);
      setTokenInput('');
      setSuccessMessage('GitHub token securely saved! You can now sync documents.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save GitHub token.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect GitHub?')) return;
    try {
      await disconnectGitHub();
      onConfigUpdated(null);
      setSuccessMessage('GitHub disconnected successfully.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to disconnect GitHub.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
          <GitHubIcon className="w-8 h-8 text-slate-900" />
          <span>GitHub Integration Settings</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-xl">
          Connect your GitHub account to commit generated Microsoft Word files directly to any repository and branch.
        </p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Connection Status Card */}
      {config?.is_configured ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900">Active GitHub Connection</h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Connected
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              {config.avatar_url ? (
                <img
                  src={config.avatar_url}
                  alt={config.username || 'User'}
                  className="w-14 h-14 rounded-full border-2 border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                  <GitHubIcon className="w-8 h-8" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {config.name || config.username || 'GitHub User'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">@{config.username}</p>
                <div className="mt-1 flex items-center space-x-2 text-xs text-slate-400">
                  <span>Token: <span className="font-mono text-slate-600">{config.masked_token}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleTestToken}
                disabled={isTesting}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Test Connection</span>
              </button>

              <button
                onClick={handleDisconnect}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Key className="w-5 h-5 text-blue-600" />
              <span>Connect GitHub Account</span>
            </h2>
            <span className="text-xs text-slate-400">Personal Access Token</span>
          </div>

          <form onSubmit={handleSaveToken} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                GitHub Personal Access Token (PAT) *
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_xxxx..."
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Tokens are stored securely in your local backend database and never exposed to client browsers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving || !tokenInput.trim()}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Save & Connect GitHub</span>
              </button>

              <button
                type="button"
                onClick={handleTestToken}
                disabled={isTesting || !tokenInput.trim()}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition"
              >
                {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Test Token Before Saving</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Architecture Notice */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Security & Credential Safety</span>
        </div>
        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
          <li><strong>Zero Secret Exposure:</strong> Personal access tokens are handled entirely server-side.</li>
          <li><strong>Fine-Grained Permissions:</strong> You can generate a fine-grained token with permission strictly restricted to selected repositories.</li>
          <li><strong>Binary Document Upload:</strong> Word files are encoded as genuine base64 payload to the GitHub Contents API without corrupting `.docx` zip archives.</li>
        </ul>
      </div>

      {/* How to create token instructions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>How to Create a GitHub Personal Access Token</span>
          </h3>
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center space-x-1 font-semibold"
          >
            <span>Open GitHub Token Settings</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <ol className="text-xs text-slate-600 space-y-2.5 list-decimal list-inside leading-relaxed">
          <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-blue-600 underline">GitHub Settings &gt; Developer settings &gt; Personal access tokens</a>.</li>
          <li>Select <strong>Tokens (classic)</strong> &gt; <strong>Generate new token (classic)</strong> (or Fine-grained tokens).</li>
          <li>Set Note to <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">Snap2Doc Uploader</code>.</li>
          <li>Check the <code className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold">repo</code> scope (Full control of private repositories and commits).</li>
          <li>Click <strong>Generate token</strong> at the bottom of the page.</li>
          <li>Copy the generated token string (<code className="font-mono text-slate-700">ghp_...</code>) and paste it into the field above.</li>
        </ol>
      </div>
    </div>
  );
};

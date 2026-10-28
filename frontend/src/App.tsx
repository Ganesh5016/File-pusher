import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { CreateDocument } from './components/create/CreateDocument';
import { DocumentPreviewScreen } from './components/preview/DocumentPreviewScreen';
import { DocumentHistory } from './components/history/DocumentHistory';
import { GitHubSettings } from './components/github/GitHubSettings';
import { GitHubUploadModal } from './components/github/GitHubUploadModal';
import { HelpAndSettings } from './components/help/HelpAndSettings';

import type { DocumentItem, GitHubConfigStatus, GitHubUploadResult } from './types';
import {
  getDocuments,
  deleteDocument,
  getGitHubSettings,
  checkBackendHealth,
} from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activePreviewDoc, setActivePreviewDoc] = useState<DocumentItem | null>(null);
  const [gitHubModalDoc, setGitHubModalDoc] = useState<DocumentItem | null>(null);
  const [gitHubConfig, setGitHubConfig] = useState<GitHubConfigStatus | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial data loading
  useEffect(() => {
    // Health check
    checkBackendHealth().then((healthy) => setBackendHealthy(healthy));

    // Load GitHub Config
    getGitHubSettings()
      .then((cfg) => setGitHubConfig(cfg))
      .catch((err) => console.warn('Could not fetch GitHub config:', err));

    // Load Documents history
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    getDocuments()
      .then((docs) => setDocuments(docs))
      .catch((err) => console.warn('Could not fetch documents:', err));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleDocumentCreated = (doc: DocumentItem) => {
    setDocuments((prev) => [doc, ...prev]);
    setActivePreviewDoc(doc);
    setCurrentTab('preview');
    showToast(`Word document "${doc.filename}" generated successfully!`);
  };

  const handlePreviewDocument = (doc: DocumentItem) => {
    setActivePreviewDoc(doc);
    setCurrentTab('preview');
  };

  const handleUploadGitHub = (doc: DocumentItem) => {
    setGitHubModalDoc(doc);
  };

  const handleGitHubSuccess = (result: GitHubUploadResult) => {
    // Reload documents to get updated GitHub status
    loadDocuments();
    if (activePreviewDoc && activePreviewDoc.id) {
      setActivePreviewDoc((prev) =>
        prev
          ? {
              ...prev,
              upload_status: 'uploaded',
              github_repo: result.repo,
              github_branch: result.branch,
              github_html_url: result.html_url,
              github_commit_sha: result.commit_sha,
            }
          : null
      );
    }
    showToast(`Successfully uploaded "${result.filename}" to ${result.repo}!`);
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document from history?')) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (activePreviewDoc?.id === id) {
        setActivePreviewDoc(null);
        setCurrentTab('dashboard');
      }
      showToast('Document removed successfully.');
    } catch (err: any) {
      alert('Failed to delete document: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          if (tab !== 'preview') setActivePreviewDoc(null);
          setCurrentTab(tab);
        }}
        gitHubConfig={gitHubConfig}
        backendHealthy={backendHealthy}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onNavigate={(tab) => {
            if (tab !== 'preview') setActivePreviewDoc(null);
            setCurrentTab(tab);
          }}
          documentCount={documents.length}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {toastMessage}
            </div>
          )}

          {/* Tab Views */}
          {currentTab === 'landing' && (
            <LandingPage
              onGetStarted={() => setCurrentTab('create')}
              onGoToDashboard={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'dashboard' && (
            <Dashboard
              documents={documents}
              gitHubConfig={gitHubConfig}
              onNavigate={(tab) => setCurrentTab(tab)}
              onPreviewDocument={handlePreviewDocument}
              onUploadGitHub={handleUploadGitHub}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {currentTab === 'create' && (
            <CreateDocument
              onDocumentCreated={handleDocumentCreated}
              onCancel={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'preview' && activePreviewDoc && (
            <DocumentPreviewScreen
              document={activePreviewDoc}
              onBack={() => setCurrentTab('dashboard')}
              onUploadGitHub={handleUploadGitHub}
              onRegenerate={() => setCurrentTab('create')}
            />
          )}

          {currentTab === 'history' && (
            <DocumentHistory
              documents={documents}
              onNavigate={(tab) => setCurrentTab(tab)}
              onPreviewDocument={handlePreviewDocument}
              onUploadGitHub={handleUploadGitHub}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {currentTab === 'github' && (
            <GitHubSettings
              config={gitHubConfig}
              onConfigUpdated={(cfg) => setGitHubConfig(cfg)}
            />
          )}

          {currentTab === 'help' && (
            <HelpAndSettings
              backendHealthy={backendHealthy}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}
        </main>
      </div>

      {/* Global GitHub Upload Modal */}
      {gitHubModalDoc && (
        <GitHubUploadModal
          document={gitHubModalDoc}
          isOpen={!!gitHubModalDoc}
          onClose={() => setGitHubModalDoc(null)}
          onSuccess={handleGitHubSuccess}
        />
      )}
    </div>
  );
}

export default App;

import React from 'react';
import {
  LayoutDashboard,
  FilePlus,
  History,
  HelpCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { GitHubIcon } from '../ui/GitHubIcon';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  documentCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  documentCount = 0,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Create Document', icon: FilePlus, badge: 'New' },
    { id: 'history', label: 'Document History', icon: History, count: documentCount },
    { id: 'github', label: 'GitHub Settings', icon: GitHubIcon },
    { id: 'help', label: 'Help & Guides', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden lg:flex shrink-0">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {item.badge}
                  </span>
                )}
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feature highlight banner */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80 text-left">
          <div className="flex items-center space-x-2 text-blue-800 font-semibold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Smart Formatting</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Auto-rotates mobile photos, formats page margins, and outputs genuine Microsoft Word .docx files.
          </p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
        <span>Snap2Doc © 2026</span>
        <button
          onClick={() => onNavigate('help')}
          className="hover:text-blue-600 transition flex items-center space-x-1"
        >
          <span>Docs</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};

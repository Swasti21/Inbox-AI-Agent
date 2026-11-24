import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  CheckCircle2,
  History,
  Boxes,
  Settings,
  Bot,
  CircleDot,
  MailCheck,
} from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  pendingCount: number;
  isBackendHealthy: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  isBackendHealthy,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'inbox' as NavTab,
      label: 'Inbox',
      icon: Inbox,
      badge: null,
    },
    {
      id: 'approvals' as NavTab,
      label: 'Pending Approvals',
      icon: CheckCircle2,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'activity' as NavTab,
      label: 'Activity History',
      icon: History,
      badge: null,
    },
    {
      id: 'integrations' as NavTab,
      label: 'Integrations',
      icon: Boxes,
      badge: null,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-semibold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
            Recruiter Inbox <span className="text-[10px] bg-brand-50 text-brand-700 font-bold px-1.5 py-0.5 rounded border border-brand-200">AI</span>
          </h1>
          <p className="text-xs text-slate-600 font-medium">Autonomous Email Agent</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Agent Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-brand-600' : 'text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                    item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* HITL Safety Badge */}
      <div className="mx-3 mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
          <MailCheck className="w-3.5 h-3.5 text-brand-600" />
          <span>Human-in-the-Loop</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Draft replies pause for approval. No emails are sent autonomously.
        </p>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {isBackendHealthy ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              )}
            </span>
            <span className="text-xs font-medium text-slate-700">
              {isBackendHealthy ? 'Backend Active' : 'Backend Offline'}
            </span>
          </div>
          <span className="text-[10px] text-slate-600 font-mono">
            {isBackendHealthy ? 'Port 8000' : 'No connection'}
          </span>
        </div>
      </div>
    </aside>
  );
};

import React from 'react';
import { RefreshCw, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { NavTab } from '../types';

interface HeaderProps {
  activeTab: NavTab;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenTriageModal: () => void;
  isBackendHealthy: boolean;
  pendingCount: number;
}

const tabDescriptions: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Recruiter Dashboard',
    subtitle: 'Overview of autonomous email triage, approvals, and agent activity.',
  },
  inbox: {
    title: 'Processed Inbox',
    subtitle: 'Browse all recruiter inquiries, classifications, and AI summaries.',
  },
  approvals: {
    title: 'AI Approval Centre',
    subtitle: 'Human-in-the-loop review. Approve, edit, or reject AI-drafted replies.',
  },
  activity: {
    title: 'Activity & Execution History',
    subtitle: 'Telemetry on LangGraph workflows, state runs, and automated retries.',
  },
  integrations: {
    title: 'System Integrations',
    subtitle: 'Connection health for Gmail, Slack notifications, and Notion candidate tracker.',
  },
  settings: {
    title: 'Settings & Architecture',
    subtitle: 'Configure backend endpoints, polling intervals, and application preferences.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onRefresh,
  isRefreshing,
  onOpenTriageModal,
  isBackendHealthy,
  pendingCount,
}) => {
  const current = tabDescriptions[activeTab];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 leading-tight">
          {current.title}
        </h2>
        <p className="text-xs text-slate-500">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend health pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isBackendHealthy
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {isBackendHealthy ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          )}
          <span>{isBackendHealthy ? 'FastAPI Connected' : 'Backend Disconnected'}</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Data"
          className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
        </button>

        {/* Triage New Email button */}
        <button
          onClick={onOpenTriageModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-brand-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Triage New Email</span>
        </button>
      </div>
    </header>
  );
};

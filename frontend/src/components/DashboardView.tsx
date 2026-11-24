import React from 'react';
import {
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Bot,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Run, EmailRecord, NavTab } from '../types';

interface DashboardViewProps {
  runs: Run[];
  cachedEmails: Record<string, Partial<EmailRecord>>;
  isBackendHealthy: boolean;
  onNavigate: (tab: NavTab) => void;
  onApprove: (runId: string) => void;
  onReject: (runId: string) => void;
  onSelectRun: (run: Run) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  runs,
  cachedEmails,
  isBackendHealthy,
  onNavigate,
  onApprove,
  onReject,
  onSelectRun,
}) => {
  const totalRuns = runs.length;
  const pendingRuns = runs.filter((r) => r.status === 'awaiting_approval');
  const completedRuns = runs.filter((r) => r.status === 'completed');
  const issueRuns = runs.filter((r) => r.status === 'failed' || r.status === 'rejected');

  const recentRuns = runs.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Ingested
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalRuns}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Emails evaluated by agent</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">
              Pending Approvals
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingRuns.length}</h3>
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <span>Human review required</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
              Successfully Completed
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{completedRuns.length}</h3>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <span>Triaged, logged & dispatched</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Rejected / Failures
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{issueRuns.length}</h3>
            <p className="text-xs text-slate-500 mt-1">
              <span>Human rejected or tool failed</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Approvals Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Pending Approvals ({pendingRuns.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('approvals')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingRuns.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">You're all caught up!</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    No emails are waiting for approval right now. New recruiter messages requiring replies will pause here.
                  </p>
                </div>
              ) : (
                pendingRuns.slice(0, 3).map((run) => {
                  const cached = cachedEmails[run.message_id];
                  const sender = cached?.sender || `Message #${run.message_id}`;
                  const subject = cached?.subject || 'Recruiter inquiry requiring availability reply';
                  const summary = cached?.summary || 'AI triaged as high priority; drafted personalized candidate availability reply.';

                  return (
                    <div key={run.run_id} className="p-5 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900 truncate">
                              {sender}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              Run {run.run_id}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-800 truncate">{subject}</p>
                          <p className="text-xs text-slate-500 line-clamp-2">{summary}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onApprove(run.run_id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-600/20 transition-all"
                          >
                            Approve & Send
                          </button>
                          <button
                            onClick={() => onReject(run.run_id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Recent Agent Activity</h3>
              </div>
              <button
                onClick={() => onNavigate('activity')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <span>Full history</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentRuns.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No activity runs recorded yet in the database.
                </div>
              ) : (
                recentRuns.map((run) => {
                  const cached = cachedEmails[run.message_id];
                  const sender = cached?.sender || `Message #${run.message_id}`;
                  const subject = cached?.subject || 'Automated email triage run';

                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Completed
                    </span>
                  );
                  if (run.status === 'awaiting_approval') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Needs Approval
                      </span>
                    );
                  } else if (run.status === 'rejected') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        Rejected
                      </span>
                    );
                  } else if (run.status === 'failed') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                        Failed
                      </span>
                    );
                  }

                  return (
                    <div
                      key={run.run_id}
                      onClick={() => onSelectRun(run)}
                      className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {sender} <span className="text-slate-400 font-normal">— {subject}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Run ID: <span className="font-mono">{run.run_id}</span> • Started {run.started_at}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {statusBadge}
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* System Health Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>System & Integration Status</span>
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">FastAPI Backend</span>
                <span className={`font-semibold flex items-center gap-1.5 ${isBackendHealthy ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {isBackendHealthy ? 'Operational (200 OK)' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Gmail Ingestion (n8n)</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active Webhook
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Slack Dispatch</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Channel Ready
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Notion Tracker</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Database Syncing
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">LangGraph Checkpoint</span>
                <span className="font-semibold text-brand-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  MemorySaver Active
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                onClick={() => onNavigate('integrations')}
                className="w-full text-center text-xs font-semibold text-brand-600 hover:text-brand-700 py-1"
              >
                Configure Integrations →
              </button>
            </div>
          </div>

          {/* Workflow Guide */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-xl p-5 text-white shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Agentic Pipeline
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Recruiter Inbox AI automatically classifies emails, logs candidate info into Notion, summarizes to Slack, and drafts polite replies with exponential-backoff retries.
            </p>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center font-bold text-[9px] text-white">1</span>
                <span>Gmail Trigger → Triage (LLM)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center font-bold text-[9px] text-white">2</span>
                <span>Draft Reply + Notion + Slack</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-500/40 text-brand-300 flex items-center justify-center font-bold text-[9px]">3</span>
                <span className="text-brand-300 font-semibold">Human Approval Guardrail</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center font-bold text-[9px] text-white">4</span>
                <span>Dispatch Gmail Reply (n8n)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

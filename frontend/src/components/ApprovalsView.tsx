import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  Clock,
  Sparkles,
  Send,
  Info,
  ShieldCheck,
  Mail,
  User,
} from 'lucide-react';
import { Run, EmailRecord } from '../types';

interface ApprovalsViewProps {
  runs: Run[];
  cachedEmails: Record<string, Partial<EmailRecord>>;
  onApprove: (runId: string) => void;
  onReject: (runId: string) => void;
  onOpenTriageModal: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  runs,
  cachedEmails,
  onApprove,
  onReject,
  onOpenTriageModal,
}) => {
  const pendingRuns = runs.filter((r) => r.status === 'awaiting_approval');

  // Track edited drafts in local component state
  const [editingDrafts, setEditingDrafts] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});

  const handleStartEdit = (runId: string, currentText: string) => {
    setIsEditing((prev) => ({ ...prev, [runId]: !prev[runId] }));
    if (!editingDrafts[runId]) {
      setEditingDrafts((prev) => ({ ...prev, [runId]: currentText }));
    }
  };

  const handleDraftChange = (runId: string, text: string) => {
    setEditingDrafts((prev) => ({ ...prev, [runId]: text }));
  };

  return (
    <div className="space-y-6">
      {/* Safety Header Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Human-in-the-Loop AI Approval Guardrail
              <span className="text-[10px] bg-brand-100 text-brand-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Strict Guardrail
              </span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              LangGraph workflow automatically pauses at the approval stage. The agent has classified the email, logged details in Notion, and generated an availability draft. No reply will ever be sent via Gmail until you explicitly authorize it here.
            </p>
          </div>
        </div>
      </div>

      {/* Approvals List or Empty State */}
      {pendingRuns.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-subtle">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">You're all caught up!</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            No emails are waiting for approval right now. When recruiters send interview scheduling or opportunity emails requiring candidate availability, they will appear here for your review.
          </p>
          <div className="mt-6">
            <button
              onClick={onOpenTriageModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-brand-500/20 transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Simulate Recruiter Email</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {pendingRuns.length} {pendingRuns.length === 1 ? 'Action Required' : 'Actions Required'}
            </p>
          </div>

          {pendingRuns.map((run) => {
            const cached = cachedEmails[run.message_id];
            const sender = cached?.sender || `Recruiter (Message #${run.message_id})`;
            const subject = cached?.subject || 'Interview scheduling / Opportunity';
            const body = cached?.body || 'Please share your availability for an interview slot this week.';
            const summary =
              cached?.summary ||
              'High priority email asking for candidate availability. AI generated standardized polite reply.';
            const defaultDraft =
              cached?.draft ||
              `Hi,\n\nThank you for reaching out regarding "${subject}". I am interested in the role and will share my available slots shortly.\n\nBest regards`;

            const currentDraft = editingDrafts[run.run_id] !== undefined ? editingDrafts[run.run_id] : defaultDraft;
            const inEditMode = isEditing[run.run_id] || false;

            return (
              <div
                key={run.run_id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header Strip */}
                <div className="bg-slate-50/80 px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Pending Human Approval
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-mono">Run ID: {run.run_id}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Received {run.started_at}</span>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Sender & Subject info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        From
                      </p>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sender}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Subject Line
                      </p>
                      <p className="text-xs font-semibold text-slate-900">{subject}</p>
                    </div>
                  </div>

                  {/* Original Body preview */}
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Original Recruiter Message
                    </p>
                    <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/60 text-xs text-slate-700 whitespace-pre-wrap font-sans">
                      {body}
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="bg-blue-50/60 rounded-lg p-3.5 border border-blue-100 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-brand-900 uppercase tracking-wider">
                        AI Executive Summary
                      </p>
                      <p className="text-xs text-brand-950 mt-0.5 leading-relaxed">{summary}</p>
                    </div>
                  </div>

                  {/* Suggested Reply Box */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Suggested Reply Draft
                      </p>
                      <button
                        onClick={() => handleStartEdit(run.run_id, currentDraft)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{inEditMode ? 'Close Edit Mode' : 'Edit Reply'}</span>
                      </button>
                    </div>

                    {inEditMode ? (
                      <div className="space-y-2">
                        <textarea
                          value={currentDraft}
                          onChange={(e) => handleDraftChange(run.run_id, e.target.value)}
                          rows={4}
                          className="w-full text-xs p-3.5 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                        />
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Info className="w-3 h-3 text-slate-400" />
                          <span>
                            Draft modified locally. The backend approval trigger will resume the workflow.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 text-xs text-slate-800 whitespace-pre-wrap font-sans">
                        {currentDraft}
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Approving triggers automated Gmail dispatch through n8n</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onReject(run.run_id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 text-xs font-semibold rounded-lg border border-slate-200 hover:border-rose-300 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject & Discard</span>
                      </button>

                      <button
                        onClick={() => onApprove(run.run_id)}
                        className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-600/30 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Approve & Send</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

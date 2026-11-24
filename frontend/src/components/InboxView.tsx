import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  User,
  Clock,
  Mail,
  Sparkles,
  ChevronRight,
  X,
  Send,
  XCircle,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { Run, EmailRecord, EmailCategory, EmailPriority, RunStatus } from '../types';

interface InboxViewProps {
  runs: Run[];
  cachedEmails: Record<string, Partial<EmailRecord>>;
  onApprove: (runId: string) => void;
  onReject: (runId: string) => void;
  onOpenTriageModal: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  runs,
  cachedEmails,
  onApprove,
  onReject,
  onOpenTriageModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<{ run: Run; email?: Partial<EmailRecord> } | null>(
    null
  );

  // Derive all emails by combining runs with cached metadata
  const items = useMemo(() => {
    return runs.map((run) => {
      const email = cachedEmails[run.message_id];
      return {
        run,
        email,
        sender: email?.sender || `Recruiter (Msg #${run.message_id})`,
        subject: email?.subject || 'Recruiter Communication',
        category: email?.category || 'recruiter',
        priority: email?.priority || 'medium',
        date: run.started_at,
        status: run.status,
      };
    });
  }, [runs, cachedEmails]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.sender.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.run.run_id.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesPriority =
        selectedPriority === 'all' || item.priority === selectedPriority;
      const matchesStatus =
        selectedStatus === 'all' || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [items, searchQuery, selectedCategory, selectedPriority, selectedStatus]);

  const getPriorityBadge = (priority?: EmailPriority | string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
            Low
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
            Standard
          </span>
        );
    }
  };

  const getStatusBadge = (status: RunStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Processed
          </span>
        );
      case 'awaiting_approval':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Pending Approval
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Rejected
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Running
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sender, subject, or run ID..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="awaiting_approval">Pending Approval</option>
            <option value="completed">Processed / Completed</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Categories</option>
            <option value="interview">Interview</option>
            <option value="offer">Job Offer</option>
            <option value="recruiter">Recruiter Outreach</option>
            <option value="newsletter">Newsletter</option>
            <option value="other">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-900">No emails found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No emails match the selected filters. Clear your filters or ingest a new email to see it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Sender</th>
                  <th className="py-3 px-5">Subject</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItems.map((item) => (
                  <tr
                    key={item.run.run_id}
                    onClick={() => setActiveItem({ run: item.run, email: item.email })}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-5 font-semibold text-slate-900 max-w-[180px] truncate">
                      {item.sender}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-800 max-w-[280px] truncate">
                      {item.subject}
                    </td>
                    <td className="py-3.5 px-5 capitalize text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">{getPriorityBadge(item.priority)}</td>
                    <td className="py-3.5 px-5">{getStatusBadge(item.status)}</td>
                    <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                      {item.date}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button className="text-slate-400 hover:text-brand-600 p-1">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Detail Inspection Drawer */}
      {activeItem && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/30 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-semibold text-sm text-slate-900">Email Details & AI Triage</h3>
                <p className="text-xs text-slate-500 font-mono">Run: {activeItem.run.run_id}</p>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Status and Category chips */}
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(activeItem.run.status)}
                {getPriorityBadge(activeItem.email?.priority || 'medium')}
                <span className="px-2 py-0.5 rounded bg-blue-50 text-brand-700 text-[11px] font-medium border border-blue-200 capitalize">
                  Category: {activeItem.email?.category || 'recruiter'}
                </span>
              </div>

              {/* Sender & Subject */}
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Sender
                  </span>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5">
                    {activeItem.email?.sender || `Message #${activeItem.run.message_id}`}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Subject
                  </span>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5">
                    {activeItem.email?.subject || 'Recruiter Communication'}
                  </p>
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 space-y-1">
                <div className="flex items-center gap-1.5 text-brand-900 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>AI Executive Summary</span>
                </div>
                <p className="text-xs text-brand-950 leading-relaxed">
                  {activeItem.email?.summary ||
                    'Triaged as high priority recruiter communication. AI generated summary and draft response logged to Notion.'}
                </p>
              </div>

              {/* Original Email Body */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Original Email Body
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {activeItem.email?.body ||
                    'Please share your availability for an interview slot this week.'}
                </div>
              </div>

              {/* Suggested Reply if present */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  AI Suggested Reply
                </span>
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {activeItem.email?.draft ||
                    `Hi,\n\nThank you for reaching out regarding "${activeItem.email?.subject || 'your inquiry'}". I am interested and will share my available slots shortly.\n\nBest regards`}
                </div>
              </div>

              {/* Backend Metadata Note */}
              <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-500 leading-normal flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <span>
                  Telemetry from SQLite runs table. Started: {activeItem.run.started_at}
                  {activeItem.run.finished_at ? ` • Finished: ${activeItem.run.finished_at}` : ''}
                </span>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            {activeItem.run.status === 'awaiting_approval' && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-amber-800">
                  Awaiting your approval
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onReject(activeItem.run.run_id);
                      setActiveItem(null);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      onApprove(activeItem.run.run_id);
                      setActiveItem(null);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    Approve & Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

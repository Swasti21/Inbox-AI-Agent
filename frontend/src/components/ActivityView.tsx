import React, { useState } from 'react';
import {
  History,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  ExternalLink,
  X,
  Code2,
} from 'lucide-react';
import { Run, RunStatus } from '../types';

interface ActivityViewProps {
  runs: Run[];
  onSelectRun: (run: Run) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ runs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [inspectRun, setInspectRun] = useState<Run | null>(null);

  const filteredRuns = runs.filter((run) => {
    const matchesSearch =
      run.run_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.message_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: RunStatus, error: string | null) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Successful</span>
          </span>
        );
      case 'awaiting_approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Rejected by Human</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Execution Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RotateCcw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>Running</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Information strip */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Execution & Telemetry History</h3>
            <p className="text-xs text-slate-500">
              Real-time audit log of LangGraph workflows with automatic exponential-backoff retries.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search run ID or msg..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Successful</option>
            <option value="awaiting_approval">Pending Review</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Runs Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
        {filteredRuns.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No workflow executions match the query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Run ID</th>
                  <th className="py-3 px-5">Message Ref</th>
                  <th className="py-3 px-5">Started At</th>
                  <th className="py-3 px-5">Finished At</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Execution Details</th>
                  <th className="py-3 px-5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRuns.map((run) => (
                  <tr
                    key={run.run_id}
                    onClick={() => setInspectRun(run)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono text-[11px] font-semibold text-brand-700">
                      {run.run_id}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-600 text-[11px]">
                      {run.message_id}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                      {run.started_at}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                      {run.finished_at || '—'}
                    </td>
                    <td className="py-3.5 px-5">{getStatusBadge(run.status, run.error)}</td>
                    <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate">
                      {run.error ? (
                        <span className="text-rose-600 font-medium">{run.error}</span>
                      ) : run.status === 'completed' ? (
                        <span className="text-slate-500">Triage & dispatch completed successfully</span>
                      ) : run.status === 'awaiting_approval' ? (
                        <span className="text-amber-700 font-medium">Paused on LangGraph interrupt</span>
                      ) : (
                        <span className="text-slate-400">Normal termination</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button className="text-slate-400 hover:text-brand-600 p-1">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      {inspectRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-brand-600" />
                <h3 className="font-semibold text-sm text-slate-900">Run Telemetry Details</h3>
              </div>
              <button
                onClick={() => setInspectRun(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 font-medium">Run ID</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{inspectRun.run_id}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 font-medium">Message Ref</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{inspectRun.message_id}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 font-medium">Started At</span>
                  <p className="font-mono text-slate-900 mt-0.5">{inspectRun.started_at}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 font-medium">Finished At</span>
                  <p className="font-mono text-slate-900 mt-0.5">{inspectRun.finished_at || 'In-Progress'}</p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Raw SQLite Run Record
                </span>
                <pre className="mt-1 p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
                  {JSON.stringify(inspectRun, null, 2)}
                </pre>
              </div>

              <div className="text-[11px] text-slate-500">
                <span>
                  Tool calls within this run were executed with Tenacity exponential-backoff (up to 3 attempts).
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setInspectRun(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

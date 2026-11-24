import React, { useState } from 'react';
import {
  Settings,
  Server,
  RefreshCw,
  Trash2,
  Check,
  AlertCircle,
  Database,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { getBaseApiUrl, setBaseApiUrl } from '../services/api';

interface SettingsViewProps {
  onRefresh: () => void;
  isBackendHealthy: boolean;
  onClearCache: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onRefresh,
  isBackendHealthy,
  onClearCache,
}) => {
  const [apiUrl, setApiUrl] = useState(getBaseApiUrl());
  const [saved, setSaved] = useState(false);
  const [pollingRate, setPollingRate] = useState<string>('10');

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setBaseApiUrl(apiUrl);
    setSaved(true);
    onRefresh();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Backend API Connection Setting */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Backend API URL</h3>
              <p className="text-xs text-slate-500">
                Configure the FastAPI service endpoint for email triage and execution history.
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
              isBackendHealthy
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendHealthy ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            {isBackendHealthy ? 'Connected (200 OK)' : 'Unreachable'}
          </span>
        </div>

        <form onSubmit={handleSaveUrl} className="space-y-3 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Base URL (leave blank for local Vite proxy / default)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. http://localhost:8000"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
              >
                {saved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{saved ? 'Saved!' : 'Save & Reconnect'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              By default, requests route through Vite's local development proxy to avoid browser CORS restrictions.
            </p>
          </div>
        </form>
      </div>

      {/* Client Refresh & Polling */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Auto-Refresh Interval</h3>
            <p className="text-xs text-slate-500">
              Polls the FastAPI <code className="text-slate-800">/runs</code> endpoint to capture state changes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          {['5', '10', '30', '0'].map((rate) => (
            <button
              key={rate}
              onClick={() => setPollingRate(rate)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                pollingRate === rate
                  ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-subtle'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {rate === '0' ? 'Manual Only' : `Every ${rate}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Local Storage & Cache */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Local Email Cache</h3>
              <p className="text-xs text-slate-500">
                Reset locally stored email drafts and triaged mock payloads in browser storage.
              </p>
            </div>
          </div>
          <button
            onClick={onClearCache}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
          >
            Clear Local Cache
          </button>
        </div>
      </div>

      {/* Architecture Reference */}
      <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
          <Database className="w-4 h-4 text-brand-600" />
          <span>Backend Persistence & Architecture</span>
        </div>
        <p>
          The agent uses SQLite database schema with tables for <code className="text-slate-800">emails</code>, <code className="text-slate-800">runs</code>, <code className="text-slate-800">drafts</code>, and <code className="text-slate-800">tool_calls</code>.
        </p>
        <p>
          FastAPI exposes documented endpoints: <code className="text-slate-800">GET /health</code>, <code className="text-slate-800">POST /triage</code>, <code className="text-slate-800">GET /approve/&#123;run_id&#125;</code>, <code className="text-slate-800">GET /runs</code>, and <code className="text-slate-800">GET /runs/&#123;run_id&#125;</code>.
        </p>
      </div>
    </div>
  );
};

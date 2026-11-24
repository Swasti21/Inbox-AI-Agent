import React from 'react';
import {
  Mail,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Bot,
  Zap,
} from 'lucide-react';

interface IntegrationsViewProps {
  isBackendHealthy: boolean;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ isBackendHealthy }) => {
  const integrations = [
    {
      id: 'gmail',
      name: 'Gmail & n8n Ingestion',
      category: 'Email I/O',
      icon: Mail,
      iconBg: 'bg-red-50 text-red-600',
      description:
        'Handles incoming email triggers via n8n Gmail node and delivers approved drafts back to recruiters.',
      purpose: 'Triggers POST /triage for incoming emails and sends approved replies via Gmail node.',
      status: isBackendHealthy ? 'Active (Webhook Ready)' : 'Backend Unreachable',
      isLive: isBackendHealthy,
      envKey: 'N8N_SEND_REPLY_WEBHOOK',
      notes:
        'In MOCK_MODE=true, Gmail sending is safely simulated. Set MOCK_MODE=false with n8n workflow webhook for production.',
    },
    {
      id: 'slack',
      name: 'Slack Webhook Notifications',
      category: 'Team Alerts',
      icon: MessageSquare,
      iconBg: 'bg-emerald-50 text-emerald-600',
      description:
        'Dispatches high-priority recruiter alerts, summaries, and clickable HITL approval links to Slack.',
      purpose: 'Posts executive summaries with one-click Approve/Reject links to candidate channels.',
      status: isBackendHealthy ? 'Connected (Simulated / Webhook)' : 'Offline',
      isLive: isBackendHealthy,
      envKey: 'SLACK_WEBHOOK_URL',
      notes:
        'Configured via SLACK_WEBHOOK_URL in .env. Formats priority, category, summary, and action links.',
    },
    {
      id: 'notion',
      name: 'Notion Candidate Tracker',
      category: 'Database & CRM',
      icon: FileText,
      iconBg: 'bg-slate-100 text-slate-800',
      description:
        'Automatically creates a structured row in your Notion recruiter tracker database for every triaged email.',
      purpose: 'Logs Name, Category, Priority, Summary, and Sender into Notion properties.',
      status: isBackendHealthy ? 'Configured (Database Sync)' : 'Offline',
      isLive: isBackendHealthy,
      envKey: 'NOTION_DATABASE_ID',
      notes:
        'Requires NOTION_TOKEN and NOTION_DATABASE_ID. Includes automatic 3-attempt exponential retry.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-subtle">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ecosystem Integrations</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Recruiter Inbox AI bridges email protocols with team communication and productivity platforms. Integrations execute through Tenacity retry wrappers and MCP tools.
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-subtle flex flex-col justify-between p-6 transition-all hover:border-slate-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      item.isLive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isLive ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    {item.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                <p className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider mt-0.5">
                  {item.category}
                </p>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{item.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Role in Agent Flow
                    </span>
                    <p className="text-slate-800 text-[11px] mt-0.5">{item.purpose}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Configuration Variable
                    </span>
                    <p className="font-mono text-[11px] text-slate-600 bg-slate-50 p-1 rounded border border-slate-200 mt-0.5">
                      {item.envKey}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 italic">{item.notes}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture MCP Note */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-brand-300 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Model Context Protocol (MCP) Server</span>
              <span className="text-[10px] bg-brand-500/30 text-brand-300 border border-brand-400/40 px-2 py-0.5 rounded font-mono">
                python -m app.mcp_server
              </span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              In addition to in-process execution, the tools (<code className="text-brand-300">slack_post</code>, <code className="text-brand-300">notion_create</code>, <code className="text-brand-300">gmail_send_reply</code>) are exposed as a standard stdio MCP Server. This enables any MCP client (Claude Desktop, Cursor, or n8n MCP nodes) to invoke the exact same agent tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

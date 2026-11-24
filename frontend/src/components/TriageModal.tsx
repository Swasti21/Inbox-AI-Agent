import React, { useState } from 'react';
import { X, Send, Sparkles, Mail, User, FileText, Check } from 'lucide-react';
import { EmailTriagePayload } from '../types';

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: EmailTriagePayload) => Promise<void>;
  isLoading: boolean;
}

const TEMPLATES: Array<{
  name: string;
  sender: string;
  subject: string;
  body: string;
}> = [
  {
    name: 'Interview Slot Request',
    sender: 'alex.recruiter@acmecorp.com',
    subject: 'Interview slot: Senior Software Engineer',
    body: 'Hi, we were impressed with your background. Are you available for a 45-minute technical discussion this Wednesday or Thursday between 2 PM and 5 PM EST? Please share your availability.',
  },
  {
    name: 'Formal Job Offer',
    sender: 'talent.operations@techunicorn.io',
    subject: 'Offer letter and compensation details',
    body: 'We are pleased to offer you the position of Senior AI Engineer! Please review the compensation package and start date options. Let us know if you have questions.',
  },
  {
    name: 'Recruiter Outreach',
    sender: 'sarah.headhunter@executiveai.com',
    subject: 'Exciting AI Systems Role at stealth startup',
    body: 'Hi, I came across your profile and think you would be a great fit for our founding engineer role. Are you open to exploring new opportunities?',
  },
  {
    name: 'Weekly Newsletter',
    sender: 'digest@techjobsweekly.com',
    subject: 'Weekly digest: Top trending tech positions',
    body: 'Here is your weekly job market digest. If you wish to unsubscribe, click here.',
  },
];

export const TriageModal: React.FC<TriageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [sender, setSender] = useState(TEMPLATES[0].sender);
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [body, setBody] = useState(TEMPLATES[0].body);

  if (!isOpen) return null;

  const handleApplyTemplate = (template: (typeof TEMPLATES)[0]) => {
    setSender(template.sender);
    setSubject(template.subject);
    setBody(template.body);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender.trim() || !subject.trim() || !body.trim()) return;

    // Generate unique message_id for testing
    const messageId = `msg_${Date.now().toString(36)}`;
    await onSubmit({
      message_id: messageId,
      sender: sender.trim(),
      subject: subject.trim(),
      body: body.trim(),
      received_at: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Triage New Recruiter Email</h3>
              <p className="text-xs text-slate-500">
                Dispatches payload directly to the LangGraph autonomous agent.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Preset Template Chips */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Quick Test Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 transition-all text-slate-700"
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          <form id="triage-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Sender */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Recruiter Sender Email
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="e.g. hr@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email Subject Line
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Interview invitation: Software Engineer"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                />
              </div>
            </div>

            {/* Body */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email Content / Body
              </label>
              <textarea
                required
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Paste email content here..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans resize-none"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Invokes <code className="text-slate-800">POST /triage</code>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="triage-form"
              disabled={isLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Triaging...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Triage</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export type RunStatus = 'running' | 'awaiting_approval' | 'completed' | 'rejected' | 'failed';

export interface Run {
  run_id: string;
  message_id: string;
  status: RunStatus;
  error: string | null;
  started_at: string;
  finished_at: string | null;
}

export interface EmailTriagePayload {
  message_id: string;
  sender: string;
  subject: string;
  body: string;
  received_at?: string;
}

export interface TriageResult {
  run_id: string;
  status: RunStatus;
}

export type EmailCategory = 'recruiter' | 'interview' | 'offer' | 'newsletter' | 'other';
export type EmailPriority = 'high' | 'medium' | 'low';

export interface EmailRecord {
  message_id: string;
  sender: string;
  subject: string;
  body: string;
  received_at?: string;
  category?: EmailCategory;
  priority?: EmailPriority;
  summary?: string;
  needs_reply?: boolean;
  draft?: string;
  run_id?: string;
  status?: RunStatus;
  started_at?: string;
}

export interface HealthStatus {
  ok: boolean;
  checkedAt: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export type NavTab = 'dashboard' | 'inbox' | 'approvals' | 'activity' | 'integrations' | 'settings';

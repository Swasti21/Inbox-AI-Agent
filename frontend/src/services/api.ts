import { Run, EmailTriagePayload, TriageResult, EmailRecord } from '../types';

const STORAGE_KEY_API_URL = 'recruiter_api_url';
const STORAGE_KEY_EMAILS = 'recruiter_inbox_email_cache_v1';

export function getBaseApiUrl(): string {
  return localStorage.getItem(STORAGE_KEY_API_URL) || '';
}

export function setBaseApiUrl(url: string): void {
  if (!url || url.trim() === '') {
    localStorage.removeItem(STORAGE_KEY_API_URL);
  } else {
    localStorage.setItem(STORAGE_KEY_API_URL, url.trim().replace(/\/$/, ''));
  }
}

// Client-side local cache for rich email details (sender, subject, body, draft)
// used when emails are triaged through the frontend interface.
export function getStoredEmails(): Record<string, Partial<EmailRecord>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMAILS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredEmail(email: Partial<EmailRecord>): void {
  try {
    const current = getStoredEmails();
    current[email.message_id!] = {
      ...current[email.message_id!],
      ...email,
    };
    localStorage.setItem(STORAGE_KEY_EMAILS, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to store email metadata:', e);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = getBaseApiUrl();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // not JSON
    }
    throw new Error(errorDetail);
  }

  // Handle HTML or JSON responses
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  const text = await res.text();
  return text as unknown as T;
}

export const api = {
  // GET /health
  async checkHealth(): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>('/health');
  },

  // GET /runs
  async getRuns(): Promise<Run[]> {
    return request<Run[]>('/runs');
  },

  // GET /runs/{run_id}
  async getRun(runId: string): Promise<Run> {
    return request<Run>(`/runs/${encodeURIComponent(runId)}`);
  },

  // POST /triage
  async triageEmail(payload: EmailTriagePayload): Promise<TriageResult> {
    // Cache the email content locally so the Inbox and Approval views can present the rich text
    saveStoredEmail({
      message_id: payload.message_id,
      sender: payload.sender,
      subject: payload.subject,
      body: payload.body,
      received_at: payload.received_at || new Date().toISOString(),
    });

    const result = await request<TriageResult>('/triage', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Update cache with run_id & status
    saveStoredEmail({
      message_id: payload.message_id,
      run_id: result.run_id,
      status: result.status,
    });

    return result;
  },

  // GET /approve/{run_id}?decision=approve|reject
  async decideRun(runId: string, decision: 'approve' | 'reject'): Promise<string> {
    const res = await request<string>(
      `/approve/${encodeURIComponent(runId)}?decision=${encodeURIComponent(decision)}`
    );

    // If we have cached email for this run, update status
    const current = getStoredEmails();
    for (const msgId of Object.keys(current)) {
      if (current[msgId].run_id === runId) {
        current[msgId].status = decision === 'approve' ? 'completed' : 'rejected';
        localStorage.setItem(STORAGE_KEY_EMAILS, JSON.stringify(current));
        break;
      }
    }

    return res;
  },
};

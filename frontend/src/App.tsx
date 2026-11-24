import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InboxView } from './components/InboxView';
import { ApprovalsView } from './components/ApprovalsView';
import { ActivityView } from './components/ActivityView';
import { IntegrationsView } from './components/IntegrationsView';
import { SettingsView } from './components/SettingsView';
import { TriageModal } from './components/TriageModal';
import { NotificationToast } from './components/NotificationToast';
import { api, getStoredEmails, saveStoredEmail } from './services/api';
import { Run, EmailRecord, EmailTriagePayload, NavTab, Toast } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [runs, setRuns] = useState<Run[]>([]);
  const [cachedEmails, setCachedEmails] = useState<Record<string, Partial<EmailRecord>>>(
    getStoredEmails()
  );
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState<boolean>(false);
  const [isTriaging, setIsTriaging] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], title: string, message?: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch runs and health from FastAPI
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Health check
      try {
        const health = await api.checkHealth();
        setIsBackendHealthy(health.ok);
      } catch (err) {
        setIsBackendHealthy(false);
      }

      // 2. Runs list
      const fetchedRuns = await api.getRuns();
      setRuns(fetchedRuns);
      setCachedEmails(getStoredEmails());
    } catch (err: any) {
      console.warn('Backend query issue:', err);
      // Keep existing runs if temporary network blip
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load and periodic polling
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Approve
  const handleApprove = async (runId: string) => {
    try {
      await api.decideRun(runId, 'approve');
      addToast(
        'success',
        'Approval Confirmed',
        `Run ${runId} marked completed. Gmail reply dispatched via n8n.`
      );
      await loadData();
    } catch (err: any) {
      addToast('error', 'Approval Action Failed', err.message || 'Unknown error');
    }
  };

  // Handle Reject
  const handleReject = async (runId: string) => {
    try {
      await api.decideRun(runId, 'reject');
      addToast('info', 'Draft Rejected', `Run ${runId} rejected. Reply will not be sent.`);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Rejection Action Failed', err.message || 'Unknown error');
    }
  };

  // Handle Triage Submit from modal
  const handleTriageSubmit = async (payload: EmailTriagePayload) => {
    setIsTriaging(true);
    try {
      const res = await api.triageEmail(payload);
      addToast(
        'success',
        'Email Triaged by Agent',
        `Run ID: ${res.run_id} (Status: ${res.status.replace('_', ' ')})`
      );
      setIsTriageModalOpen(false);
      await loadData();
      if (res.status === 'awaiting_approval') {
        setActiveTab('approvals');
      }
    } catch (err: any) {
      addToast('error', 'Triage Request Failed', err.message || 'Failed to dispatch email');
    } finally {
      setIsTriaging(false);
    }
  };

  // Clear local storage cache
  const handleClearCache = () => {
    localStorage.removeItem('recruiter_inbox_email_cache_v1');
    setCachedEmails({});
    addToast('info', 'Cache Cleared', 'Locally cached metadata has been reset.');
  };

  const pendingApprovalsCount = runs.filter((r) => r.status === 'awaiting_approval').length;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingApprovalsCount}
        isBackendHealthy={isBackendHealthy}
      />

      {/* Main Workspace Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          onOpenTriageModal={() => setIsTriageModalOpen(true)}
          isBackendHealthy={isBackendHealthy}
          pendingCount={pendingApprovalsCount}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              runs={runs}
              cachedEmails={cachedEmails}
              isBackendHealthy={isBackendHealthy}
              onNavigate={setActiveTab}
              onApprove={handleApprove}
              onReject={handleReject}
              onSelectRun={(run) => setActiveTab('activity')}
            />
          )}

          {activeTab === 'inbox' && (
            <InboxView
              runs={runs}
              cachedEmails={cachedEmails}
              onApprove={handleApprove}
              onReject={handleReject}
              onOpenTriageModal={() => setIsTriageModalOpen(true)}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsView
              runs={runs}
              cachedEmails={cachedEmails}
              onApprove={handleApprove}
              onReject={handleReject}
              onOpenTriageModal={() => setIsTriageModalOpen(true)}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityView
              runs={runs}
              onSelectRun={(run) => {}}
            />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsView isBackendHealthy={isBackendHealthy} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onRefresh={loadData}
              isBackendHealthy={isBackendHealthy}
              onClearCache={handleClearCache}
            />
          )}
        </main>
      </div>

      {/* Modal for Ingesting/Triaging New Email */}
      <TriageModal
        isOpen={isTriageModalOpen}
        onClose={() => setIsTriageModalOpen(false)}
        onSubmit={handleTriageSubmit}
        isLoading={isTriaging}
      />

      {/* Floating Notifications */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;

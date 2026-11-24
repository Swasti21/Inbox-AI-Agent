import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Toast } from '../types';

interface NotificationToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let style = 'bg-slate-900 text-white border-slate-800';
        let iconColor = 'text-emerald-400';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          style = 'bg-rose-950 text-white border-rose-800';
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          style = 'bg-amber-950 text-white border-amber-800';
          iconColor = 'text-amber-400';
        } else if (toast.type === 'info') {
          Icon = Info;
          style = 'bg-slate-900 text-white border-slate-800';
          iconColor = 'text-blue-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-dropdown border flex items-start justify-between gap-3 animate-fade-in ${style}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div>
                <h5 className="text-xs font-bold leading-tight">{toast.title}</h5>
                {toast.message && (
                  <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                    {toast.message}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastNotification } from '../types';

interface NotificationToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export function NotificationToastContainer({
  toasts,
  onDismiss
}: NotificationToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-18 right-4 md:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print"
      id="modern-notification-toast-container"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isDanger = toast.type === 'danger';
          const isWarning = toast.type === 'warning';
          const isInfo = toast.type === 'info';

          let icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
          let iconBg = 'bg-emerald-500/10 dark:bg-emerald-500/20';
          let borderAccent = 'border-emerald-500/30';
          let typeLabel = 'SUCCESS';
          let labelColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/50';

          if (isDanger) {
            icon = <AlertCircle className="w-4 h-4 text-rose-500" />;
            iconBg = 'bg-rose-500/10 dark:bg-rose-500/20';
            borderAccent = 'border-rose-500/30';
            typeLabel = 'ALERT';
            labelColor = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/50';
          } else if (isWarning) {
            icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
            iconBg = 'bg-amber-500/10 dark:bg-amber-500/20';
            borderAccent = 'border-amber-500/30';
            typeLabel = 'WARNING';
            labelColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/50';
          } else if (isInfo) {
            icon = <Info className="w-4 h-4 text-cyan-500" />;
            iconBg = 'bg-cyan-500/10 dark:bg-cyan-500/20';
            borderAccent = 'border-cyan-500/30';
            typeLabel = 'NOTICE';
            labelColor = 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800/50';
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 24, transition: { duration: 0.16 } }}
              transition={{ type: 'spring', damping: 24, stiffness: 350 }}
              className={`pointer-events-auto p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border ${borderAccent} shadow-xl shadow-slate-950/10 dark:shadow-black/40 flex items-start gap-3 transition-colors`}
              role="alert"
            >
              <div className={`p-2 rounded-xl ${iconBg} shrink-0 mt-0.5`}>
                {icon}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded border leading-none ${labelColor}`}>
                    {typeLabel}
                  </span>
                  {toast.title && (
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {toast.title}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed break-words">
                  {toast.text}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

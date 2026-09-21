import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Megaphone, 
  BookOpen, 
  Boxes, 
  UserCheck, 
  ExternalLink, 
  Check, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemNotification } from '../types';

interface NotificationCenterProps {
  systemNotifications: any[];
  pendingReviewsCount: number;
  needsRevisionCount: number;
  lowStockCount: number;
  pendingApprovalsCount: number;
  onSelectView: (view: string, filterStatus?: string) => void;
  dismissedAnnouncementIds: string[];
  onDismissAnnouncement: (id: string) => void;
  onClearAllAnnouncements: () => void;
}

export function NotificationCenter({
  systemNotifications,
  pendingReviewsCount,
  needsRevisionCount,
  lowStockCount,
  pendingApprovalsCount,
  onSelectView,
  dismissedAnnouncementIds,
  onDismissAnnouncement,
  onClearAllAnnouncements
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'broadcasts' | 'actions'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter visible announcements (active and not locally dismissed)
  const activeAnnouncements = systemNotifications.filter(
    (n) => n.active && !dismissedAnnouncementIds.includes(n.id)
  );

  // Total unread notifications count
  const actionItemsCount = 
    (pendingReviewsCount > 0 ? 1 : 0) + 
    (needsRevisionCount > 0 ? 1 : 0) + 
    (lowStockCount > 0 ? 1 : 0) + 
    (pendingApprovalsCount > 0 ? 1 : 0);

  const totalBadgeCount = activeAnnouncements.length + actionItemsCount;

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleActionNavigate = (view: string, filterStatus?: string) => {
    onSelectView(view, filterStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Notifications & Broadcasts"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className={`w-4 h-4 transition-transform ${totalBadgeCount > 0 ? 'animate-wiggle' : ''}`} />
        
        {totalBadgeCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
          </span>
        )}
      </button>

      {/* Modern Notification Center Flyout */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute right-0 mt-2 w-84 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/20 dark:shadow-black/50 overflow-hidden z-50 flex flex-col"
            id="notification-center-dropdown"
          >
            {/* Header */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand/10 dark:bg-brand/20 text-brand">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-display flex items-center gap-1.5">
                    <span>Notifications</span>
                    {totalBadgeCount > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-brand text-white font-black">
                        {totalBadgeCount}
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {activeAnnouncements.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAllAnnouncements}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-3 pt-2.5 pb-1 flex items-center gap-1 border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All ({totalBadgeCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('broadcasts')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'broadcasts'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Announcements ({activeAnnouncements.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('actions')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'actions'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Tasks ({actionItemsCount})
              </button>
            </div>

            {/* Notifications Feed */}
            <div className="p-2 space-y-2 max-h-[340px] overflow-y-auto">
              {totalBadgeCount === 0 ? (
                <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    All caught up!
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No unread announcements or pending alerts.
                  </p>
                </div>
              ) : (
                <>
                  {/* Actionable items */}
                  {(activeTab === 'all' || activeTab === 'actions') && (
                    <>
                      {pendingReviewsCount > 0 && (
                        <div 
                          onClick={() => handleActionNavigate('journal', 'Pending Review')}
                          className="p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-950/20 hover:bg-amber-100/70 transition-colors flex items-start gap-3 cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                Journal Reviews Awaiting
                              </span>
                              <span className="text-[9.5px] font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-200/60 dark:bg-amber-900/50 px-1.5 py-0.5 rounded-full">
                                {pendingReviewsCount}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                              {pendingReviewsCount} log submission{pendingReviewsCount > 1 ? 's are' : ' is'} waiting for mentor / lead sign-off.
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
                        </div>
                      )}

                      {needsRevisionCount > 0 && (
                        <div 
                          onClick={() => handleActionNavigate('journal', 'Needs Revision')}
                          className="p-3 rounded-xl border border-rose-200 dark:border-rose-800/40 bg-rose-50/70 dark:bg-rose-950/20 hover:bg-rose-100/70 transition-colors flex items-start gap-3 cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                Revisions Requested
                              </span>
                              <span className="text-[9.5px] font-mono font-black text-rose-700 dark:text-rose-400 bg-rose-200/60 dark:bg-rose-900/50 px-1.5 py-0.5 rounded-full">
                                {needsRevisionCount}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                              {needsRevisionCount} entry requires updates based on reviewer feedback.
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
                        </div>
                      )}

                      {pendingApprovalsCount > 0 && (
                        <div 
                          onClick={() => handleActionNavigate('approvals')}
                          className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/70 dark:bg-indigo-950/20 hover:bg-indigo-100/70 transition-colors flex items-start gap-3 cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                New Member Sign-ups
                              </span>
                              <span className="text-[9.5px] font-mono font-black text-indigo-700 dark:text-indigo-400 bg-indigo-200/60 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded-full">
                                {pendingApprovalsCount}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                              {pendingApprovalsCount} prospective member profile{pendingApprovalsCount > 1 ? 's' : ''} awaiting approval.
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
                        </div>
                      )}

                      {lowStockCount > 0 && (
                        <div 
                          onClick={() => handleActionNavigate('inventory')}
                          className="p-3 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50/70 dark:bg-red-950/20 hover:bg-red-100/70 transition-colors flex items-start gap-3 cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
                            <Boxes className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                Low Stock Alert
                              </span>
                              <span className="text-[9.5px] font-mono font-black text-red-700 dark:text-red-400 bg-red-200/60 dark:bg-red-900/50 px-1.5 py-0.5 rounded-full">
                                {lowStockCount}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                              {lowStockCount} inventory item{lowStockCount > 1 ? 's are' : ' is'} below minimum reorder threshold.
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
                        </div>
                      )}
                    </>
                  )}

                  {/* System announcements */}
                  {(activeTab === 'all' || activeTab === 'broadcasts') && (
                    <>
                      {activeAnnouncements.map((noti) => {
                        let badgeColor = 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50';
                        let borderClass = 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/50';

                        if (noti.type === 'danger') {
                          badgeColor = 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
                          borderClass = 'border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/15';
                        } else if (noti.type === 'warning') {
                          badgeColor = 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
                          borderClass = 'border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/15';
                        } else if (noti.type === 'success') {
                          badgeColor = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
                          borderClass = 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/15';
                        }

                        return (
                          <div
                            key={noti.id}
                            className={`p-3 rounded-xl border ${borderClass} relative group transition-colors`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[8.5px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border ${badgeColor}`}>
                                  {noti.type || 'ANNOUNCEMENT'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {new Date(noti.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => onDismissAnnouncement(noti.id)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors cursor-pointer"
                                title="Dismiss this announcement"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {noti.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              {noti.message}
                            </p>
                            {noti.createdBy && (
                              <div className="mt-2 text-[9.5px] font-mono text-slate-400">
                                Posted by <span className="text-slate-600 dark:text-slate-300 font-semibold">{noti.createdBy}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10.5px] text-slate-500 font-mono">
              <span>RoboRaiders Team Portal</span>
              <button
                type="button"
                onClick={() => handleActionNavigate('system_dashboard')}
                className="hover:text-brand flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Broadcasts Desk</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

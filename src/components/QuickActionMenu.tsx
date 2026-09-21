import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  X, 
  Clock, 
  BookOpen, 
  Layers, 
  Users, 
  Sparkles, 
  Boxes, 
  LogOut, 
  CheckCircle2, 
  ChevronRight,
  HelpCircle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount, ClockInSession, Subteam } from '../types';

interface QuickActionMenuProps {
  currentUser: UserAccount | null;
  activeSession: ClockInSession | null;
  sessionElapsed: string;
  onClockIn: (subteam?: Subteam, description?: string) => void;
  onClockOut: () => void;
  onSelectView: (view: string) => void;
  onStartNewJournalEntry: () => void;
  onOpenMobileMenu?: () => void;
}

export function QuickActionMenu({
  currentUser,
  activeSession,
  sessionElapsed,
  onClockIn,
  onClockOut,
  onSelectView,
  onStartNewJournalEntry
}: QuickActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quickSubteam, setQuickSubteam] = useState<Subteam>(() => {
    return (currentUser?.primarySubteam as Subteam) || 'Design/Build/Fabrication';
  });
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync quickSubteam when currentUser changes
  useEffect(() => {
    if (currentUser?.primarySubteam) {
      setQuickSubteam(currentUser.primarySubteam as Subteam);
    }
  }, [currentUser?.primarySubteam]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleQuickClockIn = () => {
    onClockIn(quickSubteam, `Quick clock-in contribution for ${quickSubteam}`);
    setIsOpen(false);
  };

  const handleQuickClockOut = () => {
    onClockOut();
    setIsOpen(false);
  };

  const handleActionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const quickActions = [
    {
      id: 'journal',
      title: 'New Journal Entry',
      subtitle: 'Draft subteam log or meeting notes',
      icon: BookOpen,
      iconColor: 'text-cyan-500 dark:text-cyan-400',
      iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
      onClick: () => handleActionClick(onStartNewJournalEntry),
      tag: 'One-tap'
    },
    {
      id: 'kanban',
      title: 'Create Kanban Task',
      subtitle: 'Assign task & track progress',
      icon: Layers,
      iconColor: 'text-purple-500 dark:text-purple-400',
      iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
      onClick: () => handleActionClick(() => onSelectView('kanban')),
      tag: 'Tasks'
    },
    {
      id: 'outreach',
      title: 'Log Outreach Event',
      subtitle: 'Record volunteer hours & impact',
      icon: Users,
      iconColor: 'text-amber-500 dark:text-amber-400',
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
      onClick: () => handleActionClick(() => onSelectView('outreach')),
      tag: 'Outreach'
    },
    {
      id: 'qotd',
      title: 'Daily QOTD Challenge',
      subtitle: 'Earn team XP & streak points',
      icon: Flame,
      iconColor: 'text-brand',
      iconBg: 'bg-brand/10 dark:bg-brand/20',
      onClick: () => handleActionClick(() => onSelectView('qotd')),
      tag: 'XP Boost'
    },
    {
      id: 'inventory',
      title: 'Inventory & Parts',
      subtitle: 'Lookup stock & scan QR codes',
      icon: Boxes,
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      onClick: () => handleActionClick(() => onSelectView('inventory')),
      tag: 'Hardware'
    }
  ];

  return (
    <div 
      ref={menuRef} 
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 no-print"
      id="floating-quick-action-container"
    >
      {/* SPEED DIAL POPOVER MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className="absolute bottom-16 right-0 mb-2 w-80 sm:w-92 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/25 dark:shadow-black/60 overflow-hidden flex flex-col"
            id="quick-action-popover"
          >
            {/* Header */}
            <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-brand/30 text-brand" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white font-display">
                    Quick Actions
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Instant robotics workspace shortcuts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CLOCK IN / OUT ACTION SECTOR */}
            <div className="p-3 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-850/40 dark:to-transparent border-b border-slate-100 dark:border-slate-800/80">
              {activeSession ? (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10.5px] font-bold text-emerald-800 dark:text-emerald-300 font-mono uppercase tracking-wider">
                        Active In Workshop
                      </span>
                    </div>
                    <span className="text-xs font-black font-mono text-emerald-950 dark:text-emerald-200 bg-emerald-200/50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                      {sessionElapsed}
                    </span>
                  </div>

                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400/90 font-medium truncate mb-2.5">
                    Subteam: <strong className="text-emerald-900 dark:text-emerald-200 font-bold">{activeSession.subteam}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleQuickClockOut}
                      className="flex-1 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-xs font-extrabold py-2 px-3 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer font-sans"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Clock Out &amp; Log</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActionClick(() => onSelectView('time_entry'))}
                      className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs transition-colors cursor-pointer"
                      title="Open full Time Card"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Punch Time Card
                      </span>
                    </div>
                    <span className="text-[9.5px] font-mono font-bold bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md">
                      Off-duty
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2.5">
                    <select
                      value={quickSubteam}
                      onChange={(e) => setQuickSubteam(e.target.value as Subteam)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold outline-none focus:ring-1 focus:ring-brand"
                    >
                      <option value="Design/Build/Fabrication">Design/Build/Fabrication</option>
                      <option value="Programming">Programming</option>
                      <option value="Outreach">Outreach</option>
                      <option value="Business & Media">Business & Media</option>
                      <option value="Inspire">Inspire</option>
                      <option value="Strategy">Strategy</option>
                      <option value="Mentoring">Mentoring</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleQuickClockIn}
                      className="flex-1 bg-brand hover:bg-brand-hover active:scale-[0.98] text-white text-xs font-extrabold py-2 px-3 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm shadow-brand/25 transition-all cursor-pointer font-sans"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Clock In Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActionClick(() => onSelectView('time_entry'))}
                      className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors cursor-pointer"
                      title="View all time entries"
                    >
                      Desk
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SHORTCUT ACTIONS LIST */}
            <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
              <div className="px-2 py-1 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Common Tasks
              </div>

              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.onClick}
                    className="w-full p-2.5 rounded-2xl flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800/70 text-left transition-all group cursor-pointer"
                  >
                    <div className={`w-9 h-9 rounded-xl ${action.iconBg} ${action.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                      <ActionIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand dark:group-hover:text-red-400 transition-colors truncate">
                          {action.title}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                          {action.tag}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">
                        {action.subtitle}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Footer Tip */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand" />
                <span>One-tap workflow</span>
              </span>
              <button
                type="button"
                onClick={() => handleActionClick(() => onSelectView('help_guide'))}
                className="hover:text-brand flex items-center gap-1 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Help Guide</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION TRIGGER BUTTON */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.05 }}
        className={`relative flex items-center gap-2.5 h-13 px-4.5 rounded-full shadow-xl shadow-brand/20 dark:shadow-black/50 transition-colors duration-200 cursor-pointer select-none outline-none ${
          isOpen
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
            : 'bg-brand text-white hover:bg-brand-hover'
        }`}
        id="quick-action-fab-button"
        aria-label="Quick Action Menu"
        aria-expanded={isOpen}
      >
        {/* Status indicator dot if clocked in */}
        {activeSession && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        )}

        <div className="relative">
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Zap className="w-5 h-5 fill-current" />
            )}
          </motion.div>
        </div>

        <span className="text-xs font-black tracking-wider uppercase font-display hidden sm:inline-block">
          {isOpen ? 'Close' : 'Quick Actions'}
        </span>
      </motion.button>
    </div>
  );
}

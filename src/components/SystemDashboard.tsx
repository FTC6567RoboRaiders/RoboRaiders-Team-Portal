import React, { useState } from 'react';
import { 
  Terminal, 
  Power, 
  Bell, 
  EyeOff, 
  Trash2, 
  Plus, 
  Eye, 
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  Megaphone,
  BookOpen,
  Clock,
  Layers,
  Users,
  FileText,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SystemDashboardProps {
  currentUser?: any;
  disabledModules: string[];
  systemNotifications: any[];
  onToggleModule: (moduleId: string) => Promise<void>;
  onAddNotification: (notification: { title: string; message: string; type: 'info' | 'warning' | 'danger' | 'success'; active: boolean }) => Promise<void>;
  onDeleteNotification: (id: string) => Promise<void>;
  onToggleNotificationActive: (id: string, active: boolean) => Promise<void>;
  onBack: () => void;
  showToast: (msg: string, type: 'success' | 'danger' | 'info' | 'warning') => void;
}

export default function SystemDashboard({
  currentUser: _currentUser,
  disabledModules,
  systemNotifications,
  onToggleModule,
  onAddNotification,
  onDeleteNotification,
  onToggleNotificationActive,
  onBack,
  showToast
}: SystemDashboardProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<'info' | 'warning' | 'danger' | 'success'>('info');
  const [newActive, setNewActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MODULES_CONFIG = [
    { id: 'journal', label: 'Notebook Logs', icon: BookOpen, desc: 'Engineering logs & journal entry submissions' },
    { id: 'time_entry', label: 'Time Card', icon: Clock, desc: 'Physical check-in timesheets and duration logging' },
    { id: 'kanban', label: 'Kanban Board', icon: Layers, desc: 'Collaborative task cards & priorities board' },
    { id: 'outreach', label: 'Outreach Logs', icon: Users, desc: 'Community impact event reports and logs' },
    { id: 'handbook', label: 'Student Handbook', icon: FileText, desc: 'Reference guidelines and team appendices' },
    { id: 'finance', label: 'General Ledger', icon: DollarSign, desc: 'Championship ledger & transaction tracking' }
  ];

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) {
      showToast('Please key in both title and announcement message.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddNotification({
        title: newTitle.trim(),
        message: newMessage.trim(),
        type: newType,
        active: newActive
      });
      setNewTitle('');
      setNewMessage('');
      setNewType('info');
      setNewActive(true);
      showToast('Global system announcement broadcasted.', 'success');
    } catch (err: any) {
      showToast('Failed to create announcement: ' + err.message, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6"
      id="system-dashboard-root"
    >
      {/* Header and Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase animate-pulse">
                SysAdmin Controls
              </span>
              <Terminal className="w-5 h-5 text-red-500" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-200 uppercase tracking-tight">
              Software Division Terminal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Programming Subteam administrative hub & feature-flag configurations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Module Feature Flag Controller (Cols 1-5) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Power className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Portal Component Switchboard
              </h2>
            </div>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Dynamically toggle, hide, or disable specific pages of the application. Disabled modules will show locked states and redirect general team members.
            </p>

            <div className="space-y-3.5">
              {MODULES_CONFIG.map((mod) => {
                const isItemDisabled = disabledModules.includes(mod.id);
                const ModIcon = mod.icon;

                return (
                  <div 
                    key={mod.id} 
                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
                      isItemDisabled 
                        ? 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-200/35 dark:border-rose-900/30' 
                        : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-150 dark:border-slate-850'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded mt-0.5 ${
                        isItemDisabled 
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-500' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        <ModIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          {mod.label}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-400 block mt-0.5 max-w-[200px] sm:max-w-none leading-none">
                          {mod.desc}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleModule(mod.id)}
                      className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-md cursor-pointer transition-all ${
                        isItemDisabled
                          ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm'
                          : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-slate-700'
                      }`}
                    >
                      {isItemDisabled ? 'Disabled' : 'Enabled'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-3 text-amber-800 dark:text-amber-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-bold uppercase tracking-wider text-[10px]">Security Advisory</p>
              <p className="mt-1 text-[11px] leading-relaxed">
                Settings update instantly for all users via real-time database locks. High-impact operations such as locking logs should be coordinated with the Mentors and Team Captains.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Global Broadcast and Archives (Cols 6-12) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Create Announcement Form */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Megaphone className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Broadcast Global System Alert
              </h2>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    Alert Title
                  </label>
                  <input 
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Server Maintenance tonight"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white rounded px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    Announcement Banner Style
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                  >
                    <option value="info">💬 Corporate Indigo (Info)</option>
                    <option value="success">✅ Field Success Emerald (Success)</option>
                    <option value="warning">⚠️ Match Alert Amber (Warning)</option>
                    <option value="danger">🚨 Urgent Fire Rose (Danger)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                  Message / Announcement Body
                </label>
                <textarea
                  required
                  maxLength={1000}
                  rows={3}
                  placeholder="Details of the announcement or system state notice..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white rounded px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newActive}
                    onChange={(e) => setNewActive(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500 border-slate-300 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Publish instantly (Make Active)
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded uppercase tracking-wider hover:bg-emerald-600 shadow transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Broadcast Alert</span>
                </button>
              </div>
            </form>
          </div>

          {/* Published Announcements Management Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-md flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Active Alert Broadcast Feed
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {systemNotifications.length} Announcement(s)
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[350px] flex-1">
              <AnimatePresence initial={false}>
                {systemNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Megaphone className="w-8 h-8 text-slate-300 mb-2 stroke-1" />
                    <p className="text-xs font-mono">No active broadcasts logged.</p>
                  </div>
                ) : (
                  systemNotifications.map((noti) => {
                    let borderClass = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20';
                    let badgeClass = 'bg-slate-200 text-slate-700';

                    if (noti.type === 'success') {
                      borderClass = 'border-emerald-250 bg-emerald-500/5 dark:bg-emerald-950/5';
                      badgeClass = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400';
                    } else if (noti.type === 'warning') {
                      borderClass = 'border-amber-250 bg-amber-500/5 dark:bg-amber-950/5';
                      badgeClass = 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400';
                    } else if (noti.type === 'danger') {
                      borderClass = 'border-rose-250 bg-rose-500/5 dark:bg-rose-950/5';
                      badgeClass = 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-450';
                    } else if (noti.type === 'info') {
                      borderClass = 'border-indigo-250 bg-indigo-500/5 dark:bg-indigo-950/5';
                      badgeClass = 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400';
                    }

                    return (
                      <motion.div
                        key={noti.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all ${borderClass}`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${badgeClass}`}>
                              {noti.type}
                            </span>
                            {!noti.active && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                Draft / Hidden
                              </span>
                            )}
                            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {noti.title}
                            </h3>
                          </div>
                          
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                            {noti.message}
                          </p>

                          <div className="text-[9px] text-slate-450 font-mono">
                            By {noti.createdBy} • {new Date(noti.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 sm:self-center">
                          <button
                            onClick={() => onToggleNotificationActive(noti.id, !noti.active)}
                            title={noti.active ? "Mute / Disable broadcast" : "Activate broadcast"}
                            className={`p-1.5 rounded border transition-colors cursor-pointer ${
                              noti.active 
                                ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700' 
                                : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 text-emerald-600'
                            }`}
                          >
                            {noti.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to permanently delete this broadcast notification?')) {
                                onDeleteNotification(noti.id);
                              }
                            }}
                            title="Delete alert record"
                            className="p-1.5 rounded border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-200 dark:hover:bg-rose-950/20 hover:bg-rose-50 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
}

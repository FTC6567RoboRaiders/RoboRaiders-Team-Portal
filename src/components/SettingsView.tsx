import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  User,
  Mail,
  Key,
  Shield,
  PanelLeft,
  PanelTop,
  Sun,
  Moon,
  Save,
  Download,
  Trash2,
  Clock,
  Layers,
  Boxes,
  Users,
  DollarSign,
  Award,
  Check,
  ArrowLeft,
  LogOut,
  FileText,
  Sparkles,
  BookOpen,
  Database,
  Palette,
  Pin,
  PinOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  GripVertical,
  ChevronRight,
  ShieldCheck,
  Zap,
  MoveRight
} from 'lucide-react';
import { UserAccount, NavLayout, Subteam, ClockInSession, PageTransitionStyle } from '../types';
import { ACCENT_COLOR_PRESETS } from '../utils/accentColor';
import { ALL_DIGEST_METRICS } from './WeeklyDigestWidget';

export const DEFAULT_WORKSPACE_MODULES = [
  { id: 'journal', label: 'Notebook Logs', icon: BookOpen, desc: 'Engineering notebook entries & daily lab logs' },
  { id: 'time_entry', label: 'Time Card', icon: Clock, desc: 'Clock-in timesheet & lab session tracking' },
  { id: 'kanban', label: 'Kanban Board', icon: Layers, desc: 'Task backlog & sprint board' },
  { id: 'inventory', label: 'Lab Inventory', icon: Boxes, desc: 'Hardware parts, bins, & QR code management' },
  { id: 'outreach', label: 'Outreach Logs', icon: Users, desc: 'Community events & STEM demos' },
  { id: 'finance', label: 'General Ledger', icon: DollarSign, desc: 'Team budget, transactions, & receipts' },
  { id: 'handbook', label: 'Student Handbook', icon: FileText, desc: 'Team policies & safety regulations' },
  { id: 'grants', label: 'Grant Tracker', icon: Award, desc: 'Sponsorships & grant applications' },
  { id: 'qotd', label: 'Question of the Day', icon: Sparkles, desc: 'Daily FTC rules & trivia questions' },
];

export type SettingsMenuTab = 
  | 'profile'
  | 'appearance'
  | 'navigation'
  | 'dashboard'
  | 'security'
  | 'data';

interface SettingsViewProps {
  currentUser: UserAccount;
  onUpdateProfile: (name: string, primarySubteam: Subteam, secondarySubteam: Subteam) => Promise<boolean>;
  onRequestPasswordReset: (email: string) => void;
  onLogout: () => void;
  navLayout: NavLayout;
  onSetNavLayout: (layout: NavLayout) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
  onClearAllData: () => void;
  onDownloadBackup: () => void;
  onOpenSeasonTransition?: () => void;
  onRestoreDemoData?: () => void;
  activeSession: ClockInSession | null;
  hiddenWorkspaces: string[];
  onToggleWorkspaceVisibility: (id: string) => void;
  accentColor: string;
  onSetAccentColor: (colorId: string) => void;
  pinnedWorkspaces: string[];
  onTogglePinWorkspace: (id: string) => void;
  onUpdatePinnedWorkspaces?: (newPinned: string[]) => void;
  pageTransition?: PageTransitionStyle;
  onSetPageTransition?: (style: PageTransitionStyle) => void;
  navOrder: string[];
  onUpdateNavOrder: (newOrder: string[]) => void;
  digestSettings: string[];
  onUpdateDigestSettings: (newSettings: string[]) => void;
  counts: {
    journalEntries: number;
    kanbanTasks: number;
    inventoryItems: number;
    outreachEvents: number;
    ledgerTransactions: number;
  };
}

export function SettingsView({
  currentUser,
  onUpdateProfile,
  onRequestPasswordReset,
  onLogout,
  navLayout,
  onSetNavLayout,
  isDark,
  onToggleTheme,
  onBackToDashboard,
  onClearAllData,
  onDownloadBackup,
  onOpenSeasonTransition,
  onRestoreDemoData,
  activeSession,
  hiddenWorkspaces,
  onToggleWorkspaceVisibility,
  accentColor,
  onSetAccentColor,
  pinnedWorkspaces,
  onTogglePinWorkspace,
  onUpdatePinnedWorkspaces,
  pageTransition = 'smooth',
  onSetPageTransition,
  navOrder,
  onUpdateNavOrder,
  digestSettings,
  onUpdateDigestSettings,
  counts
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsMenuTab>('profile');
  const [name, setName] = useState(currentUser.name);
  const [primarySubteam, setPrimarySubteam] = useState<string>(currentUser.primarySubteam || 'Design/Build/Fabrication');
  const [secondarySubteam, setSecondarySubteam] = useState<string>(currentUser.secondarySubteam || 'None');
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const isMentorOrAdmin = currentUser.role === 'mentor' || currentUser.role === 'captain';

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    setSaveFeedback(null);
    try {
      const success = await onUpdateProfile(name.trim(), primarySubteam as any, secondarySubteam as any);
      if (success) {
        setSaveFeedback('Profile saved successfully');
        setTimeout(() => setSaveFeedback(null), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordResetClick = () => {
    onRequestPasswordReset(currentUser.schoolEmail);
    setResetSent(true);
    setTimeout(() => setResetSent(false), 5000);
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const sortedModules = [...DEFAULT_WORKSPACE_MODULES].sort((a, b) => {
    const isPinnedA = pinnedWorkspaces.includes(a.id);
    const isPinnedB = pinnedWorkspaces.includes(b.id);
    if (isPinnedA && !isPinnedB) return -1;
    if (!isPinnedA && isPinnedB) return 1;
    if (isPinnedA && isPinnedB) {
      const pinIdxA = pinnedWorkspaces.indexOf(a.id);
      const pinIdxB = pinnedWorkspaces.indexOf(b.id);
      if (pinIdxA !== -1 && pinIdxB !== -1) return pinIdxA - pinIdxB;
    }
    const idxA = navOrder.indexOf(a.id);
    const idxB = navOrder.indexOf(b.id);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (draggedIndex !== dropIndex) {
      const currentOrder = sortedModules.map(m => m.id);
      const itemToMove = currentOrder[draggedIndex];
      const updatedOrder = [...currentOrder];
      updatedOrder.splice(draggedIndex, 1);
      updatedOrder.splice(dropIndex, 0, itemToMove);
      onUpdateNavOrder(updatedOrder);
      if (onUpdatePinnedWorkspaces) {
        const newPinnedOrder = updatedOrder.filter(mid => pinnedWorkspaces.includes(mid));
        onUpdatePinnedWorkspaces(newPinnedOrder);
      }
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveModule = (id: string, direction: 'up' | 'down') => {
    const currentOrder = sortedModules.map(m => m.id);
    const index = currentOrder.indexOf(id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;
    
    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;
    
    onUpdateNavOrder(currentOrder);
    if (onUpdatePinnedWorkspaces) {
      const newPinnedOrder = currentOrder.filter(mid => pinnedWorkspaces.includes(mid));
      onUpdatePinnedWorkspaces(newPinnedOrder);
    }
  };

  const handleResetOrder = () => {
    onUpdateNavOrder(DEFAULT_WORKSPACE_MODULES.map(m => m.id));
    if (onUpdatePinnedWorkspaces) {
      onUpdatePinnedWorkspaces([]);
    }
  };

  const toggleDigestMetric = (metricId: string) => {
    const next = digestSettings.includes(metricId)
      ? digestSettings.filter(id => id !== metricId)
      : [...digestSettings, metricId];
    if (next.length > 0) {
      onUpdateDigestSettings(next);
    }
  };

  const menuItems = [
    {
      id: 'profile' as SettingsMenuTab,
      label: 'Profile & Account',
      description: 'Personal info & subteam',
      icon: User
    },
    {
      id: 'appearance' as SettingsMenuTab,
      label: 'Appearance & Theme',
      description: 'Color theme & dark mode',
      icon: Palette
    },
    {
      id: 'navigation' as SettingsMenuTab,
      label: 'Navigation & Layout',
      description: 'Sidebar, order & workspaces',
      icon: SlidersHorizontal
    },
    {
      id: 'dashboard' as SettingsMenuTab,
      label: 'Dashboard Digest',
      description: 'Weekly summary metrics',
      icon: LayoutGrid
    },
    {
      id: 'security' as SettingsMenuTab,
      label: 'Security & Access',
      description: 'Student ID & password',
      icon: Shield
    },
    {
      id: 'data' as SettingsMenuTab,
      label: 'Data & System',
      description: 'Backups, logs & diagnostics',
      icon: Database
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-2">
      {/* MINIMAL TOP NAV / HEADER */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Return to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Portal Settings
              </h1>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                Team #6567
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure your personal preferences, interface layout, and account security.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>{currentUser.name}</span>
            <span>•</span>
            <span className="capitalize">{currentUser.role}</span>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* FEEDBACK NOTIFICATION */}
      {saveFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{saveFeedback}</span>
        </motion.div>
      )}

      {/* MAIN TWO-PANE SETTINGS LAYOUT (MENU LIST + CONTENT PANE) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* LEFT PANE: MINIMAL MENU NAVIGATION */}
        <aside className="md:col-span-4 lg:col-span-3">
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none" aria-label="Settings Categories">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between shrink-0 md:shrink cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-brand dark:text-brand'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`} />
                    <div>
                      <div className="text-xs font-medium leading-none">
                        {item.label}
                      </div>
                      <div className={`hidden lg:block text-[10px] mt-1 line-clamp-1 ${
                        isActive ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`hidden md:block w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isActive ? 'opacity-100' : ''
                  }`} />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* RIGHT PANE: ACTIVE SETTINGS MENU CONTENT */}
        <main className="md:col-span-8 lg:col-span-9">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs">
            <AnimatePresence mode="wait">
              {/* TAB 1: PROFILE & ACCOUNT */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Profile &amp; Account
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Manage your public student name, school credentials, and robotics subteam focus.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitProfile} className="space-y-5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Full Name <span className="text-brand">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium transition-all"
                          placeholder="First & Last Name"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          School Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            disabled
                            value={currentUser.schoolEmail}
                            className="w-full bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-500 dark:text-slate-400 font-mono cursor-not-allowed"
                          />
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Primary Subteam <span className="text-brand">*</span>
                        </label>
                        <select
                          value={primarySubteam}
                          onChange={(e) => setPrimarySubteam(e.target.value as any)}
                          className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium transition-all"
                        >
                          <option value="Design/Build/Fabrication">⚙️ Design/Build/Fabrication</option>
                          <option value="Programming">💻 Programming</option>
                          <option value="Outreach">🌍 Outreach</option>
                          <option value="Business & Media">📈 Business &amp; Media</option>
                          <option value="Inspire">✨ Inspire</option>
                          <option value="Strategy">🎯 Strategy</option>
                          {isMentorOrAdmin && (
                            <>
                              <option value="Mentor">🛡️ Coach / Mentor</option>
                              <option value="Lead/Captain">👑 Subteam Lead / Captain</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Secondary Focus
                        </label>
                        <select
                          value={secondarySubteam}
                          onChange={(e) => setSecondarySubteam(e.target.value as any)}
                          className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium transition-all"
                        >
                          <option value="None">None (Single Subteam Focus)</option>
                          <option value="Inspire">✨ Inspire</option>
                          <option value="Strategy">🎯 Strategy</option>
                        </select>
                      </div>
                    </div>

                    {/* MINIMAL LAB SESSION STATUS INLINE */}
                    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            Robotics Lab Status
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {activeSession ? (
                              <span>Clocked in to {activeSession.subteam} since {new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            ) : (
                              <span>Currently not clocked in</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`self-start sm:self-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        activeSession 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {activeSession ? 'ACTIVE SESSION' : 'OFFLINE'}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand text-white hover:bg-brand-hover transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 2: APPEARANCE & THEME */}
              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Appearance &amp; Theme
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Select your interface color scheme and light/dark theme preference.
                    </p>
                  </div>

                  {/* THEME MODE */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Color Mode
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => { if (isDark) onToggleTheme(); }}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          !isDark
                            ? 'border-brand bg-brand/5 dark:bg-brand/10 ring-1 ring-brand/30 shadow-2xs font-semibold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span className="text-xs text-slate-900 dark:text-white">Light Mode</span>
                        </div>
                        {!isDark && <Check className="w-4 h-4 text-brand" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => { if (!isDark) onToggleTheme(); }}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isDark
                            ? 'border-brand bg-brand/5 dark:bg-brand/10 ring-1 ring-brand/30 shadow-2xs font-semibold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Moon className="w-4 h-4 text-amber-400" />
                          <span className="text-xs text-slate-900 dark:text-white">Dark Mode</span>
                        </div>
                        {isDark && <Check className="w-4 h-4 text-brand" />}
                      </button>
                    </div>
                  </div>

                  {/* ACCENT COLOR PRESETS */}
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                        Primary Accent Color
                      </label>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Controls buttons, active indicators, and highlight accents.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {ACCENT_COLOR_PRESETS.map((preset) => {
                        const isSelected = accentColor === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => onSetAccentColor(preset.id)}
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-brand bg-slate-50 dark:bg-slate-800 ring-1 ring-brand/30 font-semibold'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-white"
                              style={{ backgroundColor: preset.hex }}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                            <div className="truncate">
                              <div className="text-xs text-slate-900 dark:text-white truncate">
                                {preset.name}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                {preset.hex}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PAGE TRANSITION ANIMATIONS */}
                  {onSetPageTransition && (
                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                            Page Transition Animation
                          </label>
                          <span className="text-[9px] font-mono font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded border border-brand/20 uppercase">
                            Framer Motion
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Controls the fluid animation effect when switching between workspaces and portal views.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          {
                            id: 'smooth' as const,
                            name: 'Smooth Glide',
                            desc: 'Soft fade with vertical elevation glide (Default)',
                            icon: Zap,
                          },
                          {
                            id: 'fade' as const,
                            name: 'Subtle Crossfade',
                            desc: 'Clean opacity fade between portal screens',
                            icon: Sparkles,
                          },
                          {
                            id: 'slide' as const,
                            name: 'Lateral Slide',
                            desc: 'Directional horizontal motion transition',
                            icon: MoveRight,
                          },
                          {
                            id: 'none' as const,
                            name: 'Instant',
                            desc: 'No animation (prefers reduced motion)',
                            icon: SlidersHorizontal,
                          },
                        ].map((opt) => {
                          const isSelected = pageTransition === opt.id;
                          const OptIcon = opt.icon;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => onSetPageTransition(opt.id)}
                              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-brand bg-brand/5 dark:bg-brand/10 ring-1 ring-brand/30 shadow-2xs'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50'
                              }`}
                            >
                              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                isSelected 
                                  ? 'bg-brand text-white' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                              }`}>
                                <OptIcon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                    {opt.name}
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                                  {opt.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 3: NAVIGATION & LAYOUT */}
              {activeTab === 'navigation' && (
                <motion.div
                  key="navigation"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Navigation &amp; Layout
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Choose your layout style and organize workspace menu order, pinning, and visibility.
                    </p>
                  </div>

                  {/* LAYOUT CHOICE */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Navigation Style
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => onSetNavLayout('sidebar')}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          navLayout === 'sidebar'
                            ? 'border-brand bg-brand/5 dark:bg-brand/10 ring-1 ring-brand/30 shadow-2xs font-semibold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <PanelLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                          <span className="text-xs text-slate-900 dark:text-white">Left Sidebar</span>
                        </div>
                        {navLayout === 'sidebar' && <Check className="w-4 h-4 text-brand" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => onSetNavLayout('topbar')}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          navLayout === 'topbar'
                            ? 'border-brand bg-brand/5 dark:bg-brand/10 ring-1 ring-brand/30 shadow-2xs font-semibold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <PanelTop className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                          <span className="text-xs text-slate-900 dark:text-white">Header Top Bar</span>
                        </div>
                        {navLayout === 'topbar' && <Check className="w-4 h-4 text-brand" />}
                      </button>
                    </div>
                  </div>

                  {/* WORKSPACES REORDER & PINNING */}
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                          Workspace Navigation Menu
                        </label>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Reorder tabs, pin shortcuts to dashboard, or toggle visibility.
                        </span>
                      </div>
                      <button
                        onClick={handleResetOrder}
                        className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Reset order"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {sortedModules.map((module, idx) => {
                        const isHidden = hiddenWorkspaces.includes(module.id);
                        const isPinned = pinnedWorkspaces.includes(module.id);
                        const isBeingDragged = draggedIndex === idx;
                        const isBeingDraggedOver = dragOverIndex === idx && draggedIndex !== idx;

                        return (
                          <motion.div
                            layout
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                            key={module.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors cursor-grab active:cursor-grabbing ${
                              isBeingDragged
                                ? 'opacity-40 border-dashed border-brand bg-brand/5'
                                : isBeingDraggedOver
                                ? 'ring-2 ring-brand border-brand bg-brand/10 shadow-xs'
                                : isHidden
                                ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                                : isPinned
                                ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-300/60 dark:border-amber-800/40 hover:border-amber-400 dark:hover:border-amber-700'
                                : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <div className="flex flex-col gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveModule(module.id, 'up');
                                  }}
                                  className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === sortedModules.length - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveModule(module.id, 'down');
                                  }}
                                  className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              <module.icon className="w-4 h-4 text-brand shrink-0" />
                              <div className="truncate">
                                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 mr-2">
                                  {module.label}
                                </span>
                                {isPinned && (
                                  <span className="text-[9px] font-mono uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-1 py-0.2 rounded">
                                    Pinned
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => onTogglePinWorkspace(module.id)}
                                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                                  isPinned
                                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                                title={isPinned ? 'Unpin from top' : 'Pin to top of menu'}
                              >
                                {isPinned ? <Pin className="w-3 h-3 fill-current" /> : <PinOff className="w-3 h-3" />}
                              </button>

                              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                                <input
                                  type="checkbox"
                                  checked={!isHidden}
                                  onChange={() => onToggleWorkspaceVisibility(module.id)}
                                  className="rounded text-brand w-3.5 h-3.5 focus:ring-brand"
                                />
                                <span className="text-[11px] font-mono">{isHidden ? 'Hidden' : 'Visible'}</span>
                              </label>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: DASHBOARD DIGEST */}
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Weekly Digest Settings
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Select which metrics and activity indicators display on your team dashboard digest.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    {ALL_DIGEST_METRICS.map((metric) => {
                      const isChecked = digestSettings.includes(metric.id);
                      const Icon = metric.icon;
                      return (
                        <div
                          key={metric.id}
                          onClick={() => toggleDigestMetric(metric.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-slate-50/80 dark:bg-slate-850/80 border-slate-300 dark:border-slate-700'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${metric.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                                {metric.label}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {isChecked ? 'Visible on dashboard weekly digest' : 'Hidden from digest'}
                              </div>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-brand border-brand text-white'
                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* TAB 5: SECURITY & ACCESS */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Security &amp; Credentials
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      View your student identification and request encrypted password reset tokens.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="space-y-1.5 max-w-sm">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Student / Lunch ID Reference
                      </label>
                      <input
                        type="password"
                        disabled
                        value={currentUser.schoolId || '••••••'}
                        className="w-full bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 dark:text-slate-400 font-mono cursor-not-allowed"
                      />
                      <p className="text-[10px] text-slate-400">School ID is managed by team coaches for identity authentication.</p>
                    </div>

                    <div className="pt-2 space-y-3">
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-slate-500" />
                            <span>Password Management</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Send a secure password recovery link to {currentUser.schoolEmail}.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handlePasswordResetClick}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 text-xs font-semibold transition-all cursor-pointer shrink-0"
                        >
                          Send Reset Email
                        </button>
                      </div>

                      {resetSent && (
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Reset link successfully dispatched to {currentUser.schoolEmail}.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 6: DATA & SYSTEM */}
              {activeTab === 'data' && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Data &amp; System Diagnostics
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Overview of live record counts, data backups, and local device cache.
                    </p>
                  </div>

                  {/* STATS STRIP */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                      <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Notebooks</span>
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{counts.journalEntries}</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tasks</span>
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{counts.kanbanTasks}</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Inventory</span>
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{counts.inventoryItems}</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Outreach</span>
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{counts.outreachEvents}</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Transactions</span>
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{counts.ledgerTransactions}</span>
                      </div>
                    </div>
                  </div>

                  {/* DATA ACTIONS */}
                  <div className="space-y-3 pt-2">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>Download Data Backup</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Export complete robotics database in formatted JSON file.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onDownloadBackup}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
                      >
                        Export JSON
                      </button>
                    </div>

                    {isMentorOrAdmin && onOpenSeasonTransition && (
                      <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Season Transition &amp; Archival</span>
                          </div>
                          <p className="text-[11px] text-purple-700/80 dark:text-purple-400/80 mt-0.5">
                            Archive completed FTC seasons and prepare fresh workspace backlogs.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={onOpenSeasonTransition}
                          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                        >
                          Season Tools
                        </button>
                      </div>
                    )}

                    {onRestoreDemoData && (
                      <div className="p-4 rounded-xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50/20 dark:bg-cyan-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                            <RotateCcw className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Restore Default Team Datasets</span>
                          </div>
                          <p className="text-[11px] text-cyan-700/80 dark:text-cyan-400/80 mt-0.5">
                            Populates standard lab inventory items, outreach records, kanban tasks, and demo journal logs to local storage and syncs to cloud.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={onRestoreDemoData}
                          className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                          id="btn-restore-demo-data"
                        >
                          Restore Data
                        </button>
                      </div>
                    )}

                    <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Local Device Sandbox Cache</span>
                        </div>
                        <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                          Clears browser localStorage cache. Real-time Firebase records remain intact.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onClearAllData}
                        className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                      >
                        Wipe Cache
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

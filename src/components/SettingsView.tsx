import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  User,
  Mail,
  Key,
  Shield,
  ShieldCheck,
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
  AlertCircle,
  ArrowLeft,
  LogOut,
  FileText,
  Sparkles,
  BookOpen,
  Calendar,
  Database
} from 'lucide-react';
import { UserAccount, NavLayout, Subteam, JournalEntry, KanbanTask, InventoryItem, OutreachEvent, LedgerTransaction, ClockInSession } from '../types';

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
  activeSession: ClockInSession | null;
  hiddenWorkspaces: string[];
  onToggleWorkspaceVisibility: (id: string) => void;
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
  activeSession,
  hiddenWorkspaces,
  onToggleWorkspaceVisibility,
  counts
}: SettingsViewProps) {
  const [name, setName] = useState(currentUser.name);
  const [primarySubteam, setPrimarySubteam] = useState<Subteam>(currentUser.primarySubteam || 'Design/Build/Fabrication');
  const [secondarySubteam, setSecondarySubteam] = useState<Subteam>(currentUser.secondarySubteam || 'None' as any);
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
      const success = await onUpdateProfile(name.trim(), primarySubteam, secondarySubteam);
      if (success) {
        setSaveFeedback('Profile settings saved successfully!');
        setTimeout(() => setSaveFeedback(null), 3500);
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

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8" id="settings-page-root">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              type="button"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Return to Dashboard Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Settings className="w-6 h-6 text-brand" />
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-display">
                  Workspace Settings &amp; Preferences
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your user profile, subteam assignments, navigation UI layout, and system preferences.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToDashboard}
              type="button"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Back to Workspace
            </button>
            <button
              onClick={onLogout}
              type="button"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid of Settings Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT 2 COLUMNS: Profile & UI Layout Preferences */}
          <div className="lg:col-span-2 space-y-6">

            {/* Profile Information Form */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-brand/10 text-brand dark:text-red-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Account Profile &amp; Identity</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Update your name and primary robotics engineering focus.</p>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  currentUser.role === 'mentor' 
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                    : currentUser.role === 'captain'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                }`}>
                  {currentUser.role.toUpperCase()}
                </span>
              </div>

              <form onSubmit={handleSubmitProfile} className="p-5 space-y-4">
                {saveFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>{saveFeedback}</span>
                  </div>
                )}

                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium transition-all"
                    placeholder="First & Last Name"
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    School Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={currentUser.schoolEmail}
                      className="w-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-500 dark:text-slate-400 font-mono cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-slate-400">School emails are locked to your student roster record.</span>
                </div>

                {/* Subteam Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Primary Subteam <span className="text-brand">*</span>
                    </label>
                    <select
                      value={primarySubteam}
                      onChange={(e) => setPrimarySubteam(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-semibold transition-all"
                    >
                      <option value="Design/Build/Fabrication">⚙️ Design/Build/Fabrication</option>
                      <option value="Programming">💻 Programming</option>
                      <option value="Outreach">🌍 Outreach</option>
                      <option value="Business & Media">📈 Business &amp; Media</option>
                      {isMentorOrAdmin && (
                        <>
                          <option value="Mentor">🛡️ Coach / Mentor</option>
                          <option value="Lead/Captain">👑 Subteam Lead / Captain</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Secondary Focus
                    </label>
                    <select
                      value={secondarySubteam}
                      onChange={(e) => setSecondarySubteam(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-semibold transition-all"
                    >
                      <option value="None">🚫 None (Primary Only)</option>
                      <option value="Inspire">✨ Inspire</option>
                      <option value="Strategy">📊 Strategy</option>
                    </select>
                  </div>
                </div>

                {/* Save Profile Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-brand text-white hover:bg-slate-800 dark:hover:bg-red-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving Changes...' : 'Save Profile Settings'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Navigation Layout Preference Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <PanelLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Navigation Layout</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose between the classic vertical sidebar or the full-width horizontal top bar.</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  {navLayout === 'sidebar' ? 'SIDEBAR ACTIVE' : 'TOP BAR ACTIVE'}
                </span>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Sidebar Option */}
                  <div
                    onClick={() => onSetNavLayout('sidebar')}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      navLayout === 'sidebar'
                        ? 'border-brand bg-brand/5 dark:bg-brand/10 shadow-sm ring-1 ring-brand/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${navLayout === 'sidebar' ? 'bg-brand text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          <PanelLeft className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-900 dark:text-white">Sidebar Navigation</h3>
                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Classic left drawer</p>
                        </div>
                      </div>
                      {navLayout === 'sidebar' && (
                        <div className="p-1 rounded-full bg-brand text-white">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="h-16 rounded-lg bg-slate-200/70 dark:bg-slate-800/80 p-1.5 flex gap-1.5 overflow-hidden border border-slate-300/60 dark:border-slate-700/60">
                      <div className="w-1/4 h-full bg-brand/30 dark:bg-brand/40 rounded flex flex-col gap-0.5 p-1">
                        <div className="w-full h-1 bg-brand/60 rounded-full" />
                        <div className="w-3/4 h-1 bg-brand/60 rounded-full" />
                        <div className="w-1/2 h-1 bg-brand/60 rounded-full" />
                      </div>
                      <div className="flex-1 h-full bg-white dark:bg-slate-900 rounded p-1 flex flex-col gap-1">
                        <div className="w-1/2 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="w-3/4 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                      Shows a collapsible vertical panel on the left with instant access to all engineering modules. Hides the top navigation options.
                    </p>
                  </div>

                  {/* Top Bar Option */}
                  <div
                    onClick={() => onSetNavLayout('topbar')}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      navLayout === 'topbar'
                        ? 'border-brand bg-brand/5 dark:bg-brand/10 shadow-sm ring-1 ring-brand/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${navLayout === 'topbar' ? 'bg-brand text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          <PanelTop className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-900 dark:text-white">Top Bar Navigation</h3>
                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Full-width horizontal tabs</p>
                        </div>
                      </div>
                      {navLayout === 'topbar' && (
                        <div className="p-1 rounded-full bg-brand text-white">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="h-16 rounded-lg bg-slate-200/70 dark:bg-slate-800/80 p-1.5 flex flex-col gap-1.5 overflow-hidden border border-slate-300/60 dark:border-slate-700/60">
                      <div className="w-full h-3 bg-brand/30 dark:bg-brand/40 rounded flex items-center gap-1 px-1">
                        <div className="w-4 h-1 bg-brand/70 rounded-full" />
                        <div className="w-4 h-1 bg-brand/70 rounded-full" />
                        <div className="w-4 h-1 bg-brand/70 rounded-full" />
                      </div>
                      <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded p-1 flex flex-col gap-1">
                        <div className="w-1/3 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="w-3/4 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                      Hides the vertical sidebar and renders all workspace navigation tabs horizontally across the top header for maximum screen width.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Selected layout will automatically persist across all your browser sessions.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Appearance & Color Theme */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Appearance &amp; Theme</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Toggle between Dark Engineering Mode and Clean Light Mode.</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => { if (!isDark) onToggleTheme(); }}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all cursor-pointer text-left ${
                      isDark 
                        ? 'border-brand bg-slate-900 text-white ring-1 ring-brand/30' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-800 text-amber-400">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black">Dark Mode</div>
                        <div className="text-[10.5px] opacity-75">Eye-safe engineering night theme</div>
                      </div>
                    </div>
                    {isDark && <Check className="w-4 h-4 text-brand shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => { if (isDark) onToggleTheme(); }}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all cursor-pointer text-left ${
                      !isDark 
                        ? 'border-brand bg-white text-slate-900 ring-1 ring-brand/30 shadow-xs' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black">Light Mode</div>
                        <div className="text-[10.5px] opacity-75">Crisp high-contrast daylight theme</div>
                      </div>
                    </div>
                    {!isDark && <Check className="w-4 h-4 text-brand shrink-0" />}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Security, Session, & Data Diagnostics */}
            {/* Quick Access Navigation Customization */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Quick Access</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Toggle which modules appear in your navigation layout.</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {[
                    { id: 'journal', label: 'Notebook Logs', icon: BookOpen },
                    { id: 'time_entry', label: 'Time Card', icon: Clock },
                    { id: 'kanban', label: 'Kanban Board', icon: Layers },
                    { id: 'inventory', label: 'Lab Inventory', icon: Boxes },
                    { id: 'outreach', label: 'Outreach Logs', icon: Users },
                    { id: 'finance', label: 'General Ledger', icon: DollarSign },
                    { id: 'handbook', label: 'Student Handbook', icon: FileText },
                    { id: 'grants', label: 'Grant Tracker', icon: Award },
                    { id: 'qotd', label: 'Question of the Day', icon: Sparkles }
                  ].map(module => (
                    <label key={module.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          <module.icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{module.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={!hiddenWorkspaces.includes(module.id)}
                        onChange={() => onToggleWorkspaceVisibility(module.id)}
                        className="rounded text-brand w-4 h-4 focus:ring-brand"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          <div className="space-y-6">

            {/* Password & Security Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Security &amp; Credentials</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Lunch ID &amp; password authentication</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Student / Lunch ID Password
                  </label>
                  <input
                    type="password"
                    disabled
                    value={currentUser.schoolId || '••••••'}
                    className="w-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 dark:text-slate-400 font-mono cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handlePasswordResetClick}
                    className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold py-2.5 px-3 rounded-xl border border-rose-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Password Reset Email</span>
                  </button>

                  {resetSent && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-2 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Password reset token dispatched to {currentUser.schoolEmail}.</span>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                    To safeguard member achiddenWorkspaces,
  onToggleWorkspaceVisibility,
  counts, password updates must be verified via encrypted email tokens.
                  </p>
                </div>
              </div>
            </div>

            {/* Active Lab Session Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Lab Session Status</h2>
                </div>
                {activeSession ? (
                  <span className="text-[10px] font-mono font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    CLOCKED IN
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    NOT ACTIVE
                  </span>
                )}
              </div>

              <div className="p-5 text-xs">
                {activeSession ? (
                  <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Subteam:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{activeSession.subteam}</span>
                    </div>
                    {activeSession.taskDescription && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Task Focus:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{activeSession.taskDescription}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clocked in at:</span>
                      <span className="font-mono text-slate-900 dark:text-white">{new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-[11.5px]">
                    You are not currently clocked in for lab hours. Visit the Time Card module to start a robotics session.
                  </p>
                )}
              </div>
            </div>

            {/* System Diagnostics & Backups */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Storage &amp; Backup Diagnostics</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Team #6567 live database</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Journal Entries</span>
                    <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{counts.journalEntries}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Kanban Tasks</span>
                    <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{counts.kanbanTasks}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Inventory Items</span>
                    <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{counts.inventoryItems}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Outreach Logs</span>
                    <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{counts.outreachEvents}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={onDownloadBackup}
                    className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-brand" />
                    <span>Download Team Data Backup (.json)</span>
                  </button>

                  {isMentorOrAdmin && onOpenSeasonTransition && (
                    <button
                      type="button"
                      onClick={onOpenSeasonTransition}
                      className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Season Transition &amp; Archival Tools</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClearAllData}
                    className="w-full bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 text-[11px] font-bold py-1.5 px-3 rounded-xl border border-dashed border-rose-300 dark:border-rose-900 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Wipe Local Browser Sandbox Cache</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

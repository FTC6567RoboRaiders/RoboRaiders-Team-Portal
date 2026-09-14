import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  User,
  Mail,
  Key,
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
  Calendar,
  Database,
  Palette,
  Pin,
  PinOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  GripVertical
} from 'lucide-react';
import { UserAccount, NavLayout, Subteam, ClockInSession } from '../types';
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
  accentColor: string;
  onSetAccentColor: (colorId: string) => void;
  pinnedWorkspaces: string[];
  onTogglePinWorkspace: (id: string) => void;
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
  activeSession,
  hiddenWorkspaces,
  onToggleWorkspaceVisibility,
  accentColor,
  onSetAccentColor,
  pinnedWorkspaces,
  onTogglePinWorkspace,
  navOrder,
  onUpdateNavOrder,
  digestSettings,
  onUpdateDigestSettings,
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

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sort modules based on current navOrder
  const sortedModules = [...DEFAULT_WORKSPACE_MODULES].sort((a, b) => {
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
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveModule = (id: string, direction: 'up' | 'down') => {
    const currentOrder = navOrder.length > 0 ? [...navOrder] : DEFAULT_WORKSPACE_MODULES.map(m => m.id);
    const index = currentOrder.indexOf(id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;
    
    // Swap
    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;
    
    onUpdateNavOrder(currentOrder);
  };

  const handleResetOrder = () => {
    onUpdateNavOrder(DEFAULT_WORKSPACE_MODULES.map(m => m.id));
  };

  const toggleDigestMetric = (metricId: string) => {
    const next = digestSettings.includes(metricId)
      ? digestSettings.filter(id => id !== metricId)
      : [...digestSettings, metricId];
    if (next.length > 0) {
      onUpdateDigestSettings(next);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white font-display">
                Portal Customization &amp; Settings
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-brand/10 text-brand px-2.5 py-0.5 rounded-full border border-brand/20">
                Team #6567
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personalize your accent color theme, Weekly Digest stats, pinned dashboard features, and navigation order.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {saveFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md"
        >
          <Check className="w-4 h-4" />
          <span>{saveFeedback}</span>
        </motion.div>
      )}

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT & CENTER COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. PORTAL ACCENT COLOR PICKER */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Primary Portal Accent Color</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Updates buttons, active badges, highlights, and focus rings across the entire application.</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ACCENT_COLOR_PRESETS.map(preset => {
                  const isActive = accentColor === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onSetAccentColor(preset.id)}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 cursor-pointer text-left ${
                        isActive
                          ? 'border-brand bg-slate-50 dark:bg-slate-800/80 shadow-xs ring-2 ring-brand/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: preset.hex }}
                      >
                        {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
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
          </div>

          {/* 2. REORDER SIDEBAR & TOP BAR NAVIGATION + PINNING */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Customization &amp; Navigation Order</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Reorder items, pin features to your dashboard, and toggle workspace visibility.</p>
                </div>
              </div>
              <button
                onClick={handleResetOrder}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset to default module order"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Order</span>
              </button>
            </div>

            <div className="p-5 space-y-2">
              <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                <GripVertical className="w-3.5 h-3.5 text-brand" />
                <span>Drag and drop any item to customize navigation order, or use the arrow buttons.</span>
              </div>
              {sortedModules.map((module, idx) => {
                const isHidden = hiddenWorkspaces.includes(module.id);
                const isPinned = pinnedWorkspaces.includes(module.id);
                const isBeingDragged = draggedIndex === idx;
                const isBeingDraggedOver = dragOverIndex === idx && draggedIndex !== idx;

                return (
                  <div
                    key={module.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-grab active:cursor-grabbing ${
                      isBeingDragged
                        ? 'opacity-40 border-dashed border-brand bg-brand/5 scale-[0.98]'
                        : isBeingDraggedOver
                        ? 'ring-2 ring-brand border-brand bg-brand/10 shadow-md scale-[1.01]'
                        : isHidden
                        ? 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Drag Handle & Reorder Arrows */}
                      <div className="flex items-center gap-1.5 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing text-slate-400" title="Drag to reorder workspace menu" />
                        <div className="flex flex-col gap-0.5">
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
                            <ArrowUp className="w-3 h-3" />
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
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-brand/10 text-brand">
                        <module.icon className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{module.label}</span>
                          {isPinned && (
                            <span className="text-[9.5px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                              PINNED
                            </span>
                          )}
                          {isHidden && (
                            <span className="text-[9.5px] font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.2 rounded dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                              HIDDEN
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{module.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {/* Pin Button */}
                      <button
                        type="button"
                        onClick={() => onTogglePinWorkspace(module.id)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                          isPinned
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                        title={isPinned ? 'Unpin from main dashboard' : 'Pin to main dashboard'}
                      >
                        {isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
                        <span className="text-[11px] font-mono">{isPinned ? 'Pinned' : 'Pin'}</span>
                      </button>

                      {/* Visibility Checkbox */}
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={!isHidden}
                          onChange={() => onToggleWorkspaceVisibility(module.id)}
                          className="rounded text-brand w-4 h-4 focus:ring-brand"
                        />
                        <span className="text-[11px]">{isHidden ? 'Show' : 'Visible'}</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. WEEKLY DIGEST CUSTOMIZATION */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Digest Customization</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose which activity metric cards appear on your Weekly Digest panel.</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ALL_DIGEST_METRICS.map(metric => {
                  const isChecked = digestSettings.includes(metric.id);
                  return (
                    <button
                      key={metric.id}
                      type="button"
                      onClick={() => toggleDigestMetric(metric.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-white dark:bg-slate-800 border-brand/50 text-slate-900 dark:text-white shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className={`p-1.5 rounded-lg ${metric.color}`}>
                          <metric.icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold truncate">{metric.label}</span>
                      </div>
                      {isChecked && <Check className="w-4 h-4 text-brand shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. MEMBER PROFILE SETTINGS CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Member Profile Details</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Update your public student name and subteam assignments.</p>
              </div>
            </div>

            <div className="p-5">
              <form onSubmit={handleSubmitProfile} className="space-y-4">
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

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-hover transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving Changes...' : 'Save Profile Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-6">

          {/* NAVIGATION LAYOUT CHOICE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <PanelLeft className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Navigation Layout</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Sidebar vs Top Bar position</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div
                onClick={() => onSetNavLayout('sidebar')}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  navLayout === 'sidebar'
                    ? 'border-brand bg-brand/5 dark:bg-brand/10 shadow-2xs ring-1 ring-brand/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PanelLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Sidebar Layout</span>
                </div>
                {navLayout === 'sidebar' && <Check className="w-4 h-4 text-brand" />}
              </div>

              <div
                onClick={() => onSetNavLayout('topbar')}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  navLayout === 'topbar'
                    ? 'border-brand bg-brand/5 dark:bg-brand/10 shadow-2xs ring-1 ring-brand/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PanelTop className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Top Bar Layout</span>
                </div>
                {navLayout === 'topbar' && <Check className="w-4 h-4 text-brand" />}
              </div>
            </div>
          </div>

          {/* APPEARANCE MODE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Appearance Mode</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Dark or Light theme</p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <button
                type="button"
                onClick={onToggleTheme}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs font-bold flex items-center justify-between text-slate-900 dark:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span>Switch to {isDark ? 'Light' : 'Dark'} Mode</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                  {isDark ? 'Dark Active' : 'Light Active'}
                </span>
              </button>
            </div>
          </div>

          {/* SECURITY & CREDENTIALS */}
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
                  To safeguard member accounts, password updates must be verified via encrypted email tokens.
                </p>
              </div>
            </div>
          </div>

          {/* ACTIVE LAB SESSION CARD */}
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

          {/* STORAGE DIAGNOSTICS & BACKUPS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Storage &amp; Data Diagnostics</h2>
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
                  <span>Download Data Backup (.json)</span>
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
                  <span>Wipe Local Sandbox Cache</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

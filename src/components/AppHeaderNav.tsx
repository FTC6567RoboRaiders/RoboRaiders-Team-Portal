import React, { useState, useRef, useEffect } from 'react';
import { 
  Grid, 
  BookOpen, 
  Clock, 
  Layers, 
  Boxes, 
  Users, 
  DollarSign, 
  Award, 
  FileText, 
  ShieldCheck, 
  Terminal, 
  HelpCircle, 
  Sun, 
  Moon, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronDown, 
  Upload, 
  Download, 
  Trash2, 
  PanelLeftClose, 
  PanelLeft,
  PanelTop,
  Trophy,
  AlertCircle,
  ExternalLink,
  Check,
  Sparkles
} from 'lucide-react';
import { UserAccount, NavLayout } from '../types';
import RoboraidersLogo from './RoboraidersLogo';

interface AppHeaderNavProps {
  currentUser: UserAccount | null;
  userGamification: any;
  currentView: string;
  onSelectView: (view: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  isUserAdminOrMentor: boolean;
  activeSession: boolean;
  sessionElapsed: string;
  pendingReviewsCount: number;
  needsRevisionCount: number;
  lowStockCount: number;
  pendingApprovalsCount: number;
  onOpenMobileMenu: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAllData: () => void;
  disabledModules: string[];
  hiddenWorkspaces?: string[];
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  navLayout: NavLayout;
  onToggleNavLayout: () => void;
  onSetNavLayout?: (layout: NavLayout) => void;
}

export function AppHeaderNav({
  currentUser,
  userGamification,
  currentView,
  onSelectView,
  isDark,
  onToggleTheme,
  onOpenSettings,
  onLogout,
  isUserAdminOrMentor,
  activeSession,
  sessionElapsed,
  pendingReviewsCount,
  needsRevisionCount,
  lowStockCount,
  pendingApprovalsCount,
  onOpenMobileMenu,
  onExportJSON,
  onImportJSON,
  onClearAllData,
  disabledModules,
  hiddenWorkspaces = [],
  isSidebarCollapsed,
  onToggleSidebar,
  navLayout,
  onToggleNavLayout,
  onSetNavLayout
}: AppHeaderNavProps) {
  const [isModulesMenuOpen, setIsModulesMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showHardWipeConfirm, setShowHardWipeConfirm] = useState(false);

  const modulesMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modulesMenuRef.current && !modulesMenuRef.current.contains(event.target as Node)) {
        setIsModulesMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isModuleAccessible = (moduleId: string) => {
    if (disabledModules.includes(moduleId)) {
      return currentUser?.primarySubteam === 'Programming' || isUserAdminOrMentor;
    }
    if (hiddenWorkspaces.includes(moduleId) && moduleId !== "landing" && moduleId !== "settings") return false;
    return true;
  };

  const primaryNavItems = (
    navLayout === 'topbar'
      ? [
          { id: 'landing', label: 'Hub', icon: Grid },
          { 
            id: 'journal', 
            label: 'Notebook', 
            icon: BookOpen,
            badge: pendingReviewsCount > 0 ? pendingReviewsCount : null,
            badgeColor: 'bg-amber-500'
          },
          { 
            id: 'time_entry', 
            label: 'Time Card', 
            icon: Clock,
            pulse: activeSession
          },
          { id: 'kanban', label: 'Tasks', icon: Layers },
          { 
            id: 'inventory', 
            label: 'Inventory', 
            icon: Boxes,
            badge: lowStockCount > 0 ? lowStockCount : null,
            badgeColor: 'bg-amber-500'
          },
          { id: 'outreach', label: 'Outreach', icon: Users },
          { id: 'finance', label: 'Ledger', icon: DollarSign }
        ]
      : [
          { id: 'landing', label: 'Hub', icon: Grid },
          { 
            id: 'journal', 
            label: 'Notebook', 
            icon: BookOpen,
            badge: pendingReviewsCount > 0 ? pendingReviewsCount : null,
            badgeColor: 'bg-amber-500'
          },
          { 
            id: 'time_entry', 
            label: 'Time Card', 
            icon: Clock,
            pulse: activeSession
          },
          { id: 'kanban', label: 'Tasks', icon: Layers },
          { 
            id: 'inventory', 
            label: 'Inventory', 
            icon: Boxes,
            badge: lowStockCount > 0 ? lowStockCount : null,
            badgeColor: 'bg-amber-500'
          }
        ]
  ).filter(item => isModuleAccessible(item.id));

  const secondaryModules = (
    navLayout === 'topbar'
      ? [
          { id: 'qotd', label: 'Question of the Day', sub: 'Daily challenge & trivia', icon: Sparkles },
          { id: 'grants', label: 'Grant Tracker', sub: 'Funding proposals', icon: Award },
          { id: 'handbook', label: 'Student Handbook', sub: 'Guides & safety code', icon: FileText },
          ...(isUserAdminOrMentor ? [
            { 
              id: 'approvals', 
              label: 'Roster & Approvals', 
              sub: 'Member access & reviews', 
              icon: ShieldCheck,
              badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null 
            },
            { 
              id: 'system_dashboard', 
              label: 'System Operations', 
              sub: 'Analytics & database', 
              icon: Terminal 
            }
          ] : [])
        ]
      : [
          { id: 'qotd', label: 'Question of the Day', sub: 'Daily challenge & trivia', icon: Sparkles },
          { id: 'outreach', label: 'Community Outreach', sub: 'Impact events & logs', icon: Users },
          { id: 'finance', label: 'General Ledger', sub: 'Budgets & transactions', icon: DollarSign },
          { id: 'grants', label: 'Grant Tracker', sub: 'Funding proposals', icon: Award },
          { id: 'handbook', label: 'Student Handbook', sub: 'Guides & safety code', icon: FileText },
          ...(isUserAdminOrMentor ? [
            { 
              id: 'approvals', 
              label: 'Roster & Approvals', 
              sub: 'Member access & reviews', 
              icon: ShieldCheck,
              badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null 
            },
            { 
              id: 'system_dashboard', 
              label: 'System Operations', 
              sub: 'Analytics & database', 
              icon: Terminal 
            }
          ] : [])
        ]
  ).filter(item => isModuleAccessible(item.id));

  const isCurrentViewSecondary = secondaryModules.some(m => m.id === currentView);

  const getRoleBadge = (role?: string) => {
    if (role === 'mentor') return { label: 'Mentor', bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
    if (role === 'captain') return { label: 'Captain', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
    return { label: 'Member', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors no-print" id="app-unified-header">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between gap-3">
        
        {/* LEFT: Branding & Desktop Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Sidebar Toggle (shown when in Sidebar layout mode) */}
          {navLayout === 'sidebar' && (
            <button
              onClick={onToggleSidebar}
              className="hidden md:flex p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? "Expand sidebar panel" : "Collapse sidebar panel"}
              aria-label="Toggle Sidebar"
            >
              {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}

          {/* Team Brand */}
          <button 
            onClick={() => onSelectView('landing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            title="Go to Dashboard Hub"
          >
            <RoboraidersLogo className="w-8 h-8 shrink-0 transition-transform group-hover:scale-105" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white group-hover:text-brand transition-colors font-display uppercase">
                  RoboRaiders
                </span>
                <span className="text-[9px] font-mono font-bold bg-brand/10 text-brand dark:text-red-400 px-1 py-0.2 rounded border border-brand/20">
                  #6567
                </span>
              </div>
              <p className="text-[9.5px] font-mono text-slate-400 dark:text-slate-500 leading-none hidden sm:block">
                ENGINEERING WORKSPACE
              </p>
            </div>
          </button>
        </div>

        {/* CENTER: Clean, Sleek App Navigation Menu (Desktop) - Only rendered in Top Bar layout */}
        {navLayout === 'topbar' && (
          <nav className="hidden md:flex items-center gap-1" id="desktop-primary-nav">
            {primaryNavItems.map(item => {
              const ItemIcon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`relative px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-brand dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>

                  {item.pulse && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}

                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full text-white font-black leading-none ${item.badgeColor || 'bg-brand'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* More Modules Dropdown */}
            {secondaryModules.length > 0 && (
              <div className="relative" ref={modulesMenuRef}>
                <button
                  onClick={() => setIsModulesMenuOpen(!isModulesMenuOpen)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCurrentViewSecondary
                      ? 'bg-slate-900 text-white dark:bg-brand dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  aria-expanded={isModulesMenuOpen}
                  aria-haspopup="true"
                >
                  <span>More</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isModulesMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isModulesMenuOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fade-in">
                    <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 px-2.5 py-1 uppercase tracking-wider">
                      Additional Modules
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {secondaryModules.map(module => {
                        const ModuleIcon = module.icon;
                        const isActive = currentView === module.id;

                        return (
                          <button
                            key={module.id}
                            onClick={() => {
                              onSelectView(module.id);
                              setIsModulesMenuOpen(false);
                            }}
                            className={`w-full p-2 rounded-lg flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-red-400 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className={`p-1.5 rounded-md ${isActive ? 'bg-brand text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                              <ModuleIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold leading-tight flex items-center justify-between">
                                <span className="truncate">{module.label}</span>
                                {module.badge && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-red-500 text-white font-black leading-none ml-1 shrink-0">
                                    {module.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5 font-normal">
                                {module.sub}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          onSelectView('help_guide');
                          setIsModulesMenuOpen(false);
                        }}
                        className="w-full p-2 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <HelpCircle className="w-4 h-4 text-cyan-500" />
                        <span>User Manual &amp; Help Guide</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        )}

        {/* RIGHT: Actions, Layout Selector, Session Pill, Theme, and User Profile Menu */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Active Lab Session Pill */}
          {activeSession && (
            <button
              onClick={() => onSelectView('time_entry')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              title="You are currently clocked in. Click to view Time Card."
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>In Lab: {sessionElapsed}</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* USER PROFILE MENU DROPDOWN */}
          {currentUser && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group"
                id="user-profile-menu-trigger"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-brand to-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight block truncate max-w-[110px]">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border hidden md:inline-block leading-none ${roleInfo.bg}`}>
                  {roleInfo.label}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-fade-in">
                  {/* User Profile Header */}
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-rose-500 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-[10.5px] text-slate-400 font-mono truncate">
                          {currentUser.schoolEmail}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border leading-none ${roleInfo.bg}`}>
                            {roleInfo.label}
                          </span>
                          {currentUser.primarySubteam && (
                            <span className="text-[9.5px] font-mono text-slate-400 dark:text-slate-500">
                              {currentUser.primarySubteam}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Gamification summary */}
                    {userGamification && (
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Level {userGamification.stats.level}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          {userGamification.stats.xp.toLocaleString()} XP
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Primary Actions */}
                  <div className="py-2 space-y-0.5 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <button
                      onClick={() => {
                        onSelectView('landing');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Grid className="w-4 h-4 text-slate-400" />
                      <span>Dashboard Hub</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectView('settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      id="menu-settings-btn"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Workspace &amp; Account Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectView('help_guide');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-cyan-500" />
                      <span>Portal Help Guide</span>
                    </button>
                  </div>

                  {/* Navigation Layout Preference Selector */}
                  <div className="py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <div className="text-[9.5px] font-mono font-bold text-slate-400 px-2.5 py-0.5 uppercase tracking-wider flex items-center justify-between">
                      <span>Navigation Layout</span>
                      <span className="text-[9px] text-brand font-mono font-bold">{navLayout === 'topbar' ? 'Top Bar' : 'Sidebar'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-1.5 px-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSetNavLayout) onSetNavLayout('sidebar');
                          else if (navLayout !== 'sidebar') onToggleNavLayout();
                        }}
                        className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                          navLayout === 'sidebar'
                            ? 'bg-brand/10 border-brand/40 text-brand dark:text-red-400 font-bold shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <PanelLeft className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] truncate flex-1">Sidebar</span>
                        {navLayout === 'sidebar' && <Check className="w-3 h-3 text-brand shrink-0" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSetNavLayout) onSetNavLayout('topbar');
                          else if (navLayout !== 'topbar') onToggleNavLayout();
                        }}
                        className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                          navLayout === 'topbar'
                            ? 'bg-brand/10 border-brand/40 text-brand dark:text-red-400 font-bold shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <PanelTop className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] truncate flex-1">Top Bar</span>
                        {navLayout === 'topbar' && <Check className="w-3 h-3 text-brand shrink-0" />}
                      </button>
                    </div>
                  </div>

                  {/* Admin Tools Section (Mentors & Captains) */}
                  {isUserAdminOrMentor && (
                    <div className="py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <div className="text-[9.5px] font-mono font-bold text-slate-400 px-2.5 py-0.5 uppercase tracking-wider">
                        Admin Tools
                      </div>
                      <div className="space-y-0.5 mt-1">
                        <label className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                          <input type="file" accept=".json" onChange={(e) => { onImportJSON(e); setIsUserMenuOpen(false); }} className="hidden" />
                          <Upload className="w-4 h-4 text-slate-400" />
                          <span>Import Backup (JSON)</span>
                        </label>

                        <button
                          onClick={() => {
                            onExportJSON();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-slate-400" />
                          <span>Export Database</span>
                        </button>

                        {!showHardWipeConfirm ? (
                          <button
                            onClick={() => setShowHardWipeConfirm(true)}
                            className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                            <span>Database Hard Wipe...</span>
                          </button>
                        ) : (
                          <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/50 mt-1">
                            <p className="text-[10px] text-rose-700 dark:text-rose-300 font-bold mb-1.5">
                              Permanently clear cloud data?
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  onClearAllData();
                                  setShowHardWipeConfirm(false);
                                  setIsUserMenuOpen(false);
                                }}
                                className="flex-1 px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded hover:bg-rose-700 transition-colors cursor-pointer"
                              >
                                Yes, Wipe
                              </button>
                              <button
                                onClick={() => setShowHardWipeConfirm(false)}
                                className="flex-1 px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold rounded hover:bg-slate-300 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sign Out Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

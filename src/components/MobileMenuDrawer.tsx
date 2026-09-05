import React from 'react';
import { 
  X, 
  Package, 
  Heart, 
  BookOpen, 
  DollarSign, 
  ShieldCheck, 
  Terminal, 
  HelpCircle, 
  Sun, 
  Moon, 
  Settings, 
  LogOut, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Sparkles,
  Trophy,
  ChevronRight,
  Clock,
  Layers,
  Grid,
  Award
} from 'lucide-react';
import { UserAccount } from '../types';
import { DeviceInfo } from '../utils/useDevice';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  userGamification: any;
  currentView: string;
  onSelectView: (view: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  isUserAdminOrMentor: boolean;
  device: DeviceInfo;
  pendingApprovalsCount?: number;
}

export function MobileMenuDrawer({
  isOpen,
  onClose,
  currentUser,
  userGamification,
  currentView,
  onSelectView,
  isDark,
  onToggleTheme,
  onOpenSettings,
  onLogout,
  isUserAdminOrMentor,
  device,
  pendingApprovalsCount = 0
}: MobileMenuDrawerProps) {
  if (!isOpen) return null;

  const allNavigationLinks = [
    {
      id: 'landing',
      label: 'Hub & Standings',
      sublabel: 'Team dashboard & arena',
      icon: Grid,
      color: 'text-indigo-400'
    },
    {
      id: 'journal',
      label: 'Team Journal',
      sublabel: 'Engineering log entries',
      icon: BookOpen,
      color: 'text-cyan-400'
    },
    {
      id: 'time_entry',
      label: 'Attendance & Time Card',
      sublabel: 'Workshop clock-in desk',
      icon: Clock,
      color: 'text-emerald-400'
    },
    {
      id: 'kanban',
      label: 'Sprint Tasks Board',
      sublabel: 'Robotics kanban matrix',
      icon: Layers,
      color: 'text-purple-400'
    },
    {
      id: 'inventory',
      label: 'Inventory & QR Labels',
      sublabel: 'Lab parts & bin maker',
      icon: Package,
      color: 'text-emerald-400'
    },
    {
      id: 'outreach',
      label: 'Community Outreach',
      sublabel: 'Events & STEM service',
      icon: Heart,
      color: 'text-pink-400'
    },
    {
      id: 'handbook',
      label: 'Student Handbook',
      sublabel: 'Rules, safety & guides',
      icon: BookOpen,
      color: 'text-amber-400'
    },
    {
      id: 'finance',
      label: 'General Ledger',
      sublabel: 'Team financial records',
      icon: DollarSign,
      color: 'text-teal-400'
    },
    {
      id: 'grants',
      label: 'Grant Tracker',
      sublabel: 'Funding & sponsorships',
      icon: Award,
      color: 'text-amber-400'
    }
  ];

  if (isUserAdminOrMentor) {
    allNavigationLinks.push({
      id: 'approvals',
      label: 'Roster & Approvals',
      sublabel: 'Accounts & database',
      icon: ShieldCheck,
      color: 'text-red-400'
    });
    allNavigationLinks.push({
      id: 'system_dashboard',
      label: 'Software Terminal',
      sublabel: 'System management',
      icon: Terminal,
      color: 'text-cyan-400'
    });
  }

  const handleNavigate = (viewId: string) => {
    onSelectView(viewId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-xs no-print md:hidden animate-fade-in" id="mobile-menu-drawer-backdrop">
      <div 
        className="w-full max-w-sm bg-slate-900 border-l border-slate-800 text-white h-full flex flex-col shadow-2xl overflow-hidden animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-black tracking-widest text-slate-200 uppercase">
              RoboRaiders Mobile Menu
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border-none"
            aria-label="Close Mobile Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE DRAWER BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {/* USER PROFILE CARD */}
          {currentUser && (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex items-center gap-3 relative overflow-hidden shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '👤'}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-extrabold text-white truncate leading-tight">
                  {currentUser.name}
                </h4>
                <span className="text-[10px] font-mono text-indigo-300 font-bold block mt-0.5 uppercase tracking-wide truncate">
                  {currentUser.role === 'mentor' ? 'Coach / Mentor' : currentUser.role === 'captain' ? 'Captain' : 'Team Member'}
                </span>
                {userGamification && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                      LVL {userGamification.stats.level}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {userGamification.stats.xp} XP
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DEVICE TYPE OPTIMIZATION BADGE & SELECTOR */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Device UI Density</span>
              </span>
              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                {device.effectiveType} {device.deviceMode !== 'auto' ? '(Manual)' : '(Detected)'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 pt-1 font-mono text-[10px]">
              {(['auto', 'mobile', 'tablet', 'desktop'] as const).map((mode) => {
                const isSelected = device.deviceMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => device.setDeviceMode(mode)}
                    className={`py-1 px-1.5 rounded font-bold text-center uppercase tracking-tight transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-600 text-white shadow-xs font-black'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          {/* NAVIGATION LINKS GRID */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block px-1 mb-2">
              Workspace Views
            </span>

            {allNavigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;

              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavigate(link.id)}
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition-all cursor-pointer border text-left ${
                    isActive
                      ? 'bg-brand text-white border-brand shadow-md font-bold'
                      : 'bg-slate-850/60 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/10 text-white' : 'bg-slate-800 text-slate-300'}`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : link.color}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold tracking-wide uppercase leading-tight">
                        {link.label}
                      </div>
                      <div className={`text-[10px] font-mono truncate mt-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {link.sublabel}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                </button>
              );
            })}
          </div>

          {/* SYSTEM QUICK ACTIONS */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block px-1">
              System Controls
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 flex items-center justify-center gap-2 text-xs font-bold text-slate-200 cursor-pointer transition-colors"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-yellow-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              {/* Help Guide */}
              <button
                type="button"
                onClick={() => handleNavigate('help_guide')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 flex items-center justify-center gap-2 text-xs font-bold text-slate-200 cursor-pointer transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Help Manual</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Settings */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 flex items-center justify-center gap-2 text-xs font-bold text-slate-200 cursor-pointer transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>

              {/* Sign out */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="p-2.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/50 flex items-center justify-center gap-2 text-xs font-bold text-rose-300 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

        </div>

        {/* DRAWER FOOTER */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-center font-mono text-[9px] text-slate-500 uppercase tracking-widest shrink-0">
          RoboRaiders FTC #6567 • Mobile Ready
        </div>
      </div>
    </div>
  );
}

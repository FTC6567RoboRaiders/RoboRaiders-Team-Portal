import React from 'react';
import { 
  Grid, 
  BookOpen, 
  Clock, 
  Layers, 
  Menu,
  CheckCircle2
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: string;
  onSelectView: (view: string) => void;
  onOpenMenu: () => void;
  isMenuOpen: boolean;
  activeSession: boolean;
  pendingReviewsCount: number;
  unassignedTasksCount?: number;
}

export function MobileBottomNav({
  currentView,
  onSelectView,
  onOpenMenu,
  isMenuOpen,
  activeSession,
  pendingReviewsCount,
  unassignedTasksCount = 0
}: MobileBottomNavProps) {
  const navItems = [
    {
      id: 'landing',
      label: 'Hub',
      icon: Grid,
      badge: null,
      color: 'text-indigo-400'
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: BookOpen,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : null,
      badgeColor: 'bg-amber-500',
      color: 'text-cyan-400'
    },
    {
      id: 'time_entry',
      label: 'Time Card',
      icon: Clock,
      badge: activeSession ? 'ON' : null,
      badgeColor: 'bg-emerald-500 animate-pulse',
      color: 'text-emerald-400'
    },
    {
      id: 'kanban',
      label: 'Tasks',
      icon: Layers,
      badge: null,
      color: 'text-purple-400'
    }
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-300 md:hidden select-none pb-[env(safe-area-inset-bottom,0px)] shadow-2xl no-print"
      id="mobile-bottom-navigation"
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id && !isMenuOpen;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full relative py-1 px-1 transition-all duration-150 cursor-pointer outline-none ${
                isActive 
                  ? 'text-white' 
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              {/* Active bar indicator */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand rounded-b-full shadow-sm shadow-brand" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110 text-white' : ''}`} />
                {item.badge !== null && (
                  <span className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-mono font-black text-white flex items-center justify-center leading-none shadow-sm ${item.badgeColor || 'bg-brand'}`}>
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-sans font-bold tracking-tight mt-1 leading-none ${
                isActive ? 'text-white font-extrabold' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More / Menu Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenMenu}
          className={`flex-1 flex flex-col items-center justify-center h-full relative py-1 px-1 transition-all duration-150 cursor-pointer outline-none ${
            isMenuOpen 
              ? 'text-white' 
              : 'text-slate-400 hover:text-slate-200 active:scale-95'
          }`}
          aria-label="Open Full App Menu"
        >
          {isMenuOpen && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand rounded-b-full shadow-sm shadow-brand" />
          )}

          <div className="relative">
            <Menu className={`w-5 h-5 transition-transform duration-150 ${isMenuOpen ? 'scale-110 text-white' : ''}`} />
          </div>

          <span className={`text-[10px] font-sans font-bold tracking-tight mt-1 leading-none ${
            isMenuOpen ? 'text-white font-extrabold' : 'text-slate-400'
          }`}>
            More
          </span>
        </button>
      </div>
    </nav>
  );
}

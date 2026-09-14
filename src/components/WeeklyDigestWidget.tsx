import React, { useMemo, useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Clock, 
  ChevronRight, 
  Calendar,
  Flame,
  CheckCircle2,
  TrendingUp,
  Settings2,
  Layers,
  Boxes,
  Award,
  X,
  Check
} from 'lucide-react';
import { JournalEntry, OutreachEvent, TimeEntry, KanbanTask, InventoryItem, GrantApplication } from '../types';

export interface WeeklyDigestWidgetProps {
  entries: JournalEntry[];
  outreachEvents: OutreachEvent[];
  timeEntries: TimeEntry[];
  kanbanTasks?: KanbanTask[];
  inventoryItems?: InventoryItem[];
  grants?: GrantApplication[];
  digestSettings?: string[];
  onUpdateDigestSettings?: (newSettings: string[]) => void;
  onNavigate: (view: any) => void;
}

export const ALL_DIGEST_METRICS = [
  { id: 'journals', label: 'Journal Logs', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400' },
  { id: 'outreach', label: 'Outreach Events', icon: Users, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
  { id: 'hours', label: 'Team Hours Clocked', icon: Clock, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400' },
  { id: 'kanban', label: 'Kanban Sprint Tasks', icon: Layers, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400' },
  { id: 'inventory', label: 'Lab Parts & Inventory', icon: Boxes, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  { id: 'grants', label: 'Grant Proposals', icon: Award, color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40 dark:text-pink-400' },
];

export default function WeeklyDigestWidget({
  entries,
  outreachEvents,
  timeEntries,
  kanbanTasks = [],
  inventoryItems = [],
  grants = [],
  digestSettings = ['journals', 'outreach', 'hours', 'kanban'],
  onUpdateDigestSettings,
  onNavigate,
}: WeeklyDigestWidgetProps) {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Compute rolling 7-day cutoff (last 168 hours)
  const {
    weeklyJournalsCount,
    weeklyOutreachCount,
    totalWeeklyHours,
    weeklyKanbanCount,
    lowStockCount,
    totalGrantsCount,
    uniqueActiveMembersCount,
    dateRangeLabel,
    hasRecentActivity
  } = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgoMs = now - 7 * 24 * 60 * 60 * 1000;

    const isWithin7Days = (createdAt?: number, dateStr?: string): boolean => {
      if (createdAt && typeof createdAt === 'number' && !isNaN(createdAt) && createdAt > 0) {
        if (createdAt >= sevenDaysAgoMs) return true;
      }
      if (dateStr && typeof dateStr === 'string' && dateStr.trim()) {
        const trimmed = dateStr.trim();
        const dateToParse = trimmed.length === 10 && trimmed.includes('-')
          ? `${trimmed}T23:59:59` 
          : trimmed;
        const parsed = new Date(dateToParse).getTime();
        if (!isNaN(parsed) && parsed >= sevenDaysAgoMs) return true;
      }
      return false;
    };

    const recentJournals = entries.filter(e => isWithin7Days(e.createdAt, e.date));
    const recentOutreach = outreachEvents.filter(e => isWithin7Days(e.createdAt, e.date));
    const recentTime = timeEntries.filter(e => isWithin7Days(e.createdAt, e.date));
    const recentKanban = kanbanTasks.filter(t => isWithin7Days(t.updatedAt || t.createdAt));

    const totalHours = recentTime.reduce((sum, item) => sum + (Number(item.durationHours) || 0), 0);
    const lowStock = inventoryItems.filter(i => i.quantity <= i.minQuantity).length;

    // Count unique contributors active in the last 7 days
    const contributors = new Set<string>();
    recentJournals.forEach(j => {
      if (j.author?.trim()) contributors.add(j.author.trim().toLowerCase());
    });
    recentOutreach.forEach(o => {
      if (o.creatorName?.trim()) contributors.add(o.creatorName.trim().toLowerCase());
      if (Array.isArray(o.participants)) {
        o.participants.forEach(p => {
          if (p?.trim()) contributors.add(p.trim().toLowerCase());
        });
      }
    });
    recentTime.forEach(t => {
      if (t.userName?.trim()) contributors.add(t.userName.trim().toLowerCase());
    });

    const startDate = new Date(sevenDaysAgoMs);
    const endDate = new Date(now);
    const formatOpt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const rangeLabel = `${startDate.toLocaleDateString(undefined, formatOpt)} – ${endDate.toLocaleDateString(undefined, formatOpt)}, ${endDate.getFullYear()}`;

    const activityPresent = recentJournals.length > 0 || recentOutreach.length > 0 || recentTime.length > 0;

    return {
      weeklyJournalsCount: recentJournals.length,
      weeklyOutreachCount: recentOutreach.length,
      totalWeeklyHours: Math.round(totalHours * 10) / 10,
      weeklyKanbanCount: recentKanban.length || kanbanTasks.length,
      lowStockCount: lowStock,
      totalGrantsCount: grants.length,
      uniqueActiveMembersCount: contributors.size,
      dateRangeLabel: rangeLabel,
      hasRecentActivity: activityPresent
    };
  }, [entries, outreachEvents, timeEntries, kanbanTasks, inventoryItems, grants]);

  const toggleMetric = (id: string) => {
    if (!onUpdateDigestSettings) return;
    const next = digestSettings.includes(id)
      ? digestSettings.filter(m => m !== id)
      : [...digestSettings, id];
    // Keep at least 1 metric
    if (next.length > 0) {
      onUpdateDigestSettings(next);
    }
  };

  const enabledMetrics = ALL_DIGEST_METRICS.filter(m => digestSettings.includes(m.id));

  return (
    <div 
      id="weekly-digest-widget" 
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-800 relative"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black uppercase tracking-tight text-slate-900 font-display dark:text-slate-100">
                Weekly Digest
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Last 7 Days
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 opacity-70" />
              <span>{dateRangeLabel}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            {hasRecentActivity ? (
              <>
                <Flame className="w-4 h-4 text-amber-500" />
                <span><strong>{uniqueActiveMembersCount}</strong> active {uniqueActiveMembersCount === 1 ? 'member' : 'members'}</span>
              </>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Awaiting activity</span>
            )}
          </div>

          {onUpdateDigestSettings && (
            <button
              onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
              className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Customize Weekly Digest Metrics"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono text-[10.5px]">Customize</span>
            </button>
          )}
        </div>
      </div>

      {/* Customize Panel Dropdown */}
      {isCustomizeOpen && onUpdateDigestSettings && (
        <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-brand" />
              Customize Weekly Digest Cards
            </span>
            <button
              onClick={() => setIsCustomizeOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_DIGEST_METRICS.map(m => {
              const isChecked = digestSettings.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMetric(m.id)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-white dark:bg-slate-800 border-brand/50 text-slate-900 dark:text-white shadow-2xs'
                      : 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <m.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px] font-semibold truncate">{m.label}</span>
                  </div>
                  {isChecked && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Metrics Cards Grid */}
      <div className={`grid grid-cols-1 ${enabledMetrics.length === 1 ? 'md:grid-cols-1' : enabledMetrics.length === 2 ? 'md:grid-cols-2' : enabledMetrics.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-4 mt-4`}>
        
        {/* Metric 1: Journal Logs */}
        {digestSettings.includes('journals') && (
          <div 
            id="digest-metric-journals"
            className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between transition-all hover:bg-slate-100/60 dark:bg-slate-800/40 dark:border-slate-800/80 dark:hover:bg-slate-800/70"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Journal Logs
                </span>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900 tracking-tight dark:text-slate-100">
                  {weeklyJournalsCount}
                </span>
                <span className="text-xs font-sans text-slate-500 dark:text-slate-400">
                  {weeklyJournalsCount === 1 ? 'log recorded' : 'logs recorded'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed dark:text-slate-400">
                Engineering notebook entries logged across subteams.
              </p>
            </div>
            <button
              onClick={() => onNavigate('journal')}
              className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider transition-colors cursor-pointer group dark:text-indigo-400 dark:hover:text-indigo-300 dark:border-slate-700/60"
              id="digest-navigate-journal-btn"
            >
              <span>View Team Journal</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Metric 2: New Outreach Events */}
        {digestSettings.includes('outreach') && (
          <div 
            id="digest-metric-outreach"
            className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between transition-all hover:bg-slate-100/60 dark:bg-slate-800/40 dark:border-slate-800/80 dark:hover:bg-slate-800/70"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  New Outreach Events
                </span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900 tracking-tight dark:text-slate-100">
                  {weeklyOutreachCount}
                </span>
                <span className="text-xs font-sans text-slate-500 dark:text-slate-400">
                  {weeklyOutreachCount === 1 ? 'event logged' : 'events logged'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed dark:text-slate-400">
                Community demonstrations, STEM workshops, and FLL mentoring.
              </p>
            </div>
            <button
              onClick={() => onNavigate('outreach')}
              className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider transition-colors cursor-pointer group dark:text-emerald-400 dark:hover:text-emerald-300 dark:border-slate-700/60"
              id="digest-navigate-outreach-btn"
            >
              <span>View Outreach Hub</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Metric 3: Total Team Hours */}
        {digestSettings.includes('hours') && (
          <div 
            id="digest-metric-hours"
            className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between transition-all hover:bg-slate-100/60 dark:bg-slate-800/40 dark:border-slate-800/80 dark:hover:bg-slate-800/70"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Team Hours
                </span>
                <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900/50">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900 tracking-tight dark:text-slate-100">
                  {totalWeeklyHours.toFixed(1)}
                </span>
                <span className="text-xs font-sans text-slate-500 dark:text-slate-400">
                  hours clocked
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed dark:text-slate-400">
                Cumulative laboratory, fabrication, and software build hours.
              </p>
            </div>
            <button
              onClick={() => onNavigate('time_entry')}
              className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-cyan-600 hover:text-cyan-700 uppercase tracking-wider transition-colors cursor-pointer group dark:text-cyan-400 dark:hover:text-cyan-300 dark:border-slate-700/60"
              id="digest-navigate-time-btn"
            >
              <span>View Timesheet Ledger</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Metric 4: Kanban Sprint Tasks */}
        {digestSettings.includes('kanban') && (
          <div 
            id="digest-metric-kanban"
            className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between transition-all hover:bg-slate-100/60 dark:bg-slate-800/40 dark:border-slate-800/80 dark:hover:bg-slate-800/70"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Sprint Kanban Tasks
                </span>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900 tracking-tight dark:text-slate-100">
                  {weeklyKanbanCount}
                </span>
                <span className="text-xs font-sans text-slate-500 dark:text-slate-400">
                  active tickets
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed dark:text-slate-400">
                Active sprint tickets across backlog, build, and testing lanes.
              </p>
            </div>
            <button
              onClick={() => onNavigate('kanban')}
              className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-purple-600 hover:text-purple-700 uppercase tracking-wider transition-colors cursor-pointer group dark:text-purple-400 dark:hover:text-purple-300 dark:border-slate-700/60"
            >
              <span>View Kanban Board</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Metric 5: Lab Inventory Parts */}
        {digestSettings.includes('inventory') && (
          <div 
            id="digest-metric-inventory"
            className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between transition-all hover:bg-slate-100/60 dark:bg-slate-800/40 dark:border-slate-800/80 dark:hover:bg-slate-800/70"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Inventory Alerts
                </span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50">
                  <Boxes className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900 tracking-tight dark:text-slate-100">
                  {lowStockCount}
                </span>
                <span className="text-xs font-sans text-slate-500 dark:text-slate-400">
                  low stock items
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed dark:text-slate-400">
                Parts and hardware components below minimum reorder thresholds.
              </p>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-amber-600 hover:text-amber-700 uppercase tracking-wider transition-colors cursor-pointer group dark:text-amber-400 dark:hover:text-amber-300 dark:border-slate-700/60"
            >
              <span>View Lab Inventory</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Metric 6: Grant Proposals */}
        {digestSettings.includes('grants') && (
          <div 
            id="digest-metric-grants"
            className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between transition-all hover:bg-slate-100/60 dark:bg-slate-800/40 dark:border-slate-800/80 dark:hover:bg-slate-800/70"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Grant Proposals
                </span>
                <div className="p-2 rounded-lg bg-pink-50 text-pink-600 border border-pink-100 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-900/50">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900 tracking-tight dark:text-slate-100">
                  {totalGrantsCount}
                </span>
                <span className="text-xs font-sans text-slate-500 dark:text-slate-400">
                  proposals logged
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed dark:text-slate-400">
                Active grant applications, funding pipelines, and corporate sponsors.
              </p>
            </div>
            <button
              onClick={() => onNavigate('grants')}
              className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-pink-600 hover:text-pink-700 uppercase tracking-wider transition-colors cursor-pointer group dark:text-pink-400 dark:hover:text-pink-300 dark:border-slate-700/60"
            >
              <span>View Grant Tracker</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

      </div>

      {/* Subtle Footer Note */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-slate-500 font-mono dark:border-slate-800/80 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Calculated automatically from live team timesheets, journals, and outreach submissions.</span>
        </span>
        <span className="opacity-75">
          Rolling 7-day window
        </span>
      </div>
    </div>
  );
}

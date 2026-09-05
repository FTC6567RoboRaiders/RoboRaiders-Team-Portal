import React, { useMemo } from 'react';
import { 
  BookOpen, 
  Users, 
  Clock, 
  ChevronRight, 
  Calendar,
  Flame,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { JournalEntry, OutreachEvent, TimeEntry } from '../types';

interface WeeklyDigestWidgetProps {
  entries: JournalEntry[];
  outreachEvents: OutreachEvent[];
  timeEntries: TimeEntry[];
  onNavigate: (view: 'journal' | 'time_entry' | 'outreach') => void;
}

export default function WeeklyDigestWidget({
  entries,
  outreachEvents,
  timeEntries,
  onNavigate,
}: WeeklyDigestWidgetProps) {
  // Compute rolling 7-day cutoff (last 168 hours)
  const {
    weeklyJournalsCount,
    weeklyOutreachCount,
    totalWeeklyHours,
    uniqueActiveMembersCount,
    dateRangeLabel,
    hasRecentActivity
  } = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgoMs = now - 7 * 24 * 60 * 60 * 1000;

    const isWithin7Days = (createdAt?: number, dateStr?: string): boolean => {
      if (createdAt && typeof createdAt === 'number' && !isNaN(createdAt)) {
        if (createdAt >= sevenDaysAgoMs) return true;
      }
      if (dateStr && typeof dateStr === 'string' && dateStr.trim()) {
        const parsed = new Date(dateStr.length === 10 ? `${dateStr}T23:59:59` : dateStr).getTime();
        if (!isNaN(parsed) && parsed >= sevenDaysAgoMs) return true;
      }
      return false;
    };

    const recentJournals = entries.filter(e => isWithin7Days(e.createdAt, e.date));
    const recentOutreach = outreachEvents.filter(e => isWithin7Days(e.createdAt, e.date));
    const recentTime = timeEntries.filter(e => isWithin7Days(e.createdAt, e.date));

    const totalHours = recentTime.reduce((sum, item) => sum + (Number(item.durationHours) || 0), 0);

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
      uniqueActiveMembersCount: contributors.size,
      dateRangeLabel: rangeLabel,
      hasRecentActivity: activityPresent
    };
  }, [entries, outreachEvents, timeEntries]);

  return (
    <div 
      id="weekly-digest-widget" 
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-800"
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

        {hasRecentActivity && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 self-start sm:self-auto">
            <Flame className="w-4 h-4 text-amber-500" />
            <span><strong>{uniqueActiveMembersCount}</strong> active team {uniqueActiveMembersCount === 1 ? 'member' : 'members'}</span>
          </div>
        )}
      </div>

      {/* 3 Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        
        {/* Metric 1: Journal Logs */}
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
              Engineering notebook entries logged across all subteams.
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

        {/* Metric 2: New Outreach Events */}
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

        {/* Metric 3: Total Team Hours */}
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

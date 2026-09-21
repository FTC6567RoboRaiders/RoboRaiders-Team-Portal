import React, { useState } from 'react';
import { TimeEntry } from '../types';
import RoboraidersLogo from './RoboraidersLogo';
import { 
  Clock, 
  Users, 
  Calendar, 
  Bookmark, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  CheckCircle2,
  FileText,
  ShieldCheck
} from 'lucide-react';

export interface TimesheetPrintLayoutProps {
  timeEntries: TimeEntry[];
  paperSize?: 'letter' | 'a4' | 'legal';
  showCover?: boolean;
  showTOC?: boolean;
  scope?: string;
  subteamFilter?: string;
  isPreview?: boolean;
}

export const TimesheetPrintLayout: React.FC<TimesheetPrintLayoutProps> = ({
  timeEntries,
  paperSize = 'letter',
  showCover = true,
  showTOC = true,
  scope = 'ALL',
  subteamFilter = 'All',
  isPreview = false
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  const paperAspect = paperSize === 'letter' ? '8.5 / 11' : paperSize === 'a4' ? '210 / 297' : '8.5 / 14';

  const totalHours = timeEntries.reduce((s, e) => s + (Number(e.durationHours) || 0), 0);
  const totalSessions = timeEntries.length;

  // Unique contributing members
  const memberMap = new Map<string, {
    name: string;
    subteam: string;
    sessions: number;
    hours: number;
    latestDate: string;
    firstEntryIndex: number;
  }>();

  timeEntries.forEach((entry, idx) => {
    const key = entry.userName || entry.userEmail || 'Team Member';
    const existing = memberMap.get(key);
    if (!existing) {
      memberMap.set(key, {
        name: key,
        subteam: entry.subteam || 'General',
        sessions: 1,
        hours: Number(entry.durationHours) || 0,
        latestDate: entry.date || '',
        firstEntryIndex: idx
      });
    } else {
      existing.sessions += 1;
      existing.hours += Number(entry.durationHours) || 0;
      if (entry.date && entry.date > existing.latestDate) {
        existing.latestDate = entry.date;
      }
    }
  });

  const memberSummaries = Array.from(memberMap.values()).sort((a, b) => b.hours - a.hours);

  // Subteam breakdown
  const subteamHoursMap = new Map<string, { hours: number; sessions: number }>();
  timeEntries.forEach((entry) => {
    const sub = entry.subteam || 'General';
    const cur = subteamHoursMap.get(sub) || { hours: 0, sessions: 0 };
    cur.hours += Number(entry.durationHours) || 0;
    cur.sessions += 1;
    subteamHoursMap.set(sub, cur);
  });
  const subteamStats = Array.from(subteamHoursMap.entries()).sort((a, b) => b[1].hours - a[1].hours);

  // Pagination for detailed records (16 entries per page in clean print)
  const RECORDS_PER_PAGE = 16;
  const detailPages: TimeEntry[][] = [];
  for (let i = 0; i < timeEntries.length; i += RECORDS_PER_PAGE) {
    detailPages.push(timeEntries.slice(i, i + RECORDS_PER_PAGE));
  }
  if (detailPages.length === 0) {
    detailPages.push([]);
  }

  const coverPagesCount = showCover ? 1 : 0;
  const tocPagesCount = showTOC ? 1 : 0;
  const detailPagesCount = detailPages.length;
  const totalPages = coverPagesCount + tocPagesCount + detailPagesCount;

  const getDetailPageNumber = (pageIndex: number) => {
    return coverPagesCount + tocPagesCount + pageIndex + 1;
  };

  const dates = timeEntries.map(e => e.date).filter(Boolean).sort();
  const dateRangeStr = dates.length > 0 ? `${dates[0]} — ${dates[dates.length - 1]}` : 'Current Season';

  return (
    <div className={`timesheet-print-root ${isPreview ? 'w-full flex flex-col items-center gap-6' : 'w-full block bg-white text-slate-950'}`}>
      
      {/* PREVIEW TOOLBAR (Only shown in interactive preview modal) */}
      {isPreview && (
        <div className="w-full max-w-2xl flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 sticky top-0 bg-slate-100/95 dark:bg-slate-850/95 py-2 px-3.5 rounded-lg backdrop-blur-md shrink-0 z-20 shadow-sm text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-800 dark:text-slate-100">
                Timesheets Report PDF Preview
              </span>
              <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                {totalPages} Total Pages • {paperSize.toUpperCase()} • {totalHours.toFixed(2)} Logged Hours
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase mr-1">Zoom:</span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(0.5, +(prev - 0.1).toFixed(2)))}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs font-bold w-12 text-center text-slate-700 dark:text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(1.3, +(prev + 0.1).toFixed(2)))}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(0.85)}
              className="p-1 ml-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* DOCUMENT PAGES WRAPPER */}
      <div 
        className={`w-full ${isPreview ? 'flex flex-col items-center gap-10 transition-transform origin-top pb-16' : 'block'}`}
        style={isPreview ? { transform: `scale(${zoomLevel})`, transformOrigin: 'top center' } : undefined}
      >

        {/* 1. TITLE COVER PAGE */}
        {showCover && (
          <div className={`w-full ${isPreview ? 'max-w-xl' : 'pdf-document-page'}`}>
            {isPreview && (
              <div className="flex items-center justify-between w-full px-1 mb-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                <span>Page 1 of {totalPages}</span>
                <span className="bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded text-[9px]">TITLE COVER SHEET</span>
              </div>
            )}

            <div 
              className={`bg-white text-slate-950 p-10 sm:p-14 flex flex-col justify-between relative border-4 border-double border-slate-950 mx-auto select-text ${
                isPreview ? 'shadow-2xl rounded-xs' : 'min-h-[9.8in] w-full border-4 border-double border-slate-950'
              }`}
              style={{
                aspectRatio: isPreview ? paperAspect : undefined,
                pageBreakAfter: 'always',
                breakAfter: 'page'
              }}
            >
              {/* Header Team Crest */}
              <div className="border-b-4 border-slate-950 pb-6">
                <div className="flex items-center gap-5 mb-3">
                  <RoboraidersLogo className="w-20 h-20 text-slate-950 shrink-0" />
                  <div>
                    <span className="text-xs font-mono font-black tracking-widest text-slate-600 uppercase block mb-0.5">
                      FIRST® Tech Challenge • Team #6567
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-slate-950 uppercase leading-none">
                      RoboRaiders Timesheets Ledger
                    </h1>
                    <p className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mt-1.5 flex items-center gap-2">
                      <span>Red Hook Central High School</span>
                      <span>•</span>
                      <span>Official Service Hours Audit</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle Overview Panel */}
              <div className="my-auto py-8 border-y-2 border-slate-300 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="inline-block bg-slate-950 text-white px-4 py-1.5 text-xs font-mono uppercase tracking-widest font-black">
                    Official Service Hours Audit Dossier
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-cyan-700" />
                    <span>AUDITED &amp; VERIFIED RECORDS</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-xs font-mono text-slate-800">
                  <div className="border-l-3 border-cyan-600 pl-3.5">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Total Service Hours</span>
                    <span className="font-black text-cyan-800 text-base">{totalHours.toFixed(2)} Hours</span>
                  </div>
                  <div className="border-l-3 border-cyan-600 pl-3.5">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Total Work Sessions</span>
                    <span className="font-black text-slate-950 text-base">{totalSessions} Sessions</span>
                  </div>
                  <div className="border-l-3 border-cyan-600 pl-3.5">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Active Members</span>
                    <span className="font-bold text-slate-950 text-xs">{memberSummaries.length} Students Logged</span>
                  </div>
                  <div className="border-l-3 border-cyan-600 pl-3.5">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Scope / Discipline Filter</span>
                    <span className="font-bold text-slate-950 text-xs uppercase">{subteamFilter !== 'All' ? subteamFilter : scope}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-300 rounded text-xs font-mono text-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <span><strong>DATE RANGE:</strong> {dateRangeStr}</span>
                    <span><strong>LAB:</strong> Red Hook High School Robotics Lab</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span><strong>AUTHENTICATION:</strong> Certified student participation log for FIRST competition &amp; school accreditation</span>
                    <span><strong>GENERATED:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Cover Sign-Off Certification Block */}
              <div className="pt-4 border-t-2 border-slate-950 space-y-3">
                <div className="grid grid-cols-2 gap-6 text-[10px] font-mono text-slate-700">
                  <div className="border-b border-slate-400 pb-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Lead Student Sign-off</span>
                    <div className="h-5"></div>
                  </div>
                  <div className="border-b border-slate-400 pb-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Lead Mentor / Advisor Verification</span>
                    <div className="h-5"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-600 pt-1">
                  <span>CONFIDENTIAL AUDIT DOSSIER • FIRST® TECH CHALLENGE</span>
                  <span>GRACIOUS PROFESSIONALISM® • TEAM #6567</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TABLE OF CONTENTS & EXECUTIVE SUMMARY SHEET */}
        {showTOC && (
          <div className={`w-full ${isPreview ? 'max-w-xl' : 'pdf-document-page'}`}>
            {isPreview && (
              <div className="flex items-center justify-between w-full px-1 mb-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                <span>Page {coverPagesCount + 1} of {totalPages}</span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-[9px]">
                  TABLE OF CONTENTS &amp; SERVICE SUMMARY
                </span>
              </div>
            )}

            <div 
              className={`bg-white text-slate-950 p-8 sm:p-12 flex flex-col justify-between relative border border-slate-300 mx-auto select-text ${
                isPreview ? 'shadow-2xl rounded-xs' : 'min-h-[9.8in] w-full border border-slate-400'
              }`}
              style={{
                aspectRatio: isPreview ? paperAspect : undefined,
                pageBreakAfter: 'always',
                breakAfter: 'page'
              }}
            >
              <div>
                {/* TOC Header */}
                <div className="border-b-4 border-slate-950 pb-3 mb-4 flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Bookmark className="w-4 h-4 text-cyan-700" />
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-600">
                        FTC #6567 RoboRaiders Timesheets
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase font-display tracking-tight text-slate-950">
                      Member Summary &amp; Service Index
                    </h2>
                  </div>
                  <div className="text-right font-mono text-[10px] text-slate-600">
                    <div><strong>{totalHours.toFixed(2)}h</strong> Total Hours</div>
                    <div>Sheet {coverPagesCount + 1} of {totalPages}</div>
                  </div>
                </div>

                {/* Subteam Distribution Summary */}
                <div className="mb-4">
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider block mb-1.5">
                    Subteam Hours Distribution
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {subteamStats.slice(0, 4).map(([sub, data]) => (
                      <div key={sub} className="bg-slate-50 border border-slate-200 p-2 rounded font-mono">
                        <span className="text-[8.5px] uppercase font-bold text-slate-600 block truncate">{sub}</span>
                        <span className="text-xs font-black text-cyan-800">{data.hours.toFixed(1)} hrs</span>
                        <span className="text-[8px] text-slate-400 block">{data.sessions} sessions</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Member Summary Ledger Table */}
                <div className="border border-slate-300 rounded overflow-hidden">
                  <table className="w-full text-left text-[8.5px] border-collapse font-mono">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[8px] tracking-wider">
                        <th className="py-1.5 px-2">MEMBER NAME</th>
                        <th className="py-1.5 px-2">PRIMARY SUBTEAM</th>
                        <th className="py-1.5 px-2 text-center">SESSIONS</th>
                        <th className="py-1.5 px-2 text-right">TOTAL HOURS</th>
                        <th className="py-1.5 px-2 text-center">LATEST SESSION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {memberSummaries.slice(0, 18).map((member, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2 font-bold text-slate-950 font-sans text-[8.5px]">
                            {member.name}
                          </td>
                          <td className="py-1.5 px-2">
                            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 text-[7px] uppercase font-bold">
                              {member.subteam}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-center text-slate-700">
                            {member.sessions}
                          </td>
                          <td className="py-1.5 px-2 text-right font-bold text-cyan-800">
                            {member.hours.toFixed(2)} hrs
                          </td>
                          <td className="py-1.5 px-2 text-center text-slate-500 text-[8px]">
                            {member.latestDate || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Verification Sign-Off */}
              <div className="mt-auto pt-4 border-t-2 border-slate-950 flex justify-between items-center text-[10px] font-mono text-slate-600">
                <div>
                  <span>SUPERVISOR SIGNATURE: _______________________</span>
                </div>
                <div className="text-right font-bold">
                  <span>Page {coverPagesCount + 1} of {totalPages}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. DETAILED TIMESHEET LEDGER PAGES */}
        {detailPages.map((pageRecords, pageIdx) => {
          const thisPageNum = getDetailPageNumber(pageIdx);

          return (
            <div key={`detail-page-${pageIdx}`} className={`w-full ${isPreview ? 'max-w-xl' : 'pdf-document-page'}`}>
              {isPreview && (
                <div className="flex items-center justify-between w-full px-1 mb-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                  <span>Page {thisPageNum} of {totalPages}</span>
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[9px]">
                    TIMESHEET RECORDS (PART {pageIdx + 1} OF {detailPagesCount})
                  </span>
                </div>
              )}

              <div 
                className={`bg-white text-slate-950 p-8 sm:p-12 flex flex-col justify-between relative border border-slate-300 mx-auto select-text ${
                  isPreview ? 'shadow-2xl rounded-xs' : 'min-h-[9.8in] w-full border border-slate-400'
                }`}
                style={{
                  aspectRatio: isPreview ? paperAspect : undefined,
                  pageBreakAfter: 'always',
                  breakAfter: 'page'
                }}
              >
                <div>
                  {/* Top Running Header */}
                  <div className="border-b-3 border-slate-950 pb-2.5 flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black border border-slate-950 px-2 py-0.5 rounded bg-slate-100 uppercase tracking-wide text-slate-950">
                        HOURS LEDGER
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-cyan-50 text-cyan-900 border border-cyan-200 px-2 py-0.5 rounded uppercase">
                        SECTION: {subteamFilter !== 'All' ? subteamFilter : 'ALL SUBTEAMS'}
                      </span>
                    </div>
                    <div className="text-right text-[9.5px] font-mono text-slate-700">
                      <div><strong>RECORDS:</strong> {pageRecords.length} on sheet</div>
                      <div><strong>DATE RANGE:</strong> {dateRangeStr}</div>
                    </div>
                  </div>

                  {/* Section Title */}
                  <h2 className="text-base sm:text-lg font-black text-slate-950 mb-3 font-display uppercase tracking-tight">
                    Detailed Time Logs &amp; Activity Breakdown
                  </h2>

                  {/* Ledger Table */}
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <table className="w-full text-left text-[8.5px] border-collapse font-mono">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[8px] tracking-wider">
                          <th className="py-1.5 px-2 w-20 whitespace-nowrap">DATE</th>
                          <th className="py-1.5 px-2.5 w-32 whitespace-nowrap">MEMBER</th>
                          <th className="py-1.5 px-2 w-24 whitespace-nowrap">SUBTEAM</th>
                          <th className="py-1.5 px-1.5 text-center w-14 whitespace-nowrap">HOURS</th>
                          <th className="py-1.5 px-2.5">ACTIVITY, DELIVERABLES &amp; NOTES</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {pageRecords.map((entry, recordIdx) => (
                          <tr key={entry.id || recordIdx} className="hover:bg-slate-50 align-top">
                            <td className="py-1.5 px-2 font-mono text-slate-700 text-[8px] whitespace-nowrap">
                              {entry.date}
                            </td>
                            <td className="py-1.5 px-2.5 font-sans font-bold text-slate-950 text-[8.5px]">
                              {entry.userName || entry.userEmail || 'Member'}
                            </td>
                            <td className="py-1.5 px-2 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 text-[7px] uppercase font-bold">
                                {entry.subteam || 'General'}
                              </span>
                            </td>
                            <td className="py-1.5 px-1.5 text-center font-bold text-cyan-800 text-[8.5px] whitespace-nowrap">
                              {Number(entry.durationHours || 0).toFixed(2)}h
                            </td>
                            <td className="py-1.5 px-2.5 font-sans text-slate-800 text-[8.5px] leading-snug">
                              {entry.taskDescription || 'Engineering session participation'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Running Page Footer with Sign-Off */}
                <div className="mt-auto pt-3 border-t-2 border-slate-950 flex justify-between items-center text-[9px] font-mono text-slate-600">
                  <div>
                    <span>FIRST TECH CHALLENGE TEAM #6567 ROBORAIDERS</span>
                  </div>
                  <div>
                    <span>MENTOR SIGNATURE: _______________________</span>
                  </div>
                  <div className="text-right font-bold">
                    <span>Page {thisPageNum} of {totalPages}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimesheetPrintLayout;

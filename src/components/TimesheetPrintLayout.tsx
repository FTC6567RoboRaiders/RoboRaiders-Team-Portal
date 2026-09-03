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
  FileText
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

  // Pagination for detailed records (14 entries per page)
  const RECORDS_PER_PAGE = 14;
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
    <div className={`timesheet-print-root ${isPreview ? 'w-full flex flex-col items-center gap-6' : 'w-full'}`}>
      
      {/* PREVIEW TOOLBAR (Only shown in interactive preview modal) */}
      {isPreview && (
        <div className="w-full max-w-2xl flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 sticky top-0 bg-slate-100/95 dark:bg-slate-850/95 py-2 px-3.5 rounded-lg backdrop-blur-md shrink-0 z-20 shadow-sm text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-800 dark:text-slate-100">
                Timesheets Report Preview
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
        className={`flex flex-col items-center gap-10 w-full transition-transform origin-top ${
          isPreview ? 'pb-16' : ''
        }`}
        style={isPreview ? { transform: `scale(${zoomLevel})`, transformOrigin: 'top center' } : undefined}
      >

        {/* 1. TITLE COVER PAGE */}
        {showCover && (
          <div className="flex flex-col items-center gap-1.5 w-full max-w-xl">
            {isPreview && (
              <div className="flex items-center justify-between w-full px-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                <span>Page 1 of {totalPages}</span>
                <span className="bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded text-[9px]">TITLE COVER SHEET</span>
              </div>
            )}

            <div 
              className={`bg-white text-slate-950 p-10 sm:p-14 flex flex-col justify-between relative border-4 border-double border-slate-950 mx-auto shadow-2xl rounded-xs w-full select-text ${
                !isPreview ? 'min-h-screen break-after-page' : ''
              }`}
              style={{
                aspectRatio: paperAspect,
                pageBreakAfter: 'always',
                breakAfter: 'page'
              }}
            >
              {/* Header Team Crest */}
              <div className="border-b-8 border-slate-950 pb-6">
                <div className="flex items-center gap-4 mb-3">
                  <RoboraidersLogo className="w-16 h-16 text-slate-950 shrink-0" />
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-slate-950 uppercase leading-none">
                      FTC Team #6567 RoboRaiders
                    </h1>
                    <p className="text-xs sm:text-sm font-mono font-bold text-slate-700 uppercase tracking-widest mt-1">
                      FIRST Tech Challenge • Member Timesheets & Service Ledger
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle Overview Panel */}
              <div className="my-auto py-6 border-y-2 border-slate-300 flex flex-col gap-6">
                <div className="inline-block bg-slate-950 text-white px-4 py-1.5 text-xs font-mono uppercase tracking-widest font-black self-start">
                  Official Service Hours Audit Dossier
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs sm:text-sm font-mono text-slate-850">
                  <div className="border-l-2 border-cyan-600 pl-3">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Total Service Hours:</span>
                    <span className="font-black text-cyan-700 text-xl">{totalHours.toFixed(2)} Hours</span>
                  </div>
                  <div className="border-l-2 border-cyan-600 pl-3">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Total Work Sessions:</span>
                    <span className="font-black text-slate-950 text-xl">{totalSessions} Sessions</span>
                  </div>
                  <div className="border-l-2 border-cyan-600 pl-3">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Contributing Members:</span>
                    <span className="font-bold text-slate-950 text-base">{memberSummaries.length} Students</span>
                  </div>
                  <div className="border-l-2 border-cyan-600 pl-3">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Scope / Subteam:</span>
                    <span className="font-bold text-slate-950 uppercase">{subteamFilter !== 'All' ? subteamFilter : scope}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-700 space-y-1">
                  <p><strong>DATE RANGE:</strong> {dateRangeStr}</p>
                  <p><strong>INSTITUTION:</strong> Red Hook High School Robotics Laboratory</p>
                  <p><strong>VERIFICATION:</strong> Certified student participation log for FIRST competition & school accreditation</p>
                  <p><strong>GENERATED ON:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t-2 border-slate-950 flex justify-between items-center text-[10px] font-mono text-slate-600">
                <span>CONFIDENTIAL AUDIT DOSSIER • FIRST TECH CHALLENGE</span>
                <span>GRACIOUS PROFESSIONALISM® • TEAM #6567</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. TABLE OF CONTENTS & EXECUTIVE SUMMARY SHEET */}
        {showTOC && (
          <div className="flex flex-col items-center gap-1.5 w-full max-w-xl">
            {isPreview && (
              <div className="flex items-center justify-between w-full px-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                <span>Page {coverPagesCount + 1} of {totalPages}</span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-[9px]">
                  TABLE OF CONTENTS & SERVICE SUMMARY
                </span>
              </div>
            )}

            <div 
              className={`bg-white text-slate-950 p-8 sm:p-12 flex flex-col justify-between relative border border-slate-300 mx-auto shadow-2xl rounded-xs w-full select-text ${
                !isPreview ? 'min-h-screen break-after-page' : ''
              }`}
              style={{
                aspectRatio: paperAspect,
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
                      Table of Contents & Service Index
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

                {/* Member Roster Table of Contents */}
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider block mb-1.5">
                    Member Participation Index & Starting Record
                  </span>
                  <div className="overflow-hidden border border-slate-300 rounded">
                    <table className="w-full text-left text-[9px] sm:text-[9.5px] border-collapse font-mono">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[8px] tracking-wider">
                          <th className="py-1.5 px-2">MEMBER NAME</th>
                          <th className="py-1.5 px-1.5">PRIMARY SUBTEAM</th>
                          <th className="py-1.5 px-1.5 text-center">SESSIONS</th>
                          <th className="py-1.5 px-1.5 text-right">TOTAL HOURS</th>
                          <th className="py-1.5 px-1.5 text-right">LATEST DATE</th>
                          <th className="py-1.5 px-2 text-right w-20 whitespace-nowrap">DETAIL PAGE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {memberSummaries.slice(0, 15).map((member) => {
                          const pageChunkIdx = Math.floor(member.firstEntryIndex / RECORDS_PER_PAGE);
                          const targetPage = getDetailPageNumber(pageChunkIdx);

                          return (
                            <tr key={member.name} className="hover:bg-slate-50">
                              <td className="py-1.5 px-2 font-bold text-slate-900 text-[9.5px] whitespace-nowrap">
                                {member.name}
                              </td>
                              <td className="py-1.5 px-1.5 text-[8.5px] text-slate-700 whitespace-nowrap">
                                {member.subteam}
                              </td>
                              <td className="py-1.5 px-1.5 text-center text-[8.5px] text-slate-600 whitespace-nowrap">
                                {member.sessions}
                              </td>
                              <td className="py-1.5 px-1.5 text-right font-black text-cyan-800 text-[9px] whitespace-nowrap">
                                {member.hours.toFixed(2)}h
                              </td>
                              <td className="py-1.5 px-1.5 text-right text-[8.5px] text-slate-500 whitespace-nowrap">
                                {member.latestDate || '-'}
                              </td>
                              <td className="py-1.5 px-2 text-right font-bold text-indigo-700 text-[9.5px] whitespace-nowrap">
                                Page {targetPage}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Coach / Mentor Verification Block */}
              <div className="mt-auto pt-4 border-t-2 border-slate-950 flex justify-between items-center text-[10px] font-mono text-slate-600">
                <div>
                  <span>MENTOR / COACH SIGNATURE: _______________________</span>
                </div>
                <div>
                  <span>DATE VERIFIED: ___________</span>
                </div>
                <div className="text-right font-bold">
                  <span>Page {coverPagesCount + 1} of {totalPages}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. DETAILED TIMESHEET RECORD SHEETS */}
        {detailPages.map((chunk, pageIdx) => {
          const detailPageNum = getDetailPageNumber(pageIdx);
          const chunkHours = chunk.reduce((s, e) => s + (Number(e.durationHours) || 0), 0);

          return (
            <div key={`detail-page-${pageIdx}`} className="flex flex-col items-center gap-1.5 w-full max-w-xl">
              {isPreview && (
                <div className="flex items-center justify-between w-full px-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                  <span>Page {detailPageNum} of {totalPages}</span>
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[9px]">
                    LOG SHEET {pageIdx + 1} OF {detailPagesCount}
                  </span>
                </div>
              )}

              <div 
                className={`bg-white text-slate-950 p-8 sm:p-12 flex flex-col justify-between relative border border-slate-300 mx-auto shadow-2xl rounded-xs w-full select-text ${
                  !isPreview ? 'min-h-screen break-after-page' : ''
                }`}
                style={{
                  aspectRatio: paperAspect,
                  pageBreakAfter: 'always',
                  breakAfter: 'page'
                }}
              >
                <div>
                  {/* Top Running Header */}
                  <div className="border-b-4 border-slate-950 pb-3 flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-slate-950">
                        FTC #6567 RoboRaiders — Timesheets Ledger
                      </h3>
                      <p className="text-[10px] font-mono text-slate-500">
                        Scope: {subteamFilter !== 'All' ? subteamFilter : scope} • Sheet {pageIdx + 1} of {detailPagesCount}
                      </p>
                    </div>
                    <div className="text-right font-mono text-xs font-black text-cyan-800">
                      Page Subtotal: {chunkHours.toFixed(2)} hrs
                    </div>
                  </div>

                  {/* Detail Table */}
                  <div className="overflow-hidden border border-slate-300 rounded">
                    <table className="w-full text-left text-[11px] border-collapse font-mono">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[9px]">
                          <th className="py-2 px-2 w-20">DATE</th>
                          <th className="py-2 px-2 w-32">MEMBER</th>
                          <th className="py-2 px-2 w-24">SUBTEAM</th>
                          <th className="py-2 px-2 text-right w-16">HOURS</th>
                          <th className="py-2 px-2.5">ACTIVITY / TASK NOTES</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {chunk.map((entry, rowIdx) => (
                          <tr key={entry.id || rowIdx} className="align-top hover:bg-slate-50">
                            <td className="py-2 px-2 text-slate-700 text-[10px] whitespace-nowrap">
                              {entry.date}
                            </td>
                            <td className="py-2 px-2 font-bold text-slate-950 text-[10px]">
                              {entry.userName || entry.userEmail}
                            </td>
                            <td className="py-2 px-2 text-[9.5px]">
                              <span className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">
                                {entry.subteam}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right font-black text-cyan-800 text-[10.5px] whitespace-nowrap">
                              {(Number(entry.durationHours) || 0).toFixed(2)}h
                            </td>
                            <td className="py-2 px-2.5 font-sans text-xs text-slate-800 leading-snug">
                              {entry.taskDescription || 'Robot engineering session'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Running Page Footer */}
                <div className="mt-8 pt-4 border-t-2 border-slate-950 flex justify-between items-center text-[9px] font-mono text-slate-600">
                  <span>FIRST TECH CHALLENGE TEAM #6567 ROBORAIDERS</span>
                  <span className="font-bold">TOTAL CUMULATIVE HOURS: {totalHours.toFixed(2)}h</span>
                  <span className="font-bold text-slate-950">Page {detailPageNum} of {totalPages}</span>
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

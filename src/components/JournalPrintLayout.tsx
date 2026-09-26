import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { getEntryReferenceCode } from '../utils/referenceCode';
import RoboraidersLogo from './RoboraidersLogo';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText,
  Bookmark,
  Users,
  CheckSquare,
  Coins,
  ListOrdered,
  Image as ImageIcon,
  ShieldCheck,
  Award
} from 'lucide-react';

export interface JournalPrintLayoutProps {
  entries: JournalEntry[];
  allEntries?: JournalEntry[];
  paperSize?: 'letter' | 'a4' | 'legal';
  showCover?: boolean;
  showTOC?: boolean;
  scope?: string;
  isPreview?: boolean;
  isBinderEvidence?: boolean;
}

export const JournalPrintLayout: React.FC<JournalPrintLayoutProps> = ({
  entries,
  allEntries = [],
  paperSize = 'letter',
  showCover,
  showTOC,
  scope = 'ALL',
  isPreview = false,
  isBinderEvidence = true
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  // By default, only show cover and TOC if printing a multi-entry batch (not an individual binder log)
  const effectiveShowCover = showCover !== undefined ? showCover : entries.length > 1;
  const effectiveShowTOC = showTOC !== undefined ? showTOC : entries.length > 1;

  const paperAspect = paperSize === 'letter' ? '8.5 / 11' : paperSize === 'a4' ? '210 / 297' : '8.5 / 14';

  // Calculate TOC pagination (up to 16 entries per TOC sheet)
  const ENTRIES_PER_TOC_PAGE = 16;
  const tocPagesCount = effectiveShowTOC ? Math.max(1, Math.ceil(entries.length / ENTRIES_PER_TOC_PAGE)) : 0;
  const coverPagesCount = effectiveShowCover ? 1 : 0;
  const totalPages = coverPagesCount + tocPagesCount + entries.length;

  const getEntryPageNumber = (entryIndex: number) => {
    return coverPagesCount + tocPagesCount + entryIndex + 1;
  };

  // Compile quick statistics
  const subteamsPresent = Array.from(new Set(entries.map(e => e.subteam).filter(Boolean)));
  const approvedCount = entries.filter(e => e.status === 'Approved').length;
  const pendingCount = entries.filter(e => e.status === 'Pending Review').length;
  const dates = entries.map(e => e.date).filter(Boolean).sort();
  const dateRangeStr = dates.length > 0 ? `${dates[0]} — ${dates[dates.length - 1]}` : 'Current Season';

  // Chunk entries for TOC pages
  const tocPages: JournalEntry[][] = [];
  if (effectiveShowTOC) {
    for (let i = 0; i < entries.length; i += ENTRIES_PER_TOC_PAGE) {
      tocPages.push(entries.slice(i, i + ENTRIES_PER_TOC_PAGE));
    }
    if (tocPages.length === 0) {
      tocPages.push([]);
    }
  }

  return (
    <div className={`journal-print-root ${isPreview ? 'w-full flex flex-col items-center gap-6' : 'w-full block bg-white text-slate-950'}`}>
      
      {/* PREVIEW TOOLBAR (Only shown in interactive preview modal) */}
      {isPreview && (
        <div className="w-full max-w-2xl flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 sticky top-0 bg-slate-100/95 dark:bg-slate-850/95 py-2 px-3.5 rounded-lg backdrop-blur-md shrink-0 z-20 shadow-sm text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-800 dark:text-slate-100">
                Engineering Notebook PDF Preview
              </span>
              <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                {totalPages} Total Pages • {paperSize.toUpperCase()} ({paperSize === 'letter' ? '8.5" × 11"' : paperSize === 'a4' ? '210 × 297 mm' : '8.5" × 14"'})
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
        {effectiveShowCover && (
          <div className={`w-full ${isPreview ? 'max-w-xl' : 'pdf-document-page'}`}>
            {isPreview && (
              <div className="flex items-center justify-between w-full px-1 mb-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                <span>Page 1 of {totalPages}</span>
                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-[9px]">TITLE COVER SHEET</span>
              </div>
            )}
            
            <div 
              className={`bg-white text-slate-950 p-10 sm:p-14 flex flex-col justify-between relative border-4 border-double border-slate-950 mx-auto select-text pdf-avoid-break ${
                isPreview ? 'shadow-2xl rounded-xs' : 'min-h-[9.8in] w-full border-4 border-double border-slate-950'
              }`}
              style={{
                aspectRatio: isPreview ? paperAspect : undefined,
                pageBreakAfter: 'always',
                breakAfter: 'page',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
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
                      RoboRaiders Engineering Notebook
                    </h1>
                    <p className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mt-1.5 flex items-center gap-2">
                      <span>Red Hook Central High School</span>
                      <span>•</span>
                      <span>Official Judged Dossier</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle Overview Panel */}
              <div className="my-auto py-8 border-y-2 border-slate-300 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="inline-block bg-slate-950 text-white px-4 py-1.5 text-xs font-mono uppercase tracking-widest font-black">
                    Official Competition Technical Record
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>VERIFIED FIRST® FTC COMPLIANT</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-xs font-mono text-slate-800">
                  <div className="border-l-3 border-indigo-600 pl-3.5">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Documentation Scope</span>
                    <span className="font-black text-slate-950 text-sm uppercase">{scope}</span>
                  </div>
                  <div className="border-l-3 border-indigo-600 pl-3.5">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Total Session Entries</span>
                    <span className="font-black text-slate-950 text-sm">{entries.length} Logged Sessions</span>
                  </div>
                  <div className="border-l-3 border-indigo-600 pl-3.5">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Date Range Covered</span>
                    <span className="font-bold text-slate-950 text-xs">{dateRangeStr}</span>
                  </div>
                  <div className="border-l-3 border-indigo-600 pl-3.5">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Subteams Represented</span>
                    <span className="font-bold text-slate-950 text-xs">{subteamsPresent.join(', ') || 'All Engineering Disciplines'}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-300 rounded text-xs font-mono text-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <span><strong>ORGANIZATION:</strong> Red Hook High School Robotics Club</span>
                    <span><strong>SEASON:</strong> Current FTC Championship</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span><strong>REVIEW SUMMARY:</strong> {approvedCount} Approved Logs • {pendingCount} Under Review</span>
                    <span><strong>COMPILED:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Cover Sign-Off Certification Block */}
              <div className="pt-4 border-t-2 border-slate-950 space-y-3">
                <div className="grid grid-cols-2 gap-6 text-[10px] font-mono text-slate-700">
                  <div className="border-b border-slate-400 pb-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Lead Student Engineer Signature</span>
                    <div className="h-5"></div>
                  </div>
                  <div className="border-b border-slate-400 pb-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Head Mentor / Coach Certification</span>
                    <div className="h-5"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-600 pt-1">
                  <span>CONFIDENTIAL ENGINEERING MATERIAL • FIRST® TECH CHALLENGE</span>
                  <span>GRACIOUS PROFESSIONALISM® • TEAM #6567</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TABLE OF CONTENTS SHEET(S) */}
        {showTOC && tocPages.map((tocChunk, tocIdx) => {
          const thisTOCPageNum = coverPagesCount + tocIdx + 1;
          const isFirstTOCPage = tocIdx === 0;

          return (
            <div key={`toc-page-${tocIdx}`} className={`w-full ${isPreview ? 'max-w-xl' : 'pdf-document-page'}`}>
              {isPreview && (
                <div className="flex items-center justify-between w-full px-1 mb-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                  <span>Page {thisTOCPageNum} of {totalPages}</span>
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-[9px]">
                    TABLE OF CONTENTS {tocPagesCount > 1 ? `(PART ${tocIdx + 1} OF ${tocPagesCount})` : ''}
                  </span>
                </div>
              )}

              <div 
                className={`bg-white text-slate-950 p-8 sm:p-12 flex flex-col justify-between relative border border-slate-300 mx-auto select-text pdf-avoid-break ${
                  isPreview ? 'shadow-2xl rounded-xs' : 'min-h-[9.8in] w-full border border-slate-400'
                }`}
                style={{
                  aspectRatio: isPreview ? paperAspect : undefined,
                  pageBreakAfter: 'always',
                  breakAfter: 'page',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
              >
                <div>
                  {/* TOC Header */}
                  <div className="border-b-4 border-slate-950 pb-3 mb-4 flex justify-between items-end">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Bookmark className="w-4 h-4 text-indigo-700" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-600">
                          FTC #6567 Engineering Notebook
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black uppercase font-display tracking-tight text-slate-950">
                        Table of Contents &amp; Session Index
                      </h2>
                    </div>
                    <div className="text-right font-mono text-[10px] text-slate-600">
                      <div><strong>{entries.length}</strong> Total Entries</div>
                      <div>Sheet {thisTOCPageNum} of {totalPages}</div>
                    </div>
                  </div>

                  {/* Summary Metric Ribbon (Only on 1st TOC page) */}
                  {isFirstTOCPage && (
                    <div className="grid grid-cols-3 gap-2 mb-4 p-2.5 bg-slate-50 border border-slate-200 rounded font-mono text-center text-[10px]">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Total Logs</span>
                        <span className="font-black text-slate-950 text-xs">{entries.length} Sessions</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Verified Status</span>
                        <span className="font-black text-emerald-700 text-xs">{approvedCount} Approved</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Subteams</span>
                        <span className="font-black text-indigo-700 text-xs">{subteamsPresent.length} Teams</span>
                      </div>
                    </div>
                  )}

                  {/* TOC Table */}
                  <div className="overflow-hidden border border-slate-300 rounded">
                    <table className="w-full text-left text-[8.5px] border-collapse font-mono">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[8px] tracking-wider">
                          <th className="py-1.5 px-2 w-[100px] whitespace-nowrap">REF CODE</th>
                          <th className="py-1.5 px-2 w-20 whitespace-nowrap">DATE</th>
                          <th className="py-1.5 px-2 w-24 whitespace-nowrap">SUBTEAM</th>
                          <th className="py-1.5 px-2.5">SESSION TITLE &amp; OBJECTIVES</th>
                          <th className="py-1.5 px-2 text-center w-20 whitespace-nowrap">STATUS</th>
                          <th className="py-1.5 px-2 text-right w-12 whitespace-nowrap">PAGE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {tocChunk.map((entry, chunkSubIdx) => {
                          const globalIdx = tocIdx * ENTRIES_PER_TOC_PAGE + chunkSubIdx;
                          const targetPage = getEntryPageNumber(globalIdx);
                          const refCode = getEntryReferenceCode(entry, allEntries.length > 0 ? allEntries : entries);

                          return (
                            <tr key={entry.id || globalIdx} className="align-middle hover:bg-slate-50">
                              <td className="py-1.5 px-2 font-mono font-bold text-slate-950 text-[8px] whitespace-nowrap tracking-tight">
                                {refCode}
                              </td>
                              <td className="py-1.5 px-2 text-slate-700 text-[8px] whitespace-nowrap font-mono">
                                {entry.date}
                              </td>
                              <td className="py-1.5 px-2 whitespace-nowrap">
                                <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800 font-semibold uppercase text-[7px] tracking-tight">
                                  {entry.subteam}
                                </span>
                              </td>
                              <td className="py-1.5 px-2.5 font-sans">
                                <div className="font-bold text-slate-900 text-[8.5px] leading-tight line-clamp-1">
                                  {entry.title || (entry.entryType === 'general_meeting' ? 'General Team Meeting' : 'Engineering Session Log')}
                                </div>
                                <div className="text-[7.5px] text-slate-500 line-clamp-1 font-mono">
                                  {entry.planned || entry.accomplished || 'Session documentation'}
                                </div>
                              </td>
                              <td className="py-1.5 px-2 text-center whitespace-nowrap">
                                <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[7px] tracking-tight ${
                                  entry.status === 'Approved' 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                    : entry.status === 'Pending Review'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                                }`}>
                                  {entry.status}
                                </span>
                              </td>
                              <td className="py-1.5 px-2 text-right font-bold text-indigo-700 font-mono text-[8.5px] whitespace-nowrap">
                                {targetPage}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Verification Sign-Off block */}
                <div className="mt-auto pt-4 border-t-2 border-slate-950 flex justify-between items-center text-[10px] font-mono text-slate-600">
                  <div>
                    <span>LEAD ENGINEER: _______________________</span>
                  </div>
                  <div>
                    <span>MENTOR SIGNATURE: _______________________</span>
                  </div>
                  <div className="text-right font-bold">
                    <span>Page {thisTOCPageNum} of {totalPages}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 3. INDIVIDUAL JOURNAL ENTRY PAGES */}
        {entries.map((entry, idx) => {
          const entryPageNum = getEntryPageNumber(idx);
          const refCode = getEntryReferenceCode(entry, allEntries.length > 0 ? allEntries : entries);
          const isLastEntry = idx === entries.length - 1;

          return (
            <div key={entry.id || idx} className={`w-full ${isPreview ? 'max-w-xl' : 'pdf-document-page binder-evidence-sheet'}`}>
              {isPreview && (
                <div className="flex items-center justify-between w-full px-1 mb-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                  <span>Page {entryPageNum} of {totalPages}</span>
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[9px]">
                    ENTRY {idx + 1} • {refCode}
                  </span>
                </div>
              )}

              {/* Binder 3-Ring Punch Hole Guides (Printed cleanly in 0.55in left margin) */}
              <div className="binder-hole-guide print-only" aria-hidden="true">
                <div className="binder-hole-dot top" title="3-Ring Punch Hole (Top)" />
                <div className="binder-hole-dot middle" title="3-Ring Punch Hole (Center)" />
                <div className="binder-hole-dot bottom" title="3-Ring Punch Hole (Bottom)" />
              </div>

              <div 
                className={`bg-white text-slate-950 p-6 sm:p-8 flex flex-col justify-between relative border border-slate-300 mx-auto select-text pdf-entry-sheet binder-entry-card ${
                  isPreview ? 'shadow-2xl rounded-xs' : 'w-full'
                }`}
                style={{
                  aspectRatio: isPreview ? paperAspect : undefined,
                  pageBreakAfter: isLastEntry ? 'auto' : 'always',
                  breakAfter: isLastEntry ? 'auto' : 'page',
                  pageBreakInside: 'auto',
                  breakInside: 'auto'
                }}
              >
                <div>
                  {/* Top Running Header */}
                  <div className="pdf-header-plate border-b-2 border-slate-950 pb-2 flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <RoboraidersLogo className="w-6 h-6 text-slate-950 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9.5px] font-mono font-black border border-slate-950 px-2 py-0.5 rounded bg-slate-100 uppercase tracking-wide text-slate-950">
                            {entry.subteam}
                          </span>
                          <span className="text-[9.5px] font-mono font-bold bg-indigo-50 text-indigo-950 border border-indigo-200 px-2 py-0.5 rounded uppercase whitespace-nowrap">
                            REF: {refCode}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[8.5px] font-mono text-slate-700 space-y-0.5">
                      <div className="text-[8px] font-bold uppercase text-slate-500 tracking-wider">FTC Team #6567 • Engineering Notebook Binder Evidence</div>
                      <div><strong>DATE:</strong> <span className="text-slate-950 font-bold">{entry.date}</span> • <strong>AUTHOR:</strong> <span className="text-slate-950 font-semibold">{entry.author}</span></div>
                    </div>
                  </div>

                  {/* Main Entry Title */}
                  <h2 className="pdf-header-plate text-base sm:text-lg font-black text-slate-950 mb-3 font-display uppercase tracking-tight leading-snug border-b border-slate-200 pb-1.5">
                    {entry.title || (entry.entryType === 'general_meeting' ? 'General Team Meeting Record' : 'Engineering Session Log')}
                  </h2>

                  {/* General Meeting Specific vs Subteam Body */}
                  {entry.entryType === 'general_meeting' ? (
                    <div className="space-y-4 text-xs font-sans leading-relaxed text-slate-800">
                      {/* 1. Agenda */}
                      <div className="pdf-section-card">
                        <div className="flex items-center gap-1.5 mb-1">
                          <ListOrdered className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                            1. Meeting Agenda &amp; Discussion Topics
                          </h3>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded whitespace-pre-wrap font-sans text-slate-900 text-xs">
                          {entry.agenda || entry.planned || 'No agenda recorded.'}
                        </div>
                      </div>

                      {/* 2. Attendance Area */}
                      <div className="pdf-section-card">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                            2. Attendance Roster ({(entry.attendees || []).length} Present)
                          </h3>
                        </div>
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex flex-wrap gap-1.5">
                          {(entry.attendees || []).length > 0 ? (
                            entry.attendees?.map((name, i) => (
                              <span key={i} className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[9px] font-bold">
                                ✓ {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">No attendees recorded</span>
                          )}
                          {entry.absentAttendees && entry.absentAttendees.length > 0 && (
                            entry.absentAttendees.map((name, i) => (
                              <span key={i} className="bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 rounded text-[9px] line-through">
                                ✗ {name} (Excused)
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      {/* 3. ABCs (Accomplishments, Blockers, Commitments) */}
                      <div className="pdf-section-card">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                            3. Member ABCs (Accomplishments • Blockers • Commitments)
                          </h3>
                        </div>
                        {entry.abcs && entry.abcs.length > 0 ? (
                          <div className="space-y-2">
                            {entry.abcs.map((item, idx) => (
                              <div key={idx} className="pdf-avoid-break p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                                  <span className="font-bold text-slate-900 text-[10px]">{item.name}</span>
                                  {item.subteam && (
                                    <span className="text-[8px] font-mono font-bold uppercase bg-white border border-slate-300 px-1.5 py-0.2 rounded text-slate-700">
                                      {item.subteam}
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[9px]">
                                  <div>
                                    <strong className="text-emerald-700 block uppercase font-mono text-[8px]">A: Accomplishments</strong>
                                    <span className="text-slate-800">{item.accomplishments || '—'}</span>
                                  </div>
                                  <div>
                                    <strong className="text-rose-700 block uppercase font-mono text-[8px]">B: Blockers</strong>
                                    <span className="text-slate-800">{item.blockers || 'None'}</span>
                                  </div>
                                  <div>
                                    <strong className="text-indigo-700 block uppercase font-mono text-[8px]">C: Commitments</strong>
                                    <span className="text-slate-800">{item.commitments || '—'}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-400 italic text-[10px]">
                            {entry.accomplished || 'No individual ABCs recorded.'}
                          </div>
                        )}
                      </div>

                      {/* 4. Finance Announced */}
                      {entry.financeAnnounced && (
                        <div className="pdf-section-card">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                              4. Finance Announced
                            </h3>
                          </div>
                          <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded font-mono text-[9px] whitespace-pre-wrap text-amber-950">
                            {entry.financeAnnounced}
                          </div>
                        </div>
                      )}

                      {/* 5. Final To-Do List */}
                      {entry.finalTodoList && entry.finalTodoList.length > 0 && (
                        <div className="pdf-section-card">
                          <div className="flex items-center gap-1.5 mb-1">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                              5. Final To-Do List &amp; Action Items
                            </h3>
                          </div>
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1">
                            {entry.finalTodoList.map((todo, idx) => (
                              <div key={idx} className="pdf-avoid-break flex items-center justify-between text-[9px] py-0.5 border-b border-slate-200/60 last:border-0">
                                <span className={`flex items-center gap-1.5 ${todo.completed ? 'line-through text-slate-400' : 'text-slate-900 font-medium'}`}>
                                  <span>{todo.completed ? '☑' : '☐'}</span>
                                  <span>{todo.task}</span>
                                </span>
                                <span className="font-mono text-[8px] text-slate-500">
                                  {todo.assignee ? `[${todo.assignee}]` : ''} {todo.dueDate ? `Due: ${todo.dueDate}` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Standard Subteam Structured Body Sections */
                    <div className="space-y-4 text-xs font-sans leading-relaxed text-slate-800">
                      
                      {/* 1. Objectives & Goals Planned */}
                      <div className="pdf-section-card">
                        <div className="flex items-center gap-1.5 mb-1">
                          <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                            1. Objectives &amp; Goals Planned
                          </h3>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded whitespace-pre-wrap font-sans text-slate-900 text-xs">
                          {entry.planned || 'No planned goals specified.'}
                        </div>
                      </div>

                      {/* 2. Work Accomplished & Implementation */}
                      <div className="pdf-section-card">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                            2. Work Accomplished &amp; Technical Implementation
                          </h3>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded whitespace-pre-wrap font-sans text-slate-900 text-xs">
                          {entry.accomplished || 'No work accomplished recorded.'}
                        </div>
                      </div>

                      {/* 3. Problems Encountered & Solutions */}
                      {entry.problemsAndSolutions && (
                        <div className="pdf-section-card">
                          <div className="flex items-center gap-1.5 mb-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                              3. Problems Encountered, Root Cause &amp; Solutions
                            </h3>
                          </div>
                          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded whitespace-pre-wrap font-sans text-slate-900 text-xs">
                            {entry.problemsAndSolutions}
                          </div>
                        </div>
                      )}

                      {/* 4. Engineering Challenges & Troubleshooting */}
                      {entry.challenges && !entry.problemsAndSolutions && (
                        <div className="pdf-section-card">
                          <div className="flex items-center gap-1.5 mb-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                              3. Engineering Challenges &amp; Troubleshooting
                            </h3>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded whitespace-pre-wrap font-sans text-slate-900 text-xs">
                            {entry.challenges}
                          </div>
                        </div>
                      )}

                      {/* 5. Next Steps & Future Action Items */}
                      {(entry.nextSteps || entry.planNextTime) && (
                        <div className="pdf-section-card">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                              {entry.problemsAndSolutions || entry.challenges ? '4.' : '3.'} Next Steps &amp; Future Action Items
                            </h3>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded whitespace-pre-wrap font-sans text-slate-900 text-xs">
                            {entry.planNextTime || entry.nextSteps}
                          </div>
                        </div>
                      )}

                      {/* 6. Embedded Photographic Documentation & CAD Renders */}
                      {entry.images && entry.images.length > 0 && (
                        <div className="pdf-section-card pdf-photo-block">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                              Visual Evidence, Schematics &amp; Photo Documentation ({entry.images.length})
                            </h3>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            {entry.images.map((img, imgIdx) => (
                              <div key={imgIdx} className="pdf-avoid-break border border-slate-300 rounded p-1.5 bg-slate-50 flex flex-col items-center">
                                <img 
                                  src={img.dataUrl} 
                                  alt={img.name || `Figure ${imgIdx + 1}`} 
                                  className="max-h-32 object-contain rounded border border-slate-200 bg-white"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="text-[8.5px] font-mono text-slate-700 mt-1 truncate max-w-full text-center font-medium">
                                  Fig {imgIdx + 1}: {img.name || 'Engineering capture'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Running Page Footer with Official Sign-Off Block */}
                <div className="pdf-signoff-block mt-4 pt-2.5 border-t-2 border-slate-950 space-y-1.5">
                  <div className="grid grid-cols-2 gap-4 text-[9px] font-mono text-slate-800">
                    <div className="border-b border-slate-900 pb-1">
                      <span className="text-[7.5px] uppercase font-bold text-slate-600 block">Lead Student Engineer Sign-off:</span>
                      <span className="text-[8px] text-slate-400 italic">Signature: __________________________  Date: ________</span>
                    </div>
                    <div className="border-b border-slate-900 pb-1">
                      <span className="text-[7.5px] uppercase font-bold text-slate-600 block">Mentor / Coach Verification:</span>
                      <span className="text-[8px] text-slate-400 italic">Signature: __________________________  Date: ________</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-mono text-slate-600 pt-0.5">
                    <span className="font-bold tracking-wider">FIRST® TECH CHALLENGE TEAM #6567 ROBORAIDERS</span>
                    <span className="font-extrabold uppercase px-1.5 py-0.2 bg-slate-100 border border-slate-300 rounded text-[7.5px]">
                      STATUS: {entry.status}
                    </span>
                    <span className="font-bold text-slate-950">Binder Evidence Sheet • Page {entryPageNum} of {totalPages}</span>
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

export default JournalPrintLayout;

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
  Calendar, 
  User, 
  FileText,
  Bookmark
} from 'lucide-react';

export interface JournalPrintLayoutProps {
  entries: JournalEntry[];
  allEntries?: JournalEntry[];
  paperSize?: 'letter' | 'a4' | 'legal';
  showCover?: boolean;
  showTOC?: boolean;
  scope?: string;
  isPreview?: boolean;
}

export const JournalPrintLayout: React.FC<JournalPrintLayoutProps> = ({
  entries,
  allEntries = [],
  paperSize = 'letter',
  showCover = true,
  showTOC = true,
  scope = 'ALL',
  isPreview = false
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  const paperAspect = paperSize === 'letter' ? '8.5 / 11' : paperSize === 'a4' ? '210 / 297' : '8.5 / 14';

  // Calculate TOC pagination (up to 16 entries per TOC sheet)
  const ENTRIES_PER_TOC_PAGE = 16;
  const tocPagesCount = showTOC ? Math.max(1, Math.ceil(entries.length / ENTRIES_PER_TOC_PAGE)) : 0;
  const coverPagesCount = showCover ? 1 : 0;
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
  if (showTOC) {
    for (let i = 0; i < entries.length; i += ENTRIES_PER_TOC_PAGE) {
      tocPages.push(entries.slice(i, i + ENTRIES_PER_TOC_PAGE));
    }
    if (tocPages.length === 0) {
      tocPages.push([]);
    }
  }

  return (
    <div className={`journal-print-root ${isPreview ? 'w-full flex flex-col items-center gap-6' : 'w-full'}`}>
      
      {/* PREVIEW TOOLBAR (Only shown in interactive preview modal) */}
      {isPreview && (
        <div className="w-full max-w-2xl flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 sticky top-0 bg-slate-100/95 dark:bg-slate-850/95 py-2 px-3.5 rounded-lg backdrop-blur-md shrink-0 z-20 shadow-sm text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-800 dark:text-slate-100">
                Engineering Notebook Preview
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
                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-[9px]">TITLE COVER SHEET</span>
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
                      FIRST Tech Challenge • Engineering Portfolio & Evidence Dossier
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle Overview Panel */}
              <div className="my-auto py-6 border-y-2 border-slate-300 flex flex-col gap-6">
                <div className="inline-block bg-slate-950 text-white px-4 py-1.5 text-xs font-mono uppercase tracking-widest font-black self-start">
                  Official Judged Engineering Binder
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs sm:text-sm font-mono text-slate-850">
                  <div className="border-l-2 border-indigo-600 pl-3">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Documentation Scope:</span>
                    <span className="font-black text-slate-950 text-base uppercase">{scope}</span>
                  </div>
                  <div className="border-l-2 border-indigo-600 pl-3">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Total Session Entries:</span>
                    <span className="font-black text-slate-950 text-base">{entries.length} Logged Entries</span>
                  </div>
                  <div className="border-l-2 border-indigo-600 pl-3">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Date Range Covered:</span>
                    <span className="font-bold text-slate-950">{dateRangeStr}</span>
                  </div>
                  <div className="border-l-2 border-indigo-600 pl-3">
                    <span className="text-[10px] uppercase text-slate-500 block font-bold">Subteams Represented:</span>
                    <span className="font-bold text-slate-950">{subteamsPresent.join(', ') || 'All Subteams'}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-700 space-y-1">
                  <p><strong>AFFILIATION:</strong> Red Hook High School Robotics</p>
                  <p><strong>STATUS:</strong> {approvedCount} Approved, {pendingCount} Pending Mentor Review</p>
                  <p><strong>COMPILED ON:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t-2 border-slate-950 flex justify-between items-center text-[10px] font-mono text-slate-600">
                <span>CONFIDENTIAL ENGINEERING MATERIAL • FIRST TECH CHALLENGE</span>
                <span>GRACIOUS PROFESSIONALISM® • TEAM #6567</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. TABLE OF CONTENTS SHEET(S) */}
        {showTOC && tocPages.map((tocChunk, tocIdx) => {
          const thisTOCPageNum = coverPagesCount + tocIdx + 1;
          const isFirstTOCPage = tocIdx === 0;

          return (
            <div key={`toc-page-${tocIdx}`} className="flex flex-col items-center gap-1.5 w-full max-w-xl">
              {isPreview && (
                <div className="flex items-center justify-between w-full px-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                  <span>Page {thisTOCPageNum} of {totalPages}</span>
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-[9px]">
                    TABLE OF CONTENTS {tocPagesCount > 1 ? `(PART ${tocIdx + 1} OF ${tocPagesCount})` : ''}
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
                        <Bookmark className="w-4 h-4 text-indigo-700" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-600">
                          FTC #6567 Engineering Notebook
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black uppercase font-display tracking-tight text-slate-950">
                        Table of Contents & Dossier Index
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
                    <table className="w-full text-left text-[8px] border-collapse font-mono">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[7.5px] tracking-wider">
                          <th className="py-1 px-1.5 w-[90px] whitespace-nowrap">REF CODE</th>
                          <th className="py-1 px-1.5 w-16 whitespace-nowrap">DATE</th>
                          <th className="py-1 px-1.5 w-16 whitespace-nowrap">SUBTEAM</th>
                          <th className="py-1 px-2">SESSION TITLE & OBJECTIVES</th>
                          <th className="py-1 px-1 text-center w-16 whitespace-nowrap">STATUS</th>
                          <th className="py-1 px-1.5 text-right w-10 whitespace-nowrap">PAGE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {tocChunk.map((entry, chunkSubIdx) => {
                          const globalIdx = tocIdx * ENTRIES_PER_TOC_PAGE + chunkSubIdx;
                          const targetPage = getEntryPageNumber(globalIdx);
                          const refCode = getEntryReferenceCode(entry, allEntries.length > 0 ? allEntries : entries);

                          return (
                            <tr key={entry.id || globalIdx} className="align-middle hover:bg-slate-50">
                              <td className="py-1 px-1.5 font-mono font-bold text-slate-950 text-[7.5px] whitespace-nowrap tracking-tight">
                                {refCode}
                              </td>
                              <td className="py-1 px-1.5 text-slate-700 text-[7.5px] whitespace-nowrap font-mono">
                                {entry.date}
                              </td>
                              <td className="py-1 px-1.5 whitespace-nowrap">
                                <span className="px-1 py-0.2 bg-slate-100 border border-slate-300 rounded text-slate-800 font-semibold uppercase text-[6.5px] tracking-tight">
                                  {entry.subteam}
                                </span>
                              </td>
                              <td className="py-1 px-2 font-sans">
                                <div className="font-bold text-slate-900 text-[8px] leading-tight line-clamp-1">
                                  {entry.title || 'Engineering Session Log'}
                                </div>
                                <div className="text-[7px] text-slate-500 line-clamp-1 font-mono">
                                  {entry.planned || entry.accomplished || 'Session documentation'}
                                </div>
                              </td>
                              <td className="py-1 px-1 text-center whitespace-nowrap">
                                <span className={`px-1 py-0.2 rounded font-bold uppercase text-[6.5px] tracking-tight ${
                                  entry.status === 'Approved' 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                    : entry.status === 'Pending Review'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                                }`}>
                                  {entry.status}
                                </span>
                              </td>
                              <td className="py-1 px-1.5 text-right font-bold text-indigo-700 font-mono text-[8px] whitespace-nowrap">
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

          return (
            <div key={entry.id || idx} className="flex flex-col items-center gap-1.5 w-full max-w-xl">
              {isPreview && (
                <div className="flex items-center justify-between w-full px-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                  <span>Page {entryPageNum} of {totalPages}</span>
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[9px]">
                    ENTRY {idx + 1} • {refCode}
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
                  <div className="border-b-4 border-slate-950 pb-3 flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black border border-slate-950 px-2 py-0.5 rounded bg-slate-100 uppercase tracking-wide text-slate-950">
                        {entry.subteam}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded uppercase whitespace-nowrap">
                        REF: {refCode}
                      </span>
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-700 space-y-0.5">
                      <div><strong>DATE:</strong> <span className="text-slate-950 font-bold">{entry.date}</span></div>
                      <div><strong>AUTHOR:</strong> <span className="text-slate-950 font-semibold">{entry.author}</span></div>
                    </div>
                  </div>

                  {/* Main Entry Title */}
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 mb-4 font-display uppercase tracking-tight leading-snug">
                    {entry.title || 'Engineering Session Log'}
                  </h2>

                  {/* Structured Body Sections */}
                  <div className="space-y-4 text-xs font-sans leading-relaxed text-slate-800">
                    
                    {/* 1. Objectives & Goals Planned */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        <h3 className="font-mono font-extrabold uppercase text-slate-600 text-[10px] tracking-wider">
                          1. Objectives & Goals Planned
                        </h3>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded whitespace-pre-wrap font-sans text-slate-900">
                        {entry.planned || 'No planned goals specified.'}
                      </div>
                    </div>

                    {/* 2. Work Accomplished & Implementation */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <h3 className="font-mono font-extrabold uppercase text-slate-600 text-[10px] tracking-wider">
                          2. Work Accomplished & Implementation
                        </h3>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded whitespace-pre-wrap font-sans text-slate-900">
                        {entry.accomplished || 'No work accomplished recorded.'}
                      </div>
                    </div>

                    {/* 3. Engineering Challenges & Troubleshooting */}
                    {entry.challenges && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <h3 className="font-mono font-extrabold uppercase text-slate-600 text-[10px] tracking-wider">
                            3. Engineering Challenges & Troubleshooting
                          </h3>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded whitespace-pre-wrap font-sans text-slate-900">
                          {entry.challenges}
                        </div>
                      </div>
                    )}

                    {/* 4. Next Steps & Future Action Items */}
                    {entry.nextSteps && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <h3 className="font-mono font-extrabold uppercase text-slate-600 text-[10px] tracking-wider">
                            4. Next Steps & Future Action Items
                          </h3>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded whitespace-pre-wrap font-sans text-slate-900">
                          {entry.nextSteps}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Running Page Footer */}
                <div className="mt-8 pt-4 border-t-2 border-slate-950 flex justify-between items-center text-[9px] font-mono text-slate-600">
                  <span>FIRST TECH CHALLENGE TEAM #6567 ROBORAIDERS</span>
                  <span className="font-bold uppercase">STATUS: {entry.status}</span>
                  <span className="font-bold text-slate-950">Page {entryPageNum} of {totalPages}</span>
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

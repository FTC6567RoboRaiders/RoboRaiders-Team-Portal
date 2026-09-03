import React, { useState } from 'react';
import { OutreachEvent } from '../types';
import { formatEventDate, formatEventDateLong } from '../utils/date';
import { Users, Award, FileText, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, Bookmark } from 'lucide-react';

interface OutreachPrintLayoutProps {
  events: OutreachEvent[];
  paperSize?: 'letter' | 'a4' | 'legal';
  showCover?: boolean;
  showTOC?: boolean;
  subtitle?: string;
  isPreview?: boolean;
}

export const OutreachPrintLayout: React.FC<OutreachPrintLayoutProps> = ({
  events,
  paperSize = 'letter',
  showCover = true,
  showTOC = true,
  subtitle = 'Official Engineering Notebook Community Outreach Section',
  isPreview = false
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  const totalEvents = events.length;
  const totalHours = events.reduce((sum, ev) => sum + (Number(ev.hoursLogged) || 0), 0);
  const totalYouth = events.reduce((sum, ev) => sum + (Number(ev.reachedChildren) || 0), 0);
  const totalAdults = events.reduce((sum, ev) => sum + (Number(ev.reachedAdults) || 0), 0);
  const totalReach = totalYouth + totalAdults;

  const paperAspect = paperSize === 'letter' ? '8.5 / 11' : paperSize === 'a4' ? '210 / 297' : '8.5 / 14';

  const coverPagesCount = showCover ? 1 : 0;
  const tocPagesCount = showTOC ? 1 : 0;
  const totalPages = coverPagesCount + tocPagesCount + totalEvents;
  const startingPageIndex = coverPagesCount + tocPagesCount + 1;

  return (
    <div className={`outreach-print-root ${isPreview ? 'w-full flex flex-col items-center gap-6' : 'w-full'}`}>
      
      {/* PREVIEW TOOLBAR */}
      {isPreview && (
        <div className="w-full max-w-2xl flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 sticky top-0 bg-slate-100/95 dark:bg-slate-850/95 py-2 px-3.5 rounded-lg backdrop-blur-md shrink-0 z-20 shadow-sm text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-800 dark:text-slate-100">
                Community Outreach Preview
              </span>
              <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                {totalPages} Total Pages • {paperSize.toUpperCase()} • {totalEvents} Events • {totalHours.toFixed(1)}h Logged
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

      {/* DOCUMENT PAGES CONTAINER */}
      <div 
        className={`flex flex-col items-center gap-10 w-full transition-transform origin-top ${
          isPreview ? 'pb-16' : ''
        }`}
        style={isPreview ? { transform: `scale(${zoomLevel})`, transformOrigin: 'top center' } : undefined}
      >
        
        {/* 1. TITLE COVER SHEET */}
        {showCover && (
          <div className="flex flex-col items-center gap-1.5 w-full max-w-xl">
            {isPreview && (
              <div className="flex items-center justify-between w-full px-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                <span>Page 1 of {totalPages}</span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-[9px]">TITLE COVER SHEET</span>
              </div>
            )}

            <div 
              className={`bg-white text-black p-10 sm:p-14 flex flex-col justify-between relative border-4 border-double border-slate-900 mx-auto shadow-2xl rounded-xs w-full select-text ${
                !isPreview ? 'min-h-screen break-after-page' : ''
              }`}
              style={{
                aspectRatio: paperAspect,
                pageBreakAfter: 'always',
                breakAfter: 'page'
              }}
            >
              {/* Header Team Crest */}
              <div className="flex flex-col items-center text-center my-auto">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 border-4 border-slate-950 flex flex-col items-center justify-center rounded-full mx-auto shadow-sm">
                  <span className="font-extrabold text-2xl sm:text-3xl tracking-tighter text-slate-950">RR</span>
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-700">#6567</span>
                </div>
                
                <h1 className="text-2xl sm:text-4xl font-extrabold uppercase font-display tracking-tight text-slate-950 mb-2">
                  RoboRaiders Team Portal
                </h1>
                <div className="inline-block bg-slate-950 text-white px-3 py-1 text-xs sm:text-sm font-mono uppercase tracking-widest font-black mb-3">
                  Official Engineering Notebook
                </div>
                <p className="text-base sm:text-xl font-bold font-serif text-slate-800 tracking-wide mt-1">
                  Community Impact & Outreach Portfolio
                </p>
                <p className="text-[11px] sm:text-xs font-mono text-slate-600 mt-1 uppercase tracking-widest">
                  FIRST Tech Challenge Team #6567 • {subtitle}
                </p>

                <div className="w-48 h-1 bg-slate-950 my-6 mx-auto"></div>

                {/* Impact Metric Highlights Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl mx-auto my-2 border border-slate-300 p-3 bg-slate-50/80 rounded">
                  <div className="text-center">
                    <span className="block text-[9px] font-mono font-bold uppercase text-slate-500">Initiatives</span>
                    <span className="text-lg sm:text-xl font-black font-mono text-slate-950">{totalEvents}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[9px] font-mono font-bold uppercase text-slate-500">Total Hours</span>
                    <span className="text-lg sm:text-xl font-black font-mono text-slate-950">{totalHours.toFixed(1)}h</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[9px] font-mono font-bold uppercase text-slate-500">Youth Reached</span>
                    <span className="text-lg sm:text-xl font-black font-mono text-emerald-700">{totalYouth}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[9px] font-mono font-bold uppercase text-slate-500">Total Community</span>
                    <span className="text-lg sm:text-xl font-black font-mono text-blue-700">{totalReach}</span>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-slate-500 max-w-md mx-auto mt-4 leading-normal">
                  Compiled on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Red Hook High School Robotics Team
                </p>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-950 pt-4 flex justify-between items-center text-[10px] font-mono text-slate-600">
                <span>FIRST TECH CHALLENGE TEAM #6567</span>
                <span>GRACIOUS PROFESSIONALISM®</span>
                <span>INTENTIONAL STEM ADVOCACY</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. TABLE OF CONTENTS / INDEX SUMMARY */}
        {showTOC && (
          <div className="flex flex-col items-center gap-1.5 w-full max-w-xl">
            {isPreview && (
              <div className="flex items-center justify-between w-full px-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                <span>Page {coverPagesCount + 1} of {totalPages}</span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-[9px]">
                  TABLE OF CONTENTS & INDEX
                </span>
              </div>
            )}

            <div 
              className={`bg-white text-black p-10 sm:p-14 flex flex-col justify-between relative border border-slate-300 mx-auto shadow-2xl rounded-xs w-full select-text ${
                !isPreview ? 'min-h-screen break-after-page' : ''
              }`}
              style={{
                aspectRatio: paperAspect,
                pageBreakAfter: 'always',
                breakAfter: 'page'
              }}
            >
              <div>
                <div className="border-b-4 border-slate-950 pb-3 mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-950 font-display">
                      Table of Contents & Index
                    </h2>
                    <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-600 mt-0.5">
                      FTC #6567 Community Outreach Ledger
                    </p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-slate-700">
                    <div><strong>{totalEvents}</strong> Events • <strong>{totalHours.toFixed(1)}h</strong> Hours</div>
                    <div>Sheet {coverPagesCount + 1} of {totalPages}</div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded">
                  <table className="w-full text-left text-[9px] sm:text-[9.5px] text-slate-900 border-collapse font-mono">
                    <thead>
                      <tr className="border-b-2 border-slate-950 font-mono font-bold text-slate-700 uppercase text-[8px] sm:text-[8.5px] bg-slate-100">
                        <th className="py-1.5 px-2 w-20 whitespace-nowrap">REF ID</th>
                        <th className="py-1.5 px-2 w-24 whitespace-nowrap">EVENT DATE</th>
                        <th className="py-1.5 px-2 font-sans">INITIATIVE TITLE & VENUE</th>
                        <th className="py-1.5 px-2 text-right w-16 whitespace-nowrap">HOURS</th>
                        <th className="py-1.5 px-2 text-right w-24 whitespace-nowrap">EST. REACH</th>
                        <th className="py-1.5 px-2 text-right w-12 whitespace-nowrap">PAGE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {events.map((ev, idx) => (
                        <tr key={ev.id} className="align-top hover:bg-slate-50">
                          <td className="py-1.5 px-2 font-mono font-bold text-slate-950 text-[8.5px] whitespace-nowrap">
                            OUT-{(idx + 1).toString().padStart(2, '0')}
                          </td>
                          <td className="py-1.5 px-2 font-mono text-slate-800 text-[8.5px] whitespace-nowrap">
                            {formatEventDate(ev.date)}
                          </td>
                          <td className="py-1.5 px-2 font-sans">
                            <div className="font-bold text-slate-950 text-[10px] leading-snug">{ev.title}</div>
                            {ev.location && (
                              <div className="text-[8.5px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                                <span>📍 {ev.location}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono font-extrabold text-slate-950 text-[9px] whitespace-nowrap">
                            {ev.hoursLogged}h
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono text-[8.5px] text-slate-700 whitespace-nowrap">
                            {((ev.reachedChildren || 0) + (ev.reachedAdults || 0)) > 0 ? (
                              <span>
                                <strong className="text-slate-950 font-bold">{(ev.reachedChildren || 0) + (ev.reachedAdults || 0)}</strong>
                                <span className="text-[8px] text-slate-500 block">
                                  ({ev.reachedChildren || 0} youth / {ev.reachedAdults || 0} adult)
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono text-emerald-700 font-bold text-[9.5px] whitespace-nowrap">
                            {idx + startingPageIndex}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-auto border-t border-slate-300 pt-4 flex justify-between items-center text-[10px] font-mono text-slate-600">
                <span>FTC #6567 OUTREACH BINDER LEDGER INDEX</span>
                <span>CAPTAIN VERIFIED: _______________________</span>
                <span className="font-bold">Page {coverPagesCount + 1} of {totalPages}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. INDIVIDUAL OUTREACH EVENT PAGES */}
        {events.map((ev, index) => {
          const refId = `OUT-${(index + 1).toString().padStart(2, '0')}`;
          const totalEventReach = (ev.reachedChildren || 0) + (ev.reachedAdults || 0);
          const thisEventPageNum = index + startingPageIndex;

          return (
            <div key={ev.id} className="flex flex-col items-center gap-1.5 w-full max-w-xl">
              {isPreview && (
                <div className="flex items-center justify-between w-full px-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                  <span>Page {thisEventPageNum} of {totalPages}</span>
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[9px]">
                    EVENT {index + 1} • {refId}
                  </span>
                </div>
              )}

              <div
                className={`bg-white text-black p-10 sm:p-14 flex flex-col justify-between relative border border-slate-300 mx-auto shadow-2xl rounded-xs w-full select-text ${
                  !isPreview ? 'min-h-screen break-after-page' : ''
                }`}
                style={{
                  aspectRatio: paperAspect,
                  pageBreakAfter: 'always',
                  breakAfter: 'page'
                }}
              >
                <div>
                  {/* FTC Standard Header Plate */}
                  <div className="border-b-4 border-slate-950 pb-3 mb-6 flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black border border-slate-950 px-2 py-0.5 rounded bg-slate-100 uppercase tracking-wide text-slate-950">
                          FTC Community Outreach Record
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded uppercase">
                          REF ID: {refId}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold uppercase font-display tracking-tight text-slate-950 mt-1 leading-snug">
                        {ev.title}
                      </h2>
                    </div>

                    <div className="text-left sm:text-right text-[10px] sm:text-[11px] font-mono text-slate-800 shrink-0 space-y-0.5">
                      <div><strong>EVENT DATE:</strong> <span className="font-bold text-slate-950">{formatEventDateLong(ev.date)}</span></div>
                      <div><strong>LOCATION / VENUE:</strong> <span className="font-semibold text-slate-950">{ev.location || 'FTC Arena / Local Venue'}</span></div>
                      <div><strong>DEDICATED TIME:</strong> <span className="font-extrabold text-slate-950 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">{ev.hoursLogged} Hours Logged</span></div>
                    </div>
                  </div>

                  {/* Structured Sections */}
                  <div className="space-y-4">
                    
                    {/* 1. Community Engagement Narrative */}
                    <div className="border border-slate-300 rounded p-4 bg-white">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5 mb-2">
                        <FileText className="w-3.5 h-3.5 text-slate-700" />
                        <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider text-slate-700">
                          1. Initiative Purpose & Engagement Narrative
                        </span>
                      </div>
                      <p className="text-slate-950 text-xs sm:text-[12.5px] leading-relaxed whitespace-pre-wrap font-sans">
                        {ev.description || 'No detailed description provided.'}
                      </p>
                    </div>

                    {/* 2. Impact Metrics & Community Reach */}
                    <div className="border border-slate-300 rounded p-4 bg-white">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5 mb-2">
                        <Award className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider text-slate-700">
                          2. Quantifiable Impact & Demographics
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2 font-mono">
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
                          <span className="text-[9px] text-slate-500 uppercase block">Under 18 / Students</span>
                          <span className="text-base sm:text-lg font-black text-slate-950">{ev.reachedChildren || 0}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
                          <span className="text-[9px] text-slate-500 uppercase block">Adults / Mentors</span>
                          <span className="text-base sm:text-lg font-black text-slate-950">{ev.reachedAdults || 0}</span>
                        </div>
                        <div className="p-2.5 bg-slate-100 border border-slate-300 rounded text-center">
                          <span className="text-[9px] text-slate-600 uppercase block font-bold">Total Community Reach</span>
                          <span className="text-base sm:text-lg font-black text-emerald-800">{totalEventReach} Individuals</span>
                        </div>
                      </div>

                      {ev.impactMetrics && (
                        <div className="mt-2 text-xs font-sans text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">
                          <strong className="font-mono text-[10px] uppercase text-slate-600 block mb-0.5">Reported Notes / Outcomes:</strong>
                          <span>{ev.impactMetrics}</span>
                        </div>
                      )}
                    </div>

                    {/* 3. Event Imagery & Photographic Documentation */}
                    {ev.images && ev.images.length > 0 && (
                      <div className="border border-slate-300 rounded p-4 bg-white">
                        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5 mb-3">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                          <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider text-slate-700">
                            3. Visual Evidence & Field Photographs ({ev.images.length} Captures)
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {ev.images.slice(0, 4).map((img, imgIdx) => (
                            <div key={img.id || imgIdx} className="border border-slate-300 rounded p-1.5 bg-slate-50 flex flex-col gap-1">
                              <div className="aspect-[4/3] w-full overflow-hidden rounded bg-slate-200 flex items-center justify-center">
                                <img 
                                  src={img.dataUrl} 
                                  alt={img.name || `Outreach Evidence ${imgIdx + 1}`}
                                  className="max-h-full max-w-full object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="text-[9px] font-mono text-slate-700 px-1 truncate flex justify-between">
                                <span className="truncate">{img.name}</span>
                                <span className="text-slate-500 shrink-0">{(img.size / 1024).toFixed(1)} KB</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Page Footer Plate */}
                <div className="mt-6 pt-4 border-t-2 border-slate-950 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] font-mono text-slate-700 gap-2">
                  <span>FTC #6567 OFFICIAL OUTREACH RECORD • {refId}</span>
                  <span className="font-bold">
                    MENTOR / CAPTAIN SIGN-OFF: _______________________ DATE: _________
                  </span>
                  <span className="font-bold text-slate-950">Page {thisEventPageNum} of {totalPages}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OutreachPrintLayout;

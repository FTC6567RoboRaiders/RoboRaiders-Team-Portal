import React, { useState } from 'react';
import { OutreachEvent } from '../types';
import { formatEventDateLong } from '../utils/date';
import RoboraidersLogo from './RoboraidersLogo';
import { Users, Award, FileText, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, Bookmark, ShieldCheck } from 'lucide-react';

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
    <div className={`outreach-print-root ${isPreview ? 'w-full flex flex-col items-center gap-6' : 'w-full block bg-white text-slate-950'}`}>
      
      {/* PREVIEW TOOLBAR */}
      {isPreview && (
        <div className="w-full max-w-2xl flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 sticky top-0 bg-slate-100/95 dark:bg-slate-850/95 py-2 px-3.5 rounded-lg backdrop-blur-md shrink-0 z-20 shadow-sm text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-800 dark:text-slate-100">
                Community Outreach PDF Preview
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
        className={`w-full ${isPreview ? 'flex flex-col items-center gap-10 transition-transform origin-top pb-16' : 'block'}`}
        style={isPreview ? { transform: `scale(${zoomLevel})`, transformOrigin: 'top center' } : undefined}
      >
        
        {/* 1. TITLE COVER SHEET */}
        {showCover && (
          <div className={`w-full ${isPreview ? 'max-w-xl' : 'pdf-document-page'}`}>
            {isPreview && (
              <div className="flex items-center justify-between w-full px-1 mb-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                <span>Page 1 of {totalPages}</span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-[9px]">TITLE COVER SHEET</span>
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
                      RoboRaiders Outreach Portfolio
                    </h1>
                    <p className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mt-1.5 flex items-center gap-2">
                      <span>Red Hook Central High School</span>
                      <span>•</span>
                      <span>Community Impact &amp; STEM Advocacy</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle Overview Panel */}
              <div className="my-auto py-8 border-y-2 border-slate-300 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="inline-block bg-slate-950 text-white px-4 py-1.5 text-xs font-mono uppercase tracking-widest font-black">
                    Official Community Impact Evidence
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>VERIFIED OUTREACH INITIATIVES</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-slate-300 p-3 bg-slate-50 rounded">
                  <div className="text-center font-mono">
                    <span className="block text-[9px] uppercase font-bold text-slate-500">Events</span>
                    <span className="text-xl font-black text-slate-950">{totalEvents}</span>
                  </div>
                  <div className="text-center font-mono">
                    <span className="block text-[9px] uppercase font-bold text-slate-500">Volunteer Hours</span>
                    <span className="text-xl font-black text-slate-950">{totalHours.toFixed(1)}h</span>
                  </div>
                  <div className="text-center font-mono">
                    <span className="block text-[9px] uppercase font-bold text-slate-500">Youth Reached</span>
                    <span className="text-xl font-black text-emerald-700">{totalYouth}</span>
                  </div>
                  <div className="text-center font-mono">
                    <span className="block text-[9px] uppercase font-bold text-slate-500">Total Reach</span>
                    <span className="text-xl font-black text-indigo-700">{totalReach}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-300 rounded text-xs font-mono text-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <span><strong>ORGANIZATION:</strong> Red Hook High School Robotics Club</span>
                    <span><strong>SCOPE:</strong> {subtitle}</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span><strong>AUTHENTICATION:</strong> Certified community impact portfolio for FIRST Connect &amp; Promote awards</span>
                    <span><strong>COMPILED:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Cover Sign-Off Certification Block */}
              <div className="pt-4 border-t-2 border-slate-950 space-y-3">
                <div className="grid grid-cols-2 gap-6 text-[10px] font-mono text-slate-700">
                  <div className="border-b border-slate-400 pb-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Outreach Lead Student Sign-off</span>
                    <div className="h-5"></div>
                  </div>
                  <div className="border-b border-slate-400 pb-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Mentor / Coach Verification</span>
                    <div className="h-5"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-600 pt-1">
                  <span>CONFIDENTIAL OUTREACH DOSSIER • FIRST® TECH CHALLENGE</span>
                  <span>GRACIOUS PROFESSIONALISM® • TEAM #6567</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TABLE OF CONTENTS / SUMMARY SHEET */}
        {showTOC && (
          <div className={`w-full ${isPreview ? 'max-w-xl' : 'pdf-document-page'}`}>
            {isPreview && (
              <div className="flex items-center justify-between w-full px-1 mb-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                <span>Page {coverPagesCount + 1} of {totalPages}</span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-[9px]">
                  TABLE OF CONTENTS &amp; EVENT INDEX
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
                <div className="pdf-header-plate border-b-4 border-slate-950 pb-3 mb-4 flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Bookmark className="w-4 h-4 text-emerald-700" />
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-600">
                        FTC #6567 Community Outreach
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase font-display tracking-tight text-slate-950">
                      Table of Contents &amp; Initiative Index
                    </h2>
                  </div>
                  <div className="text-right font-mono text-[10px] text-slate-600">
                    <div><strong>{totalEvents}</strong> Total Events</div>
                    <div>Sheet {coverPagesCount + 1} of {totalPages}</div>
                  </div>
                </div>

                {/* Table */}
                <div className="pdf-section-card border border-slate-300 rounded overflow-hidden">
                  <table className="w-full text-left text-[8.5px] border-collapse font-mono">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[8px] tracking-wider">
                        <th className="py-1.5 px-2 w-16 whitespace-nowrap">REF ID</th>
                        <th className="py-1.5 px-2 w-20 whitespace-nowrap">DATE</th>
                        <th className="py-1.5 px-2.5">EVENT INITIATIVE &amp; VENUE</th>
                        <th className="py-1.5 px-2 text-center w-16 whitespace-nowrap">HOURS</th>
                        <th className="py-1.5 px-2 text-center w-20 whitespace-nowrap">COMMUNITY REACH</th>
                        <th className="py-1.5 px-2 text-right w-12 whitespace-nowrap">PAGE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {events.map((ev, idx) => (
                        <tr key={ev.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2 font-bold text-slate-950 whitespace-nowrap">
                            OUT-{(idx + 1).toString().padStart(2, '0')}
                          </td>
                          <td className="py-1.5 px-2 text-slate-700 whitespace-nowrap">
                            {ev.date}
                          </td>
                          <td className="py-1.5 px-2.5 font-sans">
                            <div className="font-bold text-slate-900 text-[8.5px] line-clamp-1">{ev.title}</div>
                            <div className="text-[7.5px] text-slate-500 font-mono line-clamp-1">{ev.location || 'Local Community'}</div>
                          </td>
                          <td className="py-1.5 px-2 text-center font-bold text-slate-950">
                            {ev.hoursLogged}h
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <span className="font-bold text-emerald-800">
                              {(ev.reachedChildren || 0) + (ev.reachedAdults || 0)} people
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-right font-bold text-emerald-700">
                            {idx + startingPageIndex}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Verification Sign-Off */}
              <div className="pdf-signoff-block mt-auto pt-4 border-t-2 border-slate-950 flex justify-between items-center text-[10px] font-mono text-slate-600">
                <div>
                  <span>CAPTAIN SIGNATURE: _______________________</span>
                </div>
                <div className="text-right font-bold">
                  <span>Page {coverPagesCount + 1} of {totalPages}</span>
                </div>
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
            <div key={ev.id} className={`w-full ${isPreview ? 'max-w-xl' : 'pdf-document-page'}`}>
              {isPreview && (
                <div className="flex items-center justify-between w-full px-1 mb-1 text-[10px] font-mono text-slate-500 uppercase font-bold">
                  <span>Page {thisEventPageNum} of {totalPages}</span>
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[9px]">
                    EVENT {index + 1} • {refId}
                  </span>
                </div>
              )}

              <div
                className={`bg-white text-slate-950 p-8 sm:p-12 flex flex-col justify-between relative border border-slate-300 mx-auto select-text pdf-entry-sheet ${
                  isPreview ? 'shadow-2xl rounded-xs' : 'min-h-[9.8in] w-full border border-slate-400'
                }`}
                style={{
                  aspectRatio: isPreview ? paperAspect : undefined,
                  pageBreakAfter: 'always',
                  breakAfter: 'page',
                  pageBreakInside: 'auto',
                  breakInside: 'auto'
                }}
              >
                <div>
                  {/* FTC Standard Header Plate */}
                  <div className="pdf-header-plate border-b-3 border-slate-950 pb-2.5 flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black border border-slate-950 px-2 py-0.5 rounded bg-slate-100 uppercase tracking-wide text-slate-950">
                        OUTREACH RECORD
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                        REF ID: {refId}
                      </span>
                    </div>
                    <div className="text-right text-[9.5px] font-mono text-slate-700 space-y-0.5">
                      <div><strong>DATE:</strong> <span className="font-bold text-slate-950">{formatEventDateLong(ev.date)}</span></div>
                      <div><strong>LOCATION:</strong> <span className="font-semibold text-slate-950">{ev.location || 'Local Community'}</span></div>
                    </div>
                  </div>

                  <h2 className="pdf-header-plate text-lg sm:text-xl font-black uppercase font-display tracking-tight text-slate-950 mb-4 border-b border-slate-200 pb-2">
                    {ev.title}
                  </h2>

                  {/* Structured Sections */}
                  <div className="space-y-4 text-xs font-sans leading-relaxed text-slate-800">
                    
                    {/* 1. Community Engagement Narrative */}
                    <div className="pdf-section-card">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-slate-700" />
                        <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                          1. Initiative Purpose &amp; Community Engagement Narrative
                        </h3>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded whitespace-pre-wrap font-sans text-slate-900 text-xs">
                        {ev.description || 'No detailed description provided.'}
                      </div>
                    </div>

                    {/* 2. Impact Metrics & Community Reach */}
                    <div className="pdf-section-card">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Award className="w-3.5 h-3.5 text-emerald-700" />
                        <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                          2. Quantifiable Impact &amp; Demographics
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 my-2 font-mono">
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
                          <span className="text-[9px] text-slate-500 uppercase block font-bold">Youth (Under 18)</span>
                          <span className="text-base font-black text-slate-950">{ev.reachedChildren || 0}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
                          <span className="text-[9px] text-slate-500 uppercase block font-bold">Adults &amp; Mentors</span>
                          <span className="text-base font-black text-slate-950">{ev.reachedAdults || 0}</span>
                        </div>
                        <div className="p-2.5 bg-slate-100 border border-slate-300 rounded text-center">
                          <span className="text-[9px] text-slate-600 uppercase block font-bold">Total Reach</span>
                          <span className="text-base font-black text-emerald-800">{totalEventReach} Individuals</span>
                        </div>
                      </div>

                      {ev.impactMetrics && (
                        <div className="mt-2 text-xs font-sans text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">
                          <strong className="font-mono text-[9px] uppercase text-slate-600 block mb-0.5">Outcomes &amp; Follow-Up:</strong>
                          <span>{ev.impactMetrics}</span>
                        </div>
                      )}
                    </div>

                    {/* 3. Event Imagery & Photographic Documentation */}
                    {ev.images && ev.images.length > 0 && (
                      <div className="pdf-section-card pdf-avoid-break">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-700" />
                          <h3 className="font-mono font-extrabold uppercase text-slate-700 text-[10px] tracking-wider">
                            3. Visual Evidence &amp; Field Photographs ({ev.images.length})
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {ev.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="border border-slate-300 rounded p-1.5 bg-slate-50 flex flex-col items-center">
                              <img 
                                src={img.dataUrl} 
                                alt={img.name || `Figure ${imgIdx + 1}`} 
                                className="max-h-40 object-contain rounded border border-slate-200 bg-white"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-[8.5px] font-mono text-slate-600 mt-1 truncate max-w-full text-center">
                                Fig {imgIdx + 1}: {img.name || 'Outreach documentation'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Running Page Footer with Sign-Off */}
                <div className="pdf-signoff-block mt-6 pt-3 border-t-2 border-slate-950 flex justify-between items-center text-[9px] font-mono text-slate-600">
                  <div>
                    <span>FIRST TECH CHALLENGE TEAM #6567 ROBORAIDERS</span>
                  </div>
                  <div>
                    <span>MENTOR SIGNATURE: _______________________</span>
                  </div>
                  <div className="text-right font-bold">
                    <span>Page {thisEventPageNum} of {totalPages}</span>
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

export default OutreachPrintLayout;

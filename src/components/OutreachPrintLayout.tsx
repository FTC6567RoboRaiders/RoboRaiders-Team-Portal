import React from 'react';
import { OutreachEvent, OutreachImage } from '../types';
import { formatEventDate, formatEventDateLong } from '../utils/date';
import { Users, Calendar, MapPin, Clock, Award, CheckCircle2, FileText, Image as ImageIcon, Heart } from 'lucide-react';

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
  const totalEvents = events.length;
  const totalHours = events.reduce((sum, ev) => sum + (Number(ev.hoursLogged) || 0), 0);
  const totalYouth = events.reduce((sum, ev) => sum + (Number(ev.reachedChildren) || 0), 0);
  const totalAdults = events.reduce((sum, ev) => sum + (Number(ev.reachedAdults) || 0), 0);
  const totalReach = totalYouth + totalAdults;

  const minHeightClass = paperSize === 'legal' ? 'min-h-[355mm]' : paperSize === 'a4' ? 'min-h-[297mm]' : 'min-h-[279mm]';
  const paperAspect = paperSize === 'letter' ? '8.5 / 11' : paperSize === 'a4' ? '210 / 297' : '8.5 / 14';

  const startingPageIndex = (showCover ? 1 : 0) + (showTOC ? 1 : 0) + 1;

  return (
    <div className={`outreach-print-root ${isPreview ? 'w-full flex flex-col items-center gap-8' : 'w-full'}`}>
      
      {/* 1. TITLE COVER SHEET */}
      {showCover && (
        <div 
          className={`bg-white text-black p-10 sm:p-14 flex flex-col justify-between relative border-4 border-double border-slate-900 mx-auto ${
            isPreview ? 'w-full max-w-[370px] shadow-lg rounded-sm text-slate-950' : 'w-full min-h-screen break-after-page'
          }`}
          style={isPreview ? { aspectRatio: paperAspect } : { pageBreakAfter: 'always', breakAfter: 'page', minHeight: paperSize === 'legal' ? '330mm' : '270mm' }}
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
                <span className="block text-[9px] font-mono font-bold uppercase text-slate-500">Youth (Under 18)</span>
                <span className="text-lg sm:text-xl font-black font-mono text-slate-950">{totalYouth}</span>
              </div>
              <div className="text-center">
                <span className="block text-[9px] font-mono font-bold uppercase text-slate-500">Total Reach</span>
                <span className="text-lg sm:text-xl font-black font-mono text-slate-950">{totalReach}</span>
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="mt-auto border-t-2 border-slate-950 pt-4">
            <div className="grid grid-cols-2 gap-4 text-[10px] sm:text-xs font-mono text-slate-800">
              <div>
                <p><strong>DOCUMENT TYPE:</strong> Community Outreach Ledger</p>
                <p><strong>GENERATED ON:</strong> {formatEventDateLong(new Date().toISOString().split('T')[0])}</p>
                <p><strong>FORMAT:</strong> {paperSize.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p><strong>RECORDS CLASSIFIED:</strong> {totalEvents} Campaigns</p>
                <p><strong>STATUS:</strong> Verified FTC Engineering Records</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TABLE OF CONTENTS / INDEX SUMMARY */}
      {showTOC && (
        <div 
          className={`bg-white text-black p-10 sm:p-14 flex flex-col justify-between relative border border-slate-300 mx-auto ${
            isPreview ? 'w-full max-w-[370px] shadow-lg rounded-sm text-slate-950' : 'w-full min-h-screen break-after-page'
          }`}
          style={isPreview ? { aspectRatio: paperAspect } : { pageBreakAfter: 'always', breakAfter: 'page', minHeight: paperSize === 'legal' ? '330mm' : '270mm' }}
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
                <span>{totalEvents} Documented Events • {totalHours.toFixed(1)} Total Hours</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] sm:text-xs text-slate-900 border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-950 font-mono font-bold text-slate-600 uppercase text-[9px] sm:text-[10px] bg-slate-100">
                    <th className="py-2 px-2 w-16">REF ID</th>
                    <th className="py-2 px-2 w-28">EVENT DATE</th>
                    <th className="py-2 px-2">INITIATIVE TITLE & VENUE</th>
                    <th className="py-2 px-2 text-right w-16">HOURS</th>
                    <th className="py-2 px-2 text-right w-24">EST. REACH</th>
                    <th className="py-2 px-2 text-right w-12">PAGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {events.map((ev, idx) => (
                    <tr key={ev.id} className="align-top hover:bg-slate-50">
                      <td className="py-2.5 px-2 font-mono font-bold text-slate-950">
                        OUT-{(idx + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-800 whitespace-nowrap">
                        {formatEventDate(ev.date)}
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="font-bold text-slate-950 leading-snug">{ev.title}</div>
                        {ev.location && (
                          <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                            <span>📍 {ev.location}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-extrabold text-slate-950">
                        {ev.hoursLogged}h
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-[10px] text-slate-700 whitespace-nowrap">
                        {((ev.reachedChildren || 0) + (ev.reachedAdults || 0)) > 0 ? (
                          <span>
                            <strong className="text-slate-950 font-bold">{(ev.reachedChildren || 0) + (ev.reachedAdults || 0)}</strong>
                            <span className="text-[9px] text-slate-500 block">
                              ({ev.reachedChildren || 0} youth / {ev.reachedAdults || 0} adult)
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600 font-bold">
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
          </div>
        </div>
      )}

      {/* 3. INDIVIDUAL OUTREACH EVENT PAGES */}
      {events.map((ev, index) => {
        const refId = `OUT-${(index + 1).toString().padStart(2, '0')}`;
        const hasYouth = ev.reachedChildren !== undefined && ev.reachedChildren > 0;
        const hasAdults = ev.reachedAdults !== undefined && ev.reachedAdults > 0;
        const totalEventReach = (ev.reachedChildren || 0) + (ev.reachedAdults || 0);

        return (
          <div
            key={ev.id}
            className={`bg-white text-black p-10 sm:p-14 flex flex-col justify-between relative border border-slate-300 mx-auto ${
              isPreview ? 'w-full max-w-[370px] shadow-lg rounded-sm text-slate-950' : 'w-full min-h-screen break-after-page'
            }`}
            style={isPreview ? { aspectRatio: paperAspect } : { pageBreakAfter: 'always', breakAfter: 'page', minHeight: paperSize === 'legal' ? '330mm' : '270mm' }}
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

                {/* 2. Measured Demographics & Quantifiable Impact Metrics */}
                <div className="border border-slate-300 rounded p-4 bg-white">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5 mb-2.5">
                    <Award className="w-3.5 h-3.5 text-slate-700" />
                    <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider text-slate-700">
                      2. Quantifiable Impact & Demographics Reach
                    </span>
                  </div>

                  {/* Reach Metric Badges */}
                  <div className="grid grid-cols-3 gap-2 mb-3 bg-slate-50 border border-slate-200 p-2.5 rounded">
                    <div className="text-center">
                      <span className="block text-[8.5px] font-mono font-bold uppercase text-slate-500">Youth (Under 18)</span>
                      <span className="text-base sm:text-lg font-black font-mono text-slate-950">{ev.reachedChildren || 0}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[8.5px] font-mono font-bold uppercase text-slate-500">Adults (18+)</span>
                      <span className="text-base sm:text-lg font-black font-mono text-slate-950">{ev.reachedAdults || 0}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[8.5px] font-mono font-bold uppercase text-slate-500">Total Direct Reach</span>
                      <span className="text-base sm:text-lg font-black font-mono text-slate-950">{totalEventReach}</span>
                    </div>
                  </div>

                  {ev.impactMetrics ? (
                    <div className="text-xs sm:text-[11.5px] font-mono text-slate-900 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-2 rounded border border-slate-200">
                      {ev.impactMetrics}
                    </div>
                  ) : (
                    <p className="text-[11px] font-mono text-slate-400 italic">No specific metric breakdown logged.</p>
                  )}
                </div>

                {/* 3. Registered Team Representatives */}
                <div className="border border-slate-300 rounded p-4 bg-white">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5 mb-2">
                    <Users className="w-3.5 h-3.5 text-slate-700" />
                    <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider text-slate-700">
                      3. Representing Team Members & Participants
                    </span>
                  </div>

                  {ev.participants && ev.participants.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {ev.participants.map((name, pIdx) => (
                        <span 
                          key={pIdx}
                          className="bg-slate-100 border border-slate-300 text-slate-950 text-[10.5px] font-mono font-bold px-2 py-0.5 rounded"
                        >
                          👤 {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] font-mono text-slate-400 italic">No individual representatives registered.</p>
                  )}
                </div>

                {/* 4. Photographical Verification & Activity Evidence */}
                {ev.images && ev.images.length > 0 && (
                  <div className="border border-slate-300 rounded p-4 bg-white">
                    <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5 mb-3">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-700" />
                      <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider text-slate-700">
                        4. Photographic Verification & Field Activity Evidence ({ev.images.length} Photos)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {ev.images.map((img) => (
                        <div key={img.id} className="border border-slate-300 rounded p-1.5 bg-slate-50 flex flex-col gap-1">
                          <div className="aspect-[4/3] rounded overflow-hidden bg-white flex items-center justify-center border border-slate-200">
                            <img 
                              src={img.dataUrl} 
                              alt={img.name}
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

            {/* Verification Sign-Off Footer */}
            <div className="mt-6 pt-4 border-t-2 border-slate-950 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] font-mono text-slate-700 gap-2">
              <span>FTC #6567 OFFICIAL OUTREACH RECORD • {refId}</span>
              <span className="font-bold">
                MENTOR / CAPTAIN SIGN-OFF: _______________________ DATE: _________
              </span>
            </div>
          </div>
        );
      })}

    </div>
  );
};

export default OutreachPrintLayout;

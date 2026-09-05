import React, { useState } from 'react';
import { 
  Award, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Building2, 
  CheckSquare, 
  Square,
  ShieldCheck
} from 'lucide-react';
import RoboraidersLogo from './RoboraidersLogo';
import { GrantApplication, GrantStatus } from '../types';

export interface GrantPrintLayoutProps {
  grants: GrantApplication[];
  paperSize?: 'letter' | 'a4';
  showKPIs?: boolean;
  showBreakdown?: boolean;
  showRequirements?: boolean;
  showNotes?: boolean;
  showSignoff?: boolean;
  scopeTitle?: string;
  seasonFilter?: string;
  generatedBy?: string;
  isPreview?: boolean;
}

export const GrantPrintLayout: React.FC<GrantPrintLayoutProps> = ({
  grants,
  paperSize = 'letter',
  showKPIs = true,
  showBreakdown = true,
  showRequirements = true,
  showNotes = true,
  showSignoff = true,
  scopeTitle = 'All Current Funding Applications',
  seasonFilter = 'All Seasons',
  generatedBy = 'RoboRaiders Member',
  isPreview = false
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  const paperAspect = paperSize === 'letter' ? '8.5 / 11' : '210 / 297';

  // Metrics calculation
  const totalRequested = grants.reduce((sum, g) => sum + (Number(g.amountRequested) || 0), 0);
  const totalAwarded = grants.reduce((sum, g) => {
    if (g.status === 'Awarded' || g.status === 'Partially Awarded') {
      return sum + (g.amountAwarded !== undefined ? Number(g.amountAwarded) : Number(g.amountRequested) || 0);
    }
    return sum;
  }, 0);

  const activePipelineGrants = grants.filter(g => 
    g.status === 'Researching' || g.status === 'Drafting' || g.status === 'Submitted' || g.status === 'Under Review'
  );
  const activePipelineAmount = activePipelineGrants.reduce((sum, g) => sum + (Number(g.amountRequested) || 0), 0);

  const awardedGrants = grants.filter(g => g.status === 'Awarded' || g.status === 'Partially Awarded');
  const closedGrants = grants.filter(g => g.status === 'Awarded' || g.status === 'Not Awarded' || g.status === 'Closed');
  const winRate = closedGrants.length > 0 ? Math.round((awardedGrants.length / closedGrants.length) * 100) : 0;

  // Status breakdown
  const statusCounts: Record<GrantStatus, { count: number; requested: number; awarded: number }> = {
    'Researching': { count: 0, requested: 0, awarded: 0 },
    'Drafting': { count: 0, requested: 0, awarded: 0 },
    'Submitted': { count: 0, requested: 0, awarded: 0 },
    'Under Review': { count: 0, requested: 0, awarded: 0 },
    'Awarded': { count: 0, requested: 0, awarded: 0 },
    'Partially Awarded': { count: 0, requested: 0, awarded: 0 },
    'Not Awarded': { count: 0, requested: 0, awarded: 0 },
    'Closed': { count: 0, requested: 0, awarded: 0 }
  };

  grants.forEach(g => {
    if (statusCounts[g.status]) {
      statusCounts[g.status].count += 1;
      statusCounts[g.status].requested += Number(g.amountRequested) || 0;
      statusCounts[g.status].awarded += Number(g.amountAwarded || 0);
    }
  });

  // Upcoming deadlines (< 30 days)
  const now = new Date();
  const upcomingDeadlines = grants.filter(g => {
    if (!g.deadlineDate || g.status === 'Awarded' || g.status === 'Not Awarded' || g.status === 'Closed') return false;
    const d = new Date(g.deadlineDate + 'T00:00:00');
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className={`grant-print-root ${isPreview ? 'w-full flex flex-col items-center gap-6' : 'w-full'}`}>
      
      {/* PREVIEW ZOOM CONTROLS (Only visible in preview mode, hidden in print) */}
      {isPreview && (
        <div className="no-print sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-4 text-xs shadow-xl">
          <span className="font-mono text-[11px] font-bold text-slate-400">
            PREVIEW ZOOM: {Math.round(zoomLevel * 100)}%
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.1))}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border-none"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(0.85)}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border-none"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border-none"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[11px] text-slate-400 border-l border-slate-700 pl-3">
            {grants.length} proposal{grants.length === 1 ? '' : 's'} included
          </span>
        </div>
      )}

      {/* PRINTABLE CONTAINER WITH OPTIONAL ZOOM SCALE FOR PREVIEW */}
      <div 
        style={isPreview ? { transform: `scale(${zoomLevel})`, transformOrigin: 'top center' } : undefined}
        className="w-full flex flex-col items-center gap-8 print:scale-100 print:transform-none"
      >
        
        {/* PAGE 1: EXECUTIVE SUMMARY & MASTER PIPELINE TABLE */}
        <div 
          className={`bg-white text-slate-950 p-8 sm:p-12 flex flex-col justify-between relative border border-slate-300 mx-auto shadow-2xl rounded-xs w-full max-w-[850px] select-text print:border-none print:shadow-none print:p-6 ${
            !isPreview ? 'min-h-screen break-after-page' : ''
          }`}
          style={{
            aspectRatio: isPreview ? paperAspect : undefined,
            pageBreakAfter: 'always',
            breakAfter: 'page'
          }}
        >
          <div className="flex flex-col gap-5">
            
            {/* DOCUMENT HEADER */}
            <div className="border-b-4 border-slate-950 pb-4 flex justify-between items-start gap-4">
              <div className="flex items-center gap-3.5">
                <RoboraidersLogo className="w-14 h-14" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-600 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider leading-none">
                      FTC #6567
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                      ROBORAIDERS ROBOTICS
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase font-display tracking-tight text-slate-950 mt-1">
                    Grant &amp; Sponsorship Funding Report
                  </h1>
                  <p className="text-xs text-slate-600 font-sans mt-0.5">
                    Scope: {scopeTitle} • Season: {seasonFilter}
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-[10px] text-slate-600 shrink-0">
                <div className="font-bold text-slate-900">DATE: {currentDateFormatted}</div>
                <div>GENERATED BY: {generatedBy}</div>
                <div className="text-slate-400 mt-0.5">CONFIDENTIAL • TEAM ARCHIVE</div>
              </div>
            </div>

            {/* FINANCIAL KPIS CALLOUT (IF ENABLED) */}
            {showKPIs && (
              <div className="grid grid-cols-4 gap-2.5 bg-slate-50 border border-slate-200 p-3 rounded-lg font-mono">
                
                {/* Total Awarded */}
                <div className="border-r border-slate-200 pr-2">
                  <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Total Awarded</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700 block">
                    ${totalAwarded.toLocaleString()}
                  </span>
                  <span className="text-[8px] text-slate-500 block">
                    {awardedGrants.length} award{awardedGrants.length === 1 ? '' : 's'} secured
                  </span>
                </div>

                {/* Pipeline Value */}
                <div className="border-r border-slate-200 pr-2">
                  <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Active Pipeline</span>
                  <span className="text-base sm:text-lg font-black text-amber-700 block">
                    ${activePipelineAmount.toLocaleString()}
                  </span>
                  <span className="text-[8px] text-slate-500 block">
                    {activePipelineGrants.length} pending decisions
                  </span>
                </div>

                {/* Total Requested */}
                <div className="border-r border-slate-200 pr-2">
                  <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Total Requested</span>
                  <span className="text-base sm:text-lg font-black text-slate-800 block">
                    ${totalRequested.toLocaleString()}
                  </span>
                  <span className="text-[8px] text-slate-500 block">
                    {grants.length} proposals logged
                  </span>
                </div>

                {/* Win Rate */}
                <div>
                  <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Award Win Rate</span>
                  <span className="text-base sm:text-lg font-black text-indigo-700 block">
                    {winRate}%
                  </span>
                  <span className="text-[8px] text-slate-500 block">
                    {closedGrants.length} decided applications
                  </span>
                </div>

              </div>
            )}

            {/* STATUS PIPELINE SUMMARY STRIP */}
            {showBreakdown && (
              <div className="border border-slate-200 rounded-lg p-2.5 bg-white text-[9.5px]">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Pipeline Distribution by Status
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 font-mono text-center">
                  {(Object.keys(statusCounts) as GrantStatus[]).map(statusKey => {
                    const item = statusCounts[statusKey];
                    if (item.count === 0) return null;
                    return (
                      <div key={statusKey} className="bg-slate-50 border border-slate-200 rounded p-1.5">
                        <span className="text-[7.5px] font-bold text-slate-500 block truncate">{statusKey}</span>
                        <span className="text-xs font-black text-slate-900 block">{item.count}</span>
                        <span className="text-[7.5px] text-slate-500 block">
                          ${(statusKey === 'Awarded' || statusKey === 'Partially Awarded' ? item.awarded : item.requested).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* UPCOMING DEADLINES WARNING (IF ANY) */}
            {upcomingDeadlines.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-lg flex items-center gap-2.5 text-[10px]">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <div className="text-amber-900 font-sans">
                  <strong>Urgent Deadlines (Next 30 Days): </strong>
                  {upcomingDeadlines.map(g => `${g.name} (${g.deadlineDate})`).join(' • ')}
                </div>
              </div>
            )}

            {/* MASTER APPLICATIONS TABLE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  Itemized Funding Proposals Table ({grants.length} Records)
                </span>
                <span className="text-[9px] font-mono text-slate-400">Amounts in USD ($)</span>
              </div>

              <div className="overflow-hidden border border-slate-300 rounded">
                <table className="w-full text-left text-[9px] border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[8px] tracking-wider">
                      <th className="py-2 px-2">PROPOSAL / SPONSOR</th>
                      <th className="py-2 px-1.5">CATEGORY</th>
                      <th className="py-2 px-1.5 text-center">STATUS</th>
                      <th className="py-2 px-1.5 text-right">REQUESTED</th>
                      <th className="py-2 px-1.5 text-right">AWARDED</th>
                      <th className="py-2 px-1.5">DEADLINE</th>
                      <th className="py-2 px-2">LEAD CONTACT</th>
                      <th className="py-2 px-1.5 text-center">LEDGER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {grants.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500 font-sans text-xs">
                          No grant applications recorded in this reporting period.
                        </td>
                      </tr>
                    ) : (
                      grants.map((grant, idx) => {
                        const isAwarded = grant.status === 'Awarded' || grant.status === 'Partially Awarded';
                        const reqTotal = grant.requirements.length;
                        const reqDone = grant.requirements.filter(r => r.completed).length;

                        return (
                          <tr key={grant.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                            
                            {/* Proposal & Sponsor */}
                            <td className="py-1.5 px-2 font-bold text-slate-900 max-w-[200px]">
                              <div className="truncate text-[9.5px]">{grant.name}</div>
                              <div className="text-[8px] font-normal text-slate-500 flex items-center gap-1 truncate">
                                <Building2 className="w-2.5 h-2.5 shrink-0" />
                                <span>{grant.organization}</span>
                                {grant.season && <span>• {grant.season}</span>}
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-1.5 px-1.5 text-[8.5px] text-slate-600 truncate max-w-[100px]">
                              {grant.category}
                            </td>

                            {/* Status */}
                            <td className="py-1.5 px-1.5 text-center whitespace-nowrap">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                isAwarded 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : grant.status === 'Under Review' || grant.status === 'Submitted'
                                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                  : grant.status === 'Not Awarded'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                {grant.status}
                              </span>
                            </td>

                            {/* Requested */}
                            <td className="py-1.5 px-1.5 text-right font-medium text-slate-700 whitespace-nowrap">
                              ${(Number(grant.amountRequested) || 0).toLocaleString()}
                            </td>

                            {/* Awarded */}
                            <td className="py-1.5 px-1.5 text-right font-bold whitespace-nowrap">
                              {isAwarded ? (
                                <span className="text-emerald-700">
                                  ${(grant.amountAwarded !== undefined ? Number(grant.amountAwarded) : Number(grant.amountRequested) || 0).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            {/* Deadline */}
                            <td className="py-1.5 px-1.5 text-[8.5px] text-slate-600 whitespace-nowrap">
                              {grant.deadlineDate || 'None'}
                            </td>

                            {/* Lead Contact */}
                            <td className="py-1.5 px-2 text-[8.5px] text-slate-700 max-w-[110px] truncate">
                              <div>{grant.leadMemberName || 'Team Lead'}</div>
                              {reqTotal > 0 && (
                                <div className="text-[7.5px] text-slate-400">
                                  Checklist: {reqDone}/{reqTotal}
                                </div>
                              )}
                            </td>

                            {/* Ledger Sync */}
                            <td className="py-1.5 px-1.5 text-center whitespace-nowrap">
                              {grant.syncedToLedger ? (
                                <span className="text-emerald-600 text-[8px] font-bold">YES</span>
                              ) : isAwarded ? (
                                <span className="text-amber-600 text-[8px]">PENDING</span>
                              ) : (
                                <span className="text-slate-300 text-[8px]">N/A</span>
                              )}
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {grants.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-[8.5px]">
                        <td className="py-2 px-2" colSpan={3}>TOTALS ({grants.length} PROPOSALS)</td>
                        <td className="py-2 px-1.5 text-right text-slate-900">${totalRequested.toLocaleString()}</td>
                        <td className="py-2 px-1.5 text-right text-emerald-800">${totalAwarded.toLocaleString()}</td>
                        <td className="py-2 px-1.5" colSpan={3}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

          </div>

          {/* PAGE FOOTER */}
          <div className="border-t border-slate-200 pt-3 mt-4 flex justify-between items-center text-[9px] font-mono text-slate-500">
            <div>FTC Team #6567 RoboRaiders • Grant &amp; Sponsorship Report</div>
            <div>Page 1 of {showRequirements && grants.some(g => g.requirements.length > 0) ? '2+' : '1'}</div>
          </div>

        </div>

        {/* PAGE 2: DETAILED DELIVERABLES & REQUIREMENTS BREAKDOWN (IF ENABLED) */}
        {showRequirements && grants.some(g => g.requirements.length > 0 || g.notes || g.description) && (
          <div 
            className={`bg-white text-slate-950 p-8 sm:p-12 flex flex-col justify-between relative border border-slate-300 mx-auto shadow-2xl rounded-xs w-full max-w-[850px] select-text print:border-none print:shadow-none print:p-6 ${
              !isPreview ? 'min-h-screen break-after-page' : ''
            }`}
            style={{
              aspectRatio: isPreview ? paperAspect : undefined,
              pageBreakAfter: 'always',
              breakAfter: 'page'
            }}
          >
            <div className="flex flex-col gap-4">
              
              {/* PAGE 2 HEADER */}
              <div className="border-b-2 border-slate-900 pb-2 flex justify-between items-end">
                <div>
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-500">
                    FTC #6567 ROBORAIDERS • DELIVERABLES AUDIT
                  </span>
                  <h2 className="text-lg font-black uppercase font-display tracking-tight text-slate-950">
                    Application Deliverables &amp; Reporting Checklist
                  </h2>
                </div>
                <div className="font-mono text-[9px] text-slate-500">
                  SECTION 2: REQUIREMENTS &amp; OBLIGATIONS
                </div>
              </div>

              {/* INDIVIDUAL GRANT DELIVERABLE CARDS */}
              <div className="space-y-3 font-sans">
                {grants.map((grant) => {
                  if (grant.requirements.length === 0 && !grant.notes && !grant.description) return null;
                  const reqDone = grant.requirements.filter(r => r.completed).length;
                  const reqTotal = grant.requirements.length;
                  const pct = reqTotal > 0 ? Math.round((reqDone / reqTotal) * 100) : 0;

                  return (
                    <div key={grant.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                      
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-xs text-slate-900">{grant.name}</div>
                          <div className="text-[9px] text-slate-500 font-mono">
                            {grant.organization} • {grant.category} • Status: <span className="font-bold text-slate-700">{grant.status}</span>
                          </div>
                        </div>
                        <div className="text-right font-mono text-[9px]">
                          <span className="font-bold text-slate-800">
                            Checklist: {reqDone}/{reqTotal} ({pct}%)
                          </span>
                          {grant.deadlineDate && (
                            <div className="text-slate-500 text-[8px]">Deadline: {grant.deadlineDate}</div>
                          )}
                        </div>
                      </div>

                      {/* Description / Purpose */}
                      {showNotes && grant.description && (
                        <p className="text-[9px] text-slate-600 mb-2 italic bg-white p-1.5 rounded border border-slate-100">
                          "{grant.description}"
                        </p>
                      )}

                      {/* Deliverables Checklist Grid */}
                      {grant.requirements.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1.5 font-mono text-[8.5px]">
                          {grant.requirements.map(req => (
                            <div 
                              key={req.id}
                              className={`flex items-start gap-1.5 p-1 rounded ${
                                req.completed ? 'bg-emerald-50 text-emerald-900' : 'bg-white text-slate-700 border border-slate-100'
                              }`}
                            >
                              {req.completed ? (
                                <CheckSquare className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 leading-tight">
                                <span className={req.completed ? 'line-through opacity-80' : ''}>
                                  {req.title}
                                </span>
                                {req.completed && req.completedBy && (
                                  <span className="block text-[7.5px] text-emerald-700 opacity-70">
                                    Done by {req.completedBy}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Post-Award Obligation Banner */}
                      {grant.postAwardReportRequired && (
                        <div className="mt-2 text-[8px] font-mono text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 flex items-center justify-between">
                          <span>Post-Award Impact Report Required</span>
                          <span>Deadline: {grant.postAwardReportDeadline || 'End of Season'} • Status: {grant.postAwardReportCompleted ? 'Completed' : 'Pending Submission'}</span>
                        </div>
                      )}

                      {/* Notes */}
                      {showNotes && grant.notes && (
                        <div className="mt-1.5 text-[8px] text-slate-500 font-sans">
                          <strong>Team Notes:</strong> {grant.notes}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

              {/* EXECUTIVE VERIFICATION / SIGNOFF BLOCK */}
              {showSignoff && (
                <div className="border-t-2 border-slate-300 pt-4 mt-4 font-mono text-[9px]">
                  <span className="text-[8.5px] font-bold uppercase text-slate-500 tracking-wider block mb-3">
                    Executive Verification &amp; Coach Sign-Off
                  </span>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="border-t border-slate-400 pt-1">
                      <span className="font-bold text-slate-800 block">Lead Mentor Signature</span>
                      <span className="text-[7.5px] text-slate-500">Date: __________________</span>
                    </div>
                    <div className="border-t border-slate-400 pt-1">
                      <span className="font-bold text-slate-800 block">Team Treasurer / Captain</span>
                      <span className="text-[7.5px] text-slate-500">Date: __________________</span>
                    </div>
                    <div className="border-t border-slate-400 pt-1">
                      <span className="font-bold text-slate-800 block">Booster Club / CTE Coordinator</span>
                      <span className="text-[7.5px] text-slate-500">Date: __________________</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* PAGE 2 FOOTER */}
            <div className="border-t border-slate-200 pt-3 mt-4 flex justify-between items-center text-[9px] font-mono text-slate-500">
              <div>FTC Team #6567 RoboRaiders • Grant &amp; Sponsorship Report</div>
              <div>Page 2 of 2 • Official Documentation</div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default GrantPrintLayout;

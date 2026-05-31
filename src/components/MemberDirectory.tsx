import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  CheckCircle, 
  X, 
  Edit, 
  Award, 
  Clock, 
  BookOpen, 
  Heart, 
  ShieldAlert, 
  TrendingUp, 
  Sliders, 
  Sparkles,
  ChevronRight,
  Info,
  Calendar,
  Download,
  Printer,
  FileText,
  LayoutTemplate,
  AlertTriangle
} from 'lucide-react';
import { UserAccount, JournalEntry, TimeEntry, KanbanTask, OutreachEvent, XPAdjustment, Subteam } from '../types';
import { computeUserGamification, calculateJournalQualityScore } from '../utils/gamification';

interface MemberDirectoryProps {
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  entries: JournalEntry[];
  timeEntries: TimeEntry[];
  kanbanTasks: KanbanTask[];
  outreachEvents: OutreachEvent[];
  xpAdjustments: XPAdjustment[];
  onBack: () => void;
  onApproveUser: (userId: string) => Promise<void>;
  onRejectUser: (userId: string) => Promise<void>;
  onUpdateLeadership: (userId: string, leadership: 'None' | 'Captain' | 'Subteam leader') => Promise<void>;
  onStartEditProfile: (userName: string) => void;
  formatSubteamLabel: (subteam: any) => string;
}

export default function MemberDirectory({
  currentUser,
  accounts,
  entries,
  timeEntries,
  kanbanTasks,
  outreachEvents,
  xpAdjustments,
  onBack,
  onApproveUser,
  onRejectUser,
  onUpdateLeadership,
  onStartEditProfile,
  formatSubteamLabel
}: MemberDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubteam, setFilterSubteam] = useState<string>('All');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [isRosterExportModalOpen, setIsRosterExportModalOpen] = useState(false);
  const [rosterExportPaperSize, setRosterExportPaperSize] = useState<'letter' | 'a4' | 'legal'>('letter');
  const [rosterExportShowCover, setRosterExportShowCover] = useState<boolean>(true);
  const [rosterExportShowTOC, setRosterExportShowTOC] = useState<boolean>(true);
  const [rosterExportShowPreview, setRosterExportShowPreview] = useState<boolean>(true);
  const [selectedUserForAudit, setSelectedUserForAudit] = useState<UserAccount | null>(() => {
    // Default to first user if available
    return accounts.find(a => a.status === 'Approved') || null;
  });

  const isMentorOrCaptain = currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain';

  // Filters
  const filteredRoster = accounts.filter(acc => {
    if (acc.status !== 'Approved') return false; // shown in separate pending requests section, or rejected

    const matchesSearch = acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          acc.schoolEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubteam = filterSubteam === 'All' || acc.primarySubteam === filterSubteam || acc.secondarySubteam === filterSubteam;
    
    let matchesRole = true;
    if (filterRole !== 'All') {
      if (filterRole === 'mentor') {
        matchesRole = acc.role === 'mentor' || acc.role === 'mentor_captain';
      } else if (filterRole === 'captain') {
        matchesRole = acc.role === 'captain';
      } else if (filterRole === 'member') {
        matchesRole = acc.role === 'member';
      }
    }
    
    return matchesSearch && matchesSubteam && matchesRole;
  });

  // Pending user accounts awaiting coach approval
  const pendingRequests = accounts.filter(acc => acc.status === 'Pending' || acc.status === 'Rejected');

  // Compute itemized XP breakdown audit for a chosen user
  const getUserXpAudit = (user: UserAccount) => {
    const email = user.schoolEmail.toLowerCase();
    
    // 1. Filter sources
    const userJournals = entries.filter(e => 
      e.author.toLowerCase().includes(email) || 
      e.author.toLowerCase().includes(user.name.toLowerCase())
    );
    
    const userHours = timeEntries.filter(t => 
      t.userEmail.toLowerCase() === email
    );

    const userPassedOutreach = outreachEvents.filter(ev => 
      ev.participants?.some(p => 
        p.toLowerCase() === user.name.toLowerCase() || 
        p.toLowerCase() === user.schoolEmail.toLowerCase()
      )
    );

    const userManualAdjs = xpAdjustments.filter(adj => 
      adj.userId === user.id || adj.userEmail?.toLowerCase() === email
    );

    // 2. Map itemized points
    const hoursLogs = userHours.map(h => ({
      id: h.id,
      date: h.date,
      subteam: h.subteam,
      hours: h.durationHours,
      xp: Math.floor(h.durationHours * 10),
      description: `Workshop Attendance: ${h.startTime} - ${h.endTime} (${h.durationHours} hrs) focusing on ${h.subteam}`
    }));

    const journalLogs = userJournals.map(j => {
      const qScore = calculateJournalQualityScore(j);
      const isApproved = j.status === 'Approved';
      const imgCount = j.images?.length || 0;
      
      const baseXp = 50;
      const qualityXp = Math.floor(qScore);
      const approvedXp = isApproved ? 120 : 0;
      const imgXp = imgCount * 15;
      const totalJ_Xp = baseXp + qualityXp + approvedXp + imgXp;

      const journalName = `${formatSubteamLabel(j.subteam)} Log`;

      return {
        id: j.id,
        date: j.date,
        title: journalName,
        subteam: j.subteam,
        status: j.status,
        baseXp,
        qualityXp,
        approvedXp,
        imgCount,
        imgXp,
        xp: totalJ_Xp,
        description: `Engineering Log published: ${journalName} on ${j.date}`
      };
    });

    const outreachLogs = userPassedOutreach.map(ev => ({
      id: ev.id,
      date: ev.date,
      title: ev.title,
      hours: ev.hoursLogged,
      xp: 50,
      description: `Outreach Project deployment: "${ev.title}" (${ev.hoursLogged} hrs logged)`
    }));

    const manualLogs = userManualAdjs.map(adj => ({
      id: adj.id,
      date: adj.createdAt ? new Date(adj.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
      reason: adj.reason,
      xp: adj.amount,
      admin: adj.awardedBy || 'System'
    }));

    const totalCalculated = 
      hoursLogs.reduce((sum, item) => sum + item.xp, 0) +
      journalLogs.reduce((sum, item) => sum + item.xp, 0) +
      outreachLogs.reduce((sum, item) => sum + item.xp, 0) +
      manualLogs.reduce((sum, item) => sum + item.xp, 0);

    return {
      hoursLogs,
      journalLogs,
      outreachLogs,
      manualLogs,
      totalCalculated
    };
  };

  const handleExportRoster = () => {
    const csvRows = [];
    csvRows.push(['Name', 'Email', 'Role', 'Leadership', 'Status', 'Primary Subteam', 'Secondary Subteam', 'Level', 'Total XP', 'Total Hours', 'Journals', 'Outreach Events'].join(','));
    
    // Allow users to export the full directory including gamification logic
    accounts.forEach((acc) => {
      // Recompute logic per acc
      // NOTE gamification for MemberDirectory components only uses these props: 
      // computeUserGamification(user: UserAccount, journals: JournalEntry[], timeEntries: TimeEntry[], kanbanTasks: KanbanTask[], outreachEvents: OutreachEvent[], xpAdjs: XPAdjustment[])
      const g = computeUserGamification(acc, entries, timeEntries, kanbanTasks, outreachEvents, xpAdjustments);
      const audit = getUserXpAudit(acc);
      const outreachCount = audit.outreachLogs.length;

      const row = [
        `"${acc.name.replace(/"/g, '""')}"`,
        `"${acc.schoolEmail.replace(/"/g, '""')}"`,
        `"${acc.role.replace(/"/g, '""')}"`,
        `"${acc.leadership || 'None'}"`,
        `"${acc.status.replace(/"/g, '""')}"`,
        `"${acc.primarySubteam || 'None'}"`,
        `"${acc.secondarySubteam || 'None'}"`,
        `${g.stats.level}`,
        `${g.stats.xp}`,
        `${g.stats.totalHours.toFixed(2)}`,
        `${g.stats.totalJournals}`,
        `${outreachCount}`
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FTC_Roster_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
    <div className={`flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors p-4 md:p-6 ${isRosterExportModalOpen ? 'print:hidden' : ''}`} id="member-approvals-directory-viewport">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-900 no-print">
        <div>
          <span className="bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded border border-indigo-500/20 tracking-widest leading-none">
            TEAM ROSTER & SECURITY CONTROLS
          </span>
          <h1 className="text-xl md:text-2xl font-black uppercase text-slate-900 dark:text-slate-50 mt-1.5 tracking-tight font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>RoboRaiders Roster Directory & Approvals</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Audit registered student team credentials, approve incoming pending accounts, and analyze itemized XP source logs.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsRosterExportModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-2.5 text-xs rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Export Roster to PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            onClick={handleExportRoster}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold px-3 py-2.5 text-xs rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md border border-slate-350 dark:border-slate-700"
            title="Export Roster to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={onBack}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold px-4 py-2.5 text-xs rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md border border-slate-350 dark:border-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Hub</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT TWO-THIRDS PANEL: DIRECTORY & PENDING REQUESTS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Section 1: Pending Access Requests for Mentors */}
          {isMentorOrCaptain && (
            <div className="bg-white dark:bg-slate-900 border border-amber-300/40 dark:border-amber-900/30 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Pending &amp; Rejected Requests ({pendingRequests.length})</span>
              </h3>

              {pendingRequests.length === 0 ? (
                <div className="bg-amber-500/[0.02] border border-amber-505/10 rounded-lg p-5 text-center text-xs text-slate-500 dark:text-slate-400 italic font-medium">
                  🎉 Good job! There are no student login registrations waiting for verification.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingRequests.map((acc) => (
                    <div 
                      key={acc.id}
                      className={`border rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${
                        acc.status === 'Rejected' 
                          ? 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20 dark:border-rose-900/15'
                          : 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 dark:border-amber-900/15'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 dark:text-slate-50 text-sm">{acc.name}</span>
                          <span className={`font-mono text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                            acc.status === 'Rejected'
                              ? 'bg-rose-100 dark:bg-rose-955/40 text-rose-800 dark:text-rose-305'
                              : 'bg-amber-100 dark:bg-amber-955/40 text-amber-800 dark:text-amber-305'
                          }`}>
                            {acc.status === 'Rejected' ? 'Access Rejected' : 'Pending Approval'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono space-y-0.5">
                          <div>School Email: <strong className="text-slate-800 dark:text-slate-205">{acc.schoolEmail}</strong></div>
                          <div>Role Declared: <strong>{acc.role === 'member' ? 'Student Specialist' : acc.role}</strong></div>
                          <div>Primary Subteam Area: <strong>{formatSubteamLabel(acc.primarySubteam)}</strong></div>
                          {acc.secondarySubteam !== 'None' && <div>Secondary Focus: <strong>{formatSubteamLabel(acc.secondarySubteam)}</strong></div>}
                        </div>
                        <div className="mt-2.5 flex items-center gap-1.5 pt-1.5 border-t border-amber-100 dark:border-amber-955 text-xs text-slate-550 dark:text-slate-400">
                          <span className="font-bold">Initial Leadership Status:</span>
                          <select
                            value={acc.leadership || 'None'}
                            onChange={(e) => onUpdateLeadership(acc.id, e.target.value as any)}
                            className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-1.5 py-0.5 font-sans font-bold text-[10px] text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-brand outline-none"
                          >
                            <option value="None">None</option>
                            <option value="Captain">Captain</option>
                            <option value="Subteam leader">Subteam leader</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => onStartEditProfile(acc.name)}
                          className="bg-slate-700 hover:bg-slate-650 text-white font-extrabold p-2 rounded-md text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border-0 shadow-sm"
                          title="Edit Pending Registration Data"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => onApproveUser(acc.id)}
                          className="bg-emerald-600 hover:bg-emerald-505 text-white font-extrabold p-2 rounded-md text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border-0 shadow-md"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        {acc.status !== 'Rejected' && (
                          <button
                            onClick={() => onRejectUser(acc.id)}
                            className="bg-rose-600 hover:bg-rose-505 text-white font-extrabold p-2 rounded-md text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border-0 shadow-sm"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Searchable & Filterable Active Team Directory */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Authorized Active Team Directory ({filteredRoster.length})</span>
              </h3>
              
              {/* Reset filter button */}
              {(filterSubteam !== 'All' || filterRole !== 'All' || searchQuery !== '') && (
                <button
                  onClick={() => {
                    setFilterSubteam('All');
                    setFilterRole('All');
                    setSearchQuery('');
                  }}
                  className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Filter controls panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-805 text-xs">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">Search Member</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 pointer-events-none">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or school email..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 pl-8 pr-3 py-1.5 rounded text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">Filter Subteam Focus</label>
                <select
                  value={filterSubteam}
                  onChange={(e) => setFilterSubteam(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-2.5 py-1.5 rounded text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                >
                  <option value="All">All Subteams</option>
                  <option value="Design/Build/Fabrication">Design &amp; Build</option>
                  <option value="Programming">Programming</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Business & Media">Business & Media</option>
                  <option value="Inspire">Inspire</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Mentor">Coach / Mentor</option>
                  <option value="None">Independent / Unassigned</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">Filter Team Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-2.5 py-1.5 rounded text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                >
                  <option value="All">All Roles</option>
                  <option value="member">Student Specialists</option>
                  <option value="captain">Team Leaders / Captains</option>
                  <option value="mentor">Mentors &amp; Program Admins</option>
                </select>
              </div>

            </div>

            {/* Directory Cards List */}
            {filteredRoster.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-950 p-8 border border-slate-250 dark:border-slate-805 text-center text-slate-500 dark:text-slate-400 italic rounded-lg">
                ❌ No registered team members matched the current filter conditions. Try adjusting search queries.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredRoster.map((acc) => {
                  const isSelected = selectedUserForAudit?.id === acc.id;
                  const userGamifiedInfo = computeUserGamification(acc, entries, timeEntries, kanbanTasks, outreachEvents, xpAdjustments);
                  
                  return (
                    <div 
                      key={acc.id}
                      onClick={() => setSelectedUserForAudit(acc)}
                      className={`border p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between hover:shadow-md ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-500/[0.03] dark:bg-indigo-950/10' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-tight hover:underline">
                            {acc.name}
                          </span>
                          <span className={`font-mono text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            acc.role === 'mentor' || acc.role === 'mentor_captain'
                              ? 'bg-purple-100 border-purple-250 text-purple-800 dark:bg-purple-950/40 dark:border-purple-900/40 dark:text-purple-305'
                              : acc.role === 'captain'
                              ? 'bg-amber-100 border-amber-250 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/40 dark:text-amber-305'
                              : 'bg-indigo-50 border-indigo-250 text-indigo-850 dark:bg-indigo-950/30 dark:border-indigo-900/45 dark:text-indigo-305'
                          }`}>
                            {acc.role === 'mentor' ? 'Coach' : acc.role === 'mentor_captain' ? 'Mentor/Captain' : acc.role === 'captain' ? 'Leader' : 'Student'}
                          </span>
                        </div>
                        
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-2 truncate">
                          {acc.schoolEmail}
                        </div>

                        {/* Badges and tags */}
                        <div className="space-y-1 text-[10.5px]">
                          <div className="flex items-center gap-1 text-slate-705 dark:text-slate-300">
                            <span className="font-semibold text-slate-405">Subteam:</span>
                            <span className="font-bold">{formatSubteamLabel(acc.primarySubteam)}</span>
                          </div>
                          
                          {acc.leadership && acc.leadership !== 'None' && (
                            <div className="flex items-center gap-1.5">
                              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-mono text-[9px] font-black uppercase tracking-wider">
                                {acc.leadership}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Gamified Rank and XP */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-805 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-mono font-bold text-[10px] text-slate-500 dark:text-slate-400">
                            LVL {userGamifiedInfo.stats.level}
                          </span>
                        </div>
                        <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono">
                          {userGamifiedInfo.stats.xp} XP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ONE-THIRD PANEL: DETAIL VIEW & ITEMISED XP AUDIT LEDGER */}
        <div className="lg:col-span-4 lg:sticky lg:top-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          {!selectedUserForAudit ? (
            <div className="text-center py-10 text-slate-400">
              <ShieldAlert className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">No Profile Selected</p>
              <p className="text-[11px] text-slate-500 mt-1">Select any verified member card from the directory list on the left to dissect their dynamic XP source ledger and profile details.</p>
            </div>
          ) : (
            (() => {
              const selectedGamified = computeUserGamification(selectedUserForAudit, entries, timeEntries, kanbanTasks, outreachEvents, xpAdjustments);
              const auditData = getUserXpAudit(selectedUserForAudit);
              
              const isLeadActionsAvailable = isMentorOrCaptain && (selectedUserForAudit.id !== 'a-admin' && selectedUserForAudit.id !== currentUser?.id);

              return (
                <div className="space-y-5">
                  {/* Miniature Profile Header */}
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-1.5 flex-wrap justify-between">
                      <span className="bg-indigo-600 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                        Participant Detail Class
                      </span>
                      {isLeadActionsAvailable && (
                        <button
                          onClick={() => onStartEditProfile(selectedUserForAudit.name)}
                          className="text-slate-500 hover:text-brand dark:hover:text-amber-400 font-bold transition-all text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-950 font-mono"
                          title="Modify account role, names or registered subteams"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Modify Account</span>
                        </button>
                      )}
                    </div>
                    
                    <h2 className="text-lg font-black text-slate-900 dark:text-slate-50 mt-2 hover:underline">
                      {selectedUserForAudit.name}
                    </h2>
                    <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{selectedUserForAudit.schoolEmail}</p>

                    <div className="mt-3 flex flex-wrap gap-1.5 items-center select-none text-[10px] tracking-wide">
                      <span className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-350 font-bold border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded">
                        Subteam: {formatSubteamLabel(selectedUserForAudit.primarySubteam)}
                      </span>
                      {selectedUserForAudit.secondarySubteam !== 'None' && (
                        <span className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                          Sec: {formatSubteamLabel(selectedUserForAudit.secondarySubteam)}
                        </span>
                      )}
                      
                      {selectedUserForAudit.leadership && selectedUserForAudit.leadership !== 'None' && (
                        <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/10 px-2 py-0.5 rounded">
                          {selectedUserForAudit.leadership}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Level Progress Visual Bar */}
                  <div className="bg-slate-50 dark:bg-slate-955 p-3 rounded-lg border border-slate-150 dark:border-slate-800 select-none">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-black text-slate-800 dark:text-slate-300 uppercase tracking-tight">
                        {selectedGamified.stats.levelName}
                      </span>
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        LVL {selectedGamified.stats.level}
                      </strong>
                    </div>
                    
                    {/* Visual bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                      <div 
                        className="bg-indigo-650 h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${selectedGamified.stats.percentToNextLevel}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1.5">
                      <span>{selectedGamified.stats.xpIntoLevel} / {selectedGamified.stats.xpForNextLevel} XP</span>
                      <span>{selectedGamified.stats.percentToNextLevel}% PROGRESS TO LVL {selectedGamified.stats.level + 1}</span>
                    </div>
                  </div>

                  {/* ITEMISED XP AUDIT LOG FOR MENTORS */}
                  <div className="text-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-205 dark:border-slate-800 pb-1">
                      <h3 className="font-mono font-black uppercase text-slate-400 tracking-wider text-[10px]">
                        🔮 Itemized XP Source ledger
                      </h3>
                      <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        SUM: {auditData.totalCalculated} XP
                      </span>
                    </div>

                    {/* Source Breakdown items */}
                    <div className="max-h-[38vh] overflow-y-auto space-y-3 pr-1">
                      
                      {/* Section A: Lab Hours shifts */}
                      {auditData.hoursLogs.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono font-extrabold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-500" />
                            <span>Attendance Sheet Logouts ({auditData.hoursLogs.length})</span>
                          </span>
                          
                          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-805 overflow-hidden">
                            {auditData.hoursLogs.map(item => (
                              <div key={item.id} className="p-2 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-start text-[10.5px] leading-tight">
                                <div className="space-y-0.5 pr-2.5">
                                  <strong className="text-slate-650 dark:text-slate-300 font-mono text-[9px]">{item.date}</strong>
                                  <p className="text-slate-500 text-[10px] font-sans">{item.description}</p>
                                </div>
                                <span className="font-bold text-cyan-600 dark:text-cyan-400 shrink-0 font-mono">
                                  +{item.xp} XP
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section B: Engineering Logs Journals */}
                      {auditData.journalLogs.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono font-extrabold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-brand" />
                            <span>Engineering Journal Publishes ({auditData.journalLogs.length})</span>
                          </span>

                          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-805 overflow-hidden">
                            {auditData.journalLogs.map(item => (
                              <div key={item.id} className="p-2 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-1 text-[10.5px]">
                                <div className="flex justify-between items-start">
                                  <strong className="text-slate-800 dark:text-slate-250 font-bold line-clamp-1">{item.title}</strong>
                                  <span className="font-bold text-brand shrink-0 font-mono ml-2">
                                    +{item.xp} XP
                                  </span>
                                </div>
                                <p className="text-slate-400 text-[9px] font-mono">Published {item.date} • {formatSubteamLabel(item.subteam)}</p>
                                
                                {/* Bullet breakdown of the journal XP */}
                                <div className="pl-2 border-l border-brand/20 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9.5px] text-slate-500 font-mono bg-brand/5 p-1 rounded">
                                  <div>Base publish: <strong className="text-slate-700 dark:text-slate-350">+{item.baseXp} XP</strong></div>
                                  <div>Quality: <strong className="text-slate-700 dark:text-slate-350">+{item.qualityXp} XP</strong></div>
                                  <div>Lead review: <strong className={item.approvedXp > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 animate-pulse"}>
                                    {item.approvedXp > 0 ? `+${item.approvedXp} XP (Approved)` : 'Pending Approved'}
                                  </strong></div>
                                  <div>Images ({item.imgCount}): <strong className="text-slate-700 dark:text-slate-350">+{item.imgXp} XP</strong></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section C: Outreach initiatives */}
                      {auditData.outreachLogs.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono font-extrabold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Heart className="w-3 h-3 text-emerald-500fill-emerald-500" />
                            <span>Community Outreach Events ({auditData.outreachLogs.length})</span>
                          </span>

                          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-805 overflow-hidden">
                            {auditData.outreachLogs.map(item => (
                              <div key={item.id} className="p-2 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-start text-[10.5px]">
                                <div className="space-y-0.5 pr-2.5">
                                  <strong className="text-slate-650 dark:text-slate-300 font-mono text-[9px]">{item.date}</strong>
                                  <p className="text-slate-500 text-[10px] font-sans">{item.description}</p>
                                </div>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 font-mono">
                                  +50 XP
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section D: Manual XP Adjustments */}
                      {auditData.manualLogs.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono font-extrabold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            <span>Manual Mentor Adjustments ({auditData.manualLogs.length})</span>
                          </span>

                          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-855 overflow-hidden">
                            {auditData.manualLogs.map(item => (
                              <div key={item.id} className="p-2 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-start text-[10.5px]">
                                <div className="space-y-0.5 pr-2.5">
                                  <strong className="text-purple-600 dark:text-purple-400 font-mono text-[9px]">{item.date} • By Coach {item.admin}</strong>
                                  <p className="text-slate-500 text-[10px] font-sans">Reason: "{item.reason}"</p>
                                </div>
                                <span className={`font-black shrink-0 font-mono ${item.xp >= 0 ? "text-purple-600 dark:text-purple-400" : "text-rose-500"}`}>
                                  {item.xp >= 0 ? `+${item.xp}` : item.xp} XP
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fallback no contributions logged */}
                      {auditData.hoursLogs.length === 0 && auditData.journalLogs.length === 0 && auditData.outreachLogs.length === 0 && auditData.manualLogs.length === 0 && (
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded text-center text-slate-400 italic">
                          No dynamic points earned yet for this user session record.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mentor quick promotion tools as requested */}
                  {isLeadActionsAvailable && (
                    <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                        Mentor Security Controls
                      </span>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        <div className="flex items-center justify-between border border-slate-150 dark:border-slate-800 p-2 rounded bg-slate-50 dark:bg-slate-950 text-xs">
                          <span>Class Leadership Status:</span>
                          <select
                            value={selectedUserForAudit.leadership || 'None'}
                            onChange={(e) => onUpdateLeadership(selectedUserForAudit.id, e.target.value as any)}
                            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded p-1 font-sans font-bold text-[10px] text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 outline-none"
                          >
                            <option value="None">None</option>
                            <option value="Captain">Captain</option>
                            <option value="Subteam leader">Subteam leader</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })()
          )}
        </div>

      </div>
    </div>

    {/* ROSTER PDF EXPORT MENU MODAL */}
    <AnimatePresence>
      {isRosterExportModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md no-print"
          onClick={() => setIsRosterExportModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`relative w-full ${rosterExportShowPreview ? 'max-w-6xl' : 'max-w-md'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[85vh]`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-850 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-mono font-extrabold uppercase tracking-wider">
                  Export Roster Directory
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsRosterExportModalOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer border-0 outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-slate-100/40 dark:bg-slate-950/20">
              
              {/* CONFIGURATION COLUMN */}
              <div className="w-full md:w-[380px] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shrink-0 overflow-y-auto bg-white dark:bg-slate-900">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">
                      Paper Dimensions Format
                    </span>
                    <div className="grid grid-cols-3 gap-1 tracking-tight">
                      {(['letter', 'a4', 'legal'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setRosterExportPaperSize(sz)}
                          className={`py-1.5 px-1 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded text-[10px] font-bold border transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            rosterExportPaperSize === sz
                              ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-extrabold'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <span className="uppercase text-[9px] tracking-wide">{sz}</span>
                          <span className="text-[8px] font-mono font-normal block opacity-75">
                            {sz === 'letter' ? '8.5" × 11"' : sz === 'a4' ? '210×297mm' : '8.5" × 14"'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-805">
                    <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                      Select Display Elements
                    </span>
                    
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-350 select-none">
                      <input
                        type="checkbox"
                        checked={rosterExportShowCover}
                        onChange={(e) => setRosterExportShowCover(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                      />
                      <span>Include Cover Sheet</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-350 select-none">
                      <input
                        type="checkbox"
                        checked={rosterExportShowTOC}
                        onChange={(e) => setRosterExportShowTOC(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                      />
                      <span>Include Matrix Summary</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-350 select-none border-t border-slate-250 dark:border-slate-800 pt-2.5 mt-0.5">
                      <input
                        type="checkbox"
                        checked={rosterExportShowPreview}
                        onChange={(e) => setRosterExportShowPreview(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                      />
                      <span className="font-bold flex items-center gap-1">Live Page Preview Frame <Sparkles className="w-3 h-3 text-emerald-500" /></span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-105 dark:border-slate-800 flex justify-end gap-2 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsRosterExportModalOpen(false)}
                    className="px-3 py-1.5 rounded text-[11px] font-bold font-mono uppercase bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTimeout(() => { window.print(); }, 150); }}
                    className="px-4 py-1.5 rounded text-[11px] font-bold font-mono uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print PDF</span>
                  </button>
                </div>
              </div>

              {/* VISUAL PAGE PREVIEW */}
              {rosterExportShowPreview ? (
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 items-center max-h-[80vh] bg-slate-100 dark:bg-slate-950/40 select-none pb-12">
                  <div className="w-full max-w-lg flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 sticky top-0 bg-slate-100 dark:bg-slate-900/90 py-1.5 px-3 rounded-lg backdrop-blur-md shrink-0 z-10">
                    <div className="flex items-center gap-1.5">
                      <LayoutTemplate className="w-4 h-4 text-emerald-500 animate-[pulse_3s_infinite]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 font-mono">
                        Format: <span className="text-emerald-550 dark:text-emerald-400 underline uppercase">{rosterExportPaperSize}</span>
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest leading-none">
                      SCALED PREVIEW
                    </span>
                  </div>

                  {(() => {
                    const approvedAccounts = accounts.filter(a => a.status === 'Approved');
                    const totalPages = (rosterExportShowCover ? 1 : 0) + (rosterExportShowTOC ? 1 : 0) + approvedAccounts.length;
                    let currentPageNum = 1;
                    const paperAspect = rosterExportPaperSize === 'letter' ? '8.5 / 11' : rosterExportPaperSize === 'a4' ? '1 / 1.414' : '8.5 / 14';

                    return (
                      <div className="flex flex-col gap-8 w-full max-w-md items-center shadow-inner py-4">
                        {/* 1. COVER PAGE PREVIEW */}
                        {rosterExportShowCover && (() => {
                          const thisPage = currentPageNum++;
                          return (
                            <div className="flex flex-col items-center gap-1 w-full">
                              <span className="text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest">SHEET {thisPage} / {totalPages}</span>
                              <div className="bg-white border border-slate-350 shadow-md w-[360px] p-6 flex flex-col justify-between text-black overflow-hidden relative" style={{ aspectRatio: paperAspect }}>
                                <div className="border border-slate-900 flex-1 p-4 flex flex-col justify-between">
                                  <div className="text-center my-auto py-8">
                                    <h3 className="text-sm font-black uppercase font-display tracking-tight leading-none mb-1">
                                      Member Roster Directory
                                    </h3>
                                    <p className="text-[7px] font-mono uppercase tracking-widest mt-1">
                                      FIRST Tech Challenge Team #6567
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* 2. TOC SUMMARY PREVIEW */}
                        {rosterExportShowTOC && (() => {
                          const thisPage = currentPageNum++;
                          return (
                            <div className="flex flex-col items-center gap-1 w-full">
                              <span className="text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest">SHEET {thisPage} / {totalPages} (SUMMARY)</span>
                              <div className="bg-white border border-slate-350 shadow-md w-[360px] p-6 flex flex-col text-slate-850 overflow-hidden relative" style={{ aspectRatio: paperAspect }}>
                                <div className="border-b border-black pb-1 mb-2">
                                  <h4 className="text-[9px] font-black uppercase text-black">Member Summary Table</h4>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <div className="text-[6px] font-sans">
                                    {approvedAccounts.slice(0, 15).map(acc => (
                                      <div key={acc.id} className="border-b border-slate-200 py-1 font-mono text-slate-800 flex justify-between">
                                        <span>{acc.name}</span>
                                        <span>{acc.primarySubteam || 'No Subteam'}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* 3. ROSTER CARDS */}
                        {approvedAccounts.slice(0, 3).map(acc => {
                          const thisPage = currentPageNum++;
                          return (
                            <div key={acc.id} className="flex flex-col items-center gap-1 w-full">
                              <span className="text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest">SHEET {thisPage} / {totalPages} ({acc.name.split(' ')[0]})</span>
                              <div className="bg-white border border-slate-350 shadow-md w-[360px] p-6 flex flex-col text-black overflow-hidden relative" style={{ aspectRatio: paperAspect }}>
                                <div className="border-b-2 border-black pb-1 mb-2 flex justify-between">
                                  <span className="font-sans font-black uppercase text-[8px] truncate">{acc.name}</span>
                                  <span className="font-mono text-[7px]">{acc.role}</span>
                                </div>
                                <div className="text-[7px]">Profile statistics overview...</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <LayoutTemplate className="w-12 h-12 text-slate-300 dark:text-slate-800 mb-3" />
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Preview Closed</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* PRINT ONLY RENDER (Visible to browser during print operation) */}
    {isRosterExportModalOpen && (
      <div className="print-only bg-white text-black p-0 m-0 z-[200] relative font-sans">
        
        {rosterExportShowCover && (
          <div 
            className="flex flex-col justify-between p-12 bg-white text-black m-0 relative border-4 border-double border-slate-950 mb-12"
            style={{ pageBreakAfter: 'always', minHeight: rosterExportPaperSize === 'legal' ? '300mm' : '240mm' }}
          >
            <div className="flex flex-col items-center justify-center flex-1 text-center my-auto min-h-[170mm]">
              <div className="w-24 h-24 mb-6 border-4 border-slate-950 flex items-center justify-center rounded-full mx-auto">
                <span className="font-extrabold text-2xl tracking-tighter">RR</span>
              </div>
              <h1 className="text-4xl font-extrabold uppercase font-display tracking-tight text-slate-955 mb-2">
                Team Member Directory
              </h1>
              <p className="text-xs font-mono uppercase tracking-widest text-slate-600 mb-8">
                FTC Security & Credential Logs
              </p>
              
              <div className="w-32 h-1 bg-slate-950 my-4 mx-auto"></div>
              
              <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                FIRST Tech Challenge Team #6567
              </p>
            </div>
            <div className="mt-auto border-t-2 border-slate-950 pt-6">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-700">
                <div>
                  <p><strong>DOCUMENT TYPE:</strong> Secure Team Roster</p>
                  <p><strong>GENERATED ON:</strong> {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p><strong>APPROVED ACCOUNTS:</strong> {accounts.filter(a => a.status === 'Approved').length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {rosterExportShowTOC && (
          <div 
            className="flex flex-col p-12 bg-white text-black min-h-screen relative mb-12"
            style={{ pageBreakAfter: 'always', minHeight: rosterExportPaperSize === 'legal' ? '300mm' : '240mm' }}
          >
            <div className="border-b-4 border-slate-950 pb-4 mb-6 flex flex-col items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider text-slate-955">
                  Registry Summary
                </h2>
                <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-1">
                  Team Members Status Matrix
                </p>
              </div>
            </div>
            <table className="w-full text-left text-[11px] font-sans border-collapse mt-4">
              <thead>
                <tr className="border-b-2 border-slate-955 text-[10px] uppercase font-mono text-slate-700 font-bold bg-slate-100">
                  <th className="py-2.5 px-2">Name</th>
                  <th className="py-2.5 px-2">Role</th>
                  <th className="py-2.5 px-2">Leadership</th>
                  <th className="py-2.5 px-2 text-right">Subteams</th>
                  <th className="py-2.5 px-2 text-right">Level</th>
                  <th className="py-2.5 px-2 text-right">Hours</th>
                  <th className="py-2.5 px-2 text-right">Journals</th>
                </tr>
              </thead>
              <tbody>
                {accounts.filter(a => a.status === 'Approved').map(acc => {
                  const g = computeUserGamification(acc, entries, timeEntries, kanbanTasks, outreachEvents, xpAdjustments);
                  return (
                    <tr key={acc.id} className="border-b border-slate-300">
                      <td className="py-2 px-2 font-bold">{acc.name}</td>
                      <td className="py-2 px-2 font-mono text-[9px] uppercase"><span className="bg-slate-100 border border-slate-300 px-1 py-0.5 rounded">{acc.role}</span></td>
                      <td className="py-2 px-2 font-mono text-[9px] uppercase"><span className={`px-1 py-0.5 rounded border ${acc.leadership === 'Captain' || acc.leadership === 'Subteam leader' ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>{acc.leadership || 'None'}</span></td>
                      <td className="py-2 px-2 text-[10px] text-right text-slate-600">{acc.primarySubteam || 'N/A'}</td>
                      <td className="py-2 px-2 text-[10px] text-right font-bold text-slate-700">{g.stats.level}</td>
                      <td className="py-2 px-2 text-[10px] text-right text-slate-600">{g.stats.totalHours.toFixed(1)}</td>
                      <td className="py-2 px-2 text-[10px] text-right text-slate-600">{g.stats.totalJournals}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {accounts.filter(a => a.status === 'Approved').map((acc, index, array) => {
                          const g = computeUserGamification(acc, entries, timeEntries, kanbanTasks, outreachEvents, xpAdjustments);
          const audit = getUserXpAudit(acc);
          const journalXp = audit.journalLogs.reduce((sum, item) => sum + item.xp, 0);
          const timeXp = audit.hoursLogs.reduce((sum, item) => sum + item.xp, 0);
          const outreachXp = audit.outreachLogs.reduce((sum, item) => sum + item.xp, 0);
          const manualXp = audit.manualLogs.reduce((sum, item) => sum + item.xp, 0);
          const kanbanXp = 0; // Kanban tasks no longer award XP in current system

          return (
            <div 
              key={acc.id}
              className="flex flex-col p-12 bg-white text-black min-h-screen relative mb-12"
              style={{ pageBreakAfter: index < array.length - 1 ? 'always' : 'auto', minHeight: rosterExportPaperSize === 'legal' ? '300mm' : '240mm' }}
            >
              <div className="border-b-4 border-slate-950 pb-4 mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-wider text-slate-955">
                    {acc.name}
                  </h2>
                  <div className="flex gap-2 mt-2 font-mono text-xs text-slate-600 uppercase">
                    <span className="font-bold">{acc.role}</span>
                    <span>•</span>
                    <span>{acc.schoolEmail}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="bg-slate-950 text-white px-3 py-1 font-bold font-mono text-xs inline-block">
                    LVL {g.stats.level}: {g.stats.levelName}
                  </div>
                  <div className="text-[10px] font-mono tracking-widest font-extrabold uppercase mt-1 text-slate-600 border border-slate-300 px-1.5 py-0.5 rounded">
                    {g.stats.xp} XP 
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-mono text-[10px] font-bold text-slate-400 mb-2 border-b border-slate-200 pb-1 uppercase">Profile Config</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Primary Discipline:</span>
                      <span className="font-mono">{acc.primarySubteam || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Secondary Focus:</span>
                      <span className="font-mono">{acc.secondarySubteam || 'None'}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
                      <span className="text-slate-500 font-bold text-[10px]">Leader Status:</span>
                      <span className="font-mono text-[10px] bg-slate-100 px-1 text-slate-600 rounded">
                        {acc.leadership || 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
                      <span className="text-slate-500 font-bold text-[10px]">Security Clearance:</span>
                      <span className="font-mono text-[10px] bg-slate-100 px-1 text-slate-600 rounded">
                        {acc.leadership === 'Captain' ? 'Tier 1 : CPT' : acc.leadership === 'Subteam leader' ? 'Tier 2 : LEAD' : 'Tier 3 : OPR'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-mono text-[10px] font-bold text-slate-400 mb-2 border-b border-slate-200 pb-1 uppercase">Metric Summary & XP</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700 font-bold">Journals Published ({g.stats.totalJournals}):</span>
                      <span className="font-mono">{journalXp} XP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-700 font-bold">Time Logged ({g.stats.totalHours.toFixed(1)}h):</span>
                      <span className="font-mono">{timeXp} XP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700 font-bold">Kanban Tasks Resolved:</span>
                      <span className="font-mono">{kanbanXp} XP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-rose-700 font-bold">Community Outreach ({audit.outreachLogs.length}):</span>
                      <span className="font-mono">{outreachXp} XP</span>
                    </div>
                    {manualXp !== 0 && (
                      <div className="flex justify-between items-center border-t border-slate-200 pt-1 mt-1">
                        <span className="text-indigo-700 font-bold">Direct Adjustments:</span>
                        <span className="font-mono">{manualXp} XP</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 border border-slate-200 bg-slate-50 rounded italic text-[11px] text-slate-500">
                End of generated intelligence log for user {acc.id}.
              </div>
            </div>
          );
        })}
      </div>
    )}
    </>
  );
}

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
  Calendar
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
  const [selectedUserForAudit, setSelectedUserForAudit] = useState<UserAccount | null>(() => {
    // Default to first user if available
    return accounts.find(a => a.status === 'Approved') || null;
  });

  const isMentorOrCaptain = currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain';

  // Filters
  const filteredRoster = accounts.filter(acc => {
    if (acc.status === 'Pending') return false; // shown in separate pending requests section

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
  const pendingRequests = accounts.filter(acc => acc.status === 'Pending');

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

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors animate-fade-in p-4 md:p-6" id="member-approvals-directory-viewport">
      
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
        
        <div>
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
                <span>Pending Access Approval Requests ({pendingRequests.length})</span>
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
                      className="bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 dark:border-amber-900/15 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 dark:text-slate-50 text-sm">{acc.name}</span>
                          <span className="bg-amber-100 dark:bg-amber-955/40 text-amber-800 dark:text-amber-305 font-mono text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                            Pending Approval
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
                        <button
                          onClick={() => onRejectUser(acc.id)}
                          className="bg-rose-600 hover:bg-rose-505 text-white font-extrabold p-2 rounded-md text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border-0 shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
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
                  <option value="Control/Automation">Control Loop &amp; Code</option>
                  <option value="Outreach/Inspire">Inspire &amp; Outreach</option>
                  <option value="Strategy/Scouting">Strategy &amp; Scouting</option>
                  <option value="FLL Mentorship">FLL Mentoring Core</option>
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
  );
}

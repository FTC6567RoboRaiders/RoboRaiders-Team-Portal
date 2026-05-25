import React, { useState } from 'react';
import { 
  BookOpen, 
  Wrench, 
  Award, 
  Clock, 
  FileUp, 
  Globe, 
  CheckCircle, 
  Sparkles, 
  AlertTriangle, 
  Layers, 
  Compass, 
  FileCode, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Calendar, 
  Briefcase, 
  Users, 
  Database, 
  ShieldCheck, 
  Settings,
  Lock,
  ChevronRight,
  Trophy,
  FileDown
} from 'lucide-react';
import { UserAccount, JournalEntry, TimeEntry } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { computeUserGamification } from '../utils/gamification';
import { jsPDF } from 'jspdf';
import { SUBTEAM_GUILDS, getSubteamStatsAndRank } from '../data/subteamRanks';

interface ArenaPortalProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  entries: JournalEntry[];
  timeEntries: TimeEntry[];
  onInspectPlayer: (account: UserAccount) => void;
}

// Local lookup helper to prevent circular dependency imports with App.tsx
const getGamifiedIconLocal = (iconName: string, sizeClass = "w-4 h-4") => {
  switch (iconName) {
    case 'Wrench': return <Wrench className={`${sizeClass} text-slate-700 dark:text-slate-350`} />;
    case 'Cpu': return <Settings className={`${sizeClass} text-cyan-600 dark:text-cyan-400`} />; // Fallback to Settings
    case 'BookOpen': return <BookOpen className={`${sizeClass} text-indigo-650 dark:text-indigo-400`} />;
    case 'Clock': return <Clock className={`${sizeClass} text-amber-600 dark:text-amber-400`} />;
    case 'FileUp': return <FileUp className={`${sizeClass} text-emerald-600 dark:text-emerald-400`} />;
    case 'Globe': return <Globe className={`${sizeClass} text-purple-600 dark:text-purple-400`} />;
    case 'CheckCircle': return <CheckCircle className={`${sizeClass} text-rose-600 dark:text-rose-400`} />;
    case 'Sparkles': return <Sparkles className={`${sizeClass} text-yellow-500`} />;
    case 'AlertTriangle': return <AlertTriangle className={`${sizeClass} text-orange-500`} />;
    case 'Layers': return <Layers className={`${sizeClass} text-blue-500`} />;
    case 'Award': return <Award className={`${sizeClass} text-pink-550`} />;
    case 'Compass': return <Compass className={`${sizeClass} text-sky-500`} />;
    case 'FileCode': return <FileCode className={`${sizeClass} text-indigo-550`} />;
    case 'CheckCircle2': return <CheckCircle2 className={`${sizeClass} text-teal-500`} />;
    case 'Sun': return <Sun className={`${sizeClass} text-yellow-500`} />;
    case 'Moon': return <Moon className={`${sizeClass} text-sky-700 dark:text-sky-300`} />;
    case 'Calendar': return <Calendar className={`${sizeClass} text-cyan-500`} />;
    case 'Briefcase': return <Briefcase className={`${sizeClass} text-amber-750`} />;
    case 'Users': return <Users className={`${sizeClass} text-fuchsia-600`} />;
    case 'Database': return <Database className={`${sizeClass} text-zinc-550`} />;
    case 'ShieldCheck': return <ShieldCheck className={`${sizeClass} text-emerald-500`} />;
    case 'Settings': return <Settings className={`${sizeClass} text-rose-500`} />;
    default: return <Award className={sizeClass} />;
  }
};

export default function ArenaPortal({
  currentUser,
  accounts,
  entries,
  timeEntries,
  onInspectPlayer
}: ArenaPortalProps) {
  const [gamificationTab, setGamificationTab] = useState<'profile' | 'subteamRanks' | 'badges' | 'quests' | 'leaderboard'>('profile');
  const [activeGuildTab, setActiveGuildTab] = useState<string>('');

  const gameResult = computeUserGamification(currentUser, entries, timeEntries);
  const { stats, badges, quests } = gameResult;

  const activeLeaderboard = accounts
    .filter(acc => 
      acc.status === 'Approved' && 
      !acc.name.toLowerCase().includes('test') && 
      !acc.name.toLowerCase().includes('admin') && 
      !acc.schoolEmail.toLowerCase().includes('test') && 
      !acc.schoolEmail.toLowerCase().includes('admin') &&
      !acc.schoolEmail.toLowerCase().includes('school.edu')
    )
    .map(acc => {
      const data = computeUserGamification(acc, entries, timeEntries);
      return {
        account: acc,
        stats: data.stats,
        badges: data.badges,
        quests: data.quests,
      };
    })
    .sort((a, b) => b.stats.xp - a.stats.xp);

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Dark background/accent colors matching the Roboraiders slate/red theme
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, 210, 35, 'F');

    // Header Typography
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text("ROBORAIDERS ARENA CHAMPIONSHIP", 15, 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(241, 245, 249); // Slate-100
    doc.text("OFFICIAL TEAM STANDINGS & LEADERBOARD SCOREBOARD", 15, 24);
    
    const dateStr = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    doc.text(`Generated: ${dateStr}`, 145, 18);
    
    // Outer frame & main table header
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    
    // Headers
    // Rank, Name, Subteam, Badges, XP / Level
    const startY = 48;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, startY - 6, 182, 8, 'F');
    
    doc.text("RANK", 16, startY - 1);
    doc.text("ROBOTICS SPECIALIST", 32, startY - 1);
    doc.text("SUBTEAM DECLARED", 85, startY - 1);
    doc.text("BADGES", 135, startY - 1);
    doc.text("XP / LEVEL", 175, startY - 1);

    // Bottom line for header
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(14, startY + 2, 196, startY + 2);

    let currentY = startY + 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    activeLeaderboard.forEach((player, index) => {
      // Alternate row backgrounds
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, currentY - 5, 182, 7, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`#${index + 1}`, 18, currentY);
      
      doc.setFont('helvetica', 'normal');
      // Limit name to avoid overflow
      const nameStr = player.account.name.length > 25 
        ? player.account.name.substring(0, 22) + "..." 
        : player.account.name;
      doc.text(nameStr, 32, currentY);
      
      const subteamStr = player.account.primarySubteam || "N/A";
      const subteamDisplay = subteamStr.length > 25 ? subteamStr.substring(0, 22) + "..." : subteamStr;
      doc.text(subteamDisplay, 85, currentY);
      
      const badgeCount = player.badges.filter((b: any) => b.unlocked).length;
      doc.text(`${badgeCount} unlocked`, 135, currentY);
      
      const xpStr = `${player.stats.xp.toLocaleString()} XP`;
      doc.text(xpStr, 175, currentY);

      // separator line
      doc.setDrawColor(241, 245, 249);
      doc.line(14, currentY + 2, 196, currentY + 2);
      
      currentY += 8;

      // Page overflow safety
      if (currentY > 280) {
        doc.addPage();
        currentY = 20;
      }
    });

    // Footer note
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("This document is an official export of the Roboraiders Championship Arena Portal. All recorded XP points are subject to review.", 14, 287);

    doc.save(`roboraiders_leaderboard_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div 
      className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-6 shadow-md flex flex-col gap-6 relative overflow-hidden mt-8" 
      id="roboraiders-championship-portal"
    >
      <div className="absolute top-0 right-0 transform translate-x-16 -translate-y-16 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-50 dark:bg-cyan-950/40 p-2 rounded-xl text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900">
            <Trophy className="w-5 h-5 text-cyan-650 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-extrabold uppercase font-display text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span>RoboRaiders Cyber-Championship Lounge</span>
            </h2>
            <p className="text-[11px] text-slate-505 dark:text-slate-400 font-sans mt-0.5">
              Accumulate XP and ranks by logging laboratory sessions, completing peer reviews, and tracking subteam contributions.
            </p>
          </div>
        </div>

        {/* Improved Arena Tabs Navigation */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/80 dark:border-slate-800/60 font-mono text-[10px] uppercase font-bold shrink-0">
          {(['profile', 'subteamRanks', 'badges', 'quests', 'leaderboard'] as const).map(tab => {
            const active = gamificationTab === tab;
            const labelMap = {
              profile: 'My Rank',
              subteamRanks: 'Guild Ranks',
              badges: 'Achievements',
              quests: 'Active Quests',
              leaderboard: 'Leaderboard'
            };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setGamificationTab(tab);
                }}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                  active 
                    ? 'bg-cyan-600 text-white shadow-sm font-extrabold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Arena Tab Screens */}
      <div className="relative min-h-[220px]">
        <AnimatePresence mode="wait">
          
          {/* SCREEN 1: PROFILE SUMMARY */}
          {gamificationTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
            >
              {/* Radial Progress Plate */}
              <div className="md:col-span-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-955/40 border border-slate-200/60 dark:border-slate-800/50 rounded-xl p-6 text-center relative overflow-hidden group min-h-[300px] md:min-h-full py-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-555 to-indigo-600"></div>
                <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">
                  Rank Class
                </span>
                <div className="relative mt-4 flex items-center justify-center">
                  <Award className="w-24 h-24 text-cyan-650 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center -translate-y-2.5 font-mono font-black text-2xl sm:text-3xl text-slate-900 dark:text-slate-50">
                    {stats.level}
                  </div>
                </div>
                <h3 className="text-xs font-mono font-black uppercase text-slate-900 dark:text-slate-50 mt-4 tracking-wider">
                  Level {stats.level}
                </h3>
                <h4 className="text-sm sm:text-[15px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-display leading-tight mt-1 animate-pulse px-3">
                  {stats.levelName}
                </h4>
                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                  {stats.xp} Accumulated XP
                </p>
              </div>

              {/* Linear Progression Slide & Cumulative Indices */}
              <div className="md:col-span-8 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-mono uppercase font-black text-slate-455 tracking-wider">
                      Experience Progression Matrix
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      <strong>{stats.xpIntoLevel}</strong> / {stats.xpForNextLevel} XP to Level {stats.level + 1}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full overflow-hidden p-0.5 relative">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full transition-all duration-500" 
                      style={{ width: `${stats.percentToNextLevel}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-slate-600 dark:text-slate-305 font-bold">
                      {stats.percentToNextLevel}%
                    </div>
                  </div>
                </div>

                {/* Core Cumulative Scoreboard Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
                  <div className="bg-slate-50/70 dark:bg-slate-955/20 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/40 text-center">
                    <Wrench className="w-4 h-4 mx-auto text-slate-500 mb-1" />
                    <div className="text-[10px] font-mono uppercase text-slate-400 leading-none">Workshop Hours</div>
                    <div className="text-sm font-black font-mono text-slate-850 dark:text-slate-105 mt-1">{stats.totalHours.toFixed(1)}h</div>
                  </div>
                  <div className="bg-slate-50/70 dark:bg-slate-955/20 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/40 text-center">
                    <BookOpen className="w-4 h-4 mx-auto text-cyan-650/85 dark:text-cyan-400 mb-1" />
                    <div className="text-[10px] font-mono uppercase text-slate-400 leading-none">Journal Logs</div>
                    <div className="text-sm font-black font-mono text-slate-850 dark:text-slate-105 mt-1">{stats.totalJournals} Logs</div>
                  </div>
                  <div className="bg-slate-50/70 dark:bg-slate-955/20 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/40 text-center">
                    <Award className="w-4 h-4 mx-auto text-pink-500/85 mb-1" />
                    <div className="text-[10px] font-mono uppercase text-slate-400 leading-none">Trophy Badges</div>
                    <div className="text-sm font-black font-mono text-slate-850 dark:text-slate-105 mt-1">{stats.badgesUnlocked} Unlocked</div>
                  </div>
                  <div className="bg-slate-50/70 dark:bg-slate-955/20 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/40 text-center">
                    <CheckCircle className="w-4 h-4 mx-auto text-rose-500/85 mb-1" />
                    <div className="text-[10px] font-mono uppercase text-slate-400 leading-none">Validation Ratio</div>
                    <div className="text-sm font-black font-mono text-slate-850 dark:text-slate-105 mt-1">
                      {stats.totalJournals > 0 
                        ? `${Math.round((entries.filter(e => e.status === 'Approved' && (e.author.includes(currentUser.name) || e.author.includes(currentUser.schoolEmail))).length / stats.totalJournals) * 100)}%`
                        : '100%'}
                    </div>
                  </div>
                </div>

                <p className="text-[10px] font-mono text-slate-400 leading-normal bg-cyan-50/30 dark:bg-cyan-955/10 p-2.5 rounded border border-cyan-100/50 dark:border-cyan-900/20">
                  ⚡ <strong>Note:</strong> Approved journal entries receive additional XP! Make sure to write comprehensive, precise details for your logs.
                </p>

                {/* Subteam Guild Alignment Badge */}
                {(() => {
                  const isMentor = currentUser.role === 'mentor_captain' || currentUser.role === 'mentor';
                  let userGuildId: string = currentUser.primarySubteam;
                  if (isMentor) {
                    userGuildId = 'Mentoring';
                  } else {
                    if (userGuildId === 'None' || userGuildId === 'Mentor' || (userGuildId as string) === 'Lead/Captain' || (userGuildId as string) === 'Mentoring') {
                      userGuildId = 'Design/Build/Fabrication';
                    }
                  }
                  const guildHours = isMentor ? stats.totalHours : (stats.subteamHours[userGuildId] || 0);
                  const email = currentUser.schoolEmail.toLowerCase();
                  const guildJournals = isMentor 
                    ? entries.filter(e => 
                        e.author.toLowerCase().includes(email) || 
                        e.author.toLowerCase().includes(currentUser.name.toLowerCase())
                      ).length 
                    : entries.filter(e => 
                        (e.author.toLowerCase().includes(email) || 
                         e.author.toLowerCase().includes(currentUser.name.toLowerCase())) &&
                        e.subteam === userGuildId
                      ).length;

                  const subRankData = getSubteamStatsAndRank(userGuildId, guildHours, guildJournals, currentUser.role);
                  const guildObj = SUBTEAM_GUILDS.find(g => g.id === userGuildId) || SUBTEAM_GUILDS[0];

                  return (
                    <div className="bg-slate-50 dark:bg-slate-955/35 border border-slate-200/60 dark:border-slate-805 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden group mt-3">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-cyan-500/5 to-transparent pointer-events-none"></div>
                      
                      {/* Icon frame */}
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/85 dark:border-slate-800 shadow-sm shrink-0 flex items-center justify-center">
                        {getGamifiedIconLocal(guildObj.icon, "w-10 h-10")}
                      </div>

                      <div className="flex-1 flex flex-col gap-1.5 text-center sm:text-left w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full">
                          <div>
                            <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest leading-none">
                              My Guild / Division Alignment
                            </span>
                            <h3 className="text-sm font-black text-slate-850 dark:text-slate-105 uppercase tracking-wide flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                              <span>{guildObj.name}</span>
                            </h3>
                          </div>
                          <span className="px-2 py-0.5 bg-cyan-50 dark:bg-cyan-955/40 border border-cyan-200/55 dark:border-cyan-800 text-[10px] font-mono font-black rounded text-cyan-755 dark:text-cyan-400 self-center uppercase">
                            Rank {subRankData.currentRank.rank}/{guildObj.ranks.length}
                          </span>
                        </div>

                        <div className="mt-1">
                          <h4 className="text-md font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-wide">
                            🏆 {subRankData.currentRank.title}
                          </h4>
                          <p className="text-[11px] text-slate-505 dark:text-slate-450 italic font-medium leading-relaxed mt-1">
                            "{subRankData.currentRank.explanation}"
                          </p>
                        </div>

                        {/* Guild Progress bar */}
                        <div className="mt-2.5">
                          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mb-1">
                            <span>Division XP: <strong>{subRankData.points} XP</strong></span>
                            {subRankData.nextRank ? (
                              <span>Next Link: <strong>{subRankData.nextRank.title}</strong> in {subRankData.totalNeededForNext} XP</span>
                            ) : (
                              <span className="text-amber-500 animate-pulse font-bold">✨ SECRET ZENITH UNLOCKED</span>
                            )}
                          </div>
                          <div className="w-full h-2 bg-slate-205 dark:bg-slate-900 rounded-full overflow-hidden relative">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                subRankData.rankIndex >= guildObj.ranks.length - 1 
                                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 animate-pulse' 
                                  : 'bg-indigo-650'
                              }`}
                              style={{ width: `${subRankData.percentToNext}%` }}
                            ></div>
                          </div>
                          <p className="text-[8.5px] font-mono text-slate-400 mt-1.5">
                            💡 Guild XP: <strong>+5 XP</strong> per lab hour · <strong>+12 XP</strong> per journal writeup logged in {guildObj.codename}.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {/* SCREEN 1B: GUILD RANKS */}
          {gamificationTab === 'subteamRanks' && (
            <motion.div
              key="subteamRanks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-5 text-xs font-sans w-full"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-850 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <span>Guild & Mentor Career Trees</span>
                  <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-955/40 text-indigo-700 dark:text-indigo-300 font-mono text-[9px] font-black rounded uppercase">
                    5 Specialized Divisions
                  </span>
                </h3>
                <p className="text-[11px] text-slate-452 dark:text-slate-400 mt-1 leading-normal">
                  Advance through hierarchical ranks in student or mentor divisions. Earn Guild XP via <strong>laboratory hours (+5 XP/hr)</strong> and <strong>high-fidelity journal entries (+12 XP/log)</strong>.
                </p>
              </div>

              {/* Guild selector row */}
              {(() => {
                const isMentorUser = currentUser.role === 'mentor_captain' || currentUser.role === 'mentor';
                const defaultGuildId: string = isMentorUser ? 'Mentoring' : (currentUser.primarySubteam === 'None' || currentUser.primarySubteam === 'Mentor' || (currentUser.primarySubteam as string) === 'Lead/Captain' || (currentUser.primarySubteam as string) === 'Mentoring' ? 'Design/Build/Fabrication' : currentUser.primarySubteam);
                const currentTab = activeGuildTab || defaultGuildId;
                
                return (
                  <div className="flex flex-col gap-4 w-full">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
                      {SUBTEAM_GUILDS.map(g => {
                        const isActive = currentTab === g.id;
                        
                        // Calculate hours and logs written for this specific guild
                        const email = currentUser.schoolEmail.toLowerCase();
                        const isM = g.id === 'Mentoring';
                        const guildHours = isM ? stats.totalHours : (stats.subteamHours[g.id] || 0);
                        const guildJournals = isM 
                          ? entries.filter(e => 
                              e.author.toLowerCase().includes(email) || 
                              e.author.toLowerCase().includes(currentUser.name.toLowerCase())
                            ).length
                          : entries.filter(e => 
                              (e.author.toLowerCase().includes(email) || 
                               e.author.toLowerCase().includes(currentUser.name.toLowerCase())) &&
                              e.subteam === g.id
                            ).length;
                        
                        const subStats = getSubteamStatsAndRank(g.id, guildHours, guildJournals, currentUser.role);
                        
                        let activeColor = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350";
                        if (isActive) {
                          if (g.color === 'slate') activeColor = "border-slate-655 dark:border-slate-500 bg-slate-55 dark:bg-slate-850 ring-2 ring-slate-500/10 text-slate-900 dark:text-slate-50";
                          if (g.color === 'cyan') activeColor = "border-cyan-555 dark:border-cyan-500 bg-cyan-55/[0.1] dark:bg-cyan-955/20 ring-2 ring-cyan-500/10 text-cyan-755 dark:text-cyan-400";
                          if (g.color === 'emerald') activeColor = "border-emerald-555 dark:border-emerald-500 bg-emerald-55/[0.1] dark:bg-emerald-955/20 ring-2 ring-emerald-500/10 text-emerald-755 dark:text-emerald-400";
                          if (g.color === 'amber') activeColor = "border-amber-555 dark:border-amber-500 bg-amber-55/[0.1] dark:bg-amber-955/20 ring-2 ring-amber-500/10 text-amber-755 dark:text-amber-400";
                          if (g.color === 'rose') activeColor = "border-rose-555 dark:border-rose-500 bg-rose-55/[0.1] dark:bg-rose-955/20 ring-2 ring-rose-500/10 text-rose-755 dark:text-rose-400";
                        }

                        const isLocked = isM ? !isMentorUser : isMentorUser;

                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => {
                              setActiveGuildTab(g.id);
                            }}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1.5 relative overflow-hidden group ${activeColor}`}
                          >
                            <div className="flex items-center gap-2">
                              {getGamifiedIconLocal(g.icon, "w-4 h-4 text-slate-500 shrink-0")}
                              <span className="font-bold tracking-tight text-[11px] uppercase shrink-0 truncate max-w-[120px]">{g.name.split(' (')[0]}</span>
                            </div>
                            <div className="flex flex-col">
                              {isLocked ? (
                                <>
                                  <span className="text-[10px] font-mono text-rose-555 font-extrabold flex items-center gap-1">🔒 Locked</span>
                                  <span className="text-[9px] font-mono text-slate-400 mt-0.5">Role Restricted</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-[10px] font-mono text-slate-400 font-extrabold truncate">Rank {subStats.currentRank.rank}: {subStats.currentRank.title}</span>
                                  <span className="text-[9px] font-mono text-slate-550 mt-0.5">{subStats.points} XP accumulated</span>
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Guild Detail Panel */}
                    {(() => {
                      const activeGuild = SUBTEAM_GUILDS.find(g => g.id === currentTab) || SUBTEAM_GUILDS[0];
                      const email = currentUser.schoolEmail.toLowerCase();
                      const isM = activeGuild.id === 'Mentoring';
                      const guildHours = isM ? stats.totalHours : (stats.subteamHours[activeGuild.id] || 0);
                      const guildJournals = isM 
                        ? entries.filter(e => 
                            e.author.toLowerCase().includes(email) || 
                            e.author.toLowerCase().includes(currentUser.name.toLowerCase())
                          ).length
                        : entries.filter(e => 
                            (e.author.toLowerCase().includes(email) || 
                             e.author.toLowerCase().includes(currentUser.name.toLowerCase())) &&
                            e.subteam === activeGuild.id
                          ).length;
                      
                      const subStats = getSubteamStatsAndRank(activeGuild.id, guildHours, guildJournals, currentUser.role);
                      const isLocked = activeGuild.id === 'Mentoring' ? !isMentorUser : isMentorUser;
                      
                      return (
                        <div className="bg-slate-50 dark:bg-slate-955/20 border border-slate-201 dark:border-slate-800 rounded-xl p-5 flex flex-col gap-4 w-full">
                          {isLocked && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-755 dark:text-rose-455 p-3.5 rounded-lg text-xs flex items-center gap-2.5 font-medium leading-normal">
                              <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0" />
                              <div>
                                <strong>Division Rank Locked:</strong> This career ladder is restricted.
                                {isMentorUser 
                                  ? " As a Mentor, you can only progress in the Mentoring / Advisory Board division."
                                  : " Only Mentors can earn Mentoring career ranks. Student members are eligible for Build, Programming, Business & Media, and Outreach divisions."
                                }
                              </div>
                            </div>
                          )}
                          {/* Active Guild Header Card */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/40 dark:border-slate-800/60 pb-3 w-full">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg shadow-sm">
                                {getGamifiedIconLocal(activeGuild.icon, "w-6 h-6")}
                              </div>
                              <div>
                                <h4 className="text-[9px] font-black uppercase text-slate-455 tracking-wider">Active Division Selected</h4>
                                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-105 uppercase">{activeGuild.name}</h3>
                              </div>
                            </div>
                            
                            <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
                              <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">Division Progress</span>
                              <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200">
                                {guildHours.toFixed(1)}h logged · {guildJournals} journal logs
                              </span>
                            </div>
                          </div>

                          {/* Progressive Timeline of Ranks */}
                          <div className="flex flex-col gap-3 w-full">
                            <span className="text-[10px] font-mono uppercase font-black text-slate-400 tracking-wider mb-1">
                              Division Promotion Ladder (1 to {activeGuild.ranks.length})
                            </span>
                            
                            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                              {activeGuild.ranks.map((r, i) => {
                                const isUnlocked = subStats.rankIndex >= i;
                                const isSecretType = activeGuild.id !== 'Mentoring' && r.rank === 11;
                                
                                // Handle masking for locked secret level
                                const displayedTitle = (!isUnlocked && isSecretType) ? "??? [Classified Cryptic Tier]" : r.title;
                                const displayedDesc = (!isUnlocked && isSecretType) 
                                  ? "This legendary 11th rank holds custom classified properties. Amass 10000+ XP in this division to unlock the secret title and inspect this description!" 
                                  : r.explanation;

                                // Points threshold for this rank
                                const thresholds = activeGuild.id === 'Mentoring'
                                  ? [0, 100, 300, 600, 1000, 1600, 2500, 3800, 5500, 7500, 10000, 11000, 12100, 13300, 14600, 16000, 17500, 19100, 20800, 22600, 24500, 26500, 28600, 30800, 33200]
                                  : [0, 100, 300, 600, 1000, 1600, 2500, 3800, 5500, 7500, 10000];
                                const reqPoints = thresholds[i] !== undefined ? thresholds[i] : 0;

                                return (
                                  <div 
                                    key={r.rank}
                                    className={`p-3 rounded-lg border transition-all flex items-start gap-4 hover:bg-white dark:hover:bg-slate-905/40 ${
                                      isUnlocked 
                                        ? 'bg-emerald-500/[0.02] border-emerald-500/25 dark:border-emerald-900/40 shadow-sm' 
                                        : isSecretType 
                                          ? 'bg-amber-500/[0.01] border-dashed border-amber-300/30'
                                          : 'bg-transparent border-slate-200/50 dark:border-slate-800/40 opacity-75'
                                    }`}
                                  >
                                    {/* Rank Badge Indicator */}
                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                                      isUnlocked 
                                        ? 'bg-emerald-100 border-emerald-300 text-emerald-855 dark:bg-emerald-950 dark:border-emerald-905 dark:text-emerald-400' 
                                        : isSecretType
                                          ? 'bg-amber-100/40 border-amber-300 text-amber-700 dark:bg-amber-955/40 dark:border-amber-900 dark:text-amber-400'
                                          : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                                    }`}>
                                      {isUnlocked ? "✓" : r.rank}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <h3 className={`text-xs font-black uppercase tracking-wide truncate ${isUnlocked ? 'text-slate-855 dark:text-slate-100 font-extrabold' : 'text-slate-500 dark:text-slate-400'}`}>
                                          {isUnlocked ? "🏅 " : ""}{displayedTitle}
                                        </h3>
                                        <span className={`text-[9px] font-mono px-1.5 py-0.2 select-none shrink-0 uppercase rounded-sm border ${
                                          isUnlocked 
                                            ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-855 text-emerald-755 dark:text-emerald-400' 
                                            : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-550'
                                        }`}>
                                          Requires {reqPoints} XP
                                        </span>
                                      </div>
                                      
                                      <p className={`text-[11px] mt-1 leading-normal italic ${isUnlocked ? 'text-slate-655 dark:text-slate-355 font-medium' : 'text-slate-400 dark:text-slate-500 font-normal'}`}>
                                        "{displayedDesc}"
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* SCREEN 2: BADGE CABINET showcases */}
          {gamificationTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 text-xs font-sans"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-[10px] font-mono uppercase font-black text-slate-455 tracking-wider">
                  FTC Field-Battle Achievement Wall
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Progress: <strong>{stats.badgesUnlocked}</strong> / {badges.length} Badges Earned
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                {badges.map(badge => {
                  return (
                    <div 
                      key={badge.id} 
                      className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group select-none ${
                        badge.unlocked 
                          ? 'bg-slate-50 dark:bg-slate-905 border-cyan-500/40 shadow-sm hover:shadow-cyan-500/10 hover:border-cyan-500/80 ring-1 ring-cyan-500/5' 
                          : 'bg-slate-50/40 dark:bg-slate-955/20 border-slate-200/60 dark:border-slate-800/50 opacity-60 hover:opacity-100'
                      }`}
                      title={`${badge.name}: ${badge.description}`}
                    >
                      {badge.unlocked && (
                        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-10 h-10 bg-cyan-500/10 rounded-full blur-sm group-hover:scale-150 transition-all"></div>
                      )}

                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-lg border shrink-0 transition-transform group-hover:scale-110 ${
                          badge.unlocked 
                            ? 'bg-gradient-to-br from-cyan-5 to-cyan-100/50 border-cyan-200 dark:from-cyan-950/30 dark:to-teal-950/20 dark:border-cyan-800' 
                            : 'bg-slate-200/55 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-400'
                        }`}>
                          {badge.unlocked ? (
                            getGamifiedIconLocal(badge.icon, "w-5 h-5")
                          ) : (
                            <Lock className="w-5 h-5 text-slate-400 dark:text-slate-650" />
                          )}
                        </div>
                        <div className="min-w-0 font-sans">
                          <h4 className="font-extrabold text-[12px] text-slate-900 dark:text-slate-100 uppercase tracking-wide truncate">
                            {badge.name}
                          </h4>
                          <p className="text-[10px] text-slate-455 dark:text-slate-400 leading-tight mt-0.5 line-clamp-2">
                            {badge.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3.5 border-t border-slate-105 dark:border-slate-800 pt-2 flex flex-col gap-1 text-[9px] font-mono">
                        <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
                          <span className="uppercase">Requirement:</span>
                          <span className="font-bold truncate max-w-[110px]" title={badge.reqText}>{badge.reqText}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800 mt-0.5">
                          <div 
                            className={`h-full rounded-full ${badge.unlocked ? 'bg-cyan-500' : 'bg-slate-350 dark:bg-slate-700'}`} 
                            style={{ width: `${badge.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* SCREEN 3: ACTIVE QUESTS log */}
          {gamificationTab === 'quests' && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 text-xs font-sans"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-[10px] font-mono uppercase font-black text-slate-455 tracking-wider">
                  Roboraiders Weekly Team Quests
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Tactical rewards stack dynamically
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quests.map(quest => {
                  const pct = Math.min(100, Math.max(0, Math.floor((quest.currentCount / quest.targetCount) * 100)));
                  return (
                    <div 
                      key={quest.id} 
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group select-none ${
                        quest.unlocked 
                          ? 'bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01] border-emerald-500/25 shadow-sm' 
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {quest.unlocked && (
                        <div className="absolute -top-1 -right-1 bg-emerald-555/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black font-mono px-2 py-1 rounded-bl uppercase border-l border-b border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-500 animate-pulse" /> Complete
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-lg border mt-0.5 shrink-0 transition-transform group-hover:rotate-12 ${
                          quest.unlocked 
                            ? 'bg-emerald-100/40 border-emerald-250 dark:bg-emerald-950/20 dark:border-emerald-805' 
                            : 'bg-slate-100 dark:bg-slate-955 border-slate-200 dark:border-slate-800'
                        }`}>
                          {getGamifiedIconLocal(quest.icon, "w-4.5 h-4.5")}
                        </div>
                        <div className="min-w-0 pr-12">
                          <h4 className="font-extrabold text-[12px] text-slate-855 dark:text-slate-100 uppercase tracking-wide">
                            {quest.name}
                          </h4>
                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-normal">
                            {quest.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-slate-100 dark:border-slate-800/85 pt-3 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-1">
                            <span>Completion:</span>
                            <span className="font-bold text-slate-705 dark:text-slate-300">
                              {quest.currentCount} / {quest.targetCount} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800 relative">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${quest.unlocked ? 'bg-emerald-500' : 'bg-cyan-500'}`} 
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="shrink-0 text-center font-mono">
                          <div className="text-[8px] text-slate-405 uppercase font-black tracking-wider leading-none">XP AWARD</div>
                          <div className={`text-xs font-black mt-1 ${quest.unlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-305'}`}>
                            +{quest.xpReward} XP
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* SCREEN 4: LEADERBOARD arena rankings */}
          {gamificationTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 text-xs font-sans text-slate-855 dark:text-slate-100"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 dark:border-slate-800 pb-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase font-black text-slate-455 tracking-wider">
                    Roboraiders Championship scoreboard
                  </span>
                  <span className="text-[10px] font-mono text-slate-550 mt-0.5">
                    Active team scoreboard. Click player to inspect trophy badge case.
                  </span>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600 text-white font-mono text-[9px] uppercase tracking-wider py-1 px-2.5 rounded transition-all shadow-sm flex items-center gap-1.5 font-bold cursor-pointer self-start sm:self-auto"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export PDF Standings</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 items-start">
                
                {/* Scoreboard table index */}
                <div className="max-h-[280px] overflow-y-auto border border-slate-250 dark:border-slate-800 rounded-lg bg-slate-50/20 dark:bg-slate-955/20 shadow-inner">
                  <table className="w-full text-left text-[11px] border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-mono uppercase bg-slate-50 dark:bg-slate-900 text-slate-505 tracking-wider">
                        <th className="py-2.5 px-3 text-center w-14">Rank</th>
                        <th className="py-2.5 px-3">Robotics Specialist</th>
                        <th className="py-2.5 px-2">Subteam Declared</th>
                        <th className="py-2.5 px-2 text-center">Trophy Badges</th>
                        <th className="py-2.5 px-3 text-right">XP / Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLeaderboard.map((player, idx) => {
                        const isSelf = player.account.id === currentUser.id;
                        const medalColors = [
                          'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-805 dark:text-amber-300', // #1
                          'bg-slate-150 border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200', // #2
                          'bg-orange-100 border-orange-300 text-orange-950 dark:bg-orange-950/40 dark:border-orange-850 dark:text-orange-300', // #3
                        ];
                        const currentClass = isSelf 
                          ? 'bg-cyan-55/[0.04] dark:bg-cyan-955/5 hover:bg-cyan-55/[0.08] dark:hover:bg-cyan-955/15 border-l-2 border-l-cyan-500' 
                          : 'border-b border-slate-100 dark:border-slate-800 hover:bg-slate-100/40 dark:hover:bg-slate-800/40';

                        return (
                          <tr 
                            key={player.account.id}
                            onClick={() => onInspectPlayer(player.account)}
                            className={`transition-colors cursor-pointer ${currentClass}`}
                          >
                            <td className="py-3 px-3 text-center">
                              {idx < 3 ? (
                                <span className={`inline-flex items-center justify-center w-5.5 h-5.5 rounded-full border text-[10px] font-black font-semibold font-mono shadow-sm ${medalColors[idx]}`}>
                                  {idx + 1}
                                </span>
                              ) : (
                                <span className="font-mono font-bold text-slate-405">{idx + 1}</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <div className="flex flex-col">
                                  <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                                    {player.account.name}
                                    {isSelf && (
                                      <span className="bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-mono text-[8px] px-1 rounded uppercase font-black tracking-wide shrink-0">
                                        You
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[9.5px] font-mono text-slate-405 truncate max-w-[170px]">
                                    {player.account.schoolEmail}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <span className="font-mono text-[9px] border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-905 px-1.5 py-0.5 rounded truncate max-w-[150px] inline-block text-slate-700 dark:text-slate-350">
                                {player.account.primarySubteam}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center font-mono font-semibold">
                              <span className="bg-pink-100 text-pink-900 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-205 dark:border-pink-900 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1 font-bold">
                                <Award className="w-3 h-3 text-pink-500" />
                                {player.stats.badgesUnlocked}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex flex-col select-none font-mono">
                                <span className="font-black text-cyan-655 dark:text-cyan-400">{player.stats.xp} XP</span>
                                <span className="text-[9.5px] font-bold text-slate-450 dark:text-slate-500 uppercase">Lv.{player.stats.level}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

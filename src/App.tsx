import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit, 
  Download, 
  Upload, 
  Printer, 
  FileText, 
  Search, 
  Calendar, 
  User, 
  Wrench, 
  Cpu, 
  Globe, 
  Briefcase, 
  Award, 
  Compass, 
  PlusCircle, 
  X, 
  FileCode, 
  Grid, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle,
  FileUp,
  RotateCcw,
  Sparkles,
  Layers,
  Heart,
  Settings,
  Database,
  Sun,
  Moon,
  Send,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Users,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
  Mail,
  Clock,
  Trophy,
  Scroll
} from 'lucide-react';
import { Subteam, JournalEntry, JournalImage, FilterOptions, AuthorProfile, UserAccount, DispatchedEmail, TimeEntry, ClockInSession, KanbanTask, OutreachEvent, XPAdjustment } from './types';
import { compressAndResizeImage } from './utils/image';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updatePassword
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import RoboraidersLogo from './components/RoboraidersLogo';
import { computeUserGamification, calculateJournalQualityScore } from './utils/gamification';
import { SUBTEAM_GUILDS, getSubteamStatsAndRank } from './data/subteamRanks';
import KanbanBoard from './components/KanbanBoard';
import { DEFAULT_KANBAN_TASKS } from './data/kanbanDemo';
import OutreachHub from './components/OutreachHub';
import ArenaPortal from './components/ArenaPortal';
import { DEFAULT_OUTREACH_EVENTS } from './data/outreachDemo';
import { jsPDF } from 'jspdf';

import { DEMO_ENTRIES, DEFAULT_TIME_ENTRIES } from './data/journalDemo';
import StudentHandbook from './components/StudentHandbook';
import TimePicker from './components/TimePicker';

const SUBTEAM_LIST: Subteam[] = ['Design/Build/Fabrication', 'Programming', 'Outreach', 'Business & Media', 'Inspire', 'Strategy'];

const ATTENDANCE_SUBTEAMS: Subteam[] = ['Design/Build/Fabrication', 'Programming', 'Outreach', 'Business & Media', 'Mentoring'];

// Subteam Color Mapping adapted to represent the crisp, High Density light palette
export const getSubteamBadgeColor = (subteam: Subteam) => {
  const norm = (subteam as string) === 'Build' ? 'Design/Build/Fabrication' : subteam;
  switch (norm) {
    case 'Design/Build/Fabrication':
      return 'bg-slate-100 border-slate-300 text-slate-800';
    case 'Programming':
      return 'bg-cyan-100 border-cyan-300 text-cyan-900';
    case 'Outreach':
      return 'bg-amber-100 border-amber-300 text-amber-900';
    case 'Business & Media':
      return 'bg-emerald-100 border-emerald-300 text-emerald-900';
    case 'Inspire':
      return 'bg-purple-100 border-purple-300 text-purple-900';
    case 'Strategy':
      return 'bg-rose-100 border-rose-300 text-rose-900';
    case 'Mentoring':
      return 'bg-pink-100 border-pink-300 text-pink-900 dark:bg-pink-950/40 dark:border-pink-800 dark:text-pink-400';
    default:
      return 'bg-slate-100 border-slate-300 text-slate-800';
  }
};

export const formatSubteamLabel = (subteam: string | undefined): string => {
  if (!subteam) return '';
  if (subteam === 'None') return 'Mentor / Subteam Lead / Captain';
  if (subteam === 'Mentor') return 'Coach / Mentor';
  if (subteam === 'Lead/Captain') return 'Subteam Lead / Captain';
  return subteam;
};

export const getSubteamColorTheme = (subteam: Subteam) => {
  const norm = (subteam as string) === 'Build' ? 'Design/Build/Fabrication' : subteam;
  switch (norm) {
    case 'Design/Build/Fabrication':
      return { border: 'border-slate-500', text: 'text-slate-700', icon: Wrench };
    case 'Programming':
      return { border: 'border-cyan-600', text: 'text-cyan-700', icon: Cpu };
    case 'Outreach':
      return { border: 'border-amber-600', text: 'text-amber-700', icon: Globe };
    case 'Business & Media':
      return { border: 'border-emerald-600', text: 'text-emerald-700', icon: Briefcase };
    case 'Inspire':
      return { border: 'border-purple-600', text: 'text-purple-700', icon: Award };
    case 'Strategy':
      return { border: 'border-rose-600', text: 'text-rose-700', icon: Compass };
    case 'Mentoring':
      return { border: 'border-pink-600', text: 'text-pink-700', icon: ShieldCheck };
    default:
      return { border: 'border-slate-500', text: 'text-slate-700', icon: Wrench };
  }
};

export const getEntryReferenceCode = (entry: JournalEntry, allEntries: JournalEntry[] = []): string => {
  // If the entry already has a custom id format (e.g., demo-1), use a neat fallback
  if (entry.id === 'demo-1') return 'FTC-BUIL-0001';
  if (entry.id === 'demo-2') return 'FTC-PROG-0002';
  
  const subteamStr = (entry.subteam || '').toUpperCase();
  let prefix = 'MISC';
  if (subteamStr.startsWith('DESIGN') || subteamStr.includes('FABRICATION') || subteamStr.includes('BUILD')) {
    prefix = 'DESI';
  } else if (subteamStr.startsWith('PROGRAM')) {
    prefix = 'PROG';
  } else if (subteamStr.startsWith('OUTREACH')) {
    prefix = 'OUTR';
  } else if (subteamStr.startsWith('BUSINESS') || subteamStr.includes('MEDIA')) {
    prefix = 'BUSI';
  } else if (subteamStr.startsWith('INSPIRE')) {
    prefix = 'INSP';
  } else if (subteamStr.startsWith('STRATEGY')) {
    prefix = 'STRA';
  } else if (subteamStr.startsWith('MENTOR')) {
    prefix = 'MENT';
  } else {
    prefix = subteamStr.substring(0, 4).toUpperCase();
    if (prefix.length < 4) prefix = prefix.padEnd(4, 'X');
  }

  // Ensure unique reference index chronologically by filtering and sorting allEntries
  const filterList = allEntries && allEntries.length > 0 ? allEntries : [entry];
  const sameSubteamEntries = filterList
    .filter((e) => {
      const eSubStr = (e.subteam || '').toUpperCase();
      let ePrefix = 'MISC';
      if (eSubStr.startsWith('DESIGN') || eSubStr.includes('FABRICATION') || eSubStr.includes('BUILD')) {
        ePrefix = 'DESI';
      } else if (eSubStr.startsWith('PROGRAM')) {
        ePrefix = 'PROG';
      } else if (eSubStr.startsWith('OUTREACH')) {
        ePrefix = 'OUTR';
      } else if (eSubStr.startsWith('BUSINESS') || eSubStr.includes('MEDIA')) {
        ePrefix = 'BUSI';
      } else if (eSubStr.startsWith('INSPIRE')) {
        ePrefix = 'INSP';
      } else if (eSubStr.startsWith('STRATEGY')) {
        ePrefix = 'STRA';
      } else if (eSubStr.startsWith('MENTOR')) {
        ePrefix = 'MENT';
      } else {
        ePrefix = eSubStr.substring(0, 4).toUpperCase();
        if (ePrefix.length < 4) ePrefix = ePrefix.padEnd(4, 'X');
      }
      return ePrefix === prefix;
    })
    .sort((a, b) => {
      // Sort chronologically by date first, then by createdAt or id
      const dateA = a.date || '';
      const dateB = b.date || '';
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      return (a.id || '').localeCompare(b.id || '');
    });

  const idx = sameSubteamEntries.findIndex((e) => e.id === entry.id);
  const numVal = idx !== -1 ? idx + 1 : 1;
  const paddedNum = String(numVal).padStart(4, '0');

  return `FTC-${prefix}-${paddedNum}`;
};

export const DEFAULT_PROFILES: AuthorProfile[] = [
  {
    id: 'p-1',
    name: 'testLeader',
    schoolEmail: 'testleader@school.edu',
    schoolId: '123456',
    primarySubteam: 'Design/Build/Fabrication',
    secondarySubteam: 'Inspire',
    tadpoleTag: true
  },
  {
    id: 'p-2',
    name: 'testStudent',
    schoolEmail: 'teststudent@school.edu',
    schoolId: '654321',
    primarySubteam: 'Programming',
    secondarySubteam: 'Strategy',
    tadpoleTag: false
  }
];

export const getGamifiedIcon = (iconName: string, sizeClass = "w-4 h-4") => {
  switch (iconName) {
    case 'Wrench': return <Wrench className={`${sizeClass} text-slate-700 dark:text-slate-350`} />;
    case 'Cpu': return <Cpu className={`${sizeClass} text-cyan-600 dark:text-cyan-400`} />;
    case 'BookOpen': return <BookOpen className={`${sizeClass} text-indigo-650 dark:text-indigo-400`} />;
    case 'Clock': return <Clock className={`${sizeClass} text-amber-600 dark:text-amber-400`} />;
    case 'FileUp': return <FileUp className={`${sizeClass} text-emerald-600 dark:text-emerald-400`} />;
    case 'Globe': return <Globe className={`${sizeClass} text-purple-600 dark:text-purple-400`} />;
    case 'CheckCircle': return <CheckCircle className={`${sizeClass} text-rose-600 dark:text-rose-400`} />;
    case 'Sparkles': return <Sparkles className={`${sizeClass} text-yellow-500 animate-pulse`} />;
    case 'AlertTriangle': return <AlertTriangle className={`${sizeClass} text-orange-500`} />;
    case 'Layers': return <Layers className={`${sizeClass} text-blue-500`} />;
    case 'Award': return <Award className={`${sizeClass} text-pink-550`} />;
    case 'Compass': return <Compass className={`${sizeClass} text-sky-500`} />;
    case 'FileCode': return <FileCode className={`${sizeClass} text-indigo-550`} />;
    case 'CheckCircle2': return <CheckCircle2 className={`${sizeClass} text-teal-500`} />;
    case 'Sun': return <Sun className={`${sizeClass} text-yellow-500 animate-pulse`} />;
    case 'Moon': return <Moon className={`${sizeClass} text-sky-700 dark:text-sky-300`} />;
    case 'Calendar': return <Calendar className={`${sizeClass} text-cyan-500`} />;
    case 'Briefcase': return <Briefcase className={`${sizeClass} text-amber-750`} />;
    case 'Users': return <Users className={`${sizeClass} text-fuchsia-600`} />;
    case 'Database': return <Database className={`${sizeClass} text-zinc-550`} />;
    case 'ShieldCheck': return <ShieldCheck className={`${sizeClass} text-emerald-500`} />;
    case 'Settings': return <Settings className={`${sizeClass} text-rose-500`} />;
    default: return <Award className={`${sizeClass} text-slate-400`} />;
  }
};

export default function App() {
  // --- STATE ---
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [formSubteam, setFormSubteam] = useState<Subteam>('Design/Build/Fabrication');
  
  // Real User Accounts state
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const stored = localStorage.getItem('ftc_user_accounts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((acc: any) => ({
            ...acc,
            primarySubteam: acc.primarySubteam === 'Build' ? 'Design/Build/Fabrication' : acc.primarySubteam
          }));
        }
      } catch (e) {}
    }
    return [
      {
        id: 'a-system-admin',
        name: 'System Admin',
        schoolEmail: 'admin@school.edu',
        schoolId: 'admin',
        primarySubteam: 'Mentor',
        secondarySubteam: 'None',
        role: 'mentor_captain',
        status: 'Approved',
        createdAt: Date.now()
      },
      {
        id: 'a-admin',
        name: 'testMentor',
        schoolEmail: 'mentor@school.edu',
        schoolId: 'admin123',
        primarySubteam: 'Mentor',
        secondarySubteam: 'None',
        role: 'mentor_captain',
        status: 'Approved',
        createdAt: Date.now()
      },
      {
        id: 'a-member1',
        name: 'testLeader',
        schoolEmail: 'testleader@school.edu',
        schoolId: '123456',
        primarySubteam: 'Design/Build/Fabrication',
        secondarySubteam: 'Inspire',
        role: 'member',
        status: 'Approved',
        createdAt: Date.now()
      },
      {
        id: 'a-member2',
        name: 'testStudent',
        schoolEmail: 'teststudent@school.edu',
        schoolId: '654321',
        primarySubteam: 'Programming',
        secondarySubteam: 'Strategy',
        role: 'member',
        status: 'Approved',
        createdAt: Date.now()
      }
    ];
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const stored = localStorage.getItem('ftc_current_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed) {
          return {
            ...parsed,
            primarySubteam: parsed.primarySubteam === 'Build' ? 'Design/Build/Fabrication' : parsed.primarySubteam
          };
        }
      } catch (e) {}
    }
    return null;
  });

  // New States for views and time tracking
  const [currentView, setCurrentView] = useState<'landing' | 'journal' | 'time_entry' | 'kanban' | 'outreach' | 'handbook'>('landing');

  // Outreach events state
  const [outreachEvents, setOutreachEvents] = useState<OutreachEvent[]>(() => {
    const stored = localStorage.getItem('ftc_outreach_events');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_OUTREACH_EVENTS;
  });

  const saveOutreachEventsToLocalStorage = (newEvents: OutreachEvent[]) => {
    localStorage.setItem('ftc_outreach_events', JSON.stringify(newEvents));
    setOutreachEvents(newEvents);
    syncOutreachEventsToFirestore(newEvents).catch(console.error);
  };

  // Kanban tasks state
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>(() => {
    const stored = localStorage.getItem('ftc_kanban_tasks');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_KANBAN_TASKS;
  });

  const saveKanbanTasksToLocalStorage = (newTasks: KanbanTask[]) => {
    localStorage.setItem('ftc_kanban_tasks', JSON.stringify(newTasks));
    setKanbanTasks(newTasks);
    syncKanbanTasksToFirestore(newTasks).catch(console.error);
  };

  // Time entries state
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const stored = localStorage.getItem('ftc_time_entries');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    // Pre-populate with beautiful, realistic team hours logs
    return DEFAULT_TIME_ENTRIES;
  });

  // Current active clock-in session
  const [activeSession, setActiveSession] = useState<ClockInSession | null>(() => {
    const stored = localStorage.getItem('ftc_active_clock_in');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return null;
  });

  // Keep track of active session ticker elapsed string
  const [sessionElapsed, setSessionElapsed] = useState('');

  // Manual Time Entry form states
  const [manualTimeDate, setManualTimeDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualTimeSubteam, setManualTimeSubteam] = useState<Subteam>('Design/Build/Fabrication');
  const [manualTimeStart, setManualTimeStart] = useState('15:30');
  const [manualTimeEnd, setManualTimeEnd] = useState('18:00');
  const [manualTimeDesc, setManualTimeDesc] = useState('');

  // Clock-in form states
  const [clockInSubteam, setClockInSubteam] = useState<Subteam>('Design/Build/Fabrication');
  const [clockInDesc, setClockInDesc] = useState('');

  // Editing Time Entry states
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | null>(null);
  const [editTimeDate, setEditTimeDate] = useState('');
  const [editTimeSubteam, setEditTimeSubteam] = useState<Subteam>('Design/Build/Fabrication');
  const [editTimeStart, setEditTimeStart] = useState('');
  const [editTimeEnd, setEditTimeEnd] = useState('');
  const [editTimeDesc, setEditTimeDesc] = useState('');

  // XP Adjustments state
  const [xpAdjustments, setXpAdjustments] = useState<XPAdjustment[]>(() => {
    const stored = localStorage.getItem('ftc_xp_adjustments');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const xpAdjustmentsRef = useRef<XPAdjustment[]>([]);
  useEffect(() => {
    xpAdjustmentsRef.current = xpAdjustments;
  }, [xpAdjustments]);

  // Persistent sync
  useEffect(() => {
    localStorage.setItem('ftc_time_entries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  useEffect(() => {
    localStorage.setItem('ftc_xp_adjustments', JSON.stringify(xpAdjustments));
  }, [xpAdjustments]);

  // --- FIREBASE SYNC & ON-SNAP LIFECYCLE ---
  const syncXpAdjustmentsToFirestore = async (newAdjustments: XPAdjustment[]) => {
    for (const adj of newAdjustments) {
      const match = xpAdjustmentsRef.current.find(a => a.id === adj.id);
      if (!match || JSON.stringify(match) !== JSON.stringify(adj)) {
        try {
          await setDoc(doc(db, 'xpAdjustments', adj.id), adj);
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `xpAdjustments/${adj.id}`);
        }
      }
    }
    for (const adj of xpAdjustmentsRef.current) {
      if (!newAdjustments.some(a => a.id === adj.id)) {
        try {
          await deleteDoc(doc(db, 'xpAdjustments', adj.id));
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `xpAdjustments/${adj.id}`);
        }
      }
    }
  };

  const handleAddXpAdjustment = async (adjData: Omit<XPAdjustment, 'id' | 'createdAt' | 'awardedBy' | 'awardedByEmail'>) => {
    if (!currentUser) return;
    const newAdj: XPAdjustment = {
      ...adjData,
      id: 'xp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      awardedBy: currentUser.name,
      awardedByEmail: currentUser.schoolEmail,
      createdAt: Date.now()
    };
    const updated = [newAdj, ...xpAdjustments];
    setXpAdjustments(updated);
    showToast(`Successfully adjusted XP for ${newAdj.userName} by ${newAdj.amount > 0 ? '+' : ''}${newAdj.amount} XP!`, 'success');
    
    try {
      await setDoc(doc(db, 'xpAdjustments', newAdj.id), newAdj);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `xpAdjustments/${newAdj.id}`);
    }
  };

  const handleDeleteXpAdjustment = async (id: string) => {
    const matched = xpAdjustments.find(a => a.id === id);
    const updated = xpAdjustments.filter(a => a.id !== id);
    setXpAdjustments(updated);
    if (matched) {
      showToast(`Revoked ${matched.amount > 0 ? '+' : ''}${matched.amount} XP adjustment for ${matched.userName}.`, 'info');
    }
    
    try {
      await deleteDoc(doc(db, 'xpAdjustments', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `xpAdjustments/${id}`);
    }
  };

  const syncKanbanTasksToFirestore = async (newTasks: KanbanTask[]) => {
    for (const task of newTasks) {
      const match = kanbanTasks.find(t => t.id === task.id);
      if (!match || JSON.stringify(match) !== JSON.stringify(task)) {
        try {
          await setDoc(doc(db, 'kanbanTasks', task.id), task);
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `kanbanTasks/${task.id}`);
        }
      }
    }
    for (const task of kanbanTasks) {
      if (!newTasks.some(t => t.id === task.id)) {
        try {
          await deleteDoc(doc(db, 'kanbanTasks', task.id));
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `kanbanTasks/${task.id}`);
        }
      }
    }
  };

  const syncOutreachEventsToFirestore = async (newEvents: OutreachEvent[]) => {
    for (const event of newEvents) {
      const match = outreachEvents.find(e => e.id === event.id);
      if (!match || JSON.stringify(match) !== JSON.stringify(event)) {
        try {
          await setDoc(doc(db, 'outreachEvents', event.id), event);
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `outreachEvents/${event.id}`);
        }
      }
    }
    for (const event of outreachEvents) {
      if (!newEvents.some(e => e.id === event.id)) {
        try {
          await deleteDoc(doc(db, 'outreachEvents', event.id));
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `outreachEvents/${event.id}`);
        }
      }
    }
  };

  const syncEntriesToFirestore = async (newEntries: JournalEntry[]) => {
    for (const entry of newEntries) {
      const match = entries.find(e => e.id === entry.id);
      if (!match || JSON.stringify(match) !== JSON.stringify(entry)) {
        try {
          await setDoc(doc(db, 'journalEntries', entry.id), entry);
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `journalEntries/${entry.id}`);
        }
      }
    }
    for (const entry of entries) {
      if (!newEntries.some(e => e.id === entry.id)) {
        try {
          await deleteDoc(doc(db, 'journalEntries', entry.id));
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `journalEntries/${entry.id}`);
        }
      }
    }
  };

  const syncTimeEntriesToFirestore = async (newTimes: TimeEntry[]) => {
    for (const time of newTimes) {
      const match = timeEntries.find(t => t.id === time.id);
      if (!match || JSON.stringify(match) !== JSON.stringify(time)) {
        try {
          await setDoc(doc(db, 'timeEntries', time.id), time);
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `timeEntries/${time.id}`);
        }
      }
    }
    for (const time of timeEntries) {
      if (!newTimes.some(t => t.id === time.id)) {
        try {
          await deleteDoc(doc(db, 'timeEntries', time.id));
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `timeEntries/${time.id}`);
        }
      }
    }
  };

  const triggerSandboxLogin = async (email: string, schoolId: string) => {
    const password = schoolId.trim() + "_ftc_auth";
    const emailToFind = email.trim().toLowerCase();
    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, emailToFind, password);
      } catch (authErr: any) {
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
          const matchedLocalAcc = accounts.find(a => a.schoolEmail.toLowerCase() === emailToFind);
          if (matchedLocalAcc) {
            try {
              userCredential = await createUserWithEmailAndPassword(auth, emailToFind, password);
              await setDoc(doc(db, 'users', userCredential.user.uid), {
                ...matchedLocalAcc,
                id: userCredential.user.uid
              });
            } catch (createErr) {
              console.error("Auto create sandbox user error", createErr);
              showToast('Failed to auto register sandbox user.', 'danger');
              return;
            }
          } else {
            showToast('Sandbox user profile mapping data missing.', 'danger');
            return;
          }
        } else {
          showToast(`Sandbox Login Auth Error: ${authErr.message}`, 'danger');
          return;
        }
      }

      const userUid = userCredential.user.uid;
      const docRef = doc(db, 'users', userUid);
      let docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        const matchedLocalAcc = accounts.find(a => a.schoolEmail.toLowerCase() === emailToFind);
        if (matchedLocalAcc) {
          const newDoc = {
            ...matchedLocalAcc,
            id: userUid
          };
          await setDoc(docRef, newDoc);
          docSnap = await getDoc(docRef);
        } else {
          const defaultName = emailToFind.split('@')[0];
          const isUserAdmin = emailToFind === 'ftc6567@gmail.com' || emailToFind === 'mentor@school.edu' || emailToFind === 'admin@school.edu';
          const newDoc: UserAccount = {
            id: userUid,
            name: isUserAdmin ? 'Coach / Mentor' : defaultName,
            schoolEmail: emailToFind,
            schoolId: 'N/A',
            primarySubteam: isUserAdmin ? 'Mentor' : 'Design/Build/Fabrication',
            secondarySubteam: 'None',
            role: isUserAdmin ? 'mentor_captain' : 'member',
            status: isUserAdmin ? 'Approved' : 'Pending',
            createdAt: Date.now()
          };
          await setDoc(docRef, newDoc);
          docSnap = await getDoc(docRef);
        }
      }

      if (docSnap.exists()) {
        const found = docSnap.data() as UserAccount;
        setCurrentUser(found);
        localStorage.setItem('ftc_current_user', JSON.stringify(found));
        showToast(`Logged into ${found.name} account successfully!`, 'success');
      } else {
        showToast('Auth succeeded, but no user document found in Firestore.', 'danger');
      }
    } catch (err: any) {
      showToast(`Sandbox login failed: ${err.message}`, 'danger');
    }
  };

  useEffect(() => {
    let unsubscribeAll: (() => void)[] = [];
    const handleAuthEvent = onAuthStateChanged(auth, async (authUser) => {
      // Clear any previous listeners immediately on any auth state transition to avoid unauthenticated listens
      unsubscribeAll.forEach(unsub => unsub());
      unsubscribeAll = [];

      if (authUser) {
        try {
          const userDocRef = doc(db, 'users', authUser.uid);
          let userSnap = await getDoc(userDocRef);
          
          if (!userSnap.exists()) {
            const authEmail = authUser.email?.toLowerCase() || '';
            const matchedLocalAcc = accounts.find(a => a.schoolEmail.toLowerCase() === authEmail);
            if (matchedLocalAcc) {
              const newAcc = {
                ...matchedLocalAcc,
                id: authUser.uid
              };
              await setDoc(userDocRef, newAcc);
              userSnap = await getDoc(userDocRef);
            } else {
              const defaultName = authUser.displayName || authUser.email?.split('@')[0] || 'Team Member';
              const isUserAdmin = authEmail === 'ftc6567@gmail.com' || authEmail === 'mentor@school.edu' || authEmail === 'admin@school.edu';
              const newAcc: UserAccount = {
                id: authUser.uid,
                name: defaultName,
                schoolEmail: authUser.email || 'unknown@school.edu',
                schoolId: 'N/A',
                primarySubteam: isUserAdmin ? 'Mentor' : 'Design/Build/Fabrication',
                secondarySubteam: 'None',
                role: isUserAdmin ? 'mentor_captain' : 'member',
                status: isUserAdmin ? 'Approved' : 'Pending',
                createdAt: Date.now()
              };
              await setDoc(userDocRef, newAcc);
              userSnap = await getDoc(userDocRef);
            }
          }

          if (userSnap.exists()) {
            const userData = userSnap.data() as UserAccount;
            setCurrentUser(userData);
            localStorage.setItem('ftc_current_user', JSON.stringify(userData));

            if (userData.status === 'Approved') {
              const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
                const list: UserAccount[] = [];
                snapshot.forEach(d => {
                  list.push(d.data() as UserAccount);
                });
                setAccounts(list);
              }, (error) => {
                handleFirestoreError(error, OperationType.GET, 'users');
              });
              unsubscribeAll.push(unsubUsers);

              const unsubJournals = onSnapshot(collection(db, 'journalEntries'), (snapshot) => {
                if (snapshot.empty) {
                  const local = entriesRef.current.length > 0 ? entriesRef.current : DEMO_ENTRIES;
                  local.forEach(e => {
                    setDoc(doc(db, 'journalEntries', e.id), e).catch(err => {
                      handleFirestoreError(err, OperationType.WRITE, `journalEntries/${e.id}`);
                    });
                  });
                } else {
                  const list: JournalEntry[] = [];
                  snapshot.forEach(d => {
                    list.push(d.data() as JournalEntry);
                  });
                  setEntries(list.sort((a,b) => b.createdAt - a.createdAt));
                }
              }, (error) => {
                handleFirestoreError(error, OperationType.GET, 'journalEntries');
              });
              unsubscribeAll.push(unsubJournals);

              const unsubTime = onSnapshot(collection(db, 'timeEntries'), (snapshot) => {
                if (snapshot.empty) {
                  const local = timeEntriesRef.current.length > 0 ? timeEntriesRef.current : DEFAULT_TIME_ENTRIES;
                  local.forEach(t => {
                    setDoc(doc(db, 'timeEntries', t.id), t).catch(err => {
                      handleFirestoreError(err, OperationType.WRITE, `timeEntries/${t.id}`);
                    });
                  });
                } else {
                  const list: TimeEntry[] = [];
                  snapshot.forEach(d => {
                    list.push(d.data() as TimeEntry);
                  });
                  setTimeEntries(list.sort((a,b) => b.createdAt - a.createdAt));
                }
              }, (error) => {
                handleFirestoreError(error, OperationType.GET, 'timeEntries');
              });
              unsubscribeAll.push(unsubTime);

              const unsubKanban = onSnapshot(collection(db, 'kanbanTasks'), (snapshot) => {
                if (snapshot.empty) {
                  const local = kanbanTasksRef.current.length > 0 ? kanbanTasksRef.current : DEFAULT_KANBAN_TASKS;
                  local.forEach(task => {
                    setDoc(doc(db, 'kanbanTasks', task.id), task).catch(err => {
                      handleFirestoreError(err, OperationType.WRITE, `kanbanTasks/${task.id}`);
                    });
                  });
                } else {
                  const list: KanbanTask[] = [];
                  snapshot.forEach(d => {
                    list.push(d.data() as KanbanTask);
                  });
                  setKanbanTasks(list);
                }
              }, (error) => {
                handleFirestoreError(error, OperationType.GET, 'kanbanTasks');
              });
              unsubscribeAll.push(unsubKanban);

              const unsubOutreach = onSnapshot(collection(db, 'outreachEvents'), (snapshot) => {
                if (snapshot.empty) {
                  const local = outreachEventsRef.current.length > 0 ? outreachEventsRef.current : DEFAULT_OUTREACH_EVENTS;
                  local.forEach(event => {
                    setDoc(doc(db, 'outreachEvents', event.id), event).catch(err => {
                      handleFirestoreError(err, OperationType.WRITE, `outreachEvents/${event.id}`);
                    });
                  });
                } else {
                  const list: OutreachEvent[] = [];
                  snapshot.forEach(d => {
                    list.push(d.data() as OutreachEvent);
                  });
                  setOutreachEvents(list);
                }
              }, (error) => {
                handleFirestoreError(error, OperationType.GET, 'outreachEvents');
              });
              unsubscribeAll.push(unsubOutreach);

              const unsubEmails = onSnapshot(collection(db, 'dispatchedEmails'), (snapshot) => {
                const list: DispatchedEmail[] = [];
                snapshot.forEach(d => {
                  list.push(d.data() as DispatchedEmail);
                });
                setDispatchedEmails(list.sort((a,b) => b.timestamp - a.timestamp));
              }, (error) => {
                handleFirestoreError(error, OperationType.GET, 'dispatchedEmails');
              });
              unsubscribeAll.push(unsubEmails);

              const unsubXp = onSnapshot(collection(db, 'xpAdjustments'), (snapshot) => {
                const list: XPAdjustment[] = [];
                snapshot.forEach(d => {
                  list.push(d.data() as XPAdjustment);
                });
                setXpAdjustments(list.sort((a,b) => b.createdAt - a.createdAt));
              }, (error) => {
                handleFirestoreError(error, OperationType.GET, 'xpAdjustments');
              });
              unsubscribeAll.push(unsubXp);
            }
          }
        } catch (err) {
          console.error("onAuthStateChanged Profile Fetch Error", err);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('ftc_current_user');
      }
    });

    return () => {
      handleAuthEvent();
      unsubscribeAll.forEach(unsub => unsub());
    };
  }, []);

  // Rank and level-up celebration states
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ level: number; levelName: string } | null>(null);

  // Monitor level and trigger a celebratory pop-up on Rank gains
  useEffect(() => {
    if (currentUser) {
      const gameResult = computeUserGamification(currentUser, entries, timeEntries, kanbanTasks, outreachEvents, xpAdjustments);
      const currentLevel = gameResult.stats.level;
      
      if (previousLevel !== null) {
        if (currentLevel > previousLevel) {
          // Trigger glorious Rank Level Up Modal/Celebration
          setLevelUpData({
            level: currentLevel,
            levelName: gameResult.stats.levelName
          });
        }
      }
      setPreviousLevel(currentLevel);
    } else {
      setPreviousLevel(null);
    }
  }, [currentUser, entries, timeEntries, previousLevel]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('ftc_active_clock_in', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('ftc_active_clock_in');
    }
  }, [activeSession]);

  // Ticker for active clock-in
  useEffect(() => {
    if (!activeSession) {
      setSessionElapsed('');
      return;
    }
    const updateElapsed = () => {
      const diffMs = Date.now() - activeSession.startTime;
      const totalSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;
      
      const pad = (num: number) => num.toString().padStart(2, '0');
      setSessionElapsed(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
    };
    
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  // States for search & subteam filter within hours ledger
  const [timeSearch, setTimeSearch] = useState('');
  const [timeSubteamFilter, setTimeSubteamFilter] = useState<'All' | Subteam>('All');

  // Derived approved profiles to preserve backwards compatibility
  const profiles: AuthorProfile[] = accounts
    .filter(a => a.status === 'Approved')
    .map(a => ({
      id: a.id,
      name: a.name,
      schoolEmail: a.schoolEmail,
      schoolId: a.schoolId,
      primarySubteam: (a.primarySubteam === 'None' ? 'Mentor' : a.primarySubteam) as any,
      secondarySubteam: a.secondarySubteam,
      tadpoleTag: a.primarySubteam === 'Design/Build/Fabrication'
    }));

  const [formAuthor, setFormAuthor] = useState('');

  // Login & Registration state
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSchoolId, setLoginSchoolId] = useState('');

  // Password reset states
  const [resetEmail, setResetEmail] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [generatedResetCode, setGeneratedResetCode] = useState(() => {
    return localStorage.getItem('ftc_active_reset_code') || '';
  });

  // Password Setup Prompt from first-time registration / default ID
  const [showPasswordSetupPrompt, setShowPasswordSetupPrompt] = useState(false);
  const [setupCustomPassword, setSetupCustomPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [isSettingUpPassword, setIsSettingUpPassword] = useState(false);

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerSchoolId, setRegisterSchoolId] = useState('');
  const [registerPrimary, setRegisterPrimary] = useState<'Design/Build/Fabrication' | 'Programming' | 'Outreach' | 'Business & Media' | 'Mentor' | 'Lead/Captain' | 'None'>('Design/Build/Fabrication');
  const [registerSecondary, setRegisterSecondary] = useState<'Inspire' | 'Strategy' | 'None'>('None');
  const [registerRole, setRegisterRole] = useState<'member' | 'mentor_captain' | 'mentor' | 'captain'>('member');
  const [registerLeadership, setRegisterLeadership] = useState<'None' | 'Captain' | 'Subteam leader'>('None');

  // Approvals Modal state for Mentor/Captain
  const [isApprovalsOpen, setIsApprovalsOpen] = useState(false);

  // Season Transition and Backups state (Mentor-Only option)
  const [isBackupTransitionOpen, setIsBackupTransitionOpen] = useState(false);
  const [transitionState, setTransitionState] = useState({
    journalEntries: true,
    timeEntries: true,
    kanbanTasks: true,
    outreachEvents: true,
    xpAdjustments: true,
    dispatchedEmails: true,
    clearPendingUsers: true,
    resetStudents: false,
  });
  const [transitionConfirmCode, setTransitionConfirmCode] = useState('');
  const [isProcessingTransition, setIsProcessingTransition] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState<{current: number, total: number, collection: string} | null>(null);

  // Settings Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsName, setSettingsName] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsSchoolId, setSettingsSchoolId] = useState('');
  const [settingsPrimary, setSettingsPrimary] = useState<'Design/Build/Fabrication' | 'Programming' | 'Outreach' | 'Business & Media' | 'Mentor' | 'Lead/Captain' | 'None'>('Design/Build/Fabrication');
  const [settingsSecondary, setSettingsSecondary] = useState<'Inspire' | 'Strategy' | 'None'>('None');

  // Simulated System Email Dispatch Outbox state
  const [dispatchedEmails, setDispatchedEmails] = useState<DispatchedEmail[]>(() => {
    const stored = localStorage.getItem('ftc_dispatched_emails');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('ftc_dispatched_emails', JSON.stringify(dispatchedEmails));
  }, [dispatchedEmails]);

  const sendEmailNotification = (to: string, subject: string, body: string) => {
    const newEmail: DispatchedEmail = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      from: 'system-auth@roboriders-6567.edu',
      to,
      subject,
      body,
      timestamp: Date.now()
    };
    setDispatchedEmails(prev => [newEmail, ...prev]);
    setDoc(doc(db, 'dispatchedEmails', newEmail.id), newEmail).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `dispatchedEmails/${newEmail.id}`);
    });
  };

  // Create New Author profile modal state
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmail, setNewProfileEmail] = useState('');
  const [newProfileSchoolId, setNewProfileSchoolId] = useState('');
  const [newProfilePrimary, setNewProfilePrimary] = useState<'Design/Build/Fabrication' | 'Programming' | 'Outreach' | 'Business & Media' | 'Mentor' | 'Lead/Captain' | 'None'>('Design/Build/Fabrication');
  const [newProfileSecondary, setNewProfileSecondary] = useState<'Inspire' | 'Strategy' | 'None'>('None');
  const [newProfileLeadership, setNewProfileLeadership] = useState<'None' | 'Captain' | 'Subteam leader'>('None');
  const [newProfileRole, setNewProfileRole] = useState<'member' | 'mentor_captain' | 'mentor' | 'captain'>('member');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formPlanned, setFormPlanned] = useState('');
  const [formAccomplished, setFormAccomplished] = useState('');
  const [formProblemsAndSolutions, setFormProblemsAndSolutions] = useState<string[]>(['']);
  const [formPlanNextTime, setFormPlanNextTime] = useState('');
  const [formImages, setFormImages] = useState<JournalImage[]>([]);
  const [formAttendees, setFormAttendees] = useState<string[]>([]);
  const [customAttendee, setCustomAttendee] = useState('');

  const handleToggleAttendee = (name: string) => {
    if (formAttendees.includes(name)) {
      setFormAttendees(formAttendees.filter(a => a !== name));
    } else {
      setFormAttendees([...formAttendees, name]);
    }
  };

  const handleAddCustomAttendee = () => {
    const trimmed = customAttendee.trim();
    if (trimmed && !formAttendees.includes(trimmed)) {
      setFormAttendees([...formAttendees, trimmed]);
      setCustomAttendee('');
    }
  };

  // Dark Mode State
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('ftc_journal_theme');
    return saved === 'dark';
  });

  // Editing controls
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Active viewing/selected cards
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Lightbox / Expanded Image State
  const [expandedImage, setExpandedImage] = useState<{ url: string; name: string } | null>(null);

  // Filter criteria
  const [filters, setFilters] = useState<FilterOptions>({
    subteam: 'All',
    author: '',
    searchQuery: '',
    startDate: '',
    endDate: '',
    status: 'All'
  });

  // Image upload UI feedback states
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isImageProcessing, setIsImageProcessing] = useState(false);

  // Toast System state
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);

  // Embedded view Tab selector (allows perfect responsiveness inside Google Site iframes)
  const [activeTab, setActiveTab] = useState<'form' | 'archive'>('form');

  // Derived userRole from the logged-in user profile
  const userRole: 'author' | 'reviewer' = (currentUser?.role === 'mentor_captain' || currentUser?.role === 'mentor' || currentUser?.role === 'captain') ? 'reviewer' : 'author';
  const [submissionType, setSubmissionType] = useState<'Draft' | 'Pending Review'>('Pending Review');
  const [reviewNoteInput, setReviewNoteInput] = useState<string>('');

  // PDF Export Modal and Batch Print States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('all');
  const [exportSubteam, setExportSubteam] = useState<Subteam | 'All'>('All');
  const [exportStatus, setExportStatus] = useState<string | 'All'>('All');
  const [entriesToPrint, setEntriesToPrint] = useState<JournalEntry[] | null>(null);

  // Time Card PDF Export States
  const [isTimeExportModalOpen, setIsTimeExportModalOpen] = useState(false);
  const [timeExportScope, setTimeExportScope] = useState<'all' | 'members' | 'subteam'>('all');
  const [selectedTimeExportMembers, setSelectedTimeExportMembers] = useState<string[]>([]);
  const [selectedTimeExportSubteam, setSelectedTimeExportSubteam] = useState<Subteam | 'All'>('All');
  const [timeEntriesToPrint, setTimeEntriesToPrint] = useState<TimeEntry[] | null>(null);

  // Gamification dashboard selectors
  const [gamificationTab, setGamificationTab] = useState<'profile' | 'badges' | 'quests' | 'leaderboard' | 'subteamRanks'>('profile');
  const [inspectLeaderboardAccount, setInspectLeaderboardAccount] = useState<UserAccount | null>(null);
  const [activeGuildTab, setActiveGuildTab] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync references to keep the latest values available in asynchronous closures
  const entriesRef = useRef<JournalEntry[]>([]);
  const timeEntriesRef = useRef<TimeEntry[]>([]);
  const kanbanTasksRef = useRef<KanbanTask[]>([]);
  const outreachEventsRef = useRef<OutreachEvent[]>([]);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    timeEntriesRef.current = timeEntries;
  }, [timeEntries]);

  useEffect(() => {
    kanbanTasksRef.current = kanbanTasks;
  }, [kanbanTasks]);

  useEffect(() => {
    outreachEventsRef.current = outreachEvents;
  }, [outreachEvents]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const stored = localStorage.getItem('ftc_journal_entries');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as JournalEntry[];
        if (parsed.length > 0) {
          // Normalize entries by ensuring a status exists and legacy subteams are migrated
          const normalized = parsed.map(e => ({
            ...e,
            subteam: (e.subteam as string) === 'Build' ? 'Design/Build/Fabrication' : e.subteam,
            status: e.status || 'Pending Review'
          }));
          setEntries(normalized);
          setSelectedEntry(normalized[0]);
        } else {
          loadDemoData();
        }
      } catch (e) {
        loadDemoData();
      }
    } else {
      loadDemoData();
    }
  }, []);

  // Theme synchronization hook
  useEffect(() => {
    localStorage.setItem('ftc_journal_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    
    const root = document.getElementById('main-root');
    if (root) {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [isDark]);

  // Batch print cleanup hook
  useEffect(() => {
    const handleAfterPrint = () => {
      setEntriesToPrint(null);
      setTimeEntriesToPrint(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Handle escape key listener to close expanded image modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedImage(null);
      }
    };
    if (expandedImage) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expandedImage]);

  // Synchronize accounts to localStorage
  useEffect(() => {
    localStorage.setItem('ftc_user_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Synchronize currentUser to localStorage and auto-select values
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ftc_current_user', JSON.stringify(currentUser));
      setFormAuthor(currentUser.name);
      if (!isEditing) {
        const isStudentSubteam = ['Design/Build/Fabrication', 'Programming', 'Outreach', 'Business & Media'].includes(currentUser.primarySubteam);
        setFormSubteam((isStudentSubteam ? currentUser.primarySubteam : 'Design/Build/Fabrication') as Subteam);
      }
    } else {
      localStorage.removeItem('ftc_current_user');
      setFormAuthor('');
    }
  }, [currentUser, isEditing]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setCurrentView('landing');
      localStorage.removeItem('ftc_current_user');
      showToast('Logged out of system successfully.', 'info');
    } catch (err: any) {
      showToast(`Logout failed: ${err.message}`, 'danger');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginSchoolId.trim()) {
      showToast('Please enter both school email and school ID/password.', 'danger');
      return;
    }
    const emailToFind = loginEmail.trim().toLowerCase();
    const typedCredential = loginSchoolId.trim();
    const defaultPassword = typedCredential + "_ftc_auth";

    try {
      let userCredential;
      
      // 1. Try logging in with the direct custom password first
      try {
        userCredential = await signInWithEmailAndPassword(auth, emailToFind, typedCredential);
      } catch (authErr1: any) {
        // 2. Try logging in with the default schoolId suffix password
        try {
          userCredential = await signInWithEmailAndPassword(auth, emailToFind, defaultPassword);
        } catch (authErr2: any) {
          // 3. Fallback: If both fail, check if user has a pre-mapped sandbox profile and needs automatic Firebase Auth creation
          if (authErr2.code === 'auth/user-not-found' || authErr2.code === 'auth/invalid-credential' || authErr1.code === 'auth/invalid-credential') {
            const matchedLocalAcc = accounts.find(a => a.schoolEmail.toLowerCase() === emailToFind);
            if (matchedLocalAcc && matchedLocalAcc.schoolId === typedCredential) {
              try {
                userCredential = await createUserWithEmailAndPassword(auth, emailToFind, defaultPassword);
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                  ...matchedLocalAcc,
                  id: userCredential.user.uid
                });
              } catch (createErr) {
                console.error("auto-creation error", createErr);
                showToast('Credential mismatch or sign-in issue. Please try registering first.', 'danger');
                return;
              }
            } else {
              showToast('Incorrect credentials: Password or School ID does not match.', 'danger');
              return;
            }
          } else {
            showToast(`Authentication Error: ${authErr2.message}`, 'danger');
            return;
          }
        }
      }

      const userUid = userCredential.user.uid;
      const docRef = doc(db, 'users', userUid);
      let docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        const matchedLocalAcc = accounts.find(a => a.schoolEmail.toLowerCase() === emailToFind);
        if (matchedLocalAcc) {
          const newDoc = {
            ...matchedLocalAcc,
            id: userUid
          };
          await setDoc(docRef, newDoc);
          docSnap = await getDoc(docRef);
        } else {
          const defaultName = emailToFind.split('@')[0];
          const isUserAdmin = emailToFind === 'ftc6567@gmail.com' || emailToFind === 'mentor@school.edu' || emailToFind === 'admin@school.edu';
          const newDoc: UserAccount = {
            id: userUid,
            name: isUserAdmin ? 'Coach / Mentor' : defaultName,
            schoolEmail: emailToFind,
            schoolId: 'N/A',
            primarySubteam: isUserAdmin ? 'Mentor' : 'Design/Build/Fabrication',
            secondarySubteam: 'None',
            role: isUserAdmin ? 'mentor_captain' : 'member',
            status: isUserAdmin ? 'Approved' : 'Pending',
            createdAt: Date.now()
          };
          await setDoc(docRef, newDoc);
          docSnap = await getDoc(docRef);
        }
      }

      if (docSnap.exists()) {
        const found = docSnap.data() as UserAccount;
        setCurrentUser(found);
        localStorage.setItem('ftc_current_user', JSON.stringify(found));
        if (found.status === 'Approved') {
          showToast(`Welcome back, ${found.name}!`, 'success');
        } else if (found.status === 'Rejected') {
          showToast('Account Access Request was rejected by Mentors.', 'danger');
        } else {
          showToast('Access pending administrator approval.', 'info');
        }
      } else {
        showToast('Successfully logged in, but profile document is missing in db.', 'danger');
      }
    } catch (e: any) {
      showToast(`Login failed: ${e.message}`, 'danger');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim()) {
      showToast('Full name is required.', 'danger');
      return;
    }
    if (!registerEmail.trim()) {
      showToast('School email is required.', 'danger');
      return;
    }
    if (!registerSchoolId.trim()) {
      showToast('School ID is required.', 'danger');
      return;
    }

    const emailToFind = registerEmail.trim().toLowerCase();
    const exists = accounts.some(a => a.schoolEmail.toLowerCase() === emailToFind);
    if (exists) {
      showToast('School email is already registered. Please log in.', 'danger');
      return;
    }

    const password = registerSchoolId.trim() + "_ftc_auth";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailToFind, password);
      const uid = userCredential.user.uid;

      const shouldAutoApprove = emailToFind === 'ftc6567@gmail.com' || emailToFind === 'mentor@school.edu' || emailToFind === 'admin@school.edu' || registerRole === 'mentor';
      const initialStatus = shouldAutoApprove ? 'Approved' : 'Pending';
      const initialRole = shouldAutoApprove ? 'mentor_captain' : registerRole;

      const newAcc: UserAccount = {
        id: uid,
        name: registerName.trim(),
        schoolEmail: registerEmail.trim(),
        schoolId: registerSchoolId.trim(),
        primarySubteam: registerPrimary,
        secondarySubteam: registerSecondary,
        role: initialRole,
        status: initialStatus,
        createdAt: Date.now(),
        leadership: registerLeadership
      };

      await setDoc(doc(db, 'users', uid), newAcc);
      
      // Send email to team mentor/captains
      const mentorsAndCaptains = accounts.filter(a => a.role === 'mentor_captain' || a.role === 'mentor' || a.role === 'captain');
      mentorsAndCaptains.forEach(mc => {
        sendEmailNotification(
          mc.schoolEmail,
          `[FTC #6567] New Access Request: ${newAcc.name}`,
          `Hello ${mc.name},

A new user has requested database access to the FTC #6567 Workspace:
• Name: ${newAcc.name}
• Email: ${newAcc.schoolEmail}
• Requested Role: ${newAcc.role === 'mentor' ? 'Coach / Mentor' : newAcc.role === 'captain' ? 'Subteam Lead / Captain' : newAcc.role === 'mentor_captain' ? 'Mentor / Captain' : 'Team Member'}
• Leadership Value: ${newAcc.leadership || 'None'}
• Primary Subteam: ${newAcc.primarySubteam}
• Secondary Subteam: ${newAcc.secondarySubteam !== 'None' ? newAcc.secondarySubteam : 'None'}

Please log in to the FTC Workspace and open the "Team Approvals" panel in the dashboard to review and approve this request.

Best regards,
FTC #6567 Robotics Log System`
        );
      });

      // Clear registration controls and prefill login credentials
      setLoginEmail(registerEmail.trim());
      setLoginSchoolId('');
      
      setRegisterName('');
      setRegisterEmail('');
      setRegisterSchoolId('');
      setRegisterPrimary('Design/Build/Fabrication');
      setRegisterSecondary('None');
      setRegisterRole('member');
      setRegisterLeadership('None');

      setAuthMode('login');
      if (shouldAutoApprove) {
        showToast('Success! Developer/Mentor account registered and approved automatically!', 'success');
      } else {
        showToast('Success! Your request is in the queue to be approved by a mentor/captain.', 'success');
      }
    } catch (e: any) {
      showToast(`Registration failed: ${e.message}`, 'danger');
    }
  };

  const handleRefreshStatus = async () => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, 'users', currentUser.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const matched = docSnap.data() as UserAccount;
        setCurrentUser(matched);
        if (matched.status === 'Approved') {
          showToast('Your registration is APPROVED! Access granted.', 'success');
        } else if (matched.status === 'Rejected') {
          showToast('Your Access Request was Rejected.', 'danger');
        } else {
          showToast('Status is still Pending. Ask a Mentor/Captain to approve.', 'info');
        }
      }
    } catch (e) {
      showToast('Failed to check status from database.', 'danger');
    }
  };

  const handleRequestReset = (targetEmail: string) => {
    const acc = accounts.find(a => a.schoolEmail.toLowerCase() === targetEmail.trim().toLowerCase());
    if (!acc) {
      showToast('No record matches this school email address in our directory.', 'danger');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedResetCode(code);
    setResetEmail(acc.schoolEmail);
    localStorage.setItem('ftc_active_reset_code', code);
    localStorage.setItem('ftc_active_reset_email', acc.schoolEmail);

    sendEmailNotification(
      acc.schoolEmail,
      '[FTC #6567] SECURITY PROTOCOL: Password Reset Token',
      `Dear ${acc.name},

We received a standard security handshake request to reset your Password / School ID (Lunch #).

Your active credentials can be updated using the 6-digit cryptographic verification code below:

🔑 RESET SECURITY CODE: ${code}

DIRECTIONS:
1. Copy the 6-digit RESET SECURITY CODE listed above.
2. Return to the FTC Engineering Log app.
3. Paste the code into the verification field along with your new Lunch number.

Note: If you did not initiate this system action, you can safely continue logging in with your existing credentials.

Kind regards,
FTC Team #6567 IT Administration`
    );

    setAuthMode('forgot_password');
    showToast('Success! A 6-digit security reset code was sent to your school email!', 'success');
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedCode = localStorage.getItem('ftc_active_reset_code') || generatedResetCode;
    const storedEmail = localStorage.getItem('ftc_active_reset_email') || resetEmail;

    if (!resetEmail.trim() || !resetCodeInput.trim() || !resetNewPassword.trim()) {
      showToast('All fields are required to secure this reset request.', 'danger');
      return;
    }

    if (resetEmail.trim().toLowerCase() !== (storedEmail || '').trim().toLowerCase()) {
      showToast('The email address does not match the active reset ticket.', 'danger');
      return;
    }

    if (resetCodeInput.trim() !== storedCode) {
      showToast('The security verification token is invalid or expired.', 'danger');
      return;
    }

    const matchedAccount = accounts.find(a => a.schoolEmail.toLowerCase() === resetEmail.trim().toLowerCase());
    if (matchedAccount) {
      try {
        // Authenticate the user temporarily using their existing credentials,
        // then update the password using Firebase Auth's updatePassword client SDK.
        let userCredential;
        const passwordToTry1 = matchedAccount.hasCustomPassword ? matchedAccount.schoolId : matchedAccount.schoolId + "_ftc_auth";
        const passwordToTry2 = matchedAccount.schoolId;

        try {
          userCredential = await signInWithEmailAndPassword(auth, matchedAccount.schoolEmail, passwordToTry1);
        } catch (authErr1) {
          try {
            userCredential = await signInWithEmailAndPassword(auth, matchedAccount.schoolEmail, passwordToTry2);
          } catch (authErr2) {
            // If they don't exist yet in Auth, create them directly with the new password
            try {
              userCredential = await createUserWithEmailAndPassword(auth, matchedAccount.schoolEmail, resetNewPassword.trim());
            } catch (createErr: any) {
              throw new Error(`Authentication synchronization failed: ${createErr.message}`);
            }
          }
        }

        if (userCredential && auth.currentUser) {
          try {
            await updatePassword(auth.currentUser, resetNewPassword.trim());
          } catch (updateErr: any) {
            console.warn("Auth updatePassword warning:", updateErr);
          }
        }

        const updatedDoc = {
          ...matchedAccount,
          schoolId: resetNewPassword.trim(),
          hasCustomPassword: true
        };
        await setDoc(doc(db, 'users', matchedAccount.id), updatedDoc);
        
        // Always log out immediately after resetting passwords in a guest context
        await signOut(auth);

        showToast('Password reset verified and saved to database successfully!', 'success');
      } catch (err: any) {
        showToast(`Failed to update password: ${err.message}`, 'danger');
      }
    } else {
      showToast('Failed to find registered account associated with reset ticket.', 'danger');
    }

    // Clear reset states
    setResetEmail('');
    setResetCodeInput('');
    setResetNewPassword('');
    setGeneratedResetCode('');
    localStorage.removeItem('ftc_active_reset_code');
    localStorage.removeItem('ftc_active_reset_email');

    setAuthMode('login');
  };

  // Automated prompt trigger for accounts without custom passwords
  useEffect(() => {
    if (currentUser && !currentUser.hasCustomPassword) {
      const timer = setTimeout(() => {
        setShowPasswordSetupPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowPasswordSetupPrompt(false);
    }
  }, [currentUser]);

  const handleSetupCustomPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupCustomPassword.trim() || !setupConfirmPassword.trim()) {
      showToast('All fields are required.', 'danger');
      return;
    }
    if (setupCustomPassword.trim() !== setupConfirmPassword.trim()) {
      showToast('Passwords do not match.', 'danger');
      return;
    }
    if (setupCustomPassword.trim().length < 6) {
      showToast('Password must be at least 6 characters long to be secure.', 'danger');
      return;
    }

    setIsSettingUpPassword(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, setupCustomPassword.trim());
      }
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          schoolId: setupCustomPassword.trim(),
          hasCustomPassword: true
        };
        await setDoc(doc(db, 'users', currentUser.id), updatedUser);
        setCurrentUser(updatedUser);
        localStorage.setItem('ftc_current_user', JSON.stringify(updatedUser));
      }
      setShowPasswordSetupPrompt(false);
      showToast('Secure custom password configured successfully! Use this password for future sign-ins.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to configure custom password: ${err.message}`, 'danger');
    } finally {
      setIsSettingUpPassword(false);
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      backupMetadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser?.schoolEmail || 'System Administrator',
        team: 'FTC #6567 (RoboRaiders)',
        season: '2026-2027'
      },
      users: accounts,
      journalEntries: entries,
      timeEntries: timeEntries,
      kanbanTasks: kanbanTasks,
      outreachEvents: outreachEvents,
      xpAdjustments: xpAdjustments,
      dispatchedEmails: dispatchedEmails
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(d.getHours()).padStart(2, '0')}-${String(d.getMinutes()).padStart(2, '0')}`;
    
    link.href = url;
    link.download = `RoboRaiders_FTC6567_Database_Backup_${dateStr}_${timeStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Database backup file successfully exported and downloaded!', 'success');
  };

  const handleRunTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (transitionConfirmCode.trim() !== 'RESET_SEASON') {
      showToast('Validation mismatch. Please type "RESET_SEASON" to verify.', 'danger');
      return;
    }

    // Force download a backup first to ensure no data is ever lost!
    try {
      handleDownloadBackup();
      showToast('Auto-backup generated successfully before season transition.', 'success');
    } catch (err) {
      console.error('Backup failed:', err);
      showToast('Backup failed. Clean up aborted for your safety.', 'danger');
      return;
    }

    setIsProcessingTransition(true);
    setTransitionProgress({ current: 0, total: 1, collection: 'Initiating...' });

    try {
      // Create list of deletions
      const deletionsQueue: { colName: string, docId: string }[] = [];

      // 1. Journal entries
      if (transitionState.journalEntries) {
        entries.forEach(item => {
          if (item.id !== 'demo-1' && item.id !== 'demo-2') {
            deletionsQueue.push({ colName: 'journalEntries', docId: item.id });
          }
        });
      }

      // 2. Time entries
      if (transitionState.timeEntries) {
        timeEntries.forEach(item => {
          deletionsQueue.push({ colName: 'timeEntries', docId: item.id });
        });
      }

      // 3. Kanban tasks
      if (transitionState.kanbanTasks) {
        kanbanTasks.forEach(item => {
          deletionsQueue.push({ colName: 'kanbanTasks', docId: item.id });
        });
      }

      // 4. Outreach events
      if (transitionState.outreachEvents) {
        outreachEvents.forEach(item => {
          deletionsQueue.push({ colName: 'outreachEvents', docId: item.id });
        });
      }

      // 5. XP adjustments
      if (transitionState.xpAdjustments) {
        xpAdjustments.forEach(item => {
          deletionsQueue.push({ colName: 'xpAdjustments', docId: item.id });
        });
      }

      // 6. Dispatched Emails
      if (transitionState.dispatchedEmails) {
        dispatchedEmails.forEach(item => {
          deletionsQueue.push({ colName: 'dispatchedEmails', docId: item.id });
        });
      }

      // 7. Users
      if (transitionState.clearPendingUsers) {
        // Find users with status 'Pending'
        accounts.forEach(user => {
          const isMe = currentUser?.id === user.id || currentUser?.schoolEmail === user.schoolEmail;
          const isMentor = user.role === 'mentor' || user.role === 'mentor_captain';
          if (user.status === 'Pending' && !isMe && !isMentor) {
            deletionsQueue.push({ colName: 'users', docId: user.id });
          }
        });
      }

      if (transitionState.resetStudents) {
        // Clear student accounts altogether
        accounts.forEach(user => {
          const isMe = currentUser?.id === user.id || currentUser?.schoolEmail === user.schoolEmail;
          const isMentor = user.role === 'mentor' || user.role === 'mentor_captain';
          if (!isMe && !isMentor) {
            deletionsQueue.push({ colName: 'users', docId: user.id });
          }
        });
      }

      const totalItems = deletionsQueue.length;
      if (totalItems === 0) {
        showToast('No active database records matched the selected transition filters.', 'info');
        setIsProcessingTransition(false);
        setTransitionProgress(null);
        setIsBackupTransitionOpen(false);
        setTransitionConfirmCode('');
        return;
      }

      // Delete items sequentially or in fast batches, reporting progress to the UI
      let count = 0;
      for (const deletion of deletionsQueue) {
        count++;
        setTransitionProgress({
          current: count,
          total: totalItems,
          collection: `${deletion.colName} (${deletion.docId})`
        });

        try {
          await deleteDoc(doc(db, deletion.colName, deletion.docId));
        } catch (err: any) {
          console.error(`Failed to delete doc in ${deletion.colName}:`, err);
        }
      }

      showToast(`Clean up complete! Successfully cleared ${count} records. Database transition completed.`, 'success');
      setIsBackupTransitionOpen(false);
      setTransitionConfirmCode('');
    } catch (err: any) {
      console.error(err);
      showToast(`Database transition halted: ${err.message}`, 'danger');
    } finally {
      setIsProcessingTransition(false);
      setTransitionProgress(null);
    }
  };

  const openSettingsModal = () => {
    if (currentUser) {
      setSettingsName(currentUser.name);
      setSettingsEmail(currentUser.schoolEmail);
      setSettingsSchoolId(currentUser.schoolId);
      setSettingsPrimary(currentUser.primarySubteam);
      setSettingsSecondary(currentUser.secondarySubteam);
      setIsSettingsOpen(true);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!settingsName.trim()) {
      showToast('Name is required.', 'danger');
      return;
    }
    if (!settingsEmail.trim()) {
      showToast('School Email is required.', 'danger');
      return;
    }
    if (!settingsSchoolId.trim()) {
      showToast('Password / School ID is required.', 'danger');
      return;
    }

    const emailToFind = settingsEmail.trim().toLowerCase();
    const emailConflict = accounts.some(a => a.id !== currentUser.id && a.schoolEmail.toLowerCase() === emailToFind);
    if (emailConflict) {
      showToast('This email is already registered by another account.', 'danger');
      return;
    }

    const u = {
      ...currentUser,
      name: settingsName.trim(),
      schoolEmail: settingsEmail.trim(),
      schoolId: settingsSchoolId.trim(),
      primarySubteam: settingsPrimary,
      secondarySubteam: settingsSecondary
    };

    try {
      await setDoc(doc(db, 'users', currentUser.id), u);
      setCurrentUser(u);
      localStorage.setItem('ftc_current_user', JSON.stringify(u));
      setIsSettingsOpen(false);
      showToast('Your settings have been updated successfully!', 'success');
    } catch (err: any) {
      showToast(`Failed to save settings: ${err.message}`, 'danger');
    }
  };

  const saveEntriesToLocalStorage = (newEntries: JournalEntry[]) => {
    localStorage.setItem('ftc_journal_entries', JSON.stringify(newEntries));
    setEntries(newEntries);
    syncEntriesToFirestore(newEntries).catch(console.error);
  };

  const loadDemoData = () => {
    saveEntriesToLocalStorage(DEMO_ENTRIES);
    setSelectedEntry(DEMO_ENTRIES[0] || null);
    saveKanbanTasksToLocalStorage(DEFAULT_KANBAN_TASKS);
    saveOutreachEventsToLocalStorage(DEFAULT_OUTREACH_EVENTS);
    showToast('Clean portal sandbox database initialized!', 'info');
  };

  const clearAllData = () => {
    if (window.confirm("Delete ALL cached journal records, kanban tasks, and outreach logs permanently from this browser? Take backup first!")) {
      saveEntriesToLocalStorage([]);
      setSelectedEntry(null);
      saveKanbanTasksToLocalStorage([]);
      saveOutreachEventsToLocalStorage([]);
      showToast('Wiped browser database sandbox cache.', 'info');
    }
  };

  const handleAddProblemField = () => {
    setFormProblemsAndSolutions([...formProblemsAndSolutions, '']);
  };

  const handleUpdateProblemField = (index: number, value: string) => {
    const updated = [...formProblemsAndSolutions];
    updated[index] = value;
    setFormProblemsAndSolutions(updated);
  };

  const handleRemoveProblemField = (index: number) => {
    const updated = formProblemsAndSolutions.filter((_, i) => i !== index);
    setFormProblemsAndSolutions(updated.length === 0 ? [''] : updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processUploadedFiles(e.target.files);
    }
  };

  const processUploadedFiles = async (files: FileList) => {
    setIsImageProcessing(true);
    const loadedImages: JournalImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        showToast(`Skipped "${file.name}" (unsupported file format)`, 'danger');
        continue;
      }

      try {
        // High density compress canvas logic
        const compressedBase64 = await compressAndResizeImage(file, 800, 0.75);
        loadedImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          size: file.size,
          dataUrl: compressedBase64
        });
      } catch (err) {
        showToast(`Failed optimizing: "${file.name}"`, 'danger');
      }
    }

    setFormImages((prev) => [...prev, ...loadedImages]);
    setIsImageProcessing(false);
    showToast(`Buffered ${loadedImages.length} image attachments`, 'success');
  };

  const handleRemoveImage = (imgId: string) => {
    setFormImages((prev) => prev.filter((img) => img.id !== imgId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) {
      await processUploadedFiles(e.dataTransfer.files);
    }
  };

  const showToast = (text: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const resetForm = () => {
    const isStudentSubteam = currentUser && ['Design/Build/Fabrication', 'Programming', 'Outreach', 'Business & Media'].includes(currentUser.primarySubteam);
    setFormSubteam((currentUser && isStudentSubteam) ? currentUser.primarySubteam as Subteam : 'Design/Build/Fabrication');
    setFormAuthor(currentUser ? currentUser.name : '');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPlanned('');
    setFormAccomplished('');
    setFormProblemsAndSolutions(['']);
    setFormPlanNextTime('');
    setFormImages([]);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProfileName.trim()) {
      showToast('Name is required.', 'danger');
      return;
    }
    if (!newProfileEmail.trim()) {
      showToast('School Email is required.', 'danger');
      return;
    }
    if (!newProfileSchoolId.trim()) {
      showToast('School ID (lunch #) is required.', 'danger');
      return;
    }

    if (editingProfileId) {
      const oldProfile = accounts.find(p => p.id === editingProfileId);
      const oldName = oldProfile?.name || '';
      const newName = newProfileName.trim();

      const u = {
        ...oldProfile,
        id: editingProfileId,
        name: newName,
        schoolEmail: newProfileEmail.trim(),
        schoolId: newProfileSchoolId.trim(),
        primarySubteam: newProfilePrimary as any,
        secondarySubteam: newProfileSecondary,
        leadership: newProfileLeadership,
        role: newProfileRole
      } as UserAccount;

      try {
        await setDoc(doc(db, 'users', editingProfileId), u);
        const updatedAccounts = accounts.map(p => p.id === editingProfileId ? u : p);
        setAccounts(updatedAccounts);

        // Propagate name change to journals
        if (oldName && oldName !== newName) {
          const updatedEntries = entries.map(entry => {
            if (entry.author === oldName) {
              const updatedEntry = { ...entry, author: newName };
              setDoc(doc(db, 'journalEntries', entry.id), updatedEntry).catch(console.error);
              return updatedEntry;
            }
            return entry;
          });
          setEntries(updatedEntries);
        }

        // If formAuthor was selecting this user, keep it updated
        if (formAuthor === oldName) {
          setFormAuthor(newName);
        }

        // If currentUser is the one being edited, update it too
        if (currentUser && currentUser.id === editingProfileId) {
          setCurrentUser(u);
          localStorage.setItem('ftc_current_user', JSON.stringify(u));
        }

        closeCreateProfileModal();
        showToast(`Successfully updated profile details for ${newName}!`, 'success');
      } catch (err: any) {
        showToast(`Failed to update profile: ${err.message}`, 'danger');
      }
    } else {
      const newAcc: UserAccount = {
        id: `user-${Date.now()}`,
        name: newProfileName.trim(),
        schoolEmail: newProfileEmail.trim(),
        schoolId: newProfileSchoolId.trim(),
        primarySubteam: newProfilePrimary,
        secondarySubteam: newProfileSecondary,
        role: newProfileRole,
        status: 'Approved',
        createdAt: Date.now(),
        leadership: newProfileLeadership
      };

      try {
        await setDoc(doc(db, 'users', newAcc.id), newAcc);
        const updated = [...accounts, newAcc];
        setAccounts(updated);

        // Automatically select the new user in our journal form
        setFormAuthor(newAcc.name);

        closeCreateProfileModal();
        showToast(`Successfully registered ${newAcc.name}!`, 'success');
      } catch (err: any) {
        showToast(`Failed to register user: ${err.message}`, 'danger');
      }
    }
  };

  const handleStartEditProfile = (authorName: string) => {
    const profileToEdit = accounts.find(p => p.name === authorName);
    if (!profileToEdit) {
      showToast('No profile found for selected author.', 'danger');
      return;
    }
    setEditingProfileId(profileToEdit.id);
    setNewProfileName(profileToEdit.name);
    setNewProfileEmail(profileToEdit.schoolEmail);
    setNewProfileSchoolId(profileToEdit.schoolId);
    setNewProfilePrimary(profileToEdit.primarySubteam as any);
    setNewProfileSecondary(profileToEdit.secondarySubteam);
    setNewProfileLeadership(profileToEdit.leadership || 'None');
    setNewProfileRole(profileToEdit.role);
    setIsCreateProfileOpen(true);
  };

  const closeCreateProfileModal = () => {
    setIsCreateProfileOpen(false);
    setEditingProfileId(null);
    setNewProfileName('');
    setNewProfileEmail('');
    setNewProfileSchoolId('');
    setNewProfilePrimary('Design/Build/Fabrication');
    setNewProfileSecondary('None');
    setNewProfileLeadership('None');
    setNewProfileRole('member');
    if (formAuthor === '___CREATE_NEW___') {
      setFormAuthor(profiles.length > 0 ? profiles[0].name : '');
    }
  };

  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('You must be signed in to clock in.', 'danger');
      return;
    }
    const session: ClockInSession = {
      startTime: Date.now(),
      subteam: clockInSubteam,
      taskDescription: clockInDesc.trim() || 'General laboratory support contribution.'
    };
    setActiveSession(session);
    setClockInDesc('');
    showToast(`Successfully CLOCKED IN for ${clockInSubteam}!`, 'success');
  };

  const handleUpdateActiveSessionTask = (desc: string) => {
    if (!activeSession) return;
    setActiveSession({
      ...activeSession,
      taskDescription: desc
    });
  };

  const handleClockOut = () => {
    if (!activeSession || !currentUser) return;
    const diffMs = Date.now() - activeSession.startTime;
    const durationHours = Math.max(0.1, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));
    
    // Create new time entry
    const newEntry: TimeEntry = {
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.schoolEmail,
      subteam: activeSession.subteam,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      durationHours,
      taskDescription: activeSession.taskDescription || 'General laboratory support contribution.',
      createdAt: Date.now()
    };
    
    const updated = [newEntry, ...timeEntries];
    setTimeEntries(updated);
    syncTimeEntriesToFirestore(updated).catch(console.error);
    setActiveSession(null);
    showToast(`Logged ${durationHours.toFixed(2)} hours for ${activeSession.subteam}!`, 'success');
  };

  const handleManualTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('You must be signed in to log hours.', 'danger');
      return;
    }
    if (!manualTimeDesc.trim()) {
      showToast('Please describe the contribution details.', 'danger');
      return;
    }
    
    // Calculate hours from start and end time strings
    const [startH, startM] = manualTimeStart.split(':').map(Number);
    const [endH, endM] = manualTimeEnd.split(':').map(Number);
    let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMins < 0) diffMins += 24 * 60; // handle overnight workshop shift
    
    const durationHours = parseFloat((diffMins / 60).toFixed(2));
    if (durationHours <= 0) {
      showToast('End time must be after start time.', 'danger');
      return;
    }
    
    const newEntry: TimeEntry = {
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.schoolEmail,
      subteam: manualTimeSubteam,
      date: manualTimeDate,
      startTime: manualTimeStart,
      endTime: manualTimeEnd,
      durationHours,
      taskDescription: manualTimeDesc.trim(),
      createdAt: Date.now()
    };
    
    const updated = [newEntry, ...timeEntries];
    setTimeEntries(updated);
    syncTimeEntriesToFirestore(updated).catch(console.error);
    setManualTimeDesc('');
    showToast(`Logged ${durationHours} hours manually onto ${manualTimeSubteam}!`, 'success');
  };

  const handleDeleteTimeEntry = (id: string, name: string) => {
    if (window.confirm(`Permanently rescind the hour log contribution from ${name}?`)) {
      const updated = timeEntries.filter(t => t.id !== id);
      setTimeEntries(updated);
      syncTimeEntriesToFirestore(updated).catch(console.error);
      showToast('Time entry revoked.', 'info');
    }
  };

  const handleEditTimeEntry = (entry: TimeEntry) => {
    setEditingTimeEntry(entry);
    setEditTimeDate(entry.date);
    setEditTimeSubteam(entry.subteam);
    setEditTimeStart(entry.startTime);
    setEditTimeEnd(entry.endTime);
    setEditTimeDesc(entry.taskDescription);
  };

  const handleUpdateEditTimeEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimeEntry) return;
    if (!editTimeDesc.trim()) {
      showToast('Please describe the contribution details.', 'danger');
      return;
    }

    const [startH, startM] = editTimeStart.split(':').map(Number);
    const [endH, endM] = editTimeEnd.split(':').map(Number);
    let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMins < 0) diffMins += 24 * 60; // handle overnight workshop shift
    
    const durationHours = parseFloat((diffMins / 60).toFixed(2));
    if (durationHours <= 0) {
      showToast('End time must be after start time.', 'danger');
      return;
    }

    const updated = timeEntries.map(t => {
      if (t.id === editingTimeEntry.id) {
        return {
          ...t,
          date: editTimeDate,
          subteam: editTimeSubteam,
          startTime: editTimeStart,
          endTime: editTimeEnd,
          durationHours,
          taskDescription: editTimeDesc.trim()
        };
      }
      return t;
    });

    setTimeEntries(updated);
    syncTimeEntriesToFirestore(updated).catch(console.error);

    setEditingTimeEntry(null);
    showToast('Time card entry updated successfully.', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formAuthor.trim()) {
      showToast('Reporter/Author field is required.', 'danger');
      return;
    }
    if (!formPlanned.trim()) {
      showToast('Planning overview cannot be left blank.', 'danger');
      return;
    }
    if (!formAccomplished.trim()) {
      showToast('Accomplishments record list is required.', 'danger');
      return;
    }

    const cleanedProblems = formProblemsAndSolutions
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const stamp = Date.now();

    if (isEditing && editingId) {
      const updated = entries.map((entry) => {
        if (entry.id === editingId) {
          const u: JournalEntry = {
            ...entry,
            subteam: formSubteam,
            author: formAuthor.trim(),
            date: formDate,
            planned: formPlanned.trim(),
            accomplished: formAccomplished.trim(),
            problemsAndSolutions: cleanedProblems,
            planNextTime: formPlanNextTime.trim(),
            images: formImages,
            updatedAt: stamp,
            status: submissionType,
            reviewer: null,
            reviewNotes: null,
            reviewedAt: null
          };
          setSelectedEntry(u);
          return u;
        }
        return entry;
      });
      saveEntriesToLocalStorage(updated);
      showToast(submissionType === 'Pending Review' ? 'Journal entry submitted for review!' : 'Draft record updated successfully.', 'success');
    } else {
      const u: JournalEntry = {
        id: `entry-${stamp}-${Math.random().toString(36).substr(2, 5)}`,
        subteam: formSubteam,
        author: formAuthor.trim(),
        date: formDate,
        planned: formPlanned.trim(),
        accomplished: formAccomplished.trim(),
        problemsAndSolutions: cleanedProblems,
        planNextTime: formPlanNextTime.trim(),
        images: formImages,
        createdAt: stamp,
        updatedAt: stamp,
        status: submissionType,
        reviewer: null,
        reviewNotes: null,
        reviewedAt: null
      };
      const updated = [u, ...entries];
      saveEntriesToLocalStorage(updated);
      setSelectedEntry(u);
      showToast(submissionType === 'Pending Review' ? 'Saved & submitted for mentor review!' : 'Draft engineering entry logged.', 'success');
    }

    if (submissionType === 'Pending Review') {
      const mentorsAndCaptains = accounts.filter(a => a.role === 'mentor_captain' || a.role === 'mentor' || a.role === 'captain');
      mentorsAndCaptains.forEach(mc => {
        sendEmailNotification(
          mc.schoolEmail,
          `[FTC #6567] Journal Awaiting Review: ${formAuthor.trim()}`,
          `Hello ${mc.name},

A new journal entry has been submitted to the FTC #6567 Workspace and is awaiting review:

• Author: ${formAuthor.trim()}
• Date of Action: ${formDate}
• Subteam Division: ${formSubteam}

Please log in to the RoboRaiders Team Portal, filter by "Pending Review" on the engineering desk, and inspect the submission to approve or request revision.

Best regards,
FTC #6567 Robotics Log System`
        );
      });
    }

    resetForm();
    setActiveTab('archive');
  };

  const handleEditInit = (entry: JournalEntry) => {
    if (entry.status === 'Approved') {
      showToast('ERROR: This entry has been Approved & Sealed. It is locked from editing under team protocols.', 'danger');
      return;
    }
    setFormSubteam(entry.subteam);
    setFormAuthor(entry.author);
    setFormDate(entry.date);
    setFormPlanned(entry.planned);
    setFormAccomplished(entry.accomplished);
    setFormProblemsAndSolutions(entry.problemsAndSolutions.length > 0 ? entry.problemsAndSolutions : ['']);
    setFormPlanNextTime(entry.planNextTime);
    setFormImages(entry.images);
    setIsEditing(true);
    setEditingId(entry.id);
    setActiveTab('form');
    showToast('Loaded variables into draft editor.', 'info');
  };

  const handleDeleteEntry = (entryId: string) => {
    const target = entries.find(e => e.id === entryId);
    if (target && target.status === 'Approved') {
      showToast('ERROR: This entry has been Approved & Sealed. Deletion is restricted.', 'danger');
      return;
    }
    if (window.confirm("Are you sure you want to delete this specific log?")) {
      const updated = entries.filter(e => e.id !== entryId);
      saveEntriesToLocalStorage(updated);
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(updated.length > 0 ? updated[0] : null);
      }
      showToast('Removed entry.', 'info');
    }
  };

  const handleReviewAction = (nextStatus: 'Approved' | 'Needs Revision') => {
    if (!selectedEntry) return;

    if (!reviewNoteInput.trim()) {
      showToast('ERROR: Please add an Action Statement / Appraisal Note before locking or returning this log.', 'danger');
      return;
    }

    const stamp = Date.now();
    const updated = entries.map((entry) => {
      if (entry.id === selectedEntry.id) {
        const u: JournalEntry = {
          ...entry,
          status: nextStatus,
          reviewer: currentUser?.name || 'testMentor',
          reviewNotes: reviewNoteInput.trim(),
          reviewedAt: stamp
        };
        setSelectedEntry(u);
        return u;
      }
      return entry;
    });

    saveEntriesToLocalStorage(updated);

    // Dispatch Email updates to the journal author
    const authorEmail = accounts.find(a => 
      selectedEntry.author.toLowerCase().includes(a.schoolEmail.toLowerCase()) || 
      selectedEntry.author.toLowerCase().includes(a.name.toLowerCase()) ||
      a.name.toLowerCase().includes(selectedEntry.author.toLowerCase())
    )?.schoolEmail;

    if (authorEmail) {
      sendEmailNotification(
        authorEmail,
        `[FTC #6567] Journal Review Update: ${nextStatus}`,
        `Hi,

Your engineering journal entry dated ${selectedEntry.date} for subteam "${selectedEntry.subteam}" has been reviewed by a Team Mentor/Captain.

• NEW STATUS: ${nextStatus}
• REVIEWER: ${currentUser?.name || 'testMentor'}
• REVIEW NOTES: 
"${reviewNoteInput.trim()}"

Please log in to the RoboRaiders Team Portal to review comments.

Best regards,
FTC #6567 Captains & Mentors`
      );
    }

    setReviewNoteInput('');
    showToast(
      nextStatus === 'Approved' 
        ? 'Log VERIFIED and SEALED successfully! It is now locked from further edits.' 
        : 'Submission returned to student with review revision requests.', 
      nextStatus === 'Approved' ? 'success' : 'info'
    );
  };

  const handleStatusDropdownChange = (nextStatus: 'Draft' | 'Pending Review' | 'Approved' | 'Needs Revision') => {
    if (!selectedEntry) return;

    const stamp = Date.now();
    const updated = entries.map((entry) => {
      if (entry.id === selectedEntry.id) {
        const u: JournalEntry = {
          ...entry,
          status: nextStatus,
          updatedAt: stamp,
        };

        if (nextStatus === 'Approved') {
          u.reviewer = currentUser?.name || 'testMentor';
          u.reviewedAt = stamp;
          if (!u.reviewNotes) {
            u.reviewNotes = reviewNoteInput.trim() || 'Approved & Locked via status dropdown selection.';
          }
        } else if (nextStatus === 'Needs Revision') {
          u.reviewer = currentUser?.name || 'testMentor';
          u.reviewedAt = stamp;
          if (!u.reviewNotes) {
            u.reviewNotes = reviewNoteInput.trim() || 'Returned for Revision.';
          }
        } else {
          u.reviewer = null;
          u.reviewedAt = null;
          u.reviewNotes = null;
        }

        setSelectedEntry(u);
        return u;
      }
      return entry;
    });

    saveEntriesToLocalStorage(updated);

    // Dispatch Email updates to the journal author
    const authorEmail = accounts.find(a => 
      selectedEntry.author.toLowerCase().includes(a.schoolEmail.toLowerCase()) || 
      selectedEntry.author.toLowerCase().includes(a.name.toLowerCase()) ||
      a.name.toLowerCase().includes(selectedEntry.author.toLowerCase())
    )?.schoolEmail;

    if (authorEmail) {
      const notes = nextStatus === 'Approved' 
        ? (reviewNoteInput.trim() || 'Approved & Locked via status dropdown selection.')
        : nextStatus === 'Needs Revision'
          ? (reviewNoteInput.trim() || 'Returned for Revision.')
          : `Log status updated to ${nextStatus}`;
      sendEmailNotification(
        authorEmail,
        `[FTC #6567] Journal Status Updated to: ${nextStatus}`,
        `Hi,

Your engineering journal entry dated ${selectedEntry.date} for subteam "${selectedEntry.subteam}" has been updated to "${nextStatus}".

• NEW STATUS: ${nextStatus}
• REVIEWER: ${currentUser?.name || 'testMentor'}
• REVIEW NOTES: 
"${notes}"

Please log in to the RoboRaiders Team Portal to review details.

Best regards,
FTC #6567 Captains & Mentors`
      );
    }

    setReviewNoteInput('');
    showToast(
      nextStatus === 'Approved' 
        ? 'Log is now VERIFIED, Sealed, and finalized as complete.' 
        : nextStatus === 'Needs Revision'
          ? 'Log is marked as Needs Revision. Active editing is enabled.'
          : nextStatus === 'Draft'
            ? 'Log is now reverted to Working Draft. Remaining editable in draft.'
            : `Log status updated to ${nextStatus}`,
      nextStatus === 'Approved' ? 'success' : 'info'
    );
  };

  const handleExportJSON = () => {
    if (entries.length === 0) {
      showToast('Database is currently empty.', 'danger');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'FTC_Team_Journal_Database.json');
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Downloaded local backup file.', 'success');
  };

  const handlePrintPDF = () => {
    let filtered: JournalEntry[] = [];
    if (exportScope === 'all') {
      filtered = [...entries];
    } else {
      filtered = entries.filter(e => {
        const subteamMatch = exportSubteam === 'All' || e.subteam === exportSubteam;
        const statusMatch = exportStatus === 'All' || e.status === exportStatus;
        return subteamMatch && statusMatch;
      });
    }

    if (filtered.length === 0) {
      showToast('No matching journal entries found for the selected export criteria.', 'danger');
      return;
    }

    setEntriesToPrint(filtered);
    setIsExportModalOpen(false);

    // Delay printing slightly so the virtual DOM updates the batch element
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintTimePDF = () => {
    let filtered: TimeEntry[] = [];
    if (timeExportScope === 'all') {
      filtered = [...timeEntries];
    } else if (timeExportScope === 'members') {
      if (selectedTimeExportMembers.length === 0) {
        showToast('Please select at least one team member to export.', 'danger');
        return;
      }
      filtered = timeEntries.filter(t => selectedTimeExportMembers.includes(t.userEmail));
    } else if (timeExportScope === 'subteam') {
      filtered = timeEntries.filter(t => {
        return selectedTimeExportSubteam === 'All' || t.subteam === selectedTimeExportSubteam;
      });
    }

    if (filtered.length === 0) {
      showToast('No matching time card entries found for the selected export criteria.', 'danger');
      return;
    }

    setTimeEntriesToPrint(filtered);
    setIsTimeExportModalOpen(false);

    // Delay printing slightly so the virtual DOM updates the batch element
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const r = new FileReader();
      r.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (Array.isArray(imported)) {
            const isValid = imported.every(x => x.id && x.subteam && x.author && x.date && 'planned' in x && 'accomplished' in x);
            if (!isValid) {
              showToast('Invalid format: Missing engineering keys.', 'danger');
              return;
            }

            if (window.confirm(`Found ${imported.length} journal logs. Append to current local sandbox?`)) {
              const merged = [...imported];
              entries.forEach(e => {
                if (!merged.some(m => m.id === e.id)) {
                  merged.push(e);
                }
              });
              merged.sort((a,b) => b.date.localeCompare(a.date));
              saveEntriesToLocalStorage(merged);
              setSelectedEntry(merged[0]);
              showToast(`Import completed. Sync'd ${imported.length} records.`, 'success');
            }
          }
        } catch (err) {
          showToast('JSON structure parse failure.', 'danger');
        }
      };
      r.readAsText(file);
    }
  };

  const handleCopyMarkdown = (entry: JournalEntry) => {
    const md = `# FTC Team Engineering Log - ${entry.subteam} Subteam

**Date:** ${entry.date}  
**Reporter/Author:** ${entry.author}  

---

### Phase 4: Objectives & Plans
${entry.planned}

### Phase 5: Executed & Completed
${entry.accomplished}

### Phase 6: Core Roadblocks & Countermeasures
${entry.problemsAndSolutions.map((p, idx) => `**${idx + 1}.** ${p}`).join('\n\n')}
${entry.problemsAndSolutions.length === 0 ? '_No failures or blockers documented for this session._' : ''}

### Phase 7: Planned Actions for Next Time
${entry.planNextTime || '_No carry-over specified._'}
`;

    navigator.clipboard.writeText(md).then(() => {
      showToast('Copied crisp Markdown text blocks to clipboard!', 'success');
    }).catch(() => {
      showToast('Fails to access client clipboard.', 'danger');
    });
  };

  const filteredEntries = entries.filter((entry) => {
    if (filters.subteam !== 'All' && entry.subteam !== filters.subteam) return false;
    if (filters.author.trim() && !entry.author.toLowerCase().includes(filters.author.toLowerCase())) return false;
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const probs = Array.isArray(entry.problemsAndSolutions) ? entry.problemsAndSolutions : [];
      const fields = [
        entry.author || '',
        entry.planned || '',
        entry.accomplished || '',
        entry.planNextTime || '',
        entry.subteam || '',
        entry.date || '',
        ...probs
      ].join(' ').toLowerCase();
      if (!fields.includes(q)) return false;
    }
    if (filters.startDate && entry.date < filters.startDate) return false;
    if (filters.endDate && entry.date > filters.endDate) return false;
    if (filters.status !== 'All') {
      const s = entry.status || 'Pending Review';
      if (s !== filters.status) return false;
    }
    return true;
  });

  const filteredTimeEntries = timeEntries.filter(t => {
    const matchesSearch = 
      t.userName.toLowerCase().includes(timeSearch.toLowerCase()) || 
      t.taskDescription.toLowerCase().includes(timeSearch.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(timeSearch.toLowerCase());
    const matchesSubteam = timeSubteamFilter === 'All' || t.subteam === timeSubteamFilter;
    return matchesSearch && matchesSubteam;
  });

  // Conditional Auth / Approvals screens
  if (!currentUser) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans p-4 border-t-8 border-brand transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`} id="auth-root">
        {/* Toast alerts inside login page */}
        {statusMessage && (
          <div className="fixed top-4 right-4 max-w-sm z-50 shadow-lg border animate-slide-in">
            <div className={`p-3 rounded-md text-xs font-bold flex items-center gap-2.5 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-100 border-emerald-400 text-emerald-950' 
                : statusMessage.type === 'danger'
                ? 'bg-rose-100 border-rose-400 text-rose-900'
                : 'bg-indigo-100 border-indigo-400 text-indigo-950'
            }`}>
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          </div>
        )}

        <div className="w-full max-w-md bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-xl flex flex-col items-center justify-center relative">
          {/* Logo */}
          <div className="mb-5 flex flex-col items-center text-center">
            <RoboraidersLogo className="w-16 h-16 text-brand mb-2" />
            <h1 className="text-md font-black tracking-widest text-slate-900 dark:text-slate-100 uppercase font-display select-none animate-pulse">
              RoboRaiders Team Portal
            </h1>
            <p className="text-[10px] text-slate-500 font-mono mt-1">FTC Team #6567</p>
          </div>

          {authMode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="text-center mb-1">
                <span className="text-[10px] font-black text-brand bg-brand/10 px-2 py-0.5 rounded uppercase tracking-widest">Team members only</span>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  School Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. m_member@school.edu"
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-800 dark:text-slate-100 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  School ID / Password (lunch #)
                </label>
                <input
                  type="password"
                  value={loginSchoolId}
                  onChange={(e) => setLoginSchoolId(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-800 dark:text-slate-100 font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-hover text-white font-extrabold text-xs py-2 px-4 rounded uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" /> <span>Sign In to System</span>
              </button>

              <div className="flex flex-col gap-2 pt-2 items-center text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-[11px] text-slate-500 hover:text-brand font-bold transition-colors uppercase tracking-wider cursor-pointer font-sans"
                >
                  Need an account? Request access / Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(loginEmail);
                    setAuthMode('forgot_password');
                  }}
                  className="text-[10px] text-rose-500 hover:text-rose-600 font-bold transition-colors uppercase tracking-wider cursor-pointer font-sans"
                >
                  Forgot Password? Request Reset Code
                </button>
              </div>
            </form>
          ) : authMode === 'forgot_password' ? (
            /* Forgot Password Form */
            <form onSubmit={handleConfirmReset} className="w-full space-y-3.5">
              <div className="text-center mb-1">
                <span className="text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-0.5 rounded uppercase tracking-widest">Verify Password Reset</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                Enter your School Email and click 'Send Code' to receive a temporary 6-digit cryptographic verification code inside the Simulated Email logs at the bottom.
              </p>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  School Email Address <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. name@school.edu"
                    className="flex-1 bg-slate-50 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-800 dark:text-slate-100 font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!resetEmail.trim()) {
                        showToast('Please type your School Email first to dispatch the security code.', 'danger');
                        return;
                      }
                      handleRequestReset(resetEmail.trim());
                    }}
                    className="bg-brand hover:bg-brand-hover text-white text-[10px] font-black uppercase tracking-wider px-3 rounded cursor-pointer transition-colors py-1.5"
                  >
                    Send Code
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  6-Digit Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetCodeInput}
                  onChange={(e) => setResetCodeInput(e.target.value)}
                  placeholder="e.g. 529124"
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-800 dark:text-slate-100 font-mono text-center font-bold tracking-widest"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  New Password / School ID (Lunch #) <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Enter New Lunch ID Password"
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-800 dark:text-slate-100 font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2 px-4 rounded uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" /> <span>Confirm &amp; Commit Change</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-[11px] text-slate-500 hover:text-brand font-bold transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="w-full space-y-3.5">
              <div className="text-center mb-1">
                <span className="text-[10px] font-black text-brand bg-brand/10 px-2.5 py-0.5 rounded uppercase tracking-widest">Register Access Profile</span>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-800 dark:text-slate-100 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    School Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="e.g. jdoe@school.edu"
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-800 dark:text-slate-100 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    School ID (Lunch #) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={registerSchoolId}
                    onChange={(e) => setRegisterSchoolId(e.target.value)}
                    placeholder="Lunch Number"
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-800 dark:text-slate-100 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Primary Subteam
                  </label>
                  <select
                    value={registerPrimary}
                    onChange={(e) => setRegisterPrimary(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none font-bold"
                  >
                    <option value="Design/Build/Fabrication">Design/Build/Fabrication</option>
                    <option value="Programming">Programming</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Business & Media">Business & Media</option>
                    {registerRole !== 'member' && (
                      <option value="Mentor">Coach / Mentor</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Secondary Subteam
                  </label>
                  <select
                    value={registerSecondary}
                    onChange={(e) => setRegisterSecondary(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none font-bold"
                  >
                    <option value="None">None</option>
                    <option value="Inspire">Inspire</option>
                    <option value="Strategy">Strategy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Requested User Class / Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={registerRole}
                  onChange={(e) => setRegisterRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none font-black"
                >
                  <option value="member">Student Team Member</option>
                  <option value="mentor">Coach / Mentor</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Leadership
                </label>
                <select
                  value={registerLeadership}
                  onChange={(e) => setRegisterLeadership(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none font-bold"
                >
                  <option value="None">None</option>
                  <option value="Captain">Captain</option>
                  <option value="Subteam leader">Subteam leader</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-hover text-white font-extrabold text-xs py-2 px-4 rounded uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> <span>Request Database Access</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-[11px] text-slate-500 hover:text-brand font-bold transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Already registered? Sign in
                </button>
              </div>
            </form>
          )}


        </div>
      </div>
    );
  }

  // Pending approval screen
  if (currentUser.status === 'Pending') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans p-4 border-t-8 border-brand transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`} id="pending-root">
        {/* Toast alerts inside pending page */}
        {statusMessage && (
          <div className="fixed top-4 right-4 max-w-sm z-50 shadow-lg border animate-slide-in">
            <div className={`p-3 rounded-md text-xs font-bold flex items-center gap-2.5 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-100 border-emerald-400 text-emerald-950' 
                : statusMessage.type === 'danger'
                ? 'bg-rose-100 border-rose-400 text-rose-950'
                : 'bg-indigo-100 border-indigo-400 text-indigo-950'
            }`}>
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          </div>
        )}

        <div className="w-full max-w-md bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-xl flex flex-col items-center justify-center relative">
          
          <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 p-3.5 rounded-full mb-4 animate-pulse">
            <ShieldCheck className="w-10 h-10 animate-pulse" />
          </div>

          <h2 className="text-md font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-widest text-center select-none">
            Access Request Pending
          </h2>
          <p className="text-[11px] text-slate-500 font-mono mt-1 text-center font-bold font-sans">FTC #6567 — WORKSPACE ACCESS CONTROL</p>

          <div className="my-5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-lg w-full text-xs space-y-2 font-mono">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 font-bold">
              <span className="text-slate-400 uppercase tracking-wider text-[9px]">Requested Identity</span>
              <span className="text-slate-800 dark:text-slate-100">{currentUser.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-400 uppercase tracking-wider text-[9px]">Role Group</span>
              <span className="font-extrabold text-brand uppercase text-[10px]">{currentUser.role === 'mentor' ? 'Coach / Mentor' : currentUser.role === 'captain' ? 'Subteam Lead / Captain' : currentUser.role === 'mentor_captain' ? 'Mentor / Captain' : 'Team Member'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-400 uppercase tracking-wider text-[9px]">Email Address</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">{currentUser.schoolEmail}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-400 uppercase tracking-wider text-[9px]">School ID (#)</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">{currentUser.schoolId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 uppercase tracking-wider text-[9px]">Primary Subteam</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatSubteamLabel(currentUser.primarySubteam)}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed font-semibold">
            Thank you for registering! Your account has been filed successfully, but must be reviewed and <strong>approved by an active mentor/captain</strong> before entering the engineering database.
          </p>

          <div className="w-full mt-6 space-y-2.5">
            <button
              onClick={handleRefreshStatus}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 px-4 rounded uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              <RotateCcw className="w-3.5 h-3.5" /> <span>Refresh Approval Status</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-slate-101 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs py-2 px-4 rounded uppercase tracking-wider transition-all border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              <LogOut className="w-3.5 h-3.5" /> <span>Log Out / Cancel</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 w-full text-center">
            <p className="text-[9px] text-indigo-700 dark:text-indigo-400 font-mono leading-relaxed bg-indigo-50/40 dark:bg-indigo-950/15 p-2.5 rounded border border-indigo-150 dark:border-indigo-900/50">
              💡 <strong>Tester Guideline</strong>: To approve this request, click "Log Out / Cancel" and sign in as <strong>System Admin</strong> (admin@school.edu / Password: admin) or <strong>testMentor</strong> (mentor@school.edu / Password: admin123). Go to the "Team Approvals" menu in the header and approve this account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Rejected Page
  if (currentUser.status === 'Rejected') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans p-4 border-t-8 border-brand transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`} id="rejected-root">
        <div className="w-full max-w-md bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-xl flex flex-col items-center justify-center font-sans">
          <div className="bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-3.5 rounded-full mb-4">
            <XCircle className="w-10 h-10" />
          </div>

          <h2 className="text-md font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-widest text-center select-none">
            Access Request Denied
          </h2>
          <p className="text-[10px] text-slate-500 font-mono mt-1 text-center font-bold">FTC #6567 — COMPROMISED OR DECLINED CREDENTIALS</p>

          <div className="my-5 bg-rose-500/5 border border-rose-300/30 p-4 rounded-lg text-center text-xs text-slate-700 dark:text-slate-350 font-medium">
            Your Access Request has been turned down by team mentors/captains. If you believe this was an error, please coordinate directly with testMentor inside the lab workspace.
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2 px-4 rounded uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <LogOut className="w-3.5 h-3.5" /> <span>Back to Login</span>
          </button>
        </div>
      </div>
    );
  }

  const isUserAdminOrMentor = currentUser?.role === 'mentor_captain' || currentUser?.role === 'mentor' || currentUser?.role === 'captain' || currentUser?.schoolEmail === 'admin@school.edu';
  const userGamification = currentUser ? computeUserGamification(currentUser, entries, timeEntries, kanbanTasks, outreachEvents, xpAdjustments) : null;

  return (
    <div className={`min-h-screen flex flex-col font-sans border-t-8 transition-colors duration-200 border-brand ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`} id="main-root">
      
      {/* HIGH DENSITY HEADER SECTION */}
      <header className="bg-slate-900 text-white p-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 shadow-lg no-print">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <RoboraidersLogo className="w-12 h-12" />
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight uppercase font-display text-slate-50 flex items-center gap-1.5">
              <span>RoboRaiders Team Portal</span>
              <span className="text-[10px] tracking-normal font-mono bg-brand/35 text-red-200 border border-brand/50 px-1.5 rounded uppercase">LIVE</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">FTC Team #6567 — ENGINEERING NOTEBOOK WRITER</p>
          </div>
        </div>

        {/* User Quick Stats - Utilizes Topbar for all users */}
        {currentUser && userGamification && (
          <div className="flex flex-wrap items-center gap-3 bg-slate-800/50 border border-slate-800 px-3.5 py-1.5 rounded-lg text-slate-300">
            <div className="flex items-center gap-1.5" title="Your Core Level in RoboRaiders Arena">
              <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-mono text-xs font-black text-amber-400">LVL {userGamification.stats.level}</span>
              <span className="font-mono text-[10px] text-slate-400">({userGamification.stats.xp} XP)</span>
            </div>
            
            <div className="hidden sm:block h-3.5 w-px bg-slate-700" />
            
            <div className="flex items-center gap-1.5 text-xs" title="Total hours contributed in the lab">
              <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-mono text-[11px] font-bold text-slate-200">{userGamification.stats.totalHours.toFixed(1)} hrs</span>
            </div>
            
            <div className="hidden sm:block h-3.5 w-px bg-slate-700" />

            <div className="flex items-center gap-1.5 text-xs" title="Total journal log entries submitted by you">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-mono text-[11px] font-bold text-slate-200">
                {entries.filter(e => e.userEmail === currentUser.schoolEmail).length} logs
              </span>
            </div>
          </div>
        )}

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* THEME TOGGLE BUTTON */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-all uppercase tracking-wider border border-slate-700 flex items-center gap-1.5"
            title="Switch Workspace Theme"
            id="theme-toggle-btn"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
            <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
          </button>

          {isUserAdminOrMentor && (
            <>
              <label className="bg-slate-800 hover:bg-slate-700 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-all uppercase tracking-wider cursor-pointer border border-slate-700 text-slate-300">
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                <span className="flex items-center gap-1"><Upload className="w-3.5 h-3.5" /> Import</span>
              </label>
              <button 
                onClick={handleExportJSON}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-all uppercase tracking-wider border border-slate-700 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Export DB
              </button>

              <button 
                onClick={clearAllData}
                className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-all border border-rose-900/40 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-300" /> Hard Wipe
              </button>
            </>
          )}
        </div>
      </header>

      {/* ACTIVE REAL-ID USER SESSION BANNER */}
      <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex justify-end items-center gap-3 text-xs no-print shrink-0 transition-colors" id="active-session-banner">
        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end shrink-0 text-xs">
          {currentView !== 'landing' && (
            <button
              onClick={() => setCurrentView('landing')}
              className="bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Return to Landing Page Hub"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Dashboard Hub</span>
            </button>
          )}

          {(currentUser?.role === 'mentor_captain' || currentUser?.role === 'mentor' || currentUser?.role === 'captain') && (
            <button
              onClick={() => setIsApprovalsOpen(true)}
              className="bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800 text-purple-200 hover:text-white px-3 py-1 text-xs font-bold transition-all uppercase tracking-wider relative flex items-center gap-1.5 cursor-pointer shadow-xs rounded"
              title="Assess Pending Space Approvals"
              id="approvals-mgr-trigger"
            >
              <Users className="w-3 w-3 text-purple-350" />
              <span>Team Approvals</span>
              {accounts.filter(a => a.status === 'Pending').length > 0 && (
                <span className="bg-red-500 text-white font-mono text-[9px] font-black rounded-full h-4 min-w-4 flex items-center justify-center px-1 animate-pulse border border-red-400 absolute -top-1 px-1 -right-1">
                  {accounts.filter(a => a.status === 'Pending').length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={openSettingsModal}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-350 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1 rounded text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Update User Settings and Password"
            id="user-settings-trigger"
          >
            <Settings className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-300 dark:border-slate-700 px-3 py-1 rounded text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs animate-fade-in"
            title="Sign out of engineering notebook session"
          >
            <LogOut className="w-3 w-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC SYSTEM WORKFLOW INTELLIGENCE NOTIFICATIONS */}
      <AnimatePresence>
        {userRole === 'reviewer' && entries.filter(e => e.status === 'Pending Review').length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-300 px-4 py-2 text-xs flex justify-between items-center gap-2 no-print shrink-0"
          >
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase font-mono">Pending Reviews</span>
              <span className="text-slate-700 dark:text-slate-300">
                🔔 There are <strong>{entries.filter(e => e.status === 'Pending Review').length} entries</strong> awaiting your peer review. Filter by 'Pending Review' to inspect and process them.
              </span>
            </div>
            <button 
              onClick={() => {
                setFilters({ ...filters, status: 'Pending Review' });
                setCurrentView('journal');
                showToast('Filtered entries to show Pending Reviews.', 'info');
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold px-2.5 py-1 rounded text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer"
            >
              Show Pending
            </button>
          </motion.div>
        )}

        {userRole === 'author' && entries.filter(e => e.status === 'Needs Revision').length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-500/10 border-b border-rose-500/30 text-rose-900 dark:text-rose-300 px-4 py-2 text-xs flex justify-between items-center gap-2 no-print shrink-0"
          >
            <div className="flex items-center gap-2">
              <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase font-mono">Revision Alert</span>
              <span className="text-slate-700 dark:text-slate-300">
                ⚠️ A reviewer has returned <strong>{entries.filter(e => e.status === 'Needs Revision').length} of your submissions</strong> for revision. Filter by 'Needs Revision' to modify.
              </span>
            </div>
            <button 
              onClick={() => {
                setFilters({ ...filters, status: 'Needs Revision' });
                setCurrentView('journal');
                showToast("Filtered entries to show 'Needs Revision'.", 'info');
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-2.5 py-1 rounded text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer"
            >
              See Fixes
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SYSTEM TOAST ALERTS */}
      {statusMessage && (
        <div className="no-print fixed top-18 right-4 max-w-sm z-50 shadow-lg border animate-slide-in" id="toast-notif">
          <div className={`p-3 rounded-md text-xs font-bold flex items-center gap-2.5 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-100 border-emerald-400 text-emerald-950' 
              : statusMessage.type === 'danger'
              ? 'bg-rose-100 border-rose-400 text-rose-950'
              : 'bg-indigo-100 border-indigo-400 text-indigo-950'
          }`}>
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* LANDING PAGE HUB */}
      {currentView === 'landing' && (
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 no-print" id="dashboard-landing-hub animate-fade-in">
          {/* Welcome Card & Team Announcement */}
          <div className="bg-slate-900 text-white rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden border border-slate-800 shadow-xl">
            <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-48 h-48 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="z-10 text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight uppercase font-display text-slate-50">
                Welcome back, {currentUser?.name}!
              </h1>
              <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1 items-center justify-center md:justify-start">
                <span className="text-xs text-slate-400 font-mono">
                  Identity: <strong className="text-slate-200">{currentUser?.schoolId}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-mono">
                  Primary Subteam: <strong className="text-slate-200">{formatSubteamLabel(currentUser?.primarySubteam)}</strong>
                </span>
              </div>

              {/* USER XP & RANK PROGRESSION PLATE */}
              {currentUser && (() => {
                const gameResult = computeUserGamification(currentUser, entries, timeEntries, kanbanTasks, outreachEvents, xpAdjustments);
                const { stats } = gameResult;
                return (
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-950/40 border border-slate-800 p-2.5 rounded-lg max-w-md">
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono font-black text-cyan-400 text-xs">
                        {stats.level}
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 leading-none">Rank Info</div>
                        <div className="text-xs font-black text-cyan-400 font-display mt-0.5 max-w-[150px] truncate" title={stats.levelName}>
                          {stats.levelName}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-1 w-full sm:border-l sm:border-slate-800 sm:pl-3">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 leading-none">
                        <span>XP PROGRESSION</span>
                        <span><strong>{stats.xpIntoLevel}</strong> / {stats.xpForNextLevel} XP</span>
                      </div>
                      <div className="w-full h-2 bg-slate-955 border border-slate-800 rounded-full overflow-hidden p-0.5 relative">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full transition-all duration-500" 
                          style={{ width: `${stats.percentToNextLevel}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="bg-slate-955/40 border border-slate-800 p-4 rounded-xl text-center flex flex-col gap-1 shrink-0 z-10 w-full md:w-auto">
              {activeSession ? (
                <div className="flex flex-col items-center">
                  <span className="relative flex h-2.5 w-2.5 mb-1.5 justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">Active Time Card</span>
                  <span className="text-xl font-mono text-white font-black mt-1 leading-none">{sessionElapsed}</span>
                  <button 
                    onClick={() => setCurrentView('time_entry')}
                    className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3.5 rounded transition-all shadow-md flex items-center gap-1 cursor-pointer font-sans"
                  >
                    <Clock className="w-3.5 h-3.5" /> <span>Clock Out Desk</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">Time Card</span>
                  <span className="text-sm font-bold text-slate-200 mt-1 leading-none">Off-duty / Standby</span>
                  <button 
                    onClick={() => setCurrentView('time_entry')}
                    className="mt-3 bg-brand hover:bg-brand-hover text-white font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3.5 rounded transition-all shadow-md flex items-center gap-1 cursor-pointer font-sans"
                  >
                    <Clock className="w-3.5 h-3.5" /> <span>Punch Time Card</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC ROBOTICS CHAMPIONSHIP CONSOLE */}
          {false && currentUser && (
            (() => {
              // Gamification data
              const gameResult = computeUserGamification(currentUser, entries, timeEntries, kanbanTasks, outreachEvents, xpAdjustments);
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
                  const data = computeUserGamification(acc, entries, timeEntries, kanbanTasks, outreachEvents, xpAdjustments);
                  return {
                    account: acc,
                    stats: data.stats,
                    badges: data.badges,
                    quests: data.quests,
                  };
                })
                .sort((a, b) => b.stats.xp - a.stats.xp);

              const handleExportPDF_lounge = () => {
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
                <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-6 shadow-md flex flex-col gap-5 relative overflow-hidden" id="roboraiders-championship-portal">
                  <div className="absolute top-0 right-0 transform translate-x-16 -translate-y-16 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  {/* Dashboard Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <span className="text-[9px] font-mono font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
                          Arena Portal
                        </span>
                      </div>
                      <h2 className="text-base font-extrabold uppercase font-display text-slate-900 dark:text-slate-50 mt-1 flex items-center gap-2">
                        <span>RoboRaiders Cyber-Championship Lounge</span>
                      </h2>
                      <p className="text-[11px] text-slate-550 dark:text-slate-400 font-sans mt-0.5">
                        Earn experience multipliers directly by submitting engineering logs, punching time cards, and solving complex robotics loop blocks.
                      </p>
                    </div>

                    {/* Arena Tabs Navigation */}
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
                              setInspectLeaderboardAccount(null);
                            }}
                            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                              active 
                                ? 'bg-white dark:bg-slate-850 text-cyan-600 dark:text-cyan-400 shadow-sm font-extrabold border-b-2 border-cyan-500' 
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
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-600"></div>
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
                                <span className="text-[10px] font-mono uppercase font-black text-slate-450 tracking-wider">
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
                                <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-slate-600 dark:text-slate-300 font-bold">
                                  {stats.percentToNextLevel}%
                                </div>
                              </div>
                            </div>

                            {/* Core Cumulative Scoreboard Row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
                              <div className="bg-slate-50/70 dark:bg-slate-950/20 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/40 text-center">
                                <Wrench className="w-4 h-4 mx-auto text-slate-500 mb-1" />
                                <div className="text-[10px] font-mono uppercase text-slate-400 leading-none">Workshop Hours</div>
                                <div className="text-sm font-black font-mono text-slate-850 dark:text-slate-100 mt-1">{stats.totalHours.toFixed(1)}h</div>
                              </div>
                              <div className="bg-slate-50/70 dark:bg-slate-950/20 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/40 text-center">
                                <BookOpen className="w-4 h-4 mx-auto text-cyan-600/85 dark:text-cyan-400 mb-1" />
                                <div className="text-[10px] font-mono uppercase text-slate-400 leading-none">Journal Logs</div>
                                <div className="text-sm font-black font-mono text-slate-850 dark:text-slate-100 mt-1">{stats.totalJournals} Logs</div>
                              </div>
                              <div className="bg-slate-50/70 dark:bg-slate-950/20 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/40 text-center">
                                <Award className="w-4 h-4 mx-auto text-pink-500/85 mb-1" />
                                <div className="text-[10px] font-mono uppercase text-slate-400 leading-none">Trophy Badges</div>
                                <div className="text-sm font-black font-mono text-slate-850 dark:text-slate-100 mt-1">{stats.badgesUnlocked} Unlocked</div>
                              </div>
                              <div className="bg-slate-50/70 dark:bg-slate-950/20 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/40 text-center">
                                <CheckCircle className="w-4 h-4 mx-auto text-rose-500/85 mb-1" />
                                <div className="text-[10px] font-mono uppercase text-slate-400 leading-none">Validation Ratio</div>
                                <div className="text-sm font-black font-mono text-slate-850 dark:text-slate-100 mt-1">
                                  {stats.totalJournals > 0 
                                    ? `${Math.round((entries.filter(e => e.status === 'Approved' && (e.author.includes(currentUser.name) || e.author.includes(currentUser.schoolEmail))).length / stats.totalJournals) * 100)}%`
                                    : '100%'}
                                </div>
                              </div>
                            </div>

                            <p className="text-[10px] font-mono text-slate-400 leading-normal bg-cyan-50/30 dark:bg-cyan-950/10 p-2.5 rounded border border-cyan-100/50 dark:border-cyan-900/20">
                              ⚡ <strong>Pro Tip:</strong> Need quick XP multipliers? Ask a Lead Mentor or testMentor to completely Approve your "Pending Review" journal entries on the main hub. Approved entries score <strong>+120 XP extra each!</strong>
                            </p>

                            {/* Subteam Guild Alignment Badge */}
                            {(() => {
                              const isMentor = currentUser.role === 'mentor_captain' || currentUser.role === 'mentor';
                              let userGuildId = currentUser.primarySubteam;
                              if (isMentor) {
                                userGuildId = 'Mentoring';
                              } else {
                                if (userGuildId === 'None' || userGuildId === 'Mentor' || (userGuildId as string) === 'Lead/Captain' || userGuildId === 'Mentoring') {
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
                                <div className="bg-slate-50 dark:bg-slate-950/35 border border-slate-200/60 dark:border-slate-805 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden group mt-3">
                                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-cyan-500/5 to-transparent pointer-events-none"></div>
                                  
                                  {/* Icon frame */}
                                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/85 dark:border-slate-800 shadow-sm shrink-0 flex items-center justify-center">
                                    {getGamifiedIcon(guildObj.icon, "w-10 h-10")}
                                  </div>

                                  <div className="flex-1 flex flex-col gap-1.5 text-center sm:text-left w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full">
                                      <div>
                                        <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest leading-none">
                                          My Guild / Division Alignment
                                        </span>
                                        <h3 className="text-sm font-black text-slate-850 dark:text-slate-100 uppercase tracking-wide flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                                          <span>{guildObj.name}</span>
                                        </h3>
                                      </div>
                                      <span className="px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/55 dark:border-cyan-800 text-[10px] font-mono font-black rounded text-cyan-750 dark:text-cyan-400 self-center uppercase">
                                        Rank {subRankData.currentRank.rank}/{guildObj.ranks.length}
                                      </span>
                                    </div>

                                    <div className="mt-1">
                                      <h4 className="text-md font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-wide">
                                        🏆 {subRankData.currentRank.title}
                                      </h4>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-450 italic font-medium leading-relaxed mt-1">
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
                                        💡 Guild XP increase as: <strong>+5 XP</strong> per lab hour + <strong>+12 XP</strong> per journal writeup logged in {guildObj.codename}.
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
                              <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono text-[9px] font-black rounded uppercase">
                                5 Specialized Divisions
                              </span>
                            </h3>
                            <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-1 leading-normal">
                              Advance through hierarchical ranks in student or mentor divisions. Earn Guild XP via <strong>laboratory hours (+5 XP/hr)</strong> and <strong>high-fidelity journal entries (+12 XP/log)</strong>.
                            </p>
                          </div>

                          {/* Guild selector row */}
                          {(() => {
                            const isMentorUser = currentUser.role === 'mentor_captain' || currentUser.role === 'mentor';
                            const defaultGuildId = isMentorUser ? 'Mentoring' : (currentUser.primarySubteam === 'None' || currentUser.primarySubteam === 'Mentor' || (currentUser.primarySubteam as string) === 'Lead/Captain' || currentUser.primarySubteam === 'Mentoring' ? 'Design/Build/Fabrication' : currentUser.primarySubteam);
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
                                      if (g.color === 'slate') activeColor = "border-slate-650 dark:border-slate-500 bg-slate-50 dark:bg-slate-850 ring-2 ring-slate-500/10 text-slate-900 dark:text-slate-50";
                                      if (g.color === 'cyan') activeColor = "border-cyan-550 dark:border-cyan-500 bg-cyan-50/10 dark:bg-cyan-950/20 ring-2 ring-cyan-500/10 text-cyan-750 dark:text-cyan-400";
                                      if (g.color === 'emerald') activeColor = "border-emerald-550 dark:border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/20 ring-2 ring-emerald-500/10 text-emerald-750 dark:text-emerald-400";
                                      if (g.color === 'amber') activeColor = "border-amber-550 dark:border-amber-500 bg-amber-50/10 dark:bg-amber-950/20 ring-2 ring-amber-500/10 text-amber-750 dark:text-amber-400";
                                      if (g.color === 'rose') activeColor = "border-rose-550 dark:border-rose-500 bg-rose-50/10 dark:bg-rose-950/20 ring-2 ring-rose-500/10 text-rose-750 dark:text-rose-400";
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
                                          {getGamifiedIcon(g.icon, "w-4 h-4 text-slate-500 shrink-0")}
                                          <span className="font-bold tracking-tight text-[11px] uppercase shrink-0 truncate max-w-[120px]">{g.name.split(' (')[0]}</span>
                                        </div>
                                        <div className="flex flex-col">
                                          {isLocked ? (
                                            <>
                                              <span className="text-[10px] font-mono text-rose-550 font-extrabold flex items-center gap-1">🔒 Locked</span>
                                              <span className="text-[9px] font-mono text-slate-400 mt-0.5">Role Restricted</span>
                                            </>
                                          ) : (
                                            <>
                                              <span className="text-[10px] font-mono text-slate-400 font-extrabold truncate">Rank {subStats.currentRank.rank}: {subStats.currentRank.title}</span>
                                              <span className="text-[9px] font-mono text-slate-500 mt-0.5">{subStats.points} XP accumulated</span>
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
                                    <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-201 dark:border-slate-800 rounded-xl p-5 flex flex-col gap-4 w-full">
                                      {isLocked && (
                                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-750 dark:text-rose-400 p-3.5 rounded-lg text-xs flex items-center gap-2.5 font-medium leading-normal">
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
                                            {getGamifiedIcon(activeGuild.icon, "w-6 h-6")}
                                          </div>
                                          <div>
                                            <h4 className="text-[9px] font-black uppercase text-slate-450 tracking-wider">Active Division Selected</h4>
                                            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase">{activeGuild.name}</h3>
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
                                                className={`p-3 rounded-lg border transition-all flex items-start gap-4 hover:bg-white dark:hover:bg-slate-900/40 ${
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
                                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-850 dark:bg-emerald-950 dark:border-emerald-905 dark:text-emerald-400' 
                                                    : isSecretType
                                                      ? 'bg-amber-100/40 border-amber-300 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-400'
                                                      : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                                                }`}>
                                                  {isUnlocked ? "✓" : r.rank}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                    <h3 className={`text-xs font-black uppercase tracking-wide truncate ${isUnlocked ? 'text-slate-850 dark:text-slate-100 font-extrabold' : 'text-slate-500 dark:text-slate-400'}`}>
                                                      {isUnlocked ? "🏅 " : ""}{displayedTitle}
                                                    </h3>
                                                    <span className={`text-[9px] font-mono px-1.5 py-0.2 select-none shrink-0 uppercase rounded-sm border ${
                                                      isUnlocked 
                                                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-850 text-emerald-750 dark:text-emerald-400' 
                                                        : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500'
                                                    }`}>
                                                      Requires {reqPoints} XP
                                                    </span>
                                                  </div>
                                                  
                                                  <p className={`text-[11px] mt-1 leading-normal italic ${isUnlocked ? 'text-slate-650 dark:text-slate-350 font-medium' : 'text-slate-400 dark:text-slate-500 font-normal'}`}>
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
                                        getGamifiedIcon(badge.icon, "w-5 h-5")
                                      ) : (
                                        <Lock className="w-5 h-5 text-slate-400 dark:text-slate-650" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-extrabold text-[12px] text-slate-900 dark:text-slate-100 uppercase tracking-wide truncate">
                                        {badge.name}
                                      </h4>
                                      <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-tight mt-0.5 line-clamp-2">
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
                                        ? 'bg-emerald-100/40 border-emerald-250 dark:bg-emerald-950/20 dark:border-emerald-800' 
                                        : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                                    }`}>
                                      {getGamifiedIcon(quest.icon, "w-4.5 h-4.5")}
                                    </div>
                                    <div className="min-w-0 pr-12">
                                      <h4 className="font-extrabold text-[12px] text-slate-850 dark:text-slate-100 uppercase tracking-wide">
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
                                      <div className="text-[8px] text-slate-400 uppercase font-black tracking-wider leading-none">XP AWARD</div>
                                      <div className={`text-xs font-black mt-1 ${quest.unlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
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
                          className="flex flex-col gap-4 text-xs font-sans text-slate-850 dark:text-slate-100"
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
                              onClick={handleExportPDF_lounge}
                              className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600 text-white font-mono text-[9px] uppercase tracking-wider py-1 px-2.5 rounded transition-all shadow-sm flex items-center gap-1.5 font-bold cursor-pointer self-start sm:self-auto"
                            >
                              <Download className="w-3.5 h-3.5" />
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
                                      'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300', // #1
                                      'bg-slate-150 border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200', // #2
                                      'bg-orange-100 border-orange-300 text-orange-950 dark:bg-orange-950/40 dark:border-orange-850 dark:text-orange-300', // #3
                                    ];
                                    const currentClass = isSelf 
                                      ? 'bg-cyan-50/40 dark:bg-cyan-950/5 hover:bg-cyan-50/80 dark:hover:bg-cyan-950/15 border-l-2 border-l-cyan-500' 
                                      : 'border-b border-slate-100 dark:border-slate-800 hover:bg-slate-100/40 dark:hover:bg-slate-800/40';

                                    return (
                                      <tr 
                                        key={player.account.id}
                                        onClick={() => setInspectLeaderboardAccount(player.account)}
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
                                              <span className="text-[9.5px] font-mono text-slate-400 truncate max-w-[170px]">
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
                                            <span className="font-black text-cyan-650 dark:text-cyan-400">{player.stats.xp} XP</span>
                                            <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase">Lv.{player.stats.level}</span>
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
            })()
          )}

          {/* Player stats inspect Modal overlay */}
          <AnimatePresence>
            {inspectLeaderboardAccount && (
              (() => {
                const results = computeUserGamification(inspectLeaderboardAccount, entries, timeEntries, kanbanTasks, outreachEvents, xpAdjustments);
                const { stats, badges } = results;

                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md no-print"
                    onClick={() => setInspectLeaderboardAccount(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, y: 15, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.95, y: 15, opacity: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 350 }}
                      className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="bg-slate-900 text-white px-4 py-3 pb-3 border-b border-slate-950 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-pink-500 animate-pulse" />
                          <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-100">
                            RoboRaider Roster Inspector
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInspectLeaderboardAccount(null)}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex flex-col gap-4 text-slate-900 dark:text-slate-100 overflow-y-auto max-h-[70vh]">
                        
                        {/* Player General Layout */}
                        <div className="bg-slate-150/50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-250 dark:border-slate-800 flex items-center gap-4">
                          <div className="bg-brand text-white w-14 h-14 rounded-full flex items-center justify-center font-bold font-mono text-2xl shadow-md border-2 border-white select-none shrink-0">
                            {inspectLeaderboardAccount.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-black text-slate-950 dark:text-slate-50 uppercase flex items-center gap-1.5 truncate">
                              {inspectLeaderboardAccount.name}
                            </h3>
                            <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{inspectLeaderboardAccount.schoolEmail}</p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5 text-[9px] font-mono uppercase font-black">
                              <span className="bg-slate-200 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800">
                                {inspectLeaderboardAccount.primarySubteam}
                              </span>
                              <span className="bg-cyan-105 dark:bg-cyan-950 px-2 py-0.5 rounded text-cyan-800 dark:text-cyan-300 border border-cyan-200/55 dark:border-cyan-850">
                                Level {stats.level} : {stats.levelName.substring(0, 15)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Player Accomplishments Row */}
                        <div className="grid grid-cols-3 gap-3 text-xs text-center font-mono">
                          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800/80">
                            <span className="text-[9px] text-slate-400 uppercase">Tracked Hours</span>
                            <div className="font-extrabold text-sm text-cyan-600 dark:text-cyan-400 mt-1">{stats.totalHours.toFixed(1)} hrs</div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800/85">
                            <span className="text-[9px] text-slate-400 uppercase">Journal logs</span>
                            <div className="font-extrabold text-sm text-indigo-650 dark:text-indigo-400 mt-1">{stats.totalJournals} Logs</div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800/80">
                            <span className="text-[9px] text-slate-400 uppercase">Cumulative XP</span>
                            <div className="font-extrabold text-sm text-pink-600 dark:text-pink-400 mt-1">{stats.xp} XP</div>
                          </div>
                        </div>

                        {/* Player Trophy badging case */}
                        <div className="flex flex-col gap-2.5">
                          <span className="text-[9px] font-mono font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1">
                            Specialist Badge Collection
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {badges.map(badge => (
                              <div 
                                key={badge.id}
                                className={`p-2 rounded-lg border flex items-center gap-2 select-none ${
                                  badge.unlocked 
                                    ? 'bg-slate-50 dark:bg-slate-905 border-cyan-500/10 shadow-sm' 
                                    : 'bg-slate-100/45 dark:bg-slate-950/20 border-slate-200/40 dark:border-slate-850 opacity-40'
                                }`}
                              >
                                <div className={`p-1.5 rounded shrink-0 border ${badge.unlocked ? 'bg-cyan-100/30 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800 text-cyan-650' : 'bg-slate-250 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-400'}`}>
                                  {badge.unlocked ? (
                                    getGamifiedIcon(badge.icon, "w-3.5 h-3.5")
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-650" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-extrabold text-[11px] uppercase truncate text-slate-800 dark:text-slate-200 leading-none">{badge.name}</div>
                                  <div className="text-[9px] text-slate-450 truncate whitespace-nowrap mt-1">{badge.unlocked ? 'Unlocked Badge' : 'Locked Trophy'}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Footer Actions */}
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-105 dark:border-slate-800 flex justify-end gap-2 text-xs shrink-0">
                        <button
                          type="button"
                          onClick={() => setInspectLeaderboardAccount(null)}
                          className="px-4 py-1.5 rounded text-xs font-bold font-mono uppercase bg-slate-200 dark:bg-slate-850 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Close Profile
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })()
            )}
          </AnimatePresence>

          {/* Core Hub Grid Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 1: TEAM JOURNAL */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-all hover:border-brand/40 group">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="bg-brand/10 text-brand p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 font-display">
                      Team Journal
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-550 uppercase tracking-widest mt-0.5">
                      Notebook Compiler &amp; CAD Layouts
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-605 dark:text-slate-300 leading-relaxed font-sans mt-2">
                  Maintain the official engineering journal. Feed in session planning targets, physical mechanism achievements, photographic schematics, 3D render attachments, and subteam problem-solution structures for competition judges review.
                </p>
                
                {/* Journal Quick Stats */}
                <div className="mt-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Total Notebook Logs:</span>
                  <strong className="text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold">
                    {entries.length} Entries
                  </strong>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentView('journal')}
                  className="bg-brand hover:bg-brand-hover text-white px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer rounded"
                >
                  <span>Open Team Journal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CARD 2: HOUR TRACKER & ATTENDANCE TERMINAL */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-all hover:border-brand/40 group">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850 dark:text-slate-100 font-display">
                      Hours Tracking &amp; Clock-In
                    </h3>
                    <p className="text-[10px] font-mono text-slate-404 dark:text-slate-550 uppercase tracking-widest mt-0.5">
                      Attendance Ledger
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-605 dark:text-slate-302 leading-relaxed font-sans mt-2">
                  Track student contributions and clock-in logs. Check shop occupancy, analyze participation charts broken down by subteam focuses (Design/Build, Automation, Outreach), and compile hour indexes for FIRST awards submission.
                </p>
                
                {/* Time Quick Stats */}
                <div className="mt-4 bg-slate-50 dark:bg-slate-955 p-3 rounded-lg border border-slate-150 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Cumulative Registered Hours:</span>
                  <strong className="text-slate-800 dark:text-cyan-350 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold">
                    {timeEntries.reduce((acc, curr) => acc + curr.durationHours, 0).toFixed(1)} hrs
                  </strong>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentView('time_entry')}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer rounded"
                >
                  <span>Open Hours Ledger</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CARD 3: COMMUNITY OUTREACH EVENTS LEDGER */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-all hover:border-emerald-500/30 group">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 fill-emerald-500/20" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 font-display">
                      Community Outreach Events
                    </h3>
                    <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mt-0.5">
                      STEM Showcase, Demos &amp; FLL Mentorship
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-605 dark:text-slate-300 leading-relaxed font-sans mt-2">
                  Record and showcase team-led community robotics exhibitions, STEM teaching labs, FLL workshop drives, and pitch decks. Upload rich action photo proofs and track quantized crowd reach metrics.
                </p>
                
                {/* Outreach Quick Stats */}
                <div className="mt-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Documented Outreach Events:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                    {outreachEvents.length} Logs recorded
                  </strong>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentView('outreach')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer rounded"
                >
                  <span>Open Outreach Ledger</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CARD KANBAN: COLLABORATIVE TEAM KANBAN BOARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-all hover:border-brand/40 group">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="bg-brand/10 text-brand p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 font-display">
                      Collaborative Kanban Board
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-550 uppercase tracking-widest mt-0.5">
                      Task Backlog &amp; Progress Sprint
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-605 dark:text-slate-300 leading-relaxed font-sans mt-2">
                  Draft tasks, assign key subteam members, choose priority levels, and drag &amp; drop tickets through backlog, development, review, and completed lanes to manage and accelerate team velocity.
                </p>
                
                {/* Kanban Quick Stats */}
                <div className="mt-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Tasks in Open Backlog:</span>
                  <strong className="text-brand bg-brand/10 border border-brand/25 px-1.5 py-0.5 rounded font-bold">
                    {kanbanTasks.length} Active Tickets
                  </strong>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentView('kanban')}
                  className="bg-brand hover:bg-brand-hover text-white px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer rounded"
                >
                  <span>Open Kanban Board</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CARD handbook: STUDENT TEAM HANDBOOK */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-all hover:border-brand/40 group">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="bg-brand/10 text-brand p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Scroll className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 font-display">
                      Student Team Handbook
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-550 uppercase tracking-widest mt-0.5">
                      Rules, Safety Protocols &amp; Conduct Code
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-605 dark:text-slate-300 leading-relaxed font-sans mt-2">
                  Access the formal 2026-2027 RoboRaiders handbook. Review laboratory safety guidelines, student attendance minimums, FLL community mentoring hours requirements, and sign the official digital acknowledgement register.
                </p>
                
                {/* Handbook Quick Stats */}
                <div className="mt-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Official Chapters:</span>
                  <strong className="text-brand bg-brand/10 border border-brand/25 px-1.5 py-0.5 rounded font-bold">
                    20 Official Chapters
                  </strong>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentView('handbook')}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer rounded dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <span>Open Handbook</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ONLY MENTORS/CAPTAINS CAN VIEW ROSTER MANAGEMENT & EMAIL COMMUNICATIONS */}
            {(currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain') && (
              <>
                {/* CARD 3: TEAM DIRECTORY */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all hover:border-indigo-550/30 group">
                  <div>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-lg">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 font-display">
                          Roster &amp; Subteam Approvals
                        </h4>
                        <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                          Secure Team Management Directory
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      Audit registered roster accounts, primary and secondary subteam declarations, and authorize pending student logins.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-xs font-mono">
                    <span className="text-[10px] text-slate-400">Roster Count: {accounts.length} Profiles</span>
                    <button
                      onClick={() => setIsApprovalsOpen(true)}
                      className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline uppercase text-[10px] tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage Directory</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* CARD 4: EMAIL OUTBOX SIMULATOR */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all hover:border-indigo-550/30 group">
                  <div>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="bg-purple-500/10 text-purple-600 dark:text-purple-400 p-2.5 rounded-lg">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 font-display">
                          Security Alert System Outbox
                        </h4>
                        <p className="text-[9px] font-mono text-slate-400 dark:text-slate-550 uppercase tracking-widest leading-none mt-0.5">
                          Simulated Server Communications
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      Inspect outgoing notifications sent by the system (e.g. signup applications, password reset verification links).
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-xs font-mono">
                    <span className="text-[10px] text-slate-400">Dispatched: {dispatchedEmails.length} Alerts</span>
                    <button
                      onClick={() => {
                        setIsApprovalsOpen(true);
                        showToast('Check email dispatch logs at bottom of panel.', 'info');
                      }}
                      className="text-purple-600 dark:text-purple-400 font-extrabold hover:underline uppercase text-[10px] tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Outbox Log</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* CARD 5: DATABASE BACKUP & SEASON TRANSITION */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all hover:border-red-500/25 group md:col-span-2">
                  <div>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-2.5 rounded-lg">
                        <Database className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 font-display">
                          Backup &amp; Season Transition Tools
                        </h4>
                        <p className="text-[9px] font-mono text-slate-400 dark:text-slate-550 uppercase tracking-widest leading-none mt-0.5">
                          SYSTEM ADMINISTRATION PANEL • MENTOR-ONLY ACCESS
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      Take offline backups of all system databases. Compress, archive, or completely clear journals, timesheets, and kanban cards when transitioning to a new robotics competition season.
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-mono">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      ⚠️ Data modifications affect live cloud database metrics
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDownloadBackup}
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold px-3 py-1.5 rounded uppercase text-[10px] tracking-wider transition-all cursor-pointer flex items-center gap-1"
                        id="backup-db-trigger"
                      >
                        <span>Download Backup</span>
                      </button>
                      <button
                        onClick={() => setIsBackupTransitionOpen(true)}
                        className="bg-red-600/10 hover:bg-red-650/20 border border-red-500/30 hover:border-red-500 text-red-600 dark:text-red-400 font-extrabold px-3 py-1.5 rounded uppercase text-[10px] tracking-wider transition-all cursor-pointer flex items-center gap-1"
                        id="transition-season-trigger"
                      >
                        <span>Season Transition</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* DYNAMIC ROBOTICS CHAMPIONSHIP CONSOLE (MOVED TO BOTTOM OF LANDING PAGE) */}
          {currentUser && (
            <ArenaPortal 
              currentUser={currentUser}
              accounts={accounts}
              entries={entries}
              timeEntries={timeEntries}
              onInspectPlayer={setInspectLeaderboardAccount}
              kanbanTasks={kanbanTasks}
              outreachEvents={outreachEvents}
              xpAdjustments={xpAdjustments}
              onAddXpAdjustment={handleAddXpAdjustment}
              onDeleteXpAdjustment={handleDeleteXpAdjustment}
            />
          )}

        </div>
      )}

      {/* STUDENT TEAM HANDBOOK VIEW */}
      {currentView === 'handbook' && (
        <StudentHandbook
          currentUser={currentUser}
          showToast={showToast}
          onBack={() => setCurrentView('landing')}
        />
      )}

      {/* OUTREACH EVENTS HUB VIEW */}
      {currentView === 'outreach' && (
        <OutreachHub
          currentUser={currentUser}
          accounts={accounts}
          events={outreachEvents}
          onUpdateEvents={saveOutreachEventsToLocalStorage}
        />
      )}

      {/* COLLABORATIVE KANBAN BOARD VIEW */}
      {currentView === 'kanban' && (
        <KanbanBoard
          currentUser={currentUser}
          accounts={accounts}
          tasks={kanbanTasks}
          onUpdateTasks={saveKanbanTasksToLocalStorage}
          formatSubteamLabel={formatSubteamLabel}
        />
      )}

      {/* TIME ENTRY LABORATORY HOURS LEDGER */}
      {currentView === 'time_entry' && (
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 no-print" id="time-hours-ledger-desk">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-cyan-605/10 text-cyan-705 dark:text-cyan-400 font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded border border-cyan-500/30 tracking-widest leading-none">
                ATTENDANCE RECORDS
              </span>
              <h1 className="text-xl md:text-2xl font-black uppercase text-slate-905 dark:text-slate-50 mt-1.5 tracking-tight font-display">
                RoboRaiders Time Card
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                Monitor team participant meters, compile workshop hour indices, and punch active time cards.
              </p>
            </div>
            
            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => {
                  // Pre-populate with all unique user emails from time entries to make multi-select handy
                  const uniqueEmails = Array.from(new Set(timeEntries.map(t => t.userEmail)));
                  setSelectedTimeExportMembers(uniqueEmails);
                  setIsTimeExportModalOpen(true);
                }}
                className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600 text-white font-extrabold px-4 py-2 text-xs rounded transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md font-sans border-0 outline-none"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Time PDF</span>
              </button>
              <button
                onClick={() => setCurrentView('landing')}
                className="bg-indigo-600 hover:bg-indigo-500 dark:bg-slate-805 dark:hover:bg-slate-705 text-white font-extrabold px-4 py-2 text-xs rounded transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md font-sans border-0 outline-none"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Back to Hub</span>
              </button>
            </div>
          </div>

          {/* High Density Metric Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 select-none">
            
            {/* Stat: Cumulative Roster Hours */}
            <div className="md:col-span-3 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800/80 p-5 rounded-xl shadow-xs flex items-center gap-4">
              <div className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 p-3.5 rounded-xl shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block leading-none">
                  Cumulative Team Hours
                </span>
                <span className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1 block">
                  {timeEntries.reduce((sum, curr) => sum + curr.durationHours, 0).toFixed(1)} hrs
                </span>
              </div>
            </div>

            {/* Stat: My Logged Hours */}
            <div className="md:col-span-3 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800/80 p-5 rounded-xl shadow-xs flex items-center gap-4">
              <div className="bg-indigo-505/10 text-indigo-622 dark:text-indigo-400 p-3.5 rounded-xl shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block leading-none">
                  My Logged Hours
                </span>
                <span className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1 block">
                  {timeEntries
                    .filter(t => t.userEmail === currentUser?.schoolEmail)
                    .reduce((sum, curr) => sum + curr.durationHours, 0)
                    .toFixed(1)} hrs
                </span>
              </div>
            </div>

            {/* Visual breakdown widget */}
            <div className="md:col-span-6 bg-white border border-slate-205 dark:bg-slate-900 dark:border-slate-800/80 p-5 rounded-xl shadow-xs">
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-3 leading-none">
                Laboratory Output Hours Breakdown by Subteam Group
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {ATTENDANCE_SUBTEAMS.map(subteam => {
                  const total = timeEntries
                    .filter(t => t.subteam === subteam)
                    .reduce((sum, curr) => sum + curr.durationHours, 0);
                  const maxVal = Math.max(...ATTENDANCE_SUBTEAMS.map(s => timeEntries.filter(t => t.subteam === s).reduce((sum, curr) => sum + curr.durationHours, 0)), 1);
                  const width = Math.min(100, (total / maxVal) * 100);
                  return (
                    <div key={subteam} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono leading-none">
                        <span className="text-slate-600 dark:text-slate-350 font-bold truncate max-w-[155px]">{subteam}</span>
                        <strong className="text-slate-800 dark:text-slate-100 font-extrabold">{total.toFixed(1)} hrs</strong>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
                        <div 
                          className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Ledger workspace grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Operations Column (span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* CARD: LIVE WORKSHOP CLOCK-IN TERMINAL */}
              <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                {activeSession ? (
                  <div className="flex flex-col items-center bg-emerald-500/5 dark:bg-slate-950 p-5 rounded-lg text-center gap-3 border border-emerald-500/20">
                    <div className="relative">
                      <span className="relative flex h-3 w-3 justify-center mb-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-105">
                        You are CLOCKED IN on Lab Duty
                      </h3>
                      <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mt-0.5 animate-pulse">
                        Active subteam focus: {activeSession.subteam}
                      </p>
                    </div>

                    {/* Big glowing elapsed clock ticker */}
                    <div className="text-4xl font-mono font-black text-slate-900 dark:text-emerald-300 tracking-tight bg-white dark:bg-slate-900 px-6 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center my-1 select-none w-full max-w-[260px]">
                      {sessionElapsed}
                    </div>

                    {/* Task focus statement inline */}
                    <div className="w-full text-left space-y-1">
                      <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono leading-none">
                        Active task focus (editable):
                      </label>
                      <input
                        type="text"
                        value={activeSession.taskDescription}
                        onChange={(e) => handleUpdateActiveSessionTask(e.target.value)}
                        placeholder="What are you currently developing/assembling?"
                        className="w-full bg-white border border-slate-300 dark:bg-slate-900 dark:border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-805 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>

                    <button
                      onClick={handleClockOut}
                      className="w-full mt-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs py-2.5 px-4 rounded uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>End Workshop Session &amp; Log Hours</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleClockIn} className="space-y-4">
                    <div className="flex items-center gap-3.5 mb-2">
                      <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-lg shrink-0">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850 dark:text-slate-100 font-display">
                          Live Active Clock-In
                        </h3>
                        <p className="text-[10px] font-mono text-slate-404 uppercase tracking-widest mt-0.5">
                          Start real-time hour recording
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-555 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Select Subteam focus of today
                      </label>
                      <select
                        value={clockInSubteam}
                        onChange={(e) => setClockInSubteam(e.target.value as Subteam)}
                        className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 font-black outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-brand/40"
                      >
                        {ATTENDANCE_SUBTEAMS.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-1">
                        What task are you working on today?
                      </label>
                      <input
                        type="text"
                        placeholder="E.g., Mounting chassis dual extrusion rails..."
                        value={clockInDesc}
                        onChange={(e) => setClockInDesc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 outline-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 px-4 rounded uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Punch In Time Card</span>
                    </button>
                  </form>
                )}
              </div>

              {/* CARD: PAST MANUAL hours logger */}
              <div className="bg-white border border-slate-205 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <form onSubmit={handleManualTimeSubmit} className="space-y-4 border-0">
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-lg shrink-0">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 font-display">
                        Add Past Hours Manually
                      </h3>
                      <p className="text-[10px] font-mono text-slate-404 uppercase tracking-widest mt-0.5">
                        Log past meetings &amp; events
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Workshop Date
                      </label>
                      <input
                        type="date"
                        value={manualTimeDate}
                        onChange={(e) => setManualTimeDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Select Subteam Focus
                      </label>
                      <select
                        value={manualTimeSubteam}
                        onChange={(e) => setManualTimeSubteam(e.target.value as Subteam)}
                        className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                      >
                        {ATTENDANCE_SUBTEAMS.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <TimePicker
                        label="Start Time"
                        value={manualTimeStart}
                        onChange={setManualTimeStart}
                      />
                    </div>
                    <div>
                      <TimePicker
                        label="End Time"
                        value={manualTimeEnd}
                        onChange={setManualTimeEnd}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Brief Task Details / Contributions
                    </label>
                    <textarea
                      placeholder="Type a concrete outline of the mechanical CAD assemblies or code scripts developed."
                      value={manualTimeDesc}
                      onChange={(e) => setManualTimeDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-700/80 rounded p-2 text-xs text-slate-805 dark:text-slate-101 placeholder:text-slate-403 outline-none resize-none font-sans leading-relaxed focus:bg-white dark:focus:bg-slate-800"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-505 text-white font-extrabold text-xs py-2.5 px-4 rounded uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-sans border-0 outline-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Submit Workshop hours</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Right hours logs list column */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl p-5 shadow-xs overflow-hidden flex flex-col gap-4">
              
              {/* Header with search filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-none">
                    <Layers className="w-4 h-4 text-brand" />
                    <span className="text-[#ead9d9]">Time Cards ({filteredTimeEntries.length})</span>
                  </h3>
                </div>
                
                {/* Search */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:max-w-[180px]">
                    <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name/task..."
                      value={timeSearch}
                      onChange={(e) => setTimeSearch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 p-2 pl-7.5 rounded text-[11px] outline-none text-slate-850 dark:text-slate-100"
                    />
                  </div>
                  
                  <select
                    value={timeSubteamFilter}
                    onChange={(e) => setTimeSubteamFilter(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 p-1.5 rounded text-[11px] outline-none font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="All">All subteams</option>
                    {ATTENDANCE_SUBTEAMS.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scrollable hour log items list */}
              {filteredTimeEntries.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-950 p-8 text-center rounded text-xs text-slate-455 font-mono">
                  🔍 No registered workshop hours align with selected filter targets.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
                  {filteredTimeEntries.map((item) => {
                    const isOwnEntry = currentUser?.schoolEmail === item.userEmail;
                    const isManager = currentUser?.role === 'mentor_captain' || currentUser?.role === 'mentor' || currentUser?.role === 'captain';
                    const canDelete = isOwnEntry || isManager;
                    
                    return (
                      <div 
                        key={item.id}
                        className="border border-slate-150 dark:border-slate-800 rounded-lg p-3.5 bg-slate-50/40 dark:bg-slate-950/20 hover:bg-slate-55 dark:hover:bg-slate-850/30 transition-all flex justify-between items-start gap-3"
                      >
                        <div className="space-y-1 w-full min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                              {item.userName}
                            </span>
                            
                            <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-205 dark:border-slate-800">
                              {item.date}
                            </span>
                            
                            <span className="text-[10px] font-bold font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-100/10 border border-cyan-500/20 px-2 py-0.5 rounded leading-none">
                              {item.subteam}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-650 dark:text-slate-300 font-medium font-sans leading-relaxed tracking-normal break-words mt-1">
                            {item.taskDescription}
                          </p>

                          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400  dark:text-slate-500 mt-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Shift: <strong>{item.startTime} - {item.endTime}</strong> ({item.durationHours.toFixed(2)} hours logged)</span>
                          </div>
                        </div>

                        {(isOwnEntry || isManager) && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleEditTimeEntry(item)}
                              className="bg-slate-100 hover:bg-cyan-100 dark:bg-slate-800 dark:hover:bg-cyan-950/40 p-1.5 rounded text-slate-400 hover:text-cyan-600 dark:text-slate-500 dark:hover:text-cyan-450 transition-all cursor-pointer border-0 outline-none"
                              title="Edit time card"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTimeEntry(item.id, item.userName)}
                              className="bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/40 p-1.5 rounded text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-450 transition-all cursor-pointer border-0 outline-none"
                              title="Rescind hours log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* GOOGLE SITES COMPACT IFRAME TAB MENU */}
      {currentView === 'journal' && (
        <div className="no-print sm:hidden bg-white border-b border-slate-300 dark:bg-slate-900 dark:border-slate-800 py-2 px-3 flex justify-center gap-1 sticky top-0 z-50">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-1.5 px-3 rounded font-bold text-xs transition-colors duration-150 flex items-center justify-center gap-1 uppercase ${
              activeTab === 'form' 
                ? 'bg-brand text-white' 
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {isEditing ? 'Draft Editor' : 'New Journal'}
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex-1 py-1.5 px-3 rounded font-bold text-xs transition-colors duration-150 flex items-center justify-center gap-1 uppercase ${
              activeTab === 'archive' 
                ? 'bg-brand text-white' 
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Logs ({filteredEntries.length})
          </button>
        </div>
      )}

      {/* CORE HIGH DENSITY WORKING GRID */}
      {currentView === 'journal' && (
        <div className="flex-1 p-6 lg:p-10 max-w-[1700px] mx-auto w-full flex flex-col gap-8 no-print" id="journal-desk-view-container">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black border border-brand/35 px-2 py-1 rounded bg-brand/10 uppercase tracking-wide text-brand">
                  ENGINEERING JOURNAL
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">FTC #6567</span>
              </div>
              <h1 className="text-2xl font-extrabold uppercase text-slate-900 dark:text-white mt-1">
                Team Journal
              </h1>
              <p className="text-xs text-slate-505 dark:text-slate-400">
                Official team journal logs, planning milestones, and subteam targets.
              </p>
            </div>
            
            <div className="flex items-center flex-wrap gap-2.5">
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="bg-brand hover:bg-brand-hover text-white font-extrabold px-5 py-2.5 text-xs rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md font-sans border border-brand/20 outline-none"
                title="Create and print structured notebook entries as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Journal PDF</span>
              </button>
              <button
                onClick={() => setCurrentView('landing')}
                className="bg-indigo-600 hover:bg-indigo-500 dark:bg-slate-805 dark:hover:bg-slate-705 text-white font-extrabold px-5 py-2.5 text-xs rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md font-sans border-0 outline-none"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Back to Hub</span>
              </button>
            </div>
          </div>

          <main className={`flex-1 flex flex-col gap-8 ${entriesToPrint ? 'print:hidden' : ''}`}>
        
        {/* PANEL: DRAFT REGISTRATION FORM (TOP ROW) */}
        <section 
          className={`w-full flex flex-col gap-4 ${
            activeTab === 'form' ? 'flex' : 'hidden sm:flex'
          } no-print`}
          id="block-journal-form-panel"
        >
          <div className="bg-white border border-slate-205 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 lg:p-6 shadow-md flex flex-col gap-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-1">
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand" />
                <span>{isEditing ? 'Modify Draft Record' : 'Record New Journal Entry'}</span>
              </h2>
              {isEditing && (
                <span className="bg-indigo-600 text-white text-[9px] font-bold py-0.5 px-2.5 rounded uppercase tracking-wider font-mono">
                  EDIT MODE
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Row 1: Short fields metadata info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Field 1: Subteam */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Subteam Group <span className="text-brand">*</span>
                  </label>
                  <select
                    value={formSubteam}
                    onChange={(e) => setFormSubteam(e.target.value as Subteam)}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                    id="input-subteam"
                  >
                    {SUBTEAM_LIST.map((sub) => (
                      <option key={sub} value={sub} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{sub}</option>
                    ))}
                  </select>
                </div>

                {/* Field 2: Date */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Session Date <span className="text-brand">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-700 rounded pl-8 pr-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-800 dark:text-slate-100 font-medium transition-all"
                      required
                      id="input-date"
                    />
                  </div>
                </div>

                {/* Field 3: Author Card */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                    Authorized Reporter
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 flex items-center justify-between gap-3 text-xs shadow-3xs" id="display-auth-id-card">
                    <div className="flex items-center gap-2 py-0.5">
                      <div className="bg-emerald-500/10 dark:bg-emerald-400/10 p-1 rounded-full text-emerald-600 dark:text-emerald-400 shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-800 dark:text-slate-100 leading-tight text-[11px] truncate max-w-[120px]">
                          {currentUser?.name || formAuthor}
                        </div>
                        <div className="text-[8px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
                          {currentUser?.role === 'mentor' ? 'Coach' : currentUser?.role === 'captain' ? 'Captain' : currentUser?.role === 'mentor_captain' ? 'Mentor / Capt.' : 'Student Member'}
                        </div>
                      </div>
                    </div>
                    {currentUser && (
                      <span className="bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-850 dark:text-emerald-350 font-mono text-[8px] font-black px-1.5 py-0.5 rounded border border-emerald-250 dark:border-emerald-900 select-none uppercase shadow-3xs shrink-0">
                        Auth
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Textareas for Planning and Accomplishing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* What we planned */}
                <div className="bg-slate-50/50 dark:bg-slate-850/50 p-2.5 border border-slate-200 dark:border-slate-800 rounded">
                  <label className="block text-[10px] font-extrabold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">
                    What we planned <span className="text-brand">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Define objectives (e.g., Mount slide brackets, map sensors...)"
                    value={formPlanned}
                    onChange={(e) => setFormPlanned(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 text-xs focus:ring-1 focus:ring-brand outline-none leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-100 resize-none font-mono"
                    required
                    id="input-planned"
                  />
                </div>

                {/* What we accomplished */}
                <div className="bg-slate-50/50 dark:bg-slate-850/50 p-2.5 border border-slate-200 dark:border-slate-800 rounded">
                  <label className="block text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    What we accomplished <span className="text-brand">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Summarize results, mechanisms built/integrated, or autonomous tests passed..."
                    value={formAccomplished}
                    onChange={(e) => setFormAccomplished(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 text-xs focus:ring-1 focus:ring-brand outline-none leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-100 resize-none font-mono"
                    required
                    id="input-accomplished"
                  />
                </div>
              </div>

              {/* Row 3: Problems, Next Plans and Images */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Problems and Solutions Found (spanning lg:col-span-5) */}
                <div className="lg:col-span-5 bg-slate-50/50 dark:bg-slate-850/50 p-2.5 border border-slate-200 dark:border-slate-800 rounded flex flex-col">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-extrabold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                      Problems and Solutions Found
                    </label>
                    <button
                      type="button"
                      onClick={handleAddProblemField}
                      className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold px-2 py-0.5 rounded hover:bg-slate-300 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                      id="btn-add-blocker"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {formProblemsAndSolutions.map((paragraph, idx) => (
                      <div key={idx} className="flex gap-2 items-start bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                        <span className="bg-slate-900 dark:bg-slate-950 text-white text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 shrink-0">
                          {idx + 1}
                        </span>
                        <textarea
                          rows={2}
                          placeholder="Failure observed | Countermeasure/engineering correction applied"
                          value={paragraph}
                          onChange={(e) => handleUpdateProblemField(idx, e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-850 text-xs rounded p-1.5 outline-none focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-brand leading-normal resize-none"
                          id={`input-problem-${idx}`}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveProblemField(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded mt-1 cursor-pointer"
                          id={`btn-remove-problem-${idx}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan next time (spanning lg:col-span-3) */}
                <div className="lg:col-span-3 bg-slate-50/50 dark:bg-slate-850/50 p-2.5 border border-slate-200 dark:border-slate-800 rounded">
                  <label className="block text-[10px] font-extrabold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider mb-1">
                    Plan for next time
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Items to carry over and new objectives..."
                    value={formPlanNextTime}
                    onChange={(e) => setFormPlanNextTime(e.target.value)}
                    className="w-full h-[calc(100%-20px)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 text-xs focus:ring-1 focus:ring-brand outline-none leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-100 resize-none font-mono font-medium"
                    id="input-next-time"
                  />
                </div>

                {/* Image upload (spanning lg:col-span-4) */}
                <div className="lg:col-span-4 border border-slate-200 dark:border-slate-800 rounded p-2.5 bg-slate-50 dark:bg-slate-850/30">
                  <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                    Image Attachments
                  </label>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded p-4 text-center cursor-pointer transition-colors ${
                      isDraggingOver 
                        ? 'border-brand bg-brand-light text-brand dark:bg-brand-dark/15 dark:text-red-200' 
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                    id="image-dropzone"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {isImageProcessing ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-4 h-4 border-2 border-brand border-t-transparent animate-spin rounded"></div>
                        <span className="text-[10px] text-brand font-bold">OPTIMIZING PICTURE DATA...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <FileUp className="w-6 h-6 text-slate-400 group-hover:text-brand" />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Drag image or browse</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-tighter">JPEG, PNG optimized automatically</span>
                      </div>
                    )}
                  </div>

                  {/* Micro Preview of Uploaded images */}
                  {formImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-1.5 mt-2" id="grid-draft-images">
                      {formImages.map((img) => (
                        <div 
                          key={img.id} 
                          onClick={() => setExpandedImage({ url: img.dataUrl, name: img.name })}
                          className="group relative border border-slate-300 dark:border-slate-700 rounded aspect-square overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-zoom-in hover:opacity-90 transition-all hover:ring-2 hover:ring-brand"
                          title="Click to zoom preview"
                        >
                          <img 
                            src={img.dataUrl} 
                            alt={img.name} 
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(img.id);
                            }}
                            className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-0.5 rounded shadow transition-all hover:scale-110 z-10 cursor-pointer"
                            title="Delete image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Controls */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  onClick={() => setSubmissionType('Pending Review')}
                  className="flex-1 bg-brand hover:bg-brand-hover text-white font-extrabold py-2 px-3 rounded text-xs uppercase tracking-widest transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 min-w-[150px]"
                  id="btn-submit-review"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Subm. Core Updates' : 'Submit for Review'}</span>
                </button>

                <button
                  type="submit"
                  onClick={() => setSubmissionType('Draft')}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold py-2 px-3 rounded text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                  id="btn-save-draft"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Keep as Draft</span>
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-3 rounded text-xs uppercase transition-all cursor-pointer"
                    id="btn-cancel-form"
                  >
                    Cancel
                  </button>
                )}
              </div>

            </form>
          </div>
        </section>

        {/* COMPONENT: ARCHIVE LIST & PREVIEW (RIGHT SCREEN - SPACED OUT DESKTOP VIEW) */}
        <section 
          className={`w-full flex flex-col gap-5 lg:gap-6 overflow-hidden ${
            activeTab === 'archive' ? 'flex' : 'hidden sm:flex'
          }`}
          id="block-archive-and-preview-panel"
        >
          {/* HIGH DENSITY SEARCH & FILTER BOX */}
          <div className="bg-white border border-slate-205 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-4 lg:p-5 shadow-sm no-print text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-1 px-1 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Search &amp; Filter Engineering Logs
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <select
                  value={filters.subteam}
                  onChange={(e) => setFilters({ ...filters, subteam: e.target.value as Subteam | 'All' })}
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-755 dark:text-slate-100 font-bold focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                  id="filter-subteam"
                >
                  <option value="All" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">All Subteams</option>
                  {SUBTEAM_LIST.map((sub) => (
                    <option key={sub} value={sub} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-750 dark:text-slate-100 font-bold focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                  id="filter-status"
                >
                  <option value="All" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-extrabold">All Statuses</option>
                  <option value="Draft" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">✍️ Drafts</option>
                  <option value="Pending Review" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold">⏳ Pending Review</option>
                  <option value="Approved" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold">✅ Approved</option>
                  <option value="Needs Revision" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold">❌ Needs Revision</option>
                </select>
              </div>

              <div className="relative">
                <Search className="absolute left-2 top-1.5 w-3 h-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Keyword search..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-700 rounded pl-7 pr-2 py-1 text-xs focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 transition-all"
                  id="filter-query"
                />
              </div>
            </div>

            {/* Sub-dates range filters */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase shrink-0">From</span>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-700 text-slate-800 dark:text-slate-150 rounded px-1.5 py-0.5 text-[11px] outline-none"
                  id="filter-start"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase shrink-0">To</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-700 text-slate-800 dark:text-slate-150 rounded px-1.5 py-0.5 text-[11px] outline-none"
                  id="filter-end"
                />
              </div>
            </div>

            {/* Clear filters trigger */}
            {(filters.subteam !== 'All' || filters.status !== 'All' || filters.searchQuery || filters.startDate || filters.endDate) && (
              <div className="flex justify-end mt-1.5">
                <button
                  onClick={() => setFilters({ subteam: 'All', author: '', searchQuery: '', startDate: '', endDate: '', status: 'All' })}
                  className="text-[9px] text-brand hover:underline flex items-center gap-1 font-bold"
                  id="btn-clear-filters"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Clear Search Filters
                </button>
              </div>
            )}
          </div>

          {/* LOWER GRID LAYOUT */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden">
            
            {/* ARCHIVE COLUMN (LEFT HALF / spanning 4) */}
            <div className="col-span-1 md:col-span-4 bg-white border border-slate-205 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-4 flex flex-col overflow-y-auto no-print text-slate-950 dark:text-slate-50 shadow-sm">
              <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-850 p-2.5 rounded border border-slate-200 dark:border-slate-800 mb-3 shrink-0">
                <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest font-mono">
                  Logs Directory
                </span>
                <span className="bg-slate-600 dark:bg-slate-755 text-white text-[9px] font-bold px-2 py-0.5 rounded font-mono">
                  {filteredEntries.length} Records
                </span>
              </div>

              {filteredEntries.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-slate-400 mt-10">
                  <Database className="w-8 h-8 stroke-1 text-slate-300 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">No entries matched</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredEntries.map((entry) => {
                    const badgeCol = getSubteamBadgeColor(entry.subteam);
                    const isSelected = selectedEntry?.id === entry.id;
                    const style = getSubteamColorTheme(entry.subteam);
                    const SIcon = style.icon;

                    const activeBadgeClass = isSelected
                      ? 'bg-white/95 text-slate-900 border-white/20 font-extrabold shadow-xs'
                      : badgeCol;

                    return (
                      <div
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className={`p-2 rounded border cursor-pointer text-left transition-all ${
                          isSelected 
                            ? 'bg-slate-600 dark:bg-slate-800 text-white border-brand shadow-sm' 
                            : 'bg-slate-50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                        id={`archive-card-${entry.id}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono flex items-center gap-0.5 shrink-0 ${activeBadgeClass}`}>
                              <SIcon className="w-2 h-2" />
                              {entry.subteam}
                            </span>
                            
                            {/* Workflow status badge with elevated high contrast color theme on selected state */}
                            {entry.status === 'Approved' && (
                              <span className={`border text-[8px] font-mono font-extrabold px-1 py-0.5 rounded uppercase flex items-center gap-0.5 shrink-0 select-none ${
                                isSelected 
                                  ? 'bg-emerald-500 border-transparent text-white shadow-xs font-black' 
                                  : 'bg-emerald-100/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                              }`}>
                                <Lock className="w-2 h-2" /> Apprvd
                              </span>
                            )}
                            {entry.status === 'Pending Review' && (
                              <span className={`border text-[8px] font-mono font-extrabold px-1 py-0.5 rounded uppercase flex items-center gap-0.5 shrink-0 select-none ${
                                isSelected 
                                  ? 'bg-amber-400 text-slate-950 border-transparent shadow-xs font-black' 
                                  : 'bg-amber-100/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-amber-500'} animate-pulse`}></span> Pending
                              </span>
                            )}
                            {entry.status === 'Needs Revision' && (
                              <span className={`border text-[8px] font-mono font-extrabold px-1 py-0.5 rounded uppercase flex items-center gap-0.5 shrink-0 select-none ${
                                isSelected 
                                  ? 'bg-rose-500 text-white border-transparent shadow-xs font-black' 
                                  : 'bg-rose-100/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300'
                              }`}>
                                <AlertTriangle className={`w-2.5 h-2.5 ${isSelected ? 'text-white' : 'text-rose-550'}`} /> Needs Revision
                              </span>
                            )}
                            {(!entry.status || entry.status === 'Draft') && (
                              <span className={`border text-[8px] font-mono font-extrabold px-1 py-0.5 rounded uppercase flex items-center shrink-0 select-none ${
                                isSelected 
                                  ? 'bg-slate-500/30 text-slate-100 border-transparent' 
                                  : 'bg-slate-100/90 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}>
                                ✍️ Draft
                              </span>
                            )}

                            {/* Quality Score Indicator */}
                            {(() => {
                              const score = calculateJournalQualityScore(entry);
                              let scoreColor = isSelected 
                                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200 font-extrabold' 
                                : 'bg-slate-105/90 dark:bg-slate-800/60 border-slate-205 dark:border-slate-750 text-slate-700 dark:text-slate-350';
                              if (score >= 80) {
                                scoreColor = isSelected 
                                  ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-black' 
                                  : 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200/50 dark:border-cyan-800/50 text-cyan-650 dark:text-cyan-300 font-bold';
                              } else if (score >= 45) {
                                scoreColor = isSelected 
                                  ? 'bg-blue-405 text-slate-950 border-blue-300 font-black' 
                                  : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/50 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-bold';
                              }
                              return (
                                <span className={`border text-[8px] font-mono px-1 py-0.5 rounded uppercase flex items-center gap-0.5 shrink-0 select-none ${scoreColor}`} title={`Journal Entry Quality rating: ${score}/100. Write more details, document problems & solutions, or upload photos to increase QI!`}>
                                  ⭐ QI: {score}%
                                </span>
                              );
                            })()}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                            <span className={`text-[8.5px] font-mono font-black tracking-tight border px-1.5 py-0.1 select-all rounded ${
                              isSelected 
                                ? 'bg-black/50 border-white/10 text-white' 
                                : 'bg-slate-200/50 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-350'
                            }`} title="Uniquely Assigned Reference Code">
                              {getEntryReferenceCode(entry, entries)}
                            </span>
                            <span className={`text-[8px] font-mono ${isSelected ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                              {entry.date}
                            </span>
                          </div>
                        </div>

                        <div className={`text-xs font-bold truncate mt-1 ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                          {entry.planned}
                        </div>

                        <div className={`flex justify-between items-center text-[9px] border-t mt-1.5 pt-1 ${
                          isSelected 
                            ? 'text-slate-150 border-white/10' 
                            : 'text-slate-550 dark:text-slate-400 border-slate-200/40 dark:border-slate-800/40'
                        }`}>
                          <span className="truncate max-w-[120px] flex items-center gap-1">
                            <span>By {entry.author.split('(')[0].trim()}</span>
                            {(() => {
                              const p = profiles.find(prof => prof.name === entry.author || prof.name === entry.author.split('(')[0].trim());
                              if (p?.tadpoleTag) {
                                return <span className="text-[10px] select-none" title="Tadpole 🐸">🐸</span>;
                              }
                              return null;
                            })()}
                          </span>
                          <div className="flex gap-2">
                            {entry.status === 'Approved' ? (
                              <span className={`flex items-center gap-0.5 text-[9px] font-mono select-none font-bold ${
                                isSelected ? 'text-emerald-300' : 'text-slate-450 dark:text-slate-500'
                              }`} title="Official Seal - Locked Record">
                                <Lock className="w-2.5 h-2.5 text-emerald-500" /> SEALED
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditInit(entry);
                                  }}
                                  className={`p-0.5 shrink-0 cursor-pointer ${
                                    isSelected ? 'text-slate-200 hover:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-amber-550'
                                  }`}
                                  title="Edit"
                                  id={`edit-btn-${entry.id}`}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEntry(entry.id);
                                  }}
                                  className={`p-0.5 shrink-0 cursor-pointer ${
                                    isSelected ? 'text-slate-200 hover:text-rose-300' : 'text-slate-404 dark:text-slate-500 hover:text-rose-650'
                                  }`}
                                  title="Delete"
                                  id={`delete-btn-${entry.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* EXPANDED LIVE PREVIEW GRID (RIGHT HALF / spanning 8) */}
            <div className="col-span-1 md:col-span-8 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-6 lg:p-8 flex flex-col overflow-y-auto text-slate-900 dark:text-slate-100 shadow-md">
              {selectedEntry ? (
                <>
                  {/* UTILITIES PANEL */}
                  <div className="no-print flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3 shrink-0">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                      Journal Entries
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEntriesToPrint([selectedEntry]);
                          setTimeout(() => {
                            window.print();
                          }, 150);
                        }}
                        className="bg-brand hover:bg-brand-hover text-white font-bold text-[10px] px-2.5 py-1 rounded flex items-center gap-1 transition-all uppercase cursor-pointer"
                        title="Print document for binder"
                        id="print-active"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print page</span>
                      </button>
                    </div>
                  </div>

                  {/* NOTEBOOK SPEC SHEET CONTAINER (STANDARDIZED JUDGES TEMPLATE) */}
                  <div 
                    className="print-page bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded text-slate-900 dark:text-slate-100 flex-1 flex flex-col gap-4 relative overflow-y-auto print:bg-white print:border-none print:p-0 transition-colors"
                    id="judges-proof-sheet"
                  >
                    
                    {/* FTC Header Plate */}
                    <div className="border-b-4 border-slate-900 dark:border-slate-100 pb-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black border border-slate-800 dark:border-slate-700 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 uppercase tracking-wide text-slate-800 dark:text-slate-200">
                          {selectedEntry.subteam} CATEGORY
                        </span>
                        <h4 className="text-xs font-black text-slate-950 dark:text-slate-50 uppercase font-display tracking-widest">
                          FTC ENGINEERING LOG
                        </h4>
                      </div>

                      <div className="text-left sm:text-right text-[10px] font-mono text-slate-600 dark:text-slate-400 flex flex-col gap-0.5">
                        <div><strong>REF ID:</strong> <span className="font-extrabold text-slate-905 dark:text-slate-100 select-all tracking-wider bg-slate-200/50 dark:bg-slate-800 px-1 rounded">{getEntryReferenceCode(selectedEntry, entries)}</span></div>
                        <div><strong>DATE:</strong> {selectedEntry.date}</div>
                        <div className="flex items-center gap-1 sm:justify-end">
                          <strong>AUTHOR:</strong>{' '}
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {selectedEntry.author}
                          </span>
                          {(() => {
                            const p = profiles.find(prof => prof.name === selectedEntry.author || prof.name === selectedEntry.author.split('(')[0].trim());
                            if (p?.tadpoleTag) {
                              return (
                                <span className="inline-flex items-center gap-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-mono text-[8px] font-black px-1.5 py-0.5 rounded border border-emerald-250 dark:border-emerald-800 select-none tracking-wider whitespace-nowrap animate-pulse ms-1">
                                  🐸 TADPOLE
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Live Quality & XP Analytics Panel */}
                    {(() => {
                      const score = calculateJournalQualityScore(selectedEntry);
                      let ratingLabel = "Basic Log (needs detail)";
                      let ratingColor = "text-amber-800 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30 bg-amber-500/5";
                      let ratingProgressColor = "bg-amber-500 animate-pulse";
                      
                      if (score >= 80) {
                        ratingLabel = "Perfect Judge Material (High Quality)";
                        ratingColor = "text-cyan-800 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-900/30 bg-cyan-500/5";
                        ratingProgressColor = "bg-cyan-500";
                      } else if (score >= 45) {
                        ratingLabel = "Satisfactory Notebook Entry (Good Quality)";
                        ratingColor = "text-indigo-800 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30 bg-indigo-500/5";
                        ratingProgressColor = "bg-indigo-505";
                      }
                      
                      return (
                        <div className={`p-3 rounded-lg border flex flex-col gap-2 relative overflow-hidden transition-all print:hidden ${ratingColor}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 select-none text-amber-500" />
                              <span className="font-mono text-[9px] font-black uppercase tracking-wider">Notebook Quality Audit</span>
                            </div>
                            <span className="font-mono text-xs font-black tracking-wide">
                              QI Score: {score}/100
                            </span>
                          </div>

                          <div className="w-full bg-slate-300 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className={`${ratingProgressColor} h-1.5 rounded-full transition-all duration-300`} style={{ width: `${score}%` }}></div>
                          </div>

                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-medium">{ratingLabel}</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                              XP Awarded: +{50 + score} XP
                            </span>
                          </div>

                          {/* Actionable tip if the score is less than 100 */}
                          {score < 100 && (
                            <p className="text-[9px] italic opacity-85 border-t border-dashed border-slate-300 dark:border-slate-800 pt-1 mt-0.5 leading-normal">
                              💡 <strong>Tips to improve QI:</strong> {
                                score < 25 ? "Provide more descriptive details in planned & accomplished fields (85+ words yields XP)." :
                                (selectedEntry.problemsAndSolutions?.length || 0) === 0 ? "Document at least 1-2 mechanical/programming challenges & solutions to boost score." :
                                (selectedEntry.images?.length || 0) === 0 ? "Upload pictures, build diagrams, or CAD screenshots as imagery proofs." :
                                (selectedEntry.planNextTime || '').split(/\s+/).filter(Boolean).length < 20 ? "Extend your 'Plan for next time' description to outline future subtasks." :
                                "Expand your text details to maximize the judges' assessment index."
                              }
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Content Fields Map */}
                    <div className="space-y-6 text-sm text-slate-800">
                      
                      {/* What We Planned */}
                      <div className="bg-white dark:bg-slate-905/60 border border-slate-205 dark:border-slate-830 p-5 lg:p-6 rounded-xl shadow-xs">
                        <strong className="block text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider text-[10px] mb-2 font-bold border-b border-slate-105 dark:border-slate-800 pb-1.5">
                          What we planned
                        </strong>
                        <p className="text-slate-900 dark:text-slate-100 leading-relaxed font-medium text-xs lg:text-sm whitespace-pre-wrap">
                          {selectedEntry.planned}
                        </p>
                      </div>

                      {/* What We Accomplished */}
                      <div className="bg-white dark:bg-slate-905/60 border border-slate-205 dark:border-slate-830 p-5 lg:p-6 rounded-xl shadow-xs">
                        <strong className="block text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider text-[10px] mb-2 font-bold border-b border-slate-105 dark:border-slate-800 pb-1.5">
                          What we accomplished
                        </strong>
                        <p className="text-slate-900 dark:text-slate-100 leading-relaxed text-xs lg:text-sm whitespace-pre-wrap">
                          {selectedEntry.accomplished}
                        </p>
                      </div>

                      {/* Problems & Solutions (Enumerated list) */}
                      <div className="bg-white dark:bg-slate-905/60 border border-slate-205 dark:border-slate-830 p-5 lg:p-6 rounded-xl shadow-xs">
                        <strong className="block text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider text-[10px] mb-2 font-bold border-b border-slate-105 dark:border-slate-800 pb-1.5">
                          Problems and solutions found
                        </strong>
                        {selectedEntry.problemsAndSolutions.length === 0 ? (
                          <p className="text-slate-400 dark:text-slate-500 italic text-xs lg:text-sm">No active blockers recorded.</p>
                        ) : (
                          <div className="space-y-3">
                            {selectedEntry.problemsAndSolutions.map((p, idx) => (
                              <div key={idx} className="flex gap-3 items-start pl-0.5">
                                <span className="bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="text-slate-900 dark:text-slate-100 leading-relaxed text-xs lg:text-sm font-medium whitespace-pre-wrap">
                                  {p}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Plan for next time */}
                      {selectedEntry.planNextTime && (
                        <div className="bg-white dark:bg-slate-905/60 border border-slate-205 dark:border-slate-830 p-5 lg:p-6 rounded-xl shadow-xs">
                          <strong className="block text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider text-[10px] mb-2 font-bold border-b border-slate-105 dark:border-slate-800 pb-1.5">
                            Plan for next time
                          </strong>
                          <p className="text-slate-900 dark:text-slate-100 leading-relaxed text-xs lg:text-sm whitespace-pre-wrap">
                            {selectedEntry.planNextTime}
                          </p>
                        </div>
                      )}

                      {/* Notebook imagery */}
                      {selectedEntry.images.length > 0 && (
                        <div className="space-y-1.5">
                          <strong className="block text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider text-[10px] font-bold">
                            Session Imagery Proofs (Chassis maps, tests, wiring diagrams)
                          </strong>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedEntry.images.map((img) => (
                              <div key={img.id} className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 rounded p-1 flex flex-col gap-1 ring-1 ring-slate-205 dark:ring-slate-800">
                                <div 
                                  onClick={() => setExpandedImage({ url: img.dataUrl, name: img.name })}
                                  className="aspect-[4/3] rounded overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-850 cursor-zoom-in hover:opacity-90 transition-opacity relative group/thumb"
                                  title="Click to view expanded image"
                                >
                                  <img 
                                    src={img.dataUrl} 
                                    alt={img.name} 
                                    className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-200 group-hover/thumb:scale-[1.02]"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/10 transition-colors flex items-center justify-center">
                                    <span className="opacity-0 group-hover/thumb:opacity-100 transition-opacity bg-slate-950/90 text-white text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 shadow">
                                      🔍 Click to Expand
                                    </span>
                                  </div>
                                </div>
                                <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 px-1 truncate shrink-0 flex justify-between items-center">
                                  <span className="truncate">📁 {img.name} ({(img.size / 1024).toFixed(1)} KB)</span>
                                  <button
                                    onClick={() => setExpandedImage({ url: img.dataUrl, name: img.name })}
                                    className="text-[9px] font-bold text-slate-400 hover:text-brand transition-colors cursor-pointer"
                                  >
                                    [ZOOM]
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Physical signature box designed specifically for judges approval */}
                    <div className="mt-auto pt-3 border-t border-dashed border-slate-400 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] font-mono text-slate-500 dark:text-slate-400 gap-2">
                      <span>FTC CENTRALIZED LEDGER IDENTIFIER AND PROOF — VERIFIED LOCAL SYNC</span>
                      {selectedEntry.status === 'Approved' ? (
                        <span className="shrink-0 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 uppercase tracking-wider">
                          ✔️ SIGNED OFF BY MENTOR: {selectedEntry.reviewer || 'TESTMENTOR'}
                        </span>
                      ) : (
                        <span className="shrink-0 border-b border-slate-800 dark:border-slate-500 w-[200px] text-right">SIGNATURE: ___________________</span>
                      )}
                    </div>

                  </div>

                  {/* PEER REVIEW & APPRAISAL ACTION CENTER (RENDERS BELOW PROOF SHEET) */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-lg p-3.5 mt-3 no-print shadow-sm flex flex-col gap-2.5">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-purple-500 animate-pulse" />
                        <span className="text-[10px] font-extrabold text-slate-650 dark:text-slate-400 uppercase tracking-widest font-mono">
                          Reviewer Appraisal Office
                        </span>
                      </div>
                      
                      {/* Current entry status tag in workspace */}
                      <span className="text-[9px] font-bold font-mono">
                        LOG STATE FLAG:{' '}
                        {selectedEntry.status === 'Approved' ? (
                          <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-850 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-900/50 uppercase font-bold">
                            🔒 Approved &amp; Locked
                          </span>
                        ) : selectedEntry.status === 'Needs Revision' ? (
                          <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-850 dark:text-rose-405 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-900/50 uppercase font-bold animate-pulse">
                            ⚠️ Returned for Revision
                          </span>
                        ) : selectedEntry.status === 'Pending Review' ? (
                          <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-850 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-900/50 uppercase font-bold animate-pulse">
                            ⏳ Pending Mentor Review
                          </span>
                        ) : (
                          <span className="bg-slate-105 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-705 uppercase">
                            ✍️ Working Draft (Offline Cache)
                          </span>
                        )}
                      </span>
                    </div>

                    {/* INTERACTIVE LIFE-CYCLE CATEGORIZATION DROPDOWN */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2.5 flex flex-col gap-1.5 shadow-sm">
                      <label htmlFor="lifecycle-status-selector" className="text-[10px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 font-mono uppercase flex items-center justify-between">
                        <span>⚙️ Categorize Log Status (Dropdown Menu)</span>
                        <span className="text-[8px] text-purple-605 dark:text-purple-400 font-mono font-bold uppercase select-none">Live Sync</span>
                      </label>
                      <select
                        id="lifecycle-status-selector"
                        value={selectedEntry.status || 'Draft'}
                        onChange={(e) => handleStatusDropdownChange(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-extrabold focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer"
                      >
                        <option value="Draft">✍️ Draft (Keeps log as an active working draft)</option>
                        <option value="Pending Review">⏳ Pending Review (Queue for coaching review)</option>
                        <option value="Needs Revision">⚠️ Needs Revision (Flag for corrections, allow editing)</option>
                        <option value="Approved">🔒 Approved (Seal log, locking it as complete)</option>
                      </select>
                    </div>

                    {/* Historical Mentor Comment details if they exist in the model */}
                    {selectedEntry.reviewNotes && (
                      <div className="bg-slate-200/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded text-[11px] leading-relaxed">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mb-1">
                          📋 historical appraisal commentary (By {selectedEntry.reviewer || 'Mentor Coach'}):
                        </span>
                        <p className="text-slate-800 dark:text-slate-100 whitespace-pre-wrap font-mono select-text bg-white dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
                          "{selectedEntry.reviewNotes}"
                        </p>
                        {selectedEntry.reviewedAt && (
                          <span className="block text-[8px] text-slate-500 font-mono mt-1 text-right">
                            Verified Timestamp: {new Date(selectedEntry.reviewedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* IF APPROVED, SHOW LOCKOUT OVERVIEW BANNER */}
                    {selectedEntry.status === 'Approved' ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-850 dark:text-emerald-300 p-2.5 rounded text-[11px] flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <strong>Official Log Verified:</strong> This entry has been signed off by the lead mentor as completed. The document is officially locked. Edit and delete operations are restricted by team protocol to guarantee official record integrity for FTC judges.
                        </div>
                      </div>
                    ) : (
                      /* ACTIVE ASSESSMENT PANEL (Renders if user role is privileged mentor, or if there is something input) */
                      <div className="flex flex-col gap-2">
                        {userRole === 'reviewer' ? (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider font-mono uppercase">
                                Action Statement / Appraisal Note (Required for returning/archiving):
                              </label>
                              <textarea
                                value={reviewNoteInput}
                                onChange={(e) => setReviewNoteInput(e.target.value)}
                                placeholder="Add technical comments or specific revisions requested (e.g., 'Verify the encoder ports match wiring diagram' or 'Excellent calculations on gear ratios! Approved.')"
                                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-450 dark:placeholder:text-slate-650 h-16 resize-y font-mono"
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              {/* APPROVE ACTION */}
                              <button
                                onClick={() => handleReviewAction('Approved')}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-3 rounded text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verify &amp; Seal Log</span>
                              </button>
                              
                              {/* REJECT/REV REQUEST ACTION */}
                              <button
                                onClick={() => handleReviewAction('Needs Revision')}
                                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2 px-3 rounded text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Return for Revision</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          // General student user message
                          <div className="bg-slate-200/40 dark:bg-slate-850/40 border border-dashed border-slate-300 dark:border-slate-800 p-2.5 rounded text-[10px] text-center text-slate-500 dark:text-slate-450 font-mono font-bold leading-normal">
                            🔒 FTC TEAM PROTOCOL: Entries are registered as Drafts. Designated review, appraisal, and final locking signature authority is exclusively assigned to Mentors & Captains.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500 gap-2">
                  <BookOpen className="w-10 h-10 stroke-1 text-slate-300 dark:text-slate-705" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">No Journal Selected</span>
                  <p className="text-[10px] max-w-xs text-slate-400 dark:text-slate-500">
                    Click an archive item on the directory list to preview the judges summary page, print copies, or extract Markdown blocks.
                  </p>
                </div>
              )}
            </div>

          </div>

        </section>

      </main>
      </div>
      )}



      {/* Expanded Image Lightbox Modal overlay */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md no-print"
            onClick={() => setExpandedImage(null)}
          >
            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Bar */}
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 text-slate-200">
                  <div className="w-5 h-5 flex items-center justify-center bg-slate-800 rounded p-0.5">
                    <RoboraidersLogo className="w-full h-full" />
                  </div>
                  <span className="text-xs font-mono font-bold truncate tracking-tight max-w-[200px] sm:max-w-md text-slate-300">
                    {expandedImage.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Download button */}
                  <a
                    href={expandedImage.url}
                    download={expandedImage.name}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider border border-slate-800 bg-slate-900 cursor-pointer"
                    title="Download original file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                  
                  {/* Close button */}
                  <button
                    onClick={() => setExpandedImage(null)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-450 rounded transition-colors border border-slate-800 bg-slate-900 cursor-pointer"
                    title="Close overlay [ESC]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Viewport Box */}
              <div className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-6 flex items-center justify-center min-h-[250px]">
                <img
                  src={expandedImage.url}
                  alt={expandedImage.name}
                  className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded shadow-lg ring-1 ring-slate-800 select-none cursor-default"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Specs Footer Bar */}
              <div className="bg-slate-950/80 px-4 py-2 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-4">
                  <span>FORMAT: {expandedImage.url.substring(0, 30).includes('svg') ? 'Vector (SVG)' : 'Compressed Image'}</span>
                  {expandedImage.url.startsWith('data:') && (
                    <span>BUFFER SIZE: {Math.round(expandedImage.url.length * 0.75 / 1024)} KB</span>
                  )}
                </div>
                <button
                  onClick={() => setExpandedImage(null)}
                  className="text-red-500 hover:text-red-400 font-bold tracking-wider uppercase transition-colors text-[9px] cursor-pointer"
                >
                  DISMISS VIEW
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create / Edit Profile Modal */}
      <AnimatePresence>
        {isCreateProfileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md no-print"
            onClick={closeCreateProfileModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-850 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-brand" />
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-200">
                    {editingProfileId ? 'Update Team Profile' : 'Register New Team Profile'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeCreateProfileModal}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateProfile} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-5 flex flex-col gap-4 text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[70vh]">
                  
                  {/* Name field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>Full Name</span>
                      <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. testLeader, Mark Watney"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                    />
                  </div>

                  {/* School Email field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>School Email</span>
                      <span className="text-brand">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. mwatney@school.edu"
                      value={newProfileEmail}
                      onChange={(e) => setNewProfileEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-855 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-805 transition-all font-medium"
                    />
                  </div>

                  {/* School ID (lunch #) field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>School ID (Lunch #)</span>
                      <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 558291"
                      value={newProfileSchoolId}
                      onChange={(e) => setNewProfileSchoolId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-medium font-mono"
                    />
                  </div>

                  {/* Primary Subteam (dropdown, cannot be Inspire or Strategy) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>Primary Subteam</span>
                      <span className="text-brand">*</span>
                    </label>
                    <select
                      value={newProfilePrimary}
                      onChange={(e) => setNewProfilePrimary(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-bold"
                    >
                      <option value="Design/Build/Fabrication" className="bg-white dark:bg-slate-900 text-slate-850 text-slate-800 dark:text-slate-100">Design/Build/Fabrication</option>
                      <option value="Programming" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Programming</option>
                      <option value="Outreach" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Outreach</option>
                      <option value="Business & Media" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Business & Media</option>
                      <option value="Mentor" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold">Coach / Mentor</option>
                      <option value="Lead/Captain" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold">Subteam Lead / Captain</option>
                    </select>
                  </div>

                  {/* Secondary Subteam (dropdown, can only be Inspire or Strategy) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>Secondary Subteam</span>
                      <span className="text-slate-400 font-normal italic font-sans lowercase text-[9px]">(optional)</span>
                    </label>
                    <select
                      value={newProfileSecondary}
                      onChange={(e) => setNewProfileSecondary(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-855 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-905 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-bold"
                    >
                      <option value="None" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">None (No secondary role)</option>
                      <option value="Inspire" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Inspire</option>
                      <option value="Strategy" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Strategy</option>
                    </select>
                  </div>

                  {/* Leadership dropdown */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>Leadership Role</span>
                    </label>
                    <select
                      value={newProfileLeadership}
                      onChange={(e) => setNewProfileLeadership(e.target.value as any)}
                      disabled={!(currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain')}
                      className={`w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-bold ${!(currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain') ? 'cursor-not-allowed opacity-75' : ''}`}
                    >
                      <option value="None" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">None</option>
                      <option value="Captain" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Captain</option>
                      <option value="Subteam leader" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Subteam leader</option>
                    </select>
                    {!(currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain') && (
                      <span className="text-[9px] text-slate-400 italic">Only mentors/captains can update the leadership role.</span>
                    )}
                  </div>

                  {/* Account Level / Role dropdown */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>Account Level / Role</span>
                    </label>
                    <select
                      value={newProfileRole}
                      onChange={(e) => setNewProfileRole(e.target.value as any)}
                      disabled={!(currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain')}
                      className={`w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-bold ${!(currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain') ? 'cursor-not-allowed opacity-75' : ''}`}
                    >
                      <option value="member" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Student Team Member</option>
                      <option value="captain" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Subteam Lead / Captain</option>
                      <option value="mentor" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Coach / Mentor</option>
                      <option value="mentor_captain" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Mentor / Captain</option>
                    </select>
                    {!(currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain') && (
                      <span className="text-[9px] text-slate-400 italic">Only mentors/captains can update the account level.</span>
                    )}
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-850 flex justify-end gap-2 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={closeCreateProfileModal}
                    className="px-3.5 py-1.5 rounded text-xs font-bold font-mono uppercase bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded text-xs font-bold font-mono uppercase tracking-wider bg-brand hover:bg-brand-hover text-white transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    {editingProfileId ? <CheckCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{editingProfileId ? 'Update Profile' : 'Create Profile'}</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mentor/Captain Accounts Approval Dashboard Modal */}
      <AnimatePresence>
        {isApprovalsOpen && (currentUser?.role === 'mentor_captain' || currentUser?.role === 'mentor' || currentUser?.role === 'captain') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md no-print"
            onClick={() => setIsApprovalsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg p-5 flex flex-col max-h-[85vh] shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 mb-3.5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 dark:bg-purple-950/50 p-2 rounded text-purple-700 dark:text-purple-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Workspace Access Approvals
                    </h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      FTC Team #6567 — Active Identity & Credentials Authority
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsApprovalsOpen(false)}
                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                  title="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
                
                {/* Section A: Pending Access Requests */}
                <div>
                  <h3 className="text-[11px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 leading-none">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Access Requests ({accounts.filter(a => a.status === 'Pending').length})</span>
                  </h3>

                  {accounts.filter(a => a.status === 'Pending').length === 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-850/50 border border-slate-200/60 dark:border-slate-800/40 rounded p-4 text-center text-slate-500 dark:text-slate-400 font-medium">
                      🚀 There are no access requests awaiting mentor evaluation.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {accounts.filter(a => a.status === 'Pending').map((acc) => (
                        <div 
                          key={acc.id}
                          className="bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/15 rounded p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{acc.name}</span>
                              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                {acc.role === 'mentor' || acc.role === 'captain' || acc.role === 'mentor_captain' ? 'Mentor Class' : 'Member Class'}
                              </span>
                            </div>
                             <div className="text-[11px] text-slate-700 dark:text-slate-350 font-mono mt-1 space-y-0.5">
                              <div>Email: <strong>{acc.schoolEmail}</strong></div>
                              <div>ID/Lunch #: <strong className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">{acc.schoolId}</strong></div>
                              <div>Primary: <strong>{formatSubteamLabel(acc.primarySubteam)}</strong> • Secondary: <strong>{acc.secondarySubteam}</strong></div>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Leadership:</span>
                              {currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain' ? (
                                <select
                                  value={acc.leadership || 'None'}
                                  onChange={(e) => {
                                    const updated = accounts.map(a => a.id === acc.id ? { ...a, leadership: e.target.value as any } : a);
                                    setAccounts(updated);
                                    localStorage.setItem('ftc_user_accounts', JSON.stringify(updated));
                                    showToast(`Updated leadership for pending user ${acc.name} to ${e.target.value}.`, 'success');
                                  }}
                                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 font-sans font-bold text-[10px] text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-brand outline-none"
                                >
                                  <option value="None">None</option>
                                  <option value="Captain">Captain</option>
                                  <option value="Subteam leader">Subteam leader</option>
                                </select>
                              ) : (
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase text-[9px]">
                                  {acc.leadership || 'None'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {(currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain') && (
                              <button
                                onClick={() => handleStartEditProfile(acc.name)}
                                className="bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white font-black py-2 px-4 rounded-md text-[11.5px] uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                title="Edit Requesting Profile"
                              >
                                <Edit className="w-3.5 h-3.5 whitespace-nowrap" /> Edit Profile
                              </button>
                            )}
                            
                            <button
                              onClick={async () => {
                                try {
                                  const updatedUser = { ...acc, status: 'Approved' } as UserAccount;
                                  await setDoc(doc(db, 'users', acc.id), updatedUser);
                                  sendEmailNotification(
                                    acc.schoolEmail,
                                    `[FTC #6567] Access Request APPROVED: Welcome to the Team!`,
                                    `Hi ${acc.name},

Your access request to the FTC #6567 Workspace has been APPROVED by the Mentors/Captains.

You can now log in using:
• School Email: ${acc.schoolEmail}
• School ID: ${acc.schoolId}

Best of luck on the build season! Go RoboRaiders!

Best regards,
FTC #6567 Captains & Mentors`
                                  );
                                  showToast(`Access APPROVED for ${acc.name}!`, 'success');
                                } catch (e: any) {
                                  showToast(`Approval failed: ${e.message}`, 'danger');
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black py-2 px-4 rounded-md text-[11.5px] uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5 whitespace-nowrap" strokeWidth={2.5} /> Approve Request
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const updatedUser = { ...acc, status: 'Rejected' } as UserAccount;
                                  await setDoc(doc(db, 'users', acc.id), updatedUser);
                                  showToast(`Access REJECTED for ${acc.name}.`, 'danger');
                                } catch (e: any) {
                                  showToast(`Rejection failed: ${e.message}`, 'danger');
                                }
                              }}
                              className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black py-2 px-4 rounded-md text-[11.5px] uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5 whitespace-nowrap" strokeWidth={2.5} /> Reject Request
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section B: Registered Directory */}
                <div>
                  <h3 className="text-[11px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                    Authorized Team Roster ({accounts.filter(a => a.status !== 'Pending').length})
                  </h3>

                  <div className="border border-slate-200 dark:border-slate-805 rounded-md divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                    {accounts.filter(a => a.status !== 'Pending').map((acc) => (
                      <div 
                        key={acc.id}
                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-850/45 flex justify-between items-center gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-slate-800 dark:text-slate-100">{acc.name}</span>
                            <span className="text-slate-400 dark:text-slate-600">•</span>
                            <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">{acc.schoolEmail}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider font-bold">
                            {acc.role === 'mentor' ? 'Coach / Mentor' : acc.role === 'captain' ? 'Subteam Lead / Captain' : acc.role === 'mentor_captain' ? 'Mentor / Captain' : 'Team Member'}
                            <span className="mx-1.5">•</span>
                            Subteam: {formatSubteamLabel(acc.primarySubteam)}
                            {acc.secondarySubteam !== 'None' && ` / ${acc.secondarySubteam}`}
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Leadership:</span>
                            {currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain' ? (
                              <select
                                value={acc.leadership || 'None'}
                                onChange={async (e) => {
                                  try {
                                    const updatedUser = { ...acc, leadership: e.target.value as any } as UserAccount;
                                    await setDoc(doc(db, 'users', acc.id), updatedUser);
                                    showToast(`Updated leadership for roster user ${acc.name} to ${e.target.value}.`, 'success');
                                  } catch (err: any) {
                                    showToast(`Failed to update leadership status: ${err.message}`, 'danger');
                                  }
                                }}
                                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 font-sans font-bold text-[10px] text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-brand outline-none"
                              >
                                <option value="None">None</option>
                                <option value="Captain">Captain</option>
                                <option value="Subteam leader">Subteam leader</option>
                              </select>
                            ) : (
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase text-[9px]">
                                {acc.leadership || 'None'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                            acc.status === 'Approved' 
                              ? 'bg-emerald-50 border-emerald-250 text-emerald-850 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-350'
                              : 'bg-rose-50 border-rose-250 text-rose-850 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-350'
                          }`}>
                            {acc.status}
                          </span>

                          {acc.id !== 'a-admin' && (
                            <div className="flex items-center gap-1.5">
                              {acc.status !== 'Approved' && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const updatedUser = { ...acc, status: 'Approved' } as UserAccount;
                                      await setDoc(doc(db, 'users', acc.id), updatedUser);
                                      sendEmailNotification(
                                        acc.schoolEmail,
                                        `[FTC #6567] Access Request APPROVED: Welcome to the Team!`,
                                        `Hi ${acc.name},

Your access request to the FTC #6567 Workspace has been APPROVED by the Mentors/Captains.

You can now log in using:
• School Email: ${acc.schoolEmail}
• School ID: ${acc.schoolId}

Best of luck on the build season! Go RoboRaiders!

Best regards,
FTC #6567 Captains & Mentors`
                                      );
                                      showToast(`Access APPROVED for ${acc.name}!`, 'success');
                                    } catch (err: any) {
                                      showToast(`Approval failed: ${err.message}`, 'danger');
                                    }
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2 rounded text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Approve User Access"
                                >
                                  <CheckCircle className="w-3 h-3" strokeWidth={2.5} /> Approve
                                </button>
                              )}
                              
                              {(currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain') && (
                                <button
                                  onClick={() => handleStartEditProfile(acc.name)}
                                  className="p-1 text-slate-400 hover:text-brand dark:hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-805 rounded transition-all cursor-pointer"
                                  title="Edit User Profile"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}
                              
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Revoke registration and purge ${acc.name}?`)) {
                                    try {
                                      await deleteDoc(doc(db, 'users', acc.id));
                                      if (currentUser && currentUser.id === acc.id) {
                                        handleLogout();
                                      }
                                      showToast(`Purged user profile ${acc.name}.`, 'info');
                                    } catch (err: any) {
                                      showToast(`Deletion failed: ${err.message}`, 'danger');
                                    }
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-605 dark:hover:text-rose-455 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all cursor-pointer"
                                title="Delete Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section C: Simulated System Mail Logs */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-[11px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                      <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Simulated Email Dispatch Logs ({dispatchedEmails.length})</span>
                    </h3>
                    {dispatchedEmails.length > 0 && (
                      <button
                        onClick={() => {
                          setDispatchedEmails([]);
                          showToast('Cleared simulated email logs.', 'info');
                        }}
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 text-slate-500 hover:text-rose-600 dark:hover:text-rose-450 transition-colors cursor-pointer"
                        title="Clear Email Log"
                      >
                        Clear Outbox Logs
                      </button>
                    )}
                  </div>

                  {dispatchedEmails.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-850/50 border border-slate-200/60 dark:border-slate-800/40 rounded p-4 text-center text-slate-450 dark:text-slate-450 font-mono text-[10px] leading-relaxed">
                      📬 Outgoing team notifications will log here (e.g. registration request alerts sent to Captains/Mentors, and approval confirmation emails sent to approved student users).
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {dispatchedEmails.map((email) => (
                        <div 
                          key={email.id}
                          className="bg-slate-950 text-slate-250 border border-slate-800 rounded p-3 text-[10px] font-mono leading-relaxed"
                        >
                          <div className="flex flex-col gap-0.5 border-b border-slate-800/60 pb-1.5 mb-1.5 text-slate-400">
                            <div className="flex justify-between items-center text-[9px]">
                              <div><span className="text-purple-400 font-bold">FROM:</span> {email.from}</div>
                              <span>{new Date(email.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div><span className="text-emerald-400 font-bold">TO:</span> <strong className="text-emerald-350">{email.to}</strong></div>
                            <div className="text-slate-100 font-bold mt-1 text-[10.5px] border-l-2 border-brand pl-1.5">{email.subject}</div>
                          </div>
                          <div className="whitespace-pre-wrap text-slate-300 font-sans text-[11px] leading-relaxed pl-0.5">{email.body}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Close footer */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-2 flex justify-end shrink-0">
                <button
                  onClick={() => setIsApprovalsOpen(false)}
                  className="bg-slate-850 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-slate-150 font-extrabold px-4 py-1.5 text-xs rounded transition-all uppercase tracking-wider cursor-pointer"
                >
                  Dismiss Panel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Time Card Entry Modal */}
      <AnimatePresence>
        {editingTimeEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md no-print"
            onClick={() => setEditingTimeEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-850 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand" />
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-200">
                    Edit Time Card Entry
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingTimeEntry(null)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleUpdateEditTimeEntry} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50 text-[11px] font-mono text-slate-500 dark:text-slate-400 space-y-0.5">
                  <div>Owner: <strong className="text-slate-805 dark:text-slate-200">{editingTimeEntry.userName}</strong></div>
                  <div>Email: <strong>{editingTimeEntry.userEmail}</strong></div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Workshop Date
                    </label>
                    <input
                      type="date"
                      value={editTimeDate}
                      onChange={(e) => setEditTimeDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-705 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Select Subteam Focus
                    </label>
                    <select
                      value={editTimeSubteam}
                      onChange={(e) => setEditTimeSubteam(e.target.value as Subteam)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-705 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                    >
                      {ATTENDANCE_SUBTEAMS.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <TimePicker
                      label="Start Time"
                      value={editTimeStart}
                      onChange={setEditTimeStart}
                    />
                  </div>
                  <div>
                    <TimePicker
                      label="End Time"
                      value={editTimeEnd}
                      onChange={setEditTimeEnd}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Brief Task Details / Contributions
                  </label>
                  <textarea
                    placeholder="Describe specific CAD modeling or programming details..."
                    value={editTimeDesc}
                    onChange={(e) => setEditTimeDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-705 rounded p-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none resize-none font-sans leading-relaxed focus:bg-white dark:focus:bg-slate-800"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingTimeEntry(null)}
                    className="px-4 py-2 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs rounded uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student/User Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && currentUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md no-print"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-850 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-brand" />
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-200">
                    Account Profile &amp; Security Settings
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveSettings} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-5 flex flex-col gap-4 text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[70vh]">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans mb-1 border-b border-slate-150 dark:border-slate-800 pb-3">
                    Update your local system profile information. Changes to credentials will require you to log in with the new details on subsequent sessions.
                  </p>

                  {/* Name field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>Full Name</span>
                      <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your First & Last Name"
                      value={settingsName}
                      onChange={(e) => setSettingsName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                    />
                  </div>

                  {/* School Email field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>School Email Address</span>
                      <span className="text-brand">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@school.edu"
                      value={settingsEmail}
                      onChange={(e) => setSettingsEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-855 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-805 transition-all font-medium"
                    />
                  </div>

                  {/* Password / School ID field */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-baseline">
                      <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <span>Password / School ID (Lunch #)</span>
                        <span className="text-brand">*</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      disabled
                      placeholder="e.g. 558291"
                      value={settingsSchoolId}
                      className="w-full bg-slate-100 border border-slate-250 dark:bg-slate-800 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-405 outline-none transition-all font-medium font-mono cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleRequestReset(currentUser.schoolEmail);
                        setIsSettingsOpen(false);
                        setCurrentUser(null);
                        localStorage.removeItem('ftc_current_user');
                      }}
                      className="mt-1.5 w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-rose-600 dark:text-rose-450 text-[10px] font-black tracking-wider uppercase py-2 px-3 rounded border border-dashed border-rose-300 dark:border-rose-800 flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 animate-pulse text-rose-500" /> <span>Send Password Reset Email to Change Password</span>
                    </button>
                    <span className="text-[9px] text-slate-450 dark:text-slate-500 leading-normal mt-0.5">
                      To safeguard account profiles, password (school ID) changes must be initiated via password reset authentication tokens dispatched over email.
                    </span>
                  </div>

                  {/* Primary Subteam */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>Primary Subteam</span>
                      <span className="text-brand">*</span>
                    </label>
                    <select
                      value={settingsPrimary}
                      onChange={(e) => setSettingsPrimary(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-bold"
                    >
                      <option value="Design/Build/Fabrication">⚙️ Design/Build/Fabrication Subteam</option>
                      <option value="Programming">💻 Programming Subteam</option>
                      <option value="Outreach">🌍 Outreach Subteam</option>
                      <option value="Business & Media">📈 Business &amp; Media</option>
                      {currentUser?.role !== 'member' && (
                        <>
                          <option value="Mentor">🛡️ Coach / Mentor</option>
                          <option value="Lead/Captain">👑 Subteam Lead / Captain</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Secondary Subteam */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>Secondary Subteam</span>
                      <span className="text-brand">*</span>
                    </label>
                    <select
                      value={settingsSecondary}
                      onChange={(e) => setSettingsSecondary(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-bold"
                    >
                      <option value="None">🚫 None — Primary Focus Only</option>
                      <option value="Inspire">✨ Inspire</option>
                      <option value="Strategy">📊 Strategy</option>
                    </select>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3.5 border-t border-slate-150 dark:border-slate-850 flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-3.5 py-2 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 rounded-md text-[11px] uppercase tracking-wider font-extrabold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-brand hover:bg-brand-hover text-white font-extrabold text-[11px] py-2 px-4 rounded-md uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* First-Time Password Setup Dialog Modal */}
      <AnimatePresence>
        {showPasswordSetupPrompt && currentUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md no-print"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border-2 border-brand/50 dark:border-brand/40 rounded-lg shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-4 py-3 border-b border-brand/20 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand animate-pulse" />
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-100">
                    🔑 Security Preset Update
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSetupPrompt(false);
                    showToast("Password configuration postponed. You can change it anytime in Settings.", "info");
                  }}
                  className="p-1 hover:bg-slate-850 text-slate-450 hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSetupCustomPassword} className="flex flex-col flex-1">
                <div className="p-5 flex flex-col gap-4 text-slate-800 dark:text-slate-100">
                  <div className="bg-brand/10 text-brand dark:bg-brand/25 dark:text-brand-hover p-4 rounded border border-brand/20">
                    <p className="text-xs font-bold font-sans flex items-center gap-1.5 uppercase tracking-wide mb-1">
                      👑 Configure Secure Login Password
                    </p>
                    <p className="text-[11px] leading-relaxed font-sans">
                      Your profile has been registered! You are currently using your **School ID (lunch #)** as your password. 
                      Please establish a secure custom password below to authorize future system logins instead of your ID.
                    </p>
                  </div>

                  {/* Password field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>New Secure Password</span>
                      <span className="text-brand">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={setupCustomPassword}
                      onChange={(e) => setSetupCustomPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-950 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-mono animate-none"
                    />
                  </div>

                  {/* Confirm Password field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>Confirm New Password</span>
                      <span className="text-brand">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat secure password"
                      value={setupConfirmPassword}
                      onChange={(e) => setSetupConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-850 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-950 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all font-mono animate-none"
                    />
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3.5 border-t border-slate-150 dark:border-slate-850 flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSetupPrompt(false);
                      showToast("Password configuration postponed. You can change it anytime in Settings.", "info");
                    }}
                    className="px-3.5 py-2 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 rounded-md text-[11px] uppercase tracking-wider font-extrabold transition-all cursor-pointer font-sans"
                  >
                    Postpone
                  </button>
                  <button
                    type="submit"
                    disabled={isSettingUpPassword}
                    className="bg-brand hover:bg-brand-hover text-white font-extrabold text-[11px] py-2 px-4 rounded-md uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 font-sans"
                  >
                    {isSettingUpPassword ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Save Secure Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mentor-Only Season Transition & Backups Modal */}
      <AnimatePresence>
        {isBackupTransitionOpen && currentUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md no-print"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-red-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-red-955 text-white px-4 py-3.5 border-b border-red-500/20 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-100">
                    🗃️ Season Transition &amp; Database Purge
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isProcessingTransition) {
                      setIsBackupTransitionOpen(false);
                      setTransitionConfirmCode('');
                    }
                  }}
                  className="p-1 hover:bg-red-900/40 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                  disabled={isProcessingTransition}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleRunTransition} className="flex flex-col flex-1 overflow-y-auto max-h-[80vh]">
                <div className="p-5 flex flex-col gap-4 text-slate-800 dark:text-slate-100">
                  
                  {/* Safety Alert Warning Banner */}
                  <div className="bg-amber-500/10 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 p-4 rounded border border-amber-500/20 flex gap-3 text-xs leading-relaxed font-sans">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-extrabold uppercase tracking-wide mb-1">
                        ⚠️ High-Impact Administrative Operation
                      </p>
                      <p className="font-sans text-[11px] leading-relaxed">
                        Transitioning seasons is an irreversible action. By selecting collections below, you will purge active Firestore indices of current entries. 
                        To ensure safety, <strong>the system will automatically generate &amp; download a full backup JSON file</strong> to your computer before any deletion starts.
                      </p>
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Select Collections to Clean up:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      {/* Journal Entries */}
                      <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/70 border border-slate-205 dark:border-slate-800 rounded cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={transitionState.journalEntries}
                          disabled={isProcessingTransition}
                          onChange={(e) => setTransitionState({ ...transitionState, journalEntries: e.target.checked })}
                          className="mt-0.5 rounded text-red-650 focus:ring-red-500 h-3.5 w-3.5"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Journal Entries</span>
                          <span className="text-[10px] text-slate-400">{entries.length} items logged</span>
                        </div>
                      </label>

                      {/* Time Entries */}
                      <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/70 border border-slate-205 dark:border-slate-800 rounded cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={transitionState.timeEntries}
                          disabled={isProcessingTransition}
                          onChange={(e) => setTransitionState({ ...transitionState, timeEntries: e.target.checked })}
                          className="mt-0.5 rounded text-red-650 focus:ring-red-500 h-3.5 w-3.5"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Time Clock Entries</span>
                          <span className="text-[10px] text-slate-400">{timeEntries.length} clock logs</span>
                        </div>
                      </label>

                      {/* Kanban Tasks */}
                      <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/70 border border-slate-205 dark:border-slate-800 rounded cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={transitionState.kanbanTasks}
                          disabled={isProcessingTransition}
                          onChange={(e) => setTransitionState({ ...transitionState, kanbanTasks: e.target.checked })}
                          className="mt-0.5 rounded text-red-605 focus:ring-red-500 h-3.5 w-3.5"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Kanban Board Tasks</span>
                          <span className="text-[10px] text-slate-400">{kanbanTasks.length} tickets</span>
                        </div>
                      </label>

                      {/* Outreach Events */}
                      <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/70 border border-slate-205 dark:border-slate-800 rounded cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={transitionState.outreachEvents}
                          disabled={isProcessingTransition}
                          onChange={(e) => setTransitionState({ ...transitionState, outreachEvents: e.target.checked })}
                          className="mt-0.5 rounded text-red-605 focus:ring-red-500 h-3.5 w-3.5"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Outreach Event Logs</span>
                          <span className="text-[10px] text-slate-400">{outreachEvents.length} events logged</span>
                        </div>
                      </label>

                      {/* XP Adjustments */}
                      <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/70 border border-slate-205 dark:border-slate-800 rounded cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={transitionState.xpAdjustments}
                          disabled={isProcessingTransition}
                          onChange={(e) => setTransitionState({ ...transitionState, xpAdjustments: e.target.checked })}
                          className="mt-0.5 rounded text-red-605 focus:ring-red-500 h-3.5 w-3.5"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">XP Adjustments</span>
                          <span className="text-[10px] text-slate-400">{xpAdjustments.length} adjustment records</span>
                        </div>
                      </label>

                      {/* Dispatched Emails */}
                      <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/70 border border-slate-205 dark:border-slate-800 rounded cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={transitionState.dispatchedEmails}
                          disabled={isProcessingTransition}
                          onChange={(e) => setTransitionState({ ...transitionState, dispatchedEmails: e.target.checked })}
                          className="mt-0.5 rounded text-red-605 focus:ring-red-500 h-3.5 w-3.5"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Simulated Outbox Emails</span>
                          <span className="text-[10px] text-slate-400">{dispatchedEmails.length} logged dispatches</span>
                        </div>
                      </label>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-slate-200 dark:border-slate-800/80 my-2"></div>

                    {/* Dangerous User Roster Reset Checkboxes */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                        <span>Dangerous Account Roster Actions:</span>
                      </label>

                      {/* Clear Unapproved Pending Applications */}
                      <label className="flex items-start gap-2.5 p-2.5 bg-rose-50/10 dark:bg-rose-950/10 border border-rose-500/20 rounded cursor-pointer hover:bg-rose-50/20 select-none">
                        <input
                          type="checkbox"
                          checked={transitionState.clearPendingUsers}
                          disabled={isProcessingTransition}
                          onChange={(e) => setTransitionState({ ...transitionState, clearPendingUsers: e.target.checked })}
                          className="mt-0.5 rounded text-red-605 focus:ring-red-500 h-3.5 w-3.5"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Reject Core Pending Enrollees</span>
                          <span className="text-[10px] text-slate-400">Purges currently unapproved enrollees from queue</span>
                        </div>
                      </label>

                      {/* Clear All Roster Accounts Except Me and Mentors */}
                      <label className="flex items-start gap-2.5 p-2.5 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded cursor-pointer hover:bg-red-500/10 select-none">
                        <input
                          type="checkbox"
                          checked={transitionState.resetStudents}
                          disabled={isProcessingTransition}
                          onChange={(e) => setTransitionState({ ...transitionState, resetStudents: e.target.checked })}
                          className="mt-0.5 rounded text-red-655 focus:ring-red-500 h-3.5 w-3.5"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Wipe Non-Mentor Student Roster Accounts</span>
                          <span className="text-[10px] text-red-405 font-sans">Deletes student profile logins. Approved coach/mentor accounts remain fully intact!</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Confirmation text input box */}
                  <div className="flex flex-col gap-1.5 mt-2 bg-slate-50 dark:bg-slate-955 p-3.5 rounded border border-slate-200 dark:border-slate-800">
                    <label className="text-[10px] font-mono font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                      <span>Type Validation Code:</span>
                    </label>
                    <p className="text-[11px] text-slate-500 leading-none">
                      Verify action by typing <span className="font-mono font-bold select-all bg-red-100 dark:bg-red-955 text-red-650 dark:text-red-400 px-1 py-0.5 rounded">RESET_SEASON</span> below:
                    </p>
                    <input
                      type="text"
                      required
                      disabled={isProcessingTransition}
                      placeholder="RESET_SEASON"
                      value={transitionConfirmCode}
                      onChange={(e) => setTransitionConfirmCode(e.target.value)}
                      className="w-full bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-800 rounded px-2.5 py-1.5 mt-1 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-red-505 transition-all font-mono"
                    />
                  </div>

                  {/* Real-time progression state */}
                  {transitionProgress && (
                    <div className="bg-slate-900 text-white p-3 rounded font-mono text-[10px] border border-red-500/30">
                      <div className="flex justify-between font-bold text-red-400">
                        <span>Purging Records...</span>
                        <span>{Math.round((transitionProgress.current / transitionProgress.total) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-850 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div 
                          className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(transitionProgress.current / transitionProgress.total) * 100}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-slate-450 text-[9px] flex justify-between">
                        <span className="truncate">Active Document: {transitionProgress.collection}</span>
                        <span>({transitionProgress.current}/{transitionProgress.total})</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer buttons */}
                <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3.5 border-t border-slate-150 dark:border-slate-855 flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBackupTransitionOpen(false);
                      setTransitionConfirmCode('');
                    }}
                    disabled={isProcessingTransition}
                    className="px-3.5 py-2 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-405 rounded-md text-[11px] uppercase tracking-wider font-extrabold transition-all cursor-pointer font-sans disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingTransition || transitionConfirmCode.trim() !== 'RESET_SEASON'}
                    className="bg-red-655 hover:bg-red-600 active:bg-red-750 disabled:bg-rose-500/10 disabled:text-rose-500/40 text-white font-extrabold text-[11px] py-1.5 px-4 rounded-md uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-sans disabled:cursor-not-allowed"
                  >
                    {isProcessingTransition ? (
                      <span>Executing Purge...</span>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5" /> Execute Season Reset
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Card PDF Export Modal */}
      <AnimatePresence>
        {isTimeExportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md no-print"
            onClick={() => setIsTimeExportModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-850 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand" />
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-100">
                    Export Time Cards to PDF
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTimeExportModalOpen(false)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col gap-4 text-slate-850 dark:text-slate-100 overflow-y-auto max-h-[75vh]">
                <p className="text-xs leading-normal font-medium text-slate-600 dark:text-slate-400">
                  Generate print-ready official time sheet reports. Compile lab hours, shifts, and contribution narratives for FTC judge binders.
                </p>

                {/* Scope Selection */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Select Report Target Scope
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTimeExportScope('all')}
                      className={`px-3 py-2.5 rounded border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        timeExportScope === 'all'
                          ? 'border-brand bg-brand-light text-brand dark:bg-brand-dark/15 dark:text-red-200'
                          : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850 bg-white dark:bg-slate-940 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Entire Team</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeExportScope('members')}
                      className={`px-3 py-2.5 rounded border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        timeExportScope === 'members'
                          ? 'border-brand bg-brand-light text-brand dark:bg-brand-dark/15 dark:text-red-200'
                          : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850 bg-white dark:bg-slate-940 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Select Members</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeExportScope('subteam')}
                      className={`px-3 py-2.5 rounded border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        timeExportScope === 'subteam'
                          ? 'border-brand bg-brand-light text-brand dark:bg-brand-dark/15 dark:text-red-200'
                          : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850 bg-white dark:bg-slate-940 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Subteam Area</span>
                    </button>
                  </div>
                </div>

                {/* Subteam selection options */}
                {timeExportScope === 'subteam' && (
                  <div className="bg-slate-50 dark:bg-slate-950/30 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5 animate-fade-in text-xs">
                    <label className="text-[9px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Choose Subteam Focus Area
                    </label>
                    <select
                      value={selectedTimeExportSubteam}
                      onChange={(e) => setSelectedTimeExportSubteam(e.target.value as Subteam | 'All')}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand font-mono cursor-pointer"
                    >
                      <option value="All">All Focus Areas</option>
                      {ATTENDANCE_SUBTEAMS.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Member selection checklist options */}
                {timeExportScope === 'members' && (
                  <div className="bg-slate-50 dark:bg-slate-950/30 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-3 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Roster Participants Check-List
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const allEmails = Array.from(
                              new Set([
                                ...accounts.filter(a => a.status === 'Approved').map(a => a.schoolEmail),
                                ...timeEntries.map(t => t.userEmail)
                              ])
                            );
                            setSelectedTimeExportMembers(allEmails);
                          }}
                          className="text-[9px] font-mono uppercase bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-2 py-1 rounded cursor-pointer"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTimeExportMembers([])}
                          className="text-[9px] font-mono uppercase bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-2 py-1 rounded cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[160px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 p-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
                      {Array.from(
                        new Map(
                          [
                            ...accounts.filter(a => a.status === 'Approved').map(a => ({ name: a.name, email: a.schoolEmail })),
                            ...timeEntries.map(t => ({ name: t.userName, email: t.userEmail }))
                          ].map(item => [item.email, item])
                        ).values()
                      )
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((member) => {
                          const isChecked = selectedTimeExportMembers.includes(member.email);
                          return (
                            <label
                              key={member.email}
                              className="flex items-center gap-2 px-1.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-850 rounded cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTimeExportMembers(prev => [...prev, member.email]);
                                  } else {
                                    setSelectedTimeExportMembers(prev => prev.filter(email => email !== member.email));
                                  }
                                }}
                                className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold truncate">{member.name}</span>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono truncate leading-none mt-0.5">{member.email}</span>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Score Live counter and disclaimer */}
                <div className="bg-slate-100 dark:bg-slate-850/50 p-3.5 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col gap-1 text-slate-800 dark:text-slate-200 text-xs">
                  {(() => {
                    let matchingEntries = [];
                    if (timeExportScope === 'all') {
                      matchingEntries = timeEntries;
                    } else if (timeExportScope === 'members') {
                      matchingEntries = timeEntries.filter(t => selectedTimeExportMembers.includes(t.userEmail));
                    } else if (timeExportScope === 'subteam') {
                      matchingEntries = timeEntries.filter(t => selectedTimeExportSubteam === 'All' || t.subteam === selectedTimeExportSubteam);
                    }

                    const totalHr = matchingEntries.reduce((sum, e) => sum + e.durationHours, 0);

                    return (
                      <div className="flex flex-col gap-1 gap-y-1.5">
                        <div className="flex justify-between items-center font-mono">
                          <span className="text-slate-500 dark:text-slate-450 uppercase font-black tracking-wider text-[9px]">Matched Records:</span>
                          <span className="font-extrabold text-cyan-600 dark:text-cyan-400">
                            {matchingEntries.length} Records
                          </span>
                        </div>
                        <div className="flex justify-between items-center font-mono">
                          <span className="text-slate-500 dark:text-slate-450 uppercase font-black tracking-wider text-[9px]">Cumulative Time:</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {totalHr.toFixed(2)} Hours
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  <p className="text-[9px] text-slate-400 font-mono dark:text-slate-500 leading-normal border-t border-slate-200 dark:border-slate-800 pt-2.5 mt-1.5">
                    * The system compiles individual records per page if selecting members, or a unified report for team/subteams. Choose "Save as PDF" to generate the printable document.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-105 dark:border-slate-850 flex justify-end gap-2 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTimeExportModalOpen(false)}
                  className="px-3.5 py-1.5 rounded text-xs font-bold font-mono uppercase bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintTimePDF}
                  className="px-4 py-1.5 rounded text-xs font-bold font-mono uppercase tracking-wider bg-cyan-600 hover:bg-cyan-700 text-white transition-colors flex items-center gap-1 shadow-sm cursor-pointer border-0 outline-none"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Generate PDF Report</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Export Menu Modal */}
      <AnimatePresence>
        {isExportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md no-print"
            onClick={() => setIsExportModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-850 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand" />
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider">
                    Export Journal PDF Documents
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col gap-4 text-slate-850 dark:text-slate-100">
                <p className="text-xs leading-normal font-medium text-slate-600 dark:text-slate-400">
                  Compile engineering logs into structured, high-density print pages optimized for judge binder reviews.
                </p>

                {/* Scope Selection */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Export Range
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExportScope('all')}
                      className={`px-3 py-2 rounded border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        exportScope === 'all'
                          ? 'border-brand bg-brand-light text-brand dark:bg-brand-dark/15 dark:text-red-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>All Journals ({entries.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportScope('filtered')}
                      className={`px-3 py-2 rounded border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        exportScope === 'filtered'
                          ? 'border-brand bg-brand-light text-brand dark:bg-brand-dark/15 dark:text-red-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Targeted Set</span>
                    </button>
                  </div>
                </div>

                {/* Filters for Targeted Set */}
                <AnimatePresence>
                  {exportScope === 'filtered' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-3 bg-slate-50 dark:bg-slate-950/30 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col"
                    >
                      {/* Subteam select */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          Subteam Category
                        </label>
                        <select
                          value={exportSubteam}
                          onChange={(e) => setExportSubteam(e.target.value as Subteam | 'All')}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand font-mono"
                        >
                          <option value="All">All Subteams</option>
                          {SUBTEAM_LIST.map((sub) => (
                            <option key={sub} value={sub}>{formatSubteamLabel(sub)}</option>
                          ))}
                        </select>
                      </div>

                      {/* Status select */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          Workflow Review Status
                        </label>
                        <select
                          value={exportStatus}
                          onChange={(e) => setExportStatus(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand font-mono"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Draft">Draft</option>
                          <option value="Pending Review">Pending Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Needs Revision">Needs Revision</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Scope Live counter and disclaimer */}
                <div className="bg-slate-100 dark:bg-slate-850/50 p-3 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col gap-1 text-slate-800 dark:text-slate-200">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-450 uppercase font-black tracking-wider text-[9px]">Compiled Journals:</span>
                    <span className="font-extrabold text-brand dark:text-red-400">
                      {exportScope === 'all' 
                        ? entries.length 
                        : entries.filter(e => {
                            const subteamMatch = exportSubteam === 'All' || e.subteam === exportSubteam;
                            const statusMatch = exportStatus === 'All' || e.status === exportStatus;
                            return subteamMatch && statusMatch;
                          }).length
                      } Records
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono dark:text-slate-500 leading-normal">
                    * Browser print dialog will appear. Please choose "Save as PDF" to generate files. Each record starts automatically on a unique page.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-105 dark:border-slate-850 flex justify-end gap-2 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-3.5 py-1.5 rounded text-xs font-bold font-mono uppercase bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="px-4 py-1.5 rounded text-xs font-bold font-mono uppercase tracking-wider bg-brand hover:bg-brand-hover text-white transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Generate & Print PDF</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLORIOUS LEVEL-UP RANK CELEBRATION MODAL */}
      <AnimatePresence>
        {levelUpData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md no-print"
            onClick={() => setLevelUpData(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -50, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className={`relative w-full max-w-md ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              } border rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden flex flex-col items-center text-center`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top gradient strip */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600"></div>

              {/* Decorative radial background light */}
              <div className="absolute -top-24 w-72 h-72 bg-gradient-radial from-cyan-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

              {/* Celebratory particles shower */}
              {[-25, -10, 0, 10, 25].map((deg, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, x: 0, opacity: 0, scale: 0.5 }}
                  animate={{ 
                    y: [-40, -120 - (i * 20)], 
                    x: [0, (i - 2) * 50], 
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1.2, 1, 0.2]
                  }}
                  transition={{ duration: 3.5, ease: "easeOut", repeat: Infinity, repeatDelay: i * 0.4 }}
                  className="absolute text-yellow-500 select-none pointer-events-none text-xl z-50"
                  style={{ top: "35%" }}
                >
                  {i % 2 === 0 ? '✨' : '⭐'}
                </motion.div>
              ))}

              {/* Bouncing Trophy Frame */}
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 3, 
                  ease: "easeInOut", 
                  repeat: Infinity 
                }}
                className="w-24 h-24 bg-gradient-to-br from-amber-400/20 to-pink-500/10 dark:from-amber-400/10 dark:to-pink-500/5 rounded-full flex items-center justify-center mb-5 border border-amber-500/30 shadow-lg relative group"
              >
                {/* Outer spin halo */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/20 animate-[spin_20s_linear_infinite]"></div>
                
                <Trophy className="w-12 h-12 text-amber-500 dark:text-amber-450 drop-shadow-[0_4px_12px_rgba(245,158,11,0.3)]" />
              </motion.div>

              {/* Promotion Header */}
              <span className="text-[10px] font-mono font-extrabold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase leading-none bg-cyan-100/30 dark:bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-200/40 dark:border-cyan-800/20">
                Arena promotion unlocked
              </span>

              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-4 leading-none uppercase tracking-wider font-mono">
                Level {levelUpData.level} Achieved!
              </h2>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mt-1 uppercase font-display leading-tight tracking-tight px-2 drop-shadow-sm">
                {levelUpData.levelName}
              </h1>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent my-4"></div>

              <p className="text-xs sm:text-[13px] leading-relaxed font-sans text-slate-600 dark:text-slate-400 max-w-sm px-2">
                Congratulations, <strong className="text-slate-800 dark:text-slate-200">{currentUser?.name}</strong>! Your technical contributions, notebook logs, and laboratory hour accumulations have elevated your rank in the RoboRaiders Championship Arena.
              </p>

              {/* Progress Seal Plate */}
              <div className={`mt-5 p-3 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
              } flex items-center gap-4 w-full max-w-xs justify-center`}>
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-lg flex items-center justify-center font-mono font-black text-white text-lg shadow-md shrink-0">
                  {levelUpData.level}
                </div>
                <div className="text-left font-sans">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block leading-none">Guild Standing</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase mt-1 block leading-none truncate max-w-[170px]">{levelUpData.levelName}</span>
                </div>
              </div>

              {/* Close / Claim button */}
              <button
                type="button"
                onClick={() => setLevelUpData(null)}
                className="mt-6 w-full max-w-xs py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
              >
                Acknowledge Achievement!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Batch Print Container - ONLY printed, completely invisible on screen, styles strictly adjusted for print */}
      {entriesToPrint && entriesToPrint.length > 0 && (
        <div className="print-only bg-white text-black min-h-screen p-0 m-0 z-[200] relative font-sans">
          
          {/* TITLE PAGE */}
          <div 
            className="flex flex-col justify-between p-12 bg-white text-black m-0 relative border-4 border-double border-slate-950 mb-12"
            style={{ pageBreakAfter: 'always', minHeight: '240mm' }}
          >
            <div className="flex flex-col items-center justify-center flex-1 text-center my-auto min-h-[170mm]">
              <div className="w-24 h-24 mb-6 border-4 border-slate-950 flex items-center justify-center rounded-full mx-auto">
                <span className="font-extrabold text-2xl tracking-tighter">RR</span>
              </div>
              <h1 className="text-4xl font-extrabold uppercase font-display tracking-tight text-slate-950 mb-2">
                RoboRaiders Team Portal
              </h1>
              <p className="text-sm font-mono uppercase tracking-widest text-slate-600 mb-8">
                Official Engineering Notebook
              </p>
              
              <div className="w-32 h-1 bg-slate-950 my-4 mx-auto"></div>
              
              <p className="text-base font-extrabold text-slate-800 uppercase tracking-wide">
                FIRST Tech Challenge Team #6567
              </p>
            </div>

            <div className="mt-auto border-t-2 border-slate-950 pt-6">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-705">
                <div>
                  <p><strong>DOCUMENT TYPE:</strong> Compiled Ledger</p>
                  <p><strong>EXPORTED ON:</strong> {new Date().toISOString().split('T')[0]}</p>
                </div>
                <div className="text-right">
                  <p><strong>RECORDS CLASSIFIED:</strong> {entriesToPrint.length} Entries</p>
                  <p><strong>STATUS:</strong> Verified Team Records</p>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE OF CONTENTS */}
          <div 
            className="flex flex-col p-12 bg-white text-black min-h-screen relative mb-12"
            style={{ pageBreakAfter: 'always', minHeight: '240mm' }}
          >
            <div className="border-b-4 border-slate-950 pb-4 mb-6">
              <h2 className="text-2xl font-black uppercase tracking-wider text-slate-950 font-display">
                Table of Contents
              </h2>
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-1">
                FTC #6567 Compiled Notebook Binder
              </p>
            </div>

            <div className="flex-1 mt-4">
              <table className="w-full text-left text-xs text-slate-800">
                <thead>
                  <tr className="border-b-2 border-slate-950 font-mono font-bold text-slate-500 uppercase text-[10px]">
                    <th className="py-2 pr-4 w-1/6">REF ID</th>
                    <th className="py-2 pr-4 w-1/6">DATE</th>
                    <th className="py-2 pr-4 w-1/4">AUTHOR</th>
                    <th className="py-2 pr-4 w-1/4">SUBTEAM CATEGORY</th>
                    <th className="py-2 text-right w-1/12">PAGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {entriesToPrint.map((entry, idx) => (
                    <tr key={entry.id} className="align-top">
                      <td className="py-3 pr-4 font-mono font-bold text-slate-950">{getEntryReferenceCode(entry, entries)}</td>
                      <td className="py-3 pr-4 font-mono">{entry.date}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-900">{entry.author}</td>
                      <td className="py-3 pr-4 text-slate-700 font-mono text-[10px] uppercase">{entry.subteam}</td>
                      <td className="py-3 text-right font-mono text-slate-500 font-bold">{idx + 3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-auto border-t border-slate-300 pt-4 text-center text-[10px] font-mono text-slate-400">
            </div>
          </div>

          {entriesToPrint.map((entry, index) => {
            return (
              <div 
                key={entry.id} 
                className={`flex-1 flex flex-col gap-4 p-6 bg-white border border-slate-200 rounded-lg mb-8 relative print:border-none print:p-0 ${
                  index < entriesToPrint.length - 1 ? 'break-after-page' : ''
                }`}
                style={{ pageBreakAfter: index < entriesToPrint.length - 1 ? 'always' : 'auto' }}
              >
                {/* FTC Header Plate */}
                <div className="border-b-4 border-slate-950 pb-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black border border-slate-950 px-2 py-0.5 rounded bg-slate-150 uppercase tracking-wide text-slate-950">
                      {entry.subteam} CATEGORY
                    </span>
                    <h4 className="text-xs font-black text-slate-950 uppercase font-display tracking-widest">
                      FTC ENGINEERING LOG
                    </h4>
                  </div>

                  <div className="text-left sm:text-right text-[10px] font-mono text-slate-700 flex flex-col gap-0.5">
                    <div><strong>REF ID:</strong> <span className="font-extrabold text-slate-950 select-all tracking-wider bg-slate-100 px-1 rounded">{getEntryReferenceCode(entry, entries)}</span></div>
                    <div><strong>DATE:</strong> {entry.date}</div>
                    <div className="flex items-center gap-1 sm:justify-end">
                      <strong>AUTHOR:</strong>{' '}
                      <span className="font-bold text-slate-950">
                        {entry.author}
                      </span>
                      {(() => {
                        const p = profiles.find(prof => prof.name === entry.author || prof.name === entry.author.split('(')[0].trim());
                        if (p?.tadpoleTag) {
                          return (
                            <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 font-mono text-[8px] font-black px-1.5 py-0.5 rounded border border-emerald-250 select-none tracking-wider whitespace-nowrap animate-pulse ms-1">
                              🐸 TADPOLE
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Content Fields Map */}
                <div className="space-y-3.5 text-xs text-slate-950">
                  
                  {/* What We Planned */}
                  <div className="bg-white border border-slate-300 p-3 rounded">
                    <strong className="block text-slate-500 uppercase font-mono tracking-wider text-[10px] mb-1 font-bold border-b border-slate-200 pb-0.5">
                      What we planned
                    </strong>
                    <p className="text-slate-950 leading-normal font-medium text-[11px] whitespace-pre-wrap">
                      {entry.planned}
                    </p>
                  </div>

                  {/* What We Accomplished */}
                  <div className="bg-white border border-slate-300 p-3 rounded">
                    <strong className="block text-slate-500 uppercase font-mono tracking-wider text-[10px] mb-1 font-bold border-b border-slate-200 pb-0.5">
                      What we accomplished
                    </strong>
                    <p className="text-slate-950 leading-normal text-[11px] whitespace-pre-wrap">
                      {entry.accomplished}
                    </p>
                  </div>

                  {/* Problems & Solutions */}
                  <div className="bg-white border border-slate-300 p-3 rounded">
                    <strong className="block text-slate-500 uppercase font-mono tracking-wider text-[10px] mb-1.5 font-bold border-b border-slate-200 pb-0.5">
                      Problems and solutions found
                    </strong>
                    {entry.problemsAndSolutions.length === 0 ? (
                      <p className="text-slate-400 italic text-[11px]">No active blockers recorded.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {entry.problemsAndSolutions.map((p, idx) => (
                          <div key={idx} className="flex gap-2.5 items-start pl-0.5 animate-none">
                            <span className="bg-slate-950 text-white text-[9px] font-bold px-1.5 rounded mt-0.5 shrink-0">
                              {idx + 1}
                            </span>
                            <div className="text-slate-950 leading-normal text-[11px] font-medium whitespace-pre-wrap">
                              {p}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Plan for next time */}
                  {entry.planNextTime && (
                    <div className="bg-white border border-slate-300 p-3 rounded">
                      <strong className="block text-slate-500 uppercase font-mono tracking-wider text-[10px] mb-1 font-bold border-b border-slate-200 pb-0.5">
                        Plan for next time
                      </strong>
                      <p className="text-slate-950 leading-normal text-[11px] whitespace-pre-wrap">
                        {entry.planNextTime}
                      </p>
                    </div>
                  )}

                  {/* Notebook imagery */}
                  {entry.images.length > 0 && (
                    <div className="space-y-1.5">
                      <strong className="block text-slate-500 uppercase font-mono tracking-wider text-[10px] font-bold">
                        Session Imagery Proofs (Chassis maps, tests, wiring diagrams)
                      </strong>
                      <div className="grid grid-cols-2 gap-2">
                        {entry.images.map((img) => (
                          <div key={img.id} className="border border-slate-300 bg-white rounded p-1 flex flex-col gap-1">
                            <div className="aspect-[4/3] rounded overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                              <img 
                                src={img.dataUrl} 
                                alt={img.name} 
                                className="max-h-full max-w-full object-contain pointer-events-none"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="text-[9px] font-mono text-slate-550 px-1 truncate shrink-0">
                              📁 {img.name} ({(img.size / 1024).toFixed(1)} KB)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Physical signature box */}
                <div className="mt-auto pt-3 border-t border-dashed border-slate-400 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] font-mono text-slate-500 gap-2">
                  <span>FTC CENTRALIZED LEDGER IDENTIFIER AND PROOF — VERIFIED LOCAL SYNC</span>
                  {entry.status === 'Approved' ? (
                    <span className="shrink-0 text-emerald-700 font-extrabold flex items-center gap-1 uppercase tracking-wider">
                      ✔️ SIGNED OFF BY MENTOR: {entry.reviewer || 'TESTMENTOR'}
                    </span>
                  ) : (
                    <span className="shrink-0 border-b border-slate-900 w-[200px] text-right">SIGNATURE: ___________________</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Time Sheets Print Container - ONLY printed, completely invisible on screen, styles adjusted for print */}
      {timeEntriesToPrint && timeEntriesToPrint.length > 0 && (
        <div className="print-only bg-white text-black min-h-screen p-0 m-0 z-[200] relative font-sans">
          
          {/* Cover / Header Plate */}
          <div className="border-b-4 border-slate-950 pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black border border-slate-950 px-2 py-0.5 rounded bg-slate-150 uppercase tracking-wide text-slate-950 animate-none">
                  ROBORAIDERS TIME LEDGER
                </span>
              </div>
              <h1 className="text-xl font-extrabold uppercase mt-1">
                {timeExportScope === 'all' && 'Entire Team Cumulative Time Report'}
                {timeExportScope === 'members' && 'Individual Participant Time Sheets'}
                {timeExportScope === 'subteam' && `Subteam Time Sheet — ${selectedTimeExportSubteam}`}
              </h1>
            </div>

            <div className="text-left sm:text-right text-[10px] font-mono text-slate-700 space-y-0.5">
              <div><strong>GENERATED:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
              <div><strong>TOTAL ENTRIES:</strong> <span className="font-bold text-slate-950">{timeEntriesToPrint.length} Records</span></div>
              <div><strong>CUMULATIVE TIME:</strong> <span className="font-extrabold text-slate-950 bg-slate-105 px-1 border border-slate-300 rounded">{timeEntriesToPrint.reduce((sum, e) => sum + e.durationHours, 0).toFixed(2)} Hours</span></div>
              <div><strong>TEAM NUMBER:</strong> FTC #6567</div>
            </div>
          </div>

          {/* Render individual tables per member if in "members" mode to give professional layout, or print a single consolidated master registry for "all" or "subteam" options */}
          {timeExportScope === 'members' ? (
            // Print separate elegant timecard sections per selected member
            (() => {
              // Group entries by userEmail
              const grouped: { [email: string]: TimeEntry[] } = {};
              timeEntriesToPrint.forEach(entry => {
                const email = entry.userEmail;
                if (!grouped[email]) grouped[email] = [];
                grouped[email].push(entry);
              });

              return Object.keys(grouped).map((email, gIdx) => {
                const userEntries = grouped[email].sort((a,b) => a.date.localeCompare(b.date));
                const totalHours = userEntries.reduce((sum, e) => sum + e.durationHours, 0);
                const userName = userEntries[0]?.userName || email;

                return (
                  <div 
                    key={email} 
                    className={`pb-6 mb-8 border-b border-dashed border-slate-300 text-slate-900 dark:text-slate-100 ${
                      gIdx < Object.keys(grouped).length - 1 ? 'break-after-page' : ''
                    }`}
                    style={{ pageBreakAfter: gIdx < Object.keys(grouped).length - 1 ? 'always' : 'auto' }}
                  >
                    <div className="flex justify-between items-end border-b border-slate-950 pb-2 mb-4">
                      <div>
                        <h2 className="text-base font-black text-slate-950 uppercase">{userName}</h2>
                        <p className="text-[10px] text-slate-500 font-mono tracking-wide">{email}</p>
                      </div>
                      <div className="text-right text-[10px] font-mono">
                        <div><strong>SUBTEAM Focus:</strong> <span className="font-bold">{userEntries[0]?.subteam}</span></div>
                        <div><strong>INDIVIDUAL STRENGTH:</strong> <span className="font-extrabold text-slate-950 dark:text-slate-200">{totalHours.toFixed(2)} Hours</span></div>
                      </div>
                    </div>

                    <table className="w-full text-left text-[11px] font-sans border-collapse">
                      <thead>
                        <tr className="border-b border-slate-950 text-[10px] uppercase font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900">
                          <th className="py-2 px-1">Date</th>
                          <th className="py-2 px-1">Subteam Focus</th>
                          <th className="py-2 px-1">Shift Period</th>
                          <th className="py-2 px-1 text-right">Duration</th>
                          <th className="py-2 px-1.5 pl-4 max-w-xs">Task Details / Contributions Log</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userEntries.map((e) => (
                          <tr key={e.id} className="border-b border-slate-200 dark:border-slate-800">
                            <td className="py-3 px-1 font-mono whitespace-nowrap">{e.date}</td>
                            <td className="py-3 px-1 font-medium">{e.subteam}</td>
                            <td className="py-3 px-1 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{e.startTime} - {e.endTime}</td>
                            <td className="py-3 px-1 text-right font-bold whitespace-nowrap">{e.durationHours.toFixed(2)} hrs</td>
                            <td className="py-3 px-1.5 pl-4 break-words text-slate-800 dark:text-slate-200 leading-relaxed max-w-xs">{e.taskDescription}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-8 flex justify-end text-[9px] font-mono text-slate-500">
                      <span className="border-b border-slate-955 w-44 text-right">MEMBER SIGNATURE: _________________</span>
                    </div>
                  </div>
                );
              });
            })()
          ) : (
            // A single clean, consolidated master log table for All or Subteam focus scope
            <div className="space-y-4">
              <table className="w-full text-left text-[11px] font-sans border-collapse">
                <thead>
                  <tr className="border-b border-slate-955 text-[10px] uppercase font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900">
                    <th className="py-2 px-1">Date</th>
                    <th className="py-2 px-1">Team Participant</th>
                    <th className="py-2 px-1">Subteam Focus Area</th>
                    <th className="py-2 px-1 text-center">Shift Range</th>
                    <th className="py-2 px-1 text-right">Hours</th>
                    <th className="py-2 px-3 pl-4 max-w-md">Contribution Narrative</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntriesToPrint.sort((a,b) => a.date.localeCompare(b.date) || a.userName.localeCompare(b.userName)).map((e) => (
                    <tr key={e.id} className="border-b border-slate-200 dark:border-slate-800">
                      <td className="py-3 px-1 font-mono whitespace-nowrap">{e.date}</td>
                      <td className="py-3 px-1 font-bold text-slate-955 dark:text-slate-200">{e.userName}</td>
                      <td className="py-3 px-1 font-medium">{e.subteam}</td>
                      <td className="py-3 px-1 text-center font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{e.startTime} – {e.endTime}</td>
                      <td className="py-3 px-1 text-right font-bold whitespace-nowrap">{e.durationHours.toFixed(2)} hr</td>
                      <td className="py-3 px-3 pl-4 text-slate-800 dark:text-slate-200 leading-relaxed break-words max-w-md">{e.taskDescription}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-8 flex justify-end text-[9px] font-mono text-slate-500">
                <span className="border-b border-slate-950 w-52 text-right">MENTOR/CAPTAIN REVIEWER SIGNATURE: _________________</span>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

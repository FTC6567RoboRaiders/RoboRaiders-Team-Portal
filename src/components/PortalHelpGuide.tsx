import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  HelpCircle,
  Search,
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  Trophy,
  Clock,
  Layers,
  Users,
  FileText,
  Boxes,
  DollarSign,
  ShieldCheck,
  Database,
  ChevronRight,
  Sparkles,
  Award,
  SlidersHorizontal,
  MapPin,
  ExternalLink,
  ChevronDown,
  Info,
  AlertTriangle,
  Lightbulb,
  Workflow,
  Plus,
  Flame,
  Zap,
  Type,
  Maximize2,
  Minimize2,
  Bookmark,
  Share2,
  Compass,
  Code,
  Wrench,
  Cpu,
  HeartHandshake,
  Check,
  ChevronUp,
  ArrowRight,
  List
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { UserAccount } from '../types';

interface PortalHelpGuideProps {
  currentUser: UserAccount | null;
  onBack: () => void;
  showToast: (msg: string, type?: 'success' | 'danger' | 'info') => void;
  onNavigate?: (view: string) => void;
}

export type ReadingMode = 'interactive' | 'continuous' | 'focus';
export type FontSize = 'compact' | 'standard' | 'comfortable';

interface GuideSection {
  id: string;
  title: string;
  shortTitle: string;
  category: 'onboarding' | 'core' | 'engineering' | 'hardware' | 'trivia' | 'admin' | 'faq';
  icon: any;
  iconColor: string;
  estimatedMinutes: number;
  summary: string;
  steps?: { title: string; desc: string }[];
  keyFeatures: { title: string; desc: string }[];
  proTips: string[];
  callout?: {
    type: 'rule' | 'safety' | 'tip' | 'mentor';
    title: string;
    text: string;
  };
  faqItems?: { q: string; a: string }[];
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'quick-start',
    title: '1. Quick Start & Onboarding Guide',
    shortTitle: 'Quick Start',
    category: 'onboarding',
    icon: Sparkles,
    iconColor: 'text-amber-500',
    estimatedMinutes: 3,
    summary: 'Essential 5-step checklist for every student and mentor joining FTC Team #6567 RoboRaiders.',
    steps: [
      {
        title: 'Step 1: Sign Up & Claim Your Profile',
        desc: 'Register using your school email address. Mentors and Captains review and approve all new accounts to ensure secure access.'
      },
      {
        title: 'Step 2: Answer Today\'s Question of the Day',
        desc: 'Jump into the Question of the Day hub to answer the daily game rule or programming challenge for instant XP rewards.'
      },
      {
        title: 'Step 3: Punch Your Time Card',
        desc: 'When entering the robotics lab, tap "Time Card" and start the live stopwatch or log your meeting hours. Lab hours award +10 XP per hour.'
      },
      {
        title: 'Step 4: Pick Up Kanban Tasks',
        desc: 'Navigate to the Kanban Board to review sprint goals, assign yourself open tickets, and drag them to "In Progress".'
      },
      {
        title: 'Step 5: Draft Engineering Notebook Logs',
        desc: 'Document mechanical builds, autonomous code, or CAD revisions with objectives, challenges, and implementation notes.'
      }
    ],
    keyFeatures: [
      { title: 'Cross-Device Cloud Sync', desc: 'Real-time synchronization across lab computers, tablets, and smartphones with offline resilience.' },
      { title: 'Subteam Focuses', desc: 'Select your primary and secondary subteams (Design/Build/Fabrication, Programming, Outreach, Business & Media, Inspire, Strategy).' },
      { title: 'Navigation Personalization', desc: 'Choose between the modern left Sidebar or clean Top Bar navigation layout anytime in Settings.' }
    ],
    proTips: [
      'Pin the RoboRaiders Portal to your smartphone home screen or browser bookmarks for one-tap access in the lab.',
      'Always log out when using shared workshop laptops to keep your session and XP achievements secure.'
    ],
    callout: {
      type: 'tip',
      title: 'First-Week Goal',
      text: 'New team members should log at least 4 lab hours, answer 3 daily questions, and submit 1 engineering notebook journal in their first week!'
    }
  },
  {
    id: 'qotd-trivia',
    title: '2. Question of the Day & Trivia Leaderboard',
    shortTitle: 'Question of the Day',
    category: 'trivia',
    icon: Flame,
    iconColor: 'text-rose-500',
    estimatedMinutes: 4,
    summary: 'Daily game manual rules, autonomous programming challenges, and engineering puzzles with countdown timers and live leaderboards.',
    steps: [
      {
        title: '1. Live Countdown Timer Window',
        desc: 'Each question is active for a set window (e.g. 15 minutes during a workshop meeting, or 24 hours daily). The circular timer bar changes color as time runs out.'
      },
      {
        title: '2. Auto-Graded Multiple Choice vs Open Ended',
        desc: 'Multiple-choice questions award instant XP upon correct answer selection. Open-ended engineering questions are sent to mentors for review and rubric grading.'
      },
      {
        title: '3. Streak Multipliers (🔥)',
        desc: 'Answer consecutive daily questions to build your active streak and earn bonus multiplier badges.'
      },
      {
        title: '4. Subteam Rivalry & Trivia Podium',
        desc: 'Points earned contribute to your individual rank on the Gold/Silver/Bronze podium AND your subteam\'s standing in the Subteam League.'
      }
    ],
    keyFeatures: [
      { title: 'XP Economy Integration', desc: 'Points awarded (+25 to +250 XP) immediately increment your member level and rank in the Portal Hub.' },
      { title: 'Official Rule Citations', desc: 'Questions reference official FIRST Tech Challenge Game Manual rules (e.g. <RG02>, <GS4>, <RE03>) for tournament preparedness.' },
      { title: 'Mentor Grading Desk', desc: 'Mentors can review open student explanations, award custom bonus points, and provide constructive engineering feedback.' },
      { title: 'Historical Question Archive', desc: 'Review previous questions, solutions, and explanations anytime to study for referee inspections.' }
    ],
    proTips: [
      'Read the hint and rule citation carefully before submitting multiple-choice answers—you cannot change your answer once locked in.',
      'Mentors can use the 1-click template library to instantly publish game rule questions before team meetings.'
    ],
    callout: {
      type: 'rule',
      title: 'FIRST Game Manual Rule Reference',
      text: 'Understanding rules before tournament day prevents costly match penalties like Minor Violations (10 pts) and Major Violations (30 pts).'
    },
    faqItems: [
      { q: 'What happens if the timer expires before I answer?', a: 'Once the timer reaches zero, new submissions are locked. However, the answer key and rule explanation will be published to the question archive.' },
      { q: 'How do open-ended questions get graded?', a: 'Mentors review open responses on the Mentor Grading Desk, assign points based on technical depth, and leave personalized feedback notes.' }
    ]
  },
  {
    id: 'gamification-arena',
    title: '3. Portal Hub & Gamification Arena (XP, Ranks & Scouting)',
    shortTitle: 'XP & Arena',
    category: 'core',
    icon: Trophy,
    iconColor: 'text-amber-500',
    estimatedMinutes: 4,
    summary: 'Earn Experience Points (XP), level up, unlock prestigious specialist badges, and calculate match scouting scores.',
    keyFeatures: [
      { title: 'Dynamic XP Economy', desc: '+10 XP per logged lab hour, +25 XP per approved engineering journal, +15 XP per Kanban task, +30 XP per outreach event, and up to +250 XP per daily challenge.' },
      { title: 'Level Milestones', desc: 'Progress from Level 1 Rookie Raider up to Level 50 Grandmaster Legendary Engineer with visual progress rings.' },
      { title: 'Guild Career Trees', desc: 'Advance through specialized ranks across 5 divisions: Machinist/Fabricator, Systems Architect, Ambassador, Executive Director, and Master Mentor.' },
      { title: 'Arena Live Match Scouting', desc: 'Calculate match alliance scores, autonomous samples, teleop baskets, submersible ascents, and penalty adjustments.' }
    ],
    proTips: [
      'Writing high-quality journal entries with detailed engineering challenges gives the highest XP multipliers.',
      'Mentors can audit XP point transactions in the real-time XP Ledger accessible from the Portal Hub.'
    ],
    faqItems: [
      { q: 'How do I unlock badges?', a: 'Badges unlock automatically when you achieve milestones (e.g., logging 50+ lab hours, writing 10 journals, or maintaining a 7-day trivia streak).' },
      { q: 'Can my XP be adjusted manually?', a: 'Yes, Mentors and Captains can grant bonus XP for tournament excellence or Gracious Professionalism awards.' }
    ]
  },
  {
    id: 'engineering-notebook',
    title: '4. Engineering Notebook & Technical Journals',
    shortTitle: 'Notebook & Logs',
    category: 'engineering',
    icon: BookOpen,
    iconColor: 'text-cyan-500',
    estimatedMinutes: 5,
    summary: 'Create judge-ready engineering entries with structured technical sections, photo attachments, and approval workflows.',
    steps: [
      {
        title: '1. Structured Entry Breakdown',
        desc: 'Every entry requires 4 core pillars: (1) Objectives & Goals Planned, (2) Work Accomplished & Implementation, (3) Engineering Challenges & Troubleshooting, and (4) Next Steps & Action Items.'
      },
      {
        title: '2. AI-Assisted Quality Score',
        desc: 'The portal evaluates entry depth, technical vocabulary, and detail density to provide a real-time Quality Rating.'
      },
      {
        title: '3. Review & Mentor Approval Gate',
        desc: 'Entries start as Draft, move to "Pending Review", and require peer or mentor verification before being finalized into the official notebook.'
      },
      {
        title: '4. FIRST-Compliant PDF Compilation',
        desc: 'Export entries into formatted FIRST Tech Challenge engineering portfolios with official reference codes, table of contents, and cover pages.'
      }
    ],
    keyFeatures: [
      { title: 'Reference Code Engine', desc: 'Auto-generates FIRST-standard codes like "DBF-2026-001" or "PRG-2026-014" for easy indexing.' },
      { title: 'Media Attachments', desc: 'Attach CAD screenshots, wiring schematics, autonomous graphs, and workshop photos with automatic image compression.' },
      { title: 'Subteam Tagging', desc: 'Filter entries by Design/Build, Programming, Outreach, Business/Media, or Strategy.' }
    ],
    proTips: [
      'Include quantitative numbers in your logs (e.g., "adjusted gear ratio to 19.2:1 with 312 RPM output") for maximum judge evaluation scores.',
      'You cannot approve your own entries—collaborate with a teammate or mentor to review your submission.'
    ],
    callout: {
      type: 'mentor',
      title: 'Judge Evaluation Criteria',
      text: 'FTC Judges look for iterative design: Show what failed, why it failed, the math/testing you used to fix it, and the final validated outcome.'
    }
  },
  {
    id: 'time-tracking',
    title: '5. Time Card & Workshop Attendance',
    shortTitle: 'Time Card',
    category: 'core',
    icon: Clock,
    iconColor: 'text-emerald-500',
    estimatedMinutes: 3,
    summary: 'Track workshop attendance, active build sessions, subteam labor allocation, and printable timesheet logs.',
    keyFeatures: [
      { title: 'Live Stopwatch Clock-In', desc: 'One-tap clock-in when arriving at the lab with live pulsing timer indicator in the workspace header.' },
      { title: 'Manual Attendance Entry', desc: 'Log previous workshop sessions or remote CAD/programming hours with date, duration, subteam, and task notes.' },
      { title: 'Subteam Labor Distribution', desc: 'Visual charts display cumulative hours split across Build, Software, Outreach, Business, and Strategy.' },
      { title: 'Printable Timesheet PDFs', desc: 'Export verified student hours documentation for school varsity letters, scholarship proof, or FIRST Dean\'s List submissions.' }
    ],
    proTips: [
      'If you forget to clock out, the system allows you to manually adjust your end time to keep hours accurate.',
      'Consistent attendance directly boosts your guild XP and unlocks the "Workshop Veteran" badge.'
    ]
  },
  {
    id: 'kanban-board',
    title: '6. Collaborative Kanban Sprint Board',
    shortTitle: 'Kanban Board',
    category: 'engineering',
    icon: Layers,
    iconColor: 'text-indigo-500',
    estimatedMinutes: 3,
    summary: 'Agile task tracking board organized by sprint columns, subteams, priority flags, and assignees.',
    keyFeatures: [
      { title: '4 Sprint Columns', desc: 'Organize work into "Backlog", "In Progress", "Review & Testing", and "Completed".' },
      { title: 'Subteam Badges & Filter', desc: 'Filter board tickets by Programming, Build, Outreach, Business, or Strategy.' },
      { title: 'Priority Matrix', desc: 'Tag cards with Urgent (Red), High (Orange), Medium (Blue), or Low (Slate) urgency.' },
      { title: 'One-Click Task Migration', desc: 'Move tickets between stages or mark completed to automatically trigger XP rewards for the assignee.' }
    ],
    proTips: [
      'Break large mechanism projects into bite-sized 1-to-2 hour Kanban tasks for better team throughput.',
      'Captains can create tournament prep checklists directly on the board.'
    ]
  },
  {
    id: 'outreach-hub',
    title: '7. Outreach Logs & Community Impact',
    shortTitle: 'Outreach Hub',
    category: 'core',
    icon: Users,
    iconColor: 'text-purple-500',
    estimatedMinutes: 4,
    summary: 'Record STEM demonstrations, sponsor visits, charity campaigns, and generate FIRST Inspire Award portfolios.',
    keyFeatures: [
      { title: 'Impact Metrics Engine', desc: 'Log community headcount reach, student volunteer hours, audience demographics, and event locations.' },
      { title: 'FIRST Award Criteria Mapping', desc: 'Tag events with Connect, Motivate, and Inspire categories to align with judging criteria.' },
      { title: 'Photo Gallery Documentation', desc: 'Upload high-resolution event photos with captions and attendee feedback.' },
      { title: 'Official Outreach PDF Portfolio', desc: 'Compile a standalone, magazine-style outreach booklet complete with executive summary and charts.' }
    ],
    proTips: [
      'Log outreach events immediately after completing them while attendee numbers and volunteer hours are fresh.',
      'Highlight specific STEM engagement stories that demonstrate Gracious Professionalism.'
    ]
  },
  {
    id: 'inventory-manager',
    title: '8. Lab Inventory & Hardware Asset Tracker',
    shortTitle: 'Lab Inventory & Quick Log',
    category: 'hardware',
    icon: Boxes,
    iconColor: 'text-rose-500',
    estimatedMinutes: 5,
    summary: 'Manage goBILDA/REV parts, motors, tools, fasteners, custom storage bins, tool checkouts, and instant Quick Stock Logging.',
    steps: [
      {
        title: '⚡ Quick Stock Logging (No Edit Mode Required!)',
        desc: 'Click the "Quick Log" button on any item card or table row. Instantly choose "+ Restock", "- Consumed", "🔧 Prototyping", "⚠️ Damaged", or "🎯 Exact Count" to update quantities in one click without opening full edit mode.'
      },
      {
        title: 'Tool Loan & Check-Out System',
        desc: 'Borrow drills, soldering stations, or calibration sensors by clicking "Check Out". Specify borrower name, school email, and expected return date.'
      },
      {
        title: 'Physical Storage Locations',
        desc: 'Organize parts by custom physical spots (e.g. "Pit Tote 1", "Chassis Drawer A", "Electronics Shelf 3") or create new locations on the fly.'
      },
      {
        title: 'Bulk Editing Mode',
        desc: 'Select multiple items at once to bulk-move storage locations, reassign categories, or batch delete.'
      },
      {
        title: 'Barcode & Bin Labels Customizer',
        desc: 'Generate printable QR codes and bin labels with part names, SKUs, and storage locations for your lab totes.'
      }
    ],
    keyFeatures: [
      { title: 'Live Low-Stock Alerts', desc: 'Visual indicators trigger when stock drops below minimum safety thresholds.' },
      { title: 'Audit Trail & Chronological History', desc: 'Every stock increment, checkout, return, and restock is permanently recorded in the Movement Audit Log.' },
      { title: 'Official Part Catalog Lookup', desc: 'Auto-fetch product photos and specifications from goBILDA and REV Robotics databases using part SKUs.' },
      { title: 'Excel & CSV Export', desc: 'Download real-time inventory valuations and full Bills of Materials (BOM) in .xlsx format.' }
    ],
    proTips: [
      'Use the "Quick Log" button on your mobile phone in the workshop to quickly log parts taken for robot chassis assembly.',
      'Check the "Low Stock Reorders" tab before placing vendor orders with AndyMark, goBILDA, or REV.'
    ],
    callout: {
      type: 'safety',
      title: 'Lab Safety Protocol',
      text: 'Always wear ANSI Z87.1 approved safety glasses in the workshop and ensure high-power LiPo/REV batteries are charged inside fire-safe LiPo bags.'
    }
  },
  {
    id: 'general-ledger',
    title: '9. General Ledger & Team Finances',
    shortTitle: 'General Ledger',
    category: 'admin',
    icon: DollarSign,
    iconColor: 'text-emerald-500',
    estimatedMinutes: 4,
    summary: 'Track team bank balance, grants, school district allocations, registration fees, and part purchase reimbursements.',
    keyFeatures: [
      { title: 'Dual Account Tracking', desc: 'Separate School District SAF accounts from 501(c)(3) Booster Club / External Sponsor funds.' },
      { title: 'Category Budgeting', desc: 'Categorize expenses into Robot Hardware, Tournament Registrations, Pit Supplies, Travel, and Outreach.' },
      { title: 'Reimbursement Filing', desc: 'Members and mentors can log out-of-pocket receipts for coach approval.' },
      { title: 'Financial Valuation Reports', desc: 'Export summary balance sheets and annual cost breakdowns for school board presentations.' }
    ],
    proTips: [
      'Attach digital receipt photos or supplier invoice numbers to every transaction for audit compliance.',
      'Compare inventory total valuation with ledger hardware spend to ensure zero unaccounted loss.'
    ]
  },
  {
    id: 'roster-security',
    title: '10. Member Directory, Roles & Security',
    shortTitle: 'Roster & Security',
    category: 'admin',
    icon: ShieldCheck,
    iconColor: 'text-indigo-500',
    estimatedMinutes: 3,
    summary: 'Manage student accounts, role permissions (Mentor, Captain, Member), leadership tags, and system security.',
    keyFeatures: [
      { title: 'Mentor / Captain Approval Gate', desc: 'New user registrations remain "Pending" until verified by team leadership.' },
      { title: 'Role-Based Access Control', desc: 'Captains and Mentors have administrative rights (bulk operations, roster management, entry approvals, season reset).' },
      { title: 'Leadership Badging', desc: 'Assign leadership titles such as "Build Captain", "Lead Programmer", "Outreach Director", or "Safety Captain".' },
      { title: 'Password Management', desc: 'Users can securely update their passwords in Settings, and Mentors can dispatch reset links if needed.' }
    ],
    proTips: [
      'Keep student school email addresses up to date for official tournament communication.',
      'Assign distinct subteam leads to distribute entry review responsibilities efficiently.'
    ]
  },
  {
    id: 'database-sync',
    title: '11. Data Persistence, Backups & Season Reset',
    shortTitle: 'Backups & Sync',
    category: 'admin',
    icon: Database,
    iconColor: 'text-cyan-500',
    estimatedMinutes: 3,
    summary: 'Cloud Firestore storage, offline caching, JSON database backups, and season transition tools.',
    keyFeatures: [
      { title: 'JSON Database Backup', desc: 'Export a complete snapshot of all team journals, timesheets, inventory items, and Kanban tasks into a portable .json file.' },
      { title: 'Database Restore / Import', desc: 'Restore previous archives or seed starter FTC robotics parts into the inventory in one click.' },
      { title: 'Season Transition Purge', desc: 'Mentors can archive the current season and clear transient task boards when kicking off a new game challenge.' },
      { title: 'Offline-First Architecture', desc: 'Continue reading and creating content even when lab Wi-Fi is temporarily interrupted.' }
    ],
    proTips: [
      'Take a JSON database backup before major competitions and at the conclusion of every season.',
      'Season transitions require typing the confirmation code "RESET_SEASON" to prevent accidental data loss.'
    ]
  },
  {
    id: 'faq-troubleshooting',
    title: '12. FAQ & Troubleshooting Guide',
    shortTitle: 'FAQ & Tips',
    category: 'faq',
    icon: HelpCircle,
    iconColor: 'text-rose-500',
    estimatedMinutes: 4,
    summary: 'Answers to the most common questions, permission issues, and quick troubleshooting tips.',
    faqItems: [
      {
        q: 'How does Question of the Day scoring work?',
        a: 'Multiple-choice questions instantly award the posted XP value when answered correctly. Open-ended technical questions are reviewed by mentors and points are credited upon grading approval.'
      },
      {
        q: 'Why can\'t I approve a journal entry?',
        a: 'To maintain academic integrity, users cannot approve their own entries. You must be an authorized Mentor, Captain, or a team member from that subteam to review.'
      },
      {
        q: 'How do I switch between the Sidebar and Top Bar navigation layouts?',
        a: 'Open the "Settings" page and look for the "Navigation Layout" toggle. Select either "Sidebar" for full left-side docking or "Top Bar" for a clean horizontal header.'
      },
      {
        q: 'How do I quickly adjust part inventory stock without opening the full edit form?',
        a: 'Locate the item in the Lab Inventory and click the "Quick Log" button. Select "+ Restock", "- Consumed", or "🎯 Exact Count" and confirm to log the update in seconds.'
      },
      {
        q: 'Where do I find my total accumulated hours for school credit?',
        a: 'Go to "Time Card" to view your personal hours meter, or open the "Portal Hub" to inspect your profile and unlocked level badges.'
      },
      {
        q: 'Can I print or export my engineering entries to PDF?',
        a: 'Yes! In the Notebook section, click "Export Portfolio PDF" or "Print All Entries" to generate a formatted FIRST-compliant document.'
      }
    ],
    keyFeatures: [
      { title: 'In-App Toast Notifications', desc: 'Real-time feedback alerts inform you whether an action succeeded or if permissions are missing.' },
      { title: 'Keyboard Friendly', desc: 'Full tab-indexing and accessible keyboard navigation across all portal dialogs.' }
    ],
    proTips: [
      'If something appears out of sync, refresh your browser or check the connection indicator in the top header.',
      'For additional assistance, reach out to your team mentor or student programming leads.'
    ]
  }
];

// GLOSSARY OF FIRST FTC TERMS
const FIRST_GLOSSARY = [
  { term: 'Gracious Professionalism®', def: 'A core FIRST ethos that encourages high-quality work, emphasizes the value of others, and respects individuals and the community.' },
  { term: 'Coopertition®', def: 'Showing fierce competition alongside selfless assistance to other teams simultaneously during tournaments.' },
  { term: 'Game Manual 1 & 2', def: 'The official rulebooks released by FIRST governing tournament registration, robot inspection, field setup, and match scoring.' },
  { term: 'LinearOpMode', def: 'A sequential FTC Java programming structure using waitForStart() and while(opModeIsActive()) for clean autonomous and teleop logic.' },
  { term: 'RoadRunner', def: 'An advanced 2D trajectory generation and path-following library for FTC robotics utilizing odometry pods and PID tuning.' },
  { term: 'goBILDA Grid Pattern', def: 'A modular 8mm aluminum channel and motion system featuring an 8mm grid with 16mm pattern hole spacing.' },
  { term: 'REV Control Hub', def: 'An Android-powered robot controller incorporating an integrated 9-axis IMU, motor controllers, servo ports, and Wi-Fi Direct.' },
  { term: 'AprilTags', def: 'Visual fiducial markers on field perimeter walls allowing robots to compute precise 3D field coordinates via camera pose estimation.' }
];

export default function PortalHelpGuide({
  currentUser,
  onBack,
  showToast,
  onNavigate
}: PortalHelpGuideProps) {
  // Reading Mode State
  const [readingMode, setReadingMode] = useState<ReadingMode>('interactive');
  const [fontSize, setFontSize] = useState<FontSize>('standard');
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [showGlossary, setShowGlossary] = useState(false);
  const [bookmarkedSections, setBookmarkedSections] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('roboraiders_help_bookmarks');
      return saved ? JSON.parse(saved) : ['quick-start', 'qotd-trivia'];
    } catch {
      return ['quick-start', 'qotd-trivia'];
    }
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'onboarding' | 'core' | 'engineering' | 'hardware' | 'trivia' | 'admin' | 'faq'>('all');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>('quick-start');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Subteam Tracks
  const [activeTrack, setActiveTrack] = useState<'all' | 'mechanical' | 'software' | 'outreach' | 'trivia' | 'leadership'>('all');

  // Persist bookmarks
  const toggleBookmark = (id: string) => {
    let updated: string[];
    if (bookmarkedSections.includes(id)) {
      updated = bookmarkedSections.filter(b => b !== id);
      showToast('Removed chapter bookmark', 'info');
    } else {
      updated = [...bookmarkedSections, id];
      showToast('Chapter bookmarked!', 'success');
    }
    setBookmarkedSections(updated);
    try {
      localStorage.setItem('roboraiders_help_bookmarks', JSON.stringify(updated));
    } catch {}
  };

  // Filter sections based on Track, Category, and Search
  const filteredSections = useMemo(() => {
    return GUIDE_SECTIONS.filter(sec => {
      // Subteam Track filter
      if (activeTrack === 'mechanical' && !['quick-start', 'engineering-notebook', 'inventory-manager', 'time-tracking'].includes(sec.id)) {
        return false;
      }
      if (activeTrack === 'software' && !['quick-start', 'engineering-notebook', 'qotd-trivia', 'kanban-board', 'faq-troubleshooting'].includes(sec.id)) {
        return false;
      }
      if (activeTrack === 'outreach' && !['quick-start', 'outreach-hub', 'gamification-arena', 'general-ledger'].includes(sec.id)) {
        return false;
      }
      if (activeTrack === 'trivia' && !['quick-start', 'qotd-trivia', 'gamification-arena', 'faq-troubleshooting'].includes(sec.id)) {
        return false;
      }
      if (activeTrack === 'leadership' && !['general-ledger', 'roster-security', 'database-sync', 'qotd-trivia'].includes(sec.id)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && sec.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = sec.title.toLowerCase().includes(q) || sec.shortTitle.toLowerCase().includes(q);
      const matchSummary = sec.summary.toLowerCase().includes(q);
      const matchSteps = sec.steps?.some(s => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q));
      const matchFeatures = sec.keyFeatures.some(f => f.title.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q));
      const matchTips = sec.proTips.some(t => t.toLowerCase().includes(q));
      const matchFAQ = sec.faqItems?.some(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));

      return matchTitle || matchSummary || matchSteps || matchFeatures || matchTips || matchFAQ;
    });
  }, [searchQuery, selectedCategory, activeTrack]);

  const totalReadingTime = useMemo(() => {
    return GUIDE_SECTIONS.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);
  }, []);

  // Text size classes based on font size setting
  const fontClasses = useMemo(() => {
    switch (fontSize) {
      case 'compact':
        return {
          body: 'text-xs leading-relaxed',
          heading: 'text-base font-bold',
          subheading: 'text-xs font-semibold'
        };
      case 'comfortable':
        return {
          body: 'text-base leading-loose',
          heading: 'text-xl font-bold',
          subheading: 'text-sm font-semibold'
        };
      case 'standard':
      default:
        return {
          body: 'text-sm leading-relaxed',
          heading: 'text-lg font-bold',
          subheading: 'text-xs font-semibold'
        };
    }
  }, [fontSize]);

  // Export Help Guide to PDF using jsPDF
  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const addHeaderFooter = (pageNumber: number) => {
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 28, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('ROBORAIDERS FTC #6567 — PORTAL USER & SYSTEM GUIDE', margin, 18);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text('Red Hook High School', pageWidth - margin, 18, { align: 'right' });

        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Confidential Team Reference • Gracious Professionalism®', margin, pageHeight - 14);
        doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 14, { align: 'right' });
      };

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 45) {
          doc.addPage();
          addHeaderFooter(doc.getNumberOfPages());
          y = 50;
        }
      };

      // COVER
      addHeaderFooter(1);
      y = 55;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, y, contentWidth, 90, 6, 6, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text('RoboRaiders Team Portal', margin + 15, y + 28);

      doc.setFontSize(11);
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text('Comprehensive Operational & Feature User Manual', margin + 15, y + 46);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`FIRST Tech Challenge Team #6567 • Generated ${new Date().toLocaleDateString()}`, margin + 15, y + 64);
      doc.text(`Includes 12 Chapters • Question of the Day • Quick Log • Engineering Journals`, margin + 15, y + 78);

      y += 105;

      // Table of Contents
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('TABLE OF CONTENTS', margin + 10, y + 16);
      y += 32;

      GUIDE_SECTIONS.forEach((sec, idx) => {
        checkPageBreak(16);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(225, 29, 72);
        doc.text(`${idx + 1}.`, margin + 10, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(sec.title, margin + 26, y);
        doc.setTextColor(148, 163, 184);
        doc.text(`~${sec.estimatedMinutes} min read`, pageWidth - margin - 10, y, { align: 'right' });
        y += 14;
      });

      y += 20;

      // SECTIONS
      GUIDE_SECTIONS.forEach((section) => {
        checkPageBreak(70);

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(section.title, margin + 10, y + 17);

        y += 36;

        // Summary
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        const sumLines = doc.splitTextToSize(section.summary, contentWidth);
        doc.text(sumLines, margin, y);
        y += sumLines.length * 12 + 6;

        // Steps
        if (section.steps && section.steps.length > 0) {
          checkPageBreak(30);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text('Implementation Steps:', margin, y);
          y += 13;

          section.steps.forEach((step, sIdx) => {
            checkPageBreak(30);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(225, 29, 72);
            doc.text(`${sIdx + 1}. ${step.title}`, margin + 8, y);
            y += 11;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            const stepDescLines = doc.splitTextToSize(step.desc, contentWidth - 18);
            doc.text(stepDescLines, margin + 14, y);
            y += stepDescLines.length * 11 + 4;
          });
          y += 4;
        }

        // Key Features
        if (section.keyFeatures && section.keyFeatures.length > 0) {
          checkPageBreak(30);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text('Key Features & Workflows:', margin, y);
          y += 13;

          section.keyFeatures.forEach((feat) => {
            checkPageBreak(25);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text(`• ${feat.title}:`, margin + 8, y);
            const titleWidth = doc.getTextWidth(`• ${feat.title}: `);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            const featLines = doc.splitTextToSize(feat.desc, contentWidth - 15 - titleWidth);
            doc.text(featLines, margin + 8 + titleWidth, y);
            y += Math.max(1, featLines.length) * 11 + 3;
          });
          y += 4;
        }

        // Pro Tips
        if (section.proTips && section.proTips.length > 0) {
          checkPageBreak(35);
          doc.setFillColor(254, 243, 199);
          doc.setDrawColor(251, 191, 36);

          let tipTextHeight = 16;
          section.proTips.forEach(tip => {
            const lines = doc.splitTextToSize(`💡 Tip: ${tip}`, contentWidth - 20);
            tipTextHeight += lines.length * 11 + 2;
          });

          checkPageBreak(tipTextHeight + 10);
          doc.roundedRect(margin, y, contentWidth, tipTextHeight, 4, 4, 'FD');

          let tipY = y + 12;
          section.proTips.forEach(tip => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(180, 83, 9);
            doc.text('PRO TIP: ', margin + 10, tipY);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(120, 53, 15);
            const lines = doc.splitTextToSize(tip, contentWidth - 65);
            doc.text(lines, margin + 55, tipY);
            tipY += lines.length * 11 + 4;
          });

          y += tipTextHeight + 12;
        }

        y += 10;
      });

      doc.save('RoboRaiders_Portal_Help_Guide.pdf');
      showToast('Help Guide exported to PDF successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to export PDF. Please try again.', 'danger');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const activeFocusSection = GUIDE_SECTIONS[activeChapterIndex] || GUIDE_SECTIONS[0];

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6" id="portal-help-guide-root">
      
      {/* TOP HERO & CONTROLS HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-rose-950 text-white border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                Documentation &amp; User Manual
              </span>
              <span className="text-xs text-slate-400 font-mono">FTC #6567 RoboRaiders</span>
              <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~{totalReadingTime} min total
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-display flex items-center gap-3">
              <span>Portal Operations &amp; Learning Hub</span>
              <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Complete handbook for team members and mentors. Master Question of the Day, Quick Stock Logging, FIRST judge-ready journals, time cards, and tournament scouting.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate ? onNavigate('qotd') : null}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-900/40 cursor-pointer transition-all"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Question of the Day Hub</span>
            </button>

            <button
              onClick={() => setShowGlossary(!showGlossary)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showGlossary
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{showGlossary ? 'Hide Glossary' : 'FIRST Glossary'}</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Download formatted offline PDF booklet"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>{isExportingPDF ? 'Exporting...' : 'PDF'}</span>
            </button>

            <button
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Guide</span>
            </button>
          </div>
        </div>

        {/* READING PREFERENCES TOOLBAR */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          
          {/* Reading Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Reading Mode:</span>
            <div className="flex bg-slate-800/90 rounded-xl p-1 border border-slate-700 gap-1">
              <button
                onClick={() => setReadingMode('interactive')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  readingMode === 'interactive'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Interactive</span>
              </button>

              <button
                onClick={() => setReadingMode('continuous')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  readingMode === 'continuous'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Book Mode</span>
              </button>

              <button
                onClick={() => setReadingMode('focus')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  readingMode === 'focus'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Focus Chapter</span>
              </button>
            </div>
          </div>

          {/* Typography Scale Adjuster */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Text Size:</span>
            <div className="flex bg-slate-800/90 rounded-xl p-1 border border-slate-700 gap-1">
              {(['compact', 'standard', 'comfortable'] as FontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    fontSize === size
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {size === 'compact' ? 'A (Compact)' : size === 'standard' ? 'A+ (Default)' : 'A++ (Large)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GLOSSARY DRAWER (COLLAPSIBLE) */}
      {showGlossary && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 shadow-md dark:bg-amber-950/30 dark:border-amber-700/60 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  FIRST Tech Challenge Terminology &amp; Key Concepts
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Essential definitions, competition terms, and engineering standards for Team #6567.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGlossary(false)}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 dark:text-amber-300 cursor-pointer"
            >
              Close Glossary ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {FIRST_GLOSSARY.map((g, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-2xs dark:bg-slate-900 dark:border-slate-800 space-y-1"
              >
                <span className="text-xs font-black text-rose-600 dark:text-rose-400 block font-display">
                  {g.term}
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {g.def}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEARNING TRACKS QUICK SELECTOR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0 tracking-wider">Subteam Tracks:</span>
        {[
          { id: 'all', label: 'All 12 Chapters', icon: Sparkles },
          { id: 'trivia', label: '🔥 Daily Trivia & XP', icon: Flame },
          { id: 'mechanical', label: '🛠️ Mechanical & Lab', icon: Wrench },
          { id: 'software', label: '💻 Autonomous & Code', icon: Code },
          { id: 'outreach', label: '📢 Outreach & Impact', icon: HeartHandshake },
          { id: 'leadership', label: '🛡️ Mentor & Leadership', icon: ShieldCheck }
        ].map((tr) => (
          <button
            key={tr.id}
            onClick={() => setActiveTrack(tr.id as any)}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTrack === tr.id
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-300'
            }`}
          >
            <span>{tr.label}</span>
          </button>
        ))}
      </div>

      {/* SEARCH AND CATEGORY FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs dark:bg-slate-900 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guide topics, Game Manual rules, Quick Log, XP, or troubleshooting..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
          />
        </div>

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: INTERACTIVE EXPLORER (ACCORDION & CHAPTER JUMPS)                 */}
      {/* ========================================================================= */}
      {readingMode === 'interactive' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Table of Contents Sticky Sidebar (1 col) */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-3 sticky top-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Chapter Directory
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  {filteredSections.length} Items
                </span>
              </div>

              <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
                {filteredSections.map((sec, idx) => {
                  const isExpanded = expandedSectionId === sec.id;
                  const isBookmarked = bookmarkedSections.includes(sec.id);

                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setExpandedSectionId(isExpanded ? null : sec.id);
                        const el = document.getElementById(`section-${sec.id}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 text-xs ${
                        isExpanded
                          ? 'bg-rose-50 border border-rose-200 text-rose-950 font-bold dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-100'
                          : 'hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[11px] text-slate-400 shrink-0">
                          {idx + 1}.
                        </span>
                        <span className="truncate">{sec.shortTitle}</span>
                      </div>

                      {isBookmarked && (
                        <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Sections (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {filteredSections.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center dark:bg-slate-900 dark:border-slate-800">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No guide sections found</h3>
                <p className="text-xs text-slate-500 mt-1">Try searching with a different keyword or resetting subteam track filters.</p>
              </div>
            ) : (
              filteredSections.map((sec) => {
                const isExpanded = expandedSectionId === sec.id;
                const isBookmarked = bookmarkedSections.includes(sec.id);
                const IconComponent = sec.icon;

                return (
                  <div
                    key={sec.id}
                    id={`section-${sec.id}`}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800 transition-all"
                  >
                    {/* Chapter Header */}
                    <div
                      onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                      className="p-5 md:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 dark:bg-slate-800 ${sec.iconColor}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white font-display truncate">
                              {sec.title}
                            </h2>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {sec.summary}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(sec.id);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                          title="Bookmark chapter"
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'text-amber-500 fill-amber-500' : ''}`} />
                        </button>

                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Chapter Expanded Body */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-6">
                        
                        {/* Callout Box if exists */}
                        {sec.callout && (
                          <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
                            sec.callout.type === 'rule'
                              ? 'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200'
                              : sec.callout.type === 'safety'
                              ? 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-200'
                              : sec.callout.type === 'mentor'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-950 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-200'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-200'
                          }`}>
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                            <div className="space-y-0.5">
                              <span className="font-bold block text-sm">{sec.callout.title}</span>
                              <p>{sec.callout.text}</p>
                            </div>
                          </div>
                        )}

                        {/* Implementation Steps */}
                        {sec.steps && sec.steps.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-rose-500" />
                              <span>Implementation Steps &amp; Workflows</span>
                            </h4>

                            <div className="grid grid-cols-1 gap-2.5">
                              {sec.steps.map((step, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-850 dark:border-slate-800 space-y-1"
                                >
                                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                                    {step.title}
                                  </div>
                                  <p className={`${fontClasses.body} text-slate-600 dark:text-slate-300`}>
                                    {step.desc}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Features */}
                        {sec.keyFeatures && sec.keyFeatures.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                              <Zap className="w-4 h-4 text-amber-500" />
                              <span>Key System Capabilities</span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {sec.keyFeatures.map((feat, fIdx) => (
                                <div
                                  key={fIdx}
                                  className="p-3.5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-1"
                                >
                                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                    {feat.title}
                                  </span>
                                  <p className={`${fontClasses.body} text-slate-600 dark:text-slate-400 text-xs`}>
                                    {feat.desc}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pro Tips Box */}
                        {sec.proTips && sec.proTips.length > 0 && (
                          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs dark:bg-amber-950/30 dark:border-amber-900/50 space-y-2">
                            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                              <Lightbulb className="w-4 h-4 text-amber-600" />
                              <span>Raiders Best Practices &amp; Pro Tips</span>
                            </div>
                            <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                              {sec.proTips.map((tip, tIdx) => (
                                <li key={tIdx} className={fontClasses.body}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* FAQs if present */}
                        {sec.faqItems && sec.faqItems.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                              <HelpCircle className="w-4 h-4" />
                              <span>Frequently Asked Questions</span>
                            </h4>

                            <div className="space-y-2">
                              {sec.faqItems.map((faq, qIdx) => (
                                <div key={qIdx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-850 dark:border-slate-800 space-y-1">
                                  <span className="font-bold text-slate-900 dark:text-white text-xs block">
                                    Q: {faq.q}
                                  </span>
                                  <p className={`${fontClasses.body} text-slate-600 dark:text-slate-300 text-xs`}>
                                    {faq.a}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CONTINUOUS BOOK MODE (FULL READING FLOW)                          */}
      {/* ========================================================================= */}
      {readingMode === 'continuous' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-12 max-w-4xl mx-auto">
          
          <div className="text-center space-y-2 pb-8 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-600 font-bold">
              FTC Team #6567 RoboRaiders
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-display">
              Team Operations &amp; Engineering Handbook
            </h2>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Continuous complete reading format. All 12 chapters formatted for comprehensive member onboarding.
            </p>
          </div>

          {filteredSections.map((sec, idx) => {
            const IconComp = sec.icon;
            return (
              <div key={sec.id} className="space-y-6 pb-10 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                      {sec.title}
                    </h3>
                    <p className="text-xs text-slate-500">{sec.summary}</p>
                  </div>
                </div>

                {sec.steps && (
                  <div className="space-y-3 pl-4 border-l-2 border-rose-200 dark:border-rose-900">
                    {sec.steps.map((st, sIdx) => (
                      <div key={sIdx} className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white text-xs block">{st.title}</span>
                        <p className={`${fontClasses.body} text-slate-600 dark:text-slate-300`}>{st.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {sec.keyFeatures && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {sec.keyFeatures.map((kf, kIdx) => (
                      <div key={kIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-850 dark:border-slate-800 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white text-xs block">{kf.title}</span>
                        <p className={`${fontClasses.body} text-slate-500 dark:text-slate-400 text-xs`}>{kf.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: FOCUS CHAPTER MODE (DISTRACTION-FREE CHAPTER AT A TIME)           */}
      {/* ========================================================================= */}
      {readingMode === 'focus' && (
        <div className="max-w-3xl mx-auto w-full space-y-6">
          
          {/* Chapter Progress & Navigation Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between gap-4">
            <button
              onClick={() => setActiveChapterIndex(Math.max(0, activeChapterIndex - 1))}
              disabled={activeChapterIndex === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 disabled:opacity-30 cursor-pointer dark:border-slate-700 dark:text-slate-300"
            >
              ← Previous Chapter
            </button>

            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
              Chapter {activeChapterIndex + 1} of {GUIDE_SECTIONS.length}
            </span>

            <button
              onClick={() => setActiveChapterIndex(Math.min(GUIDE_SECTIONS.length - 1, activeChapterIndex + 1))}
              disabled={activeChapterIndex === GUIDE_SECTIONS.length - 1}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-30 cursor-pointer shadow-xs"
            >
              Next Chapter →
            </button>
          </div>

          {/* Active Focus Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-rose-600 tracking-wider">
                {activeFocusSection.category}
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display">
                {activeFocusSection.title}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                {activeFocusSection.summary}
              </p>
            </div>

            {activeFocusSection.steps && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Step-by-Step Instructions:
                </h4>
                <div className="space-y-2.5">
                  {activeFocusSection.steps.map((st, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-850 dark:border-slate-800 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">{st.title}</span>
                      <p className={`${fontClasses.body} text-slate-600 dark:text-slate-300`}>{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFocusSection.keyFeatures && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Core Highlights:
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {activeFocusSection.keyFeatures.map((feat, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-850 dark:border-slate-750 space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">{feat.title}</span>
                      <p className={`${fontClasses.body} text-slate-500 dark:text-slate-400 text-xs`}>{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
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
  Plus
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { UserAccount } from '../types';

interface PortalHelpGuideProps {
  currentUser: UserAccount | null;
  onBack: () => void;
  showToast: (msg: string, type?: 'success' | 'danger' | 'info') => void;
  onNavigate?: (view: string) => void;
}

interface GuideSection {
  id: string;
  title: string;
  shortTitle: string;
  category: 'onboarding' | 'core' | 'engineering' | 'hardware' | 'admin' | 'faq';
  icon: any;
  iconColor: string;
  summary: string;
  steps?: { title: string; desc: string }[];
  keyFeatures: { title: string; desc: string }[];
  proTips: string[];
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
    summary: 'Essential 5-step checklist for every student and mentor joining FTC Team #6567 RoboRaiders.',
    steps: [
      {
        title: 'Step 1: Sign Up & Claim Your Profile',
        desc: 'Register using your school email address. Mentors and Captains review and approve all new accounts to ensure secure access.'
      },
      {
        title: 'Step 2: Punch Your Time Card',
        desc: 'When entering the robotics lab, tap "Time Card" and start the live stopwatch or log your meeting hours. Lab hours award +10 XP per hour.'
      },
      {
        title: 'Step 3: Pick Up Kanban Tasks',
        desc: 'Navigate to the Kanban Board to review sprint goals, assign yourself open tickets, and drag them to "In Progress".'
      },
      {
        title: 'Step 4: Draft Engineering Notebook Logs',
        desc: 'Document mechanical builds, autonomous code, or CAD revisions with objectives, challenges, and implementation notes.'
      },
      {
        title: 'Step 5: Check Out Tools & Quick Log Parts',
        desc: 'Use the Lab Inventory to borrow tools, locate goBILDA/REV bins, and click "Quick Log" to instantly adjust stock levels.'
      }
    ],
    keyFeatures: [
      { title: 'Cross-Device Cloud Sync', desc: 'Real-time synchronization across lab computers, tablets, and smartphones with offline resilience.' },
      { title: 'Subteam Focuses', desc: 'Select your primary and secondary subteams (Design/Build/Fabrication, Programming, Outreach, Business & Media, Inspire, Strategy).' },
      { title: 'Theme Personalization', desc: 'Toggle high-contrast Light Theme or dark luxury Theme anytime using the topbar switch.' }
    ],
    proTips: [
      'Pin the RoboRaiders Portal to your home screen or browser bookmarks for quick access during build sessions.',
      'Always log out when using shared workshop laptops to keep your session and XP achievements secure.'
    ]
  },
  {
    id: 'gamification-arena',
    title: '2. Portal Hub & Arena Gamification (XP & Ranks)',
    shortTitle: 'XP & Arena',
    category: 'core',
    icon: Trophy,
    iconColor: 'text-amber-500',
    summary: 'Earn Experience Points (XP), level up, unlock prestigious specialist badges, and climb Guild Career Trees.',
    keyFeatures: [
      { title: 'Dynamic XP Economy', desc: '+10 XP per logged lab hour, +25 XP per approved engineering journal entry, +15 XP per completed Kanban sprint task, and +30 XP per outreach event.' },
      { title: 'Level Milestones', desc: 'Progress from Level 1 Rookie Raider up to Level 50 Grandmaster Legendary Engineer with optical progress rings.' },
      { title: 'Guild Career Trees', desc: 'Advance through specialized ranks across 5 divisions: Machinist/Fabricator, Systems Architect, Ambassador, Executive Director, and Master Mentor.' },
      { title: 'Arena Live Match Scouting', desc: 'Calculate match alliance scores, autonomous samples, teleop baskets, submersible ascents, and penalty adjustments.' }
    ],
    proTips: [
      'Writing high-quality journal entries with detailed engineering challenges gives the highest XP multipliers.',
      'Mentors can audit XP point transactions in the real-time XP Ledger accessible from the Portal Hub.'
    ],
    faqItems: [
      { q: 'How do I unlock badges?', a: 'Badges unlock automatically when you achieve milestones (e.g., logging 50+ lab hours, writing 10 journals, or leading outreach campaigns).' },
      { q: 'Can my XP be adjusted manually?', a: 'Yes, Mentors and Captains can grant bonus XP for tournament excellence or Gracious Professionalism awards.' }
    ]
  },
  {
    id: 'engineering-notebook',
    title: '3. Engineering Notebook & Technical Journals',
    shortTitle: 'Notebook & Logs',
    category: 'engineering',
    icon: BookOpen,
    iconColor: 'text-cyan-500',
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
    ]
  },
  {
    id: 'time-tracking',
    title: '4. Time Card & Workshop Attendance',
    shortTitle: 'Time Card',
    category: 'core',
    icon: Clock,
    iconColor: 'text-emerald-500',
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
    title: '5. Collaborative Kanban Sprint Board',
    shortTitle: 'Kanban Board',
    category: 'engineering',
    icon: Layers,
    iconColor: 'text-indigo-500',
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
    title: '6. Outreach Logs & Community Impact',
    shortTitle: 'Outreach Hub',
    category: 'core',
    icon: Users,
    iconColor: 'text-purple-500',
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
    title: '7. Lab Inventory & Hardware Asset Tracker',
    shortTitle: 'Lab Inventory & Quick Log',
    category: 'hardware',
    icon: Boxes,
    iconColor: 'text-rose-500',
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
    ]
  },
  {
    id: 'general-ledger',
    title: '8. General Ledger & Team Finances',
    shortTitle: 'General Ledger',
    category: 'admin',
    icon: DollarSign,
    iconColor: 'text-emerald-500',
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
    title: '9. Member Directory, Roles & Security',
    shortTitle: 'Roster & Security',
    category: 'admin',
    icon: ShieldCheck,
    iconColor: 'text-indigo-500',
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
    title: '10. Data Persistence, Backups & Season Reset',
    shortTitle: 'Backups & Sync',
    category: 'admin',
    icon: Database,
    iconColor: 'text-cyan-500',
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
    title: '11. FAQ & Troubleshooting Guide',
    shortTitle: 'FAQ & Tips',
    category: 'faq',
    icon: HelpCircle,
    iconColor: 'text-rose-500',
    summary: 'Answers to the most common questions, permission issues, and quick troubleshooting tips.',
    faqItems: [
      {
        q: 'Why can\'t I approve a journal entry?',
        a: 'To maintain academic integrity, users cannot approve their own entries. You must be an authorized Mentor, Captain, or a team member from that subteam to review.'
      },
      {
        q: 'How do I quickly adjust part inventory stock without opening the full edit form?',
        a: 'Locate the item in the Lab Inventory and click the "Quick Log" button (or the +/- buttons). Select "+ Restock", "- Consumed", or "🎯 Exact Count" and confirm to log the update in seconds.'
      },
      {
        q: 'Where do I find my total accumulated hours for school credit?',
        a: 'Go to "Time Card" to view your personal hours meter, or open the "Portal Hub" to inspect your profile and unlocked level badges.'
      },
      {
        q: 'Can I print or export my engineering entries to PDF?',
        a: 'Yes! In the Notebook section, click "Export Portfolio PDF" or "Print All Entries" to generate a formatted FIRST-compliant document.'
      },
      {
        q: 'What should I do if a module shows "Disabled"?',
        a: 'Mentors or Programming leads can enable/disable modules in the System Dashboard during maintenance or testing.'
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

export default function PortalHelpGuide({
  currentUser,
  onBack,
  showToast,
  onNavigate
}: PortalHelpGuideProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'onboarding' | 'core' | 'engineering' | 'hardware' | 'admin' | 'faq'>('all');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>('quick-start');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Filter sections based on search query and category
  const filteredSections = useMemo(() => {
    return GUIDE_SECTIONS.filter(sec => {
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
  }, [searchQuery, selectedCategory]);

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

      // Helper for page headers & footers
      const addHeaderFooter = (pageNumber: number, totalPages?: number) => {
        // Top banner
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 28, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('ROBORAIDERS FTC #6567 — PORTAL USER & SYSTEM GUIDE', margin, 18);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text('Red Hook High School', pageWidth - margin, 18, { align: 'right' });

        // Bottom footer
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Confidential Team Reference • Gracious Professionalism®', margin, pageHeight - 14);
        doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 14, { align: 'right' });
      };

      // Helper to check page break
      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 45) {
          doc.addPage();
          addHeaderFooter(doc.getNumberOfPages());
          y = 50;
        }
      };

      // ==========================================
      // COVER / TITLE SECTION
      // ==========================================
      addHeaderFooter(1);
      y = 55;

      // Main Header Box
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
      doc.setTextColor(71, 85, 105);
      doc.text(`Official Guide for FTC Team #6567 • Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, margin + 15, y + 64);
      doc.text(`Compiled for: ${currentUser?.name || 'Team Member'} (${currentUser?.schoolEmail || 'member@school.edu'})`, margin + 15, y + 78);

      y += 110;

      // Table of Contents Box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('TABLE OF CONTENTS', margin, y);
      y += 14;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);

      GUIDE_SECTIONS.forEach((sec, idx) => {
        const col = idx < 6 ? 0 : 1;
        const row = idx < 6 ? idx : idx - 6;
        const xPos = margin + col * (contentWidth / 2);
        const yPos = y + row * 13;
        doc.text(`${sec.title}`, xPos, yPos);
      });

      y += 6 * 13 + 15;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;

      // ==========================================
      // SECTIONS RENDER LOOP
      // ==========================================
      GUIDE_SECTIONS.forEach((section) => {
        checkPageBreak(80);

        // Section Title
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, contentWidth, 22, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(section.title.toUpperCase(), margin + 8, y + 15);
        y += 30;

        // Summary
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const summaryLines = doc.splitTextToSize(section.summary, contentWidth);
        doc.text(summaryLines, margin, y);
        y += summaryLines.length * 12 + 8;

        // Steps (if any)
        if (section.steps && section.steps.length > 0) {
          checkPageBreak(50);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(225, 29, 72);
          doc.text('Key Steps & Workflows:', margin, y);
          y += 13;

          section.steps.forEach((step, sIdx) => {
            checkPageBreak(30);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text(`• ${step.title}:`, margin + 8, y);
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 65, 85);
            const descLines = doc.splitTextToSize(step.desc, contentWidth - 25);
            doc.text(descLines, margin + 18, y + 10);
            y += 10 + descLines.length * 11 + 4;
          });
          y += 4;
        }

        // Key Features
        if (section.keyFeatures && section.keyFeatures.length > 0) {
          checkPageBreak(40);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(2, 132, 199); // sky-600
          doc.text('System Capabilities & Tools:', margin, y);
          y += 13;

          section.keyFeatures.forEach((feat) => {
            checkPageBreak(25);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(30, 41, 59);
            const titleText = `– ${feat.title}: `;
            const titleWidth = doc.getTextWidth(titleText);
            doc.text(titleText, margin + 8, y);

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
          doc.setFillColor(254, 243, 199); // amber-100
          doc.setDrawColor(251, 191, 36); // amber-400
          
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
            doc.setTextColor(180, 83, 9); // amber-700
            doc.text('PRO TIP: ', margin + 10, tipY);
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(120, 53, 15);
            const lines = doc.splitTextToSize(tip, contentWidth - 65);
            doc.text(lines, margin + 55, tipY);
            tipY += lines.length * 11 + 4;
          });

          y += tipTextHeight + 12;
        }

        // FAQ Items (if any)
        if (section.faqItems && section.faqItems.length > 0) {
          checkPageBreak(40);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(147, 51, 234); // purple-600
          doc.text('Frequently Asked Questions:', margin, y);
          y += 13;

          section.faqItems.forEach(faq => {
            checkPageBreak(35);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text(`Q: ${faq.q}`, margin + 8, y);
            y += 11;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            const ansLines = doc.splitTextToSize(`A: ${faq.a}`, contentWidth - 18);
            doc.text(ansLines, margin + 14, y);
            y += ansLines.length * 11 + 6;
          });
          y += 4;
        }

        y += 10;
      });

      // Save document
      doc.save('RoboRaiders_Portal_Help_Guide.pdf');
      showToast('Help Guide exported to PDF successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to export PDF. Please try again.', 'danger');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6" id="portal-help-guide-root">
      
      {/* HEADER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center dark:bg-rose-950/40 dark:text-rose-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded-md">
                Documentation &amp; User Manual
              </span>
              <span className="text-xs text-slate-400">• FTC #6567</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1 font-display">
              RoboRaiders Portal Help Guide
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Complete operational manual, feature workflows, Quick Log guides, scoring meters, and team best practices.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-750"
            title="Print Help Manual"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Guide</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
            title="Export full user manual to PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPDF ? 'Compiling PDF...' : 'Export to PDF'}</span>
          </button>

          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal Hub</span>
          </button>
        </div>
      </div>

      {/* QUICK STATS / ONBOARDING BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400 block">
              Quick Start
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">5-Step Checklist</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Rookie &amp; veteran guide</p>
          </div>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-rose-700 dark:text-rose-400 block">
              Quick Log Feature
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Instant Stock Adjust</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">No edit form required</p>
          </div>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-cyan-700 dark:text-cyan-400 block">
              Gamification System
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">XP, Levels &amp; Guilds</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Unlock specialist trophies</p>
          </div>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-indigo-700 dark:text-indigo-400 block">
              Governance &amp; Review
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Mentor Approval Gate</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Peer review verification</p>
          </div>
        </div>
      </div>

      {/* SEARCH AND CATEGORY FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs dark:bg-slate-900 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics (e.g. 'quick log', 'xp', 'approval', 'check out', 'kanban', 'ledger')..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick jump to all / expand all */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <button
              onClick={() => setExpandedSectionId('all_open')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer dark:bg-slate-800 dark:text-slate-300"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpandedSectionId(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer dark:bg-slate-800 dark:text-slate-300"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'onboarding', label: 'Quick Start' },
            { id: 'core', label: 'Core Features & XP' },
            { id: 'engineering', label: 'Notebook & Sprints' },
            { id: 'hardware', label: 'Inventory & Quick Log' },
            { id: 'admin', label: 'Ledger & Security' },
            { id: 'faq', label: 'FAQ' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* DOCUMENTATION SECTIONS LIST */}
      <div className="space-y-4">
        {filteredSections.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-2xs dark:bg-slate-900 dark:border-slate-800 space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No matching help topics found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto dark:text-slate-400">
              Try searching with different keywords such as "quick log", "xp", "journal", or "inventory".
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          filteredSections.map((section) => {
            const isExpanded = expandedSectionId === 'all_open' || expandedSectionId === section.id;
            const SectionIcon = section.icon;

            return (
              <div
                key={section.id}
                id={`guide-section-${section.id}`}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
              >
                {/* Header / Clickable Toggle */}
                <button
                  type="button"
                  onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 ${section.iconColor} shrink-0`}>
                      <SectionIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate">
                        {section.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {section.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 uppercase">
                      {section.category}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-rose-600' : ''}`} />
                  </div>
                </button>

                {/* Expanded Content Body */}
                {isExpanded && (
                  <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-6 text-xs leading-relaxed animate-in fade-in duration-150">
                    
                    {/* Summary Callout */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-200 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p>{section.summary}</p>
                    </div>

                    {/* Step-by-Step Workflow (if present) */}
                    {section.steps && section.steps.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <Workflow className="w-3.5 h-3.5" />
                          <span>Standard Step-by-Step Workflow</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {section.steps.map((step, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs dark:bg-slate-900/80 dark:border-slate-800 space-y-1">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-mono text-[10px] font-black flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span>{step.title}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-[11px] pl-7">
                                {step.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Features / Capabilities */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Key System Tools &amp; Features</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {section.keyFeatures.map((feat, fIdx) => (
                          <div key={fIdx} className="p-3 rounded-lg bg-slate-50/70 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-800">
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {feat.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {feat.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Tips Box */}
                    {section.proTips && section.proTips.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/40 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-xs">
                          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Pro Tips for RoboRaiders</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 dark:text-amber-200/90 pl-1">
                          {section.proTips.map((tip, tIdx) => (
                            <li key={tIdx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* FAQ Items */}
                    {section.faqItems && section.faqItems.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Frequently Asked Questions</span>
                        </h4>
                        <div className="space-y-2">
                          {section.faqItems.map((faq, qIdx) => (
                            <div key={qIdx} className="p-3 rounded-lg bg-purple-50/50 border border-purple-200/60 dark:bg-purple-950/20 dark:border-purple-900/40 space-y-1">
                              <div className="font-bold text-purple-950 dark:text-purple-300">
                                Q: {faq.q}
                              </div>
                              <div className="text-[11px] text-slate-600 dark:text-slate-300 pl-2 border-l-2 border-purple-300 dark:border-purple-700">
                                {faq.a}
                              </div>
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

      {/* FOOTER CALLOUT */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 dark:bg-slate-950 border border-slate-800">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-sm font-bold uppercase tracking-wider font-display text-slate-100">
            Need Additional Support or Feature Requests?
          </h4>
          <p className="text-xs text-slate-400 font-sans">
            Coordinate with Coach/Mentor Steve or the Lead Student Programmers during lab hours.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Manual</span>
          </button>
        </div>
      </div>

    </div>
  );
}

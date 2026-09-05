import React, { useState, useMemo } from 'react';
import { 
  Award, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Search, 
  Filter, 
  ChevronLeft, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  FileText, 
  Download, 
  CheckSquare, 
  Square, 
  X, 
  Building2, 
  User, 
  Send, 
  ArrowRight, 
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  LayoutGrid,
  Table as TableIcon,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { GrantApplication, GrantRequirement, GrantStatus, GrantCategory, UserAccount, Subteam } from '../types';
import { GrantPrintLayout } from './GrantPrintLayout';

interface GrantTrackerProps {
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  grants: GrantApplication[];
  onSaveGrant: (grant: GrantApplication) => Promise<boolean>;
  onDeleteGrant: (id: string) => Promise<boolean>;
  onSyncToLedger?: (grant: GrantApplication) => Promise<boolean>;
  onBack: () => void;
  showToast: (text: string, type: 'success' | 'danger' | 'info') => void;
}

const STATUS_CONFIG: Record<GrantStatus, { label: string; bg: string; text: string; border: string; icon: any }> = {
  'Researching': {
    label: 'Researching',
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    text: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    icon: Search
  },
  'Drafting': {
    label: 'Drafting Proposal',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-300 dark:border-indigo-800',
    icon: Edit3
  },
  'Submitted': {
    label: 'Submitted',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-800',
    icon: Send
  },
  'Under Review': {
    label: 'Under Review',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-800',
    icon: Clock
  },
  'Awarded': {
    label: 'Awarded & Funded',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    icon: CheckCircle2
  },
  'Partially Awarded': {
    label: 'Partially Awarded',
    bg: 'bg-teal-500/10 dark:bg-teal-500/20',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-300 dark:border-teal-800',
    icon: Award
  },
  'Not Awarded': {
    label: 'Not Awarded',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-300 dark:border-rose-800',
    icon: X
  },
  'Closed': {
    label: 'Grant Closed',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-300 dark:border-purple-800',
    icon: ShieldCheck
  }
};

const CATEGORY_COLORS: Record<GrantCategory, string> = {
  'Direct Funds': '#10b981',
  'Parts & Hardware Voucher': '#3b82f6',
  'Tools & Machinery': '#f59e0b',
  'Travel / Registration Subsidy': '#ec4899',
  'Software License': '#8b5cf6',
  'General Sponsorship': '#06b6d4'
};

const SEASONS = ['2026-2027', '2025-2026', '2024-2025'];
const SUBTEAMS: Subteam[] = [
  'Design/Build/Fabrication',
  'Programming',
  'Outreach',
  'Business & Media',
  'Inspire',
  'Strategy'
];

export default function GrantTracker({
  currentUser,
  accounts,
  grants,
  onSaveGrant,
  onDeleteGrant,
  onSyncToLedger,
  onBack,
  showToast
}: GrantTrackerProps) {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'grid' | 'table' | 'analytics'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [seasonFilter, setSeasonFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'amount' | 'updated' | 'name'>('deadline');

  // Modal States
  const [selectedGrant, setSelectedGrant] = useState<GrantApplication | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGrant, setEditingGrant] = useState<Partial<GrantApplication> | null>(null);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Print & PDF Export States
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printScope, setPrintScope] = useState<'all' | 'filtered' | 'awarded' | 'pending'>('filtered');
  const [printPaperSize, setPrintPaperSize] = useState<'letter' | 'a4'>('letter');
  const [printShowKPIs, setPrintShowKPIs] = useState(true);
  const [printShowBreakdown, setPrintShowBreakdown] = useState(true);
  const [printShowRequirements, setPrintShowRequirements] = useState(true);
  const [printShowNotes, setPrintShowNotes] = useState(true);
  const [printShowSignoff, setPrintShowSignoff] = useState(true);

  const isUserAdminOrMentor = currentUser?.role === 'mentor' || currentUser?.role === 'captain' || currentUser?.schoolEmail === 'ftc6567@gmail.com' || currentUser?.schoolEmail === 'admin@school.edu';

  // --- METRICS COMPUTATION ---
  const metrics = useMemo(() => {
    let totalRequested = 0;
    let totalAwarded = 0;
    let pendingCount = 0;
    let pendingAmount = 0;
    let awardedCount = 0;
    let decidedCount = 0;
    let upcomingDeadlinesCount = 0;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    grants.forEach(g => {
      totalRequested += g.amountRequested || 0;
      if (g.status === 'Awarded' || g.status === 'Partially Awarded') {
        totalAwarded += g.amountAwarded ?? g.amountRequested ?? 0;
        awardedCount++;
        decidedCount++;
      } else if (g.status === 'Not Awarded') {
        decidedCount++;
      } else if (g.status === 'Drafting' || g.status === 'Submitted' || g.status === 'Under Review' || g.status === 'Researching') {
        pendingCount++;
        pendingAmount += g.amountRequested || 0;
      }

      if (g.deadlineDate && g.status !== 'Awarded' && g.status !== 'Closed' && g.status !== 'Not Awarded') {
        const d = new Date(g.deadlineDate + 'T00:00:00');
        if (d >= now && d <= thirtyDaysFromNow) {
          upcomingDeadlinesCount++;
        }
      }
    });

    const winRate = decidedCount > 0 ? Math.round((awardedCount / decidedCount) * 100) : 0;

    return {
      totalRequested,
      totalAwarded,
      pendingCount,
      pendingAmount,
      awardedCount,
      winRate,
      upcomingDeadlinesCount
    };
  }, [grants]);

  // --- FILTERED & SORTED GRANTS ---
  const filteredGrants = useMemo(() => {
    return grants.filter(grant => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = grant.name.toLowerCase().includes(q);
        const matchesOrg = grant.organization.toLowerCase().includes(q);
        const matchesLead = (grant.leadMemberName || '').toLowerCase().includes(q);
        const matchesNotes = (grant.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesOrg && !matchesLead && !matchesNotes) return false;
      }

      if (statusFilter === 'Active') {
        if (grant.status === 'Awarded' || grant.status === 'Closed' || grant.status === 'Not Awarded') return false;
      } else if (statusFilter !== 'All' && grant.status !== statusFilter) {
        return false;
      }

      if (seasonFilter !== 'All' && grant.season !== seasonFilter) {
        return false;
      }

      if (categoryFilter !== 'All' && grant.category !== categoryFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        if (!a.deadlineDate) return 1;
        if (!b.deadlineDate) return -1;
        return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
      }
      if (sortBy === 'amount') {
        return (b.amountAwarded || b.amountRequested) - (a.amountAwarded || a.amountRequested);
      }
      if (sortBy === 'updated') {
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [grants, searchQuery, statusFilter, seasonFilter, categoryFilter, sortBy]);

  // Grants to include in print / PDF report
  const grantsToPrint = useMemo(() => {
    if (printScope === 'all') return grants;
    if (printScope === 'awarded') {
      return grants.filter(g => g.status === 'Awarded' || g.status === 'Partially Awarded');
    }
    if (printScope === 'pending') {
      return grants.filter(g => g.status === 'Researching' || g.status === 'Drafting' || g.status === 'Submitted' || g.status === 'Under Review');
    }
    return filteredGrants;
  }, [grants, filteredGrants, printScope]);

  const getPrintScopeTitle = () => {
    if (printScope === 'all') return 'All Registered Funding Proposals';
    if (printScope === 'awarded') return 'Awarded & Secured Grants';
    if (printScope === 'pending') return 'Active Applications Pipeline';
    return `Filtered Proposals (${seasonFilter !== 'All' ? seasonFilter : 'All Seasons'})`;
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  const handleDownloadReportHTML = () => {
    if (grantsToPrint.length === 0) {
      showToast('No grants selected to export.', 'info');
      return;
    }

    const totalReq = grantsToPrint.reduce((s, g) => s + (Number(g.amountRequested) || 0), 0);
    const totalAwd = grantsToPrint.reduce((s, g) => s + ((g.status === 'Awarded' || g.status === 'Partially Awarded') ? (Number(g.amountAwarded) || Number(g.amountRequested) || 0) : 0), 0);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FTC #6567 RoboRaiders - Grant Funding Summary Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #0f172a; line-height: 1.5; font-size: 13px; }
    .header { border-bottom: 3px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
    h1 { margin: 0 0 6px 0; font-size: 24px; text-transform: uppercase; }
    .subtitle { color: #64748b; font-size: 12px; }
    .meta { text-align: right; font-family: monospace; font-size: 11px; color: #475569; }
    .kpi-row { display: flex; gap: 16px; margin-bottom: 24px; }
    .kpi-card { flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; font-family: monospace; }
    .kpi-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; }
    .kpi-val { font-size: 20px; font-weight: 900; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; font-family: monospace; }
    th { background: #f1f5f9; text-align: left; padding: 8px; border-bottom: 2px solid #cbd5e1; font-weight: bold; text-transform: uppercase; font-size: 10px; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .status-badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; border: 1px solid #cbd5e1; }
    .signoff { margin-top: 40px; display: flex; justify-content: space-between; border-top: 2px solid #cbd5e1; padding-top: 16px; font-family: monospace; font-size: 11px; }
    .sign-line { width: 28%; border-top: 1px solid #475569; padding-top: 6px; }
    @media print {
      body { margin: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div style="font-weight: 900; font-family: monospace; font-size: 11px; color: #d97706; text-transform: uppercase; letter-spacing: 1px;">FTC Team #6567 • RoboRaiders</div>
      <h1>Grant & Sponsorship Funding Report</h1>
      <div class="subtitle">Scope: ${getPrintScopeTitle()} • Generated: ${new Date().toLocaleDateString()}</div>
    </div>
    <div class="meta">
      <div>AUTHOR: ${currentUser?.name || 'RoboRaiders Team Lead'}</div>
      <div>CONFIDENTIAL • TEAM ARCHIVE</div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-label">Total Awarded</div>
      <div class="kpi-val" style="color: #059669;">$${totalAwd.toLocaleString()}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Requested</div>
      <div class="kpi-val" style="color: #0f172a;">$${totalReq.toLocaleString()}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Proposals Logged</div>
      <div class="kpi-val" style="color: #d97706;">${grantsToPrint.length}</div>
    </div>
  </div>

  <h3 style="text-transform: uppercase; font-size: 12px; margin-bottom: 4px;">Itemized Grant Applications</h3>
  <table>
    <thead>
      <tr>
        <th>Proposal Name</th>
        <th>Organization</th>
        <th>Category</th>
        <th>Status</th>
        <th style="text-align: right;">Requested</th>
        <th style="text-align: right;">Awarded</th>
        <th>Deadline</th>
        <th>Lead Contact</th>
      </tr>
    </thead>
    <tbody>
      ${grantsToPrint.map(g => `
        <tr>
          <td><strong>${g.name}</strong></td>
          <td>${g.organization}</td>
          <td>${g.category}</td>
          <td><span class="status-badge">${g.status}</span></td>
          <td style="text-align: right;">$${(Number(g.amountRequested) || 0).toLocaleString()}</td>
          <td style="text-align: right; color: ${g.status === 'Awarded' || g.status === 'Partially Awarded' ? '#059669' : '#64748b'}; font-weight: bold;">
            ${(g.status === 'Awarded' || g.status === 'Partially Awarded') ? '$' + ((g.amountAwarded !== undefined ? Number(g.amountAwarded) : Number(g.amountRequested) || 0)).toLocaleString() : '-'}
          </td>
          <td>${g.deadlineDate || '-'}</td>
          <td>${g.leadMemberName || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr style="font-weight: bold; background: #f8fafc;">
        <td colspan="4">TOTALS (${grantsToPrint.length} Proposals)</td>
        <td style="text-align: right;">$${totalReq.toLocaleString()}</td>
        <td style="text-align: right; color: #059669;">$${totalAwd.toLocaleString()}</td>
        <td colspan="2"></td>
      </tr>
    </tfoot>
  </table>

  <div class="signoff">
    <div class="sign-line">Lead Mentor Signature<br><small style="color: #64748b;">Date: ________________</small></div>
    <div class="sign-line">Team Captain / Treasurer<br><small style="color: #64748b;">Date: ________________</small></div>
    <div class="sign-line">School / Booster Club Verification<br><small style="color: #64748b;">Date: ________________</small></div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RoboRaiders_Grant_Funding_Report_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Grant report downloaded as HTML document.', 'success');
  };

  // --- MODAL HANDLERS ---
  const handleOpenCreateModal = () => {
    setEditingGrant({
      name: '',
      organization: '',
      season: '2026-2027',
      status: 'Researching',
      category: 'Direct Funds',
      amountRequested: 0,
      deadlineDate: '',
      leadMemberName: currentUser?.name || '',
      leadMemberEmail: currentUser?.schoolEmail || '',
      subteamFocus: currentUser?.primarySubteam || 'Team-wide',
      applicationUrl: '',
      portalLoginNotes: '',
      description: '',
      requirements: [],
      notes: '',
      postAwardReportRequired: false
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (grant: GrantApplication) => {
    setEditingGrant({ ...grant });
    setIsEditModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrant?.name?.trim() || !editingGrant?.organization?.trim()) {
      showToast('Grant name and organization are required.', 'danger');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = Date.now();
      const grantId = editingGrant.id || 'grant_' + now + '_' + Math.random().toString(36).substring(2, 7);
      
      const fullGrant: GrantApplication = {
        id: grantId,
        name: editingGrant.name.trim(),
        organization: editingGrant.organization.trim(),
        season: editingGrant.season || '2026-2027',
        status: editingGrant.status || 'Researching',
        category: editingGrant.category || 'Direct Funds',
        amountRequested: Number(editingGrant.amountRequested) || 0,
        amountAwarded: editingGrant.amountAwarded !== undefined ? Number(editingGrant.amountAwarded) : undefined,
        deadlineDate: editingGrant.deadlineDate || undefined,
        submissionDate: editingGrant.submissionDate || undefined,
        decisionDate: editingGrant.decisionDate || undefined,
        leadMemberName: editingGrant.leadMemberName || currentUser?.name || 'Team Lead',
        leadMemberEmail: editingGrant.leadMemberEmail || currentUser?.schoolEmail || '',
        subteamFocus: editingGrant.subteamFocus || 'Team-wide',
        applicationUrl: editingGrant.applicationUrl || undefined,
        portalLoginNotes: editingGrant.portalLoginNotes || undefined,
        description: editingGrant.description || undefined,
        requirements: editingGrant.requirements || [],
        notes: editingGrant.notes || undefined,
        postAwardReportRequired: !!editingGrant.postAwardReportRequired,
        postAwardReportDeadline: editingGrant.postAwardReportDeadline || undefined,
        postAwardReportCompleted: !!editingGrant.postAwardReportCompleted,
        syncedToLedger: !!editingGrant.syncedToLedger,
        ledgerTransactionId: editingGrant.ledgerTransactionId || undefined,
        createdAt: editingGrant.createdAt || now,
        createdBy: editingGrant.createdBy || currentUser?.name || 'System',
        createdByEmail: editingGrant.createdByEmail || currentUser?.schoolEmail || '',
        updatedAt: now,
        updatedBy: currentUser?.name || 'System'
      };

      const success = await onSaveGrant(fullGrant);
      if (success) {
        showToast(editingGrant.id ? 'Grant updated successfully.' : 'Grant proposal created!', 'success');
        setIsEditModalOpen(false);
        setEditingGrant(null);
        if (selectedGrant && selectedGrant.id === fullGrant.id) {
          setSelectedGrant(fullGrant);
        }
      } else {
        showToast('Failed to save grant. Please check connection.', 'danger');
      }
    } catch (err: any) {
      showToast(`Error saving grant: ${err.message}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleRequirement = async (grant: GrantApplication, reqId: string) => {
    const updatedReqs = grant.requirements.map(r => {
      if (r.id === reqId) {
        const nextState = !r.completed;
        return {
          ...r,
          completed: nextState,
          completedAt: nextState ? Date.now() : undefined,
          completedBy: nextState ? (currentUser?.name || 'Team Member') : undefined
        };
      }
      return r;
    });

    const updatedGrant: GrantApplication = {
      ...grant,
      requirements: updatedReqs,
      updatedAt: Date.now(),
      updatedBy: currentUser?.name || 'System'
    };

    const success = await onSaveGrant(updatedGrant);
    if (success) {
      if (selectedGrant?.id === grant.id) {
        setSelectedGrant(updatedGrant);
      }
      showToast('Checklist updated.', 'info');
    }
  };

  const handleAddRequirementToSelected = async (grant: GrantApplication, title: string) => {
    if (!title.trim()) return;
    const newReq: GrantRequirement = {
      id: 'req_' + Date.now(),
      title: title.trim(),
      completed: false
    };

    const updatedGrant: GrantApplication = {
      ...grant,
      requirements: [...grant.requirements, newReq],
      updatedAt: Date.now(),
      updatedBy: currentUser?.name || 'System'
    };

    const success = await onSaveGrant(updatedGrant);
    if (success) {
      if (selectedGrant?.id === grant.id) {
        setSelectedGrant(updatedGrant);
      }
      setNewChecklistText('');
      showToast('Requirement added.', 'success');
    }
  };

  const handleDeleteGrantClick = async (grantId: string, grantName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${grantName}"? This action cannot be undone.`)) {
      return;
    }
    const success = await onDeleteGrant(grantId);
    if (success) {
      showToast(`Deleted "${grantName}".`, 'info');
      if (selectedGrant?.id === grantId) {
        setSelectedGrant(null);
      }
    } else {
      showToast('Failed to delete grant.', 'danger');
    }
  };

  const handleSyncLedger = async (grant: GrantApplication) => {
    if (!onSyncToLedger) {
      showToast('General Ledger integration unavailable.', 'danger');
      return;
    }
    const success = await onSyncToLedger(grant);
    if (success) {
      const updated = {
        ...grant,
        syncedToLedger: true,
        updatedAt: Date.now(),
        updatedBy: currentUser?.name || 'System'
      };
      await onSaveGrant(updated);
      setSelectedGrant(updated);
      showToast(`Logged $${grant.amountAwarded || grant.amountRequested} into General Ledger!`, 'success');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Grant Name',
      'Organization',
      'Season',
      'Status',
      'Category',
      'Requested ($)',
      'Awarded ($)',
      'Deadline',
      'Submission Date',
      'Decision Date',
      'Lead Member',
      'Subteam',
      'Requirements Total',
      'Requirements Completed',
      'Synced to Ledger'
    ];

    const rows = grants.map(g => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.organization.replace(/"/g, '""')}"`,
      g.season,
      g.status,
      `"${g.category}"`,
      g.amountRequested,
      g.amountAwarded ?? 0,
      g.deadlineDate || 'N/A',
      g.submissionDate || 'N/A',
      g.decisionDate || 'N/A',
      `"${(g.leadMemberName || 'N/A').replace(/"/g, '""')}"`,
      `"${g.subteamFocus || 'Team-wide'}"`,
      g.requirements.length,
      g.requirements.filter(r => r.completed).length,
      g.syncedToLedger ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FTC_6567_Grants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported grants list to CSV.', 'success');
  };

  // --- ANALYTICS DATA ---
  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    grants.forEach(g => {
      counts[g.status] = (counts[g.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [grants]);

  const categoryChartData = useMemo(() => {
    const catMap: Record<string, { requested: number; awarded: number }> = {};
    grants.forEach(g => {
      if (!catMap[g.category]) {
        catMap[g.category] = { requested: 0, awarded: 0 };
      }
      catMap[g.category].requested += g.amountRequested || 0;
      if (g.status === 'Awarded' || g.status === 'Partially Awarded') {
        catMap[g.category].awarded += g.amountAwarded ?? g.amountRequested ?? 0;
      }
    });

    return Object.entries(catMap).map(([category, data]) => ({
      category: category.replace(' Voucher', '').replace(' / Registration Subsidy', ''),
      Requested: data.requested,
      Awarded: data.awarded
    }));
  }, [grants]);

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-fade-in print:p-0 print:m-0 print:max-w-none" id="grant-tracker-main">
      
      {/* SCREEN UI (Hidden during window.print) */}
      <div className="no-print flex flex-col gap-6">

      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border-none"
              title="Back to Hub"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[9px] font-black uppercase px-2.5 py-0.5 rounded border border-amber-500/30 tracking-widest leading-none">
              SPONSORSHIP &amp; FUNDING PIPELINE
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase text-slate-900 dark:text-slate-100 mt-2 tracking-tight font-display flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-500" />
            <span>RoboRaiders Grant Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Track grant applications, sponsorship deliverables, deadlines, and automatically sync approved awards into the team General Ledger.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Generate Printable Summary Report or Export to PDF"
            id="print-grants-summary-btn"
          >
            <Printer className="w-3.5 h-3.5 text-amber-500" />
            <span>Print / PDF Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            title="Export Grants to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer border-none ml-auto md:ml-0"
            id="new-grant-proposal-btn"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Grant Proposal</span>
          </button>
        </div>
      </div>

      {/* SUMMARY KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Awarded */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Awarded
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              ${metrics.totalAwarded.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5 block">
              {metrics.awardedCount} approved grant{metrics.awardedCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Total Applied Pipeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Pipeline
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              ${metrics.pendingAmount.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5 block">
              {metrics.pendingCount} proposal{metrics.pendingCount === 1 ? '' : 's'} pending
            </span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Success Rate
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-amber-500 font-mono">
              {metrics.winRate}%
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5 block">
              Awarded vs. closed ratio
            </span>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Deadlines &lt; 30 Days
            </span>
            <div className={`p-1.5 rounded-lg ${metrics.upcomingDeadlinesCount > 0 ? 'bg-rose-500/10 text-rose-500 animate-pulse' : 'bg-slate-500/10 text-slate-500'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-xl sm:text-2xl font-black font-mono ${metrics.upcomingDeadlinesCount > 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
              {metrics.upcomingDeadlinesCount}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5 block">
              {metrics.upcomingDeadlinesCount > 0 ? 'Action required soon' : 'All clear this month'}
            </span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS & VIEW SWITCHER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search grants by name, sponsor, lead member..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-1.5 self-end md:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                activeTab === 'grid' 
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                activeTab === 'table' 
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                activeTab === 'analytics' 
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
              title="Analytics & Charts"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mr-1">Status:</span>
            {['All', 'Active', 'Awarded', 'Submitted', 'Under Review', 'Drafting', 'Researching'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-sans transition-all cursor-pointer border ${
                  statusFilter === st 
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Dropdowns */}
          <div className="flex items-center gap-2">
            {/* Season Filter */}
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="All">All Seasons</option>
              {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="All">All Categories</option>
              {Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="deadline">Sort: Deadline</option>
              <option value="amount">Sort: Amount</option>
              <option value="updated">Sort: Updated</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION BASED ON ACTIVE TAB --- */}

      {/* 1. CARDS GRID VIEW */}
      {activeTab === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGrants.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">No Grants Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No grant proposals match your active filters or search terms. Try adjusting your query or launch a new proposal.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-lg transition-all shadow-xs cursor-pointer border-none inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create First Proposal</span>
              </button>
            </div>
          ) : (
            filteredGrants.map(grant => {
              const statusCfg = STATUS_CONFIG[grant.status] || STATUS_CONFIG['Researching'];
              const StatusIcon = statusCfg.icon;
              const completedReqs = grant.requirements.filter(r => r.completed).length;
              const totalReqs = grant.requirements.length;
              const progressPct = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0;
              
              const isAwarded = grant.status === 'Awarded' || grant.status === 'Partially Awarded';
              const displayAmount = isAwarded && grant.amountAwarded !== undefined ? grant.amountAwarded : grant.amountRequested;

              // Deadline badge formatting
              let deadlineText = 'No deadline';
              let isUrgent = false;
              if (grant.deadlineDate) {
                const now = new Date();
                const d = new Date(grant.deadlineDate + 'T00:00:00');
                const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) {
                  deadlineText = 'Deadline Passed';
                } else if (diffDays === 0) {
                  deadlineText = 'Due Today!';
                  isUrgent = true;
                } else if (diffDays <= 7) {
                  deadlineText = `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
                  isUrgent = true;
                } else {
                  deadlineText = `Due ${grant.deadlineDate}`;
                }
              }

              return (
                <div
                  key={grant.id}
                  onClick={() => setSelectedGrant(grant)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                >
                  {/* Top Status & Season Row */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusCfg.label}</span>
                      </span>

                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {grant.season}
                      </span>
                    </div>

                    {/* Grant Title & Organization */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                      {grant.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{grant.organization}</span>
                    </div>

                    {/* Category pill */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <span 
                        className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[grant.category]}15`,
                          color: CATEGORY_COLORS[grant.category],
                          borderColor: `${CATEGORY_COLORS[grant.category]}40`
                        }}
                      >
                        {grant.category}
                      </span>
                      {grant.subteamFocus && (
                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {grant.subteamFocus}
                        </span>
                      )}
                    </div>

                    {/* Requirements Progress Bar */}
                    {totalReqs > 0 && (
                      <div className="mt-4 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                          <span>Deliverables Checklist</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{completedReqs}/{totalReqs} ({progressPct}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Financial & Action Row */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 block leading-none">
                        {isAwarded ? 'Awarded Value' : 'Requested Target'}
                      </span>
                      <div className={`text-base font-black font-mono mt-1 ${isAwarded ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        ${displayAmount.toLocaleString()}
                      </div>
                    </div>

                    {/* Deadline or Ledger Badge */}
                    <div className="text-right">
                      {grant.syncedToLedger ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Ledger Synced
                        </span>
                      ) : grant.deadlineDate ? (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isUrgent 
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{deadlineText}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">Open Window</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. TABLE VIEW */}
      {activeTab === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-3.5 pl-4">Grant &amp; Sponsor</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Requested</th>
                  <th className="p-3.5">Awarded</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Lead Contact</th>
                  <th className="p-3.5">Checklist</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredGrants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                      <Award className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                      <span className="font-bold block text-slate-700 dark:text-slate-300">No Grants Found</span>
                      <span>No grant applications match your active filters or none have been logged yet.</span>
                    </td>
                  </tr>
                ) : (
                  filteredGrants.map(grant => {
                  const statusCfg = STATUS_CONFIG[grant.status] || STATUS_CONFIG['Researching'];
                  const completedReqs = grant.requirements.filter(r => r.completed).length;
                  const totalReqs = grant.requirements.length;

                  return (
                    <tr 
                      key={grant.id} 
                      onClick={() => setSelectedGrant(grant)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 pl-4 min-w-[220px]">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{grant.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{grant.organization} ({grant.season})</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span 
                          className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[grant.category]}15`,
                            color: CATEGORY_COLORS[grant.category],
                            borderColor: `${CATEGORY_COLORS[grant.category]}40`
                          }}
                        >
                          {grant.category}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                          <span>{statusCfg.label}</span>
                        </span>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                        ${grant.amountRequested.toLocaleString()}
                      </td>

                      <td className="p-3.5 font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {grant.amountAwarded !== undefined ? `$${grant.amountAwarded.toLocaleString()}` : '—'}
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {grant.deadlineDate || '—'}
                      </td>

                      <td className="p-3.5 text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {grant.leadMemberName || 'Team-wide'}
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {totalReqs > 0 ? `${completedReqs}/${totalReqs}` : 'None'}
                      </td>

                      <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(grant);
                          }}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer mr-1"
                          title="Edit Grant"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {isUserAdminOrMentor && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGrantClick(grant.id, grant.name);
                            }}
                            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Grant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
              </table>
          </div>
        </div>
      )}

      {/* 3. ANALYTICS & VISUALIZATIONS VIEW */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Pipeline Breakdown by Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-500" />
              <span>Grants by Pipeline Status</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusChartData.map((entry, index) => {
                      const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#64748b', '#ec4899', '#f43f5e'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Requested vs Awarded by Category */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>Funding: Requested vs. Awarded ($)</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis dataKey="category" angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Requested" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Awarded" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Timeline Milestones Table */}
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-500" />
              <span>Upcoming Grant Deadlines &amp; Reporting Dates</span>
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {grants
                .filter(g => g.deadlineDate || g.postAwardReportDeadline)
                .sort((a, b) => {
                  const dateA = a.deadlineDate || a.postAwardReportDeadline || '';
                  const dateB = b.deadlineDate || b.postAwardReportDeadline || '';
                  return dateA.localeCompare(dateB);
                })
                .map(g => (
                  <div key={g.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{g.name}</span>
                      <span className="text-slate-400 text-[11px] ml-2 font-mono">({g.organization})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {g.deadlineDate && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-mono">Application Deadline</span>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{g.deadlineDate}</span>
                        </div>
                      )}
                      {g.postAwardReportDeadline && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-mono">Impact Report Due</span>
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{g.postAwardReportDeadline}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* --- GRANT DETAIL INSPECTOR MODAL --- */}
      <AnimatePresence>
        {selectedGrant && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs no-print overflow-y-auto"
            onClick={() => setSelectedGrant(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${STATUS_CONFIG[selectedGrant.status]?.bg} ${STATUS_CONFIG[selectedGrant.status]?.text} ${STATUS_CONFIG[selectedGrant.status]?.border}`}>
                      {STATUS_CONFIG[selectedGrant.status]?.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {selectedGrant.season}
                    </span>
                    <span 
                      className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[selectedGrant.category]}15`,
                        color: CATEGORY_COLORS[selectedGrant.category],
                        borderColor: `${CATEGORY_COLORS[selectedGrant.category]}40`
                      }}
                    >
                      {selectedGrant.category}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 mt-2 leading-tight">
                    {selectedGrant.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{selectedGrant.organization}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Print Funding Report"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const g = selectedGrant;
                      setSelectedGrant(null);
                      handleOpenEditModal(g);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Edit Grant Proposal"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGrant(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto flex flex-col gap-5 text-xs text-slate-700 dark:text-slate-300">
                
                {/* Financials & Ledger Card */}
                <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Requested Amount</span>
                      <span className="text-lg font-black font-mono text-slate-900 dark:text-slate-100">
                        ${selectedGrant.amountRequested.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Awarded Amount</span>
                      <span className={`text-lg font-black font-mono ${selectedGrant.amountAwarded ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {selectedGrant.amountAwarded !== undefined ? `$${selectedGrant.amountAwarded.toLocaleString()}` : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* General Ledger Sync Button */}
                  {(selectedGrant.status === 'Awarded' || selectedGrant.status === 'Partially Awarded') && onSyncToLedger && (
                    <div>
                      {selectedGrant.syncedToLedger ? (
                        <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-bold text-xs bg-teal-50 dark:bg-teal-950/30 border border-teal-500/30 px-3 py-1.5 rounded-lg">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Synced to General Ledger</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSyncLedger(selectedGrant)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border-none"
                          title="Post this awarded amount directly into team General Ledger"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span>Sync to General Ledger</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Important Dates & Lead Member */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono">
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">Deadline</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedGrant.deadlineDate || 'None'}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">Submission Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedGrant.submissionDate || 'Not yet submitted'}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">Decision Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedGrant.decisionDate || 'Awaiting'}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">Lead Member</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{selectedGrant.leadMemberName || 'Team'}</span>
                  </div>
                </div>

                {/* Description */}
                {selectedGrant.description && (
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Grant Purpose &amp; Scope
                    </span>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      {selectedGrant.description}
                    </p>
                  </div>
                )}

                {/* Requirements Checklist with Interactive Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Deliverables Checklist ({selectedGrant.requirements.filter(r => r.completed).length}/{selectedGrant.requirements.length})
                    </span>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    {selectedGrant.requirements.map(req => (
                      <div
                        key={req.id}
                        onClick={() => handleToggleRequirement(selectedGrant, req.id)}
                        className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer select-none"
                      >
                        <div className="mt-0.5 shrink-0">
                          {req.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-medium leading-tight ${req.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                            {req.title}
                          </span>
                          {req.completed && req.completedBy && (
                            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                              Completed by {req.completedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add new requirement quick input */}
                    <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                      <input
                        type="text"
                        value={newChecklistText}
                        onChange={(e) => setNewChecklistText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddRequirementToSelected(selectedGrant, newChecklistText);
                          }
                        }}
                        placeholder="Add new requirement/deliverable..."
                        className="flex-1 py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddRequirementToSelected(selectedGrant, newChecklistText)}
                        className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer border-none"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* External Portal Links & Application Notes */}
                {(selectedGrant.applicationUrl || selectedGrant.portalLoginNotes || selectedGrant.notes) && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Application Notes &amp; Links
                    </span>
                    
                    {selectedGrant.applicationUrl && (
                      <a
                        href={selectedGrant.applicationUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/40 px-3 py-1.5 rounded-lg"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Grant Application Portal</span>
                      </a>
                    )}

                    {selectedGrant.portalLoginNotes && (
                      <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <strong>Portal Credentials / Notes:</strong> {selectedGrant.portalLoginNotes}
                      </div>
                    )}

                    {selectedGrant.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        {selectedGrant.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Post-Award Reporting Tracker */}
                {selectedGrant.postAwardReportRequired && (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Post-Award Impact Reporting Required</span>
                      </span>
                      <p className="text-xs text-purple-900 dark:text-purple-300 mt-1">
                        Sponsor requires a season summary, student quotes, or photo proof.
                        {selectedGrant.postAwardReportDeadline && ` Due by: ${selectedGrant.postAwardReportDeadline}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const updated = {
                          ...selectedGrant,
                          postAwardReportCompleted: !selectedGrant.postAwardReportCompleted,
                          updatedAt: Date.now(),
                          updatedBy: currentUser?.name || 'System'
                        };
                        const success = await onSaveGrant(updated);
                        if (success) {
                          setSelectedGrant(updated);
                          showToast('Post-award status updated.', 'info');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        selectedGrant.postAwardReportCompleted 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                      }`}
                    >
                      {selectedGrant.postAwardReportCompleted ? 'Report Filed ✓' : 'Mark as Filed'}
                    </button>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                {isUserAdminOrMentor && (
                  <button
                    type="button"
                    onClick={() => handleDeleteGrantClick(selectedGrant.id, selectedGrant.name)}
                    className="text-rose-600 hover:text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Proposal</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedGrant(null)}
                  className="ml-auto bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors border-none"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CREATE / EDIT GRANT MODAL --- */}
      <AnimatePresence>
        {isEditModalOpen && editingGrant && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs no-print overflow-y-auto"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Form Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black uppercase text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>{editingGrant.id ? 'Edit Grant Proposal' : 'New Grant Proposal'}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure funding organization, deliverables, financial targets, and milestones.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveSubmit} className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
                
                {/* Grant Name & Organization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Grant Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingGrant.name || ''}
                      onChange={(e) => setEditingGrant(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., REV Robotics Team Sponsorship"
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Funding Organization / Sponsor *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingGrant.organization || ''}
                      onChange={(e) => setEditingGrant(prev => ({ ...prev, organization: e.target.value }))}
                      placeholder="e.g., REV Robotics, Gene Haas Foundation"
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Season, Status, Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Season
                    </label>
                    <select
                      value={editingGrant.season || '2026-2027'}
                      onChange={(e) => setEditingGrant(prev => ({ ...prev, season: e.target.value }))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    >
                      {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Current Status
                    </label>
                    <select
                      value={editingGrant.status || 'Researching'}
                      onChange={(e) => setEditingGrant(prev => ({ ...prev, status: e.target.value as GrantStatus }))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    >
                      {Object.keys(STATUS_CONFIG).map(st => (
                        <option key={st} value={st}>{STATUS_CONFIG[st as GrantStatus].label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Award Category
                    </label>
                    <select
                      value={editingGrant.category || 'Direct Funds'}
                      onChange={(e) => setEditingGrant(prev => ({ ...prev, category: e.target.value as GrantCategory }))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    >
                      {Object.keys(CATEGORY_COLORS).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Amounts: Requested vs Awarded */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Amount Requested ($) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">$</span>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        required
                        value={editingGrant.amountRequested || ''}
                        onChange={(e) => setEditingGrant(prev => ({ ...prev, amountRequested: parseFloat(e.target.value) || 0 }))}
                        className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Amount Awarded ($) (If Approved)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">$</span>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="Leave blank if pending"
                        value={editingGrant.amountAwarded !== undefined ? editingGrant.amountAwarded : ''}
                        onChange={(e) => setEditingGrant(prev => ({ ...prev, amountAwarded: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates: Deadline, Submission, Decision */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      value={editingGrant.deadlineDate || ''}
                      onChange={(e) => setEditingGrant(prev => ({ ...prev, deadlineDate: e.target.value }))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Date Submitted
                    </label>
                    <input
                      type="date"
                      value={editingGrant.submissionDate || ''}
                      onChange={(e) => setEditingGrant(prev => ({ ...prev, submissionDate: e.target.value }))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Decision Announcement
                    </label>
                    <input
                      type="date"
                      value={editingGrant.decisionDate || ''}
                      onChange={(e) => setEditingGrant(prev => ({ ...prev, decisionDate: e.target.value }))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Lead Contact Member & Subteam */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Lead Student / Mentor Applicant
                    </label>
                    <select
                      value={editingGrant.leadMemberEmail || ''}
                      onChange={(e) => {
                        const acc = accounts.find(a => a.schoolEmail === e.target.value);
                        setEditingGrant(prev => ({
                          ...prev,
                          leadMemberEmail: e.target.value,
                          leadMemberName: acc?.name || e.target.value
                        }));
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                    >
                      <option value="">Select Team Member...</option>
                      {accounts.map(acc => (
                        <option key={acc.schoolEmail} value={acc.schoolEmail}>
                          {acc.name} ({acc.role} - {acc.primarySubteam})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Subteam Focus
                    </label>
                    <select
                      value={editingGrant.subteamFocus || 'Team-wide'}
                      onChange={(e) => setEditingGrant(prev => ({ ...prev, subteamFocus: e.target.value as any }))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                    >
                      <option value="Team-wide">Team-wide</option>
                      {SUBTEAMS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Application URL & Portal Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Portal URL
                    </label>
                    <input
                      type="url"
                      value={editingGrant.applicationUrl || ''}
                      onChange={(e) => setEditingGrant(prev => ({ ...prev, applicationUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Portal Login / Team Credentials Notes
                    </label>
                    <input
                      type="text"
                      value={editingGrant.portalLoginNotes || ''}
                      onChange={(e) => setEditingGrant(prev => ({ ...prev, portalLoginNotes: e.target.value }))}
                      placeholder="e.g., Team #6567 credentials stored in 1Password"
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    Grant Scope &amp; Purpose
                  </label>
                  <textarea
                    rows={2}
                    value={editingGrant.description || ''}
                    onChange={(e) => setEditingGrant(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Briefly describe what these funds will purchase or support..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                {/* Post-Award Reporting Toggle */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="postAwardReportCheck"
                    checked={!!editingGrant.postAwardReportRequired}
                    onChange={(e) => setEditingGrant(prev => ({ ...prev, postAwardReportRequired: e.target.checked }))}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                  <label htmlFor="postAwardReportCheck" className="flex-1 cursor-pointer">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Post-Award Reporting / Thank-You Letter Required</span>
                    <span className="text-slate-500 text-[11px]">Check if the sponsor requires a season-end impact report or mentor verification letter.</span>
                  </label>
                  {editingGrant.postAwardReportRequired && (
                    <input
                      type="date"
                      value={editingGrant.postAwardReportDeadline || ''}
                      onChange={(e) => setEditingGrant(prev => ({ ...prev, postAwardReportDeadline: e.target.value }))}
                      className="text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                      title="Post-Award Report Deadline"
                    />
                  )}
                </div>

                {/* Modal Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider px-5 py-2 rounded-lg transition-all shadow-md cursor-pointer border-none flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving...' : editingGrant.id ? 'Save Changes' : 'Create Proposal'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>
      {/* END SCREEN UI */}

      {/* 4. PRINT & PDF EXPORT MODAL */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans"
            >
              {/* Modal Top Bar */}
              <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white font-display flex items-center gap-2">
                      <span>Grant Funding Report — Print &amp; PDF Export</span>
                    </h2>
                    <p className="text-[10.5px] text-slate-400 hidden sm:block">
                      Generate high-resolution summary sheets formatted for school administration, sponsors, and grant binders.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadReportHTML}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Download standalone HTML report"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Download HTML</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerPrint}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-wider py-1.5 px-4 rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer border-none"
                    id="trigger-browser-print-btn"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Save as PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border-none ml-1"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Split View */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* Left Controls & Settings Sidebar */}
                <div className="w-full md:w-80 bg-slate-900/90 border-b md:border-b-0 md:border-r border-slate-800 p-4 overflow-y-auto flex flex-col gap-4 text-xs shrink-0">
                  
                  {/* Export Scope */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Report Scope
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'filtered', label: `Active Filtered View (${filteredGrants.length})`, desc: 'Matches current table/grid search & filters' },
                        { id: 'all', label: `All Grant Applications (${grants.length})`, desc: 'Complete master registry across all seasons' },
                        { id: 'awarded', label: `Awarded Grants Only (${grants.filter(g => g.status === 'Awarded' || g.status === 'Partially Awarded').length})`, desc: 'Secured sponsorships and active vouchers' },
                        { id: 'pending', label: `Active Pipeline (${grants.filter(g => g.status === 'Researching' || g.status === 'Drafting' || g.status === 'Submitted' || g.status === 'Under Review').length})`, desc: 'Unresolved proposals awaiting decisions' }
                      ].map(item => (
                        <label
                          key={item.id}
                          className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                            printScope === item.id 
                              ? 'bg-amber-500/10 border-amber-500/50 text-white' 
                              : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name="print_scope"
                            checked={printScope === item.id}
                            onChange={() => setPrintScope(item.id as any)}
                            className="mt-0.5 accent-amber-500"
                          />
                          <div>
                            <span className="font-bold block leading-tight text-xs">{item.label}</span>
                            <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Paper Format */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Paper Size Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPrintPaperSize('letter')}
                        className={`py-1.5 px-3 rounded-lg border text-xs font-mono font-bold transition-all ${
                          printPaperSize === 'letter'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                        }`}
                      >
                        US Letter (8.5×11")
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrintPaperSize('a4')}
                        className={`py-1.5 px-3 rounded-lg border text-xs font-mono font-bold transition-all ${
                          printPaperSize === 'a4'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                        }`}
                      >
                        ISO A4 (210×297mm)
                      </button>
                    </div>
                  </div>

                  {/* Section Content Toggles */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Report Sections Included
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-700/60 cursor-pointer">
                        <span className="text-xs text-slate-200">Financial KPI Header</span>
                        <input
                          type="checkbox"
                          checked={printShowKPIs}
                          onChange={(e) => setPrintShowKPIs(e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-700/60 cursor-pointer">
                        <span className="text-xs text-slate-200">Status Distribution Strip</span>
                        <input
                          type="checkbox"
                          checked={printShowBreakdown}
                          onChange={(e) => setPrintShowBreakdown(e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-700/60 cursor-pointer">
                        <span className="text-xs text-slate-200">Deliverables &amp; Checklist</span>
                        <input
                          type="checkbox"
                          checked={printShowRequirements}
                          onChange={(e) => setPrintShowRequirements(e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-700/60 cursor-pointer">
                        <span className="text-xs text-slate-200">Descriptions &amp; Notes</span>
                        <input
                          type="checkbox"
                          checked={printShowNotes}
                          onChange={(e) => setPrintShowNotes(e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-700/60 cursor-pointer">
                        <span className="text-xs text-slate-200">Mentor / Coach Sign-off Block</span>
                        <input
                          type="checkbox"
                          checked={printShowSignoff}
                          onChange={(e) => setPrintShowSignoff(e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Export Tip Box */}
                  <div className="mt-auto bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[11px] text-slate-300">
                    <strong className="text-amber-400 block mb-0.5">PDF Export Tip:</strong>
                    When the browser print dialog opens, set the <em>Destination</em> to <strong>Save as PDF</strong>. Make sure "Background graphics" is enabled.
                  </div>

                </div>

                {/* Right Interactive Preview */}
                <div className="flex-1 bg-slate-950/90 overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
                  <GrantPrintLayout
                    grants={grantsToPrint}
                    paperSize={printPaperSize}
                    showKPIs={printShowKPIs}
                    showBreakdown={printShowBreakdown}
                    showRequirements={printShowRequirements}
                    showNotes={printShowNotes}
                    showSignoff={printShowSignoff}
                    scopeTitle={getPrintScopeTitle()}
                    seasonFilter={seasonFilter}
                    generatedBy={currentUser?.name || 'RoboRaiders Member'}
                    isPreview={true}
                  />
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BATCH PRINT MEDIA LAYOUT (Rendered exclusively for window.print()) */}
      <div className="hidden print:block w-full bg-white text-slate-950" id="print-grants-batch">
        <GrantPrintLayout
          grants={grantsToPrint}
          paperSize={printPaperSize}
          showKPIs={printShowKPIs}
          showBreakdown={printShowBreakdown}
          showRequirements={printShowRequirements}
          showNotes={printShowNotes}
          showSignoff={printShowSignoff}
          scopeTitle={getPrintScopeTitle()}
          seasonFilter={seasonFilter}
          generatedBy={currentUser?.name || 'RoboRaiders Member'}
          isPreview={false}
        />
      </div>

    </div>
  );
}

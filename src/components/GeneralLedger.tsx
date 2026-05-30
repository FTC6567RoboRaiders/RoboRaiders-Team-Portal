import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Trash2, 
  PieChart as PieIcon, 
  BarChart2 as BarIcon, 
  ArrowRightLeft, 
  Download, 
  Search, 
  Calendar, 
  Filter, 
  ChevronLeft, 
  FileSpreadsheet, 
  Award,
  Clock,
  User,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { LedgerTransaction, UserAccount } from '../types';
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

interface GeneralLedgerProps {
  currentUser: UserAccount | null;
  transactions: LedgerTransaction[];
  onAddTransaction: (tx: Omit<LedgerTransaction, 'id' | 'createdBy' | 'createdByEmail' | 'createdAt'>) => Promise<boolean>;
  onDeleteTransaction: (id: string) => Promise<boolean>;
  onBack: () => void;
  showToast: (text: string, type: 'success' | 'danger' | 'info') => void;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Parts & Hardware': '#3b82f6',     // Blue
  'Tools & Equipment': '#06b6d4',    // Cyan
  'Travel & Lodging': '#8b5cf6',     // Purple
  'Team Registration': '#f43f5e',    // Rose
  'Outreach & Marketing': '#10b981', // Emerald
  'Food & Catering': '#f59e0b',      // Amber
  'Other': '#64748b'                 // Slate
};

const ACCOUNT_COLORS: { [key: string]: string } = {
  'Self-Raised Funds': '#10b981',    // Emerald
  'School Allocated Budget': '#6366f1' // Indigo
};

export default function GeneralLedger({
  currentUser,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onBack,
  showToast
}: GeneralLedgerProps) {
  // Navigation active tab: 'ledger' | 'post' | 'analytics'
  const [activeTab, setActiveTab] = useState<'ledger' | 'post' | 'analytics'>('ledger');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAccount, setSelectedAccount] = useState<string>('All');
  const [selectedFundingSource, setSelectedFundingSource] = useState<string>('All');
  const [transactionType, setTransactionType] = useState<'All' | 'income' | 'expense'>('All');

  // Form State
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState<'Parts & Hardware' | 'Tools & Equipment' | 'Travel & Lodging' | 'Team Registration' | 'Outreach & Marketing' | 'Food & Catering' | 'Other'>('Parts & Hardware');
  const [formAccount, setFormAccount] = useState<'Self-Raised Funds' | 'School Allocated Budget'>('Self-Raised Funds');
  const [formFundingSource, setFormFundingSource] = useState<'School Direct Payment' | "Steve's Credit Card" | 'Out-of-Pocket Reimbursement' | 'Sponsor/Donation Check' | 'Other'>('Out-of-Pocket Reimbursement');
  const [formPaidBy, setFormPaidBy] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle visual graphics type
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid numeric amount greater than zero.', 'danger');
      return;
    }
    if (!formPaidBy.trim()) {
      showToast('Please indicate who paid for this or where the funds originated.', 'danger');
      return;
    }
    if (!formDescription.trim()) {
      showToast('Please provide a short description of the item or allocation.', 'danger');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onAddTransaction({
        amount,
        type: formType,
        category: formType === 'income' ? 'Other' : formCategory,
        account: formAccount,
        fundingSource: formType === 'income' ? 'Sponsor/Donation Check' : formFundingSource,
        paidBy: formPaidBy,
        description: formDescription,
        date: formDate
      });

      if (success) {
        showToast('Transaction logged successfully!', 'success');
        // Reset form
        setFormAmount('');
        setFormPaidBy('');
        setFormDescription('');
        setFormDate(new Date().toISOString().split('T')[0]);
        setActiveTab('ledger'); // Return to registry view
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save general ledger entry.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper inside form to change type and assign sensible smart defaults
  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormType(type);
    if (type === 'income') {
      setFormAccount('Self-Raised Funds');
      setFormFundingSource('Sponsor/Donation Check');
      setFormPaidBy('Sponsor Organization');
      setFormCategory('Other');
    } else {
      setFormAccount('Self-Raised Funds');
      setFormFundingSource('Steve\'s Credit Card');
      setFormPaidBy('');
      setFormCategory('Parts & Hardware');
    }
  };

  // 1. Calculate General Ledger Account Totals & Balance Sheet metrics
  const financialMetrics = useMemo(() => {
    let selfRaisedIncome = 0;
    let selfRaisedExpense = 0;
    let schoolIncome = 0;
    let schoolExpense = 0;

    transactions.forEach(tx => {
      const amt = tx.amount;
      if (tx.account === 'Self-Raised Funds') {
        if (tx.type === 'income') selfRaisedIncome += amt;
        else selfRaisedExpense += amt;
      } else if (tx.account === 'School Allocated Budget') {
        if (tx.type === 'income') schoolIncome += amt;
        else schoolExpense += amt;
      }
    });

    const selfRaisedBalance = selfRaisedIncome - selfRaisedExpense;
    const schoolBalance = schoolIncome - schoolExpense;
    const totalBalance = selfRaisedBalance + schoolBalance;

    return {
      selfRaisedIncome,
      selfRaisedExpense,
      selfRaisedBalance,
      schoolIncome,
      schoolExpense,
      schoolBalance,
      totalIncome: selfRaisedIncome + schoolIncome,
      totalExpense: selfRaisedExpense + schoolExpense,
      totalBalance
    };
  }, [transactions]);

  // 2. Identify outstanding out-of-pocket and credit-card payments that need reimbursement
  const outstandingReimbursements = useMemo(() => {
    const list = transactions.filter(tx => 
      tx.type === 'expense' && 
      (tx.fundingSource === "Steve's Credit Card" || tx.fundingSource === 'Out-of-Pocket Reimbursement')
    );
    
    // Group by person who paid
    const sums: { [person: string]: { total: number; count: number; source: string } } = {};
    list.forEach(tx => {
      const person = tx.paidBy || 'Steve (Mentor)';
      if (!sums[person]) {
        sums[person] = { total: 0, count: 0, source: tx.fundingSource };
      }
      sums[person].total += tx.amount;
      sums[person].count += 1;
    });

    return Object.entries(sums).map(([person, stat]) => ({
      person,
      total: stat.total,
      count: stat.count,
      source: stat.source
    }));
  }, [transactions]);

  // 3. Filter Transactions list
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search term match
      const label = (tx.description + ' ' + tx.paidBy + ' ' + tx.createdBy + ' ' + tx.category).toLowerCase();
      if (searchQuery && !label.includes(searchQuery.toLowerCase())) return false;

      // Type match
      if (transactionType !== 'All' && tx.type !== transactionType) return false;

      // Category match
      if (selectedCategory !== 'All' && tx.category !== selectedCategory) return false;

      // Account match
      if (selectedAccount !== 'All' && tx.account !== selectedAccount) return false;

      // Funding Source match
      if (selectedFundingSource !== 'All' && tx.fundingSource !== selectedFundingSource) return false;

      return true;
    });
  }, [transactions, searchQuery, transactionType, selectedCategory, selectedAccount, selectedFundingSource]);

  // 4. Chart Data compilation (Category Breakdown for expenses only)
  const categoryChartData = useMemo(() => {
    const spendingByCategory: { [cat: string]: number } = {};
    
    // Initialize with 0 for aesthetic completeness
    Object.keys(CATEGORY_COLORS).forEach(cat => {
      spendingByCategory[cat] = 0;
    });

    transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount;
      });

    return Object.entries(spendingByCategory)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || '#647481'
      }))
      .filter(item => item.value > 0); // Only show categories with actual activity
  }, [transactions]);

  // 5. Chart Data: Account comparisons
  const accountComparisonData = useMemo(() => {
    const budgetIncome = transactions
      .filter(t => t.account === 'School Allocated Budget' && t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const budgetExpenses = transactions
      .filter(t => t.account === 'School Allocated Budget' && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const selfIncome = transactions
      .filter(t => t.account === 'Self-Raised Funds' && t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const selfExpenses = transactions
      .filter(t => t.account === 'Self-Raised Funds' && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return [
      {
        name: 'School Allocated Budget',
        Allocated: budgetIncome,
        Spent: budgetExpenses,
        Remainder: Math.max(0, budgetIncome - budgetExpenses)
      },
      {
        name: 'Self-Raised Funds',
        Allocated: selfIncome,
        Spent: selfExpenses,
        Remainder: Math.max(0, selfIncome - selfExpenses)
      }
    ];
  }, [transactions]);

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6" id="general-ledger-view">
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider mb-2"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <span className="bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded border border-indigo-500/30 tracking-widest leading-none">
            FINANCIAL INTELLIGENCE
          </span>
          <h1 className="text-xl md:text-2xl font-black uppercase text-slate-900 dark:text-slate-50 mt-1.5 tracking-tight font-display">
            RoboRaiders General Ledger
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 font-sans mt-0.5">
            Track robotics build spendings, set budget funds, and trace custom credit reimbursements.
          </p>
        </div>

        {/* TOP VIEW TABS */}
        <div className="flex bg-slate-150 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/80 dark:border-slate-800/60 font-mono text-[10px] uppercase font-bold self-start md:self-center">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold border-b-2 border-indigo-500'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Registry</span>
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'post'
                ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold border-b-2 border-indigo-500'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post Transaction</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold border-b-2 border-indigo-500'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200'
            }`}
          >
            <BarIcon className="w-3.5 h-3.5" />
            <span>Report &amp; Charts</span>
          </button>
        </div>
      </div>

      {/* QUICK STATUS METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Ledger Pool */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-450">Cumulative Team Balance</div>
            <div className="text-xl font-black font-mono text-slate-850 dark:text-slate-50 mt-0.5">
              ${financialMetrics.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-none">
              Inflow: <span className="text-emerald-500 font-bold font-mono">${financialMetrics.totalIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* School Allocated Budget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-blue-500/10 text-blue-605 dark:text-blue-400 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-450">School Allocated Budget</div>
            <div className="text-xl font-black font-mono text-blue-650 dark:text-blue-400 mt-0.5">
              ${financialMetrics.schoolBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-none">
              Spent: <span className="text-rose-500 font-bold font-mono">${financialMetrics.schoolExpense.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Self-Raised Funds Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-450">Self-Raised Funds Balance</div>
            <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              ${financialMetrics.selfRaisedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-none">
              Raised: <span className="text-emerald-500 font-bold font-mono">${financialMetrics.selfRaisedIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW PANEL ROUTING */}

      {/* VIEW 1: REGISTRY (TRANSACTIONS LIST & DOCK) */}
      {activeTab === 'ledger' && (
        <section className="flex flex-col gap-5">
          {/* Filters shelf */}
          <div className="bg-white border border-slate-205 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
              {/* Type Filter */}
              <div className="flex items-center gap-1.5 min-w-[120px]">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-300 font-sans"
                >
                  <option value="All">All Transactions</option>
                  <option value="expense">Expenses Only</option>
                  <option value="income">Incomes Only</option>
                </select>
              </div>

              {/* Account Filter */}
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-300 font-sans"
              >
                <option value="All">All Account Pools</option>
                <option value="Self-Raised Funds">Self-Raised Funds Only</option>
                <option value="School Allocated Budget">School Allocated Budget Only</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-300 font-sans"
              >
                <option value="All">All Categories</option>
                {Object.keys(CATEGORY_COLORS).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Funding Source Filter */}
              <select
                value={selectedFundingSource}
                onChange={(e) => setSelectedFundingSource(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-300 font-sans"
              >
                <option value="All">All Mechanisms</option>
                <option value="School Direct Payment">School Direct Payment</option>
                <option value="Steve's Credit Card">Steve's Credit Card</option>
                <option value="Out-of-Pocket Reimbursement">Out-of-Pocket Reimbursement</option>
                <option value="Sponsor/Donation Check">Sponsor/Donation Check</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ledger receipts..."
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded pl-10 pr-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-sans w-full focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Transactions List Registry Card */}
          <div className="bg-white border border-slate-205 dark:bg-slate-900 dark:border-slate-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-955/20">
              <h3 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 font-display flex items-center gap-1.5">
                <span>Ledger Line Transactions</span>
                <span className="text-[10px] font-mono font-normal text-slate-400 dark:text-slate-500 italic">
                  ({filteredTransactions.length} of {transactions.length} matches)
                </span>
              </h3>
              
              {/* Reset filter button */}
              {(searchQuery || selectedCategory !== 'All' || selectedAccount !== 'All' || selectedFundingSource !== 'All' || transactionType !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedAccount('All');
                    setSelectedFundingSource('All');
                    setTransactionType('All');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 dark:text-slate-550 flex flex-col items-center gap-3">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
                <p className="text-sm font-medium">No ledger records match your active configuration queries.</p>
                <button
                  onClick={() => handleTypeChange('expense')}
                  className="mt-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase py-1.5 px-3 rounded shadow-xs"
                >
                  Log First Team Transaction
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-50/70 dark:bg-slate-950/40 text-slate-450 uppercase font-mono text-[9px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Date/Time</th>
                      <th className="py-2.5 px-4">Registry Info / Description</th>
                      <th className="py-2.5 px-4">Budget Pool</th>
                      <th className="py-2.5 px-4">Origin / Paid By</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-4 text-right">Flow Value</th>
                      <th className="py-2.5 px-4 text-center">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                    {filteredTransactions.map((tx) => {
                      const isExpense = tx.type === 'expense';
                      
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20 transition-all">
                          {/* Chrono */}
                          <td className="py-3 px-4 font-mono select-none">
                            <span className="font-extrabold text-slate-800 dark:text-slate-100 block">
                              {tx.date}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              by {tx.createdBy}
                            </span>
                          </td>
                          
                          {/* Label / Description */}
                          <td className="py-3 px-4 max-w-sm">
                            <p className="font-bold text-slate-905 dark:text-slate-50 leading-relaxed text-xs">
                              {tx.description}
                            </p>
                            <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 block mt-0.5 font-mono">
                              ID: {tx.id} • created by {tx.createdByEmail}
                            </span>
                          </td>
                          
                          {/* Account */}
                          <td className="py-3 px-4 font-mono text-[10px]">
                            <span 
                              className="px-2 py-0.5 rounded font-black border"
                              style={{
                                backgroundColor: `${ACCOUNT_COLORS[tx.account]}12`,
                                border: `1px solid ${ACCOUNT_COLORS[tx.account]}30`,
                                color: ACCOUNT_COLORS[tx.account]
                              }}
                            >
                              {tx.account}
                            </span>
                          </td>

                          {/* Funding Source & Original Paid By */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {tx.paidBy}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 block mt-0.5">
                              via: {tx.fundingSource}
                            </span>
                          </td>

                          {/* Category Tag */}
                          <td className="py-3 px-3 font-mono">
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-bold"
                              style={{ 
                                backgroundColor: `${CATEGORY_COLORS[tx.category]}12`, 
                                color: CATEGORY_COLORS[tx.category],
                                border: `1.2px solid ${CATEGORY_COLORS[tx.category]}25` 
                              }}
                            >
                              {tx.category}
                            </span>
                          </td>

                          {/* Flow Value */}
                          <td className="py-3 px-4 text-right font-mono text-xs">
                            <span className={`font-black ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {isExpense ? '–' : '+'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* Action Items */}
                          <td className="py-3 px-4 text-center">
                            {(currentUser?.role === 'mentor' || currentUser?.role === 'mentor_captain' || currentUser?.role === 'captain' || tx.createdByEmail === currentUser?.schoolEmail) ? (
                              <button
                                onClick={async () => {
                                  if (confirm("Are you absolutely sure you want to permanently delete this team transactional log from cloud storage?")) {
                                    try {
                                      await onDeleteTransaction(tx.id);
                                      showToast("Transaction record deleted successfully.", "info");
                                    } catch (err) {
                                      showToast("Failed to delete ledger item.", "danger");
                                    }
                                  }
                                }}
                                className="text-red-500 hover:text-red-650 hover:bg-red-500/10 p-1.5 rounded transition-colors duration-100 cursor-pointer inline-flex items-center"
                                title="Remove Ledger Transaction"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-slate-350 dark:text-slate-700 italic">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* VIEW 2: POST TRANSACTION (FORM TO INPUT ENTRY) */}
      {activeTab === 'post' && (
        <section className="bg-white border border-slate-205 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 lg:p-6 shadow-md flex flex-col gap-4 relative animate-fade-in no-print text-slate-800 dark:text-slate-100">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black uppercase text-indigo-755 dark:text-indigo-400 font-display">
                Post Transaction Ledger Entry
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Insert a verified expense or funding allocation securely into the cloud General Ledger registry.
              </p>
            </div>
            {/* Quick Toggle for transaction type */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/85">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`px-3 py-1 text-[10px] font-mono uppercase font-bold rounded cursor-pointer transition-colors ${
                  formType === 'expense'
                    ? 'bg-rose-500 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`px-3 py-1 text-[10px] font-mono uppercase font-bold rounded cursor-pointer transition-colors ${
                  formType === 'income'
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Amount Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-500">
                Transaction Value (USD $)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 154.50"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded pl-10 pr-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 w-full focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Account Selector (Fund allocation) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-500">
                Fund Pool/Account Destination <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formAccount}
                onChange={(e) => setFormAccount(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-sans focus:outline-none focus:border-indigo-500"
              >
                <option value="Self-Raised Funds">Self-Raised Funds (Raise Money)</option>
                <option value="School Allocated Budget">School Allocated Budget (School-Allocated Funds)</option>
              </select>
            </div>

            {/* Expense Category Select - Only visible or required for expenses */}
            {formType === 'expense' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  Category Breakdown <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-sans focus:outline-none focus:border-indigo-500"
                >
                  <option value="Parts & Hardware">Parts & Hardware (GoBILDA, Rev, AndyMark, etc.)</option>
                  <option value="Tools & Equipment">Tools & Equipment (Drivers, crimpers, 3D printing filaments)</option>
                  <option value="Travel & Lodging">Travel & Lodging (Fuel, tolls, hotel reservations)</option>
                  <option value="Team Registration">Team Registration (FIRST entry renewals, match fees)</option>
                  <option value="Outreach & Marketing">Outreach & Marketing ( STEM flyers, banner prints, shirts)</option>
                  <option value="Food & Catering">Food & Catering (Meal kits, tournament lunch packages)</option>
                  <option value="Other">Other Expenditures / Standard Fee</option>
                </select>
              </div>
            )}

            {/* Funding Mechanism / paid by logic */}
            {formType === 'expense' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  Funding Payment Mechanism <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formFundingSource}
                  onChange={(e) => setFormFundingSource(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-sans focus:outline-none focus:border-indigo-500"
                >
                  <option value="School Direct Payment">School Paid/Direct Payment (School PO, invoice or direct card)</option>
                  <option value="Steve's Credit Card">Steve's Credit Card (Steve paid directly - needs reimbursement)</option>
                  <option value="Out-of-Pocket Reimbursement">Out-of-Pocket Reimbursement (Other team member credit card/cash)</option>
                  <option value="Other">Other mechanism</option>
                </select>
              </div>
            )}

            {/* Who Paid / Funder name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-500">
                Payment Source / Original Funder Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={formType === 'income' ? 'e.g. Sponsor / Rotary Club' : 'e.g. Steve Jackson, Parent Vol Maria, School Admin'}
                  value={formPaidBy}
                  onChange={(e) => setFormPaidBy(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded pl-10 pr-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 w-full focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Transaction Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-500">
                Effective Transaction Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded pl-10 pr-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 w-full focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Description Multi-line text area */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-500">
                Specific Items Purchased / Intent Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                placeholder={formType === 'income' ? 'Describe the source and condition of the incoming budget funds...' : 'Specify parts bought (e.g., AndyMark PG71 motor, vex belts, structural raw aluminum shafts) or general purpose...'}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                maxLength={2000}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-2 text-xs text-slate-800 dark:text-slate-100 w-full h-20 focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setActiveTab('ledger')}
                className="bg-slate-150 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded text-xs font-bold transition-all uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded text-xs font-bold transition-all uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-1.5"
                id="submit-ledger-tx-btn"
              >
                {isSubmitting ? (
                  <span>Saving to cloud...</span>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Confirm &amp; Post Ledger</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </section>
      )}

      {/* VIEW 3: REPORTS & ANALYTICS (BALANCE SHEET & VISUALIZATIONS) */}
      {activeTab === 'analytics' && (
        <section className="flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-slate-100">
          
          {/* BALANCE SHEET REPORT ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Balance Sheet Ledger Document Card */}
            <div className="bg-white border border-slate-205 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 font-display pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-550" />
                  <span>Official Budget Balance Sheet</span>
                </h3>
                
                <div className="mt-4 flex flex-col gap-3 font-sans text-xs">
                  {/* Row 1: School Allocation */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-850 dark:text-slate-150">School allocated total:</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">Original funds provided directly by high-school administration</span>
                    </div>
                    <span className="font-mono font-black text-slate-800 dark:text-slate-200">
                      ${transactions.filter(t => t.account === 'School Allocated Budget' && t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Row 2: Self Raised Inflows */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-850 dark:text-slate-150">Self-Raised team inflows:</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">Corporate grants, fundraising event donations, custom sales</span>
                    </div>
                    <span className="font-mono font-black text-emerald-500">
                      +${financialMetrics.selfRaisedIncome.toFixed(2)}
                    </span>
                  </div>

                  {/* Row 3: Total Cumulative Inflow Pool */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-105 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 p-2 rounded">
                    <span className="font-bold text-slate-905 dark:text-slate-200">Total Team Capital Accumulation:</span>
                    <span className="font-mono font-extrabold text-slate-905 dark:text-slate-50">
                      ${financialMetrics.totalIncome.toFixed(2)}
                    </span>
                  </div>

                  {/* Row 4: School allocated outflows */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-550">School Outflow Expenditures:</span>
                    <span className="font-mono font-black text-rose-500">
                      -${financialMetrics.schoolExpense.toFixed(2)}
                    </span>
                  </div>

                  {/* Row 5: Self Raised outflows */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-550">Self-Raised Spent Outflows:</span>
                    <span className="font-mono font-black text-rose-500">
                      -${financialMetrics.selfRaisedExpense.toFixed(2)}
                    </span>
                  </div>

                  {/* Row 6: Total Expenditures */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-105 dark:border-slate-800 bg-rose-500/5 dark:bg-rose-500/10 p-2 rounded">
                    <span className="font-bold text-slate-905 dark:text-slate-200">Total Spent/Invested Outflows:</span>
                    <span className="font-mono font-extrabold text-rose-500">
                      -${financialMetrics.totalExpense.toFixed(2)}
                    </span>
                  </div>

                  {/* Row 7: Outstanding Personal Credits outstanding */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 italic text-slate-400">
                    <div>
                      <span>Outstanding Personal credit expenditures:</span>
                      <span className="block text-[9px]">Included in total spending, awaiting reimbursement transactions</span>
                    </div>
                    <span className="font-mono">
                      ${transactions.filter(t => t.type === 'expense' && (t.fundingSource === "Steve's Credit Card" || t.fundingSource === 'Out-of-Pocket Reimbursement')).reduce((s,t) => s + t.amount, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/85">
                <div className="flex justify-between items-center bg-indigo-600/10 dark:bg-indigo-600/20 p-3 rounded-lg border border-indigo-500/20">
                  <span className="text-xs font-bold text-indigo-750 dark:text-indigo-400 uppercase tracking-wider font-display">Net Remaining Treasury:</span>
                  <span className="text-sm font-black font-mono text-indigo-750 dark:text-indigo-400">
                    ${financialMetrics.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* CREDITS & REIMBURSEMENTS TRACKER */}
            <div className="bg-white border border-slate-205 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 font-display pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-550" />
                  <span>Personal Credit Reimbursement Tracker</span>
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-sans mt-3">
                  Sometimes team members use their own payment mechanisms (e.g. Steve's credit card or standard pocket cash) to buy urgent components. Look up who needs reimbursement transfers here.
                </p>

                {outstandingReimbursements.length === 0 ? (
                  <div className="mt-12 text-center text-slate-400 flex flex-col items-center gap-2.5">
                    <CheckCircle2 className="w-10 h-10 text-emerald-505" />
                    <p className="text-xs font-bold text-emerald-550">All personal credit expenditures are reimbursed / None outstanding.</p>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col gap-2">
                    {outstandingReimbursements.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-850 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-605 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                            {item.person.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-850 dark:text-slate-100 text-xs block">{item.person}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 italic">
                              {item.count} items via {item.source}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-sm font-black text-rose-500 block">
                            ${item.total.toFixed(2)}
                          </span>
                          <span className="text-[8.5px] uppercase font-mono bg-rose-500/10 text-rose-500 font-bold px-1 rounded">
                            Pending Reimbursement
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-3 p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded border border-amber-500/20 text-[10px] text-amber-900 dark:text-amber-400 font-sans flex items-start gap-1.5 leading-relaxed">
                      <AlertTriangle className="w-4 h-4 text-amber-505 shrink-0 mt-0.5" />
                      <span>
                        <strong>Note on Audit Reconcile:</strong> Once the school's finance desk pays back Steve or Maria, log a positive <strong>"Income"</strong> transaction of the exact value, or delete the transaction, or update description to indicate "Reimbursed on [Date]".
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-xs italic text-slate-400 font-mono text-right leading-none">
                Auto-compiled logs from {transactions.length} registry entries
              </div>
            </div>

          </div>

          {/* VISUAL REPORT CHARTS CARD (PIE OR BAR) */}
          <div className="bg-white border border-slate-205 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-5 lg:p-6 shadow-md flex flex-col gap-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 font-display flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-indigo-550 animate-spin" style={{ animationDuration: '40s' }} />
                  <span>Interactive Spend Statistics and Trends</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-450 font-sans mt-0.5">
                  Analyze team capital distribution and trace budget saturation across parts, travels, &amp; registration items.
                </p>
              </div>

              {/* Chart selector switches */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/80">
                <button
                  onClick={() => setChartType('pie')}
                  className={`px-3 py-1 text-[10px] font-mono uppercase font-black rounded cursor-pointer transition-colors duration-150 flex items-center gap-1 ${
                    chartType === 'pie'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <PieIcon className="w-3 h-3" />
                  <span>Category Pie</span>
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 text-[10px] font-mono uppercase font-black rounded cursor-pointer transition-colors duration-150 flex items-center gap-1 ${
                    chartType === 'bar'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BarIcon className="w-3 h-3" />
                  <span>Bar Comparisons</span>
                </button>
              </div>
            </div>

            {categoryChartData.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2.5">
                <TrendingUp className="w-10 h-10 text-slate-300 animate-bounce" />
                <p className="text-xs font-medium">Log active expenses to display interactive financial charts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Visual Chart Box */}
                <div className="lg:col-span-8 flex justify-center items-center h-[320px] bg-slate-50/50 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-850/50 rounded-xl p-3 relative overflow-hidden">
                  
                  {chartType === 'pie' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`$${parseFloat(value as string).toFixed(2)}`, 'Spend Total']}
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={accountComparisonData}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                        <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
                        <Tooltip
                          formatter={(value) => [`$${parseFloat(value as string).toFixed(2)}`, 'Value']}
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                        />
                        <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px' }} />
                        <Bar dataKey="Allocated" fill="#10b981" radius={[4, 4, 0, 0]} name="Budget Inflow" />
                        <Bar dataKey="Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Spending Outflow" />
                        <Bar dataKey="Remainder" fill="#6366f1" radius={[4, 4, 0, 0]} name="Balance Remaining" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                </div>

                {/* Index legends & listings */}
                <div className="lg:col-span-4 flex flex-col gap-3 font-sans text-xs">
                  <h4 className="font-bold border-b border-slate-100 dark:border-slate-805 pb-1 text-slate-450 uppercase font-mono text-[10px]">
                    {chartType === 'pie' ? 'Spending By Category' : 'Budget Pool Ratios'}
                  </h4>

                  {chartType === 'pie' ? (
                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
                      {categoryChartData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full shrink-0" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                          </div>
                          <span className="font-mono font-black text-slate-905 dark:text-slate-50">
                            ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 mt-1 text-[11px] leading-relaxed">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-450 rounded-lg">
                        <strong>Self-Raised (Emerald Pool):</strong> Highly dynamic! Powered by sponsorships. Useful for custom fast-shipping parts or meals.
                      </div>
                      <div className="p-3 bg-indigo-500/10 border border-indigo-505/20 text-indigo-805 dark:text-indigo-400 rounded-lg">
                        <strong>School Allocated (Indigo Pool):</strong> Provided as school catalog budgets. High strictness. Direct payments are routed via administration approval.
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </section>
      )}

    </div>
  );
}

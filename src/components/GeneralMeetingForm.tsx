import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  CheckSquare, 
  Plus, 
  Trash2, 
  UserCheck, 
  UserX, 
  Sparkles, 
  ListOrdered, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Coins,
  Send,
  FileSpreadsheet
} from 'lucide-react';
import { UserAccount, PersonABC, MeetingTodoItem, LedgerTransaction } from '../types';

interface GeneralMeetingFormProps {
  meetingTitle: string;
  setMeetingTitle: (title: string) => void;
  formDate: string;
  setFormDate: (date: string) => void;
  formAuthor: string;
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  agenda: string;
  setAgenda: (agenda: string) => void;
  abcs: PersonABC[];
  setAbcs: React.Dispatch<React.SetStateAction<PersonABC[]>>;
  financeAnnounced: string;
  setFinanceAnnounced: (finance: string) => void;
  finalTodoList: MeetingTodoItem[];
  setFinalTodoList: React.Dispatch<React.SetStateAction<MeetingTodoItem[]>>;
  attendees: string[];
  setAttendees: React.Dispatch<React.SetStateAction<string[]>>;
  absentAttendees: string[];
  setAbsentAttendees: React.Dispatch<React.SetStateAction<string[]>>;
  customAttendee: string;
  setCustomAttendee: (custom: string) => void;
  ledgerTransactions: LedgerTransaction[];
  onPushToKanban?: (task: string, assignee: string) => void;
}

const DEFAULT_AGENDA_TEMPLATE = `1. Welcome & Season Milestone Check-in
2. Subteam Progress & ABC Standup (Accomplishments, Blockers, Commitments)
3. Financial Ledger & Grant Update (Announced Budget & Purchases)
4. Match Strategy, Mechanical CAD, and Software Review
5. Action Items & Timeline Deadlines`;

export const GeneralMeetingForm: React.FC<GeneralMeetingFormProps> = ({
  meetingTitle,
  setMeetingTitle,
  formDate,
  setFormDate,
  formAuthor,
  currentUser,
  accounts,
  agenda,
  setAgenda,
  abcs,
  setAbcs,
  financeAnnounced,
  setFinanceAnnounced,
  finalTodoList,
  setFinalTodoList,
  attendees,
  setAttendees,
  absentAttendees,
  setAbsentAttendees,
  customAttendee,
  setCustomAttendee,
  ledgerTransactions,
  onPushToKanban
}) => {

  const [customAssigneeRows, setCustomAssigneeRows] = useState<Record<string, boolean>>({});

  // Attendance toggling
  const handleToggleAttendeeStatus = (name: string) => {
    if (attendees.includes(name)) {
      // Move from Present to Absent/Excused
      setAttendees(prev => prev.filter(a => a !== name));
      if (!absentAttendees.includes(name)) {
        setAbsentAttendees(prev => [...prev, name]);
      }
    } else if (absentAttendees.includes(name)) {
      // Remove from Absent completely (Unmarked)
      setAbsentAttendees(prev => prev.filter(a => a !== name));
    } else {
      // Mark as Present
      setAttendees(prev => [...prev, name]);
    }
  };

  const handleMarkAllPresent = () => {
    const allNames = accounts.map(a => a.name);
    setAttendees(Array.from(new Set([...attendees, ...allNames])));
    setAbsentAttendees([]);
  };

  const handleClearAttendance = () => {
    setAttendees([]);
    setAbsentAttendees([]);
  };

  const handleAddCustomAttendee = () => {
    const trimmed = customAttendee.trim();
    if (trimmed && !attendees.includes(trimmed)) {
      setAttendees(prev => [...prev, trimmed]);
      setCustomAttendee('');
    }
  };

  // ABC Handlers
  const handleAddAbc = (name: string = '', subteam: string = '') => {
    const newAbc: PersonABC = {
      id: `abc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name || '',
      subteam: subteam || 'Design/Build/Fabrication',
      accomplishments: '',
      blockers: '',
      commitments: ''
    };
    setAbcs(prev => [...prev, newAbc]);
  };

  const handleAutoPopulateAbcsFromPresent = () => {
    if (attendees.length === 0) return;
    const existingNames = new Set(abcs.map(a => a.name.trim().toLowerCase()));
    const newItems: PersonABC[] = [];

    attendees.forEach(name => {
      if (!existingNames.has(name.trim().toLowerCase())) {
        const matchingAcc = accounts.find(a => a.name.toLowerCase() === name.toLowerCase());
        newItems.push({
          id: `abc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}-${name.replace(/\s+/g, '')}`,
          name: name,
          subteam: matchingAcc?.primarySubteam && matchingAcc.primarySubteam !== 'None' ? matchingAcc.primarySubteam : 'Design/Build/Fabrication',
          accomplishments: '',
          blockers: '',
          commitments: ''
        });
      }
    });

    if (newItems.length > 0) {
      setAbcs(prev => [...prev, ...newItems]);
    }
  };

  const handleUpdateAbc = (id: string, field: keyof PersonABC, value: string) => {
    setAbcs(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveAbc = (id: string) => {
    setAbcs(prev => prev.filter(item => item.id !== id));
  };

  // Finance Announced Handlers
  const handleInsertLedgerSummary = () => {
    const totalIncome = ledgerTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses = ledgerTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const netBalance = totalIncome - totalExpenses;

    const selfRaisedBalance = ledgerTransactions
      .filter(t => t.account === 'Self-Raised Funds')
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

    const schoolBudgetBalance = ledgerTransactions
      .filter(t => t.account === 'School Allocated Budget')
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

    const summaryText = `• Total Treasury Balance: $${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ($${selfRaisedBalance.toFixed(2)} Self-Raised / $${schoolBudgetBalance.toFixed(2)} School Budget)
• YTD Total Funds Received: $${totalIncome.toFixed(2)} | YTD Disbursed: $${totalExpenses.toFixed(2)}
• Pending/Approved Parts Orders: Reviewed with mentors. All receipts to be submitted by Friday.`;

    if (financeAnnounced.trim()) {
      setFinanceAnnounced(financeAnnounced + '\n\n' + summaryText);
    } else {
      setFinanceAnnounced(summaryText);
    }
  };

  // Final To-Do List Handlers
  const handleAddTodoItem = () => {
    const newItem: MeetingTodoItem = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      task: '',
      assignee: attendees[0] || accounts[0]?.name || '',
      dueDate: formDate,
      completed: false
    };
    setFinalTodoList(prev => [...prev, newItem]);
  };

  const handleUpdateTodoItem = (id: string, updates: Partial<MeetingTodoItem>) => {
    setFinalTodoList(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleRemoveTodoItem = (id: string) => {
    setFinalTodoList(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-5" id="general-meeting-form-root">
      
      {/* SECTION 1: MEETING HEADER & METADATA */}
      <div className="bg-slate-50/80 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
              General Meeting Protocol
            </span>
          </div>
          <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
            ALL-HANDS / TEAM-WIDE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Meeting Title */}
          <div className="md:col-span-6">
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1 dark:text-slate-300">
              Meeting Title / Main Objective <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Season Kickoff All-Hands & Subteam Roadmap"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
              required
              id="input-meeting-title"
            />
          </div>

          {/* Meeting Date */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1 dark:text-slate-300">
              Meeting Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand outline-none"
                required
                id="input-meeting-date"
              />
            </div>
          </div>

          {/* Meeting Chair / Reporter */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1 dark:text-slate-300">
              Meeting Chair / Recorder
            </label>
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                {currentUser?.name || formAuthor}
              </span>
              <span className="text-[8px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                CHAIR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: AGENDA AREA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <ListOrdered className="w-4 h-4 text-brand" />
            <label className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
              Meeting Agenda <span className="text-rose-500">*</span>
            </label>
          </div>
          <button
            type="button"
            onClick={() => setAgenda(DEFAULT_AGENDA_TEMPLATE)}
            className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded font-bold transition flex items-center gap-1 cursor-pointer"
            title="Load recommended FTC all-hands agenda topics"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Load FTC Template</span>
          </button>
        </div>

        <textarea
          rows={4}
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
          placeholder="Outline the meeting agenda items (e.g. 1. Icebreaker, 2. Subteam Check-in, 3. Budget & Grants, 4. Hardware Demos, 5. Action Items)..."
          className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed outline-none focus:ring-2 focus:ring-brand resize-y min-h-[90px]"
          required
          id="input-meeting-agenda"
        />
      </div>

      {/* SECTION 3: ATTENDANCE AREA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
              Attendance Roster
            </span>
            <div className="flex items-center gap-1.5 ml-2 font-mono text-[9px]">
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {attendees.length} Present
              </span>
              {absentAttendees.length > 0 && (
                <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                  {absentAttendees.length} Excused/Absent
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px]">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded font-bold hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3" />
              <span>Mark All Present</span>
            </button>
            <button
              type="button"
              onClick={handleClearAttendance}
              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Clickable Member Status Chips */}
        <div>
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">
            Click member to toggle status (🟢 Present → 🔴 Excused/Absent → ⚪ Unmarked):
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto p-1 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-100 dark:border-slate-800">
            {accounts.map(acc => {
              const isPresent = attendees.includes(acc.name);
              const isAbsent = absentAttendees.includes(acc.name);
              
              let chipStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400';
              let badge = null;

              if (isPresent) {
                chipStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-xs font-black';
                badge = <UserCheck className="w-2.5 h-2.5" />;
              } else if (isAbsent) {
                chipStyle = 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 line-through';
                badge = <UserX className="w-2.5 h-2.5" />;
              }

              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleToggleAttendeeStatus(acc.name)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer select-none ${chipStyle}`}
                  title={`${acc.name} (${acc.primarySubteam})`}
                >
                  {badge}
                  <span>{acc.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Attendee / Guest Input */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Add guest mentor, parent, or external advisor..."
            value={customAttendee}
            onChange={(e) => setCustomAttendee(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomAttendee(); } }}
            className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand"
            id="input-custom-attendee"
          />
          <button
            type="button"
            onClick={handleAddCustomAttendee}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition shrink-0"
          >
            Add Guest
          </button>
        </div>
      </div>

      {/* SECTION 4: ABCS (ACCOMPLISHMENTS, BLOCKERS, COMMITMENTS) FOR PEOPLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded">
                ABC
              </span>
              <h3 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
                Member ABCs Standup
              </h3>
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
              Round-the-room check-in: <strong>A</strong>ccomplishments, <strong>B</strong>lockers, and <strong>C</strong>ommitments per person.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {attendees.length > 0 && (
              <button
                type="button"
                onClick={handleAutoPopulateAbcsFromPresent}
                className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
                title="Populate ABC cards for all present members"
              >
                <Users className="w-3 h-3" />
                <span>Auto-Add Present Members ({attendees.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleAddAbc()}
              className="bg-brand hover:bg-brand-hover text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Person ABC</span>
            </button>
          </div>
        </div>

        {abcs.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 dark:text-slate-500 space-y-1.5">
            <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No member ABCs recorded yet.</p>
            <p className="text-[10px]">
              Click <strong>&quot;Auto-Add Present Members&quot;</strong> or <strong>&quot;Add Person ABC&quot;</strong> to log what each person accomplished, their blockers, and upcoming commitments.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {abcs.map((item, idx) => (
              <div 
                key={item.id} 
                className="bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-750 rounded-lg p-3 space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Person Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px] font-black font-mono shrink-0">
                      {idx + 1}
                    </span>

                    {/* Member Name Dropdown / Input */}
                    <div className="flex-1 max-w-[220px]">
                      <input
                        type="text"
                        list={`account-names-${item.id}`}
                        placeholder="Team Member Name..."
                        value={item.name}
                        onChange={(e) => handleUpdateAbc(item.id, 'name', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-900 dark:text-slate-100 font-bold outline-none focus:ring-1 focus:ring-brand"
                      />
                      <datalist id={`account-names-${item.id}`}>
                        {accounts.map(a => (
                          <option key={a.id} value={a.name}>{a.primarySubteam}</option>
                        ))}
                      </datalist>
                    </div>

                    {/* Subteam Selector */}
                    <select
                      value={item.subteam || 'Design/Build/Fabrication'}
                      onChange={(e) => handleUpdateAbc(item.id, 'subteam', e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-[10px] text-slate-700 dark:text-slate-300 font-bold outline-none"
                    >
                      <option value="Design/Build/Fabrication">Design/Build</option>
                      <option value="Programming">Programming</option>
                      <option value="Outreach">Outreach</option>
                      <option value="Business & Media">Business & Media</option>
                      <option value="Strategy">Strategy</option>
                      <option value="Inspire">Inspire</option>
                      <option value="Mentoring">Mentoring</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveAbc(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                    title="Remove this member's ABC log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* The 3 Columns: A, B, and C */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {/* A: Accomplishments */}
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-md border border-emerald-200/70 dark:border-emerald-900/40">
                    <label className="block text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>A — Accomplishments</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="What was completed (e.g. Assembled intake, tuned PID loop...)"
                      value={item.accomplishments}
                      onChange={(e) => handleUpdateAbc(item.id, 'accomplishments', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 resize-y min-h-[50px]"
                    />
                  </div>

                  {/* B: Blockers */}
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-md border border-rose-200/70 dark:border-rose-900/40">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[9px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                        <AlertCircle className="w-3 h-3 text-rose-500" />
                        <span>B — Blockers</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleUpdateAbc(item.id, 'blockers', 'None')}
                        className="text-[8px] font-bold text-slate-400 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded"
                      >
                        None
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Roadblocks, parts needed, or technical issues..."
                      value={item.blockers}
                      onChange={(e) => handleUpdateAbc(item.id, 'blockers', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-rose-500 resize-y min-h-[50px]"
                    />
                  </div>

                  {/* C: Commitments */}
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-md border border-indigo-200/70 dark:border-indigo-900/40">
                    <label className="block text-[9px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      <span>C — Commitments</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="What they commit to achieving before next meeting..."
                      value={item.commitments}
                      onChange={(e) => handleUpdateAbc(item.id, 'commitments', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 resize-y min-h-[50px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 5: FINANCE ANNOUNCED AREA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
                Finance Announced
              </h3>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 block">
                Treasury status, parts purchase approvals, grants, and fundraising reports.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInsertLedgerSummary}
            className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-amber-100 transition flex items-center gap-1.5 cursor-pointer"
            title="Auto-calculate current balance from Team Ledger and insert summary"
          >
            <DollarSign className="w-3 h-3" />
            <span>Insert Live Ledger Summary</span>
          </button>
        </div>

        <textarea
          rows={3}
          value={financeAnnounced}
          onChange={(e) => setFinanceAnnounced(e.target.value)}
          placeholder="Record all financial announcements made at the meeting (e.g., Current Treasury Balance, grants won, recent parts orders approved, sponsor checks received)..."
          className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed outline-none focus:ring-2 focus:ring-brand resize-y min-h-[75px]"
          id="input-finance-announced"
        />
      </div>

      {/* SECTION 6: FINAL TO-DO LIST & ACTION ITEMS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
                Final To-Do List &amp; Action Items
              </h3>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 block">
                Deliverables, assigned owners, and target deadlines decided by the team.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddTodoItem}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Action Item</span>
          </button>
        </div>

        {finalTodoList.length === 0 ? (
          <div className="text-center py-5 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 space-y-1">
            <CheckSquare className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No action items defined.</p>
            <p className="text-[10px]">Click <strong>&quot;Add Action Item&quot;</strong> to record final meeting deliverables.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {finalTodoList.map((todo, idx) => (
              <div 
                key={todo.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800"
              >
                {/* Completed Checkbox */}
                <button
                  type="button"
                  onClick={() => handleUpdateTodoItem(todo.id, { completed: !todo.completed })}
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    todo.completed 
                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {todo.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                {/* Task Description */}
                <input
                  type="text"
                  placeholder={`Action item #${idx + 1}...`}
                  value={todo.task}
                  onChange={(e) => handleUpdateTodoItem(todo.id, { task: e.target.value })}
                  className={`flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand font-medium ${
                    todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                  }`}
                />

                {/* Assignee - Real Dropdown Menu */}
                <div className="w-full sm:w-44">
                  {customAssigneeRows[todo.id] ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Assignee name..."
                        value={todo.assignee || ''}
                        onChange={(e) => handleUpdateTodoItem(todo.id, { assignee: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-brand rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand font-semibold"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setCustomAssigneeRows(prev => ({ ...prev, [todo.id]: false }))}
                        className="px-1.5 py-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-850 hover:bg-slate-100 transition cursor-pointer shrink-0"
                        title="Return to member dropdown menu"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <select
                      id={`select-todo-assignee-${todo.id}`}
                      value={todo.assignee || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__custom__') {
                          setCustomAssigneeRows(prev => ({ ...prev, [todo.id]: true }));
                          handleUpdateTodoItem(todo.id, { assignee: '' });
                        } else {
                          handleUpdateTodoItem(todo.id, { assignee: val });
                        }
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-semibold outline-none focus:ring-1 focus:ring-brand cursor-pointer transition-colors"
                    >
                      <option value="">👤 Select Assignee...</option>
                      <option value="Unassigned">👤 Unassigned</option>

                      {attendees.length > 0 && (
                        <optgroup label="Present Members">
                          {attendees.map(name => {
                            const acc = accounts.find(a => a.name.toLowerCase() === name.toLowerCase());
                            return (
                              <option key={`present-${name}`} value={name}>
                                🟢 {name} {acc ? `(${acc.primarySubteam})` : ''}
                              </option>
                            );
                          })}
                        </optgroup>
                      )}

                      <optgroup label={attendees.length > 0 ? "All Other Members" : "Team Members"}>
                        {accounts
                          .filter(a => !attendees.some(name => name.toLowerCase() === a.name.toLowerCase()))
                          .map(a => (
                            <option key={a.id} value={a.name}>
                              👤 {a.name} ({a.primarySubteam || 'Member'})
                            </option>
                          ))}
                      </optgroup>

                      {todo.assignee && 
                       todo.assignee !== 'Unassigned' && 
                       !accounts.some(a => a.name.toLowerCase() === todo.assignee.toLowerCase()) && 
                       !attendees.some(name => name.toLowerCase() === todo.assignee.toLowerCase()) && (
                        <optgroup label="Current Selection">
                          <option value={todo.assignee}>
                            👤 {todo.assignee} (Custom)
                          </option>
                        </optgroup>
                      )}

                      <option value="__custom__">➕ Custom / Guest Name...</option>
                    </select>
                  )}
                </div>

                {/* Due Date */}
                <input
                  type="date"
                  value={todo.dueDate || formDate}
                  onChange={(e) => handleUpdateTodoItem(todo.id, { dueDate: e.target.value })}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-300 outline-none w-full sm:w-32"
                />

                {/* Optional Push to Kanban */}
                {onPushToKanban && todo.task.trim() && (
                  <button
                    type="button"
                    onClick={() => onPushToKanban(todo.task, todo.assignee || 'Unassigned')}
                    className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-400 transition cursor-pointer shrink-0"
                    title="Push this action item directly onto the Kanban Task Board"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemoveTodoItem(todo.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer shrink-0"
                  title="Remove action item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
export default GeneralMeetingForm;

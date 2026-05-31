import React, { useState, useMemo } from 'react';
import { 
  Mail, 
  Trash2, 
  CheckCircle, 
  Eye, 
  Send, 
  Clock, 
  ArrowLeft, 
  Filter, 
  Sparkles, 
  History, 
  User, 
  Layers, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare, 
  Square,
  AlertTriangle
} from 'lucide-react';
import { PendingSystemNotification, DispatchedEmail, UserAccount, Subteam } from '../types';

interface BatchEmailProcessorProps {
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  pendingNotifications: PendingSystemNotification[];
  dispatchedEmails: DispatchedEmail[];
  onSendEmail: (to: string, subject: string, body: string) => void;
  onClearNotifications: (ids: string[]) => void;
  onBack: () => void;
  isDark: boolean;
  gmailAccessToken?: string | null;
  connectedGmail?: string | null;
  setGmailAccessToken?: (token: string | null) => void;
  setConnectedGmail?: (email: string | null) => void;
}

export default function BatchEmailProcessor({
  currentUser,
  accounts,
  pendingNotifications,
  dispatchedEmails,
  onSendEmail,
  onClearNotifications,
  onBack,
  isDark,
  gmailAccessToken,
  connectedGmail,
  setGmailAccessToken,
  setConnectedGmail
}: BatchEmailProcessorProps) {
  // State for alert type filters
  const [filterType, setFilterType] = useState<'all' | 'journal' | 'task'>('all');
  const [filterSubteam, setFilterSubteam] = useState<Subteam | 'all'>('all');
  
  // Custom intro comment
  const [customComment, setCustomComment] = useState('Here is our unified robotics log and daily update batch for review:');
  const [subjectPrefix, setSubjectPrefix] = useState('Consolidated Team Digest');

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  
  // Tab within the view: 'queue' or 'history'
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'history'>('queue');

  // Expanded dispatched email state for viewer
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  // Send settings
  const [selectedMentors, setSelectedMentors] = useState<string[]>(() => {
    // Initialise select all mentors / admins
    return accounts
      .filter(a => a.role === 'mentor_captain' || a.role === 'mentor' || a.role === 'captain')
      .map(a => a.schoolEmail);
  });

  // Custom Test Email State
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>('');
  const [testEmailBody, setTestEmailBody] = useState<string>('');

  const handleTestEmailDispatch = () => {
    if (!testEmailRecipient || !testEmailBody.trim()) return;
    onSendEmail(testEmailRecipient, '[FTC #6567] Direct Alert / Test', testEmailBody);
    alert(`Test email appended to outbox for ${testEmailRecipient}`);
    setTestEmailBody('');
    setTestEmailRecipient('');
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return pendingNotifications.filter(notif => {
      const matchType = filterType === 'all' || notif.type === filterType;
      const matchSubteam = filterSubteam === 'all' || notif.subteam === filterSubteam;
      return matchType && matchSubteam;
    });
  }, [pendingNotifications, filterType, filterSubteam]);

  // Initialise select-all tracking
  const allFilteredChecked = useMemo(() => {
    if (filteredNotifications.length === 0) return false;
    return filteredNotifications.every(n => selectedIds[n.id] !== false);
  }, [filteredNotifications, selectedIds]);

  const toggleSelectAll = () => {
    const newVal = !allFilteredChecked;
    const updated = { ...selectedIds };
    filteredNotifications.forEach(n => {
      updated[n.id] = newVal;
    });
    setSelectedIds(updated);
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedIds(prev => ({
      ...prev,
      [id]: prev[id] === false ? true : !prev[id]
    }));
  };

  const isNotificationChecked = (id: string) => {
    return selectedIds[id] !== false; // checked by default
  };

  // Filter out mentor history vs other logs
  const filterHistoryLogs = useMemo(() => {
    return dispatchedEmails.filter(email => 
      email.subject.includes('Consolidated') || 
      email.subject.includes('Digest') || 
      email.from === 'system-auth@roboriders-6567.edu'
    );
  }, [dispatchedEmails]);

  // Generate Digest Live Preview
  const generatedDigest = useMemo(() => {
    const checkedItems = filteredNotifications.filter(n => isNotificationChecked(n.id));
    const journals = checkedItems.filter(n => n.type === 'journal');
    const tasks = checkedItems.filter(n => n.type === 'task');

    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const subject = `[FTC #6567] ${subjectPrefix} — ${dateStr}`;

    let body = `Hello team mentors & captains,

${customComment || 'No additional commentary provided.'}

============================================================
📅 ROBORAIDERS DAILY STATUS CONSOLIDATION - ${dateStr.toUpperCase()}
============================================================

`;

    if (journals.length > 0) {
      body += `📓 JOURNAL ENTRIES AWAITING AUDIT & VETTING (${journals.length}):\n`;
      body += `------------------------------------------------------------\n`;
      journals.forEach((j, i) => {
        body += `  [${i + 1}] Submitted by: ${j.authorName} (${j.subteam})\n`;
        body += `      Action Alert: ${j.title}\n`;
        body += `      Details:\n      ${j.details.split('\n').join('\n      ')}\n\n`;
      });
    } else {
      body += `📓 JOURNAL SUBMISSIONS:\n  • No notebook logs are pending audit in this batch.\n\n`;
    }

    if (tasks.length > 0) {
      body += `📊 KANBAN WORKFLOWS & SPRINT ACHIEVEMENTS (${tasks.length}):\n`;
      body += `------------------------------------------------------------\n`;
      tasks.forEach((t, i) => {
        body += `  [${i + 1}] Update: ${t.title}\n`;
        body += `      Subteam Division: ${t.subteam}\n`;
        body += `      Changes & Progress Detail:\n      ${t.details.split('\n').join('\n      ')}\n\n`;
      });
    } else {
      body += `📊 KANBAN SPRINT UPDATES:\n  • No active task board changes recorded in this batch.\n\n`;
    }

    body += `------------------------------------------------------------
This consolidator email was processed to reduce noise. To approve journals or manage further assignments, please log in to your dashboard.

Best regards,
RoboRaiders FTC #6567 Log Engine
[Operational Handshake Active]`;

    return { subject, body, checkedItems };
  }, [filteredNotifications, selectedIds, customComment, subjectPrefix]);

  // Handle single notification deletion from queue
  const handleDeleteQueueItem = (id: string) => {
    onClearNotifications([id]);
  };

  // Dispatch unified digest
  const handleDispatchDigest = () => {
    const { subject, body, checkedItems } = generatedDigest;
    if (checkedItems.length === 0) {
      alert("No notifications are checked to consolidate. Please select at least one alert.");
      return;
    }
    if (selectedMentors.length === 0) {
      alert("Please select at least one mentor recipient.");
      return;
    }

    // Send emails to all selected mentors
    selectedMentors.forEach(mentorEmail => {
      onSendEmail(mentorEmail, subject, body);
    });

    // Clear the selected items from database
    const clearedIds = checkedItems.map(i => i.id);
    onClearNotifications(clearedIds);

    // Reset selection checkboxes
    setSelectedIds({});
    
    alert(`Success! Consolidated digest dispatched to ${selectedMentors.length} mentor(s). ${clearedIds.length} queue item(s) archived.`);
  };

  // Toggle mentor selection
  const handleToggleMentor = (email: string) => {
    if (selectedMentors.includes(email)) {
      setSelectedMentors(selectedMentors.filter(e => e !== email));
    } else {
      setSelectedMentors([...selectedMentors, email]);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 no-print" id="batch-email-processor-view">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded border border-indigo-500/30 tracking-widest leading-none">
            COMMUNICATION CONSOLIDATOR
          </span>
          <h1 className="text-xl md:text-2xl font-black uppercase text-slate-900 dark:text-slate-50 mt-1.5 tracking-tight font-display">
            Mentor Digest Processor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Buffer instant task notifications and student journal submissions into a single custom email to reduce inbox noise.
          </p>
        </div>

        <button
          onClick={onBack}
          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer font-sans"
        >
          <ArrowLeft className="w-4 h-4" /> <span>Dashboard Portal</span>
        </button>
      </div>

      {/* HORIZONTAL SYSTEM TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 mt-2">
        <button
          onClick={() => setActiveSubTab('queue')}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'queue'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Buffered Queue ({pendingNotifications.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'history'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-300'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Dispatched Archive ({filterHistoryLogs.length})</span>
        </button>
      </div>

      {activeSubTab === 'queue' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: CONFIGURATION & GENERATOR */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* GMAIL API CONNECTION BOX */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>Gmail Transmitter Status</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-sans">
                Connect your team Google account with one click to route all robotics portal communications directly through your Gmail.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${gmailAccessToken ? 'bg-emerald-500' : 'bg-amber-550'}`} />
                  <span className="font-mono text-[10.5px] font-bold text-slate-700 dark:text-slate-350">
                    {gmailAccessToken ? `Active: ${connectedGmail}` : 'Simulation Mode'}
                  </span>
                </div>
                
                {gmailAccessToken ? (
                  <div className="text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    Connected Forever
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      fetch('/api/email/status')
                        .then(res => res.json())
                        .then(data => {
                          if (data.configured) {
                            if (setGmailAccessToken && setConnectedGmail) {
                              setGmailAccessToken('server-configured');
                              setConnectedGmail(data.user);
                            }
                            alert('SMTP Connection Confirmed!');
                          } else {
                            alert('SMTP not yet configured in ENV. Set SMTP_USER and SMTP_PASS on the backend.');
                          }
                        })
                        .catch(err => {
                          console.error("SMTP status check failed:", err);
                          alert('Failed to connect to server');
                        });
                    }}
                    className="text-[9.5px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>Refresh Server Connection</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* CONSOLIDATION CONTROLS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Digest Composition</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Configure content and custom instructions to append at the beginning of the mentor team digest.
              </p>

              {/* Subject Config */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-605 dark:text-slate-400 tracking-wider mb-1">
                    Subject Prefix Line
                  </label>
                  <input
                    type="text"
                    value={subjectPrefix}
                    onChange={(e) => setSubjectPrefix(e.target.value)}
                    className="w-full text-xs font-sans px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Consolidated Team Digest"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-605 dark:text-slate-400 tracking-wider mb-1">
                    Mentor Custom Commentary
                  </label>
                  <textarea
                    rows={3}
                    value={customComment}
                    onChange={(e) => setCustomComment(e.target.value)}
                    className="w-full text-xs font-sans px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    placeholder="Enter welcome note or review requirements..."
                  />
                </div>

                {/* Recipient check List */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-605 dark:text-slate-400 tracking-wider mb-1.5">
                    Target Mentor Recipients
                  </label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto border border-slate-100 dark:border-slate-800/80 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-950/30">
                    {accounts.filter(a => a.role === 'mentor_captain' || a.role === 'mentor' || a.role === 'captain').map(mentor => {
                      const isSelected = selectedMentors.includes(mentor.schoolEmail);
                      return (
                        <label 
                          key={mentor.id} 
                          className="flex items-center gap-2 cursor-pointer text-xs font-sans p-1 hover:bg-slate-101 dark:hover:bg-slate-800 rounded transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleMentor(mentor.schoolEmail)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-505 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{mentor.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{mentor.schoolEmail}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* SEND ACTION FIELD */}
                <div className="pt-2">
                  <button
                    onClick={handleDispatchDigest}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dispatch Consolidated Digest ({generatedDigest.checkedItems.length} Alerts)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TEST EMAIL TOOL */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
                <Send className="w-4 h-4 text-cyan-500" />
                <span>Custom / Test Email</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Send a quick test email or custom alert directly to a selected team member.
              </p>
              
              <div className="space-y-3">
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-605 dark:text-slate-400 tracking-wider mb-1.5">
                      Recipient
                    </label>
                    <input
                      type="email"
                      list="team-emails"
                      value={testEmailRecipient}
                      onChange={(e) => setTestEmailRecipient(e.target.value)}
                      placeholder="Type any email or select..."
                      className="w-full text-xs font-sans px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-900 dark:text-slate-100"
                    />
                    <datalist id="team-emails">
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.schoolEmail}>{acc.name} ({acc.role})</option>
                      ))}
                    </datalist>
                </div>

                <div>
                   <label className="block text-[10px] font-black uppercase text-slate-605 dark:text-slate-400 tracking-wider mb-1">
                      Message
                    </label>
                    <textarea 
                       rows={2} 
                       className="w-full text-xs font-sans px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                       value={testEmailBody}
                       onChange={e => setTestEmailBody(e.target.value)}
                       placeholder="Enter test message payload..."
                    />
                </div>

                <div className="pt-2">
                   <button
                     onClick={handleTestEmailDispatch}
                     disabled={!testEmailRecipient || !testEmailBody.trim()}
                     className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2"
                   >
                     <Mail className="w-4 h-4" />
                     <span>Send Test Payload</span>
                   </button>
                </div>
              </div>
            </div>

            {/* LIVE CONSTRUCTED PREVIEW */}
            <div className="bg-slate-900 border border-slate-800 text-slate-110 rounded-xl p-5 shadow-sm font-mono flex-1">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  ⚡ DIGEST DISPATCH PREVIEW
                </span>
                <span className="text-[9px] bg-slate-800 text-indigo-300 font-bold px-2 py-0.5 rounded leading-none">
                  PLAIN TEXT OUTBOX
                </span>
              </div>
              
              <div className="space-y-4 text-xs font-mono select-all">
                <div>
                  <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest leading-none mb-0.5">SUBJECT STRING</p>
                  <p className="text-indigo-200 font-sans font-bold text-xs">{generatedDigest.subject}</p>
                </div>
                
                <div>
                  <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest leading-none mb-1">CONSOLIDATED MESSAGE BODY</p>
                  <pre className="whitespace-pre-wrap leading-relaxed text-indigo-50 text-[11px] max-h-80 overflow-y-auto p-3 rounded bg-slate-950 border border-slate-850/60 font-mono">
                    {generatedDigest.body}
                  </pre>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: LIVE QUEUE CONTROL */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl shadow-sm p-6 flex flex-col min-h-[500px]">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h2 className="text-md font-black uppercase text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2 font-display">
                  <span>Pending Notification Buffer</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select and verify individual alerts before packing them into the consolidated digest dispatch.
                </p>
              </div>

              {/* SELECT ALL FLAG STATUS */}
              {filteredNotifications.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-400/20 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {allFilteredChecked ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Deselect All</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Select All Filtered</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* QUEUE FILTERS */}
            <div className="flex flex-wrap gap-3 mb-4 shrink-0 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2 text-xs font-sans text-slate-500 font-bold shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Filter Queue:</span>
              </div>

              {/* Type Category Selection */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilterType('all')}
                  className={`text-[10px] font-black uppercase px-2 py-1 rounded-md transition-all cursor-pointer border ${
                    filterType === 'all'
                      ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-200 dark:border-slate-200 dark:text-slate-900'
                      : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  All ({pendingNotifications.length})
                </button>
                <button
                  onClick={() => setFilterType('journal')}
                  className={`text-[10px] font-black uppercase px-2 py-1 rounded-md transition-all cursor-pointer border flex items-center gap-1 ${
                    filterType === 'journal'
                      ? 'bg-indigo-650 border-indigo-650 text-white'
                      : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 hover:border-slate-300'
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Journals ({pendingNotifications.filter(n => n.type === 'journal').length})</span>
                </button>
                <button
                  onClick={() => setFilterType('task')}
                  className={`text-[10px] font-black uppercase px-2 py-1 rounded-md transition-all cursor-pointer border flex items-center gap-1 ${
                    filterType === 'task'
                      ? 'bg-cyan-650 border-cyan-650 text-white'
                      : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-cyan-600 dark:text-cyan-400 hover:border-slate-300'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Tasks ({pendingNotifications.filter(n => n.type === 'task').length})</span>
                </button>
              </div>

              {/* Subteam select */}
              <div className="flex-1 min-w-[120px]">
                <select
                  value={filterSubteam}
                  onChange={(e) => setFilterSubteam(e.target.value as any)}
                  className="w-full text-[10px] uppercase font-black tracking-wider bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Subteams</option>
                  <option value="Design/Build/Fabrication">Design/Build</option>
                  <option value="Programming">Programming</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Business & Media">Business &amp; Media</option>
                  <option value="Inspire">Inspire</option>
                  <option value="Strategy">Strategy</option>
                </select>
              </div>
            </div>

            {/* QUEUE CARDS LIST */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[500px]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl min-h-[300px]">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mb-2.5 animate-bounce" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Queue Is Silent &amp; Clean
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-[280px] mt-1">
                    No notifications or alert handshakes are pending digest delivery in this category. RoboRaiders is silent!
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const checkState = isNotificationChecked(notif.id);
                  const isJournal = notif.type === 'journal';
                  
                  return (
                    <div 
                      key={notif.id}
                      className={`flex gap-3 p-4 rounded-xl border transition-all ${
                        checkState 
                          ? 'bg-indigo-500/5 border-indigo-500/20 dark:bg-indigo-500/10' 
                          : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-850 opacity-60'
                      }`}
                    >
                      {/* Custom indicator checkbox */}
                      <button 
                        onClick={() => toggleSelectNotification(notif.id)}
                        className="text-slate-400 hover:text-indigo-500 cursor-pointer shrink-0 mt-0.5"
                      >
                        {checkState ? (
                          <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      {/* Content Card Detail */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest leading-none border ${
                            isJournal 
                              ? 'bg-indigo-100 border-indigo-250 text-indigo-700' 
                              : 'bg-cyan-100 border-cyan-250 text-cyan-700'
                          }`}>
                            {notif.type}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[8px] text-slate-400 uppercase tracking-widest font-mono ml-auto">
                            {notif.subteam}
                          </span>
                        </div>

                        <p className="font-bold text-xs text-slate-850 dark:text-slate-205 mt-1.5">
                          {notif.title}
                        </p>
                        
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-lg p-2 mt-2 leading-relaxed whitespace-pre-wrap font-sans border border-slate-200/40 dark:border-slate-850/40">
                          {notif.details}
                        </div>

                        <p className="text-[9px] font-mono text-slate-400 uppercase mt-2 select-none">
                          Author: <span className="font-bold text-slate-600 dark:text-slate-300">{notif.authorName}</span>
                        </p>
                      </div>

                      {/* Remove from queue trigger */}
                      <button
                        onClick={() => handleDeleteQueueItem(notif.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-500/10 shrink-0 self-start transition-all cursor-pointer"
                        title="Dismiss from queue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      ) : (
        /* ARCHIVE VIEW: DISPATCHED DIGEST LOGS */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl p-6 flex flex-col min-h-[450px]">
          
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <h2 className="text-md font-black uppercase text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2 font-display">
              <History className="w-5 h-5 text-indigo-500" />
              <span>Consolidated Digest History Logs</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit the registry of system digests and daily consolidated alerts already delivered to our team leaders.
            </p>
          </div>

          <div className="space-y-4">
            {filterHistoryLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-205 dark:border-slate-850 rounded-xl min-h-[250px]">
                <Mail className="w-10 h-10 text-slate-400 mb-2 animate-pulse" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  No Dispatched Digest Records
                </p>
                <p className="text-[10px] text-slate-400 max-w-sm mt-1">
                  Once consolidated mentor emails are generated and sent, they will appear in this audited outbox log.
                </p>
              </div>
            ) : (
              filterHistoryLogs.map((email) => {
                const isExpanded = expandedEmailId === email.id;
                
                return (
                  <div 
                    key={email.id} 
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
                  >
                    
                    {/* Header Row */}
                    <div 
                      onClick={() => setExpandedEmailId(isExpanded ? null : email.id)}
                      className="bg-slate-50 dark:bg-slate-950 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-all select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-250 leading-tight truncate">
                            {email.subject}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            To: <span className="font-bold text-slate-500">{email.to}</span> • {new Date(email.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-450 ml-auto shrink-0 font-bold uppercase font-mono">
                        <span>Details</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Email Content Body Preview */}
                    {isExpanded && (
                      <div className="p-4 bg-white dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-850">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 tracking-wider mb-2 uppercase select-none">
                          <span>Audited Email Content Log</span>
                          <span>FROM: ROBORAIDERS SERVER</span>
                        </div>
                        <pre className="text-xs p-4 bg-slate-950 text-slate-100 rounded-lg whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto max-h-96 select-all">
                          {email.body}
                        </pre>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

    </div>
  );
}

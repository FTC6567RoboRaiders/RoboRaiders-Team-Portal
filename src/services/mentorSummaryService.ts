import { JournalEntry, UserAccount } from '../types';

export interface MentorDailyDigestRecord {
  timestamp: number;
  dateStr: string;
  entriesCount: number;
  recipients: string[];
}

export interface DispatchDigestResult {
  dispatched: boolean;
  count: number;
  recipients: string[];
  dateStr: string;
  reason?: string;
}

const STORAGE_KEY = 'ftc_last_mentor_daily_summary';

/**
 * Format a human-readable date string for daily digest headers
 */
export function formatDigestDate(date = new Date()): string {
  try {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Retrieve the last dispatched daily summary record
 */
export function getLastDailyDigestRecord(): MentorDailyDigestRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Persist the record of the last dispatched digest
 */
export function saveDailyDigestRecord(record: MentorDailyDigestRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch (e) {
    console.warn('Could not save daily digest record:', e);
  }
}

/**
 * Compile and dispatch the Daily 'Pending Review' Summary digest to team mentors
 * via the application's email notification system.
 */
export function dispatchDailyMentorSummary(params: {
  allEntries: JournalEntry[];
  accounts: UserAccount[];
  sendEmail: (to: string, subject: string, body: string) => void;
  newlyAddedEntry?: JournalEntry;
}): DispatchDigestResult {
  const { allEntries, accounts, sendEmail, newlyAddedEntry } = params;

  // 1. Gather all pending entries
  // If a newly added entry is Pending Review and not yet in allEntries, include it
  const pendingMap = new Map<string, JournalEntry>();

  allEntries.forEach(e => {
    if (e.status === 'Pending Review') {
      pendingMap.set(e.id, e);
    }
  });

  if (newlyAddedEntry && newlyAddedEntry.status === 'Pending Review') {
    pendingMap.set(newlyAddedEntry.id, newlyAddedEntry);
  }

  const pendingEntries = Array.from(pendingMap.values()).sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );

  const dateStr = formatDigestDate();

  if (pendingEntries.length === 0) {
    return {
      dispatched: false,
      count: 0,
      recipients: [],
      dateStr,
      reason: 'No journal entries currently in Pending Review status.'
    };
  }

  // 2. Identify Mentor & Captain Recipients
  const mentorAccounts = accounts.filter(
    a => (a.role === 'mentor' || a.role === 'captain' || a.primarySubteam === 'Mentor') && a.schoolEmail && a.schoolEmail.trim().length > 0
  );

  const recipientEmails = Array.from(
    new Set(
      mentorAccounts.map(a => a.schoolEmail.trim().toLowerCase())
    )
  );

  // If no mentor accounts exist in database, fallback to team admin address
  if (recipientEmails.length === 0) {
    recipientEmails.push('ftc6567@gmail.com');
  }

  // 3. Compute breakdown by subteam
  const subteamCounts: Record<string, number> = {};
  pendingEntries.forEach(e => {
    const st = e.subteam || 'General';
    subteamCounts[st] = (subteamCounts[st] || 0) + 1;
  });

  const subteamSummaryList = Object.entries(subteamCounts)
    .map(([st, count]) => `  • ${st}: ${count} entr${count > 1 ? 'ies' : 'y'}`)
    .join('\n');

  // 4. Construct Itemized Digest Body
  const entryItemsFormatted = pendingEntries.map((e, index) => {
    const title = e.entryType === 'general_meeting' ? (e.title || 'General Team Meeting') : `Subteam Engineering Log`;
    const plannedSnippet = e.planned ? e.planned.replace(/\n+/g, ' ').slice(0, 140) : 'None specified';
    const accomplishedSnippet = e.accomplished ? e.accomplished.replace(/\n+/g, ' ').slice(0, 200) : 'None specified';
    const hasBlockers = e.problemsAndSolutions && e.problemsAndSolutions.length > 0 && e.problemsAndSolutions.some(p => p.trim());
    const blockerText = hasBlockers ? e.problemsAndSolutions.filter(p => p.trim()).slice(0, 2).join('; ') : 'No blockers flagged';
    const imageCount = e.images?.length || 0;

    return `[#${index + 1}] ${title} [${e.subteam}]
  • Author / Submitter: ${e.author}
  • Date of Activity: ${e.date}
  • Planned Objective: ${plannedSnippet}${plannedSnippet.length >= 140 ? '...' : ''}
  • Accomplished Summary: ${accomplishedSnippet}${accomplishedSnippet.length >= 200 ? '...' : ''}
  • Blockers / Challenges: ${blockerText}
  ${imageCount > 0 ? `• Photo Documentation: ${imageCount} image(s) attached\n` : ''}`;
  }).join('\n--------------------------------------------------\n\n');

  const subject = `[FTC #6567 Daily Digest] ${pendingEntries.length} Journal Entr${pendingEntries.length > 1 ? 'ies' : 'y'} Awaiting Mentor Review (${dateStr})`;

  const body = `ROBORAIDERS FTC TEAM #6567
DAILY JOURNAL PENDING REVIEW DIGEST
Date: ${dateStr}

Attention Team Mentors and Leadership,

A journal entry has recently been submitted to the FTC #6567 Engineering Workspace. This daily automated digest summarizes all entries currently awaiting mentor review and approval.

SUMMARY OVERVIEW:
• Total Entries Awaiting Review: ${pendingEntries.length}
• Breakdown by Subteam Division:
${subteamSummaryList}

--------------------------------------------------
PENDING SUBMISSIONS LIST:
--------------------------------------------------

${entryItemsFormatted}

--------------------------------------------------
HOW TO REVIEW & APPROVE ENTRIES:
--------------------------------------------------
1. Log in to the RoboRaiders Team Portal at: https://ais-dev-yxvo6euaneuox7ihw2urju-652237611236.us-east1.run.app
2. Navigate to "Engineering Journal" from the top navigation or click "Journal Reviews Awaiting" in the notification bell menu.
3. Filter by "Pending Review" to inspect the engineering notes, verify attendance, and validate safety protocols.
4. Click "Approve & Seal" to lock the record into the official FTC engineering notebook, or select "Return for Revision" with feedback.

Thank you for your mentorship and dedication to FTC Team #6567!

--
RoboRaiders FTC #6567 Automated Mentor Dispatch Service
Engineering Compliance & Documentation System
`;

  // 5. Dispatch email to all mentors via the system
  recipientEmails.forEach(email => {
    sendEmail(email, subject, body);
  });

  // 6. Save digest history
  const record: MentorDailyDigestRecord = {
    timestamp: Date.now(),
    dateStr,
    entriesCount: pendingEntries.length,
    recipients: recipientEmails
  };
  saveDailyDigestRecord(record);

  return {
    dispatched: true,
    count: pendingEntries.length,
    recipients: recipientEmails,
    dateStr
  };
}

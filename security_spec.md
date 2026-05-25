# Firebase Security Specification (FTC Team 6567 Workspace)

## 1. Data Invariants & Access Controls
*   **Users (`/users/{userId}`):**
    *   **Create:** Any authenticated user can draft or create their own user profile on registration, setting `status` to `Pending`.
    *   **Read:** Any authenticated user can read profiles of other members (required for team directories, leaderboards, and asignees).
    *   **Update:** A user can update their own non-sensitive field configurations. Only Capains and Mentors can elevate user `role` and swap accounts' authorized `status`.
    *   **Delete:** No users can delete account records.
*   **Engineering Logs (`/journalEntries/{entryId}`):**
    *   **Create/Write:** Authenticated users can write journals. The author's email must match the authenticated user's email.
    *   **Read:** Any authenticated member can read approved engineering journals. Drafts and pending changes are private to the author or reviewing captains/mentors.
    *   **Update:** Author can update status to draft or pending review. Reviewers (Mentors/Captains) can change status to approved/needs revision and add notes.
*   **Time Sheet Logs (`/timeEntries/{entryId}`):**
    *   **Create:** Checked-in individuals write their own hours. The `userEmail` must match the authenticated email.
    *   **Read:** Any authenticated member can read hours logs.
    *   **Update:** Non-admin can update their own entries. Mentors/Captains have wholesale administrative correction privileges.
*   **Kanban Workflow (`/kanbanTasks/{taskId}`):**
    *   **Create/Update:** Any authenticated member can create and modify tasks to support robust, collaborative sprint changes.
    *   **Read:** All authenticated members can view kanban sheets.
*   **Outreach Event Logs (`/outreachEvents/{eventId}`):**
    *   **Create/Update:** Registered contributors can record team outreach impact.
    *   **Read:** Open tracking of public team outreach.

---

## 2. The "Dirty Dozen" Security Violations (Attack Vectors)

1.  **Identity Spoofing - Profile Creation:** A malicious user creates a user profile with status `Approved` and role `mentor_captain` to bypass registration gating.
2.  **Identity Spoofing - Profile Theft:** User `victim_123` profile is updated by `hacker_456` who is not a Mentor or Captain.
3.  **Privilege Escalation:** Member `user_abc` attempts to change their own role to `captain`.
4.  **Im immutable Field Alteration:** User attempts to rewrite `createdAt` timestamp of a saved journal or time log during drift updates.
5.  **Foresight Auth Hijack - Journal Auth:** User `hacker` submits an engineering journal setting the `author` as `schen@school.edu` (Sarah's email).
6.  **Foresight Auth Hijack - Hours Auth:** User `hacker` posts a timesheet entry claiming 8 hours under `schen@school.edu`'s email.
7.  **Unverified Journal Update-Gaps:** Student attempts to self-approve their own engineering journal by sending a payload setting `status` to `Approved`.
8.  **Denial of Wallet (String Bloat):** Hacker sends a massive 1MB string inside the `title` or `taskDescription` field to exhaust database storage quota.
9.  **Relational Integrity Inconsistency:** Malicious user posts a `TimeEntry` with a negative duration or a dummy future date (`9999-99-99`).
10. **Ghost Field Injection:** Hacker attempts to update a logged timesheet adding a hidden `isVerifiedByNASA` field.
11. **Draft Leakage:** Malicious user attempts to crawl/read another user's unsubmitted `Draft` engineering journal.
12. **Anonymous Spamming:** Unauthenticated client attempts to read, write, or query collections directly.

---

## 3. Mock Test Cases (Assertion Blueprint)
The ruleset will be designed to mathematically deny these 12 cases. Every security filter will reside within helper validation utilities to ensure absolute containment.

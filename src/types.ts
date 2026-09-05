export type Subteam = 
  | 'Design/Build/Fabrication' 
  | 'Programming' 
  | 'Outreach' 
  | 'Business & Media' 
  | 'Inspire' 
  | 'Strategy'
  | 'Mentoring';

export interface JournalImage {
  id: string;
  dataUrl: string; // Base64 representation for LocalStorage saving
  name: string;
  size: number;
}

export interface JournalEntry {
  id: string;
  title?: string;
  subteam: Subteam;
  author: string;
  date: string; // YYYY-MM-DD
  planned: string;
  accomplished: string;
  problemsAndSolutions: string[]; // List of problems/solutions paragraphs which will be enumerated
  planNextTime: string;
  challenges?: string;
  nextSteps?: string;
  images: JournalImage[];
  attendees?: string[];
  createdAt: number;
  updatedAt: number;
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Needs Revision';
  reviewer?: string | null;
  reviewNotes?: string | null;
  reviewedAt?: number | null;
}

export interface FilterOptions {
  subteam: Subteam | 'All';
  author: string;
  searchQuery: string;
  startDate: string;
  endDate: string;
  status: 'All' | 'Draft' | 'Pending Review' | 'Approved' | 'Needs Revision';
}

export interface AuthorProfile {
  id: string;
  name: string;
  schoolEmail: string;
  schoolId: string; // lunch #
  primarySubteam: 'Design/Build/Fabrication' | 'Programming' | 'Outreach' | 'Business & Media' | 'Mentor' | 'Lead/Captain' | 'None';
  secondarySubteam: 'Inspire' | 'Strategy' | 'None';
  tadpoleTag?: boolean;
  leadership?: 'None' | 'Captain' | 'Subteam leader';
}

export interface UserAccount {
  id: string;
  name: string;
  schoolEmail: string;
  schoolId: string; // lunch #
  primarySubteam: 'Design/Build/Fabrication' | 'Programming' | 'Outreach' | 'Business & Media' | 'Mentor' | 'Lead/Captain' | 'None'; // Mentors can be any of these
  secondarySubteam: 'Inspire' | 'Strategy' | 'None';
  role: 'member' | 'mentor' | 'captain';
  status: 'Pending' | 'Approved' | 'Rejected';
  hasSetSecurePassword?: boolean;
  createdAt: number;
  leadership?: 'None' | 'Captain' | 'Subteam leader';
  hasCustomPassword?: boolean;
}

export interface DispatchedEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: number;
}

export interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subteam: Subteam;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationHours: number;
  taskDescription: string;
  createdAt: number;
}

export interface ClockInSession {
  startTime: number; // Epoch
  subteam: Subteam;
  taskDescription: string;
}

export type KanbanColumn = 'todo' | 'inprogress' | 'review' | 'done';

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  column: KanbanColumn;
  subteam: Subteam;
  assignedTo: string; // user name or 'Unassigned'
  priority: 'Low' | 'Medium' | 'High';
  createdAt: number;
  updatedAt: number;
  updatedBy: string; // user name
}

export interface OutreachImage {
  id: string;
  dataUrl: string;
  name: string;
  size: number;
}

export interface OutreachEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  impactMetrics: string;
  hoursLogged: number;
  participants: string[]; // names
  images: OutreachImage[];
  creatorName: string;
  creatorEmail: string;
  createdAt: number;
  updatedAt: number;
  updatedBy: string;
  reachedChildren?: number;
  reachedAdults?: number;
}

export interface XPAdjustment {
  id: string;
  userId: string;       // ID of target user getting/losing XP
  userName: string;     // Name of target user
  userEmail: string;    // Email of target user
  amount: number;       // e.g. +100 or -50
  reason: string;       // why they are getting/losing it (achievement or reason)
  awardedBy: string;    // Name of mentor/admin
  awardedByEmail: string;
  createdAt: number;    // Date timestamp
}

export interface LedgerTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'Parts & Hardware' | 'Tools & Equipment' | 'Travel & Lodging' | 'Team Registration' | 'Outreach & Marketing' | 'Food & Catering' | 'Other';
  account: 'Self-Raised Funds' | 'School Allocated Budget';
  fundingSource: 'School Direct Payment' | "Steve's Credit Card" | 'Out-of-Pocket Reimbursement' | 'Sponsor/Donation Check' | 'Other';
  paidBy: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdBy: string;
  createdByEmail: string;
  createdAt: number;
}

export type InventoryCategory =
  | 'REV Robotics Parts'
  | 'goBILDA & Motion'
  | 'Electronics & Power'
  | 'Hardware & Fasteners'
  | 'Raw Stock & Materials'
  | 'Tools & Equipment'
  | 'Game Elements & Field'
  | 'Consumables & Lab Supplies'
  | 'Other';

export type InventoryItemStatus =
  | 'In Stock'
  | 'Low Stock'
  | 'Out of Stock'
  | 'Checked Out'
  | 'Ordered'
  | 'Damaged/Repair';

export type InventoryCondition =
  | 'New'
  | 'Good'
  | 'Fair'
  | 'Damaged/Needs Repair'
  | 'Retired';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  sku?: string;
  vendor?: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  location: string;
  subArea?: string;
  status: InventoryItemStatus;
  condition: InventoryCondition;
  costPerUnit?: number;
  itemUrl?: string;
  notes?: string;
  imageUrl?: string;
  checkedOutBy?: string | null;
  checkedOutByEmail?: string | null;
  checkedOutDate?: string | null;
  checkedOutExpectedReturn?: string | null;
  checkedOutNotes?: string | null;
  createdAt: number;
  createdBy: string;
  createdByEmail: string;
  updatedAt: number;
  updatedBy: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'check_out' | 'check_in' | 'restock' | 'consume' | 'audit_adjustment' | 'damage_report';
  quantityChanged: number;
  resultingQuantity: number;
  performedBy: string;
  performedByEmail: string;
  notes?: string;
  timestamp: number;
}

export type GrantStatus = 
  | 'Researching'
  | 'Drafting'
  | 'Submitted'
  | 'Under Review'
  | 'Awarded'
  | 'Partially Awarded'
  | 'Not Awarded'
  | 'Closed';

export type GrantCategory =
  | 'Direct Funds'
  | 'Parts & Hardware Voucher'
  | 'Software License'
  | 'Travel / Registration Subsidy'
  | 'Tools & Machinery'
  | 'General Sponsorship';

export interface GrantRequirement {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  completedAt?: number;
  completedBy?: string;
}

export interface GrantApplication {
  id: string;
  name: string;
  organization: string;
  season: string;
  status: GrantStatus;
  category: GrantCategory;
  amountRequested: number;
  amountAwarded?: number;
  deadlineDate?: string;
  submissionDate?: string;
  decisionDate?: string;
  leadMemberName?: string;
  leadMemberEmail?: string;
  subteamFocus?: Subteam | 'Team-wide';
  applicationUrl?: string;
  portalLoginNotes?: string;
  description?: string;
  requirements: GrantRequirement[];
  notes?: string;
  postAwardReportRequired?: boolean;
  postAwardReportDeadline?: string;
  postAwardReportCompleted?: boolean;
  syncedToLedger?: boolean;
  ledgerTransactionId?: string;
  createdAt: number;
  createdBy: string;
  createdByEmail: string;
  updatedAt: number;
  updatedBy: string;
}





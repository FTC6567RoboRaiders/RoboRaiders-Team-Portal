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
  subteam: Subteam;
  author: string;
  date: string; // YYYY-MM-DD
  planned: string;
  accomplished: string;
  problemsAndSolutions: string[]; // List of problems/solutions paragraphs which will be enumerated
  planNextTime: string;
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
  role: 'member' | 'mentor_captain' | 'mentor' | 'captain';
  status: 'Pending' | 'Approved' | 'Rejected';
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




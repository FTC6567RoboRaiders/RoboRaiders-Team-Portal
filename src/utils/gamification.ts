import { JournalEntry, TimeEntry, UserAccount, KanbanTask, OutreachEvent, XPAdjustment } from '../types';
import { getSubteamStatsAndRank } from '../data/subteamRanks';

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'build' | 'code' | 'chronicler' | 'community' | 'general' | 'special';
  icon: string; // lucide icon identifier
  unlocked: boolean;
  progress: number; // 0 to 100
  reqText: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  targetCount: number;
  currentCount: number;
  unlocked: boolean;
  xpReward: number;
  icon: string;
}

export interface UserStats {
  xp: number;
  level: number;
  levelName: string;
  xpIntoLevel: number;
  xpForNextLevel: number;
  percentToNextLevel: number;
  badgesUnlocked: number;
  totalHours: number;
  totalJournals: number;
  subteamHours: { [subteam: string]: number };
}

// Calculate journal entry quality on a scale of 0 to 100
export const calculateJournalQualityScore = (entry: JournalEntry): number => {
  let score = 0;

  // 1. Density and word count of descriptive technical texts (planned + accomplished + foresight) (up to 40 pts)
  const fullText = (entry.planned || '') + ' ' + (entry.accomplished || '') + ' ' + (entry.planNextTime || '');
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 150) {
    score += 40;
  } else if (wordCount >= 85) {
    score += 25;
  } else if (wordCount >= 30) {
    score += 12;
  } else if (wordCount >= 10) {
    score += 5;
  }

  // 2. Structured Problems and Solutions section (up to 25 pts)
  const problemsCount = entry.problemsAndSolutions?.length || 0;
  if (problemsCount >= 2) {
    score += 25;
  } else if (problemsCount === 1) {
    score += 15;
  }

  // 3. Documented proof/images (up to 20 pts)
  const imagesCount = entry.images?.length || 0;
  if (imagesCount >= 2) {
    score += 20;
  } else if (imagesCount === 1) {
    score += 10;
  }

  // 4. Planning depth and actionable next targets (up to 15 pts)
  const nextTargetWords = (entry.planNextTime || '').split(/\s+/).filter(Boolean).length;
  if (nextTargetWords >= 20) {
    score += 15;
  } else if (nextTargetWords >= 10) {
    score += 6;
  }

  return score;
};

// Calculate levels based on standard RPG curves
export const getLevelInfo = (xp: number) => {
  const thresholds = [
    0,      // Level 0: 0+
    100,    // Level 1: 100+
    250,    // Level 2: 250+
    450,    // Level 3: 450+
    700,    // Level 4: 700+
    1000,   // Level 5: 1000+
    1400,   // Level 6: 1400+
    1900,   // Level 7: 1900+
    2500,   // Level 8: 2500+
    3200,   // Level 9: 3200+
    4000,   // Level 10: 4000+
    5000,   // Level 11: 5000+
    6200,   // Level 12: 6200+
    7600,   // Level 13: 7600+
    9200    // Level 14: 9200+
  ];
  const levelNames = [
    'Rookie Safety Trainee', // Level 0 (0 XP)
    'Robotics Apprentice',    // Level 1 (100 XP)
    'Chassis Assembler',     // Level 2 (250 XP)
    'Drivebase Installer',   // Level 3 (450 XP)
    'Autonomous Developer',   // Level 4 (700 XP)
    'Wiring Specialist',     // Level 5 (1000 XP)
    'Sensor Integrator',     // Level 6 (1400 XP)
    'Mechanisms Architect',  // Level 7 (1900 XP)
    'Control Loop Maestro',  // Level 8 (2500 XP)
    'Strategic Tactician',   // Level 9 (3200 XP)
    'Technical Director',    // Level 10 (4000 XP)
    'RoboRaiders Legend',    // Level 11 (5000 XP)
    'FTC World Finalist',    // Level 12 (6200 XP)
    'Dean\'s List Nominee',  // Level 13 (7600 XP)
    'FIRST Champion'         // Level 14 (9200 XP)
  ];

  let level = 1;
  while (level < thresholds.length && xp >= thresholds[level]) {
    level++;
  }
  level = level - 1; // back to actual index

  const currentThreshold = thresholds[level] || 0;
  const nextThreshold = thresholds[level + 1] || (currentThreshold + 1500);
  
  const xpIntoLevel = xp - currentThreshold;
  const xpForNextLevel = nextThreshold - currentThreshold;
  const percentToNextLevel = level >= levelNames.length - 1 
    ? 100 
    : Math.min(100, Math.max(0, Math.floor((xpIntoLevel / xpForNextLevel) * 100)));

  return {
    level,
    levelName: levelNames[level] || 'RoboRaiders Legend',
    xpIntoLevel,
    xpForNextLevel,
    percentToNextLevel
  };
};

export const isSignupBonus = (reason: string | undefined): boolean => {
  if (!reason) return false;
  const lower = reason.toLowerCase();
  return (
    lower.includes('sign up') ||
    lower.includes('signup') ||
    lower.includes('sign-up') ||
    lower.includes('registration bonus') ||
    lower.includes('welcome bonus') ||
    (lower.includes('welcome') && lower.includes('50'))
  );
};

export const computeUserGamification = (
  user: UserAccount,
  entries: JournalEntry[],
  timeEntries: TimeEntry[],
  kanbanTasks?: KanbanTask[],
  outreachEvents?: OutreachEvent[],
  xpAdjustments?: XPAdjustment[]
): { stats: UserStats; badges: Badge[]; quests: Quest[] } => {
  const email = user.schoolEmail.toLowerCase();
  
  // Filter for user-specific logs
  const userJournals = entries.filter(e => 
    e.author.toLowerCase().includes(email) || 
    e.author.toLowerCase().includes(user.name.toLowerCase())
  );
  
  const userHours = timeEntries.filter(t => 
    t.userEmail.toLowerCase() === email
  );

  // Subteam stats
  const subteamHours: { [subteam: string]: number } = {};
  userHours.forEach(t => {
    subteamHours[t.subteam] = (subteamHours[t.subteam] || 0) + t.durationHours;
  });

  // Calculate quality-driven XP
  // 10 XP per hour of lab attendance
  const hoursXp = Math.floor(userHours.reduce((sum, h) => sum + h.durationHours, 0) * 10);
  
  // 50 XP per Journal Entry published + actual quality score bonus (0 to 105 XP)
  const journalCountXp = userJournals.length * 50;
  
  // Award full quality points directly as extra XP
  const qualityScores = userJournals.map(j => calculateJournalQualityScore(j));
  const qualityXpBonus = Math.floor(qualityScores.reduce((sum, score) => sum + score, 0));

  // 120 XP extra per Approved Journal Entry
  const approvedJournalXp = userJournals.filter(j => j.status === 'Approved').length * 120;
  
  // 15 XP per image attached
  const imagesCount = userJournals.reduce((sum, j) => sum + (j.images?.length || 0), 0);
  const imageXp = imagesCount * 15;

  // Completed Kanban Tasks no longer award XP
  const kanbanXp = 0;

  // 50 XP per Outreach Event participated in
  const participatedOutreach = (outreachEvents || []).filter(ev => 
    ev.participants?.some(p => 
      p.toLowerCase() === user.name.toLowerCase() || 
      p.toLowerCase() === user.schoolEmail.toLowerCase()
    )
  );
  const outreachXp = participatedOutreach.length * 50;

  // Manual adjustments from Mentors/Admins
  const userAdjustments = (xpAdjustments || []).filter(adj => 
    (adj.userId === user.id || adj.userEmail.toLowerCase() === email) && !isSignupBonus(adj.reason)
  );
  const manualXp = userAdjustments.reduce((sum, adj) => sum + adj.amount, 0);

  const totalXp = Math.max(0, hoursXp + journalCountXp + qualityXpBonus + approvedJournalXp + imageXp + kanbanXp + outreachXp + manualXp); // base sign up + kanban removed!

  const totalHours = userHours.reduce((sum, h) => sum + h.durationHours, 0);
  const totalJournals = userJournals.length;

  const levelInfo = getLevelInfo(totalXp);

  // Define Achievements / Badges list
  const initialBadges: Omit<Badge, 'unlocked' | 'progress'>[] = [
    // --- 1. General & Intro ---
    {
      id: "first_spark",
      name: "First Spark",
      description: "Submit your very first log entry or active laboratory hours shift.",
      category: "general",
      icon: "Sparkles",
      reqText: "1 Contribution of any type"
    },
    // --- 2. Heavy Subteam Builders ---
    {
      id: "iron_grip",
      name: "Iron Shaper",
      description: "Log at least 5.0 hours of physical building, chassis adjustments, or hardware fabrication.",
      category: "build",
      icon: "Wrench",
      reqText: "5h Build time"
    },
    {
      id: "code_guru",
      name: "Assembly Compiler",
      description: "Log at least 5.0 hours of autonomous programming, road-runner debugging, or PID tuning.",
      category: "code",
      icon: "Cpu",
      reqText: "5h Programming"
    },
    {
      id: "notebook_scribe",
      name: "Supreme Chronicler",
      description: "Write at least 3 detailed journal entries to preserve the team memory index.",
      category: "chronicler",
      icon: "BookOpen",
      reqText: "3 Journal entries"
    },
    // --- 3. Shifting & Time Patterns ---
    {
      id: "heavy_shifter",
      name: "Midnight Oil",
      description: "Complete an intensive laboratory session exceeding 3.5 direct hours to push critical milestones.",
      category: "special",
      icon: "Clock",
      reqText: "Single shift limit >= 3.5 hrs"
    },
    {
      id: "shutterbug",
      name: "CAD Shutterbug",
      description: "Include a mechanical assembly layout or software graph with your journal entries.",
      category: "special",
      icon: "FileUp",
      reqText: "At least 1 image uploaded"
    },
    {
      id: "community_bridge",
      name: "Impact Vandal",
      description: "Log a narrative regarding Outreach, Inspire, or community/business actions.",
      category: "community",
      icon: "Globe",
      reqText: "1 Inspire/Outreach entry"
    },
    {
      id: "peer_reviewer",
      name: "Seal of Quality",
      description: "Have at least two of your log publications fully approved by Lead Mentors.",
      category: "general",
      icon: "CheckCircle",
      reqText: "2 Approved logs"
    },
    // --- 4. Quality & Detailed Documentation ---
    {
      id: "diligent_logger",
      name: "Precision Recordist",
      description: "Publish an engineering journal entry scoring a Quality Index of 80% or greater.",
      category: "chronicler",
      icon: "Award",
      reqText: "Log quality rating >= 80"
    },
    {
      id: "novel_writer",
      name: "Literary Architect",
      description: "Dive deep into technical specifications with a journal entry exceeding 150 total words.",
      category: "chronicler",
      icon: "FileCode",
      reqText: "Entry size >= 150 words"
    },
    {
      id: "perfectionist",
      name: "Master Draftsman",
      description: "Compose a beautiful, full-structure log filling planned, accomplished, next-steps, and problems.",
      category: "chronicler",
      icon: "CheckCircle2",
      reqText: "All log text fields well detailed"
    },
    // --- 5. Hard Work & Density ---
    {
      id: "lab_rat",
      name: "Laboratory Fixture",
      description: "Log a serious density of hours inside the workshop space (12.0+ hours cumulative).",
      category: "general",
      icon: "Compass",
      reqText: "12 hours in workspace"
    },
    {
      id: "double_agent",
      name: "Bilateral Thinker",
      description: "Support multiple subteams by logging hours or records in at least 2 distinct areas.",
      category: "special",
      icon: "Layers",
      reqText: "2+ distinct logged subteams"
    },
    {
      id: "debugger",
      name: "Loop Solver",
      description: "Identify, analyze, and document at least 2 mechanical bugs and their solutions in your entries.",
      category: "code",
      icon: "AlertTriangle",
      reqText: "2+ Problems logged"
    },
    // --- 6. Chronos Time Clocks ---
    {
      id: "early_bird",
      name: "Dawn Patrol",
      description: "Start making progress in the mornings - log lab hours starting before 11:00 AM.",
      category: "special",
      icon: "Sun",
      reqText: "Shift In before 11:00 AM"
    },
    {
      id: "night_owl",
      name: "Lantern Spark",
      description: "Stay late to polish code or test mechanisms - log lab hours extending past midnight or 6:00 PM.",
      category: "special",
      icon: "Moon",
      reqText: "Shift Out past 6:00 PM"
    },
    {
      id: "streak_3",
      name: "Persistent Tinkerer",
      description: "Maintain progress momentum by checking in or logging entries on 3 or more distinct calendar days.",
      category: "general",
      icon: "Calendar",
      reqText: "3+ distinct dates active"
    },
    // --- 7. Collaboration & Scribes ---
    {
      id: "speedy_logger",
      name: "Agile Chronicler",
      description: "Successfully bridge physical hours with formal notebooks (1+ journal, 2+ laboratory hours).",
      category: "general",
      icon: "Briefcase",
      reqText: "1+ log and 2h+ lab time"
    },
    {
      id: "team_first",
      name: "Alliance Member",
      description: "Acknowledge team support by referencing pairs, mentors, or collaboration in your logs.",
      category: "community",
      icon: "Users",
      reqText: "Acknowledge team pairing"
    },
    {
      id: "lead_author",
      name: "Chief Scribe",
      description: "Author 5 or more journal logs.",
      category: "chronicler",
      icon: "Database",
      reqText: "5+ written entries"
    },
    // --- 8. Specific subteams and items ---
    {
      id: "safety_officer",
      name: "Safety Marshal",
      description: "Explicitly reference safety checklists, eye goggles, or shielding in your log writeups.",
      category: "build",
      icon: "ShieldCheck",
      reqText: "Mention safety/goggles"
    },
    {
      id: "mechanic",
      name: "Gear Shifter",
      description: "Log hardware interactions involving motors, planetary gearboxes, wheels, or servos.",
      category: "build",
      icon: "Settings",
      reqText: "Mention gear/motor/servo"
    },
    {
      id: "multimedia",
      name: "Visual Scribe",
      description: "Upload a journal entry containing 2 or more CAD schematics, photographs, or progress drawings.",
      category: "chronicler",
      icon: "FileUp",
      reqText: "2+ images uploaded"
    },
    {
      id: "veteran",
      name: "Diamond Division",
      description: "Accumulate at least 1,500 total XP across all engineering and outreach actions.",
      category: "general",
      icon: "Award",
      reqText: "Total 1500 XP"
    }
  ];

  // Evaluate each of the 24 badges
  const evaluatedBadges: Badge[] = initialBadges.map(b => {
    let unlocked = false;
    let progress = 0;

    switch (b.id) {
      case "first_spark":
        unlocked = totalJournals > 0 || totalHours > 0;
        progress = unlocked ? 100 : 0;
        break;
      case "iron_grip":
        const buildHours = subteamHours['Design/Build/Fabrication'] || 0;
        unlocked = buildHours >= 5;
        progress = Math.min(100, Math.floor((buildHours / 5) * 100));
        break;
      case "code_guru":
        const progHours = subteamHours['Programming'] || 0;
        unlocked = progHours >= 5;
        progress = Math.min(100, Math.floor((progHours / 5) * 100));
        break;
      case "notebook_scribe":
        unlocked = totalJournals >= 3;
        progress = Math.min(100, Math.floor((totalJournals / 3) * 100));
        break;
      case "heavy_shifter":
        unlocked = userHours.some(h => h.durationHours >= 3.5);
        progress = unlocked ? 100 : 0;
        break;
      case "shutterbug":
        unlocked = imagesCount >= 1;
        progress = unlocked ? 100 : 0;
        break;
      case "community_bridge":
        unlocked = userJournals.some(j => j.subteam === 'Outreach' || j.subteam === 'Inspire' || j.subteam === 'Business & Media');
        progress = unlocked ? 100 : 0;
        break;
      case "peer_reviewer":
        const approvedCount = userJournals.filter(j => j.status === 'Approved').length;
        unlocked = approvedCount >= 2;
        progress = Math.min(100, Math.floor((approvedCount / 2) * 100));
        break;
      case "diligent_logger":
        const highestPrScore = qualityScores.length > 0 ? Math.max(...qualityScores) : 0;
        unlocked = highestPrScore >= 80;
        progress = Math.min(100, Math.floor((highestPrScore / 80) * 100));
        break;
      case "novel_writer":
        const maxWords = userJournals.map(j => ((j.planned || '') + ' ' + (j.accomplished || '')).split(/\s+/).filter(Boolean).length);
        const highestWords = maxWords.length > 0 ? Math.max(...maxWords) : 0;
        unlocked = highestWords >= 150;
        progress = Math.min(100, Math.floor((highestWords / 150) * 100));
        break;
      case "perfectionist":
        unlocked = userJournals.some(j => (j.planned || '').trim().length > 15 && (j.accomplished || '').trim().length > 15 && (j.planNextTime || '').trim().length > 15 && (j.problemsAndSolutions?.length || 0) >= 1);
        progress = unlocked ? 100 : 0;
        break;
      case "lab_rat":
        unlocked = totalHours >= 12;
        progress = Math.min(100, Math.floor((totalHours / 12) * 100));
        break;
      case "double_agent":
        const distinctSubteams = Object.keys(subteamHours).length;
        unlocked = distinctSubteams >= 2;
        progress = Math.min(100, Math.floor((distinctSubteams / 2) * 100));
        break;
      case "debugger":
        const problemEntries = userJournals.filter(j => (j.problemsAndSolutions?.length || 0) >= 1).length;
        // solved if they have either written 2 separate entries with problems, or scored problems count
        const totalProblemsDocs = userJournals.reduce((sum, j) => sum + (j.problemsAndSolutions?.length || 0), 0);
        unlocked = totalProblemsDocs >= 2;
        progress = Math.min(100, Math.floor((totalProblemsDocs / 2) * 100));
        break;
      case "early_bird":
        unlocked = userHours.some(h => {
          const hr = parseInt(h.startTime.split(':')[0], 10);
          return !isNaN(hr) && hr < 11;
        });
        progress = unlocked ? 100 : 0;
        break;
      case "night_owl":
        unlocked = userHours.some(h => {
          const hr = parseInt(h.endTime.split(':')[0], 10);
          return !isNaN(hr) && hr >= 18;
        });
        progress = unlocked ? 100 : 0;
        break;
      case "streak_3":
        const uniqueDates = Array.from(new Set(userHours.map(h => h.date))).length;
        unlocked = uniqueDates >= 3;
        progress = Math.min(100, Math.floor((uniqueDates / 3) * 100));
        break;
      case "speedy_logger":
        unlocked = totalJournals >= 1 && totalHours >= 2;
        progress = totalJournals >= 1 ? Math.min(100, Math.floor((totalHours / 2) * 100)) : 0;
        break;
      case "team_first":
        unlocked = userJournals.some(j => {
          const text = (j.accomplished || '').toLowerCase();
          return text.includes('with ') || text.includes('helped') || text.includes('team') || text.includes('pair');
        });
        progress = unlocked ? 100 : 0;
        break;
      case "lead_author":
        unlocked = totalJournals >= 5;
        progress = Math.min(100, Math.floor((totalJournals / 5) * 100));
        break;
      case "safety_officer":
        unlocked = userJournals.some(j => {
          const text = (j.accomplished || '').toLowerCase();
          return text.includes('safety') || text.includes('goggles') || text.includes('shield');
        });
        progress = unlocked ? 100 : 0;
        break;
      case "mechanic":
        unlocked = userJournals.some(j => {
          const text = (j.accomplished || '').toLowerCase();
          return text.includes('gear') || text.includes('motor') || text.includes('wheel') || text.includes('servo') || text.includes('chassis');
        });
        progress = unlocked ? 100 : 0;
        break;
      case "multimedia":
        const maxImages = userJournals.map(j => j.images?.length || 0);
        const highestImages = maxImages.length > 0 ? Math.max(...maxImages) : 0;
        unlocked = highestImages >= 2;
        progress = Math.min(100, Math.floor((highestImages / 2) * 100));
        break;
      case "veteran":
        unlocked = totalXp >= 1500;
        progress = Math.min(100, Math.floor((totalXp / 1500) * 100));
        break;
    }

    return {
      ...b,
      unlocked,
      progress
    } as Badge;
  });

  // --- 25. Determine All-Unlocked "How Did We Get Here?" Secret Badge ---
  const initialUnlockedCount = evaluatedBadges.filter(b => b.unlocked).length;
  const isSecretUnlocked = initialUnlockedCount >= 24; // 24 badges fully unlocked
  const secretProgress = Math.floor((initialUnlockedCount / 24) * 100);

  const secretBadge: Badge = {
    id: "how_did_we_get_here",
    name: "How Did We Get Here?",
    description: "The absolute zenith of FTC documentation: Unlock all 24 initial badges on the achievement board.",
    category: "general",
    icon: "Compass", // Use a gorgeous icon!
    unlocked: isSecretUnlocked,
    progress: secretProgress,
    reqText: "Unlock 24 other achievements"
  };

  // Add the 25th badge to the array!
  const finalBadges = [...evaluatedBadges, secretBadge];

  // Align team members ranks with the defined ranks from spreadsheet
  const isMentorUser = user.role === 'mentor_captain' || user.role === 'mentor';
  
  // Only mentors can align to Mentoring. Non-mentors align to standard student subteams.
  let userSubteam: string = user.primarySubteam;
  if (isMentorUser) {
    userSubteam = 'Mentoring';
  } else {
    if (userSubteam === 'None' || userSubteam === 'Mentor' || (userSubteam as string) === 'Lead/Captain' || userSubteam === 'Mentoring') {
      userSubteam = 'Design/Build/Fabrication';
    }
  }
  
  // For mentors, count hours from all subteams or Mentoring if logged specifically
  const guildHours = isMentorUser ? totalHours : (subteamHours[userSubteam] || 0);
  const guildJournals = isMentorUser ? userJournals.length : userJournals.filter(e => e.subteam === userSubteam).length;
  
  const subStats = getSubteamStatsAndRank(userSubteam, guildHours, guildJournals, user.role, totalXp);

  const subteamThresholds = userSubteam === 'Mentoring'
    ? [0, 100, 300, 600, 1000, 1600, 2500, 3800, 5500, 7500, 10000, 11000, 12100, 13300, 14600, 16000, 17500, 19100, 20800, 22600, 24500, 26500, 28600, 30800, 33200]
    : [0, 100, 300, 600, 1000, 1600, 2500, 3800, 5500, 7500, 10000];

  const rIdx = subStats.rankIndex; // 0 to 24 for mentors, 0 to 10 for students
  const currThreshold = subteamThresholds[rIdx] !== undefined ? subteamThresholds[rIdx] : 0;
  const nextThreshold = subteamThresholds[rIdx + 1] !== undefined ? subteamThresholds[rIdx + 1] : currThreshold;
  const subXpIntoLevel = subStats.points - currThreshold;
  const subXpForNextLevel = nextThreshold - currThreshold;

  const stats: UserStats = {
    xp: totalXp,
    level: subStats.currentRank.rank,
    levelName: subStats.currentRank.title,
    xpIntoLevel: subXpIntoLevel,
    xpForNextLevel: subXpForNextLevel <= 0 ? 100 : subXpForNextLevel,
    percentToNextLevel: subStats.percentToNext,
    badgesUnlocked: finalBadges.filter(b => b.unlocked).length,
    totalHours,
    totalJournals,
    subteamHours
  };

  // Define challenges or Daily/Weekly quests
  const quests: Quest[] = [
    {
      id: "quest_active_mech",
      name: "Hardware Sync",
      description: "Accumulate 4.0 total laboratory hours to unlock hardware level-ups.",
      targetCount: 4,
      currentCount: Math.min(4, Math.round(totalHours * 10) / 10),
      unlocked: totalHours >= 4,
      xpReward: 100,
      icon: "Wrench"
    },
    {
      id: "quest_journal_depth",
      name: "Detailing Problem Loops",
      description: "Add a Journal log that explicitly outlines complex mechanical or software challenges.",
      targetCount: 1,
      currentCount: userJournals.some(j => (j.problemsAndSolutions?.length || 0) > 0) ? 1 : 0,
      unlocked: userJournals.some(j => (j.problemsAndSolutions?.length || 0) > 0),
      xpReward: 80,
      icon: "AlertTriangle"
    },
    {
      id: "quest_multidiscipliner",
      name: "Renaissance Tinkerer",
      description: "Log active hours across any 2 or more distinct subteam areas.",
      targetCount: 2,
      currentCount: Object.keys(subteamHours).length,
      unlocked: Object.keys(subteamHours).length >= 2,
      xpReward: 120,
      icon: "Layers"
    },
    {
      id: "quest_pioneer",
      name: "Flawless Documentation",
      description: "Get at least one high-fidelity journal entry fully Approved by your mentor.",
      targetCount: 1,
      currentCount: userJournals.some(j => j.status === 'Approved') ? 1 : 0,
      unlocked: userJournals.some(j => j.status === 'Approved'),
      xpReward: 150,
      icon: "Award"
    }
  ];

  return {
    stats,
    badges: finalBadges,
    quests
  };
};

export interface SubteamRank {
  rank: number;
  title: string;
  explanation: string;
}

export interface SubteamGuild {
  id: string;
  name: string;
  codename: string;
  color: string;
  icon: string;
  ranks: SubteamRank[];
}

export const SUBTEAM_GUILDS: SubteamGuild[] = [
  {
    id: 'Design/Build/Fabrication',
    name: 'Build (The Hardware Havoc)',
    codename: 'The Hardware Havoc',
    color: 'slate',
    icon: 'Wrench',
    ranks: [
      {
        rank: 1,
        title: 'The Zip-Tie Zealot',
        explanation: 'Believes that 90% of the robot can (and should) be held together by plastic tension bands.'
      },
      {
        rank: 2,
        title: 'Lord of the Stripped Screws',
        explanation: 'Has a personal graveyard of hex screws that will never, ever be uninstalled again.'
      },
      {
        rank: 3,
        title: 'Keeper of the 10-32 Hex Key',
        explanation: 'The only person in the lab who knows where the single functioning 3/32" Allen wrench is hidden.'
      },
      {
        rank: 4,
        title: 'The Dremel Surgeon',
        explanation: 'Cuts through structural aluminum channel like butter, often with sparks flying dangerously close to their eyebrows.'
      },
      {
        rank: 5,
        title: 'Chief Weight-Limit Worrier',
        explanation: 'Constantly weighing the robot on a postal scale, sweating over that final 0.1 lbs.'
      },
      {
        rank: 6,
        title: 'The Duct Tape Engineer',
        explanation: "Temporary repairs become permanent solutions. 'If it moves and shouldn't: duct tape.'"
      },
      {
        rank: 7,
        title: 'Professional CAD Crasher',
        explanation: 'Can render complex structures in Onshape, but excels at freezing the browser tab with 500-part assemblies.'
      },
      {
        rank: 8,
        title: 'The Loose-Bolt Hunter',
        explanation: 'Can hear a loose locknut vibrating from three rooms away. The mortal enemy of high acceleration.'
      },
      {
        rank: 9,
        title: 'Human Grease Accumulator',
        explanation: 'Hands are permanently stained with WD-40 and gearbox grease. White t-shirts are strictly forbidden.'
      },
      {
        rank: 10,
        title: "The \"It'll Hold\" Optimist",
        explanation: "Pronounces every sketchy mechanical joint 'alliance-ready' after one solid kick."
      },
      {
        rank: 11,
        title: 'Master Tadpole',
        explanation: 'The ultimate biological engineer of mechanics. Highly secret, legendary, and entirely aquatic.'
      }
    ]
  },
  {
    id: 'Programming',
    name: 'Programming (The Code Cult)',
    codename: 'The Code Cult',
    color: 'cyan',
    icon: 'Cpu',
    ranks: [
      {
        rank: 1,
        title: 'The print("here") Prophet',
        explanation: 'Debugs the autonomous routine entirely via serial terminal prints on line 247.'
      },
      {
        rank: 2,
        title: 'High Priest of Git Merges',
        explanation: 'Only person trusted to resolve conflicts without deleting the entire repository.'
      },
      {
        rank: 3,
        title: 'The Autonomous Architect',
        explanation: 'Designs complicated 30-second path planning routines that run beautifully in simulation, and crash instantly on tile.'
      },
      {
        rank: 4,
        title: 'The PID Loop Whisperer',
        explanation: 'Stands over the robot chanting floating-point numbers to stabilize proportional-integral-derivative values.'
      },
      {
        rank: 5,
        title: 'Scribe of the "Wait" Command',
        explanation: 'Fixes race conditions by putting sleep(150) threads everywhere. Synchronic timing is for cowards.'
      },
      {
        rank: 6,
        title: 'The Firmware Philosopher',
        explanation: 'Spends hours questioning if the sensor is actually broken, or if reality itself is asynchronous.'
      },
      {
        rank: 7,
        title: 'The Syntax Error Detective',
        explanation: 'Spends two hours searching for a missing semicolon, only to find they were editing the wrong class folder.'
      },
      {
        rank: 8,
        title: 'The Battery Voltage Skeptic',
        explanation: 'Blames every autonomous failure and path drift on the main expansion hub battery falling below 12.8 volts.'
      },
      {
        rank: 9,
        title: 'The Coffee-to-Code Converter',
        explanation: 'Transforms massive quantities of caffeine into highly questionable, uncommented telemetry loops.'
      },
      {
        rank: 10,
        title: 'The "It Worked on My Laptop" Guy',
        explanation: "Believes external hardware and physical friction are just implementation details that shouldn't affect pure logic."
      },
      {
        rank: 11,
        title: 'The Human Rubber Duck',
        explanation: 'Talks to a plastic yellow duck to debug active threading blocks. The duck usually understands it better.'
      }
    ]
  },
  {
    id: 'Business & Media',
    name: 'Business & Media (The Corporate Machine)',
    codename: 'The Corporate Machine',
    color: 'emerald',
    icon: 'Briefcase',
    ranks: [
      {
        rank: 1,
        title: 'The CEO of a $0 Revenue Startup',
        explanation: "Writes professional pitch decks and emails with 'Best Regards' but operates with an absolute zero budget."
      },
      {
        rank: 2,
        title: 'Master of the "Inspiration" Board',
        explanation: 'Maintains a Pinterest-level collection of layout templates, logo concepts, and color themes.'
      },
      {
        rank: 3,
        title: 'The Canva Wizard',
        explanation: 'Can whip up a pristine sponsor-appreciation post or a custom team banner in under 120 seconds using templates.'
      },
      {
        rank: 4,
        title: 'The Grant Writing Ghostwriter',
        explanation: "Drafts eloquent, multi-page business proposals using terms like 'leveraging synergistic engineering modalities'."
      },
      {
        rank: 5,
        title: 'The Social Media Influencer',
        explanation: 'Begs the build team to stop working for 5 seconds to film a TikTok of the robot spinning out of control.'
      },
      {
        rank: 6,
        title: 'The Spreadsheet Stalker',
        explanation: 'Keeps a detailed register of every single nut, bolt, and zip-tie purchased, down to the exact sub-cent margin.'
      },
      {
        rank: 7,
        title: 'Keeper of the Team Aesthetic',
        explanation: 'Polices the lab to make sure the brand fonts and official team orange are never misrepresented.'
      },
      {
        rank: 8,
        title: 'The Sponsorship Beggar',
        explanation: 'Cold-calls local engineering firms asking for money, machinery, or free sandwiches for Saturday builds.'
      },
      {
        rank: 9,
        title: 'The T-Shirt Design Dictator',
        explanation: 'Decides exactly who gets which size, and strictly forbids altering the positioning of the main logo block.'
      },
      {
        rank: 10,
        title: 'The Engineering Notebook Slave',
        explanation: 'Spends 14-hour sessions translating build chaos into beautifully styled, judge-pleasing documentation grids.'
      },
      {
        rank: 11,
        title: 'The Tax-Exempt Status Shaman',
        explanation: 'Holds the sacred power of 501(c)(3) documentation and legal team entity structures.'
      }
    ]
  },
  {
    id: 'Outreach',
    name: 'Outreach (The PR Evangelists)',
    codename: 'The PR Evangelists',
    color: 'amber',
    icon: 'Globe',
    ranks: [
      {
        rank: 1,
        title: 'The Professional Handshaker',
        explanation: 'Has achieved the perfect level of firm eye-contact and grip density required to impress FTC judges.'
      },
      {
        rank: 2,
        title: 'The Mayor’s Best Friend',
        explanation: 'Enthusiastically schedules school district presentations and local civic parade partnerships.'
      },
      {
        rank: 3,
        title: 'Chief Impact Officer',
        explanation: 'Measures success solely by the number of young kids who smiled when touching the robot intake.'
      },
      {
        rank: 4,
        title: 'The STEM Missionary',
        explanation: 'Spends weekends teaching middle schoolers how to build LEGO gearboxes and simple battery controllers.'
      },
      {
        rank: 5,
        title: 'The Booth Hype-Man',
        explanation: 'Stands in front of the team pit at championships calling people over like a structural carnival barker.'
      },
      {
        rank: 6,
        title: 'The Scout Master',
        explanation: 'Walks around the arena collecting strategic intelligence and alliance options with a heavily marked clipboard.'
      },
      {
        rank: 7,
        title: 'The Compassionate Networker',
        explanation: 'Graciouly offers extra hub components to other teams while secretly assessing their defense capability.'
      },
      {
        rank: 8,
        title: 'The "Gracious Professionalism" Cop',
        explanation: 'Politely reminds teammates to keep their safety glasses on and avoid yelling at autonomous slips.'
      },
      {
        rank: 9,
        title: 'The Robot Transport Specialist',
        explanation: 'The master of moving the 42-pound heavy cart through crowded stadium hallways without breaking things.'
      },
      {
        rank: 10,
        title: 'The Professional Small-Talker',
        explanation: 'Can easily talk to anyone for 45 minutes about a robot gripper mechanism they have never physically touched.'
      },
      {
        rank: 11,
        title: 'The LinkedIn Overlord',
        explanation: 'Has 500+ connections and posts daily updates tagging FIRST executives and project sponsors.'
      }
    ]
  },
  {
    id: 'Mentoring',
    name: 'Mentoring (The Advisory Board)',
    codename: 'The Wise Sages',
    color: 'rose',
    icon: 'ShieldCheck',
    ranks: [
      {
        rank: 1,
        title: "The Human Coffee-to-Patience Converter",
        explanation: "Hasn't slept since the kickoff; survives purely on bean juice and the hope that you'll stop using a screwdriver as a chisel."
      },
      {
        rank: 2,
        title: "The \"I Told You So\" Time Traveler",
        explanation: "Predicted the axle would snap three weeks ago. Now stands there with crossed arms, radiating a terrifying \"I warned you\" energy."
      },
      {
        rank: 3,
        title: "The Professional Sigh-er",
        explanation: "Can convey exactly how much your logic is flawed with a single, long-exhale that lasts for 45 seconds."
      },
      {
        rank: 4,
        title: "The 10mm Socket Extortionist",
        explanation: "Has found every missing 10mm socket in the lab; will only return them in exchange for a clean pit area."
      },
      {
        rank: 5,
        title: "The Safety Goggle Fashion Police",
        explanation: "Can spot an \"on the forehead\" goggle violation from three zip codes away through a brick wall."
      },
      {
        rank: 6,
        title: "The Van-Driving Narcaleptic",
        explanation: "Capable of driving 14 hours straight on a diet of gas station jerky and pure spite."
      },
      {
        rank: 7,
        title: "The \"Back in My Day\" Dinosaur",
        explanation: "Will tell you about the 2005 season where they had to code in binary using a literal abacus and steam-powered motors."
      },
      {
        rank: 8,
        title: "The Budgetary Heartbreaker",
        explanation: "The person who has to tell you that \"No, the team cannot afford a $400 titanium go-kart seat for the robot.\""
      },
      {
        rank: 9,
        title: "The Ghost of Technical Support",
        explanation: "Only appears when the CAD crashes, fixes it in one click, and vanishes into the vents before you can say \"thank you.\""
      },
      {
        rank: 10,
        title: "The Dad-Joke Juggernaut",
        explanation: "Diffuses high-stress robot failures with puns so bad they cause actual physical pain to the students."
      },
      {
        rank: 11,
        title: "The Manual Lawyer (Prosecutor)",
        explanation: "Uses the Game Manual to shut down your \"cool\" idea by proving it violates Rule G102, Section B, Paragraph 4."
      },
      {
        rank: 12,
        title: "The Stress-Eating Sentinel",
        explanation: "If the robot is breaking, they are in the corner eating a whole bag of pretzels at a terrifying speed."
      },
      {
        rank: 13,
        title: "The Hands-Off Sadist",
        explanation: "Watches you put the wheel on backwards for an hour. Doesn't stop you. \"It’s a learning moment, Tyler.\""
      },
      {
        rank: 14,
        title: "The Hardware Archaeologist",
        explanation: "Can identify which student lost a bolt in 2019 just by the taste of the grease on it."
      },
      {
        rank: 15,
        title: "The TSA (Team Sarcasm Authority)",
        explanation: "Has reached a level of burnout where they no longer speak, they only communicate in eye-rolls and thumbs-downs."
      },
      {
        rank: 16,
        title: "The Clipboard Warden",
        explanation: "If you aren't wearing a lanyard, you don't exist to them. They live for the bureaucracy of the inspection sheet."
      },
      {
        rank: 17,
        title: "The Secret Snack Smuggler",
        explanation: "Has a hidden compartment in their laptop bag filled with the \"good\" granola bars they won't share with the freshmen."
      },
      {
        rank: 18,
        title: "The Expansion Hub Whisperer",
        explanation: "The only person the robot's electronics are actually afraid of. When they walk over, the blinking red lights turn green out of fear."
      },
      {
        rank: 19,
        title: "The \"Just One More Test\" Liar",
        explanation: "Says we're leaving the lab at 8:00 PM. It is now 11:45 PM. We are still testing the intake."
      },
      {
        rank: 20,
        title: "The Gracious Professionalism Assassin",
        explanation: "Will hunt you down if you don't offer to help the team that just beat you. \"Smile, or no Wendy's on the way home.\""
      },
      {
        rank: 21,
        title: "The Solder-Smoke Inhaler",
        explanation: "Has spent so much time over a soldering iron they can no longer smell anything except flux and regret."
      },
      {
        rank: 22,
        title: "The 3D-Printer Bodyguard",
        explanation: "Will fight a student to the death if they try to print a \"funny rock\" instead of the actual robot parts."
      },
      {
        rank: 23,
        title: "The Pivot-Table Overlord",
        explanation: "Believes scouting data is more important than the actual robot. \"The numbers say we should pick the team that's currently upside down.\""
      },
      {
        rank: 24,
        title: "The Red-Tape Houdini",
        explanation: "Knows how to trick the school's automatic lights into staying on until 2 AM so you can finish the drivetrain."
      },
      {
        rank: 25,
        title: "The Eternal Lab Resident",
        explanation: "Their mail is now delivered to the robotics room. They haven't seen their spouse in months. They ARE the team."
      }
    ]
  }
];

// Helper to determine active user's subteam rank and progress points
export const getSubteamStatsAndRank = (
  subteam: string,
  hours: number,
  journalsCount: number,
  userRole?: string
): {
  points: number;
  rankIndex: number; // 0 to 24
  currentRank: SubteamRank;
  nextRank: SubteamRank | null;
  percentToNext: number;
  totalNeededForNext: number;
} => {
  let points = Math.round(hours * 5 + journalsCount * 12);

  const isMentor = userRole === 'mentor_captain' || userRole === 'mentor';
  if (subteam === 'Mentoring') {
    if (!isMentor) {
      points = 0;
    }
  } else {
    if (isMentor) {
      points = 0;
    }
  }
  
  const normalizedSubteam = subteam === 'Design/Build/Fabrication' ? 'Design/Build/Fabrication' : subteam;
  const guild = SUBTEAM_GUILDS.find(g => g.id === normalizedSubteam) || SUBTEAM_GUILDS[0];

  // Dynamic threshold points if apprentice (11 levels) vs mentor (25 levels)
  const thresholds = guild.ranks.length === 25 
    ? [0, 100, 300, 600, 1000, 1600, 2500, 3800, 5500, 7500, 10000, 11000, 12100, 13300, 14600, 16000, 17500, 19100, 20800, 22600, 24500, 26500, 28600, 30800, 33200]
    : [0, 100, 300, 600, 1000, 1600, 2500, 3800, 5500, 7500, 10000];
  
  // Find correct rank index
  let rankIndex = 0;
  while (rankIndex < thresholds.length - 1 && points >= thresholds[rankIndex + 1]) {
    rankIndex++;
  }
  
  const currentRank = guild.ranks[rankIndex] || guild.ranks[0];
  const nextRank = guild.ranks[rankIndex + 1] || null;
  
  const currentThreshold = thresholds[rankIndex];
  const nextThreshold = thresholds[rankIndex + 1] || currentThreshold;
  
  let percentToNext = 100;
  let totalNeededForNext = 0;
  if (nextRank) {
    const range = nextThreshold - currentThreshold;
    const progressInRange = points - currentThreshold;
    percentToNext = Math.min(100, Math.max(0, Math.floor((progressInRange / range) * 100)));
    totalNeededForNext = nextThreshold - points;
  }

  return {
    points,
    rankIndex,
    currentRank,
    nextRank,
    percentToNext,
    totalNeededForNext
  };
};

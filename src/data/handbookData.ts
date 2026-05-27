export interface HandbookSection {
  id: string;
  title: string;
  subTitle?: string;
  content: string; // Markdown or plain text
  isAppendix?: boolean;
}

export interface HandbookChapter {
  id: string;
  title: string;
  sections: HandbookSection[];
}

export const HANDBOOK_METADATA = {
  teamName: "FTC Team 6567 The RoboRaiders",
  season: "2026-2027",
  advisor: "Dwane Decker (dadecker@rhcsd.org)",
  mentor: "Steve Kocik (smkocik23@hvc.rr.com)",
  schoolDistrict: "Red Hook Central School District (RHCSD)",
  schoolName: "Red Hook High School"
};

export const HANDBOOK_CHAPTERS: HandbookChapter[] = [
  {
    id: "chap-1",
    title: "1 Document Control",
    sections: [
      {
        id: "doc-control",
        title: "1 Document Control",
        content: `This handbook contains the information needed for all 6567 team members to understand the administrative and logistical procedures for FTC Team 6567, The RoboRaiders.

It is updated yearly by the Core Leadership to accurately represent current standards.

### Handbook Version Control Ledger
| Version | Date | Change Description | Author |
| :--- | :--- | :--- | :--- |
| **1.0** | 02/19/2026 | First Draft. Copy of 2017 Handbook created by Y. Pierce. | Kocik |
| **1.0.1** | 02/20/2026 | Reworded several sections per D. Decker. Corrected numbering issue. | Decker, Kocik |
| **1.0.2** | 03/12/2026 | Added mentoring requirements, Core Leadership, and positions. | Kocik |
| **1.0.3** | 04/07/2026 | Wordsmithing throughout the document for final release. | Kocik |`
      }
    ]
  },
  {
    id: "chap-2",
    title: "2 About FIRST",
    sections: [
      {
        id: "about-first",
        title: "2 About FIRST",
        content: `FIRST (For Inspiration and Recognition of Science and Technology) is a non-profit organization dedicated to inspiring young people to be leaders and innovators in science and technology.

### 2.1 About FTC
FIRST Tech Challenge (FTC) engages students in grades 7-12 to compete head-to-head in designing, building, and programming a robot, while teaching students leadership, collaboration, and project management skills. Approximately 7,000 teams participate worldwide.

### 2.2 Gracious Professionalism®
Dr. Woodie Flowers (1943 - 2019) coined the term "Gracious Professionalism®." It is part of the ethos of FIRST. It is a way of doing things that encourages high-quality work, emphasizes the value of others, and respects individuals and the community.

### 2.3 Coopertition®
Coopertition® produces innovation. It represents displaying unqualified kindness and respect in the face of fierce competition, helping and cooperating with each other even as they compete.

### 2.4 FIRST's Core Values
- **Discovery:** We explore new skills and ideas.
- **Innovation:** We use creativity and persistence to solve problems.
- **Impact:** We apply what we learn to improve our world.
- **Inclusion:** We respect each other and embrace our differences.
- **Teamwork:** We are stronger when we work together.
- **Fun:** We enjoy and celebrate what we do!

### 2.5 District Participation in FIRST Programs
The Red Hook Central School District (RHCSD) participates in two FIRST programs:
- **2.5.1 FIRST Lego League (FLL):** For 6th-8th graders at Linden Avenue Middle School.
- **2.5.2 FIRST Tech Challenge (FTC):** For 9th-12th graders at Red Hook High School. Robots are typically 20-40 lbs, fit in an 18” cube, built with goBILDA and other custom elements, and programmed in Java.`
      }
    ]
  },
  {
    id: "chap-3",
    title: "3 About the Team",
    sections: [
      {
        id: "about-team",
        title: "3 About the Team",
        content: `FTC Team 6567 The RoboRaiders is a FIRST Tech Challenge team founded by Mrs. Yvonne Pierce (HS Science Teacher - Retired) in 2012. We design, build, and program a robot to compete in an alliance format.

### 3.1 Vision
Our vision is to be a model student-led FTC team recognized for engineering excellence, strong leadership, inclusive culture, and meaningful community impact.

### 3.2 Mission Statement
The RoboRaiders inspires students to innovate boldly, lead with integrity, and grow through challenge.

### 3.2.1 Reflection
We exist to develop capable engineers, confident leaders, and responsible citizens. Mistakes are part of the process; reflection and improvement are expectations.

### 3.3 Team History
Founded in 2012, the team has grown significantly. Achievements include winning Regional Inspire Awards, twice qualified to attend World Championships (2017, 2019), and producing one World FIRST Dean’s List Winner.`
      }
    ]
  },
  {
    id: "chap-4",
    title: "4 Goals",
    sections: [
      {
        id: "goals-detailed",
        title: "4 Goals",
        content: `The team's official objectives are:
- Provide high school students with the opportunity to experience realistic science, technology, engineering and math (STEM) challenges in a fun, hands-on learning environment.
- Guide students through mentors with technical and nontechnical backgrounds.
- Instill FIRST's philosophies: Gracious Professionalism, Coopertition, and Core Values.
- Provide opportunity to build leadership and teamwork skills.
- Use and expand on each student’s unique talents and interests.
- Improve awareness of STEM education and opportunities in our community through outreach projects.`
      }
    ]
  },
  {
    id: "chap-5",
    title: "5 Team Organization",
    sections: [
      {
        id: "team-org",
        title: "5 Team Organization",
        content: `Red Hook Robotics is advised by Dwane Decker and guided by volunteer mentors.

### 5.1 Coaches/Mentors
Volunteer industry professionals, teachers, parents, and community members. Mentors teach, guide, and suggest, but **the students must design, build, program, and drive the robots** in competition.

### 5.2 Student Leadership
Consists of all subteam leads and two captains. Positions are reserved for grades 10-12 active team members from the previous season.

### 5.3 Subteams
RoboRaiders are divided into four primary subteams and two secondary subteams:
- **Design/Build/Fabrication:** Uses CAD to design drivetrains and mechanisms, uses 3D printers, CNC routers, and assembles.
- **Software:** Writes robot logic in Java, integrating color, distance, and limit switch sensors as well as vision systems.
- **Outreach:** Develops opportunities to spread STEM in the community (Fair shifts, FLL mentoring).
- **Business and Media:** Fundraising, sponsors, grant writing, photography, clothing design, and social media.

### 5.3.1 Subteam Selection
New students indicate their top three subteam preferences. Subteam switches are not allowed until a member's second year.

### 5.3.2 Secondary Subteams
Students may also join one of the two secondary subteams: **Strategy** or **Inspire Award** portfolio.

### 5.4 Leadership Selection Process
Selection occurs through nominations & interviews. Core Leadership reviews past experience, technical competency, dedication, and teamwork before providing offers.`
      }
    ]
  },
  {
    id: "chap-6",
    title: "6 Student Expectations and Code of Conduct",
    sections: [
      {
        id: "student-expect-conduct",
        title: "6 Student Expectations and Code of Conduct",
        content: `### 6.1 Forms / Sign Up
Required to complete all forms (FIRST STIMS and school district) by the second official meeting.

### 6.2 Academic Standards
Academics come before robotics. Students on the "Academic Ineligibility" list cannot participate in team activities for **two full weeks**. Removal from the list must be documented.

### 6.3 Mentoring Requirements
Students must complete a **minimum of 10 hours of mentoring** for LAMS FLL teams.

### 6.4 Outreach Requirements
Students must volunteer for outreach, including a **minimum of 6 shifts at the Dutchess County Fair**.

### 6.5 Leadership Opportunities
Students are expected to figure out what needs to be done proactively with mentors' guidance.

### 6.6 Attendance Policy & Standards
Attendance is recorded at every meeting. **Students must record and log 24 hours per month** of work towards the team's goals (not including FLL mentoring).

### 6.6.1 Meetings
- **6.6.1.1 Team Business Meeting:** Mondays 2:30pm – 4:00pm. **Required** for all members to share Accomplishments, Blockers, and Commitments.
- **6.6.1.2 Subteam Meetings:** Days and times vary, scheduled by consensus.
- **6.6.1.3 Additional Meetings:** Scheduled as the season progresses.

### 6.7 Code of Conduct
- **6.7.1 Phone Usage:** Cell phones must be kept away except for serious robotics-related needs or contacting parents.
- **6.7.2 Online:** Represent the team with Gracious Professionalism on all channels.
- **6.7.3 Competition:** Remain with the team for the full duration of tournaments. No early leaves.
- **6.7.4 Dress Code:** Safety glasses and closed-toe shoes are **mandatory** during build sessions. No loose clothes near moving equipment.
- **6.7.5 Food:** Food and drink allowed in room 181 but strictly away from equipment, computers, and heavy machinery. Clean up is mandatory.`
      }
    ]
  },
  {
    id: "chap-7",
    title: "7 Safety and Workspace Rules",
    sections: [
      {
        id: "safety-workspace-rules",
        title: "7 Safety and Workspace Rules",
        content: `### 7.1 Safety
Safety is everyone's responsibility:
- **Safety Glasses:** Must wear safety glasses at all times in build sessions (prescription glasses need clip-on side guards).
- **Shoes:** Closed-toed shoes only.
- **Entanglement:** Tie back long hair, no loose clothing or hanging jewelry.
- **Conduct:** Absolutely no "horsing around".
- **Kill-Switch:** Always disable the robot's power switch and disconnect the battery before repairs.
- **Injuries:** Report any injury immediately.

### 7.2 Workspace Rules
1. **TRAINING:** DO NOT USE A MACHINE OR TOOL UNLESS YOU HAVE BEEN TRAINED AND SIGNED OFF!
2. **RETURN:** Return all tools and equipment to their designated places.
3. **DOWNLOADS:** Do not download programs on team PCs without authorization.
4. **CLEANUP:** The final 15 minutes of every meeting is dedicated to cleanup. EVERY MEMBER HELPS CLEAN.
5. **NEATNESS:** Keep your workspace clean, organized, and professional.`
      }
    ]
  },
  {
    id: "chap-8",
    title: "8 Transportation",
    sections: [
      {
        id: "transportation-details",
        title: "8 Transportation",
        content: `- Transportation to and from daily build sessions is the student/parent's responsibility. Carpooling and late bus options are encouraged.
- Organized school buses or authorized carpools are used for competitions. **Students are strictly forbidden from driving themselves to competitions.**
- Travel costs for qualifying State / World tournaments (Utica, NY or Houston, TX) are sponsored by parents unless separate team sponsors are secured.`
      }
    ]
  },
  {
    id: "chap-9",
    title: "9 Competition Team",
    sections: [
      {
        id: "competition-team-details",
        title: "9 Competition Team",
        content: `The Competition Team roster is announced 2 weeks prior to events to allow for logistics and permissions.

### 9.1 Competition Team Criteria
- **Academic:** Must meet academic eligibility standards.
- **Behavior:** Initiative, safe practices, and respectful behavior representing FTC #6567.
- **Commitment:** Satisfy the standard monthly hours minimums (24 hours).
- **Outreach Participation:** Complete required outreach volunteer events.
- **Mentoring Participation:** Fulfill FLL mentoring commitments.
- **Performance:** Demonstrate skill and initiative completing subteam goals.`
      }
    ]
  },
  {
    id: "chap-10",
    title: "10 Courses and Scholarships",
    sections: [
      {
        id: "courses-scholarships",
        title: "10 Courses and Scholarships",
        content: `### 10.1 Courses
Students are encouraged to enroll in Red Hook High School STEM, CAD, engineering, or design courses. Keep advisors and mentors updated on your courses.

### 10.2 Scholarships
FIRST actively promotes university and engineering scholarships. Seniors should check FIRST platforms regularly. Advisors require a minimum of 2 weeks notice for letters of recommendation.`
      }
    ]
  },
  {
    id: "chap-11",
    title: "11 Financial/Fundraising",
    sections: [
      {
        id: "financial-fundraising",
        title: "11 Financial/Fundraising",
        content: `- The average team budget per season is approximately **$10,000**.
- The Red Hook Central School District supports the base with **$6,000 per fiscal year**.
- The remaining $4,000 is raised through grants, local business sponsorships, and community fundraisers. **All team members are required to actively participate in fundraising efforts.**`
      }
    ]
  },
  {
    id: "chap-12",
    title: "12 Communication, Calendar, Email List",
    sections: [
      {
        id: "comms-calendar-teams",
        title: "12 Communication, Calendar, Email List",
        content: `It is critical that students and parents have direct access to our schedules and emails.

### 12.1 Microsoft Teams
The team currently utilizes Microsoft Teams for daily collaboration. Students have accounts through the Red Hook School District. Regular chats, calendar synchronizations, and notifications are broadcasted here.`
      }
    ]
  },
  {
    id: "chap-13",
    title: "13 Documentation",
    sections: [
      {
        id: "documentation-rules",
        title: "13 Documentation",
        content: `### 13.1 Team Journal
FIRST highly suggests that each team create a daily journal of the team's activities. This digital or hardcopy compilation is referred to as the Team Journal.

### 13.1.1 Subteam Daily Journals
Each subteam is expected to document meeting activities. Every entry should include:
- Goals & purpose of the meeting.
- Accomplishments & decisions made.
- Problem discussion & resolution.
- Sketches & CAD renderings.
- Code snippets & testing outcomes.
- Items for the next meeting.

### 13.1.2 Hardcopy Version
A hardcopy version of the Team Journal is printed and verified. This notebook is evaluated by judges at competitions.

### 13.2 Team Portfolio
The Team Portfolio is a 15-page document summarizing key engineering decisions and community highlights. It is compiled directly from the Team Journal.

### 13.3 Student Expectations
Each team member is **expected to contribute regularly** to both the Team Journal and the Team Portfolio.`
      }
    ]
  },
  {
    id: "chap-14",
    title: "14 Parent Involvement",
    sections: [
      {
        id: "parent-involvement",
        title: "14 Parent Involvement",
        content: `Parental involvement is essential for a successful team. Parents are welcome in our build sessions, outreach events, and competitions.
- Registration requires online parental consent by the second meeting of each season.
- Parents interested in recurring mentor positions must complete district clearances and background checks. Contact Dwane Decker for more details.`
      }
    ]
  },
  {
    id: "chap-15",
    title: "15 Publicity",
    sections: [
      {
        id: "publicity-rules",
        title: "15 Publicity",
        content: `The team coordinates publicity with local papers and the school television network. FIRST and Red Hook CSD require student waivers and publicity release signatures for photographing/interviews, which are signed during enrollment processes.`
      }
    ]
  },
  {
    id: "chap-16",
    title: "16 Season Overview",
    sections: [
      {
        id: "season-overview",
        title: "16 Season Overview",
        content: `A typical season schedule involves the following phases:
- **Pre-season (June-August):** Community outreach, Dutchess Fair shifts, skill coaching.
- **September:** Target game release, field tile assembly, build starts.
- **October – December:** Main build & assembly phase, CAD design completions, auton logic tuning.
- **December-February:** Qualifying regional tournaments, design portfolio compilation.
- **Post-Season (March-May):** Selected team advancements, state championships, next-gen prototyping.`
      }
    ]
  },
  {
    id: "chap-17",
    title: "17 Contact and Final Notes",
    sections: [
      {
        id: "contact-notes",
        title: "17 Contact and Final Notes",
        content: `### Core Leadership contacts:
- **Faculty Advisor:** Dwane Decker ([dadecker@rhcsd.org](mailto:dadecker@rhcsd.org))
- **Core Mentor:** Steve Kocik ([smkocik23@hvc.rr.com](mailto:smkocik23@hvc.rr.com))

Expectation: All members must follow safety rules and maintain academic targets. Reach out directly to discuss challenges or scheduling conflicts.`
      }
    ]
  },
  {
    id: "chap-18",
    title: "18 Appendix A – Team History",
    sections: [
      {
        id: "appendix-a",
        title: "18 Appendix A – Team History",
        content: `### Historical Milestones of FTC Team #6567 (RoboRaiders):
- **2012/2013:** RoboRaiders founded in science classroom 164. Bought a quarter field. Tested drivebases.
- **2013/2014:** Competed for the first time. Placed 2nd for Motivate Award at Capital Region qualifying events.
- **2014/2015:** 3rd Inspire Award, Finalist Captain. Empire NY championships 2nd Motivate.
- **2015/2016:** Took the FIRST Regional Inspire Award overall. In finals, placed 9th state-wide.
- **2016/2017:** Winner of Think and Control awards. Katelin Zichittella named **FTC Dean’s List Finalist**. Competed at St. Louis World Championships, won "The Higher Priority" Judges Award.
- **2017/2018:** Earned 1st place Albany and Peekskill. Won State-level **1st Place Inspire Award**, qualified to Scranton Regionals. Formed JV team ("Red Storm") on bus ride home.
- **2018/2019:** Won Collins Innovate, 1st place Inspire Award in qualifiers. Jacqueline Kocik named **FTC Dean’s List Winner (1 of 10 globally)**. Ranked 50th at Worlds in Detroit.
- **2019/2020:** 2nd place Inspire. Custom designs halted due to COVID-19 restrictions.
- **2020/2021:** Fabricated 3D printed medical face shields in alliance with SUNY New Paltz.
- **2021/2022:** Won Collins Aerospace Innovate and 2nd place Inspire.
- **2022/2023:** 1st place Inspire at Broadalbin-Perth, 2nd place Inspire at State Championship.
- **2023/2024:** 1st place Design Award at State level, 1st place Inspire at John Jay, 1st place Connect.
- **2024/2025:** 1st place Control Award at Utica State Championships, alliance first pick.
- **2025/2026:** Rebuilding after graduating 9 seniors. Won 2nd place Think and Innovate.`
      }
    ]
  },
  {
    id: "chap-19",
    title: "19 Appendix B – Awards",
    sections: [
      {
        id: "appendix-b",
        title: "19 Appendix B – Awards",
        content: `### 🏆 RoboRaiders #6567 Core Performance Records

#### 2025-2026 – Decode
- **NY – Excelsior John Jay Qualifier:**
  - Innovate Award Second Place
  - Qualification Rank 20
  - Sixth Place Alliance First Pick

#### 2024-2025 – Into The Deep
- **NY – Excelsior MVCC Utica State Championship:**
  - Control Award – 1st Place
  - Qualification Rank 17
  - Sixth Place Alliance First Pick
- **NY – Excelsior Albany Academies Qualifier:**
  - Connect Award – 1st Place
  - Qualification Rank 14
- **NY – Excelsior John Jay Qualifier:**
  - Inspire Award Second Place
  - Qualification Rank 20

#### 2023-2024 – CenterStage
- **NY – Excelsior MVCC Utica State Championship:**
  - Design Award First Place
  - Qualification Rank 19
- **NY – Excelsior Peekskill Qualifier:**
  - Connect Award First Place
  - Qualification Rank 6
- **NY – Excelsior John Jay Qualifier:**
  - Inspire Award First Place
  - Qualification Rank 22`
      }
    ]
  },
  {
    id: "chap-20",
    title: "20 Appendix C – Acknowledgement",
    sections: [
      {
        id: "acknowledgement",
        title: "20 Appendix C – Acknowledgement",
        content: `### Red Hook Robotics Team Handbook Acknowledgement & Consent

Please review the checklist on the right. Both student and parents are required to acknowledge safety requirements, academic benchmarks, and attendance constraints.

Digitally logging your electronic signature on the portal certifies that:
- You have read, understood, and agreed to follow the student code of conduct.
- You agree to safety glasses and footwear guidelines in lab room 181.
- You support travel and community outreach mentoring schedules.`
      }
    ]
  }
];

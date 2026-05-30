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

It is updated yearly by the Core Leadership to accurately represent current standards. It contains team rules and expectations, and other essential information for all Red Hook Robotics Team members. All team members and their parents/guardians are expected to review and understand this material and sign the acknowledgement found in Appendix C - Red Hook Robotics Team Handbook Acknowledgement.

### Handbook Version Control Ledger
| Version | Date | Change Description | Author |
| :--- | :--- | :--- | :--- |
| **1.0** | 02/19/2026 | First Draft. Copy of 2017 Handbook created by Y. Pierce. | Kocik |
| **1.0.1** | 02/20/2026 | Reworded several sections per D. Decker. Corrected numbering issue with headings. | Decker, Kocik |
| **1.0.2** | 03/12/2026 | Added mentoring requirements. Defined Core Leadership. Defined Student Leadership positions. | Kocik |
| **1.0.3** | 04/07/2026 | Wordsmithing throughout the document for final release. | Kocik |
| **1.0.4** | 04/20/2026 | Indicate that over-glasses safety glasses are to be used when wearing prescription glasses. Further defined Inspire Subteam's responsibilities. | Kocik |`
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
        content: `FIRST, For Inspiration and Recognition of Science and Technology, is a non-profit organization dedicated to inspiring young people to be leaders and innovators in science and technology. Through programs such as FIRST Robotics Competition, FIRST Tech Challenge, and FIRST Lego League, students are encouraged to excel in the areas of science, technology, engineering, and mathematics. FIRST was founded in 1989 by Dean Kamen (inventor of the Segway and the insulin pump) and has since become an international organization that has reached hundreds of thousands of students from elementary school through high school. For more information, visit [https://www.firstinspires.org/](https://www.firstinspires.org/)

### 2.1 About FTC
FIRST Tech Challenge (FTC) engages students in grades 7-12 to compete head-to-head in designing, building, and programming a robot, while teaching students leadership, collaboration, and project management skills. While the number of FTC teams varies, there are approximately 7,000 teams participating worldwide.

Each year a new and unique theme-based challenge is presented in which robots are built from a reusable platform, powered by android technology, and can be coded using a variety of levels of *Java-based* programming. The challenges change year-to-year and can involve such things as sorting balls, climbing obstacles, shooting rings, and autonomously detecting field elements and acting on the detection of the field elements.

### 2.2 Gracious Professionalism
Dr. Woodie Flowers, (1943 - 2019) EAB Chair Emeritus & Distinguished Advisor, coined the term "Gracious Professionalism®".

Gracious Professionalism is part of the ethos of FIRST. It's a way of doing things that encourages high-quality work, emphasizes the value of others, and respects individuals and the community.

With Gracious Professionalism, fierce competition and mutual gain are not separate notions. Gracious professionals learn and compete like crazy but treat one another with respect and kindness in the process. They avoid treating anyone like losers. No chest thumping tough talk, but no sticky-sweet platitudes either. Knowledge, competition, and empathy are comfortably blended.

In the long run, Gracious Professionalism is part of pursuing a meaningful life. One can add to society and enjoy the satisfaction of knowing one has acted with integrity and sensitivity.

### 2.3 Coopertition®
Coopertition® produces innovation. At FIRST, Coopertition is displaying unqualified kindness and respect in the face of fierce competition. Coopertition is founded on the concept and a philosophy that teams can and should help and cooperate with each other even as they compete.

Coopertition involves learning from teammates. It is teaching teammates. It is learning from Mentors. And it is managing and being managed. Coopertition means competing always, but assisting and enabling others when you can.

### 2.4 FIRST's Core Values
The FIRST Core Values emphasize friendly sportsmanship, respect for the contributions of others, teamwork, learning, and community involvement and are part of our commitment to fostering, cultivating, and preserving a culture of equity, diversity, and inclusion. The FIRST Community expresses the FIRST philosophies of Gracious Professionalism® and Coopertition® through our Core Values:

- **Discovery:** We explore new skills and ideas.
- **Innovation:** We use creativity and persistence to solve problems.
- **Impact:** We apply what we learn to improve our world.
- **Inclusion:** We respect each other and embrace our differences.
- **Teamwork:** We are stronger when we work together.
- **Fun:** We enjoy and celebrate what we do!

### 2.5 Red Hook Central School District Participation in FIRST Programs
The Red Hook Central School District (RHCSD) participates in two FIRST programs.

#### 2.5.1 FIRST Lego League (FLL)
For 6th-8th graders at the Linden Avenue Middle School RHCSD offer an after-school FIRST Lego League (FLL). FLL robots are made entirely of Lego pieces.

#### 2.5.2 FIRST Tech Challenge
For 9th-12th graders at Red Hook High School RHCSD offer a FIRST Tech Challenge (FTC) robotics team. FTC robots are typically 20-40 pounds, fit in an 18" cube, and are typically built exclusively with the goBILDA build system (or other build systems), custom designed parts (3d-printed, CNCed, etc) or a combination of all the above. Robots are programmed using Java, utilizing the Android Studio integrated development environment (IDE).`
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
        content: `FTC Team 6567 The RoboRaiders is a FIRST Tech Challenge (FTC) team founded by Mrs. Yvonne Pierce (HS Science Teacher - Retired) in 2012. We are an academic team that works together to design/build/program a robot to compete in an alliance format against other teams.

### 3.1 Vision
Our vision is to be a model student-led FTC team recognized for engineering excellence, strong leadership, inclusive culture, and meaningful community impact. We strive to build a sustainable program where students mentor students, leaders develop future leaders, and responsibility is embraced at every level. Through disciplined design, creative problem-solving, and collaborative teamwork, we aim to compete at the highest level while maintaining integrity and gracious professionalism.

Our goal is not only to prepare students for STEM careers, but to equip them with the confidence, resilience, and leadership skills needed to make a positive difference in their communities.

### 3.2 Mission Statement
FTC Team 6567 The RoboRaiders inspires students to innovate boldly, lead with integrity, and grow through challenge. Through competitive robotics, we cultivate technical excellence, resilience, and a passion for learning. Rooted in inclusion and student leadership, we value every voice and strengthen one another through teamwork and service. We strive to uplift our community, promote STEM, and spark the imagination of future innovators.

### 3.2.1 Reflection
FTC Team 6567, The RoboRaiders exists to develop capable engineers, confident leaders, and responsible citizens through the challenge of competitive robotics. We pursue technical excellence in engineering, design, programming, and strategy. We hold ourselves to high standards of craftsmanship, preparation, and performance. We compete with integrity, humility, and gracious professionalism.

We believe growth comes through challenge. Robotics is not simply about building a competitive robot — it is about building perseverance, problem-solving ability, communication skills, and resilience. Mistakes are part of the process. Reflection and improvement are expectations.

We serve our broader community through mentorship, outreach, and the promotion of STEM education. We strive to inspire others while continuously improving ourselves.

### 3.3 Team History
FTC Team 6567, The RoboRaiders was founded in 2012 by Mrs. Yvonne Pierce (HS Science Teacher – Retired). From a handful of students at the beginning to a group of 20+ students from Red Hook High School, the team has:

- Won two Regional Inspire Awards (the highest FTC award)
- Attended Super Regionals (Scranton, PA – 2016)
- Attended the World Championships twice (2017 – St. Louis and 2019 – Detroit)
- Been awarded "The Higher Priority" Judges Award at the 2017 World Championships
- Produced two FIRST Dean's List Finalists
- Produced one World FIRST Dean's List Winner
- Winner of numerous local and regional awards

A detailed history can be found in **Appendix A - Team History**`
      }
    ]
  },
  {
    id: "chap-4",
    title: "4 Team Organization",
    sections: [
      {
        id: "team-organization",
        title: "4 Team Organization",
        content: `Red Hook Robotics is advised by high school science faculty member Dwane Decker, and guided by volunteer mentors who have engineering, computer science, and other industry backgrounds, as well as parents and others who help organize fundraising, pit decorations, and other important functions. In all cases the purpose of the mentors is to teach, guide, make suggestions, and help organize, but it is the students who design, build, program, and drive the robots in competitions.

### 4.1 Coaches/Mentors
Our coaches/mentors consist of a volunteer group of industry professionals, teachers, parents and/or community members. Coaches/mentors will tend to focus on one or two subteams with the goal to teach, guide, learn, and lead alongside the students.

### 4.2 Student Leadership
Student Leadership consists of all subteam leads and two captains.

No Student Leadership member is automatically granted a spot on the Competition Team.

All Student Leadership positions are reserved for students entering grades 10–12 who were active team members during the previous season. If no qualified candidate meets these criteria, exceptions may be considered on a case-by-case basis.

The Lead Teacher and Lead Mentor(s) (referred to as Core Leadership), in consultation with the Team Captains, reserve the right to remove a student from a leadership position for repeated or serious violations of team rules or standards, or if the student is unable to fulfill the responsibilities associated with their leadership role.

### 4.3 Subteams
The RoboRaiders are divided into four subteams: Design/Build/Fabrication, Software, Outreach, Business and Media and two secondary subteams: Strategy and Inspire Award.

- **Design/Build/Fabrication:** Uses CAD software to design the drivetrain and other mechanisms on the robot, as well as make part drawings for the Build and Fabrication of the robot. Part drawings and industrial machines (3D printers, CNC machines, etc.) are utilized to create parts for the robot. Once the parts are created, the team assembles the robot.
- **Software:** Writes code in Java and/or other suitable programming languages to control the functions of the robot, integrating data from sensors, including (but not limited to) encoders, sensors (color, distance, etc.), limit switches, and vision systems to give the robot awareness of its surroundings. The Software subteam is responsible for ensuring the robot performs responsively in both Autonomous and Driver control modes.
- **Outreach:** Identifies, develops, nurtures, creates opportunities for the team to spread the mission of FIRST to the local, regional and international community. Opportunities include (but are not limited to) participating in school or other organization STEM events, family fun nights, recruiting new mentors, etc.
- **Business and Media:** Is responsible for most of the team's fundraising efforts by contacting sponsors, applying for grants, and managing the team's budget. Members of this team also manage the team's media, photographing and taking video of all team events and competitions; promote the team's program through the team's website, the local newspaper, and various social media sites; and design our team apparel.
- **Strategy:** Develops competition strategies during the build and competition season. Members are expected to fully understand the game rules, follow FTC forum posts, contribute to discussion during strategy meetings, and deeply analyze strategies that other FTC teams are employing. During competition, along with the drive coach, the match strategist uses strategy developed by the subteam to plan out our matches.
- **Inspire Award:** Focuses on compiling and documenting the team's portfolio that is submitted at each competition the team attends. This subteam is responsible for gathering the information required and forming a cohesive portfolio utilizing input from the other subteams.

#### 4.3.1 Subteam Selection
New students indicate their top three subteam preferences. Team Leadership will assign students to subteams and release the list of subteams before the start of season. Not everyone's assigned team will be their first choice, the team does their best to accommodate everyone's preferences.

Subteam switches will not be permitted until a member's second year (unless extenuating circumstances occur). If a problem arises, it is the responsibility of the team member to communicate with their respective subteam lead.

#### 4.3.2 Secondary Subteams
In addition to their primary subteam, students may join one of the two secondary subteams: Strategy or Inspire Award.

### 4.4 Leadership Selection Process
All selection to official leadership positions occurs through a nomination and interview process.

At the start of the leadership selection process, students will be asked to apply for leadership positions and/or to nominate others who they believe are deserving of a position through a Google Form. All members and coaches of the team are encouraged and expected to provide their input via the form.

After collecting nominations, Core Leadership will confirm that each nominee would like to be considered as a candidate for each of the positions they have been nominated for. Students are not required to be a candidate for any leadership positions they were nominated for but are not interested in.

The candidates will be interviewed by Core Leadership, and occasionally a coach from the relevant subteam or outreach group will sit in on the meeting. Each interview will be 5-10 minutes in length, depending on the position and interview schedule.

After all candidates have been interviewed, core leadership will discuss and select a suitable lead for each leadership position based on many factors, including:
- Past experience.
- Dedication and contributions to the team.
- Technical competency, where applicable.
- Leadership, management, and organizational skills.
- Ability to serve as an outstanding representative of the team.
- Ability to complete duties listed in the position's Job Description.
- Interview performance and substance.
- Leadership skills showing kindness, compassion, empathy, and the ability to work well with others.
- Nominations submitted by past subteam leads, fellow team members, and coaches.

Students may only hold one leadership position at a time, except under extenuating circumstances.`
      }
    ]
  },
  {
    id: "chap-5",
    title: "5 Student Expectations and Code of Conduct",
    sections: [
      {
        id: "student-expectations-and-code-of-conduct",
        title: "5 Student Expectations and Code of Conduct",
        content: `### 5.1 Forms/Sign Up
Students are required to complete all required forms by the second official meeting. This includes (but not limited to) registering with the team through FIRST's Student Team Information Member System (STIMS) website and any forms required by the team and/or the Red Hook School District.

### 5.2 Academic Standards
The Robotics program/club/team is considered an extracurricular school activity. Team members (students) must meet and maintain academic standards as defined in the **Red Hook High School Student Handbook** (see the Eligibility chapter/section).

In all situations, academics come before robotics. However, students who commit to the robotics team are expected to manage their time in such a way as to be able to meet both their academic obligations and their team obligations. Students who are placed on the high school "Academic Ineligibility" list during any academic quarter will not be able to participate in any team activities for two full weeks. After this time, students must document that they have improved their academic standing and have been removed from the ineligible list before being allowed to return to team activities. Students should follow the documentation procedures established by Red Hook High School for ineligible students in these circumstances. Students are encouraged to bring homework to meetings and competitions as needed so that they may work on assignments during any "down time".

### 5.3 Mentoring Requirements
Students are required to complete a minimum of 10 hours of mentoring for the FLL teams associated with the Red Hook School District.

### 5.4 Outreach Requirements
Students are required to volunteer for outreach activities during each season. Requirements include (but are not limited to):
- Staffing a minimum of 6 shifts at the Dutchess County Fair.
- Volunteering to support other RoboRaiders outreach events.

### 5.5 Leadership Opportunities
Students will not necessarily be told what to do at each meeting; rather, they are expected to figure out together what needs to be done themselves, perhaps with guidance or teaching from the mentors, and prioritize and divide up the tasks amongst themselves. In keeping with the overall goal of all high school clubs, it is essential that the team be student-led and that *each student* develop leadership skills through participation in the team. Examples of leadership include: being a technical leader, such as lead programmer or robot driver, builder, or designer; taking the lead on organizing the engineering notebook or consistently making outstanding contributions to the notebook; designing a successful pit or costumes, promoting team spirit at competitions; coordinating the judge's interview, or a fundraising effort or community outreach event; actively managing the team work flow at meetings and competitions; coordinating successful scouting efforts at competitions; finding ways to promote the team through publicity; and other important contributions to the overall success of the team. There are plenty of leadership opportunities for all students on the team.

### 5.6 Attendance Policy
Attendance is taken at every team meeting by each subteam lead. Team members are required to notify team leadership about late arrivals and absences. Team members should contact their subteam lead by either email, MS Teams, or in person as soon as possible. Longer absences should be communicated earlier.

#### 5.6.1 Attendance Standards
Students are required to record/log 24 hours per month of work towards the team's goals, projects, and events (not including FLL mentoring requirements). Failure to meet this standard will be reason for removal from the competition team and/or dismissal from the team.

The Red Hook Robotics FTC Team is a challenging activity that goes well beyond a typical high school club. There is a tremendous amount of information to learn and many skills our team members must quickly acquire to have a successful season. We participate in highly competitive tournaments with experienced teams from all over the state. For this reason, significant commitment is required from all our students. Just showing up at team meetings is not enough to create a successful team. Students must have an excellent attendance record at meetings and competitions, but more than this, they must strive to achieve real results at each meeting and constantly explore and research ways to improve the robot and the team itself in a proactive manner. Some independent work, practice, or research at home or outside the regular team meeting times may also be expected. Students who have excessive absenteeism will not be allowed to participate in tournaments, at the discretion of the coaches.

We recognize that many students have significant after-school and weekend commitments, including athletics, employment, and other extracurricular activities. We respect and support students who pursue multiple interests. In many cases, scheduling challenges can be discussed and managed.

However, consistent attendance at regular team meetings is essential to the success of the RoboRaiders. When outside commitments result in frequent absences from scheduled meetings, they negatively impact team progress and collaboration. Students whose attendance interferes with regular meeting hours will not be considered for leadership positions, as leadership requires consistent presence, reliability, and availability to support the team.

Additionally, students with ongoing poor attendance may be deemed ineligible to participate in tournaments.

Students who anticipate significant after-school commitments during the fall season (such as varsity sports or employment) should meet with Mr. Decker at the beginning of the season to discuss participation options and expectations.

##### 5.6.1.1 Meetings
- **Team Business Meeting – Mondays 2:30pm – 4:00pm:** Team conducts a "business" meeting on Mondays from 2:30pm-4:00pm, all team members are **required** to attend. This meeting is used to share individuals' Accomplishments, Blockers, and Commitments. In addition, this meeting is used to discuss and inform the team of decisions, upcoming schedules, and other important information.
- **Subteam Meetings – Days and Times Vary:** Subteam members are **expected/required** to attend their Subteam's meetings. The days and times will vary, however, the subteam is expected to come to a consensus on meeting days and times with their team members.
- **Additional Meetings:** Additional meetings may be scheduled as the season progresses. The need for these meetings will be discussed on a subteam-by-subteam basis with input from the subteam members and mentors/coaches. Students are **expected/required** to attend these meetings.

### 5.7 Code of Conduct
In general, the team treats each student member as a young adult. Each student is expected to be respectful of all team members and mentors as well as other individuals the team comes in contact with. Learning professionalism is a must for each student. Students are required to adhere to all Red Hook High School Rules of Conduct at all times, whether on school grounds or off-campus at competitions, fundraising or community outreach events. See the Red Hook High School Student Handbook for more information.

Student behavior is subject to all local, state, and federal regulations, including those of the Red Hook Central School District, with regard to bullying, harassment, discrimination, or other behavior that creates an unsafe or hostile team environment. These include actions at school, during team meetings, in online forums used by team members (regardless of whether they are team-sanctioned communication platforms or not), and team events including outreach/community events and competitions.

When you wear the RoboRaider logo you are representing your team, Red Hook Schools, the Red Hook and surrounding community, the team's sponsors, and yourself wherever you are, even in Red Hook, NY. You should treat others with respect and kindness. Additionally, your behavior impacts everyone that you represent. At competition, what you say to another team member and how you say it may be overheard by a judge, potential sponsor, or member of another team. Any invited guests must understand this and behave accordingly. All your actions as a team member reflect directly on 6567's team image.

#### 5.7.1 Phone Usage
Personal cell phone use during meetings (business, subteam, etc.) and competitions should be only for serious purposes related to robotics. Examples include communicating with a parent about pick up times, reviewing a game rule, etc. During team meetings or competitions, students should not be texting, talking socially on the phone, playing handheld games or other activities not related to the robotics team. If a student has "down time" waiting for another team member to complete a task, they should either work on team-related activities (fundraising, organizing tools and supplies, journal entries etc.) or homework.

#### 5.7.2 Online
When representing the team online, remember Gracious Professionalism. Just like at a competition or in a public setting, you are representing the RoboRaiders and should be humble, professional, and considerate to all.

#### 5.7.3 Competition
Team members are expected to attend competitions for their full duration and remain with the team until the event has officially concluded. For competitions requiring travel, students are expected to remain with the team until we have returned to Red Hook, NY.

Team members may not leave a competition early or attend other events with family or friends while participating as a member of the competition team. Extenuating circumstances will be considered on a case-by-case basis and must be discussed in advance with the Lead Teacher or designated chaperone.

Students are expected to always conduct themselves with professionalism. Always show respect to other teams, event volunteers, judges, parents, and venue staff.

Team members must remain with the team throughout the event. If you need to leave the immediate area for any reason, notify the appropriate student leader and/or chaperone and choose a reasonable time to step away. If you are needed and are not present, it reflects poorly on both you and the team.

While at competition, stay focused and fulfill your assigned role. Building friendships with students from other teams is strongly encouraged and is part of the FTC experience; however, it should not interfere with your responsibilities or assigned tasks.

All team members must follow the dress code as outlined in the Dress Code section of this handbook.

#### 5.7.4 Dress Code
- All students are expected to adhere to the Red Hook High School dress code.
- Students must wear safety glasses at all times during build sessions. Students who wear prescription glasses should use over the glasses safety glasses in lieu of safety glasses. Regular glasses without side guards are NOT safety glasses. Both are available in the build room.
- No open-toed shoes are allowed during build sessions. Shoes provide important protection in case of dropped tools or materials.
- No loose-fitting clothing, dangling jewelry, or other items that present an entanglement hazard around equipment and moving parts.
- Long hair must be tied back during build sessions.
- Students will be expected to wear team t-shirts and other accessories as decided by the team for all competitions and outreach seasons. Other aspects of dress for tournaments should be appropriate and neat and should adhere to safety rules.

#### 5.7.5 Food
Food and drink consumption is allowed in room 181 within reason, but cleanup is the responsibility of each student. Food or drinks should not be consumed near equipment, computers, or other places where it may present a hazard or cause damage.`
      }
    ]
  },
  {
    id: "chap-6",
    title: "6 Safety and Workspace Rules",
    sections: [
      {
        id: "safety-and-workspace-rules",
        title: "6 Safety and Workspace Rules",
        content: `### 6.1 Safety
The responsibility of safety lies with each and every member of Red Hook Robotics. Each team member is required to abide by safety rules at all times. It is important to display a positive image to our community, sponsors, and FIRST, and this begins with SAFETY. Team members must know and demonstrate safe and professional behavior wherever the team conducts its business. Important safety rules include (but are not limited to):

- Students must wear safety glasses at all times during build sessions. Students who wear prescription glasses should use over the glasses safety glasses in lieu of safety glasses. Regular glasses without side guards are NOT safety glasses. Both are available in the build room.
- No open-toed shoes are allowed during build sessions. Shoes provide important protection in case of dropped tools or materials.
- No loose-fitting clothing, dangling jewelry, or other items that present an entanglement hazard around equipment and moving parts.
- No "horsing around". Work with tools and sensitive electronics equipment, especially in small spaces, does not mix with this kind of behavior.
- Always disable the robot's "kill switch" or remove the battery before undertaking repairs or modifications.
- Report any injuries, however minor, to the advisor or mentor immediately.
- Use common sense and be aware of what is going on around you.

### 6.2 Workspace Rules
1. Follow all safety guidelines and protocols. Use of team tools is a privilege, not a right, and safety is paramount. **DO NOT USE A MACHINE OR TOOL UNLESS YOU HAVE BEEN TRAINED AND SIGNED OFF TO USE THAT EQUIPMENT.**
2. Return all tools and equipment to their given places.
3. DO NOT download or install programs onto programming, CAD, or business/media computers without permission of the respective subteam lead. A reason directly related to robotics or the team must be explained.
4. At the end of the meeting the last 15 minutes will be dedicated to cleaning up. EVERY MEMBER WILL HELP CLEAN UP THE SPACE THAT WAS USED.
5. Each team member is required to keep the workspace clean, neat, and organized.
6. Personal equipment and/or tools brought to team meetings must be in compliance with all school rules.`
      }
    ]
  },
  {
    id: "chap-7",
    title: "7 Transportation",
    sections: [
      {
        id: "transportation",
        title: "7 Transportation",
        content: `Transportation to and from all meetings, work and build sessions, and community outreach activities is the responsibility of each individual student, although carpooling or use of the high school late bus is encouraged.

School bus transportation or carpooling to and from competition will be employed. Students may not drive themselves to competitions.

In the event that the team qualifies for the Excelsior Regional Championships (held in Utica, NY) or World Championships (held in Houston, TX), the cost of food, transportation, and lodging is the responsibility of each student's parents, unless other funding sources are obtained by the team.`
      }
    ]
  },
  {
    id: "chap-8",
    title: "8 Competition Team",
    sections: [
      {
        id: "competition-team",
        title: "8 Competition Team",
        content: `The Competition Team will be announced 2 weeks prior to the event to allow time to turn in forms and organize logistics.

Before each competition the Competition Team will be re-evaluated and reselected. This reselection process will take into account the individual team member's behavior at previous events as well as their recent behavior during and outside team meetings.

### 8.1 Competition Team Criteria
**Academic**
- The student must meet or exceed the academic standards documented in this handbook.

**Behavior**
- Show initiative and be actively engaged in moving the team forward.
- Take personal responsibility to stay focused and productive.
- Act respectfully and safely during team meetings and when representing the team at events.

**Commitment**
- The student has met the minimum number of hours as documented in this handbook (24 hours).

**Outreach Participation**
- Meet necessary expectations for participation in outreach events.

**Mentoring Participation**
- Meet necessary expectations for participation in mentoring.

**Performance**
- Take initiative in learning material required of their subteam's tasks.
- Show unique aptitude at completing subteam projects and tasks.
- Be best at filling a described role for the competition.`
      }
    ]
  },
  {
    id: "chap-9",
    title: "9 Courses and Scholarships",
    sections: [
      {
        id: "courses-and-scholarships",
        title: "9 Courses and Scholarships",
        content: `### 9.1 Courses
Students are encouraged to enroll in the many math, science, engineering, design, or technology courses offered by Red Hook High School to enhance and enrich their robotics experience. Please discuss your academic interests in engineering or robotics with your guidance counselor and/or team mentors when planning your high school academic course program. Students are also encouraged to take advantage of the many online tutorials and resources available for the various build systems, Android Studio, and other areas of interest related to FIRST.

### 9.2 Scholarships
FIRST actively promotes monetary scholarships from major universities and engineering programs. Seniors applying to college should check the FIRST website for the latest listing of scholarship opportunities. While team mentors/advisers will gladly write letters of recommendation or fill out other forms required for scholarship applications, please allow a minimum of two weeks for completion of these documents.`
      }
    ]
  },
  {
    id: "chap-10",
    title: "10 Financial/Fundraising",
    sections: [
      {
        id: "financial-fundraising",
        title: "10 Financial/Fundraising",
        content: `On average the team's budget per season is approximately $10,050. Building a competitive robot is expensive. Having the tools, equipment, and materials to build a robot is more expensive. While the team does receive financial support from Red Hook Central School District ($6,000 per RHCSD fiscal year – starting July 1) additional methods of obtaining financial support are utilized.

The team actively searches for additional funding through grants, local, regional and national businesses sponsorship, fundraisers (bake sales for example), and in-kind donations.

All team members are **required** to actively participate in fundraising, either through grant writing, contacting businesses (at the local, regional and/or national level), and/or participating in fundraisers for the team.`
      }
    ]
  },
  {
    id: "chap-11",
    title: "11 Communication, the Calendar, and the Email List",
    sections: [
      {
        id: "communication-calendar-email",
        title: "11 Communication, the Calendar, and the Email List",
        content: `It is important for both students and parents to have access to the team's Google calendar and be on the team email list. The goal is to keep both students and parents "in the know" for upcoming events, competitions, meeting dates, subteam schedules, and other important information. Students and parents are expected to regularly check email and the google calendar. Students will gain access to the team calendar once they officially join the team.

### 11.1 Microsoft Teams
The team currently utilizes Microsoft Teams (MS Teams) for team collaboration. Students already have access to MS Teams through the Red Hook School District. MS Teams provides chat services, video conferencing, file storage and integration with Microsoft 365 suite of applications (Word, Excel, Powerpoint, etc.) and other third-party applications and services. Students will gain access to the RoboRaiders MS team once they officially join the team. Students are expected to regularly check MS teams.`
      }
    ]
  },
  {
    id: "chap-12",
    title: "12 Documentation",
    sections: [
      {
        id: "documentation",
        title: "12 Documentation",
        content: `### 12.1 Team Journal
All of the FTC awards require some kind of documentation to even be considered for the award. While never stated as a hard requirement, FIRST highly suggests that each team create a daily journal of the team's activities. This daily journal can be referred to as the Team Journal. How the Team Journal is created is left to each team to discover and develop.

#### 12.1.1 Subteam Daily Journals
Each subteam is required and expected to create meeting journals that document the activities that occurred during the subteam's meeting. Information for each entry should include (but is not limited to):
- Goals for / purpose of the meeting
- Accomplishments
- Decisions made
- Problem discussion and resolution
- Problems encountered
- Drawings/sketches (CAD or by hand)
- Pictures, videos, etc.
- Code snippets
- Math/Science discussions
- Testing methods
- Testing outcomes/results
- Items to be reviewed/worked on for the next meeting

Students should allow ample time at the end of each session to complete their journal entry before leaving for the day. Journal entries should be dated and signed by each student.

#### 12.1.2 Hardcopy Version
A hardcopy version of the Team Journal will be maintained and kept up to date. The hardcopy version of the Team Journal will be brought to competitions to show the team's work (much like showing your work for a math problem).

### 12.2 Team Portfolio
The team Portfolio is a document used as part of the competition judging process with requirements as outlined in the season's competition manual.

The Portfolio is limited to 15 pages of content plus 1 cover page. It must be printed on US Letter (8.5"x11") size paper.

The Portfolio should document aspects of the team which directly support the judged award criteria or information which the team wishes the competition Judges to consider. It is the first and only document that the competition Judges utilize to determine awards winners.

The information that populates the Portfolio is obtained from the Team Journal. Therefore, it is critical that the Team Journal information is up to date and accurate. The team's goal is to have an exemplary Portfolio and that happens by having the Team Journal up to date and accurate for all subteams.

### 12.3 Student Expectations
**Each team member is expected to contribute to the Team Journal and to the Portfolio.**

#### 12.3.1 Team Journal
The defined Team Journal format is to be followed and the team member should have his entry peer reviewed by the subteam lead or other team members on the subteam. Journal entries **must** be dated and signed (by hand or digitally) by the team member(s).

The team member that has created the entry is responsible for printing out the entry and adding it to the appropriate location in the hardcopy version of the Team Journal.

#### 12.3.2 Portfolio
Team members are required to contribute to the development of the Portfolio for Competitions. This participation can include (but not limited to):
- Adding content
- Reviewing and/or proof-reading content for clarity, accuracy, and flow
- Providing formatting
- Providing pictures, images, sketches, etc.`
      }
    ]
  },
  {
    id: "chap-13",
    title: "13 Parent Involvement",
    sections: [
      {
        id: "parent-involvement",
        title: "13 Parent Involvement",
        content: `Parental support and involvement is an essential part of any successful team. Parents or guardians are welcome and encouraged to attend or participate in any build session, outreach event, fundraising activity or competition. All tournaments and competitions are open free of charge to the public. Most parents attend at least one tournament competition to support their student and the team and to help out with pit supervision, snacks, photography and video recording etc. Parents are a required part of the student online team registration process, which must be completed by the second official meeting of the season each year. Parents are also expected to be part of the team email group (and Facebook Group, if interested) used to communicate with students so that they are fully informed of all activities.

Parents who wish to take a more active or regular mentor role are welcome and encouraged. All regular mentors must satisfy certain security clearances as required by FIRST and the Red Hook Central School District, including submitting information for a background check. All existing team mentors have already been certified under these requirements. Parents should contact Dwane Decker for more information on how to become a certified mentor if interested.`
      }
    ]
  },
  {
    id: "chap-14",
    title: "14 Publicity",
    sections: [
      {
        id: "publicity",
        title: "14 Publicity",
        content: `Part of fundraising and community involvement is the placement of news articles and photographs in local papers and on the school website, video clips on the Red Hook High School Television News, etc. Students may be interviewed by members of the press at events, and their words and likenesses may be printed as a result. FIRST and Red Hook Central School District require waivers to be signed by a parent or guardian giving permission for such press activity for each student. Please sign the attached release form at the end of this document.`
      }
    ]
  },
  {
    id: "chap-15",
    title: "15 Season Overview",
    sections: [
      {
        id: "season-overview",
        title: "15 Season Overview",
        content: `This section outlines a typical season for the Red Hook Robotics Team, although precise dates will vary and are generally not known until after the season starts.

- **Pre-season June-August:** Team volunteers at community outreach events, such as at a public library, and begins fundraising efforts for the new season. Also a great time for team members to improve their robotics skills through robotics camps, online courses, or self-study.
- **September:** The new game is announced and build seasons starts the second week of school. Students come 2-3 times a week after school, as well as any weekend build session to build the game field.
- **October – December:** Main build season. There may be opportunities to participate in scrimmages or workdays with other local teams.
- **December-February:** Team will compete in at least two to three qualifying tournaments, and the Regional Championship (if qualified).
- **Post-Season March-May (if qualified):** Regionals (early March) or World Championships (late April – early May). Students experiment with designs for next season's robot. Participate in other community outreach activities and fundraising.`
      }
    ]
  },
  {
    id: "chap-16",
    title: "16 Contact and Final Notes",
    sections: [
      {
        id: "contact-final-notes",
        title: "16 Contact and Final Notes",
        content: `Core Leadership consists of Dwane Decker ([dadecker@rhcsd.org](mailto:dadecker@rhcsd.org)) and Steve Kocik ([smkocik23@hvc.rr.com](mailto:smkocik23@hvc.rr.com)).

It is expected that all team members will follow and understand all rules and policies in this handbook. The leadership team reserves the right to set consequences for major violations. Core leadership also may change this handbook during the season. If this occurs, the team will be notified of the modifications promptly. Lastly, Core Leadership encourages all students to raise concerns about the team directly with them in person or through email. The students and team climate are our first priority, and we strive to support our team mission.`
      }
    ]
  },
  {
    id: "chap-17",
    title: "17 Appendix A - Team History",
    sections: [
      {
        id: "appendix-a",
        title: "17 Appendix A - Team History",
        content: `**2012/2013**
FTC 6567 the RoboRaiders is formed, meetings are conducted in Mrs. Yvonne Pierce's (Science Teacher – Retired) classroom 164. Eventually a quarter of a field is purchased, and robot development is conducted in the corner of her classroom. The team does not compete, but does attend a few competitions to learn about FTC.

**2013/2014**
The RoboRaiders compete in their first competitions and are awarded 2nd place for the Motivate Award at the Capital Region NY Qualifying Tournament.

**2014/2015**
At the Capital Region Qualifier, the team wins the Motivate Award, 3rd place for Inspire Award, and is the Finalist Alliance Captain. This is the first time the team qualifies for the Empire NY Championships. At the Empire NY Championships, they are awarded 2nd place for Motivate and finish in 10th place overall.

**2015/2016**
At the Capital Region Qualifier, the team places 2nd for the Control Award, and win their first Inspire Award, they are the best team overall. At the Hudson Valley Championship they win the Motivate Award, place 9th overall, are a Finalist award winner.

**2016/2017**
At the Capital Region Qualifier, the team is a Finalist award winner, 2nd place Inspire, 1st place Think Award, 3rd Place Control Award. At the Hudson Valley Championship, the team wins the Promote Award and team member Katelin Zichittella is announced as an FTC Dean's List Finalist (one of a hundred students in all of FTC). The team is "invited" to the World Championships in St. Louis, Mo where they win the "Higher Priority" Judges Award.

**2017/2018**
At the Peekskill Qualifier, the team finishes 3rd overall, 1st place Inspire Award, 2nd place Think Award, Winning Alliance First Pick and qualify for the Hudson Valley Regional Championships. At the Albany Qualifier, the team finishes 2nd place, are eliminated in the semi-finals, 2nd place Think Award, 1st place Connect Award. At the Hudson Valley Regional Championships, the team finishes in 1st place, finalist alliance captain, 1st place Inspire, 2nd place Motivate and qualify for Eastern Super Regionals at University of Scranton. Eastern Super Regional the team has an average performance and fails to qualify for Worlds. During the bus ride home, the coaches decide to create a second team (Red Storm) and is referred to as the JV team.

**2018/2019**
The team wins the Collins Aerospace Innovate Award, are a Connect Award Finalist and are place 5th after the qualifications rounds. At the Hudson Valley Albany Qualifying Tournament, the team finishes 1st after qualifying round, are the winning alliance captain, are Design Award finalist and Think Award finalist and win 1st place Inspire. At the Hudson Valley Championship, the team finishes 15th overall, are the winning alliance first pick, 1st place Inspire Award, Motivate and Control Award finalist and team member Jacqueline Kocik is announced as an FTC Dean's List Finalist. At the World Championships, the team ranks 50th out of 360 teams with an autonomous rank of 25th out of 360 teams. Jacqueline Kocik is announced as a Dean's List Winner (1 of 10 FTC students).

**2019/2020**
COVID-19 cancels the season just before Regional Championships. The team competes in only one tournament, awarded 2nd place Inspire, the winning alliance first pick, Collins Aerospace Innovate Award Winner, Design Award Finalist.

**2020-2021**
Team/Club meetings are suspended until the COVID-19 pandemic is over. The team does not meet, nor participate in the modified season. They do utilize their 3D printer to print parts for face shields in cooperation with SUNY-New Paltz.

**2021-2022**
After a year off, the team returns and wins 2nd place Inspire at the Excelsior Albany Area Qualifier and wins the Collins Aerospace Innovate Award. In competing at the Excelsior Regional championships, they are a Collins Aerospace Innovate Award finalist.

**2022/2023**
The team earns a 2nd place Inspire award at the Excelsior Albany Area qualifier and a 1st place Inspire at the Excelsior Broadalbin-Perth Qualifier. At the Excelsior MVCC Utica Championships, they earn a 2nd Place Inspire Award and are the Motivate Award winner.

**2023/2024**
The team earns 1st place Inspire Award at the Excelsior John Jay Qualifier and a 1st place for the connect award at the Excelsior Peekskill Qualifier. At the Excelsior MVCC Utica Championships the team earns a 1st place for the Design Award.

**2024/2025**
The team earns a 2nd place Inspire award at the Excelsior John Jay Qualifier, a 1st place in the Connect award at the Excelsior Albany Academies Qualifier. At the Excelsior MVCC Utica Championships the team is awarded 1st place for the Control Award and are the first pick for the 6th place alliance. They also earn a bid to a Premier Event, however, the team declines due to schedule conflicts and cost.

**2025/2026**
After graduating 9 seniors the prior year, the team looks to rebuild. Earning 2nd place Think awards at the Excelsior Albany Academies Qualifier and the Excelsior Peekskill Qualifiers. The team also earns a 2nd place Innovate Award at the Excelsior John Jay Qualifier. The team fails to advance to the Excelsior MVCC Utica Championships.`
      }
    ]
  },
  {
    id: "chap-18",
    title: "18 Appendix B - Awards",
    sections: [
      {
        id: "appendix-b",
        title: "18 Appendix B - Awards",
        content: `### 18.1 2025-2026 - Decode
#### 18.1.1 NY - Excelsior John Jay Qualifier - December 6, 2024
- Innovate Award Second Place
- Qualification Rank 20
- Sixth Place Alliance First Pick, eliminated in 3rd Round

### 18.2 2024-2025 - Into The Deep
#### 18.2.1 NY - Excelsior MVCC Utica Championships - March 8, 2025-March 9, 2025
- Control Award – 1st Place
- Qualification Rank 17
- Sixth Place Alliance First Pick, eliminated 3rd Round

#### 18.2.2 NY - Excelsior Albany Academies Qualifier - January 18, 2025
- Connect Award – 1st Place
- Qualification Rank 14
- Second Place Alliance First Pick, eliminated in Semi-Final

#### 18.2.3 NY - Excelsior John Jay Qualifier - December 8, 2024
- Inspire Award Second Place
- Qualification Rank 20
- Fourth Place Alliance First Pick, eliminated in Semi-Final

### 18.3 2023-2024 - CenterStage
#### 18.3.1 NY - Excelsior MVCC Utica Championships - March 3, 2024
- Design Award First Place
- Qualification Rank 19

#### 18.3.2 NY - Excelsior Peekskill Qualifier - February 10, 2024
- Connect Award First Place
- Qualification Rank 6

#### 18.3.3 NY - Excelsior John Jay Qualifier - December 2, 2024
- Inspire Award First Place
- Qualification Rank 22
- Fifth Place Alliance First Pick, eliminated in 3rd Round

### 18.4 2022-2023 - Power Play
#### 18.4.1 NY - Excelsior Albany Area Qualifier - January 14, 2023
- Inspire Award Second Place
- Connect Award First Place
- Innovate Award Sponsored by Raytheon Technologies Second Place
- Qualification Rank 9
- Fourth Place Alliance First Pick, eliminated in Finals (Runner Up)

#### 18.4.2 NY - Excelsior Broadalbin-Perth Qualifier - January 29, 2022
- Inspire Award First Place
- Connect Award Second Place
- Innovate Award Sponsored by Raytheon Technologies Second Place
- Qualification Rank 5
- Fourth Place Alliance Capitan, eliminated in Semifinals

#### 18.4.3 NY - Excelsior MVCC Regional Championship - March 5, 2023
- Inspire Award Second Place
- Connect Award Second Place
- Motivate Award First Place
- Qualification Rank 25

### 18.5 2021-2022 - Freight Frenzy
#### 18.5.1 NY - Excelsior Albany Area Qualifier - February 6, 2022
- Inspire Award Second Place
- Collins Aerospace Innovate Award Winner
- Qualification Rank 8

#### 18.5.2 NY - Excelsior MVCC Regional Championship - March 6, 2022
- Collins Aerospace Innovate Award Finalist
- Qualification Rank 13

### 18.6 2019-2020 - SkyStone
#### 18.6.1 NY - Excelsior Peekskill Qualifier - January 11, 2020
- Inspire Award Second Place
- Winning Alliance First Pick
- Collins Aerospace Innovate Award Winner
- Design Award Finalist
- Qualification Rank 8

### 18.7 2018-2019 - Rover Ruckus
#### 18.7.1 Excelsior NY Sauquoit FIRST Tech Challenge Qualifier - December 2, 2018
- Connect Award Finalist
- Collins Aerospace Innovate Award Winner
- Qualification Rank 5

#### 18.7.2 Hudson Valley Albany Qualifying Tournament - January 19, 2019
- Inspire Award Winner
- Think Award Finalist
- Design Award Finalist
- Qualification Rank 1
- Winning Alliance Captain

#### 18.7.3 Hudson Valley Championship Tournament - February 10, 2019
- Inspire Award Winner
- Motivate Award Finalist
- Control Award Finalist
- Qualification Rank 15
- Winning Alliance First Pick

#### 18.7.4 FIRST World Championship - Detroit - Edison Division - April 23, 2019
- Qualification Rank 50/360
- Autonomous Rank 25/360

### 18.8 2017-2018 - Relic Recovery
#### 18.8.1 New York Excelsior Region Qualifying Tournament - December 3, 2017
- Second Place Think Award
- Second Place Design Award
- Ranked 5th after Qualification Matches

#### 18.8.2 Hudson Valley Region Albany Qualifying Tournament - January 13, 2018
- First Place Connect Award
- Second Place Think Award
- Ranked 2nd after Qualification Matches

#### 18.8.3 Hudson Valley Region Peekskill Qualifying Tournament - January 27, 2018
- First Place Inspire Award
- Winning Alliance Partner
- Second Place Think Award
- Ranked 2nd after Qualification Matches

#### 18.8.4 Hudson Valley Regional Championships - February 11, 2018
- First Place Inspire Award
- Finalist Alliance Captain
- Second Place Motivate Award
- Ranked 1st after Qualification Matches

#### 18.8.5 Vermont State Championships-– February 24, 2018
- Fourth place in Robotics Performance
- Third Place Think Award
- Ranked 4th after Qualification Matches

#### 18.8.6 East Super-Regional Championships - March 16-18, 2018
- 26th place in Robot Performance

### 18.9 2016-2017 - Velocity Vortex
#### 18.9.1 Hudson Valley Region Albany Qualifying Tournament - January 14, 2017
- Second Place Inspire Award
- First Place Think Award
- Third Place Control Award
- Ranked 6th after Qualification Matches

#### 18.9.2 Hudson Valley Regional Championships - February 5, 2017
- First Place Promote Award
- Second Alliance Pick
- Ranked 21st after Qualification Matches

#### 18.9.3 Vermont State Championships - February 11, 2017
- First Place Promote Award
- Captain Alliance Finalist
- Ranked 3rd after Qualification Matches

#### 18.9.4 World Championships – St. Louis – April 26-29, 2017
- Judges Award
- Ranked 30th after Qualification Matches (out of 64 teams)

### 18.10 2015-2016 - RES-Q
#### 18.10.1 Hudson Valley Region Albany Qualifying Tournament - January 16, 2016
- Second Place Control Award
- Third Place PTC Design Award
- First Place Inspire Award
- Ranked 1st after Qualification Matches
- Winning Alliance Captain

#### 18.10.2 Hudson Valley Regional Championships - February 21, 2016
- Second Place Control Award
- First Place Motivate Award
- Ranked 9th after Qualification Matches
- Finalist Alliance

### 18.11 2014-2015 - Cascade Effect
#### 18.11.1 Mid-Hudson NY Qualifying Tournament - January 10, 2015
- Ranked 16th after Qualification Matches

#### 18.11.2 Capital Region NY Qualifying Tournament - January 17, 2015
- First Place Motivate Award
- Third Place Inspire Award
- Ranked 3rd after Qualification Matches
- Finalist Alliance Captain

#### 18.11.3 Empire New York Regional Championships - February 8, 2015
- Ranked 10th after Qualification Matches
- Second Alliance Selection

### 18.12 2013-2014 – Block Party
#### 18.12.1 Capital Region NY Qualifying Tournament - January 19, 2014
- Second Place Motivate Award
- Fourth Place Alliance Capitan`
      }
    ]
  },
  {
    id: "chap-20",
    title: "19 Appendix C – Acknowledgement",
    sections: [
      {
        id: "acknowledgement",
        title: "19 Appendix C – Acknowledgement",
        content: `### Red Hook Robotics Team Handbook Acknowledgement & Consent

Please review the checklist on the right. Both student and parents are required to acknowledge safety requirements, academic benchmarks, and attendance constraints.

Digitally logging your electronic signature on the portal certifies that:
- You have read, understood, and agreed to follow the student code of conduct.
- You agree to safety glasses and footwear guidelines in lab room 181.
- You support travel and community outreach mentoring semesters and schedules.`
      }
    ]
  }
];

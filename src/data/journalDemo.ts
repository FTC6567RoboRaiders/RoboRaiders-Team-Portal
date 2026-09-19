import { JournalEntry, TimeEntry } from '../types';

export const DEMO_ENTRIES: JournalEntry[] = [
  {
    id: "entry-1",
    subteam: "Design/Build/Fabrication",
    author: "Sam Chen",
    date: "2026-05-10",
    planned: "Model and print the modular gripper intake using carbon-fiber infused PLA. Prototyping drive bases for high traction on field tiles.",
    accomplished: "Successfully printed grippers on Ultimaker 3. Optimized infill density to 45% for superior rigidity while maintaining minimum weight. Assembled drivetrain rails and mounted motors.",
    problemsAndSolutions: [
      "Motor mounting screws were slightly loose because of threading mismatch. Fixed by replacing with custom locking nuts."
    ],
    planNextTime: "Wire and test motor controllers to run full drivetrain speed tests.",
    images: [
      {
        id: "demo-img-cad-1",
        name: "modular_gripper_cad_v2.svg",
        size: 2450,
        dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="100%" height="100%" fill="%230f172a"/><text x="20" y="35" fill="%2338bdf8" font-family="monospace" font-size="14" font-weight="bold">ONSHAPE CAD // MODULAR INTAKE</text><text x="20" y="55" fill="%2364748b" font-family="monospace" font-size="11">SUBTEAM: DESIGN / BUILD // REV 2.4</text><rect x="60" y="80" width="120" height="110" rx="8" fill="none" stroke="%2338bdf8" stroke-width="3"/><rect x="220" y="80" width="120" height="110" rx="8" fill="none" stroke="%23f59e0b" stroke-width="3"/><path d="M120 135 L280 135" stroke="%2322c55e" stroke-width="4" stroke-dasharray="6 4"/><circle cx="120" cy="135" r="14" fill="%2338bdf8"/><circle cx="280" cy="135" r="14" fill="%23f59e0b"/><text x="85" y="225" fill="white" font-family="sans-serif" font-size="11" font-weight="bold">Left Gripper Rail</text><text x="240" y="225" fill="white" font-family="sans-serif" font-size="11" font-weight="bold">Right Compliant Wheel</text></svg>'
      },
      {
        id: "demo-img-chassis-2",
        name: "chassis_rail_assembly.svg",
        size: 1980,
        dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="100%" height="100%" fill="%231e293b"/><text x="20" y="35" fill="%23f97316" font-family="monospace" font-size="14" font-weight="bold">HARDWARE ASSEMBLY // DRIVETRAIN</text><rect x="50" y="70" width="300" height="120" rx="10" fill="none" stroke="%23f97316" stroke-width="3"/><circle cx="90" cy="190" r="28" fill="%230f172a" stroke="%2338bdf8" stroke-width="4"/><circle cx="310" cy="190" r="28" fill="%230f172a" stroke="%2338bdf8" stroke-width="4"/><text x="135" y="135" fill="white" font-family="monospace" font-size="13">MECANUM DRIVE BASE</text><text x="140" y="155" fill="%2394a3b8" font-family="monospace" font-size="10">18" x 18" SIZING CUBE VALID</text></svg>'
      }
    ],
    createdAt: Date.now() - 3 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 3 * 24 * 3600 * 1000,
    status: "Approved",
    reviewer: "Mentor Captain",
    reviewedAt: Date.now() - 3 * 24 * 3600 * 1000
  },
  {
    id: "entry-2",
    subteam: "Programming",
    author: "Sam Chen",
    date: "2026-05-12",
    planned: "Tune the roadrunner three-wheel odometry localizer. Implement a PID controller for rotational correction during autonomous pathing.",
    accomplished: "Calibrated track width and wheels diameter to improve localizer precision to under 0.5 inches error scale. Implemented rotation control loop with custom coefficients.",
    problemsAndSolutions: [
      "Significant yaw drifting during rapid lateral strafing. Corrected by adjusting IMU integration rate to 100Hz."
    ],
    planNextTime: "Incorporate AprilTag visual feedback with webcam for autonomous localization refinement.",
    images: [],
    createdAt: Date.now() - 2 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 2 * 24 * 3600 * 1000,
    status: "Pending Review"
  },
  {
    id: "entry-meeting-1",
    entryType: "general_meeting",
    title: "Weekly All-Hands & Season Strategy Kickoff",
    subteam: "Strategy",
    author: "Sam Chen",
    date: "2026-05-14",
    planned: "1. Welcome & Season Milestone Check-in\n2. Subteam Progress & ABC Standup\n3. Financial Ledger & Grant Update\n4. Regional Scrimmage Planning\n5. Final To-Do List & Action Items",
    accomplished: "Conducted all-hands check-in with 14 team members. Reviewed hardware prototyping benchmarks, roadrunner trajectory tuning, and approved $557.18 in parts orders. Assigned final action items for the upcoming scrimmage.",
    problemsAndSolutions: [
      "Blocker: Intake mechanism awaiting 40mm standoffs. Solution: Borrowed temporary spacers from workshop bin until REV package arrives."
    ],
    planNextTime: "Execute scrimmage dry runs and review autonomous sample scoring reliability.",
    agenda: "1. Welcome & Season Milestone Check-in\n2. Subteam Progress & ABC Standup (Accomplishments, Blockers, Commitments)\n3. Financial Ledger & Grant Allocations Update\n4. Regional Scrimmage Planning & Driver Practice\n5. Action Items Assignment & Deadlines",
    attendees: ["Sam Chen", "Maya Lin", "Alex Rivera", "Steve Miller (Mentor)"],
    absentAttendees: ["Jordan Lee (Excused)"],
    abcs: [
      {
        id: "demo-abc-1",
        name: "Sam Chen",
        subteam: "Design/Build/Fabrication",
        accomplishments: "Completed carbon-fiber intake bracket 3D prints on Ultimaker and assembled main drivetrain rails.",
        blockers: "Awaiting 40mm M3 standoffs from REV order.",
        commitments: "Mount intake mechanism onto chassis and run static load tests before Thursday."
      },
      {
        id: "demo-abc-2",
        name: "Maya Lin",
        subteam: "Programming",
        accomplishments: "Tuned PID constants for RoadRunner odometry localization; drift reduced to <0.5 inches.",
        blockers: "Need physical chassis access to test vision AprilTag alignment on the field perimeter.",
        commitments: "Write autonomous trajectory routine for 4-sample high basket scoring cycle."
      },
      {
        id: "demo-abc-3",
        name: "Alex Rivera",
        subteam: "Business & Media",
        accomplishments: "Submitted Gene Haas Foundation grant application for $2,500 and finished sponsor promo video.",
        blockers: "None.",
        commitments: "Finalize corporate sponsor pitch packet and place team competition jersey order."
      }
    ],
    financeAnnounced: "• Total Treasury Balance: $4,850.00 ($2,350.00 Self-Raised + $2,500.00 School Budget)\n• Approved Purchases: REV Robotics motion order ($342.18) & AndyMark field elements ($215.00)\n• Pending Inflow: Gene Haas Foundation grant decision expected next Friday ($2,500 potential)\n• Action: All members collect and submit hardware receipts for reimbursement by end of month.",
    finalTodoList: [
      {
        id: "demo-todo-1",
        task: "Mount modular intake on chassis and verify 18-inch sizing cube compliance",
        assignee: "Sam Chen",
        dueDate: "2026-05-18",
        completed: false
      },
      {
        id: "demo-todo-2",
        task: "Deploy and test AprilTag detection pipeline on Control Hub with webcams",
        assignee: "Maya Lin",
        dueDate: "2026-05-19",
        completed: false
      },
      {
        id: "demo-todo-3",
        task: "Deliver team sponsorship thank-you letters to local precision machining partners",
        assignee: "Alex Rivera",
        dueDate: "2026-05-20",
        completed: true
      }
    ],
    images: [],
    createdAt: Date.now() - 1 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 1 * 24 * 3600 * 1000,
    status: "Approved",
    reviewer: "Steve Miller (Mentor)",
    reviewedAt: Date.now() - 1 * 24 * 3600 * 1000
  }
];

export const DEFAULT_TIME_ENTRIES: TimeEntry[] = [
  {
    id: "time-1",
    userId: "schen-user",
    userName: "Sam Chen",
    userEmail: "schen@school.edu",
    subteam: "Design/Build/Fabrication",
    date: "2026-05-10",
    startTime: "15:30",
    endTime: "18:00",
    durationHours: 2.5,
    taskDescription: "CAD modeled structural rails and 3D printed mechanical gripper grips.",
    createdAt: Date.now() - 3 * 24 * 3600 * 1000
  },
  {
    id: "time-2",
    userId: "schen-user",
    userName: "Sam Chen",
    userEmail: "schen@school.edu",
    subteam: "Programming",
    date: "2026-05-12",
    startTime: "16:00",
    endTime: "19:00",
    durationHours: 3.0,
    taskDescription: "Tuned roadrunner telemetry constants and updated localization IMU drivers.",
    createdAt: Date.now() - 2 * 24 * 3600 * 1000
  }
];

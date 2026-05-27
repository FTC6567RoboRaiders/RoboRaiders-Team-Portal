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
    images: [],
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

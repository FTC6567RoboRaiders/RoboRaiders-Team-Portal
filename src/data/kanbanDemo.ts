import { KanbanTask } from '../types';

export const DEFAULT_KANBAN_TASKS: KanbanTask[] = [
  {
    id: 'k-task-1',
    title: 'Model Intake Assembly in Fusion 360',
    description: 'Design the triple-roller active gear intake system with optimized compression for oversized foam rings cascade. Ensure standard servo mounting patterns conform to the physical constraints of the 18-inch cube limit.',
    column: 'todo',
    subteam: 'Design/Build/Fabrication',
    assignedTo: 'Sarah Chen (Build Co-Lead)',
    priority: 'High',
    createdAt: Date.now() - 3 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
    updatedBy: 'Lead Dave'
  },
  {
    id: 'k-task-2',
    title: 'Code Odometry and PID Feedback Systems',
    description: 'Implement three-wheel dead-wheel tracking algorithm with Odometry corrections. Tune translation and heading PID coefficients to maintain drift tolerances under 0.5 inches over 30s runs.',
    column: 'inprogress',
    subteam: 'Programming',
    assignedTo: 'Alex Rivera (Autonomous Specialist)',
    priority: 'High',
    createdAt: Date.now() - 2 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
    updatedBy: 'Alex Rivera (Autonomous Specialist)'
  },
  {
    id: 'k-task-3',
    title: 'Draft FTC Compass Award Video Script',
    description: 'Write a cohesive, fast-paced 3-minute video layout detailing Lead Mentor Dave\'s guidance, emphasizing how his advice on manufacturing reliability influenced our mechanism choices.',
    column: 'todo',
    subteam: 'Outreach',
    assignedTo: 'Unassigned',
    priority: 'Medium',
    createdAt: Date.now() - 1 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
    updatedBy: 'Sarah Chen (Build Co-Lead)'
  },
  {
    id: 'k-task-4',
    title: 'Audit Shop Spare Parts and Fasteners',
    description: 'Document inventory of spare hex shafts, 5mm set screws, standard bevel gears, and neoprene hub wheels. Tag and sort parts by subteam drawer compartments.',
    column: 'review',
    subteam: 'Design/Build/Fabrication',
    assignedTo: 'Sarah Chen (Build Co-Lead)',
    priority: 'Medium',
    createdAt: Date.now() - 4 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
    updatedBy: 'Lead Mentor Dave'
  },
  {
    id: 'k-task-5',
    title: 'Produce High-Contrast Team Identity Graphics',
    description: 'Generate secondary typography vectors and high-fidelity promotional banners for sponsors and upcoming tournament check-ins.',
    column: 'done',
    subteam: 'Business & Media',
    assignedTo: 'Sarah Chen (Build Co-Lead)',
    priority: 'Low',
    createdAt: Date.now() - 5 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
    updatedBy: 'Sarah Chen (Build Co-Lead)'
  }
];

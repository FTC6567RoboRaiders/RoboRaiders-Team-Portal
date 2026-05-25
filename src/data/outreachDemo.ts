import { OutreachEvent } from '../types';

export const DEFAULT_OUTREACH_EVENTS: OutreachEvent[] = [
  {
    id: 'outreach-demo-1',
    title: 'FIRST LEGO League Workshop Mentorship',
    date: new Date().toISOString().split('T')[0],
    location: 'Local Middle School Lab',
    description: 'Mentored three rookie FIRST LEGO League (FLL) teams on structural gearing ratios, Python coding block patterns, and core values project presentations. Assisted students with structural troubleshooting on their active attachment chassis.',
    impactMetrics: '24 middle schoolers inspired, 3 rookie FLL chassis stabilized',
    hoursLogged: 3,
    participants: ['testLeader', 'testStudent'],
    images: [
      {
        id: 'outreach-img-1',
        name: 'fll_mentoring.svg',
        size: 1540,
        dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%230f172a"/><text x="20" y="40" fill="%23f59e0b" font-family="monospace" font-size="18" font-weight="bold">FLL MENTORSHIP WORKSHOP</text><text x="20" y="65" fill="%23475569" font-family="monospace" font-size="12">LOCATION: MIDDLE SCHOOL LAB</text><circle cx="120" cy="180" r="40" fill="none" stroke="%2338bdf8" stroke-width="4"/><circle cx="280" cy="180" r="40" fill="none" stroke="%2322c55e" stroke-width="4"/><line x1="120" y1="180" x2="280" y2="180" stroke="%23f59e0b" stroke-width="3" stroke-dasharray="8 4"/><text x="100" y="185" fill="white" font-family="sans-serif" font-size="12" font-weight="bold">Gear A</text><text x="260" y="185" fill="white" font-family="sans-serif" font-size="12" font-weight="bold">Gear B</text><text x="140" y="250" fill="%2394a3b8" font-family="sans-serif" font-size="11">Ratio Calibration Drive</text></svg>'
      }
    ],
    creatorName: 'testMentor',
    creatorEmail: 'mentor@school.edu',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'testMentor'
  },
  {
    id: 'outreach-demo-2',
    title: 'STEM Demonstration Day',
    date: new Date().toISOString().split('T')[0],
    location: 'City Science Exploration Center',
    description: 'Demonstrated the team\'s fully functional FTC drive base and intake mechanism to visiting families and local sponsors. Conducted hands-on claw control challenge drives for students to learn about automation limits.',
    impactMetrics: 'Over 150 local families reached, 4 potential project sponsor inquiries recorded',
    hoursLogged: 4,
    participants: ['testLeader', 'testStudent', 'testMentor'],
    images: [],
    creatorName: 'testLeader',
    creatorEmail: 'testleader@school.edu',
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 43200000,
    updatedBy: 'testLeader'
  }
];

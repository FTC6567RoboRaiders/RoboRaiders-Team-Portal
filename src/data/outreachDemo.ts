import { OutreachEvent } from '../types';

export const DEFAULT_OUTREACH_EVENTS: OutreachEvent[] = [
  {
    id: 'outreach-1',
    title: 'STEM Discovery Day at Westside Elementary',
    date: '2026-04-12',
    location: 'Westside Elementary Gym',
    description: 'We brought our FTC robot to showcase to 4th and 5th graders. We set up an interactive driving zone where kids could steer our last year\'s intake chassis. Many students expressed great interest in joining the local FIRST LEGO League (FLL) teams, and we passed out 40+ informational flyers to parents.',
    impactMetrics: '120+ students reached, 45 flyers distributed, 3 FLL interest signups',
    hoursLogged: 4,
    participants: ['Sarah Chen', 'Alex Rivera', 'Dave Mentor'],
    images: [], // Can be uploaded by the user
    creatorName: 'Sarah Chen',
    creatorEmail: 'sarah.chen@roboraiders.org',
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 30 * 86400000,
    updatedBy: 'Sarah Chen'
  },
  {
    id: 'outreach-2',
    title: 'Middle School Robotics FLL Mentoring',
    date: '2026-05-03',
    location: 'Oakridge Middle School Lab',
    description: 'Conducted a programming workshop teaching basic block-based coding and proportional line-following sensors to the Oakridge FLL team. Helped them draft their project presentation regarding energy transmission optimization.',
    impactMetrics: '12 team members mentored, 2 mentors assisted, 1 programming module completed',
    hoursLogged: 2,
    participants: ['Alex Rivera', 'Sam Taylor'],
    images: [],
    creatorName: 'Alex Rivera',
    creatorEmail: 'alex.rivera@roboraiders.org',
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 14 * 86400000,
    updatedBy: 'Alex Rivera'
  },
  {
    id: 'outreach-3',
    title: 'FTC Off-Season Demonstration and Sponsor Pitch',
    date: '2026-05-18',
    location: 'Community Center Main Hall',
    description: 'Presented a high-visibility pitch and live robotic demo to local engineering sponsor representatives. Explained our design cycle, budget allocation, and the educational scope of our subteams. Secured tentative interest for manufacturing materials sponsorships.',
    impactMetrics: '4 corporate sponsors pitched, 25 community attendees, 1 material sponsor lead',
    hoursLogged: 3.5,
    participants: ['Sarah Chen', 'Alex Rivera', 'Lead Dave', 'Emma Stone'],
    images: [],
    creatorName: 'Lead Dave',
    creatorEmail: 'dave.mentor@roboraiders.org',
    createdAt: Date.now() - 5 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
    updatedBy: 'Lead Dave'
  }
];

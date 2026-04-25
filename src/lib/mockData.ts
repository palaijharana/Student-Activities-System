import { Activity, Participation, UserProfile } from "../types";

export const mockUser: UserProfile = {
  uid: 'student-1',
  email: 'student@example.com',
  displayName: 'John Doe',
  role: 'student',
  studentId: 'STU2023001',
  department: 'Computer Science',
  year: '3rd Year',
  createdAt: Date.now(),
};

export const mockCoordinator: UserProfile = {
  uid: 'coord-1',
  email: 'coordinator@example.com',
  displayName: 'Prof. Sarah Smith',
  role: 'coordinator',
  createdAt: Date.now(),
};

export const mockActivities: Activity[] = [
  {
    id: 'act-1',
    title: 'Inter-College Tech Fest',
    description: 'A grand competition of coding, hacking, and innovative projects.',
    type: 'competition',
    status: 'upcoming',
    date: Date.now() + 86400000 * 5, // 5 days later
    location: 'Main Auditorium',
    coordinatorId: 'coord-1',
    coordinatorName: 'Prof. Sarah Smith',
    currentParticipants: 45,
    maxParticipants: 100,
    tags: ['coding', 'innovation', 'tech'],
    createdAt: Date.now(),
  },
  {
    id: 'act-2',
    title: 'Football Championship',
    description: 'Annual inter-departmental football tournament.',
    type: 'sport',
    status: 'ongoing',
    date: Date.now() + 86400000, // 1 day later
    location: 'Sports Ground',
    coordinatorId: 'coord-1',
    coordinatorName: 'Prof. Sarah Smith',
    currentParticipants: 80,
    maxParticipants: 120,
    tags: ['sports', 'teamwork'],
    createdAt: Date.now(),
  },
  {
    id: 'act-3',
    title: 'Debate Club Weekly Meet',
    description: 'Discussing current affairs and global challenges.',
    type: 'club',
    status: 'upcoming',
    date: Date.now() + 86400000 * 2,
    location: 'Meeting Room B',
    coordinatorId: 'coord-1',
    coordinatorName: 'Prof. Sarah Smith',
    currentParticipants: 15,
    maxParticipants: 30,
    tags: ['debate', 'soft-skills'],
    createdAt: Date.now(),
  }
];

export const mockParticipations: Participation[] = [
  {
    id: 'p-1',
    studentId: 'student-1',
    studentName: 'John Doe',
    studentEmail: 'student@example.com',
    activityId: 'act-1',
    activityTitle: 'Inter-College Tech Fest',
    activityDate: Date.now() + 86400000 * 5,
    activityType: 'competition',
    status: 'registered',
    registeredAt: Date.now() - 86400000,
  },
  {
    id: 'p-2',
    studentId: 'student-1',
    studentName: 'John Doe',
    studentEmail: 'student@example.com',
    activityId: 'act-2',
    activityTitle: 'Football Championship',
    activityDate: Date.now() + 86400000,
    activityType: 'sport',
    status: 'registered',
    registeredAt: Date.now() - 86400000 * 2,
  }
];

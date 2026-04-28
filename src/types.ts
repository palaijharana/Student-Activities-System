/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'coordinator' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  studentId?: string; // e.g. STU123
  coordinatorId?: string; // e.g. COORD456
  department?: string;
  year?: string;
  mentees?: string[]; // Array of student uids
  password?: string;
  createdAt: number;
}

export type ActivityType = 'event' | 'club' | 'sport' | 'competition' | 'other';
export type ActivityStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  status: ActivityStatus;
  date: number; // Timestamp
  location: string;
  coordinatorId: string;
  coordinatorName: string;
  maxParticipants?: number;
  currentParticipants: number;
  tags: string[];
  createdAt: number;
}

export interface Participation {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  activityId: string;
  activityTitle: string;
  activityDate: number;
  activityType: ActivityType;
  status: 'registered' | 'attended' | 'absent' | 'excused';
  feedback?: string;
  registeredAt: number;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

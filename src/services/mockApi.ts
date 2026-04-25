/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, Activity, Participation } from '../types';
import { mockActivities, mockParticipations } from '../lib/mockData';

// Simulated persistence using localStorage
const STORAGE_KEYS = {
  USERS: 'educore_users',
  ACTIVITIES: 'educore_activities',
  PARTICIPATIONS: 'educore_participations',
  CURRENT_USER: 'educore_current_user'
};

function getStorage<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initial data if storage is empty
if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
  setStorage(STORAGE_KEYS.ACTIVITIES, mockActivities);
}
if (!localStorage.getItem(STORAGE_KEYS.PARTICIPATIONS)) {
  setStorage(STORAGE_KEYS.PARTICIPATIONS, mockParticipations);
}

export const mockApi = {
  login: async (id: string, password: string, role: string): Promise<UserProfile> => {
    const users = getStorage<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const user = users.find(u => 
      (role === 'student' ? u.studentId === id : u.coordinatorId === id) && 
      u.password === password && 
      u.role === role
    );
    
    if (!user) throw new Error('Invalid credentials');
    return user;
  },

  register: async (userData: Partial<UserProfile>): Promise<UserProfile> => {
    const users = getStorage<UserProfile[]>(STORAGE_KEYS.USERS, []);
    
    const exists = users.find(u => u.email === userData.email || 
      (userData.role === 'student' ? u.studentId === userData.studentId : u.coordinatorId === userData.coordinatorId)
    );
    
    if (exists) throw new Error('User already exists');

    const newUser: UserProfile = {
      uid: Math.random().toString(36).substring(7),
      email: userData.email!,
      displayName: userData.displayName!,
      role: userData.role!,
      password: userData.password!,
      studentId: userData.studentId,
      coordinatorId: userData.coordinatorId,
      department: userData.department,
      year: '2024',
      createdAt: Date.now(),
    };

    setStorage(STORAGE_KEYS.USERS, [...users, newUser]);
    return newUser;
  },

  getActivities: async (): Promise<Activity[]> => {
    return getStorage<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);
  },

  addActivity: async (activity: Partial<Activity>): Promise<Activity> => {
    const activities = getStorage<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);
    const newActivity: Activity = {
      ...activity as Activity,
      id: Math.random().toString(36).substring(7),
      currentParticipants: 0,
      createdAt: Date.now()
    };
    setStorage(STORAGE_KEYS.ACTIVITIES, [newActivity, ...activities]);
    return newActivity;
  },

  getParticipations: async (studentId: string): Promise<Participation[]> => {
    const participations = getStorage<Participation[]>(STORAGE_KEYS.PARTICIPATIONS, []);
    return participations.filter(p => p.studentId === studentId);
  },

  registerForActivity: async (participation: Partial<Participation>): Promise<Participation> => {
    const participations = getStorage<Participation[]>(STORAGE_KEYS.PARTICIPATIONS, []);
    
    const newParticipation: Participation = {
      ...participation as Participation,
      id: Math.random().toString(36).substring(7),
      registeredAt: Date.now(),
      status: 'registered'
    };

    setStorage(STORAGE_KEYS.PARTICIPATIONS, [...participations, newParticipation]);

    // Increment activity count
    const activities = getStorage<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);
    const updatedActivities = activities.map(a => 
      a.id === participation.activityId 
        ? { ...a, currentParticipants: (a.currentParticipants || 0) + 1 } 
        : a
    );
    setStorage(STORAGE_KEYS.ACTIVITIES, updatedActivities);

    return newParticipation;
  }
};

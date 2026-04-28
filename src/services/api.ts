/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, Activity, Participation } from '../types';

const API_URL = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
}

export const api = {
  login: async (id: string, password: string, role: string): Promise<UserProfile> => {
    const data = await handleResponse(await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: id, password }) // Assuming user uses email to login, or I should adjust server to handle ID
    }));
    
    if (data.token) localStorage.setItem('token', data.token);
    return data.user;
  },

  register: async (userData: Partial<UserProfile>): Promise<UserProfile> => {
    const data = await handleResponse(await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }));
    
    if (data.token) localStorage.setItem('token', data.token);
    return data.user;
  },

  getActivities: async (): Promise<Activity[]> => {
    return handleResponse(await fetch(`${API_URL}/activities`));
  },

  addActivity: async (activity: Partial<Activity>): Promise<Activity> => {
    return handleResponse(await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(activity)
    }));
  },

  getParticipations: async (studentId: string): Promise<Participation[]> => {
    return handleResponse(await fetch(`${API_URL}/participations/my`, {
      headers: getAuthHeader()
    }));
  },

  getAllParticipations: async (): Promise<Participation[]> => {
    return handleResponse(await fetch(`${API_URL}/participations`, {
      headers: getAuthHeader()
    }));
  },

  registerForActivity: async (participation: Partial<Participation>): Promise<Participation> => {
    return handleResponse(await fetch(`${API_URL}/participations/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ activityId: participation.activityId })
    }));
  },

  updateActivity: async (id: string, updates: Partial<Activity>): Promise<Activity> => {
    // Note: I haven't implemented PATCH /activities/:id on server yet, but I'll add it
    return handleResponse(await fetch(`${API_URL}/activities/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(updates)
    }));
  },

  deleteActivity: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/activities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete');
    }
  },

  updateParticipationStatus: async (id: string, status: Participation['status']): Promise<Participation> => {
    return handleResponse(await fetch(`${API_URL}/participations/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ status })
    }));
  },

  deleteParticipation: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/participations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete');
    }
  },

  searchStudents: async (query: string): Promise<UserProfile[]> => {
    return handleResponse(await fetch(`${API_URL}/mentorship/students?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeader()
    }));
  },

  getMentees: async (): Promise<UserProfile[]> => {
    return handleResponse(await fetch(`${API_URL}/mentorship/mentees`, {
      headers: getAuthHeader()
    }));
  },

  addMentee: async (studentId: string): Promise<void> => {
    await handleResponse(await fetch(`${API_URL}/mentorship/mentees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ studentId })
    }));
  },

  removeMentee: async (studentId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/mentorship/mentees/${studentId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove mentee');
    }
  },

  getMenteeActivities: async (studentId: string): Promise<Participation[]> => {
    return handleResponse(await fetch(`${API_URL}/mentorship/mentees/${studentId}/activities`, {
      headers: getAuthHeader()
    }));
  }
};

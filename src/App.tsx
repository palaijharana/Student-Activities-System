/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Shell from './components/layout/Shell';
import StudentDashboard from './components/student/Dashboard';
import CoordinatorDashboard from './components/coordinator/Dashboard';
import ReportPage from './components/coordinator/ReportPage';
import ActivitiesPage from './components/common/ActivitiesPage';
import HistoryPage from './components/student/HistoryPage';
import Login from './components/auth/Login';
import { UserProfile } from './types';

export default function App() {
  const [user, setUser] = React.useState<UserProfile | null>(null);

  const handleLogin = (userData: UserProfile) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Shell userRole={user.role as 'student' | 'coordinator'} onLogout={handleLogout} user={user}>
        <Routes>
          <Route path="/" element={
            user.role === 'student' ? <StudentDashboard user={user} /> : <CoordinatorDashboard user={user} />
          } />
          <Route path="/activities" element={<ActivitiesPage user={user} />} />
          <Route path="/reports" element={
            user.role === 'coordinator' ? <ReportPage /> : <Navigate to="/" />
          } />
          <Route path="/history" element={
            user.role === 'student' ? <HistoryPage user={user} /> : <Navigate to="/" />
          } />
          <Route path="/profile" element={
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
                <p className="text-slate-500 mt-2">Personalize your EduCore experience.</p>
                <div className="mt-8 py-4 px-6 bg-slate-50 rounded-xl inline-block border border-slate-100">
                  <p className="font-bold text-slate-700">{user.displayName}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
            </div>
          } />
          <Route path="/settings" element={<Navigate to="/profile" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Users,
  Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Activity, Participation } from '../../types';
import { mockApi } from '../../services/mockApi';
import { cn, formatDate, ACTIVITY_TYPE_COLORS, STATUS_COLORS } from '../../lib/utils';

export default function StudentDashboard({ user }: { user: any }) {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [participations, setParticipations] = React.useState<Participation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesData, participationsData] = await Promise.all([
          mockApi.getActivities(),
          mockApi.getParticipations(user.uid)
        ]);
        setActivities(activitiesData);
        setParticipations(participationsData);
      } catch (err) {
        console.error('Data load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user.uid]);

  const registeredActivities = participations;
  const registeredIds = new Set(registeredActivities.map(p => p.activityId));
  const upcomingEvents = activities.filter(a => a.status === 'upcoming' && !registeredIds.has(a.id));
  
  const stats = [
    { label: 'Registered', value: registeredActivities.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Hours Earned', value: 12, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Points', value: 450, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const handleRegister = async (activity: Activity) => {
    try {
      const newParticipation = await mockApi.registerForActivity({
        studentId: user.uid,
        studentName: user.displayName,
        studentEmail: user.email,
        activityId: activity.id,
        activityTitle: activity.title,
        activityDate: activity.date,
        activityType: activity.type,
        status: 'registered'
      });

      setParticipations(prev => [...prev, newParticipation]);
      // Refresh activities to update count
      const updatedActivities = await mockApi.getActivities();
      setActivities(updatedActivities);
    } catch (error) {
      alert('Registration failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Howdy, {user.displayName}!</h1>
          <p className="text-slate-500 mt-1">Ready for your next campus adventure?</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
          <Trophy className="h-4 w-4 text-amber-500" />
          Active streak: 4 days
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={cn('p-3 rounded-xl', stat.bg)}>
                <stat.icon className={cn('h-6 w-6', stat.color)} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Latest Registrations
            </h2>
            <Link to="/history" className="text-xs font-bold text-blue-600 hover:underline">
              View All History
            </Link>
          </div>

          <div className="space-y-3">
            {registeredActivities.length > 0 ? (
              registeredActivities.slice(0, 3).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg border", ACTIVITY_TYPE_COLORS[p.activityType as any])}>
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{p.activityTitle}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{formatDate(p.activityDate)}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase border border-blue-100 italic">
                    {p.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-12 text-center bg-white rounded-xl border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold">No active registrations.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Recommended</h2>
          <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-600/20">
            <Trophy className="h-10 w-10 mb-4 text-blue-200" />
            <h3 className="text-lg font-bold mb-2">Discover More</h3>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed opacity-80">Explore upcoming competitions and workshops to earn more activity points!</p>
            <Link to="/activities" className="block w-full py-3 bg-white text-blue-600 text-center font-bold text-xs rounded-xl shadow-lg hover:bg-blue-50 transition-colors">
              Browse Activities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

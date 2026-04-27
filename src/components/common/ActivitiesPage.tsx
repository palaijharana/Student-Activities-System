/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { Activity, Participation } from '../../types';
import { api } from '../../services/api';
import { cn, ACTIVITY_TYPE_COLORS } from '../../lib/utils';

export default function ActivitiesPage({ user }: { user: any }) {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [participations, setParticipations] = React.useState<Participation[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [aData, pData] = await Promise.all([
          api.getActivities(),
          user.role === 'student' ? api.getParticipations(user.uid) : Promise.resolve([])
        ]);
        setActivities(aData);
        setParticipations(pData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user.uid, user.role]);

  const filtered = activities.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || a.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleRegister = async (activity: Activity) => {
    try {
      const newP = await api.registerForActivity({
        studentId: user.uid,
        studentName: user.displayName,
        studentEmail: user.email,
        activityId: activity.id,
        activityTitle: activity.title,
        activityDate: activity.date,
        activityType: activity.type,
        status: 'registered'
      });
      setParticipations(prev => [...prev, newP]);
      alert('Registered successfully!');
    } catch (e: any) {
      alert(e.message || 'Registration failed');
    }
  };

  const isRegistered = (activityId: string) => {
    return participations.some(p => p.activityId === activityId);
  };

  const themeColor = user.role === 'student' ? 'blue' : 'orange';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Explore Activities</h1>
          <p className="text-slate-500 mt-1">Discover and join campus events, clubs, and competitions.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors", user.role === 'student' ? 'group-focus-within:text-blue-500' : 'group-focus-within:text-orange-500')} />
          <input 
            type="text" 
            placeholder="Search by title or location..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={cn("w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all", user.role === 'student' ? 'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500' : 'focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500')}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'event', 'club', 'sport', 'competition'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border",
                filterType === type 
                  ? (user.role === 'student' ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" : "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-600/20")
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((activity, i) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn('p-3 rounded-xl border-2', ACTIVITY_TYPE_COLORS[activity.type])}>
                <Calendar className="h-6 w-6" />
              </div>
              <span className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                activity.status === 'upcoming' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
              )}>
                {activity.status}
              </span>
            </div>
            <h3 className={cn("text-lg font-bold text-slate-900 group-hover:text-main transition-colors", user.role === 'student' ? 'group-hover:text-blue-600' : 'group-hover:text-orange-600')}>
              {activity.title}
            </h3>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <MapPin className="h-4 w-4" />
                {activity.location}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Users className="h-4 w-4" />
                {activity.maxParticipants ? `${activity.currentParticipants}/${activity.maxParticipants}` : activity.currentParticipants} Participants
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Coordinator</p>
                <p className="text-xs font-bold text-slate-700">{activity.coordinatorName}</p>
              </div>
              {user.role === 'student' ? (
                 <button 
                  onClick={() => handleRegister(activity)}
                  disabled={isRegistered(activity.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-600/20",
                    isRegistered(activity.id)
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  {isRegistered(activity.id) ? 'Registered' : 'Join'}
                </button>
              ) : (
                <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-400 font-bold">No activities found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

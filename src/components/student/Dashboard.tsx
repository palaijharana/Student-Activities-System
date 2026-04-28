/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Calendar, 
  Plus, 
  Search,
  TrendingUp,
  Download,
  X,
  Trash2,
  Edit2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Activity as ActivityType, Participation } from '../../types';
import { api } from '../../services/api';
import { cn, ACTIVITY_TYPE_COLORS, formatDate } from '../../lib/utils';

export default function CoordinatorDashboard({ user }: { user: any }) {
  const [activities, setActivities] = React.useState<ActivityType[]>([]);
  const [participations, setParticipations] = React.useState<Participation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      api.getActivities(),
      api.getAllParticipations()
    ]).then(([aData, pData]) => {
      setActivities(aData);
      setParticipations(pData);
      setIsLoading(false);
    }).catch(err => {
      console.error('Fetch error:', err);
      setIsLoading(false);
    });
  }, []);

  const [isAdding, setIsAdding] = React.useState(false);
  const [newActivity, setNewActivity] = React.useState({
    title: '',
    type: 'event',
    location: '',
    date: Date.now() + 86400000,
    maxParticipants: 50,
    description: 'Activity description...'
  });

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await api.addActivity({
        ...newActivity,
        coordinatorId: user.uid,
        coordinatorName: user.displayName,
        status: 'upcoming'
      } as any);
      
      setActivities(prev => [added, ...prev]);
      setIsAdding(false);
      // Reset form
      setNewActivity({
        title: '',
        type: 'event',
        location: '',
        date: Date.now() + 86400000,
        maxParticipants: 50,
        description: 'Activity description...'
      });
    } catch (error) {
      alert('Failed to add activity');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity? This will also remove all student registrations.')) return;
    try {
      await api.deleteActivity(id);
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      alert('Failed to delete activity');
    }
  };

  const exportParticipationsToExcel = async () => {
    try {
      const participations = await api.getAllParticipations();
      const data = participations.map(p => ({
        'Student Name': p.studentName,
        'Activity Title': p.activityTitle,
        'Date': formatDate(p.activityDate),
        'Type': p.activityType,
        'Status': p.status
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Participations');
      XLSX.writeFile(workbook, 'Campus_Activity_Report.xlsx');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  const uniqueStudents = new Set(participations.map(p => p.studentId)).size;
  const attendanceRate = participations.length > 0 
    ? Math.round((participations.filter(p => p.status === 'attended').length / participations.length) * 100)
    : 0;

  const stats = [
    { label: 'Managed Activities', value: activities.length, trend: '+0%', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Active Mentees', value: uniqueStudents, trend: '+0%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Mentee Attendance', value: `${attendanceRate}%`, trend: '+0%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Management Overview</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Dashboard / System Wellness</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportParticipationsToExcel}
            className="bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all"
          >
            + New Activity
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add New Activity</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddActivity} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Activity Title</label>
                <input 
                  required
                  type="text" 
                  value={newActivity.title}
                  onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
                  placeholder="e.g., Chess Tournament"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select 
                    value={newActivity.type}
                    onChange={e => setNewActivity({...newActivity, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none"
                  >
                    <option value="event">Event</option>
                    <option value="club">Club</option>
                    <option value="sport">Sport</option>
                    <option value="competition">Competition</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Max Slots</label>
                  <input 
                    type="number" 
                    value={newActivity.maxParticipants}
                    onChange={e => setNewActivity({...newActivity, maxParticipants: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                <input 
                  required
                  type="text" 
                  value={newActivity.location}
                  onChange={e => setNewActivity({...newActivity, location: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none"
                  placeholder="e.g., Room 402, Gym"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 hover:bg-orange-700"
                >
                  Create Activity
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all"
          >
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</h3>
            <div className="flex items-center gap-2 mt-4">
              <div className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', 
                stat.trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
              )}>
                {stat.trend} from last month
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-slate-900">Recently Created</h3>
             <Link to="/activities" className="text-xs font-bold text-orange-600 hover:underline">Manage All</Link>
           </div>
           <div className="space-y-3">
              {activities.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg border", ACTIVITY_TYPE_COLORS[a.type])}>
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{a.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{a.currentParticipants} Joined</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteActivity(a.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                      title="Delete Activity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
           <TrendingUp className="absolute -bottom-20 -right-10 h-64 w-64 text-white/5" />
           <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Performance Spike</h3>
              <p className="text-slate-400 text-sm mb-8">System usage is up by <span className="text-orange-400 font-bold">18%</span> this morning. Recommended action: Approve pending competition rosters.</p>
              
              <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                    <span>Task Completion</span>
                    <span>92%</span>
                 </div>
                 <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[92%] rounded-full shadow-lg shadow-orange-500/50" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

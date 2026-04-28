/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { Participation } from '../../types';
import { api } from '../../services/api';
import { cn, formatDate } from '../../lib/utils';

export default function HistoryPage({ user }: { user: any }) {
  const [participations, setParticipations] = React.useState<Participation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    api.getParticipations(user.uid).then(data => {
      setParticipations(data);
      setIsLoading(false);
    });
  }, [user.uid]);

  const stats = [
    { label: 'Completed', value: participations.filter(p => p.status === 'attended').length, color: 'text-emerald-600' },
    { label: 'Registered', value: participations.filter(p => p.status === 'registered').length, color: 'text-blue-600' },
    { label: 'Hours', value: participations.filter(p => p.status === 'attended').length * 2, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Activity History</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500">Review your past participations.</p>
            {user.studentId && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider">
                ID: {user.studentId}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter history..." 
              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {participations.length > 0 ? (
            participations.map((p, i) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div className="flex gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center border-2",
                    p.status === 'attended' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-blue-100 bg-blue-50 text-blue-600'
                  )}>
                    {p.status === 'attended' ? <CheckCircle2 className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{p.activityTitle}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(p.activityDate)}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium capitalize">{p.activityType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      p.status === 'attended' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {p.status}
                    </span>
                  </div>
                  <div className="text-right w-24">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Feedback</p>
                    <p className="text-xs text-slate-500 font-medium italic truncate">
                      {p.feedback || 'No feedback yet'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-20 text-center">
              <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">Your activity history is empty.</p>
              <p className="text-slate-400 text-sm mt-1">Start joining campus events to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

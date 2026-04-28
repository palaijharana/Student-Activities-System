/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle, 
  XCircle,
  FileSpreadsheet,
  Download,
  Activity as ActivityIcon
} from 'lucide-react';
import { Participation, Activity } from '../../types';
import { api } from '../../services/api';
import { cn, formatDate, STATUS_COLORS } from '../../lib/utils';
import * as XLSX from 'xlsx';

export default function ReportPage() {
  const [participations, setParticipations] = React.useState<Participation[]>([]);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      api.getAllParticipations(),
      api.getActivities()
    ]).then(([pData, aData]) => {
      setParticipations(pData);
      setActivities(aData);
      setIsLoading(false);
    });
  }, []);

  const filtered = participations.filter(p => {
    const matchesSearch = p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.activityTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id: string, status: Participation['status']) => {
    try {
      await api.updateParticipationStatus(id, status);
      setParticipations(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.deleteParticipation(id);
      setParticipations(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert('Failed to delete record');
    }
  };

  const exportToExcel = () => {
    const data = filtered.map(p => ({
      'Student Name': p.studentName,
      'Email': p.studentEmail,
      'Activity': p.activityTitle,
      'Type': p.activityType,
      'Date': formatDate(p.activityDate),
      'Status': p.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participation Report');
    XLSX.writeFile(workbook, 'Student_Activity_Report.xlsx');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-orange-600" />
            Participation Reports
          </h1>
          <p className="text-slate-500 mt-1">Showing participation records for your assigned mentees.</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
        >
          <Download className="h-5 w-5" />
          Export to Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search students or activities..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'registered', 'attended'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "flex-1 px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border",
                filterStatus === status 
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p, i) => (
                <motion.tr 
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{p.studentName}</p>
                    <p className="text-xs text-slate-500 font-medium">{p.studentEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700">{p.activityTitle}</p>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{p.activityType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-600">{formatDate(p.activityDate)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      STATUS_COLORS[p.status]
                    )}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {p.status === 'registered' && (
                        <button 
                          onClick={() => handleUpdateStatus(p.id, 'attended')}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Mark as Attended"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !isLoading && (
            <div className="p-20 text-center">
              <ActivityIcon className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">No participation records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

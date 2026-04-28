import React from 'react';
import { motion } from 'motion/react';
import { UserPlus, UserMinus, Search, Calendar, MapPin, Activity, History, ChevronRight, GraduationCap } from 'lucide-react';
import { UserProfile, Participation } from '../../types';
import { api } from '../../services/api';
import { cn, formatDate } from '../../lib/utils';

export default function MentorshipPage() {
  const [mentees, setMentees] = React.useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = React.useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedMentee, setSelectedMentee] = React.useState<UserProfile | null>(null);
  const [menteeActivities, setMenteeActivities] = React.useState<Participation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    loadMentees();
  }, []);

  const loadMentees = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMentees();
      setMentees(data);
    } catch (err) {
      console.error('Failed to load mentees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const data = await api.searchStudents(searchQuery);
      setSearchResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const addMentee = async (student: UserProfile) => {
    try {
      await api.addMentee(student.uid);
      setSearchResults(prev => prev.filter(s => s.uid !== student.uid));
      loadMentees();
      alert('Mentee added successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to add mentee');
    }
  };

  const removeMentee = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this mentee?')) return;
    try {
      await api.removeMentee(studentId);
      if (selectedMentee?.uid === studentId) setSelectedMentee(null);
      loadMentees();
    } catch (err: any) {
      alert(err.message || 'Failed to remove mentee');
    }
  };

  const viewMentee = async (mentee: UserProfile) => {
    setSelectedMentee(mentee);
    try {
      const activities = await api.getMenteeActivities(mentee.uid);
      setMenteeActivities(activities);
    } catch (err) {
      console.error('Failed to load mentee activities:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Mentee List & Add Controls */}
        <div className="md:w-1/3 flex flex-col gap-6">
          {/* Exact ID Addition */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-orange-600" />
              Add by Student ID
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Student ID (e.g. STU123)"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition-colors"
                disabled={isSearching}
              >
                {isSearching ? '...' : 'Find'}
              </button>
            </form>
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-slate-50 pt-4">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Search Results</p>
                {searchResults.map(student => (
                  <div key={student.uid} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {student.displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{student.displayName}</div>
                        <div className="text-xs text-slate-500">{student.studentId}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => addMentee(student)}
                      className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="mt-4 text-center py-2 text-slate-500 text-xs italic">
                No student found with this ID or name.
              </div>
            )}
          </div>

          {/* My Mentees List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-orange-600" />
              My Mentees
            </h2>
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8 text-slate-500 italic">Loading mentees...</div>
              ) : mentees.length > 0 ? (
                mentees.map(mentee => (
                  <button
                    key={mentee.uid}
                    onClick={() => viewMentee(mentee)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                      selectedMentee?.uid === mentee.uid
                        ? "bg-orange-50 border-orange-200 shadow-sm"
                        : "bg-white border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm",
                        selectedMentee?.uid === mentee.uid ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600"
                      )}>
                        {mentee.displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{mentee.displayName}</div>
                        <div className="text-xs text-slate-500">{mentee.department} • {mentee.year} Year</div>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-transform",
                      selectedMentee?.uid === mentee.uid ? "text-orange-600 translate-x-1" : "text-slate-300"
                    )} />
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No mentees yet. Search above to add them.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Mentee Details & Activities */}
        <div className="flex-1">
          {selectedMentee ? (
            <div className="space-y-6">
              {/* Mentee Header */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm">
                      {selectedMentee.displayName.charAt(0)}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">{selectedMentee.displayName}</h1>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span>ID: {selectedMentee.studentId}</span>
                        <span>•</span>
                        <span>{selectedMentee.email}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeMentee(selectedMentee.uid)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                  >
                    <UserMinus className="h-4 w-4" />
                    Remove Mentee
                  </button>
                </div>
              </div>

              {/* Mentee Activities */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <History className="h-5 w-5 text-orange-600" />
                    Participation Log
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {menteeActivities.length} Activities
                  </span>
                </div>
                <div className="">
                  {menteeActivities.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      {menteeActivities.map((participation) => (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key={participation.id}
                          className="px-6 py-4 hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-slate-900">{participation.activityTitle}</h3>
                            <span className={cn(
                              "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border",
                              participation.status === 'attended' ? "bg-green-50 text-green-700 border-green-200" :
                              participation.status === 'registered' ? "bg-blue-50 text-blue-700 border-blue-200" :
                              "bg-slate-100 text-slate-600 border-slate-200"
                            )}>
                              {participation.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(participation.activityDate)}
                            </div>
                            <div className="flex items-center gap-1 capitalize">
                              <Activity className="h-3.5 w-3.5" />
                              {participation.activityType}
                            </div>
                            <div className="flex items-center gap-1 italic">
                              <History className="h-3.5 w-3.5" />
                              Registered: {formatDate(participation.registeredAt)}
                            </div>
                          </div>
                          {participation.feedback && (
                            <div className="mt-3 p-3 bg-white border border-slate-100 rounded-lg text-xs text-slate-600 italic">
                              "{participation.feedback}"
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <History className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-500 text-sm">No activity history for this mentee yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-8">
              <div className="h-20 w-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                <GraduationCap className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Mentee</h3>
              <p className="text-slate-500 max-w-sm mb-6">
                Choose one of your mentees from the left to view their detailed activity logs and participation history.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm text-left">
                  <div className="text-orange-600 font-bold text-lg">{mentees.length}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Mentees</div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm text-left">
                  <div className="text-orange-600 font-bold text-lg">
                    {mentees.length > 0 ? 'Active' : 'Unmanaged'}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Mentorship Status</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Trophy, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ShellProps {
  children: React.ReactNode;
  userRole: 'student' | 'coordinator';
  onLogout: () => void;
  user: any;
}

export default function Shell({ children, userRole, onLogout, user }: ShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const themeColor = userRole === 'student' ? 'indigo' : 'orange';
  const themeClass = userRole === 'student' ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-orange-600 shadow-orange-600/20';
  const themeText = userRole === 'student' ? 'text-indigo-600' : 'text-orange-600';
  const themeFocus = userRole === 'student' ? 'focus:ring-indigo-500/20 focus:border-indigo-500 group-focus-within:text-indigo-500' : 'focus:ring-orange-500/20 focus:border-orange-500 group-focus-within:text-orange-500';

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Activities', href: '/activities', icon: Calendar },
    ...(userRole === 'coordinator' 
      ? [{ name: 'Reports', href: '/reports', icon: Users }] 
      : [{ name: 'My History', href: '/history', icon: Trophy }]
    ),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const initials = user.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??';

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-[#0F172A] text-slate-300 lg:flex lg:flex-col shadow-xl">
        <div className="flex h-16 items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shadow-lg", userRole === 'student' ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-orange-500 shadow-orange-500/20')}>
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">EduCore</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4 text-sm font-medium">
          <div className="px-3 py-2 text-slate-500 text-[10px] uppercase tracking-widest font-bold">Main Navigation</div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isActive 
                    ? themeClass + ' text-white' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300')} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-6 border-t border-slate-800 space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alignment</p>
            <div className="flex flex-wrap gap-2">
              <div className="bg-emerald-500/10 text-emerald-500 text-[9px] font-bold px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1.6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                SDG 3: Health
              </div>
              <div className="bg-amber-500/10 text-amber-500 text-[9px] font-bold px-2 py-1 rounded border border-amber-500/20 flex items-center gap-1.6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                SDG 4: Quality Edu
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 rounded-lg hover:bg-white/5 hover:text-slate-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <Trophy className={cn("h-6 w-6", themeText)} />
              <span className="text-lg font-bold text-slate-900">EduCore</span>
            </div>
          </div>

          <div className="flex flex-col ml-4">
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              Activity Hub / {userRole} Portal
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-64 group">
              <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors", userRole === 'student' ? 'group-focus-within:text-indigo-500' : 'group-focus-within:text-orange-500')} />
              <input 
                type="text" 
                placeholder="Search..." 
                className={cn("w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 outline-none transition-all", themeFocus)}
              />
            </div>
            
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              <span className={cn("absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-white", userRole === 'student' ? 'bg-indigo-500' : 'bg-orange-500')}></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-3 text-left">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{userRole} · {user.studentId || user.coordinatorId}</p>
              </div>
              <div className={cn("h-9 w-9 rounded-full flex items-center justify-center font-bold border shadow-sm", userRole === 'student' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-orange-50 text-orange-600 border-orange-100')}>
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden text-slate-300">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-[#0F172A] shadow-2xl flex flex-col">
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className={cn("h-6 w-6", userRole === 'student' ? 'text-indigo-500' : 'text-orange-500')} />
                <span className="text-lg font-bold text-white">EduCore</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive 
                        ? themeClass + ' text-white shadow-lg' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
               <button 
                onClick={onLogout}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 rounded-lg hover:bg-white/5 hover:text-slate-100 transition-colors"
               >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

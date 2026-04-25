import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export const ACTIVITY_TYPE_COLORS = {
  event: 'bg-blue-100 text-blue-700 border-blue-200',
  club: 'bg-purple-100 text-purple-700 border-purple-200',
  sport: 'bg-green-100 text-green-700 border-green-200',
  competition: 'bg-amber-100 text-amber-700 border-amber-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const STATUS_COLORS = {
  upcoming: 'bg-sky-100 text-sky-700',
  ongoing: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

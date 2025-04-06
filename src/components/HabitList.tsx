'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Habit } from '@/types/habit';
import { format, subDays, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import WeeklyAccomplishment from './WeeklyAccomplishment';

function EmptyState() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-64 h-64 mb-8">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-gray-200"
        >
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 6V12L16 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 16L12 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="text-xl font-medium tracking-tight mb-2">No habits yet</h3>
      <p className="text-gray-500 text-center mb-8 max-w-sm tracking-tight">
        Start building better habits today. Add your first habit and track your progress over time.
      </p>
      <button
        onClick={() => router.push('/habits/new')}
        className="px-6 py-2 bg-white text-black border border-black rounded-lg text-sm hover:bg-black hover:text-white transition-colors tracking-tight"
      >
        Create your first habit
      </button>
    </div>
  );
}

export default function HabitList() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccomplishment, setShowAccomplishment] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchHabits();
    
    // Listen for refetch events
    const handleRefetch = () => {
      fetchHabits();
    };
    window.addEventListener('refetch-habits', handleRefetch);
    
    return () => {
      window.removeEventListener('refetch-habits', handleRefetch);
    };
  }, []);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/habits');
      const data = await response.json();
      setHabits(data);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHabit = async (habit: Habit, date: string) => {
    // Optimistically update the UI
    const isCompleted = habit.completedDates.includes(date);
    const updatedHabit = {
      ...habit,
      completedDates: isCompleted
        ? habit.completedDates.filter(d => d !== date)
        : [...habit.completedDates, date]
    };

    setHabits(currentHabits =>
      currentHabits.map(h => h.id === habit.id ? updatedHabit : h)
    );

    try {
      const response = await fetch(`/api/habits/${habit.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle habit');
      }
      
      // Silently refresh habits in background
      const refreshResponse = await fetch('/api/habits');
      const refreshedData = await refreshResponse.json();
      setHabits(refreshedData);
      
      // Check if this completion triggers a weekly accomplishment
      if (habit.frequency === 'weekly' && isWeekComplete(updatedHabit)) {
        setShowAccomplishment(habit.id);
        // Reset accomplishment after 3 seconds
        setTimeout(() => setShowAccomplishment(null), 3000);
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error);
      // Revert the optimistic update on error
      await fetchHabits();
    }
  };

  const isCompletedOnDate = (habit: Habit, date: string) => {
    return habit.completedDates.includes(date);
  };

  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    return dates;
  };

  const getDayLabel = (date: string) => {
    return format(parseISO(date), 'EEEEE'); // Single letter day format
  };

  const isWeekComplete = (habit: Habit) => {
    if (habit.frequency !== 'weekly') return false;
    
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    
    // Count completions within this week
    const completionsThisWeek = habit.completedDates.filter(date => {
      const completionDate = parseISO(date);
      return isWithinInterval(completionDate, { start: weekStart, end: weekEnd });
    });
    
    return completionsThisWeek.length > 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 w-24 bg-foreground/5 rounded mb-3" />
            <div className="flex gap-4">
              {[...Array(7)].map((_, j) => (
                <div key={j} className="flex-1 flex flex-col items-center gap-2">
                  <div className="h-3 w-3 bg-foreground/5 rounded" />
                  <div className="w-5 h-5 rounded-full bg-foreground/5" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!habits || habits.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {habits.map((habit) => (
        <div key={habit.id} className="group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/habits/${habit.id}`)}
                className="text-left group"
              >
                <div className="font-medium group-hover:underline">{habit.name}</div>
              </button>
              {habit.frequency === 'weekly' && (
                <span className="text-xs text-muted-foreground">(weekly)</span>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            {getLast7Days().map((date) => (
              <button
                key={date}
                onClick={() => toggleHabit(habit, date)}
                className="flex-1"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground">{getDayLabel(date)}</span>
                  <div
                    style={{
                      backgroundColor: isCompletedOnDate(habit, date) ? 'var(--checkbox-bg)' : 'transparent',
                      borderColor: isCompletedOnDate(habit, date) ? 'var(--checkbox-border)' : 'rgba(var(--checkbox-border), 0.4)'
                    }}
                    className={`
                      w-5 h-5 rounded-full transition-all duration-200 border
                      hover:border-[color:var(--checkbox-border)]
                    `}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      {showAccomplishment && <WeeklyAccomplishment />}
    </div>
  );
}

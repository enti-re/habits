'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { parseISO, format, isValid, isSameDay, eachDayOfInterval, startOfYear, endOfYear, endOfMonth, addWeeks, addDays } from 'date-fns';
import type { Habit } from '@/types/habit';
import DeleteHabitDialog from '@/components/DeleteHabitDialog';
import { YearlyOverview } from '@/components/YearlyOverview';

function getInsights(habit: Habit, days: Date[]) {
  const completionRate = getCompletionRate(habit, days);
  const frequency = habit.frequency;

  let targetRate = 0;
  if (frequency === 'daily') {
    targetRate = 100;
  } else if (frequency === 'weekly') {
    targetRate = 14.28; // 1/7 days
  } else if (frequency?.includes('days per week')) {
    const daysPerWeek = parseInt(frequency.split(' ')[0]);
    targetRate = (daysPerWeek / 7) * 100;
  } else if (frequency?.includes('days per month')) {
    const daysPerMonth = parseInt(frequency.split(' ')[0]);
    targetRate = (daysPerMonth / 30) * 100;
  }

  const performance = targetRate === 0 ? 0 : Math.min(100, (completionRate / targetRate) * 100);

  let message = '';
  if (performance >= 100) {
    message = 'Excellent! You\'re exceeding your goals. Keep up the great work! 🎉';
  } else if (performance >= 80) {
    message = 'Good progress! You\'re close to your target. Keep pushing! 💪';
  } else if (performance >= 50) {
    message = 'You\'re making progress, but there\'s room for improvement. Stay focused! 🎯';
  } else {
    message = 'You might need to adjust your goals or find ways to build this habit more consistently. Don\'t give up! 🌱';
  }

  return {
    completionRate: Math.round(completionRate),
    targetRate: Math.round(targetRate),
    performance: Math.round(performance),
    message
  };
}

function getCompletionRate(habit: Habit, days: Date[]) {
  if (!habit.completedDates) return 0;
  const completedDates = habit.completedDates
    .map(d => {
      try {
        const date = parseISO(d);
        return isValid(date) ? date : null;
      } catch {
        return null;
      }
    })
    .filter((d): d is Date => d !== null);

  const completedCount = days.filter(day => 
    completedDates.some(completedDate => isSameDay(completedDate, day))
  ).length;
  return (completedCount / days.length) * 100;
}

export default function HabitDetails({ params }: { params: { id: string } }) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchHabit();
  }, [params.id]);

  const fetchHabit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/habits/${params.id}`);
      const data = await response.json();
      if (!data.completedDates) {
        data.completedDates = [];
      }
      setHabit(data);
    } catch (error) {
      console.error('Failed to fetch habit:', error);
      setError('Failed to load habit details');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHabit = async () => {
    try {
      const response = await fetch(`/api/habits/${params.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete habit');
      }
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete habit:', error);
      setError('Failed to delete habit');
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </main>
    );
  }

  if (error || !habit) {
    return (
      <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
        <div className="text-red-500">{error || 'Habit not found'}</div>
      </main>
    );
  }

  const completedDates = habit.completedDates
    .map(d => {
      try {
        const date = parseISO(d);
        return isValid(date) ? date : null;
      } catch {
        return null;
      }
    })
    .filter((d): d is Date => d !== null);

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back
          </Link>
          
          <div className="flex items-center gap-3">
            <Link
              href={`/habits/${habit.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-accent-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              </svg>
              Edit
            </Link>

            <button
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              Delete
            </button>
          </div>
        </div>

        <div className="flex items-baseline gap-4 mb-6">
          <h1 className="text-2xl font-medium text-foreground">{habit.name}</h1>
        </div>

        <div className="space-y-4 text-muted-foreground">
          {habit.description && <p>{habit.description}</p>}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Frequency</div>
            <div className="px-4 py-3 border rounded-lg text-sm bg-muted text-muted-foreground dark:bg-accent dark:border-accent">
              {habit.frequency === 'daily' && 'Every day'}
              {habit.frequency === 'weekly' && 'Once a week'}
              {habit.frequency === '3 days per week' && 'Three times a week'}
              {habit.frequency === '5 days per week' && 'Five times a week'}
              {habit.frequency?.includes('days per') && !['3 days per week', '5 days per week'].includes(habit.frequency) && (
                <>
                  {habit.frequency.split(' ')[0]} times per {habit.frequency.split(' ').pop()}
                </>
              )}
            </div>
          </div>
          {habit.reminder && habit.reminderTime && (() => {
            try {
              const date = parseISO(habit.reminderTime);
              if (isValid(date)) {
                return <p>Reminder at {format(date, 'h:mm a')}</p>;
              }
              return null;
            } catch {
              return null;
            }
          })()}
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-sm">{year}</div>
          <div className="flex gap-4 text-xs">
            <button
              onClick={() => setYear(year - 1)}
              className="text-muted-foreground hover:text-foreground"
            >
              {year - 1}
            </button>
            <button
              onClick={() => setYear(year + 1)}
              className="text-muted-foreground hover:text-foreground"
              disabled={year >= new Date().getFullYear()}
            >
              {year + 1}
            </button>
          </div>
        </div>

        {/* Contribution graph */}
        <div>
          {/* Month labels */}
          <div className="flex mb-2">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="flex-1 text-[11px] text-muted-foreground"
              >
                {format(new Date(year, i), 'MMM')}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {/* Days grid */}
            <div className="flex-1 grid grid-cols-[repeat(53,1fr)] gap-[3px]">
              {Array.from({ length: 53 }, (_, weekIndex) => {
                const weekStart = startOfYear(new Date(year, 0));
                const week = addWeeks(weekStart, weekIndex);
                const days = Array.from({ length: 7 }, (_, dayIndex) =>
                  addDays(week, dayIndex)
                );

                return (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {days.map((day) => {
                      const isCompleted = completedDates.some(d => isSameDay(d, day));
                      const isFutureDate = day > new Date();
                      const isThisYear = day.getFullYear() === year;
                      
                      if (!isThisYear) return <div key={day.toISOString()} className="h-[10px]" />;

                      return (
                        <div
                          key={day.toISOString()}
                          className={`
                            h-[10px] w-[10px]
                            ${isCompleted
                              ? 'bg-gray-900 dark:bg-white'
                              : isFutureDate
                              ? 'bg-gray-50 dark:bg-gray-900'
                              : 'bg-gray-100 dark:bg-gray-800'
                            }
                          `}
                          title={`${format(day, 'MMM d, yyyy')}${
                            isCompleted ? ' - Completed' : isFutureDate ? ' - Future date' : ' - Not completed'
                          }`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <DeleteHabitDialog
          habitId={habit.id}
          habitName={habit.name}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
    </main>
  );
}

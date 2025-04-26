'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { YearlyOverview } from '@/components/YearlyOverview';
import { getHabit, deleteHabit, updateHabit } from '@/utils/storage';
import type { Habit } from '@/types/habit';
import { calculateStreak } from '@/utils/streakCalculator';

export function HabitDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const loadHabit = () => {
      const data = getHabit(params.id);
      setHabit(data || null);
      if (data) {
        setStreak(calculateStreak(data.completedDates));
      }
      setIsLoading(false);
    };
    loadHabit();
  }, [params.id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this habit?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = deleteHabit(params.id);
      if (success) {
        router.push('/');
      } else {
        throw new Error('Failed to delete habit');
      }
    } catch (error) {
      console.error('Failed to delete habit:', error);
      setIsDeleting(false);
    }
  };

  const handleDateSelect = (date: string) => {
    if (!habit) return;

    const updatedDates = habit.completedDates.includes(date)
      ? habit.completedDates.filter(d => d !== date)
      : [...habit.completedDates, date];

    const updatedHabit = {
      ...habit,
      completedDates: updatedDates,
    };

    setHabit(updatedHabit);
    setStreak(calculateStreak(updatedDates));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4 text-foreground">Habit not found</h1>
          <Link
            href="/"
            className="text-accent-foreground hover:text-accent-foreground dark:text-accent-foreground dark:hover:text-accent-foreground"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
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
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium mb-2 text-foreground">{habit.name}</h1>
            {habit.description && (
              <p className="text-muted-foreground mb-4">{habit.description}</p>
            )}
            <div className="text-sm text-muted-foreground">
              <p>Created on {format(new Date(habit.createdAt), 'MMMM d, yyyy')}</p>
              <p>Frequency: {habit.frequency}</p>
              <p>
                Reminder:{' '}
                {habit.reminder
                  ? `On (${habit.reminderTime})`
                  : 'Off'}
              </p>
              <p>Current Streak: {streak} days</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/habits/edit?id=${habit.id}`}
              className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2"> */}
        {/* <div>
          <Calendar
            completedDates={habit.completedDates}
            onDateSelect={handleDateSelect}
          />
          <Insights
            completedDates={habit.completedDates}
            frequency={habit.frequency}
          />
        </div> */}
        <div>
          <YearlyOverview completedDates={habit.completedDates} />
        </div>
      {/* </div> */}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { parseISO, format, isSameDay } from 'date-fns';
import { startOfWeek, endOfWeek } from 'date-fns';
import type { Habit } from '@/types/habit';
import { getCurrentWeekDates, isDateCompleted } from '@/utils/dateUtils';
import ThemeToggle from '@/components/ThemeToggle';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const weekDates = getCurrentWeekDates();

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await fetch('/api/habits');
        const data = await response.json();
        setHabits(data);
      } catch (error) {
        console.error('Failed to fetch habits:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHabits();
  }, []);

  const toggleHabit = async (habitId: string, dateString: string) => {
    if (isUpdating) return;

    try {
      setIsUpdating(habitId);
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const isCompleted = isDateCompleted(habit.completedDates, dateString);
      const updatedDates = isCompleted
        ? (habit.completedDates || []).filter(date => !isSameDay(parseISO(date), parseISO(dateString)))
        : [...(habit.completedDates || []), dateString];

      // Update local state immediately for better UX
      setHabits(habits.map(h => 
        h.id === habitId 
          ? { ...h, completedDates: updatedDates }
          : h
      ));

      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedDates: updatedDates
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update habit');
      }

      // Update with server response
      const updatedHabit = await response.json();
      setHabits(habits.map(h => 
        h.id === habitId ? updatedHabit : h
      ));
    } catch (error) {
      console.error('Failed to toggle habit:', error);
      // Revert on error
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        setHabits([...habits]);
      }
    } finally {
      setIsUpdating(null);
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

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">habits</h1>
          <p className="text-muted-foreground text-sm mt-1">track your progress</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/habits/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
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
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
            New Habit
          </Link>
        </div>
      </header>

      {habits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No habits yet. Start by creating a new habit!</p>
          <Link
            href="/habits/new"
            className="inline-flex items-center gap-2 text-sm text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
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
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
            Create your first habit
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center mb-2">
            <div className="w-48 shrink-0" />
            <div className="flex-1 flex justify-between">
              {weekDates.map((date) => (
                <div
                  key={date.dateString}
                  className="w-5 h-5 flex items-center justify-center"
                >
                  <span className="text-xs text-muted-foreground leading-none">{date.dayName[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {habits.map((habit) => {
            return (
              <div
                key={habit.id}
                className="flex items-center gap-4"
              >
                <div className="w-48 shrink-0">
                  <div className="overflow-hidden">
                    <Link
                      href={`/habits/${habit.id}`}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                        {habit.name}
                      </h2>
                    </Link>
                  </div>
                </div>

                <div className="flex-1 flex justify-between">
                  {weekDates.map((date) => {
                    const completed = isDateCompleted(habit.completedDates, date.dateString);
                    
                    return (
                      <button
                        key={date.dateString}
                        onClick={() => toggleHabit(habit.id, date.dateString)}
                        className={`w-5 h-5 rounded transition-colors flex items-center justify-center ${
                          completed
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        } ${date.isToday ? 'ring-1 ring-gray-400 dark:ring-gray-600' : ''}`}
                        disabled={isUpdating === habit.id}
                        title={`${date.dayName} ${format(date.date, 'MMM d')} - ${completed ? 'Completed' : 'Not done'}`}
                      >
                        {completed && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-3 h-3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

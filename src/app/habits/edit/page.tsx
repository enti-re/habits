'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FrequencySelect from '@/components/FrequencySelect';
import ReminderSelect from '@/components/ReminderSelect';
import { getHabit, updateHabit } from '@/utils/storage';
import type { Habit } from '@/types/habit';

export default function EditHabit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      router.push('/');
      return;
    }

    const data = getHabit(id);
    if (!data) {
      router.push('/');
      return;
    }

    setHabit(data);
    setIsLoading(false);
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!habit) return;

    setIsSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      updateHabit(habit.id, {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        frequency: formData.get('frequency') as string,
        reminder: formData.get('reminder') === 'on',
        reminderTime: formData.get('reminderTime') as string,
      });
      router.push(`/habits/detail?id=${habit.id}`);
    } catch (err) {
      setError('Failed to update habit');
      setIsSaving(false);
    }
  };

  if (isLoading || !habit) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            href={`/habits/detail?id=${habit.id}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-black transition-colors"
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
        <h1 className="text-2xl font-medium">Edit Habit</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            autoComplete="off"
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground border-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={habit.description}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Frequency
          </label>
          <FrequencySelect defaultValue={habit.frequency} />
        </div>

        <ReminderSelect
          defaultEnabled={habit.reminder}
          defaultTime={habit.reminderTime}
        />

        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href={`/habits/detail?id=${habit.id}`}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:text-gray-900 border hover:bg-white hover:border-gray-900 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FrequencySelect from '@/components/FrequencySelect';
import ReminderSelect from '@/components/ReminderSelect';

export default function NewHabit() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frequency, setFrequency] = useState('daily');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name')?.toString().trim(),
      description: formData.get('description')?.toString().trim() || '',
      frequency,
      reminder: formData.get('reminder') === 'on',
      reminderTime: formData.get('reminderTime')?.toString() || null,
    };

    // Validate required fields
    if (!data.name) {
      setError('Name is required');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || 'Failed to create habit');
      }

      const habit = await res.json();
      router.push(`/habits/${habit.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent-foreground transition-colors"
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
        <h1 className="text-2xl font-medium">Create New Habit</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm text-muted-foreground mb-2 ">
            Name
          </label>
          <input
            type="text"
            id="name"
            autoComplete='off'
            name="name"
            required
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-foreground border-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm text-muted-foreground mb-2">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-foreground border-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            Frequency
          </label>
          <FrequencySelect 
            value={frequency}
            onChange={setFrequency}
            disabled={isLoading}
          />
        </div>

        <ReminderSelect disabled={isLoading} />

        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/"
            className="px-4 py-2 text-sm text-muted-foreground rounded-lg hover:text-accent-foreground border hover:border-red-600 hover:text-red-600 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:text-gray-900 border hover:bg-white hover:border-gray-900 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Creating...
              </>
            ) : 'Create Habit'}
          </button>
        </div>
      </form>
    </div>
  );
}

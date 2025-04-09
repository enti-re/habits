'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Habit } from '@/types/habit';
import FrequencySelect from '@/components/FrequencySelect';
import ReminderSelect from '@/components/ReminderSelect';

export default function EditHabit({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/habits/${params.id}`)
      .then((res) => res.json())
      .then((data) => setHabit(data))
      .catch((err) => setError('Failed to load habit'));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      frequency: formData.get('frequency'),
      reminder: formData.get('reminder') === 'on',
      reminderTime: formData.get('reminderTime'),
    };

    try {
      const res = await fetch(`/api/habits/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to update habit');
      }

      router.push(`/habits/${params.id}`);
    } catch (err) {
      setError('Failed to update habit');
    } finally {
      setIsLoading(false);
    }
  };

  if (!habit) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            href={`/habits/${params.id}`}
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
        <h1 className="text-2xl font-medium">Edit Habit</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm text-muted-foreground mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={habit.name}
            required
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground border-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm text-muted-foreground mb-2">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={habit.description}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground border-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">
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
            href={`/habits/${params.id}`}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-accent-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewHabitForm() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      setName('');
      // Force a server-side revalidation
      router.refresh();
      // Force a client-side refetch
      const event = new CustomEvent('refetch-habits');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="add new habit..."
        className="w-full px-4 py-2 text-sm bg-transparent border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
      />
    </form>
  );
}

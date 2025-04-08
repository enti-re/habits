'use client';

import { useSearchParams } from 'next/navigation';
import { HabitDetail } from '@/components/HabitDetail';

export default function HabitDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (!id) {
    return <div>Invalid habit ID</div>;
  }

  return <HabitDetail params={{ id }} />;
}

import { parseISO, isSameDay, differenceInDays } from 'date-fns';

export function calculateStreak(completedDates: string[] = []): number {
  if (!completedDates.length) return 0;

  const dates = completedDates
    .map(d => parseISO(d))
    .sort((a, b) => b.getTime() - a.getTime()); // Sort in descending order

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // If no completion today or yesterday, streak is 0
  if (!dates.some(d => isSameDay(d, today) || isSameDay(d, yesterday))) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = differenceInDays(dates[i - 1], dates[i]);
    if (diff <= 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

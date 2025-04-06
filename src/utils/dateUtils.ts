import { startOfWeek, addDays, format, parseISO, isSameDay, endOfWeek, differenceInDays } from 'date-fns';

export function getCurrentWeekDates() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date,
      dayName: format(date, 'EEE'),
      isToday: isSameDay(date, today),
      dateString: format(date, 'yyyy-MM-dd')
    };
  });
}

export const isDateCompleted = (completedDates: string[] | undefined, dateString: string) => {
  if (!completedDates) return false;
  return completedDates.some(date => isSameDay(parseISO(date), parseISO(dateString)));
};

export const isDateSkipped = (skippedDates: string[] | undefined, dateString: string) => {
  if (!skippedDates) return false;
  return skippedDates.some(date => isSameDay(parseISO(date), parseISO(dateString)));
};

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

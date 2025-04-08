'use client';

import { format, startOfYear, eachDayOfInterval, endOfYear, isSameDay } from 'date-fns';

interface YearlyOverviewProps {
  completedDates: string[];
}

export function YearlyOverview({ completedDates }: YearlyOverviewProps) {
  const year = new Date().getFullYear();
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(yearStart);
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

  // Group days by month
  const months = Array.from({ length: 12 }, (_, i) => {
    const daysInMonth = allDays.filter(day => day.getMonth() === i);
    return daysInMonth;
  });

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium mb-4">Yearly Overview</h2>
      <div className="grid grid-cols-12 gap-px bg-gray-200 dark:bg-gray-700 p-px rounded-lg overflow-hidden">
        {months.map((month, monthIndex) => (
          <div key={monthIndex} className="space-y-px">
            <div className="text-[10px] text-muted-foreground text-center mb-px">
              {format(new Date(year, monthIndex), 'MMM')}
            </div>
            <div className="grid grid-cols-1 gap-px">
              {month.map(day => {
                const isCompleted = completedDates.some(date =>
                  isSameDay(new Date(date), day)
                );

                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      w-full aspect-square
                      ${isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800'}
                    `}
                    title={format(day, 'MMM d, yyyy')}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

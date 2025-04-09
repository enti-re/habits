'use client';

import { useState } from 'react';

interface ReminderSelectProps {
  defaultEnabled?: boolean;
  defaultTime?: string;
  disabled?: boolean;
}

const timePresets = [
  { label: 'Early Morning', time: '06:00' },
  { label: 'Morning', time: '09:00' },
  { label: 'Afternoon', time: '14:00' },
  { label: 'Evening', time: '18:00' },
  { label: 'Night', time: '21:00' },
];

export default function ReminderSelect({ defaultEnabled = false, defaultTime = '09:00', disabled }: ReminderSelectProps) {
  const [reminder, setReminder] = useState(defaultEnabled);
  const [reminderTime, setReminderTime] = useState(defaultTime);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="reminder"
          name="reminder"
          checked={reminder}
          onChange={(e) => setReminder(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-gray-300 text-foreground focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <label htmlFor="reminder" className="text-sm text-muted-foreground">
          Enable reminders
        </label>
      </div>

      {reminder && (
        <div className="space-y-4">
          <div>
            <label htmlFor="reminderTime" className="block text-sm text-muted-foreground mb-2">
              Reminder time
            </label>
            <input
              type="time"
              id="reminderTime"
              name="reminderTime"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              required
              disabled={disabled}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground border-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {timePresets.map((preset) => (
              <button
                key={preset.time}
                type="button"
                onClick={() => setReminderTime(preset.time)}
                disabled={disabled}
                className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                  reminderTime === preset.time 
                    ? 'bg-foreground text-background border-foreground' 
                    : 'border-muted text-muted-foreground hover:text-accent-foreground hover:border-accent-foreground'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

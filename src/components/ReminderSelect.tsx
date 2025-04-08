'use client';

import { useState } from 'react';

interface ReminderSelectProps {
  defaultEnabled?: boolean;
  defaultTime?: string;
  disabled?: boolean;
}

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
          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <label htmlFor="reminder" className="text-sm font-medium">
          Enable reminders
        </label>
      </div>

      {reminder && (
        <div>
          <label htmlFor="reminderTime" className="block text-sm font-medium mb-2">
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
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      )}
    </div>
  );
}

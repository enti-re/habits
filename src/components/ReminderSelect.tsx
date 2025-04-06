'use client';

import { useState } from 'react';

interface ReminderSelectProps {
  defaultEnabled?: boolean;
  defaultTime?: string;
}

export default function ReminderSelect({ defaultEnabled = false, defaultTime = '09:00' }: ReminderSelectProps) {
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);
  const [selectedTime, setSelectedTime] = useState(defaultTime);
  const [activeTab, setActiveTab] = useState('presets');

  const formatTime = (time: string) => {
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
    } catch {
      return time;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex items-center h-6">
          <input
            type="checkbox"
            id="reminder"
            name="reminder"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="reminder" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Daily Reminder
          </label>
          {isEnabled && (
            <div className="mt-3">
              <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'presets'
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Presets
                  {activeTab === 'presets' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('custom')}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'custom'
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Custom
                  {activeTab === 'custom' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
                  )}
                </button>
              </div>

              <div className="pt-3">
                {activeTab === 'presets' ? (
                  <div className="flex gap-2">
                    {[
                      { time: '09:00', label: 'Morning' },
                      { time: '14:00', label: 'Afternoon' },
                      { time: '20:00', label: 'Evening' },
                    ].map((preset) => (
                      <button
                        key={preset.time}
                        type="button"
                        onClick={() => setSelectedTime(preset.time)}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                          selectedTime === preset.time
                            ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 dark:border-gray-800 dark:hover:border-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        <div className="font-medium">{preset.label}</div>
                        <div className="text-xs opacity-75">
                          {formatTime(preset.time)}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTime(selectedTime)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isEnabled
              ? `You'll get a notification at ${formatTime(selectedTime)}`
              : 'Enable notifications for this habit'}
          </div>
        </div>
      </div>

      <input
        type="hidden"
        name="reminderTime"
        value={selectedTime}
      />
    </div>
  );
}

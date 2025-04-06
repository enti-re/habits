'use client';

import { useState, useEffect } from 'react';

interface FrequencySelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function FrequencySelect({ value, defaultValue, onChange, disabled }: FrequencySelectProps) {
  const [customNumber, setCustomNumber] = useState('');
  const [customPeriod, setCustomPeriod] = useState('month');
  const [selectedOption, setSelectedOption] = useState(value || defaultValue || 'daily');

  useEffect(() => {
    if (value?.includes('days per')) {
      const [number, , , period] = value.split(' ');
      if (!['daily', 'weekly'].includes(value)) {
        setSelectedOption('custom');
        setCustomNumber(number);
        setCustomPeriod(period);
      }
    }
  }, [value]);

  const handleCustomChange = (number: string, period: string) => {
    setCustomNumber(number);
    setCustomPeriod(period);
    onChange?.(`${number} days per ${period}`);
  };

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    if (value !== 'custom') {
      onChange?.(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleOptionChange('daily')}
          disabled={disabled}
          className={`px-4 py-3 border rounded-lg text-sm text-left transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${
            selectedOption === 'daily' ? 'border-gray-900 dark:border-white' : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="font-medium mb-1">Daily</div>
          <div className="text-muted-foreground text-xs">Every day</div>
        </button>
        <button
          type="button"
          onClick={() => handleOptionChange('weekly')}
          disabled={disabled}
          className={`px-4 py-3 border rounded-lg text-sm text-left transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${
            selectedOption === 'weekly' ? 'border-gray-900 dark:border-white' : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="font-medium mb-1">Weekly</div>
          <div className="text-muted-foreground text-xs">Once a week</div>
        </button>
        <button
          type="button"
          onClick={() => handleOptionChange('3 days per week')}
          disabled={disabled}
          className={`px-4 py-3 border rounded-lg text-sm text-left transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${
            selectedOption === '3 days per week' ? 'border-gray-900 dark:border-white' : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="font-medium mb-1">3 days / week</div>
          <div className="text-muted-foreground text-xs">Three times a week</div>
        </button>
        <button
          type="button"
          onClick={() => handleOptionChange('5 days per week')}
          disabled={disabled}
          className={`px-4 py-3 border rounded-lg text-sm text-left transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${
            selectedOption === '5 days per week' ? 'border-gray-900 dark:border-white' : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="font-medium mb-1">5 days / week</div>
          <div className="text-muted-foreground text-xs">Five times a week</div>
        </button>
        <button
          type="button"
          onClick={() => handleOptionChange('custom')}
          disabled={disabled}
          className={`px-4 py-3 border rounded-lg text-sm text-left transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          } col-span-2 ${
            selectedOption === 'custom' ? 'border-gray-900 dark:border-white' : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="font-medium mb-1">Custom</div>
          <div className="text-muted-foreground text-xs">Set your own frequency</div>
        </button>
      </div>

      {selectedOption === 'custom' && (
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="customNumber" className="block text-sm font-medium mb-2">
              Number of days
            </label>
            <input
              type="number"
              id="customNumber"
              min="1"
              max="31"
              value={customNumber}
              onChange={(e) => handleCustomChange(e.target.value, customPeriod)}
              disabled={disabled}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 dark:bg-gray-900 dark:border-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="customPeriod" className="block text-sm font-medium mb-2">
              Period
            </label>
            <select
              id="customPeriod"
              value={customPeriod}
              onChange={(e) => handleCustomChange(customNumber, e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 dark:bg-gray-900 dark:border-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="week">per week</option>
              <option value="month">per month</option>
            </select>
          </div>
        </div>
      )}

      <input
        type="hidden"
        name="frequency"
        value={selectedOption === 'custom' ? `${customNumber} days per ${customPeriod}` : selectedOption}
      />
    </div>
  );
}

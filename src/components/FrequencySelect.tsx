'use client';

import { useState, useEffect } from 'react';

interface FrequencySelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

interface FrequencyOption {
  value: string;
  label: string;
  description: string;
}

const frequencyOptions: FrequencyOption[] = [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Once a week' },
  { value: '3 days per week', label: '3 days / week', description: 'Three times a week' },
  { value: '5 days per week', label: '5 days / week', description: 'Five times a week' },
  { value: 'custom', label: 'Custom', description: 'Set your own frequency' },
];

export default function FrequencySelect({ value, defaultValue = 'daily', onChange, disabled }: FrequencySelectProps) {
  const [selectedOption, setSelectedOption] = useState(value || defaultValue);
  const [customNumber, setCustomNumber] = useState('1');
  const [customPeriod, setCustomPeriod] = useState('week');

  useEffect(() => {
    if (value?.includes('days per')) {
      const [number, , , period] = value.split(' ');
      setSelectedOption('custom');
      setCustomNumber(number);
      setCustomPeriod(period);
    }
  }, [value]);

  const handleCustomChange = (number: string, period: string) => {
    if (number && Number(number) > 0) {
      setCustomNumber(number);
      setCustomPeriod(period);
      const newValue = `${number} days per ${period}`;
      onChange?.(newValue);
    }
  };

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    if (value !== 'custom') {
      onChange?.(value);
    }
  };

  const currentValue = selectedOption === 'custom' 
    ? `${customNumber} days per ${customPeriod}` 
    : selectedOption;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {frequencyOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleOptionChange(option.value)}
            disabled={disabled}
            className={`px-4 py-3 border rounded-lg text-sm text-left transition-colors ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted hover:border-foreground hover:text-foreground'
            } ${
              selectedOption === option.value 
                ? 'bg-foreground border-foreground text-background' 
                : 'border-muted text-muted-foreground'
            } ${option.value === 'custom' ? 'col-span-2' : ''}`}
          >
            <div className={`font-medium mb-1 ${selectedOption === option.value ? 'text-background' : ''}`}>{option.label}</div>
            <div className={`text-xs ${selectedOption === option.value ? 'text-background/80' : 'text-muted-foreground'}`}>{option.description}</div>
          </button>
        ))}
      </div>

      {selectedOption === 'custom' && (
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="customNumber" className="block text-sm text-muted-foreground mb-2">
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
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground border-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="customPeriod" className="block text-sm text-muted-foreground mb-2">
              Period
            </label>
            <select
              id="customPeriod"
              value={customPeriod}
              onChange={(e) => handleCustomChange(customNumber, e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground border-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
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
        value={currentValue}
      />
    </div>
  );
}

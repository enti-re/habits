export type Habit = {
  id: string;
  name: string;
  frequency: string;
  reminder: boolean;
  reminderTime: string;
  description: string;
  createdAt: string;
  completedDates: string[];
};

export type HabitFormData = {
  name: string;
  frequency: string;
  reminder: boolean;
  reminderTime: string;
  description: string;
};

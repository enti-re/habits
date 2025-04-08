import type { Habit } from '@/types/habit';

const HABITS_KEY = 'habits';

export function getHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(HABITS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveHabits(habits: Habit[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function getHabit(id: string): Habit | undefined {
  const habits = getHabits();
  return habits.find(h => h.id === id);
}

export function addHabit(habit: Omit<Habit, 'id'>): Habit {
  const habits = getHabits();
  const newHabit = {
    ...habit,
    id: Math.random().toString(36).substr(2, 9),
    completedDates: []
  };
  habits.push(newHabit);
  saveHabits(habits);
  return newHabit;
}

export function updateHabit(id: string, updates: Partial<Habit>): Habit | undefined {
  const habits = getHabits();
  const index = habits.findIndex(h => h.id === id);
  if (index === -1) return undefined;

  const updatedHabit = {
    ...habits[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  habits[index] = updatedHabit;
  saveHabits(habits);
  return updatedHabit;
}

export function deleteHabit(id: string): boolean {
  const habits = getHabits();
  const index = habits.findIndex(h => h.id === id);
  if (index === -1) return false;

  habits.splice(index, 1);
  saveHabits(habits);
  return true;
}

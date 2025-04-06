import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';
import type { Habit } from '@/types/habit';

const HABITS_KEY = 'habits';

async function getHabits(): Promise<Habit[]> {
  try {
    const habits = await kv.get<Habit[]>(HABITS_KEY);
    return habits || [];
  } catch (error) {
    console.error('Error reading habits:', error);
    return [];
  }
}

async function saveHabits(habits: Habit[]) {
  await kv.set(HABITS_KEY, habits);
}

export async function GET() {
  try {
    const habits = await getHabits();
    return NextResponse.json(habits);
  } catch (error) {
    console.error('Error in GET /api/habits:', error);
    return new NextResponse(null, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const habits = await getHabits();
    const data = await request.json();

    const newHabit: Habit = {
      id: uuidv4(),
      name: data.name,
      frequency: data.frequency,
      reminder: data.reminder,
      reminderTime: data.reminderTime,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      completedDates: []
    };

    habits.push(newHabit);
    await saveHabits(habits);

    return NextResponse.json(newHabit);
  } catch (error) {
    console.error('Error in POST /api/habits:', error);
    return new NextResponse(null, { status: 500 });
  }
}

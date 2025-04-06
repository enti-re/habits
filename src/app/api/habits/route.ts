import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Habit } from '@/types/habit';

// File storage for local development
const DATA_DIR = path.join(process.cwd(), 'data');
const HABITS_FILE = path.join(DATA_DIR, 'habits.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function getHabits(): Promise<Habit[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(HABITS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If file doesn't exist, return empty array
      return [];
    }
    console.error('Error reading habits:', error);
    return [];
  }
}

async function saveHabits(habits: Habit[]) {
  await ensureDataDir();
  await fs.writeFile(HABITS_FILE, JSON.stringify(habits, null, 2));
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

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Habit } from '@/types/habit';

export const dynamic = 'force-dynamic';

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
    try {
      const data = await fs.readFile(HABITS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // If file doesn't exist, return empty array
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error('Error reading habits:', error);
    throw error;
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
    return new NextResponse('Error reading habits', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || typeof data.name !== 'string') {
      return new NextResponse('Name is required and must be a string', { status: 400 });
    }

    if (!data.frequency || typeof data.frequency !== 'string') {
      return new NextResponse('Frequency is required and must be a string', { status: 400 });
    }

    // Validate optional fields
    if (data.reminder !== undefined && typeof data.reminder !== 'boolean') {
      return new NextResponse('Reminder must be a boolean', { status: 400 });
    }

    // Only validate reminderTime if it's provided and not null
    if (data.reminderTime !== undefined && data.reminderTime !== null && typeof data.reminderTime !== 'string') {
      return new NextResponse('Reminder time must be a string', { status: 400 });
    }

    if (data.description !== undefined && typeof data.description !== 'string') {
      return new NextResponse('Description must be a string', { status: 400 });
    }

    const habits = await getHabits();

    const newHabit: Habit = {
      id: uuidv4(),
      name: data.name.trim(),
      frequency: data.frequency,
      reminder: data.reminder ?? false,
      reminderTime: data.reminderTime || null,
      description: data.description?.trim() || '',
      createdAt: new Date().toISOString(),
      completedDates: []
    };

    habits.push(newHabit);
    await saveHabits(habits);

    return NextResponse.json(newHabit, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/habits:', error);
    if (error instanceof SyntaxError) {
      return new NextResponse('Invalid JSON payload', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

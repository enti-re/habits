import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Habit } from '@/types/habit';

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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const habits = await getHabits();
    const habit = habits.find((h: Habit) => h.id === params.id);

    if (!habit) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error in GET /api/habits/[id]:', error);
    return new NextResponse(null, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const habits = await getHabits();
    const habitIndex = habits.findIndex((h: Habit) => h.id === params.id);

    if (habitIndex === -1) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    const data = await request.json();
    const updatedHabit = {
      ...habits[habitIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    habits[habitIndex] = updatedHabit;
    await saveHabits(habits);

    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error('Error in PUT /api/habits/[id]:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const habits = await getHabits();
    const data = await request.json();
    const habitIndex = habits.findIndex(h => h.id === params.id);

    if (habitIndex === -1) {
      return new NextResponse(null, { status: 404 });
    }

    const updatedHabit = {
      ...habits[habitIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    habits[habitIndex] = updatedHabit;
    await saveHabits(habits);

    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error('Error in PATCH /api/habits/[id]:', error);
    return new NextResponse(null, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const habits = await getHabits();
    const habitIndex = habits.findIndex(h => h.id === params.id);

    if (habitIndex === -1) {
      return new NextResponse(null, { status: 404 });
    }

    habits.splice(habitIndex, 1);
    await saveHabits(habits);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/habits/[id]:', error);
    return new NextResponse(null, { status: 500 });
  }
}

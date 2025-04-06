import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { Habit } from '@/types/habit';

const HABITS_KEY = 'habits';

async function getHabits(): Promise<Habit[]> {
  const habits = await kv.get<Habit[]>(HABITS_KEY);
  return habits || [];
}

async function saveHabits(habits: Habit[]) {
  await kv.set(HABITS_KEY, habits);
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

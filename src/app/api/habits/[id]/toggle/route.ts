import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Habit } from '@/types/habit';

const dataFile = path.join(process.cwd(), 'data', 'habits.json');

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { date } = await request.json();
    const data = await fs.readFile(dataFile, 'utf8');
    const habits: Habit[] = JSON.parse(data);
    
    const habitIndex = habits.findIndex(h => h.id === params.id);
    if (habitIndex === -1) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }
    
    const habit = habits[habitIndex];
    const dateIndex = habit.completedDates.indexOf(date);
    
    if (dateIndex === -1) {
      habit.completedDates.push(date);
    } else {
      habit.completedDates.splice(dateIndex, 1);
    }
    
    await fs.writeFile(dataFile, JSON.stringify(habits, null, 2));
    
    return NextResponse.json(habit);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle habit' }, { status: 500 });
  }
}

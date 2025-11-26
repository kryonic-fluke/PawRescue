// src/app/api/shelters/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shelters } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET /api/shelters - Get all shelters
export async function GET() {
  try {
    const allShelters = await db.select().from(shelters);
    return NextResponse.json(allShelters);
  } catch (error) {
    console.error('Error fetching shelters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shelters' },
      { status: 500 }
    );
  }
}

// POST /api/shelters - Create a new shelter
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const [newShelter] = await db.insert(shelters).values(data).returning();
    return NextResponse.json(newShelter, { status: 201 });
  } catch (error) {
    console.error('Error creating shelter:', error);
    return NextResponse.json(
      { error: 'Failed to create shelter' },
      { status: 500 }
    );
  }
}
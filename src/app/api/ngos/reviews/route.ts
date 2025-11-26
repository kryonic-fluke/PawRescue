import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ngoReviews } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ngoId = searchParams.get('ngoId');
    if (!ngoId) return NextResponse.json({ error: 'ngoId is required' }, { status: 400 });

    const results = await db.select().from(ngoReviews).where(eq(ngoReviews.ngoId, parseInt(ngoId))).orderBy(desc(ngoReviews.createdAt)).limit(100);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET ngo reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ngoId, userId, rating, title, body: textBody } = body;
    if (!ngoId || !rating) return NextResponse.json({ error: 'ngoId and rating are required' }, { status: 400 });

    const insertObj: any = {
      ngoId: parseInt(ngoId),
      userId: userId ? parseInt(userId) : null,
      rating: parseInt(rating),
      title: title ?? null,
      body: textBody ?? null,
      createdAt: new Date()
    };

    const inserted = await db.insert(ngoReviews).values(insertObj).returning();
    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    console.error('POST ngo review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

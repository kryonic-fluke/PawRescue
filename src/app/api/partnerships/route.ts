import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { partnerships } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const results = await db.select().from(partnerships).orderBy(desc(partnerships.createdAt)).limit(limit).offset(offset);

    // If empty, return a small seeded list for demo
    if (results.length === 0) {
      const demo = [
        {
          id: 1,
          ngoId: null,
          title: 'Community Vaccination Drive',
          description: 'Free vaccination camps for street dogs and community pets in urban neighborhoods.',
          programType: 'Vaccination',
          geographicFocus: 'Mumbai, Delhi, Bangalore',
          beneficiaries: 'Street and community dogs',
          fundingSources: 'Local donors, corporate CSR partners',
          contactName: 'Asha Rao',
          contactEmail: 'asha@animalcare.org',
          contactPhone: '+91-9876543210',
          website: 'https://example.org/vaccination-drive',
          status: 'active'
        },
        {
          id: 2,
          ngoId: null,
          title: 'Spay/Neuter Subsidy Program',
          description: 'Subsidized sterilization surgeries to reduce street animal overpopulation.',
          programType: 'Sterilization',
          geographicFocus: 'All India',
          beneficiaries: 'Community animals',
          fundingSources: 'Grants, donations',
          contactName: 'Dr. Sanjay Kumar',
          contactEmail: 'sanjay@spayneuter.org',
          contactPhone: '+91-9123456780',
          website: 'https://spayneuter.org',
          status: 'active'
        },
        {
          id: 3,
          ngoId: null,
          title: 'Adoption & Foster Network',
          description: 'Network connecting foster families to animals awaiting permanent homes.',
          programType: 'Adoption',
          geographicFocus: 'Metro Cities',
          beneficiaries: 'Orphaned and surrendered pets',
          fundingSources: 'Crowdfunding, events',
          contactName: 'Rina Mehta',
          contactEmail: 'rina@fosternetwork.org',
          contactPhone: '+91-9988776655',
          website: 'https://fosternetwork.org',
          status: 'active'
        }
      ];

      return NextResponse.json(demo, { status: 200 });
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET partnerships error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date();
    const insertObj: any = {
      ngoId: body.ngoId ?? null,
      title: body.title,
      description: body.description ?? null,
      programType: body.programType ?? null,
      geographicFocus: body.geographicFocus ?? null,
      beneficiaries: body.beneficiaries ?? null,
      fundingSources: body.fundingSources ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      contactName: body.contactName ?? null,
      contactEmail: body.contactEmail ?? null,
      contactPhone: body.contactPhone ?? null,
      website: body.website ?? null,
      status: body.status ?? 'active',
      createdAt: now,
      updatedAt: now
    };

    const inserted = await db.insert(partnerships).values(insertObj).returning();
    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    console.error('POST partnerships error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const body = await request.json();
    const updateObj: any = { ...body, updatedAt: new Date() };

    await db.update(partnerships).set(updateObj).where(eq(partnerships.id, parseInt(id)));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('PUT partnerships error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await db.delete(partnerships).where(eq(partnerships.id, parseInt(id)));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE partnerships error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

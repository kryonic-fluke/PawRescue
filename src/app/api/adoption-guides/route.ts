import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adoptionGuides, animalShelters, ngos } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const guide = await db
        .select()
        .from(adoptionGuides)
        .where(eq(adoptionGuides.id, parseInt(id)))
        .limit(1);

      if (guide.length === 0) {
        return NextResponse.json(
          { error: 'Guide not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(guide[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const petSpecies = searchParams.get('petSpecies');
    const shelterId = searchParams.get('shelterId');
    const ngoId = searchParams.get('ngoId');

    let query = db.select().from(adoptionGuides);
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(adoptionGuides.title, `%${search}%`),
          like(adoptionGuides.content, `%${search}%`)
        )
      );
    }

    if (category) {
      conditions.push(eq(adoptionGuides.category, category.trim()));
    }

    if (petSpecies) {
      conditions.push(eq(adoptionGuides.petSpecies, petSpecies.trim()));
    }

    if (shelterId) {
      if (isNaN(parseInt(shelterId))) {
        return NextResponse.json(
          { error: 'Valid shelter ID is required', code: 'INVALID_SHELTER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(adoptionGuides.shelterId, parseInt(shelterId)));
    }

    if (ngoId) {
      if (isNaN(parseInt(ngoId))) {
        return NextResponse.json(
          { error: 'Valid NGO ID is required', code: 'INVALID_NGO_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(adoptionGuides.ngoId, parseInt(ngoId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(adoptionGuides.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, shelterId, ngoId, petSpecies, requirements, procedures, documentsNeeded, fees, timeline } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required', code: 'MISSING_CONTENT' },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return NextResponse.json(
        { error: 'Category is required', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    if (shelterId) {
      if (isNaN(parseInt(shelterId))) {
        return NextResponse.json(
          { error: 'Valid shelter ID is required', code: 'INVALID_SHELTER_ID' },
          { status: 400 }
        );
      }

      const shelter = await db
        .select()
        .from(animalShelters)
        .where(eq(animalShelters.id, parseInt(shelterId)))
        .limit(1);

      if (shelter.length === 0) {
        return NextResponse.json(
          { error: 'Shelter not found', code: 'SHELTER_NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    if (ngoId) {
      if (isNaN(parseInt(ngoId))) {
        return NextResponse.json(
          { error: 'Valid NGO ID is required', code: 'INVALID_NGO_ID' },
          { status: 400 }
        );
      }

      const ngo = await db
        .select()
        .from(ngos)
        .where(eq(ngos.id, parseInt(ngoId)))
        .limit(1);

      if (ngo.length === 0) {
        return NextResponse.json(
          { error: 'NGO not found', code: 'NGO_NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    const insertData: any = {
      title: title.trim(),
      content: content,
      category: category.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (shelterId) insertData.shelterId = parseInt(shelterId);
    if (ngoId) insertData.ngoId = parseInt(ngoId);
    if (petSpecies) insertData.petSpecies = petSpecies.trim();
    if (requirements) insertData.requirements = requirements;
    if (procedures) insertData.procedures = procedures;
    if (documentsNeeded) insertData.documentsNeeded = documentsNeeded;
    if (fees) insertData.fees = fees.trim();
    if (timeline) insertData.timeline = timeline.trim();

    const newGuide = await db
      .insert(adoptionGuides)
      .values(insertData)
      .returning();

    return NextResponse.json(newGuide[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(adoptionGuides)
      .where(eq(adoptionGuides.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Guide not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim() === '') {
        return NextResponse.json(
          { error: 'Title must be a non-empty string', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updateData.title = body.title.trim();
    }

    if (body.content !== undefined) {
      if (typeof body.content !== 'string') {
        return NextResponse.json(
          { error: 'Content must be a string', code: 'INVALID_CONTENT' },
          { status: 400 }
        );
      }
      updateData.content = body.content;
    }

    if (body.category !== undefined) {
      if (typeof body.category !== 'string' || body.category.trim() === '') {
        return NextResponse.json(
          { error: 'Category must be a non-empty string', code: 'INVALID_CATEGORY' },
          { status: 400 }
        );
      }
      updateData.category = body.category.trim();
    }

    if (body.petSpecies !== undefined) {
      updateData.petSpecies = body.petSpecies?.trim() || null;
    }

    if (body.requirements !== undefined) {
      updateData.requirements = body.requirements || null;
    }

    if (body.procedures !== undefined) {
      updateData.procedures = body.procedures || null;
    }

    if (body.documentsNeeded !== undefined) {
      updateData.documentsNeeded = body.documentsNeeded || null;
    }

    if (body.fees !== undefined) {
      updateData.fees = body.fees?.trim() || null;
    }

    if (body.timeline !== undefined) {
      updateData.timeline = body.timeline?.trim() || null;
    }

    if (body.shelterId !== undefined) {
      if (body.shelterId === null) {
        updateData.shelterId = null;
      } else {
        if (isNaN(parseInt(body.shelterId))) {
          return NextResponse.json(
            { error: 'Valid shelter ID is required', code: 'INVALID_SHELTER_ID' },
            { status: 400 }
          );
        }

        const shelter = await db
          .select()
          .from(animalShelters)
          .where(eq(animalShelters.id, parseInt(body.shelterId)))
          .limit(1);

        if (shelter.length === 0) {
          return NextResponse.json(
            { error: 'Shelter not found', code: 'SHELTER_NOT_FOUND' },
            { status: 404 }
          );
        }

        updateData.shelterId = parseInt(body.shelterId);
      }
    }

    if (body.ngoId !== undefined) {
      if (body.ngoId === null) {
        updateData.ngoId = null;
      } else {
        if (isNaN(parseInt(body.ngoId))) {
          return NextResponse.json(
            { error: 'Valid NGO ID is required', code: 'INVALID_NGO_ID' },
            { status: 400 }
          );
        }

        const ngo = await db
          .select()
          .from(ngos)
          .where(eq(ngos.id, parseInt(body.ngoId)))
          .limit(1);

        if (ngo.length === 0) {
          return NextResponse.json(
            { error: 'NGO not found', code: 'NGO_NOT_FOUND' },
            { status: 404 }
          );
        }

        updateData.ngoId = parseInt(body.ngoId);
      }
    }

    const updated = await db
      .update(adoptionGuides)
      .set(updateData)
      .where(eq(adoptionGuides.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(adoptionGuides)
      .where(eq(adoptionGuides.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Guide not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(adoptionGuides)
      .where(eq(adoptionGuides.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Guide deleted successfully',
        deleted: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
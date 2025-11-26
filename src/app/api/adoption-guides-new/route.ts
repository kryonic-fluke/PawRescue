import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adoptionGuidesNew } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: 'Valid ID is required',
            code: 'INVALID_ID'
          },
          { status: 400 }
        );
      }

      const guide = await db.select()
        .from(adoptionGuidesNew)
        .where(eq(adoptionGuidesNew.id, parseInt(id)))
        .limit(1);

      if (guide.length === 0) {
        return NextResponse.json(
          { 
            error: 'Adoption guide not found',
            code: 'GUIDE_NOT_FOUND'
          },
          { status: 404 }
        );
      }

      // Parse JSON fields
      const result = {
        ...guide[0],
        steps: guide[0].steps ? JSON.parse(guide[0].steps as string) : null,
        requirements: guide[0].requirements ? JSON.parse(guide[0].requirements as string) : null,
      };

      return NextResponse.json(result, { status: 200 });
    }

    // List with pagination, filtering, and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let query = db.select().from(adoptionGuidesNew);

    // Build where conditions
    const conditions = [];

    if (category) {
      conditions.push(eq(adoptionGuidesNew.category, category));
    }

    if (search) {
      conditions.push(
        or(
          like(adoptionGuidesNew.title, `%${search}%`),
          like(adoptionGuidesNew.content, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const results = await query
      .orderBy(desc(adoptionGuidesNew.createdAt))
      .limit(limit)
      .offset(offset);

    // Parse JSON fields for all results
    const parsedResults = results.map(guide => ({
      ...guide,
      steps: guide.steps ? JSON.parse(guide.steps as string) : null,
      requirements: guide.requirements ? JSON.parse(guide.requirements as string) : null,
    }));

    return NextResponse.json(parsedResults, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, content, steps, requirements } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { 
          error: 'Title is required',
          code: 'MISSING_TITLE'
        },
        { status: 400 }
      );
    }

    if (!category || !category.trim()) {
      return NextResponse.json(
        { 
          error: 'Category is required',
          code: 'MISSING_CATEGORY'
        },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { 
          error: 'Content is required',
          code: 'MISSING_CONTENT'
        },
        { status: 400 }
      );
    }

    // Validate JSON fields if provided
    if (steps !== undefined && steps !== null) {
      if (!Array.isArray(steps)) {
        return NextResponse.json(
          { 
            error: 'Steps must be a valid JSON array',
            code: 'INVALID_STEPS_FORMAT'
          },
          { status: 400 }
        );
      }
    }

    if (requirements !== undefined && requirements !== null) {
      if (!Array.isArray(requirements)) {
        return NextResponse.json(
          { 
            error: 'Requirements must be a valid JSON array',
            code: 'INVALID_REQUIREMENTS_FORMAT'
          },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData: any = {
      title: title.trim(),
      category: category.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    if (steps !== undefined && steps !== null) {
      insertData.steps = JSON.stringify(steps);
    }

    if (requirements !== undefined && requirements !== null) {
      insertData.requirements = JSON.stringify(requirements);
    }

    const newGuide = await db.insert(adoptionGuidesNew)
      .values(insertData)
      .returning();

    // Parse JSON fields in response
    const result = {
      ...newGuide[0],
      steps: newGuide[0].steps ? JSON.parse(newGuide[0].steps as string) : null,
      requirements: newGuide[0].requirements ? JSON.parse(newGuide[0].requirements as string) : null,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
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
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Check if guide exists
    const existingGuide = await db.select()
      .from(adoptionGuidesNew)
      .where(eq(adoptionGuidesNew.id, parseInt(id)))
      .limit(1);

    if (existingGuide.length === 0) {
      return NextResponse.json(
        { 
          error: 'Adoption guide not found',
          code: 'GUIDE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, category, content, steps, requirements } = body;

    // Prepare update data
    const updateData: any = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { 
            error: 'Title cannot be empty',
            code: 'INVALID_TITLE'
          },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (category !== undefined) {
      if (!category.trim()) {
        return NextResponse.json(
          { 
            error: 'Category cannot be empty',
            code: 'INVALID_CATEGORY'
          },
          { status: 400 }
        );
      }
      updateData.category = category.trim();
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return NextResponse.json(
          { 
            error: 'Content cannot be empty',
            code: 'INVALID_CONTENT'
          },
          { status: 400 }
        );
      }
      updateData.content = content.trim();
    }

    // Validate and add JSON fields if provided
    if (steps !== undefined) {
      if (steps !== null && !Array.isArray(steps)) {
        return NextResponse.json(
          { 
            error: 'Steps must be a valid JSON array or null',
            code: 'INVALID_STEPS_FORMAT'
          },
          { status: 400 }
        );
      }
      updateData.steps = steps === null ? null : JSON.stringify(steps);
    }

    if (requirements !== undefined) {
      if (requirements !== null && !Array.isArray(requirements)) {
        return NextResponse.json(
          { 
            error: 'Requirements must be a valid JSON array or null',
            code: 'INVALID_REQUIREMENTS_FORMAT'
          },
          { status: 400 }
        );
      }
      updateData.requirements = requirements === null ? null : JSON.stringify(requirements);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid fields to update',
          code: 'NO_UPDATE_FIELDS'
        },
        { status: 400 }
      );
    }

    const updated = await db.update(adoptionGuidesNew)
      .set(updateData)
      .where(eq(adoptionGuidesNew.id, parseInt(id)))
      .returning();

    // Parse JSON fields in response
    const result = {
      ...updated[0],
      steps: updated[0].steps ? JSON.parse(updated[0].steps as string) : null,
      requirements: updated[0].requirements ? JSON.parse(updated[0].requirements as string) : null,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
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
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Check if guide exists
    const existingGuide = await db.select()
      .from(adoptionGuidesNew)
      .where(eq(adoptionGuidesNew.id, parseInt(id)))
      .limit(1);

    if (existingGuide.length === 0) {
      return NextResponse.json(
        { 
          error: 'Adoption guide not found',
          code: 'GUIDE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const deleted = await db.delete(adoptionGuidesNew)
      .where(eq(adoptionGuidesNew.id, parseInt(id)))
      .returning();

    // Parse JSON fields in response
    const result = {
      ...deleted[0],
      steps: deleted[0].steps ? JSON.parse(deleted[0].steps as string) : null,
      requirements: deleted[0].requirements ? JSON.parse(deleted[0].requirements as string) : null,
    };

    return NextResponse.json(
      { 
        message: 'Adoption guide deleted successfully',
        deletedGuide: result
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}
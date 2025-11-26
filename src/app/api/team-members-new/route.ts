import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembersNew } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Indian phone format validation (10 digits, optional +91 prefix)
const PHONE_REGEX = /^(\+91)?[6-9]\d{9}$/;

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single team member by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const teamMember = await db
        .select()
        .from(teamMembersNew)
        .where(eq(teamMembersNew.id, parseInt(id)))
        .limit(1);

      if (teamMember.length === 0) {
        return NextResponse.json(
          { error: 'Team member not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(teamMember[0], { status: 200 });
    }

    // List all team members with pagination, filtering, and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const specialty = searchParams.get('specialty');

    let query = db.select().from(teamMembersNew);

    // Build filter conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(teamMembersNew.name, `%${search}%`),
          like(teamMembersNew.role, `%${search}%`),
          like(teamMembersNew.specialty, `%${search}%`)
        )
      );
    }

    if (role) {
      conditions.push(eq(teamMembersNew.role, role));
    }

    if (specialty) {
      conditions.push(like(teamMembersNew.specialty, `%${specialty}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Order by experienceYears DESC, then name ASC
    const results = await query
      .orderBy(desc(teamMembersNew.experienceYears), asc(teamMembersNew.name))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!body.role || typeof body.role !== 'string' || body.role.trim() === '') {
      return NextResponse.json(
        { error: 'Role is required', code: 'MISSING_ROLE' },
        { status: 400 }
      );
    }

    if (!body.email || typeof body.email !== 'string' || body.email.trim() === '') {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    // Validate email format
    const email = body.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Validate phone format if provided
    if (body.phone) {
      const phone = body.phone.trim();
      if (!PHONE_REGEX.test(phone)) {
        return NextResponse.json(
          { error: 'Invalid phone format. Must be a valid Indian phone number (10 digits, optional +91 prefix)', code: 'INVALID_PHONE' },
          { status: 400 }
        );
      }
    }

    // Validate experienceYears if provided
    if (body.experienceYears !== undefined && body.experienceYears !== null) {
      const exp = parseInt(body.experienceYears);
      if (isNaN(exp) || exp < 0) {
        return NextResponse.json(
          { error: 'Experience years must be a positive integer', code: 'INVALID_EXPERIENCE' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData = {
      name: body.name.trim(),
      role: body.role.trim(),
      email: email,
      specialty: body.specialty ? body.specialty.trim() : null,
      bio: body.bio ? body.bio.trim() : null,
      imageUrl: body.imageUrl ? body.imageUrl.trim() : null,
      phone: body.phone ? body.phone.trim() : null,
      experienceYears: body.experienceYears ? parseInt(body.experienceYears) : null,
      createdAt: new Date()
    };

    const newTeamMember = await db
      .insert(teamMembersNew)
      .values(insertData)
      .returning();

    return NextResponse.json(newTeamMember[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if team member exists
    const existingMember = await db
      .select()
      .from(teamMembersNew)
      .where(eq(teamMembersNew.id, parseInt(id)))
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json(
        { error: 'Team member not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and prepare updates
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return NextResponse.json(
          { error: 'Name cannot be empty', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = body.name.trim();
    }

    if (body.role !== undefined) {
      if (typeof body.role !== 'string' || body.role.trim() === '') {
        return NextResponse.json(
          { error: 'Role cannot be empty', code: 'INVALID_ROLE' },
          { status: 400 }
        );
      }
      updates.role = body.role.trim();
    }

    if (body.email !== undefined) {
      const email = body.email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
      updates.email = email;
    }

    if (body.phone !== undefined) {
      if (body.phone) {
        const phone = body.phone.trim();
        if (!PHONE_REGEX.test(phone)) {
          return NextResponse.json(
            { error: 'Invalid phone format. Must be a valid Indian phone number (10 digits, optional +91 prefix)', code: 'INVALID_PHONE' },
            { status: 400 }
          );
        }
        updates.phone = phone;
      } else {
        updates.phone = null;
      }
    }

    if (body.specialty !== undefined) {
      updates.specialty = body.specialty ? body.specialty.trim() : null;
    }

    if (body.bio !== undefined) {
      updates.bio = body.bio ? body.bio.trim() : null;
    }

    if (body.imageUrl !== undefined) {
      updates.imageUrl = body.imageUrl ? body.imageUrl.trim() : null;
    }

    if (body.experienceYears !== undefined) {
      if (body.experienceYears !== null) {
        const exp = parseInt(body.experienceYears);
        if (isNaN(exp) || exp < 0) {
          return NextResponse.json(
            { error: 'Experience years must be a positive integer', code: 'INVALID_EXPERIENCE' },
            { status: 400 }
          );
        }
        updates.experienceYears = exp;
      } else {
        updates.experienceYears = null;
      }
    }

    const updatedMember = await db
      .update(teamMembersNew)
      .set(updates)
      .where(eq(teamMembersNew.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedMember[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if team member exists
    const existingMember = await db
      .select()
      .from(teamMembersNew)
      .where(eq(teamMembersNew.id, parseInt(id)))
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json(
        { error: 'Team member not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(teamMembersNew)
      .where(eq(teamMembersNew.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Team member deleted successfully',
        deletedMember: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
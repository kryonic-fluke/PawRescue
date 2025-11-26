import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appUsers } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}

// Helper function to validate role
function isValidRole(role: string): boolean {
  return ['user', 'ngo', 'admin'].includes(role);
}

// Helper function to exclude passwordHash from user object
function sanitizeUser(user: any) {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single user by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const userRecord = await db
        .select()
        .from(appUsers)
        .where(eq(appUsers.id, parseInt(id)))
        .limit(1);

      if (userRecord.length === 0) {
        return NextResponse.json(
          { error: 'User not found', code: 'USER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(sanitizeUser(userRecord[0]), { status: 200 });
    }

    // List users with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const roleFilter = searchParams.get('role');

    let query = db.select().from(appUsers);

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(appUsers.name, `%${search}%`),
          like(appUsers.email, `%${search}%`)
        )
      );
    }

    if (roleFilter) {
      conditions.push(eq(appUsers.role, roleFilter));
    }

    if (conditions.length > 0) {
      query = query.where(
        conditions.length === 1 ? conditions[0] : and(...conditions)
      );
    }

    const results = await query
      .orderBy(desc(appUsers.createdAt))
      .limit(limit)
      .offset(offset);

    // Sanitize all user objects to remove passwordHash
    const sanitizedResults = results.map(sanitizeUser);

    return NextResponse.json(sanitizedResults, { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, passwordHash, role, phone, avatarUrl } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!passwordHash) {
      return NextResponse.json(
        { error: 'Password hash is required', code: 'MISSING_PASSWORD_HASH' },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required', code: 'MISSING_ROLE' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error: 'Invalid email format. Email must contain @ and .',
          code: 'INVALID_EMAIL_FORMAT',
        },
        { status: 400 }
      );
    }

    // Validate role
    if (!isValidRole(role)) {
      return NextResponse.json(
        {
          error: 'Invalid role. Role must be one of: user, ngo, admin',
          code: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          error: 'Email already exists',
          code: 'DUPLICATE_EMAIL',
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: passwordHash.trim(),
      role: role.trim(),
      phone: phone ? phone.trim() : null,
      avatarUrl: avatarUrl ? avatarUrl.trim() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert new user
    const newUser = await db.insert(appUsers).values(sanitizedData).returning();

    return NextResponse.json(sanitizeUser(newUser[0]), { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, phone, role, avatarUrl, passwordHash } = body;

    // Prevent passwordHash updates through this endpoint
    if (passwordHash !== undefined) {
      return NextResponse.json(
        {
          error: 'Password hash cannot be updated through this endpoint',
          code: 'PASSWORD_HASH_UPDATE_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updates.name = name.trim();
    }

    if (email !== undefined) {
      const trimmedEmail = email.toLowerCase().trim();

      // Validate email format
      if (!isValidEmail(trimmedEmail)) {
        return NextResponse.json(
          {
            error: 'Invalid email format. Email must contain @ and .',
            code: 'INVALID_EMAIL_FORMAT',
          },
          { status: 400 }
        );
      }

      // Check if email already exists for another user
      const emailExists = await db
        .select()
        .from(appUsers)
        .where(
          and(
            eq(appUsers.email, trimmedEmail),
            eq(appUsers.id, parseInt(id))
          )
        )
        .limit(1);

      if (emailExists.length === 0) {
        const otherUserWithEmail = await db
          .select()
          .from(appUsers)
          .where(eq(appUsers.email, trimmedEmail))
          .limit(1);

        if (otherUserWithEmail.length > 0) {
          return NextResponse.json(
            {
              error: 'Email already exists',
              code: 'DUPLICATE_EMAIL',
            },
            { status: 400 }
          );
        }
      }

      updates.email = trimmedEmail;
    }

    if (phone !== undefined) {
      updates.phone = phone ? phone.trim() : null;
    }

    if (role !== undefined) {
      const trimmedRole = role.trim();

      // Validate role
      if (!isValidRole(trimmedRole)) {
        return NextResponse.json(
          {
            error: 'Invalid role. Role must be one of: user, ngo, admin',
            code: 'INVALID_ROLE',
          },
          { status: 400 }
        );
      }

      updates.role = trimmedRole;
    }

    if (avatarUrl !== undefined) {
      updates.avatarUrl = avatarUrl ? avatarUrl.trim() : null;
    }

    // Update user
    const updatedUser = await db
      .update(appUsers)
      .set(updates)
      .where(eq(appUsers.id, parseInt(id)))
      .returning();

    return NextResponse.json(sanitizeUser(updatedUser[0]), { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete user
    const deletedUser = await db
      .delete(appUsers)
      .where(eq(appUsers.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'User deleted successfully',
        user: sanitizeUser(deletedUser[0]),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
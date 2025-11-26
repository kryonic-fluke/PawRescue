import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adoptionApplicationsNew, appUsers, pets } from '@/db/schema';
import { eq, like, and, desc, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single application by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const application = await db
        .select({
          id: adoptionApplicationsNew.id,
          userId: adoptionApplicationsNew.userId,
          petId: adoptionApplicationsNew.petId,
          status: adoptionApplicationsNew.status,
          applicationDate: adoptionApplicationsNew.applicationDate,
          notes: adoptionApplicationsNew.notes,
          createdAt: adoptionApplicationsNew.createdAt,
          user: {
            id: appUsers.id,
            name: appUsers.name,
            email: appUsers.email,
            phone: appUsers.phone,
          },
          pet: {
            id: pets.id,
            name: pets.name,
            species: pets.species,
            breed: pets.breed,
            age: pets.age,
            gender: pets.gender,
            imageUrl: pets.imageUrl,
            adoptionStatus: pets.adoptionStatus,
          },
        })
        .from(adoptionApplicationsNew)
        .leftJoin(appUsers, eq(adoptionApplicationsNew.userId, appUsers.id))
        .leftJoin(pets, eq(adoptionApplicationsNew.petId, pets.id))
        .where(eq(adoptionApplicationsNew.id, parseInt(id)))
        .limit(1);

      if (application.length === 0) {
        return NextResponse.json(
          { error: 'Application not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(application[0], { status: 200 });
    }

    // List all applications with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const petId = searchParams.get('petId');

    let query = db
      .select({
        id: adoptionApplicationsNew.id,
        userId: adoptionApplicationsNew.userId,
        petId: adoptionApplicationsNew.petId,
        status: adoptionApplicationsNew.status,
        applicationDate: adoptionApplicationsNew.applicationDate,
        notes: adoptionApplicationsNew.notes,
        createdAt: adoptionApplicationsNew.createdAt,
        user: {
          id: appUsers.id,
          name: appUsers.name,
          email: appUsers.email,
          phone: appUsers.phone,
        },
        pet: {
          id: pets.id,
          name: pets.name,
          species: pets.species,
          breed: pets.breed,
          age: pets.age,
          gender: pets.gender,
          imageUrl: pets.imageUrl,
          adoptionStatus: pets.adoptionStatus,
        },
      })
      .from(adoptionApplicationsNew)
      .leftJoin(appUsers, eq(adoptionApplicationsNew.userId, appUsers.id))
      .leftJoin(pets, eq(adoptionApplicationsNew.petId, pets.id));

    const conditions = [];

    if (search) {
      conditions.push(like(adoptionApplicationsNew.notes, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(adoptionApplicationsNew.status, status));
    }

    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(adoptionApplicationsNew.userId, parseInt(userId)));
    }

    if (petId) {
      if (isNaN(parseInt(petId))) {
        return NextResponse.json(
          { error: 'Valid petId is required', code: 'INVALID_PET_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(adoptionApplicationsNew.petId, parseInt(petId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(adoptionApplicationsNew.applicationDate))
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
    const { userId, petId, status, notes } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!petId) {
      return NextResponse.json(
        { error: 'petId is required', code: 'MISSING_PET_ID' },
        { status: 400 }
      );
    }

    // Validate IDs are integers
    if (isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(petId))) {
      return NextResponse.json(
        { error: 'Valid petId is required', code: 'INVALID_PET_ID' },
        { status: 400 }
      );
    }

    // Validate status if provided
    const validStatuses = ['pending', 'approved', 'rejected'];
    const applicationStatus = status || 'pending';
    if (!validStatuses.includes(applicationStatus)) {
      return NextResponse.json(
        {
          error: 'Status must be one of: pending, approved, rejected',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.id, parseInt(userId)))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Check if pet exists
    const petExists = await db
      .select()
      .from(pets)
      .where(eq(pets.id, parseInt(petId)))
      .limit(1);

    if (petExists.length === 0) {
      return NextResponse.json(
        { error: 'Pet not found', code: 'PET_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Check if pet is available
    if (petExists[0].adoptionStatus !== 'available') {
      return NextResponse.json(
        {
          error: 'Pet is not available for adoption',
          code: 'PET_NOT_AVAILABLE',
        },
        { status: 400 }
      );
    }

    // Check for duplicate pending application
    const existingApplication = await db
      .select()
      .from(adoptionApplicationsNew)
      .where(
        and(
          eq(adoptionApplicationsNew.userId, parseInt(userId)),
          eq(adoptionApplicationsNew.petId, parseInt(petId)),
          eq(adoptionApplicationsNew.status, 'pending')
        )
      )
      .limit(1);

    if (existingApplication.length > 0) {
      return NextResponse.json(
        {
          error: 'You already have a pending application for this pet',
          code: 'DUPLICATE_APPLICATION',
        },
        { status: 400 }
      );
    }

    // Create new application
    const newApplication = await db
      .insert(adoptionApplicationsNew)
      .values({
        userId: parseInt(userId),
        petId: parseInt(petId),
        status: applicationStatus,
        notes: notes?.trim() || null,
        applicationDate: new Date(),
        createdAt: new Date(),
      })
      .returning();

    // If status is approved, update pet status
    if (applicationStatus === 'approved') {
      await db
        .update(pets)
        .set({
          adoptionStatus: 'adopted',
          updatedAt: new Date(),
        })
        .where(eq(pets.id, parseInt(petId)));
    }

    // Fetch complete application with user and pet details
    const completeApplication = await db
      .select({
        id: adoptionApplicationsNew.id,
        userId: adoptionApplicationsNew.userId,
        petId: adoptionApplicationsNew.petId,
        status: adoptionApplicationsNew.status,
        applicationDate: adoptionApplicationsNew.applicationDate,
        notes: adoptionApplicationsNew.notes,
        createdAt: adoptionApplicationsNew.createdAt,
        user: {
          id: appUsers.id,
          name: appUsers.name,
          email: appUsers.email,
          phone: appUsers.phone,
        },
        pet: {
          id: pets.id,
          name: pets.name,
          species: pets.species,
          breed: pets.breed,
          age: pets.age,
          gender: pets.gender,
          imageUrl: pets.imageUrl,
          adoptionStatus: pets.adoptionStatus,
        },
      })
      .from(adoptionApplicationsNew)
      .leftJoin(appUsers, eq(adoptionApplicationsNew.userId, appUsers.id))
      .leftJoin(pets, eq(adoptionApplicationsNew.petId, pets.id))
      .where(eq(adoptionApplicationsNew.id, newApplication[0].id))
      .limit(1);

    return NextResponse.json(completeApplication[0], { status: 201 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, notes } = body;

    // Check if application exists
    const existingApplication = await db
      .select()
      .from(adoptionApplicationsNew)
      .where(eq(adoptionApplicationsNew.id, parseInt(id)))
      .limit(1);

    if (existingApplication.length === 0) {
      return NextResponse.json(
        { error: 'Application not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: 'Status must be one of: pending, approved, rejected',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
    }

    const previousStatus = existingApplication[0].status;
    const newStatus = status || previousStatus;

    // Update application
    const updates: any = {};
    if (status !== undefined) {
      updates.status = status;
    }
    if (notes !== undefined) {
      updates.notes = notes?.trim() || null;
    }

    const updated = await db
      .update(adoptionApplicationsNew)
      .set(updates)
      .where(eq(adoptionApplicationsNew.id, parseInt(id)))
      .returning();

    // Handle pet status updates based on application status changes
    if (status && status !== previousStatus) {
      const petId = existingApplication[0].petId;

      if (status === 'approved') {
        // Update pet to adopted
        await db
          .update(pets)
          .set({
            adoptionStatus: 'adopted',
            updatedAt: new Date(),
          })
          .where(eq(pets.id, petId));
      } else if (status === 'rejected' && previousStatus === 'approved') {
        // Reset pet to available if application was previously approved
        await db
          .update(pets)
          .set({
            adoptionStatus: 'available',
            updatedAt: new Date(),
          })
          .where(eq(pets.id, petId));
      }
    }

    // Fetch complete updated application with user and pet details
    const completeApplication = await db
      .select({
        id: adoptionApplicationsNew.id,
        userId: adoptionApplicationsNew.userId,
        petId: adoptionApplicationsNew.petId,
        status: adoptionApplicationsNew.status,
        applicationDate: adoptionApplicationsNew.applicationDate,
        notes: adoptionApplicationsNew.notes,
        createdAt: adoptionApplicationsNew.createdAt,
        user: {
          id: appUsers.id,
          name: appUsers.name,
          email: appUsers.email,
          phone: appUsers.phone,
        },
        pet: {
          id: pets.id,
          name: pets.name,
          species: pets.species,
          breed: pets.breed,
          age: pets.age,
          gender: pets.gender,
          imageUrl: pets.imageUrl,
          adoptionStatus: pets.adoptionStatus,
        },
      })
      .from(adoptionApplicationsNew)
      .leftJoin(appUsers, eq(adoptionApplicationsNew.userId, appUsers.id))
      .leftJoin(pets, eq(adoptionApplicationsNew.petId, pets.id))
      .where(eq(adoptionApplicationsNew.id, parseInt(id)))
      .limit(1);

    return NextResponse.json(completeApplication[0], { status: 200 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if application exists and get its details
    const existingApplication = await db
      .select()
      .from(adoptionApplicationsNew)
      .where(eq(adoptionApplicationsNew.id, parseInt(id)))
      .limit(1);

    if (existingApplication.length === 0) {
      return NextResponse.json(
        { error: 'Application not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const application = existingApplication[0];

    // If application was approved, reset pet status to available
    if (application.status === 'approved') {
      await db
        .update(pets)
        .set({
          adoptionStatus: 'available',
          updatedAt: new Date(),
        })
        .where(eq(pets.id, application.petId));
    }

    // Delete the application
    const deleted = await db
      .delete(adoptionApplicationsNew)
      .where(eq(adoptionApplicationsNew.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Application deleted successfully',
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
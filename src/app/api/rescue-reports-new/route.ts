import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rescueReportsNew, ngos, appUsers, emailNotificationsNew } from '@/db/schema';
import { eq, like, and, or, desc, sql } from 'drizzle-orm';

// Custom ordering for urgency levels
const urgencyOrder = sql`
  CASE ${rescueReportsNew.urgency}
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
    ELSE 5
  END
`;

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Indian phone format validation (supports multiple formats)
const indianPhoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;

// Valid urgency levels
const validUrgencies = ['low', 'medium', 'high', 'critical'];

// Valid status values
const validStatuses = ['pending', 'in_progress', 'resolved'];

// Helper function to send email notifications
async function sendEmailNotification(
  recipientEmail: string,
  subject: string,
  message: string,
  notificationType: string,
  userId?: number
) {
  try {
    await db.insert(emailNotificationsNew).values({
      userId: userId,
      recipientEmail,
      subject,
      message,
      notificationType,
      status: 'pending',
      sentAt: null,
    });
  } catch (error) {
    console.error('Error creating email notification:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: "Valid ID is required",
            code: "INVALID_ID" 
          },
          { status: 400 }
        );
      }

      const record = await db.select()
        .from(rescueReportsNew)
        .where(eq(rescueReportsNew.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Rescue report not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination, filtering, and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');
    const userIdFilter = searchParams.get('userId');
    const assignedNgoIdFilter = searchParams.get('assignedNgoId');

    let query = db.select().from(rescueReportsNew);

    // Build where conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(rescueReportsNew.status, status));
    }

    if (urgency) {
      conditions.push(eq(rescueReportsNew.urgency, urgency));
    }

    if (userIdFilter && !isNaN(parseInt(userIdFilter))) {
      conditions.push(eq(rescueReportsNew.userId, parseInt(userIdFilter)));
    }

    if (assignedNgoIdFilter && !isNaN(parseInt(assignedNgoIdFilter))) {
      conditions.push(eq(rescueReportsNew.assignedNgoId, parseInt(assignedNgoIdFilter)));
    }

    if (search) {
      conditions.push(
        or(
          like(rescueReportsNew.description, `%${search}%`),
          like(rescueReportsNew.location, `%${search}%`),
          like(rescueReportsNew.animalType, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Order by urgency (critical > high > medium > low) then by createdAt DESC
    const results = await query
      .orderBy(urgencyOrder, desc(rescueReportsNew.createdAt))
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

    // Validate required fields
    if (!body.animalType || !body.animalType.trim()) {
      return NextResponse.json(
        {
          error: "Animal type is required",
          code: "MISSING_ANIMAL_TYPE"
        },
        { status: 400 }
      );
    }

    if (!body.location || !body.location.trim()) {
      return NextResponse.json(
        {
          error: "Location is required",
          code: "MISSING_LOCATION"
        },
        { status: 400 }
      );
    }

    if (!body.description || !body.description.trim()) {
      return NextResponse.json(
        {
          error: "Description is required",
          code: "MISSING_DESCRIPTION"
        },
        { status: 400 }
      );
    }

    if (!body.phone || !body.phone.trim()) {
      return NextResponse.json(
        {
          error: "Phone number is required",
          code: "MISSING_PHONE"
        },
        { status: 400 }
      );
    }

    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        {
          error: "Email is required",
          code: "MISSING_EMAIL"
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!emailRegex.test(body.email.trim())) {
      return NextResponse.json(
        {
          error: "Invalid email format",
          code: "INVALID_EMAIL"
        },
        { status: 400 }
      );
    }

    // Validate phone format
    const cleanPhone = body.phone.trim().replace(/[\s\-]/g, '');
    if (!indianPhoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        {
          error: "Invalid phone format. Please use Indian phone format (+91-XXX-XXXX-XXXX)",
          code: "INVALID_PHONE"
        },
        { status: 400 }
      );
    }

    // Validate urgency if provided
    if (body.urgency && !validUrgencies.includes(body.urgency)) {
      return NextResponse.json(
        {
          error: `Invalid urgency level. Must be one of: ${validUrgencies.join(', ')}`,
          code: "INVALID_URGENCY"
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          code: "INVALID_STATUS"
        },
        { status: 400 }
      );
    }

    // Validate userId if provided
    if (body.userId) {
      const userExists = await db.select()
        .from(appUsers)
        .where(eq(appUsers.id, parseInt(body.userId)))
        .limit(1);

      if (userExists.length === 0) {
        return NextResponse.json(
          {
            error: "User not found",
            code: "USER_NOT_FOUND"
          },
          { status: 400 }
        );
      }
    }

    // Validate assignedNgoId if provided
    if (body.assignedNgoId) {
      const ngoExists = await db.select()
        .from(ngos)
        .where(eq(ngos.id, parseInt(body.assignedNgoId)))
        .limit(1);

      if (ngoExists.length === 0) {
        return NextResponse.json(
          {
            error: "NGO not found",
            code: "NGO_NOT_FOUND"
          },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const now = new Date();
    const insertData: any = {
      animalType: body.animalType.trim(),
      location: body.location.trim(),
      description: body.description.trim(),
      phone: body.phone.trim(),
      email: body.email.trim().toLowerCase(),
      urgency: body.urgency || 'medium',
      status: body.status || 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Add optional fields if provided
    if (body.userId !== undefined && body.userId !== null) {
      insertData.userId = parseInt(body.userId);
    }

    if (body.latitude !== undefined && body.latitude !== null) {
      insertData.latitude = parseFloat(body.latitude);
    }

    if (body.longitude !== undefined && body.longitude !== null) {
      insertData.longitude = parseFloat(body.longitude);
    }

    if (body.imageUrl) {
      insertData.imageUrl = body.imageUrl.trim();
    }

    if (body.assignedNgoId !== undefined && body.assignedNgoId !== null) {
      insertData.assignedNgoId = parseInt(body.assignedNgoId);
    }

    // Insert the rescue report
    const newReport = await db.insert(rescueReportsNew)
      .values(insertData)
      .returning();

    // Send email notification
    const emailSubject = `New Rescue Report: ${insertData.animalType} - ${insertData.urgency.toUpperCase()} Priority`;
    const emailMessage = `
      A new rescue report has been created:
      
      Animal Type: ${insertData.animalType}
      Location: ${insertData.location}
      Description: ${insertData.description}
      Urgency: ${insertData.urgency}
      Contact: ${insertData.phone}
      
      Please respond as soon as possible.
    `;

    await sendEmailNotification(
      insertData.email,
      emailSubject,
      emailMessage,
      'rescue_report_created',
      insertData.userId
    );

    return NextResponse.json(newReport[0], { status: 201 });
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
        {
          error: "Valid ID is required",
          code: "INVALID_ID"
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if record exists
    const existing = await db.select()
      .from(rescueReportsNew)
      .where(eq(rescueReportsNew.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Rescue report not found' },
        { status: 404 }
      );
    }

    const currentReport = existing[0];

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Validate and add updatable fields
    if (body.status !== undefined) {
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            code: "INVALID_STATUS"
          },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.urgency !== undefined) {
      if (!validUrgencies.includes(body.urgency)) {
        return NextResponse.json(
          {
            error: `Invalid urgency level. Must be one of: ${validUrgencies.join(', ')}`,
            code: "INVALID_URGENCY"
          },
          { status: 400 }
        );
      }
      updateData.urgency = body.urgency;
    }

    if (body.assignedNgoId !== undefined) {
      if (body.assignedNgoId !== null) {
        const ngoExists = await db.select()
          .from(ngos)
          .where(eq(ngos.id, parseInt(body.assignedNgoId)))
          .limit(1);

        if (ngoExists.length === 0) {
          return NextResponse.json(
            {
              error: "NGO not found",
              code: "NGO_NOT_FOUND"
            },
            { status: 400 }
          );
        }
        updateData.assignedNgoId = parseInt(body.assignedNgoId);
      } else {
        updateData.assignedNgoId = null;
      }
    }

    if (body.description !== undefined && body.description.trim()) {
      updateData.description = body.description.trim();
    }

    if (body.location !== undefined && body.location.trim()) {
      updateData.location = body.location.trim();
    }

    if (body.latitude !== undefined) {
      updateData.latitude = body.latitude !== null ? parseFloat(body.latitude) : null;
    }

    if (body.longitude !== undefined) {
      updateData.longitude = body.longitude !== null ? parseFloat(body.longitude) : null;
    }

    if (body.imageUrl !== undefined) {
      updateData.imageUrl = body.imageUrl ? body.imageUrl.trim() : null;
    }

    // Update the rescue report
    const updated = await db.update(rescueReportsNew)
      .set(updateData)
      .where(eq(rescueReportsNew.id, parseInt(id)))
      .returning();

    // Send email notification if status changed to in_progress or resolved
    if (updateData.status && 
        (updateData.status === 'in_progress' || updateData.status === 'resolved') &&
        currentReport.status !== updateData.status) {
      
      const statusText = updateData.status === 'in_progress' ? 'In Progress' : 'Resolved';
      const emailSubject = `Rescue Report Update: Status Changed to ${statusText}`;
      const emailMessage = `
        Your rescue report has been updated:
        
        Animal Type: ${updated[0].animalType}
        Location: ${updated[0].location}
        Status: ${statusText}
        
        ${updateData.status === 'resolved' 
          ? 'Thank you for reporting. The rescue has been completed.' 
          : 'Our team is now working on this rescue.'}
      `;

      await sendEmailNotification(
        currentReport.email,
        emailSubject,
        emailMessage,
        'rescue_report_status_update',
        currentReport.userId ?? undefined
      );
    }

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
        {
          error: "Valid ID is required",
          code: "INVALID_ID"
        },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db.select()
      .from(rescueReportsNew)
      .where(eq(rescueReportsNew.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Rescue report not found' },
        { status: 404 }
      );
    }

    // Delete the rescue report
    const deleted = await db.delete(rescueReportsNew)
      .where(eq(rescueReportsNew.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Rescue report deleted successfully',
        deletedReport: deleted[0]
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
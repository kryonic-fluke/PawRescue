import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailNotificationsNew } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Email sending simulation helper
async function simulateEmailSend(notification: { id: number; recipientEmail: string; subject: string; message: string; notificationType: string }): Promise<boolean> {
  console.log('=== EMAIL SENDING SIMULATION ===');
  console.log('To:', notification.recipientEmail);
  console.log('Subject:', notification.subject);
  console.log('Type:', notification.notificationType);
  console.log('Message:', notification.message);
  console.log('================================');
  
  // Simulate random success/failure (90% success rate)
  const success = Math.random() > 0.1;
  
  if (success) {
    console.log('✓ Email sent successfully');
  } else {
    console.log('✗ Email sending failed');
  }
  
  return success;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const notification = await db
        .select()
        .from(emailNotificationsNew)
        .where(eq(emailNotificationsNew.id, parseInt(id)))
        .limit(1);

      if (notification.length === 0) {
        return NextResponse.json(
          { error: 'Email notification not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(notification[0], { status: 200 });
    }

    // List with pagination, filtering, and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const notificationType = searchParams.get('notificationType');
    const userId = searchParams.get('userId');

    let query = db.select().from(emailNotificationsNew);

    // Build WHERE conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(emailNotificationsNew.status, status));
    }

    if (notificationType) {
      conditions.push(eq(emailNotificationsNew.notificationType, notificationType));
    }

    if (userId) {
      const userIdInt = parseInt(userId);
      if (!isNaN(userIdInt)) {
        conditions.push(eq(emailNotificationsNew.userId, userIdInt));
      }
    }

    if (search) {
      conditions.push(
        or(
          like(emailNotificationsNew.recipientEmail, `%${search}%`),
          like(emailNotificationsNew.subject, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(emailNotificationsNew.id))
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
    const { recipientEmail, subject, message, notificationType, userId } = body;

    // Validate required fields
    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'recipientEmail is required', code: 'MISSING_RECIPIENT_EMAIL' },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { error: 'subject is required', code: 'MISSING_SUBJECT' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'message is required', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    if (!notificationType) {
      return NextResponse.json(
        { error: 'notificationType is required', code: 'MISSING_NOTIFICATION_TYPE' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(recipientEmail.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      recipientEmail: recipientEmail.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      notificationType: notificationType.trim(),
      userId: userId ? parseInt(userId) : null,
      status: 'pending',
    };

    // Create initial notification
    const newNotification = await db
      .insert(emailNotificationsNew)
      .values(sanitizedData)
      .returning();

    if (newNotification.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create notification', code: 'CREATE_FAILED' },
        { status: 500 }
      );
    }

    // Simulate email sending
    const emailSent = await simulateEmailSend({
      id: newNotification[0].id,
      recipientEmail: sanitizedData.recipientEmail,
      subject: sanitizedData.subject,
      message: sanitizedData.message,
      notificationType: sanitizedData.notificationType,
    });

    // Update notification status based on email sending result
    const updatedStatus = emailSent ? 'sent' : 'failed';
    const sentAt = emailSent ? new Date().toISOString() : null;

    const updatedNotification = await db
      .update(emailNotificationsNew)
      .set({
        status: updatedStatus,
        sentAt: sentAt,
      })
      .where(eq(emailNotificationsNew.id, newNotification[0].id))
      .returning();

    return NextResponse.json(updatedNotification[0], { status: 201 });
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
    const { status } = body;

    // Check if notification exists
    const existing = await db
      .select()
      .from(emailNotificationsNew)
      .where(eq(emailNotificationsNew.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Email notification not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate status value if provided
    if (status && !['pending', 'sent', 'failed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be: pending, sent, or failed', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: {
      status?: string;
      sentAt?: string | null;
    } = {};

    if (status) {
      updateData.status = status;
      
      // If status changes to 'sent', set sentAt timestamp
      if (status === 'sent' && !existing[0].sentAt) {
        updateData.sentAt = new Date().toISOString();
      }
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(emailNotificationsNew)
      .set(updateData)
      .where(eq(emailNotificationsNew.id, parseInt(id)))
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if notification exists
    const existing = await db
      .select()
      .from(emailNotificationsNew)
      .where(eq(emailNotificationsNew.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Email notification not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(emailNotificationsNew)
      .where(eq(emailNotificationsNew.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Email notification deleted successfully',
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
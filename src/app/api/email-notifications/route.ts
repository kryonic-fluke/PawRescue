import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emailNotifications } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const notification = await db.select()
        .from(emailNotifications)
        .where(eq(emailNotifications.id, parseInt(id)))
        .limit(1);

      if (notification.length === 0) {
        return NextResponse.json({ 
          error: 'Notification not found',
          code: "NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(notification[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const notificationType = searchParams.get('notificationType');
    const sent = searchParams.get('sent');

    let query = db.select().from(emailNotifications);

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(emailNotifications.recipientEmail, `%${search}%`),
          like(emailNotifications.subject, `%${search}%`)
        )
      );
    }

    if (notificationType) {
      conditions.push(eq(emailNotifications.notificationType, notificationType));
    }

    if (sent !== null && sent !== undefined) {
      conditions.push(eq(emailNotifications.sent, sent === 'true'));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(emailNotifications.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientEmail, subject, message, notificationType, sent } = body;

    if (!recipientEmail) {
      return NextResponse.json({ 
        error: "recipientEmail is required",
        code: "MISSING_RECIPIENT_EMAIL" 
      }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ 
        error: "subject is required",
        code: "MISSING_SUBJECT" 
      }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ 
        error: "message is required",
        code: "MISSING_MESSAGE" 
      }, { status: 400 });
    }

    if (!notificationType) {
      return NextResponse.json({ 
        error: "notificationType is required",
        code: "MISSING_NOTIFICATION_TYPE" 
      }, { status: 400 });
    }

    const sanitizedEmail = recipientEmail.trim().toLowerCase();
    const sanitizedSubject = subject.trim();
    const sanitizedMessage = message.trim();
    const sanitizedType = notificationType.trim();
    const isSent = sent !== undefined ? sent : false;

    const insertData: any = {
      recipientEmail: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      notificationType: sanitizedType,
      sent: true, // mark sent in demo mode
      sentAt: new Date(),
      createdAt: new Date()
    };

    // Store record
    const newNotification = await db.insert(emailNotifications)
      .values(insertData)
      .returning();

    // Attempt to send via Resend if configured
    const resendApiKey = process.env.RESEND_API_KEY;
    let sendResult: any = null;
    if (resendApiKey) {
      try {
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'no-reply@pawrescue.app',
            to: [sanitizedEmail],
            subject: sanitizedSubject,
            html: `<pre>${sanitizedMessage}</pre>`
          })
        });

        if (resp.ok) {
          sendResult = await resp.json();
          // Mark sent
          await db.update(emailNotifications).set({ sent: true, sentAt: new Date() }).where(eq(emailNotifications.id, newNotification[0].id));
        } else {
          const err = await resp.text();
          console.warn('Resend send failed:', err);
        }
      } catch (e) {
        console.error('Resend error:', e);
      }
    }

    const responsePayload = { ...newNotification[0], demo: !resendApiKey, sendResult };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
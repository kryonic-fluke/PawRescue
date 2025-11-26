import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notificationSettings, session } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function getUserIdFromRequest(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.replace('Bearer ', '').trim();
  try {
    const sess = await db.select().from(session).where(eq(session.token, token)).limit(1);
    if (sess && sess.length > 0) return sess[0].userId as string;
  } catch (e) {
    console.error('Session lookup error:', e);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId)).limit(1);
    if (!rows || rows.length === 0) {
      // Return defaults
      return NextResponse.json({
        emailUpdates: true,
        pushNotifications: true,
        smsAlerts: false,
        adoptionMatches: true,
        rescueUpdates: true,
        newsletter: false,
        marketingEmails: false
      }, { status: 200 });
    }

    const row = rows[0];
    return NextResponse.json({
      emailUpdates: !!row.emailUpdates,
      pushNotifications: !!row.pushNotifications,
      smsAlerts: !!row.smsAlerts,
      adoptionMatches: !!row.adoptionMatches,
      rescueUpdates: !!row.rescueUpdates,
      newsletter: !!row.newsletter,
      marketingEmails: !!row.marketingEmails
    }, { status: 200 });
  } catch (error) {
    console.error('Notification settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const updateObj: any = {
      emailUpdates: body.emailUpdates === true,
      pushNotifications: body.pushNotifications === true,
      smsAlerts: body.smsAlerts === true,
      adoptionMatches: body.adoptionMatches === true,
      rescueUpdates: body.rescueUpdates === true,
      newsletter: body.newsletter === true,
      marketingEmails: body.marketingEmails === true,
      updatedAt: new Date()
    };

    // Check if exists
    const existing = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId)).limit(1);
    if (existing && existing.length > 0) {
      await db.update(notificationSettings).set(updateObj).where(eq(notificationSettings.userId, userId));
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Insert new
    await db.insert(notificationSettings).values({ ...updateObj, userId, createdAt: new Date() });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Notification settings PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { whatsappMessages } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const messageId = parseInt(id);
      if (isNaN(messageId)) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const message = await db.select()
        .from(whatsappMessages)
        .where(eq(whatsappMessages.id, messageId))
        .limit(1);

      if (message.length === 0) {
        return NextResponse.json({ 
          error: 'Message not found',
          code: 'MESSAGE_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(message[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const chatRoomId = searchParams.get('chatRoomId');
    const senderPhone = searchParams.get('senderPhone');
    const receiverPhone = searchParams.get('receiverPhone');
    const isRead = searchParams.get('read');

    let conditions = [];

    if (chatRoomId) {
      conditions.push(eq(whatsappMessages.chatRoomId, chatRoomId));
    }

    if (senderPhone) {
      conditions.push(eq(whatsappMessages.senderPhone, senderPhone));
    }

    if (receiverPhone) {
      conditions.push(eq(whatsappMessages.receiverPhone, receiverPhone));
    }

    if (isRead !== null && isRead !== undefined) {
      const isReadValue = isRead === 'true';
      conditions.push(eq(whatsappMessages.read, isReadValue));
    }

    let query = db.select().from(whatsappMessages);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const messages = await query
      .orderBy(desc(whatsappMessages.timestamp))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(messages, { status: 200 });
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

    const { senderPhone, receiverPhone, senderName, receiverName, messageText, chatRoomId, messageType, read } = body;

    if (!senderPhone || !senderPhone.trim()) {
      return NextResponse.json({ 
        error: "Sender phone is required",
        code: "MISSING_SENDER_PHONE" 
      }, { status: 400 });
    }

    if (!receiverPhone || !receiverPhone.trim()) {
      return NextResponse.json({ 
        error: "Receiver phone is required",
        code: "MISSING_RECEIVER_PHONE" 
      }, { status: 400 });
    }

    if (!messageText || !messageText.trim()) {
      return NextResponse.json({ 
        error: "Message text is required",
        code: "MISSING_MESSAGE_TEXT" 
      }, { status: 400 });
    }

    if (!chatRoomId || !chatRoomId.trim()) {
      return NextResponse.json({ 
        error: "Chat room ID is required",
        code: "MISSING_CHAT_ROOM_ID" 
      }, { status: 400 });
    }

    const newMessage = await db.insert(whatsappMessages)
      .values({
        senderPhone: senderPhone.trim(),
        receiverPhone: receiverPhone.trim(),
        senderName: senderName?.trim() || null,
        receiverName: receiverName?.trim() || null,
        messageText: messageText.trim(),
        chatRoomId: chatRoomId.trim(),
        messageType: messageType?.trim() || 'text',
        timestamp: new Date(),
        read: read !== undefined ? read : false,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const messageId = parseInt(id);

    const existingMessage = await db.select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json({ 
        error: 'Message not found',
        code: 'MESSAGE_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();

    const updates: any = {};
    
    if (body.messageText !== undefined) {
      updates.messageText = body.messageText.trim();
    }

    if (body.read !== undefined) {
      updates.read = body.read;
    }

    if (body.messageType !== undefined) {
      updates.messageType = body.messageType.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existingMessage[0], { status: 200 });
    }

    const updatedMessage = await db.update(whatsappMessages)
      .set(updates)
      .where(eq(whatsappMessages.id, messageId))
      .returning();

    if (updatedMessage.length === 0) {
      return NextResponse.json({ 
        error: 'Message not found',
        code: 'MESSAGE_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(updatedMessage[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
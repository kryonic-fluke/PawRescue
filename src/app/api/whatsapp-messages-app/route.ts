import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { whatsappMessagesApp, appUsers } from '@/db/schema';
import { eq, and, or, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const userId1 = searchParams.get('userId1');
    const userId2 = searchParams.get('userId2');
    const conversations = searchParams.get('conversations');
    const senderId = searchParams.get('senderId');
    const receiverId = searchParams.get('receiverId');
    const readStatus = searchParams.get('read');
    const senderPhone = searchParams.get('senderPhone');
    const receiverPhone = searchParams.get('receiverPhone');

    // Single message by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const message = await db
        .select()
        .from(whatsappMessagesApp)
        .where(eq(whatsappMessagesApp.id, parseInt(id)))
        .limit(1);

      if (message.length === 0) {
        return NextResponse.json(
          { error: 'Message not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(message[0], { status: 200 });
    }

    // Conversations list for a user
    if (userId && conversations === 'true') {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }

      const userIdInt = parseInt(userId);

      // Get all messages where user is sender or receiver
      const userMessages = await db
        .select({
          id: whatsappMessagesApp.id,
          senderId: whatsappMessagesApp.senderId,
          receiverId: whatsappMessagesApp.receiverId,
          message: whatsappMessagesApp.message,
          timestamp: whatsappMessagesApp.timestamp,
          read: whatsappMessagesApp.read,
          messageType: whatsappMessagesApp.messageType,
          senderPhone: whatsappMessagesApp.senderPhone,
          receiverPhone: whatsappMessagesApp.receiverPhone,
        })
        .from(whatsappMessagesApp)
        .where(
          or(
            eq(whatsappMessagesApp.senderId, userIdInt),
            eq(whatsappMessagesApp.receiverId, userIdInt)
          )
        )
        .orderBy(desc(whatsappMessagesApp.timestamp));

      // Group messages by conversation partner
      const conversationsMap = new Map();

      for (const msg of userMessages) {
        const otherUserId = msg.senderId === userIdInt ? msg.receiverId : msg.senderId;
        const conversationKey = otherUserId || 'unknown';

        if (!conversationsMap.has(conversationKey)) {
          // Get other user details if available
          let otherUser = null;
          if (otherUserId) {
            const userResult = await db
              .select({
                id: appUsers.id,
                name: appUsers.name,
                email: appUsers.email,
                phone: appUsers.phone,
                avatarUrl: appUsers.avatarUrl,
              })
              .from(appUsers)
              .where(eq(appUsers.id, otherUserId))
              .limit(1);

            if (userResult.length > 0) {
              otherUser = userResult[0];
            }
          }

          conversationsMap.set(conversationKey, {
            otherUserId: otherUserId,
            otherUser: otherUser,
            otherPhone: msg.senderId === userIdInt ? msg.receiverPhone : msg.senderPhone,
            lastMessage: msg.message,
            lastMessageTime: msg.timestamp,
            lastMessageType: msg.messageType,
            unreadCount: 0,
          });
        }

        // Count unread messages received by the user
        if (msg.receiverId === userIdInt && !msg.read) {
          const conversation = conversationsMap.get(conversationKey);
          conversation.unreadCount += 1;
        }
      }

      const conversationsList = Array.from(conversationsMap.values());

      return NextResponse.json(conversationsList, { status: 200 });
    }

    // Conversation between two users
    if (userId1 && userId2) {
      if (isNaN(parseInt(userId1)) || isNaN(parseInt(userId2))) {
        return NextResponse.json(
          { error: 'Valid userId1 and userId2 are required', code: 'INVALID_USER_IDS' },
          { status: 400 }
        );
      }

      const user1 = parseInt(userId1);
      const user2 = parseInt(userId2);

      const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
      const offset = parseInt(searchParams.get('offset') ?? '0');

      const messages = await db
        .select()
        .from(whatsappMessagesApp)
        .where(
          or(
            and(
              eq(whatsappMessagesApp.senderId, user1),
              eq(whatsappMessagesApp.receiverId, user2)
            ),
            and(
              eq(whatsappMessagesApp.senderId, user2),
              eq(whatsappMessagesApp.receiverId, user1)
            )
          )
        )
        .orderBy(desc(whatsappMessagesApp.timestamp))
        .limit(limit)
        .offset(offset);

      return NextResponse.json(messages, { status: 200 });
    }

    // List messages with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let conditions = [];

    if (senderId) {
      if (isNaN(parseInt(senderId))) {
        return NextResponse.json(
          { error: 'Valid senderId is required', code: 'INVALID_SENDER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(whatsappMessagesApp.senderId, parseInt(senderId)));
    }

    if (receiverId) {
      if (isNaN(parseInt(receiverId))) {
        return NextResponse.json(
          { error: 'Valid receiverId is required', code: 'INVALID_RECEIVER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(whatsappMessagesApp.receiverId, parseInt(receiverId)));
    }

    if (readStatus !== null && readStatus !== undefined) {
      const readBool = readStatus === 'true';
      conditions.push(eq(whatsappMessagesApp.read, readBool));
    }

    if (senderPhone) {
      conditions.push(eq(whatsappMessagesApp.senderPhone, senderPhone));
    }

    if (receiverPhone) {
      conditions.push(eq(whatsappMessagesApp.receiverPhone, receiverPhone));
    }

    let query = db.select().from(whatsappMessagesApp);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const messages = await query
      .orderBy(desc(whatsappMessagesApp.timestamp))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
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
    const {
      senderId,
      receiverId,
      message,
      phoneNumber,
      senderPhone,
      receiverPhone,
      messageType = 'text',
    } = body;

    // Validate required field
    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    // Validate at least one sender identifier
    if (!senderId && !senderPhone) {
      return NextResponse.json(
        {
          error: 'At least one of senderId or senderPhone must be provided',
          code: 'MISSING_SENDER_IDENTIFIER',
        },
        { status: 400 }
      );
    }

    // Validate at least one receiver identifier
    if (!receiverId && !receiverPhone) {
      return NextResponse.json(
        {
          error: 'At least one of receiverId or receiverPhone must be provided',
          code: 'MISSING_RECEIVER_IDENTIFIER',
        },
        { status: 400 }
      );
    }

    // Validate messageType
    const validMessageTypes = ['text', 'image', 'location'];
    if (!validMessageTypes.includes(messageType)) {
      return NextResponse.json(
        {
          error: 'messageType must be one of: text, image, location',
          code: 'INVALID_MESSAGE_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate senderId if provided
    if (senderId && isNaN(parseInt(senderId))) {
      return NextResponse.json(
        { error: 'Valid senderId is required', code: 'INVALID_SENDER_ID' },
        { status: 400 }
      );
    }

    // Validate receiverId if provided
    if (receiverId && isNaN(parseInt(receiverId))) {
      return NextResponse.json(
        { error: 'Valid receiverId is required', code: 'INVALID_RECEIVER_ID' },
        { status: 400 }
      );
    }

    // Verify sender exists if senderId provided
    if (senderId) {
      const senderExists = await db
        .select({ id: appUsers.id })
        .from(appUsers)
        .where(eq(appUsers.id, parseInt(senderId)))
        .limit(1);

      if (senderExists.length === 0) {
        return NextResponse.json(
          { error: 'Sender user not found', code: 'SENDER_NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    // Verify receiver exists if receiverId provided
    if (receiverId) {
      const receiverExists = await db
        .select({ id: appUsers.id })
        .from(appUsers)
        .where(eq(appUsers.id, parseInt(receiverId)))
        .limit(1);

      if (receiverExists.length === 0) {
        return NextResponse.json(
          { error: 'Receiver user not found', code: 'RECEIVER_NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    const newMessage = await db
      .insert(whatsappMessagesApp)
      .values({
        senderId: senderId ? parseInt(senderId) : null,
        receiverId: receiverId ? parseInt(receiverId) : null,
        message: message.trim(),
        phoneNumber: phoneNumber?.trim() || null,
        senderPhone: senderPhone?.trim() || null,
        receiverPhone: receiverPhone?.trim() || null,
        messageType: messageType,
        timestamp: new Date(),
        read: false,
      })
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });
  } catch (error) {
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const messageId = parseInt(id);

    // Check if message exists
    const existingMessage = await db
      .select()
      .from(whatsappMessagesApp)
      .where(eq(whatsappMessagesApp.id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json(
        { error: 'Message not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { read, message } = body;

    const updates: any = {};

    if (read !== undefined && read !== null) {
      if (typeof read !== 'boolean') {
        return NextResponse.json(
          { error: 'read must be a boolean', code: 'INVALID_READ_VALUE' },
          { status: 400 }
        );
      }
      updates.read = read;
    }

    if (message !== undefined && message !== null) {
      if (typeof message !== 'string' || message.trim() === '') {
        return NextResponse.json(
          { error: 'message must be a non-empty string', code: 'INVALID_MESSAGE' },
          { status: 400 }
        );
      }
      updates.message = message.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    const updatedMessage = await db
      .update(whatsappMessagesApp)
      .set(updates)
      .where(eq(whatsappMessagesApp.id, messageId))
      .returning();

    return NextResponse.json(updatedMessage[0], { status: 200 });
  } catch (error) {
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const messageId = parseInt(id);

    // Check if message exists
    const existingMessage = await db
      .select()
      .from(whatsappMessagesApp)
      .where(eq(whatsappMessagesApp.id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json(
        { error: 'Message not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deletedMessage = await db
      .delete(whatsappMessagesApp)
      .where(eq(whatsappMessagesApp.id, messageId))
      .returning();

    return NextResponse.json(
      {
        message: 'Message deleted successfully',
        deleted: deletedMessage[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
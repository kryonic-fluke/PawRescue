import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { db } from './src/db/index.js';
import { 
  rescueReportsNew, 
  pets, 
  teamMembersNew, 
  adoptionApplicationsNew,
  whatsappMessages,
  ngos,
  animalShelters,
  user,
  session
} from './src/db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Auth middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  try {
    const sessionRecord = await db.select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionRecord.length === 0 || new Date(sessionRecord[0].expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRecord = await db.select()
      .from(user)
      .where(eq(user.id, sessionRecord[0].userId))
      .limit(1);

    if (userRecord.length === 0) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = userRecord[0];
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// ===== RESCUE REPORTS ROUTES =====
app.get('/api/rescue-reports-new', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10'), 100);
    const offset = parseInt(req.query.offset || '0');

    const results = await db.select()
      .from(rescueReportsNew)
      .orderBy(desc(rescueReportsNew.createdAt))
      .limit(limit)
      .offset(offset);

    res.json(results);
  } catch (error) {
    console.error('GET rescue reports error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rescue-reports-new', authenticate, async (req, res) => {
  try {
    const { animalType, description, location, urgency, phone, email, status } = req.body;

    if (!animalType || !description || !location || !phone || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newRecord = await db.insert(rescueReportsNew)
      .values({
        userId: null,
        animalType,
        description,
        location,
        urgency: urgency || 'medium',
        phone,
        email,
        status: status || 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error('POST rescue report error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/rescue-reports-new', authenticate, async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData.id;

    const updated = await db.update(rescueReportsNew)
      .set(updateData)
      .where(eq(rescueReportsNew.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(updated[0]);
  } catch (error) {
    console.error('PUT rescue report error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== PETS/ANIMALS ROUTES =====
app.get('/api/pets', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10'), 100);
    const offset = parseInt(req.query.offset || '0');

    const results = await db.select()
      .from(pets)
      .orderBy(desc(pets.createdAt))
      .limit(limit)
      .offset(offset);

    res.json(results);
  } catch (error) {
    console.error('GET pets error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pets', authenticate, async (req, res) => {
  try {
    const newRecord = await db.insert(pets)
      .values({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error('POST pet error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== TEAM MEMBERS ROUTES =====
app.get('/api/team-members-new', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10'), 100);
    const offset = parseInt(req.query.offset || '0');

    const results = await db.select()
      .from(teamMembersNew)
      .orderBy(desc(teamMembersNew.createdAt))
      .limit(limit)
      .offset(offset);

    res.json(results);
  } catch (error) {
    console.error('GET team members error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ADOPTION APPLICATIONS ROUTES =====
app.get('/api/adoption-applications-new', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10'), 100);
    const offset = parseInt(req.query.offset || '0');

    const results = await db.select()
      .from(adoptionApplicationsNew)
      .orderBy(desc(adoptionApplicationsNew.createdAt))
      .limit(limit)
      .offset(offset);

    res.json(results);
  } catch (error) {
    console.error('GET adoption applications error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== WHATSAPP MESSAGES ROUTES =====
app.get('/api/whatsapp-messages', authenticate, async (req, res) => {
  try {
    const chatRoomId = req.query.chatRoomId;
    
    let query = db.select().from(whatsappMessages);
    
    if (chatRoomId) {
      query = query.where(eq(whatsappMessages.chatRoomId, chatRoomId));
    }
    
    const results = await query.orderBy(whatsappMessages.timestamp).limit(100);
    
    res.json(results);
  } catch (error) {
    console.error('GET messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/whatsapp-messages', authenticate, async (req, res) => {
  try {
    const { senderPhone, receiverPhone, senderName, receiverName, messageText, chatRoomId, messageType } = req.body;

    if (!senderPhone || !receiverPhone || !messageText || !chatRoomId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMessage = await db.insert(whatsappMessages)
      .values({
        senderPhone,
        receiverPhone,
        senderName,
        receiverName,
        messageText,
        chatRoomId,
        messageType: messageType || 'text',
        timestamp: new Date(),
        read: false,
        userId: req.user.id,
        createdAt: new Date(),
      })
      .returning();

    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error('POST message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== NGOs ROUTES =====
app.get('/api/ngos', authenticate, async (req, res) => {
  try {
    const results = await db.select()
      .from(ngos)
      .orderBy(ngos.name)
      .limit(100);

    res.json(results);
  } catch (error) {
    console.error('GET NGOs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ANIMAL SHELTERS ROUTES =====
app.get('/api/animal-shelters', authenticate, async (req, res) => {
  try {
    const results = await db.select()
      .from(animalShelters)
      .orderBy(animalShelters.name)
      .limit(100);

    res.json(results);
  } catch (error) {
    console.error('GET shelters error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const server = createServer(app);

server.listen(port, () => {
  console.log(`✅ Backend server running on http://localhost:${port}`);
  console.log(`📡 API endpoints available at http://localhost:${port}/api/*`);
});

export default app;

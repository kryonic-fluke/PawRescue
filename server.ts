import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { db } from './src/db/index.js';
import * as schema from './src/db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';

// Type declarations
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string | null;
        email: string;
      };
    }
  }
}

interface MockState {
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    passwordHash: string;
    emailVerified: Date | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  sessions: Array<{
    id: string;
    sessionToken: string;
    userId: string;
    expires: Date;
  }>;
  pets: any[];
}

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for development
const mockState: MockState = {
  users: [],
  sessions: [],
  pets: []
};

let useMock = false;

// Database connection check
if (process.env.NODE_ENV !== 'test') {
  db.select({ result: sql<number>`1` })
    .then(() => console.log('✅ Connected to database'))
    .catch((err) => {
      console.error('❌ Database connection error:', err);
      console.log('⚠️  Using mock data');
      useMock = true;
    });
}

// Auth middleware
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    if (!useMock) {
      const sessionRecord = await db.select()
        .from(schema.session)
        .where(and(
          eq(schema.session.sessionToken, token),
          sql`${schema.session.expires} > NOW()`
        ))
        .limit(1);

      if (sessionRecord.length === 0) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      const userRecord = await db.select()
        .from(schema.user)
        .where(eq(schema.user.id, sessionRecord[0].userId))
        .limit(1);

      if (userRecord.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = {
        id: userRecord[0].id,
        name: userRecord[0].name,
        email: userRecord[0].email
      };
    } else {
      const session = mockState.sessions.find(s => 
        s.sessionToken === token && new Date(s.expires) > new Date()
      );
      
      if (!session) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      const user = mockState.users.find(u => u.id === session.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email
      };
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// ===== AUTH ROUTES =====

// Register
app.post('/api/auth/local/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!useMock) {
      // Check if user exists
      const existing = await db.select()
        .from(schema.user)
        .where(eq(schema.user.email, email))
        .limit(1);
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user
      const [newUser] = await db.insert(schema.user)
        .values({
          name: name || '',
          email,
          passwordHash,
          emailVerified: null,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Create session
      const token = crypto.randomBytes(32).toString('hex');
      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      await db.insert(schema.session)
        .values({
          id: sessionId,
          sessionToken: token,
          expires: expiresAt,
          userId: newUser.id
        });

      res.json({ 
        user: { 
          id: newUser.id, 
          name: newUser.name, 
          email: newUser.email 
        }, 
        session: { token } 
      });
    } else {
      // Mock implementation
      const id = (mockState.users.length + 1).toString();
      const passwordHash = await bcrypt.hash(password, 10);
      const user = { 
        id, 
        name: name || '', 
        email, 
        passwordHash,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockState.users.push(user);
      const token = crypto.randomBytes(32).toString('hex');
      mockState.sessions.push({ 
        id: crypto.randomUUID(), 
        sessionToken: token, 
        userId: id, 
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      });
      res.json({ 
        user: { id: user.id, name: user.name, email: user.email }, 
        session: { token } 
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/local/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!useMock) {
      // Find user by email
      const users = await db.select()
        .from(schema.user)
        .where(eq(schema.user.email, email))
        .limit(1);

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];
      
      // Verify password
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create session
      const token = crypto.randomBytes(32).toString('hex');
      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      await db.insert(schema.session)
        .values({
          id: sessionId,
          sessionToken: token,
          expires: expiresAt,
          userId: user.id
        });

      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email 
        }, 
        session: { token } 
      });
    } else {
      // Mock implementation
      const user = mockState.users.find((u: any) => u.email === email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      mockState.sessions.push({ 
        id: crypto.randomUUID(), 
        sessionToken: token, 
        userId: user.id, 
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      });
      
      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email 
        }, 
        session: { token } 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
app.post('/api/auth/local/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    if (!useMock) {
      await db.delete(schema.session)
        .where(eq(schema.session.sessionToken, token));
    } else {
      mockState.sessions = mockState.sessions.filter((s: any) => s.sessionToken !== token);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current session
app.get('/api/auth/local/session', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
      return res.json({ user: null });
    }

    if (!useMock) {
      const sessions = await db.select()
        .from(schema.session)
        .where(and(
          eq(schema.session.sessionToken, token),
          sql`${schema.session.expires} > NOW()`
        ))
        .limit(1);

      if (sessions.length === 0) {
        return res.json({ user: null });
      }

      const users = await db.select()
        .from(schema.user)
        .where(eq(schema.user.id, sessions[0].userId))
        .limit(1);

      if (users.length === 0) {
        return res.json({ user: null });
      }

      const user = users[0];
      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email 
        } 
      });
    } else {
      const session = mockState.sessions.find(
        (s: any) => s.sessionToken === token && new Date(s.expires) > new Date()
      );
      
      if (!session) {
        return res.json({ user: null });
      }

      const user = mockState.users.find((u: any) => u.id === session.userId);
      if (!user) {
        return res.json({ user: null });
      }

      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email 
        } 
      });
    }
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Session lookup failed' });
  }
});

// ===== PETS ROUTES =====
app.get('/api/pets', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string || '10'), 100);
    const offset = parseInt(req.query.offset as string || '0');

    if (!useMock) {
      const results = await db.select()
        .from(schema.pets)
        .orderBy(desc(schema.pets.createdAt))
        .limit(limit)
        .offset(offset);

      res.json(results);
    } else {
      res.json(mockState.pets.slice(offset, offset + limit));
    }
  } catch (error: any) {
    console.error('GET pets error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pet by ID
app.get('/api/pets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!useMock) {
      const results = await db.select()
        .from(schema.pets)
        .where(eq(schema.pets.id, id))
        .limit(1);

      if (results.length === 0) {
        return res.status(404).json({ error: 'Pet not found' });
      }

      res.json(results[0]);
    } else {
      const pet = mockState.pets.find((p: any) => p.id === id);
      if (!pet) {
        return res.status(404).json({ error: 'Pet not found' });
      }
      res.json(pet);
    }
  } catch (error: any) {
    console.error('GET pet by ID error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create pet (protected)
app.post('/api/pets', authenticate, async (req: Request, res: Response) => {
  try {
    const petData = req.body;

    if (!useMock) {
      const [newPet] = await db.insert(schema.pets)
        .values({
          ...petData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      res.status(201).json(newPet);
    } else {
      const newPet = {
        ...petData,
        id: (mockState.pets.length + 1).toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockState.pets.push(newPet);
      res.status(201).json(newPet);
    }
  } catch (error: any) {
    console.error('Create pet error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update pet (protected)
app.put('/api/pets/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const petData = req.body;

    if (!useMock) {
      const [updatedPet] = await db.update(schema.pets)
        .set({
          ...petData,
          updatedAt: new Date()
        })
        .where(eq(schema.pets.id, id))
        .returning();

      if (!updatedPet) {
        return res.status(404).json({ error: 'Pet not found' });
      }

      res.json(updatedPet);
    } else {
      const petIndex = mockState.pets.findIndex((p: any) => p.id === id);
      if (petIndex === -1) {
        return res.status(404).json({ error: 'Pet not found' });
      }

      const updatedPet = {
        ...mockState.pets[petIndex],
        ...petData,
        updatedAt: new Date()
      };

      mockState.pets[petIndex] = updatedPet;
      res.json(updatedPet);
    }
  } catch (error: any) {
    console.error('Update pet error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete pet (protected)
app.delete('/api/pets/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!useMock) {
      const [deletedPet] = await db.delete(schema.pets)
        .where(eq(schema.pets.id, id))
        .returning();

      if (!deletedPet) {
        return res.status(404).json({ error: 'Pet not found' });
      }

      res.json({ success: true });
    } else {
      const petIndex = mockState.pets.findIndex((p: any) => p.id === id);
      if (petIndex === -1) {
        return res.status(404).json({ error: 'Pet not found' });
      }

      mockState.pets.splice(petIndex, 1);
      res.json({ success: true });
    }
  } catch (error: any) {
    console.error('Delete pet error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/*`);
});

export default app;
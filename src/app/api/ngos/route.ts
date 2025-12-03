// src/app/api/ngos/route.ts
import { Request, Response, Router } from 'express';
import { db } from '../../../lib/db.js'; 
import { ngos } from '../../../db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';

const router = Router();
r
// GET /api/ngos - Get all NGOs or single NGO by ID
router.get('/', async (req: Request, res: Response) => {
  try {
    const { id, limit = '10', offset = '0', search, city: cityFilter, verified } = req.query;

    if (id) {
      const ngoId = parseInt(id as string);
      if (isNaN(ngoId)) {
        return res.status(400).json({
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        });
      }

      const ngo = await db
        .select()
        .from(ngos)
        .where(eq(ngos.id, ngoId))
        .limit(1);

      if (ngo.length === 0) {
        return res.status(404).json({
          error: 'NGO not found',
          code: 'NGO_NOT_FOUND'
        });
      }

      return res.json(ngo[0]);
    }

    // Handle list with filters
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offsetNum = parseInt(offset as string);
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(ngos.name, `%${search}%`),
          like(ngos.city, `%${search}%`),
          like(ngos.description, `%${search}%`)
        )
      );
    }

    if (cityFilter) {
      conditions.push(eq(ngos.city, cityFilter as string));
    }

    if (verified !== undefined) {
      conditions.push(eq(ngos.verified, verified === 'true'));
    }

    // In your GET /ngos route handler
    let query = db.select().from(ngos).$dynamic();

    // Later when adding conditions:
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Then continue with orderBy, limit, etc.
    const results = await query
      .orderBy(desc(ngos.rating))
      .limit(limitNum)
      .offset(offsetNum);

    return res.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message
    });
  }
});

// POST /api/ngos - Create a new NGO
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Validate required fields
    const requiredFields = ['name', 'phone', 'email', 'address', 'city', 'state'];
    const missingFields = requiredFields.filter(field => !body[field]?.trim());

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        code: `MISSING_${missingFields[0].toUpperCase()}`
      });
    }

    const insertData = {
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email.trim().toLowerCase(),
      address: body.address.trim(),
      city: body.city.trim(),
      state: body.state.trim(),
      description: body.description?.trim() || null,
      website: body.website?.trim() || null,
      workingHours: body.workingHours?.trim() || null,
      specialization: body.specialization || null,
      verified: body.verified !== undefined ? body.verified : false,
      rating: body.rating ? parseFloat(body.rating) : 0.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newNgo = await db.insert(ngos).values(insertData).returning();
    return res.status(201).json(newNgo[0]);

  } catch (error) {
    console.error('POST error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message
    });
  }
});

// PUT /api/ngos/:id - Update an NGO
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      });
    }

    // Check if NGO exists
    const [existing] = await db
      .select()
      .from(ngos)
      .where(eq(ngos.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        error: 'NGO not found',
        code: 'NGO_NOT_FOUND'
      });
    }

    const body = req.body;
    const updateData: Record<string, any> = { updatedAt: new Date() };

    // Update fields if they exist in the request
    const updateFields = {
      name: (v: any) => typeof v === 'string' ? v.trim() : null,
      phone: (v: any) => v?.trim() || null,
      email: (v: any) => v?.trim().toLowerCase() || null,
      address: (v: any) => v?.trim() || null,
      city: (v: any) => v?.trim() || null,
      state: (v: any) => v?.trim() || null,
      description: (v: any) => v?.trim() || null,
      website: (v: any) => v?.trim() || null,
      workingHours: (v: any) => v?.trim() || null,
      specialization: (v: any) => v || null,
      verified: (v: any) => v !== undefined ? v : existing.verified,
      rating: (v: any) => v !== undefined ? parseFloat(v) : existing.rating
    };

    for (const [field, transform] of Object.entries(updateFields)) {
      if (field in body) {
        updateData[field] = transform(body[field]);
      }
    }

    const [updated] = await db
      .update(ngos)
      .set(updateData)
      .where(eq(ngos.id, id))
      .returning();

    return res.json(updated);

  } catch (error) {
    console.error('PUT error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message
    });
  }
});

// DELETE /api/ngos/:id - Delete an NGO
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      });
    }

    const [existing] = await db
      .select()
      .from(ngos)
      .where(eq(ngos.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        error: 'NGO not found',
        code: 'NGO_NOT_FOUND'
      });
    }

    const [deleted] = await db
      .delete(ngos)
      .where(eq(ngos.id, id))
      .returning();

    return res.json({
      message: 'NGO deleted successfully',
      deleted
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message
    });
  }
});

export default router;
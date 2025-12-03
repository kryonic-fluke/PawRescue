// src/app/api/animal-shelters/route.ts
import { Request, Response, Router } from 'express';
import { db } from '../../../lib/db.js';
import { eq, like, or, and, desc, gt } from 'drizzle-orm';
import { animalShelters } from '../../../db/schema.js';

const router = Router();  

// GET /api/animal-shelters - Get all shelters or single shelter by ID
router.get('/', async (req: Request, res: Response) => {
  try {
    const { id, limit = '10', offset = '0', search, city, available, verified } = req.query;

    if (id) {
      const shelterId = parseInt(id as string);
      if (isNaN(shelterId)) {
        return res.status(400).json({
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        });
      }

      const [shelter] = await db
        .select()
        .from(animalShelters)
        .where(eq(animalShelters.id, shelterId))
        .limit(1);

      if (!shelter) {
        return res.status(404).json({
          error: 'Shelter not found',
          code: 'SHELTER_NOT_FOUND'
        });
      }

      return res.json(shelter);
    }

    // Handle list with filters
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offsetNum = parseInt(offset as string);
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(animalShelters.name, `%${search}%`),
          like(animalShelters.city, `%${search}%`),
          like(animalShelters.description, `%${search}%`)
        )
      );
    }

    if (city) {
      conditions.push(eq(animalShelters.city, city as string));
    }

    if (available === 'true') {
      conditions.push(gt(animalShelters.capacity, animalShelters.currentAnimals));
    }

    if (verified !== undefined) {
      conditions.push(eq(animalShelters.verified, verified === 'true'));
    }

    let query = db.select().from(animalShelters).$dynamic();
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(animalShelters.rating))
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

// POST /api/animal-shelters - Create a new shelter
// POST /api/animal-shelters - Create a new shelter
// POST /api/animal-shelters - Create a new shelter
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Validate required fields
    const requiredFields = ['name', 'phone', 'email', 'address', 'city', 'state', 'capacity'];
    const missingFields = requiredFields.filter(field => !body[field]?.toString().trim());

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        code: `MISSING_${missingFields[0].toUpperCase()}`
      });
    }

    // Create properly typed shelter data matching the schema
    const shelterData = {
      name: String(body.name).trim(),
      description: body.description ? String(body.description).trim() : null,
      address: String(body.address).trim(),
      city: String(body.city).trim(),
      state: String(body.state).trim(),
      phone: String(body.phone).trim(),
      email: String(body.email).trim().toLowerCase(),
      website: body.website ? String(body.website).trim() : null,
      capacity: Number(body.capacity),
      currentAnimals: body.currentAnimals ? Number(body.currentAnimals) : 0,
      facilities: body.facilities || null,
      operatingHours: body.operatingHours || null,
      latitude: body.latitude ? Number(body.latitude) : null,
      longitude: body.longitude ? Number(body.longitude) : null,
      verified: Boolean(body.verified || false),
      rating: body.rating ? Number(body.rating) : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [newShelter] = await db
      .insert(animalShelters)
      .values(shelterData)
      .returning();

    return res.status(201).json(newShelter);

  } catch (error) {
    console.error('POST error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message
    });
  }
});

// PUT /api/animal-shelters/:id - Update a shelter
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      });
    }

    // Check if shelter exists
    const [existing] = await db
      .select()
      .from(animalShelters)
      .where(eq(animalShelters.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        error: 'Shelter not found',
        code: 'SHELTER_NOT_FOUND'
      });
    }

    const body = req.body;
    const updateData: Record<string, any> = { updatedAt: new Date() };

    // Update fields if they exist in the request
    const updateFields = {
      name: (v: any) => typeof v === 'string' ? v.trim() : existing.name,
      phone: (v: any) => v?.trim() || existing.phone,
      email: (v: any) => v?.trim().toLowerCase() || existing.email,
      address: (v: any) => v?.trim() || existing.address,
      city: (v: any) => v?.trim() || existing.city,
      state: (v: any) => v?.trim() || existing.state,
      description: (v: any) => v?.trim() || existing.description,
      capacity: (v: any) => v !== undefined ? (v ? parseInt(v) : null) : existing.capacity,
      currentAnimals: (v: any) => v !== undefined ? parseInt(v) : existing.currentAnimals,
      facilities: (v: any) => v || existing.facilities,
      website: (v: any) => v?.trim() || existing.website,
      verified: (v: any) => v !== undefined ? v : existing.verified,
      rating: (v: any) => v !== undefined ? parseFloat(v) : existing.rating
    };

    for (const [field, transform] of Object.entries(updateFields)) {
      if (field in body) {
        updateData[field] = transform(body[field]);
      }
    }

    const [updated] = await db
      .update(animalShelters)
      .set(updateData)
      .where(eq(animalShelters.id, id))
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

// DELETE /api/animal-shelters/:id - Delete a shelter
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
      .from(animalShelters)
      .where(eq(animalShelters.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        error: 'Shelter not found',
        code: 'SHELTER_NOT_FOUND'
      });
    }

    const [deleted] = await db
      .delete(animalShelters)
      .where(eq(animalShelters.id, id))
      .returning();

    return res.json({
      message: 'Shelter deleted successfully',
      shelter: deleted
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
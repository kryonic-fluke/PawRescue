// src/app/api/pets/route.ts
import { Request, Response } from 'express';
import { db } from '../../../lib/db.js';

import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../../../db/schema.js';

// Schema for pet creation/update validation
// Aligned with actual database schema
const petSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  breed: z.string().optional(),
  age: z.number().int().positive().optional(),
  gender: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  healthStatus: z.string().optional(),
  vaccinationStatus: z.string().optional(),
  neutered: z.boolean().default(false),
  specialNeeds: z.string().optional(),
  shelterId: z.number().int().optional().nullable(),
  ngoId: z.number().int().optional().nullable(),
  images: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
  adoptionStatus: z.enum(['available', 'pending', 'adopted']).optional(),
  status: z.string().optional()
});

// Helper function to send responses
const sendResponse = (res: Response, data: any, status: number = 200) => {
  res.status(status).json(data);
};

// GET /api/pets - Get all pets or a single pet by ID
export async function getPets(req: Request, res: Response) {
  try {
    const { id, limit = '10', offset = '0', search, type, status, shelter_id, gender, size } = req.query;

    // Handle single pet request
    if (id && typeof id === 'string') {
      const pet = await db.query.pets.findFirst({
        where: eq(schema.pets.id, parseInt(id)),
        with: {
          // Note: This requires relations to be defined in schema
          // shelter: true 
        }
      });

      if (!pet) {
        return sendResponse(res, {
          error: 'Pet not found',
          code: 'PET_NOT_FOUND'
        }, 404);
      }

      return sendResponse(res, pet);
    }

    // Handle list of pets with filters
    const queryLimit = Math.min(parseInt(limit as string), 100);
    const queryOffset = parseInt(offset as string);

    // Build the query
    const query = db
      .select({
        id: schema.pets.id,
        name: schema.pets.name,
        type: schema.pets.type,
        breed: schema.pets.breed,
        age: schema.pets.age,
        gender: schema.pets.gender,
        size: schema.pets.size,
        color: schema.pets.color,
        description: schema.pets.description,
        healthStatus: schema.pets.healthStatus,
        vaccinationStatus: schema.pets.vaccinationStatus,
        neutered: schema.pets.neutered,
        specialNeeds: schema.pets.specialNeeds,
        adoptionStatus: schema.pets.adoptionStatus,
        status: schema.pets.status,
        images: schema.pets.images,
        imageUrl: schema.pets.imageUrl,
        shelterId: schema.pets.shelterId,
        ngoId: schema.pets.ngoId,
        createdAt: schema.pets.createdAt,
        updatedAt: schema.pets.updatedAt,
        shelter: {
          id: schema.animalShelters.id,
          name: schema.animalShelters.name,
          address: schema.animalShelters.address,
          city: schema.animalShelters.city,
          phone: schema.animalShelters.phone,
          email: schema.animalShelters.email,
          website: schema.animalShelters.website,
          description: schema.animalShelters.description,
          verified: schema.animalShelters.verified,
          capacity: schema.animalShelters.capacity,
          currentAnimals: schema.animalShelters.currentAnimals
        }
      })
      .from(schema.pets)
      .leftJoin(schema.animalShelters, eq(schema.pets.shelterId, schema.animalShelters.id));

    // Add conditions
    const conditions = [];

    if (search && typeof search === 'string') {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(schema.pets.name, searchTerm),
          like(schema.pets.breed || sql`''`, searchTerm),
          like(schema.pets.description || sql`''`, searchTerm)
        )
      );
    }

    if (type && typeof type === 'string') conditions.push(eq(schema.pets.type, type));
    if (status && typeof status === 'string') conditions.push(eq(schema.pets.status, status));
    if (shelter_id && typeof shelter_id === 'string') conditions.push(eq(schema.pets.shelterId, parseInt(shelter_id)));
    if (gender && typeof gender === 'string') conditions.push(eq(schema.pets.gender, gender));
    if (size && typeof size === 'string') conditions.push(eq(schema.pets.size, size));

    // Execute the query with conditions
    const results = await query
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.pets.createdAt))
      .limit(queryLimit)
      .offset(queryOffset);

    return sendResponse(res, results);
  } catch (error) {
    console.error('GET error:', error);
    return sendResponse(res, {
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

// POST /api/pets - Create a new pet
export async function createPet(req: Request, res: Response) {
  try {
    const body = req.body;

    // Validate request body
    const validation = petSchema.safeParse(body);
    if (!validation.success) {
      return sendResponse(res, {
        error: 'Validation failed',
        details: validation.error.errors,
        code: 'VALIDATION_ERROR'
      }, 400);
    }

    const data = validation.data;

    // Check if shelter exists if provided
    if (data.shelterId) {
      const shelter = await db.query.animalShelters.findFirst({
        where: eq(schema.animalShelters.id, data.shelterId)
      });

      if (!shelter) {
        return sendResponse(res, {
          error: 'Shelter not found',
          code: 'SHELTER_NOT_FOUND'
        }, 404);
      }
    }

    // Create the pet
    const [newPet] = await db.insert(schema.pets)
      .values(data)
      .returning();

    return sendResponse(res, newPet, 201);
  } catch (error) {
    console.error('POST error:', error);
    return sendResponse(res, {
      error: 'Failed to create pet',
      code: 'CREATE_PET_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

// PATCH /api/pets - Update a pet
export async function updatePet(req: Request, res: Response) {
  try {
    const { id } = req.query;
    const body = req.body;

    if (!id || typeof id !== 'string') {
      return sendResponse(res, {
        error: 'Pet ID is required',
        code: 'MISSING_ID'
      }, 400);
    }

    // Validate request body
    const validation = petSchema.partial().safeParse(body);
    if (!validation.success) {
      return sendResponse(res, {
        error: 'Validation failed',
        details: validation.error.errors,
        code: 'VALIDATION_ERROR'
      }, 400);
    }

    const data = validation.data;

    // Check if pet exists
    const existingPet = await db.query.pets.findFirst({
      where: eq(schema.pets.id, parseInt(id))
    });

    if (!existingPet) {
      return sendResponse(res, {
        error: 'Pet not found',
        code: 'PET_NOT_FOUND'
      }, 404);
    }

    // Check if shelter exists if provided
    if (data.shelterId !== undefined) {
      if (data.shelterId === null) {
        // Allow setting shelterId to null
        data.shelterId = null;
      } else {
        const shelter = await db.query.animalShelters.findFirst({
          where: eq(schema.animalShelters.id, data.shelterId)
        });

        if (!shelter) {
          return sendResponse(res, {
            error: 'Shelter not found',
            code: 'SHELTER_NOT_FOUND'
          }, 404);
        }
      }
    }

    // Update the pet
    const [updatedPet] = await db.update(schema.pets)
      .set(data)
      .where(eq(schema.pets.id, parseInt(id)))
      .returning();

    return sendResponse(res, updatedPet);
  } catch (error) {
    console.error('PATCH error:', error);
    return sendResponse(res, {
      error: 'Failed to update pet',
      code: 'UPDATE_PET_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

// DELETE /api/pets - Delete a pet
export async function deletePet(req: Request, res: Response) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return sendResponse(res, {
        error: 'Pet ID is required',
        code: 'MISSING_ID'
      }, 400);
    }

    // Check if pet exists
    const existingPet = await db.query.pets.findFirst({
      where: eq(schema.pets.id, parseInt(id))
    });

    if (!existingPet) {
      return sendResponse(res, {
        error: 'Pet not found',
        code: 'PET_NOT_FOUND'
      }, 404);
    }

    // Delete the pet
    await db.delete(schema.pets)
      .where(eq(schema.pets.id, parseInt(id)));

    return res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error('DELETE error:', error);
    return sendResponse(res, {
      error: 'Failed to delete pet',
      code: 'DELETE_PET_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

// Export all handlers
export const petsHandlers = {
  getPets,
  createPet,
  updatePet,
  deletePet
};
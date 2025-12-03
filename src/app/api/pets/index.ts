// src/app/api/pets/index.ts
import { Router } from 'express';
import { db } from '@/lib/db';
import { pets, animalShelters } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// GET /api/pets - Get all pets with optional filters
router.get('/', async (req, res) => {
  try {
    const { species, breed, age, size, location, adoptionStatus = 'available', limit = 20, offset = 0 } = req.query;

    const whereConditions = [eq(pets.adoptionStatus, adoptionStatus as string)];

    if (species) whereConditions.push(eq(pets.species, species as string));
    if (breed) whereConditions.push(eq(pets.breed, breed as string));
    if (age) whereConditions.push(eq(pets.age, parseInt(age as string)));
    if (size) whereConditions.push(eq(pets.size, size as string));
    if (location) whereConditions.push(eq(animalShelters.city, location as string));

    const petsList = await db
      .select()
      .from(pets)
      .leftJoin(animalShelters, eq(pets.shelterId, animalShelters.id))
      .where(and(...whereConditions))
      .limit(Number(limit))
      .offset(Number(offset));

    return res.status(200).json({ success: true, data: petsList });
  } catch (error) {
    console.error('Error fetching pets:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch pets' });
  }
});

export default router;
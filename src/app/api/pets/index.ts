// src/pages/api/pets/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { pets, shelters } from '@/lib/db/schema';
import { eq, and, or, sql } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { type, breed, age, size, location, status = 'available', limit = 20, offset = 0 } = req.query;

      const whereConditions = [eq(pets.status, status as string)];

      if (type) whereConditions.push(eq(pets.type, type as string));
      if (breed) whereConditions.push(eq(pets.breed, breed as string));
      if (age) whereConditions.push(eq(pets.age, parseInt(age as string)));
      if (size) whereConditions.push(eq(pets.size, size as string));
      if (location) whereConditions.push(eq(shelters.city, location as string));

      const petsList = await db
        .select()
        .from(pets)
        .leftJoin(shelters, eq(pets.shelterId, shelters.id))
        .where(and(...whereConditions))
        .limit(Number(limit))
        .offset(Number(offset));

      return res.status(200).json({ success: true, data: petsList });
    } catch (error) {
      console.error('Error fetching pets:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch pets' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
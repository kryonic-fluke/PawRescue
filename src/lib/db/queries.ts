// src/lib/db/queries.ts
import { db } from '../db';
import { schema } from '../schema';
import { eq, and, or, like, desc } from 'drizzle-orm';

// Shelter queries
export async function getAllShelters() {
  return await db.query.shelters.findMany();
}

export async function getShelterById(id: string) {
  return await db.query.shelters.findFirst({
    where: eq(schema.shelters.id, id)
  });
}

// Pet queries
export async function getAllPets() {
  return await db
    .select()
    .from(schema.pets)
    .leftJoin(schema.shelters, eq(schema.pets.shelter_id, schema.shelters.id));
}

export async function getPetById(id: string) {
  const [result] = await db
    .select()
    .from(schema.pets)
    .leftJoin(schema.shelters, eq(schema.pets.shelter_id, schema.shelters.id))
    .where(eq(schema.pets.id, id));
  return result;
}

export async function getPetsByShelter(shelterId: string) {
  return await db
    .select()
    .from(schema.pets)
    .where(eq(schema.pets.shelter_id, shelterId));
}

export async function searchPets(query: string) {
  const searchTerm = `%${query}%`;
  return await db
    .select()
    .from(schema.pets)
    .where(
      or(
        like(schema.pets.name, searchTerm),
        like(schema.pets.breed || '', searchTerm),
        like(schema.pets.description || '', searchTerm)
      )
    );
}
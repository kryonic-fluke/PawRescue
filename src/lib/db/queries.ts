// src/lib/db/queries.ts
import { db } from '../db';
import * as schema from '../../db/schema';
import { eq, and, or, like, desc } from 'drizzle-orm';

// Shelter queries
export async function getAllShelters() {
  return await db.query.animalShelters.findMany();
}

export async function getShelterById(id: string) {
  return await db.query.animalShelters.findFirst({
    where: eq(schema.animalShelters.id, parseInt(id))
  });
}

// Pet queries
export async function getAllPets() {
  return await db
    .select()
    .from(schema.pets)
    .leftJoin(schema.animalShelters, eq(schema.pets.shelterId, schema.animalShelters.id));
}

export async function getPetById(id: string) {
  const [result] = await db
    .select()
    .from(schema.pets)
    .leftJoin(schema.animalShelters, eq(schema.pets.shelterId, schema.animalShelters.id))
    .where(eq(schema.pets.id, parseInt(id)));
  return result;
}

export async function getPetsByShelter(shelterId: string) {
  return await db
    .select()
    .from(schema.pets)
    .where(eq(schema.pets.shelterId, parseInt(shelterId)));
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
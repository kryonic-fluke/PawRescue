// src/lib/schema.ts
import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Status enum
// const petStatusEnum = pgEnum('pet_status', ['available', 'adopted', 'pending']);

export const pets = pgTable('pets', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type'), // Changed from species to type
  breed: text('breed'),
  age: integer('age'),
  gender: text('gender'),
  size: text('size'),
  description: text('description'),
  status: text('status'), // Using text instead of enum to match DB
  image_url: text('image_url'),
  medical_history: jsonb('medical_history').default({}),
  vaccinated: boolean('vaccinated').default(false),
  neutered: boolean('neutered').default(false),
  adoption_fee: integer('adoption_fee'),
  shelter_id: uuid('shelter_id').references(() => shelters.id, { onDelete: 'cascade' }),
  images: text('images').array(), // Changed to match DB type
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const shelters = pgTable('shelters', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type'),
  address: text('address'),
  city: text('city'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  description: text('description'),
  verified: boolean('verified').default(false),
  images: text('images').array(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Export types
export type Pet = typeof pets.$inferSelect;
export type NewPet = typeof pets.$inferInsert;
export type Shelter = typeof shelters.$inferSelect;
export type NewShelter = typeof shelters.$inferInsert;

export const schema = {
  pets,
  shelters
};
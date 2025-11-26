// src/lib/db/reports.ts
import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporter_name: text('reporter_name').notNull(),
  reporter_email: text('reporter_email').notNull(),
  reporter_phone: text('reporter_phone'),
  animal_type: text('animal_type').notNull(),
  breed: text('breed'),
  color: text('color'),
  location: text('location').notNull(),
  city: text('city').notNull(),
  description: text('description').notNull(),
  urgency: text('urgency').notNull(),
  has_injuries: boolean('has_injuries').default(false),
  injuries_description: text('injuries_description'),
  is_dangerous: boolean('is_dangerous').default(false),
  additional_info: text('additional_info'),
  images: jsonb('images').default('[]'),
  status: text('status').default('pending'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// Add these type exports
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
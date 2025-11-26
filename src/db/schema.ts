// src/db/schema.ts
import { 
  pgTable, 
  serial, 
  text, 
  integer, 
  boolean, 
  timestamp, 
  real, 
  jsonb,
  primaryKey,
  pgEnum
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const urgencyEnum = pgEnum('urgency', ['low', 'medium', 'high', 'critical']);
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'failed']);
export const messageDirectionEnum = pgEnum('message_direction', ['incoming', 'outgoing']);
export const adoptionStatusEnum = pgEnum('adoption_status', ['available', 'pending', 'adopted']);
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'ngo_admin', 'shelter_admin']);

// User table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: userRoleEnum('role').default('user').notNull(),
  phone: text('phone'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Accounts (for OAuth)
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// NGOs
export const ngos = pgTable('ngos', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  website: text('website'),
  workingHours: text('working_hours'),
  specialization: text('specialization'),
  operatingHours: text('operating_hours'),
  servicesOffered: text('services_offered'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  verified: boolean('verified').default(true).notNull(),
  rating: real('rating').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Animal Shelters
export const animalShelters = pgTable('animal_shelters', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  website: text('website'),
  capacity: integer('capacity').notNull(),
  currentAnimals: integer('current_animals').default(0).notNull(),
  facilities: jsonb('facilities').$type<string[]>(),
  operatingHours: text('operating_hours'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  verified: boolean('verified').default(true).notNull(),
  rating: real('rating').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Pets
export const pets = pgTable('pets', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  species: text('species').notNull(),
  breed: text('breed'),
  age: integer('age'),
  gender: text('gender'),
  size: text('size'),
  color: text('color'),
  description: text('description'),
  healthStatus: text('health_status'),
  vaccinationStatus: text('vaccination_status'),
  neutered: boolean('neutered').default(false),
  shelterId: integer('shelter_id').references(() => animalShelters.id),
  ngoId: integer('ngo_id').references(() => ngos.id),
  adoptionStatus: adoptionStatusEnum('adoption_status').default('available').notNull(),
  images: jsonb('images').$type<string[]>(),
  imageUrl: text('image_url'),
  specialNeeds: text('special_needs'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Rescue Reports
export const rescueReports = pgTable('rescue_reports', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  animalType: text('animal_type').notNull(),
  location: text('location').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  description: text('description').notNull(),
  urgency: urgencyEnum('urgency').default('medium').notNull(),
  status: text('status').default('pending').notNull(),
  imageUrl: text('image_url'),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  assignedNgoId: integer('assigned_ngo_id').references(() => ngos.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Adoption Applications
export const adoptionApplications = pgTable('adoption_applications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  petId: integer('pet_id').references(() => pets.id).notNull(),
  status: text('status').default('pending').notNull(),
  applicationDate: timestamp('application_date').defaultNow().notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// WhatsApp Messages
export const whatsappMessages = pgTable('whatsapp_messages', {
  id: serial('id').primaryKey(),
  senderId: text('sender_id').references(() => users.id),
  receiverId: text('receiver_id').references(() => users.id),
  message: text('message').notNull(),
  phoneNumber: text('phone_number'),
  senderPhone: text('sender_phone'),
  receiverPhone: text('receiver_phone'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  read: boolean('read').default(false).notNull(),
  messageType: text('message_type').default('text').notNull(),
  direction: messageDirectionEnum('direction').notNull(),
  status: notificationStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Email Notifications
export const emailNotifications = pgTable('email_notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  recipientEmail: text('recipient_email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  notificationType: text('notification_type').notNull(),
  sentAt: timestamp('sent_at'),
  status: notificationStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Team Members
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  specialty: text('specialty'),
  bio: text('bio'),
  imageUrl: text('image_url'),
  phone: text('phone'),
  email: text('email').notNull(),
  experienceYears: integer('experience_years'),
  ngoId: integer('ngo_id').references(() => ngos.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Ngo = typeof ngos.$inferSelect;
export type NewNgo = typeof ngos.$inferInsert;

export type AnimalShelter = typeof animalShelters.$inferSelect;
export type NewAnimalShelter = typeof animalShelters.$inferInsert;

export type Pet = typeof pets.$inferSelect;
export type NewPet = typeof pets.$inferInsert;

export type RescueReport = typeof rescueReports.$inferSelect;
export type NewRescueReport = typeof rescueReports.$inferInsert;

export type AdoptionApplication = typeof adoptionApplications.$inferSelect;
export type NewAdoptionApplication = typeof adoptionApplications.$inferInsert;

export type WhatsAppMessage = typeof whatsappMessages.$inferSelect;
export type NewWhatsAppMessage = typeof whatsappMessages.$inferInsert;

export type EmailNotification = typeof emailNotifications.$inferSelect;
export type NewEmailNotification = typeof emailNotifications.$inferInsert;

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertPetSchema = createInsertSchema(pets);
export const selectPetSchema = createSelectSchema(pets);

export const insertRescueReportSchema = createInsertSchema(rescueReports);
export const selectRescueReportSchema = createSelectSchema(rescueReports);

// Relations can be defined here if needed
// Example:
// export const usersRelations = relations(users, ({ many }) => ({
//   sessions: many(sessions),
//   accounts: many(accounts),
//   rescueReports: many(rescueReports),
// }));
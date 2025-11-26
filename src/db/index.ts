// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { Options } from 'postgres';
import * as schema from '../lib/db/schema';
import 'dotenv/config';

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Type for our database connection
export type Database = ReturnType<typeof createDatabaseConnection>;

// Create a single reusable connection pool
const createDatabaseConnection = () => {
  const connectionString = process.env.DATABASE_URL!;
  
  // Configure the PostgreSQL client
  const client = postgres(connectionString, {
    ssl: process.env.NODE_ENV === 'production' ? 'require' : 'prefer',
    max: 20, // Adjust based on your needs
    idle_timeout: 20,
    max_lifetime: 60 * 30, // 30 minutes
    connect_timeout: 10,
    onnotice: () => {}, // Suppress notice messages
    onparameter: (key: string) => {
      if (key === 'server_version') {
        console.log('Connected to PostgreSQL server');
      }
    },
    onclose: (connId: number) => {
      console.error(`Database connection ${connId} closed`);
    },
    onerror: (err: unknown) => {
      console.error('Database error:', err);
      return true; // Return true to prevent the error from being thrown
    }
  } as Options<{}>); // Type assertion to handle custom options

  // Create the Drizzle instance with schema
  const db = drizzle(client, {
    schema,
    logger: process.env.NODE_ENV === 'development'
  });

  return { db, client };
};

// Create the database connection
const { db, client } = createDatabaseConnection();

// Graceful shutdown handler
const shutdown = async () => {
  console.log('Shutting down database connection...');
  await client.end();
  process.exit(0);
};

// Handle process termination
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Test the database connection on startup
const testConnection = async () => {
  try {
    await client`SELECT 1`;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Run the connection test
testConnection().catch(console.error);

// Export the database instance and client
export { db, client };

// Re-export schema types for convenience
export * from '../lib/db/schema';
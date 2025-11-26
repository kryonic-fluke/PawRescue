import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Define the shape of our environment variables
export interface Env {
  // Server
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  
  // Database
  DATABASE_URL: string;
  
  // Email
  EMAIL_PROVIDER: 'smtp' | 'sendgrid';
  EMAIL_FROM: string;
  
  // SMTP
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_SECURE?: boolean;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  
  // SendGrid
  SENDGRID_API_KEY?: string;
  
  // Application URLs
  FRONTEND_URL: string;
  ADMIN_URL: string;
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // Google Maps
  GOOGLE_MAPS_API_KEY?: string;
}

// Validate and export environment variables
const env: Env = {
  // Server
  NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Email
  EMAIL_PROVIDER: (process.env.EMAIL_PROVIDER as Env['EMAIL_PROVIDER']) || 'smtp',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@pawrescue.org',
  
  // SMTP
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  
  // SendGrid
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  
  // Application URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:3000/admin',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Google Maps
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
};

// Validate required environment variables
const requiredVars: (keyof Env)[] = [
  'DATABASE_URL',
  'JWT_SECRET',
];

for (const key of requiredVars) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export { env };

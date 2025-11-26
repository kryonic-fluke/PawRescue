// src/test/setupEnv.ts
import { config } from 'dotenv-safe';
import { resolve } from 'path';

// Helper function to safely set environment variables
function setEnvVar(key: string, value: string): void {
  if (key === 'NODE_ENV') {
    // Use Object.defineProperty to bypass read-only restriction
    Object.defineProperty(process.env, key, {
      value,
      writable: true,
      configurable: true
    });
  } else {
    process.env[key] = value;
  }
}

// Load environment variables from .env.test
config({
  path: resolve(process.cwd(), '.env.test'),
  example: resolve(process.cwd(), '.env.example'),
  allowEmptyValues: true,
});

// Ensure NODE_ENV is set to test
setEnvVar('NODE_ENV', 'test');

// Set a longer timeout for all tests (30 seconds)
if (typeof jest !== 'undefined') {
  jest.setTimeout(30000);
}

// Export the environment for use in tests
export const testEnv = { ...process.env };
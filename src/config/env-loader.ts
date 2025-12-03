// src/config/env-loader.ts
// This MUST be imported FIRST before any other modules
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables - try .env.local first, then .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

let loaded = false;
let loadedFrom = '';

if (fs.existsSync(envLocalPath)) {
    const result = dotenv.config({ path: envLocalPath, override: true });
    console.log('✅ Loaded environment from .env.local');
    console.log('Variables loaded:', result.parsed ? Object.keys(result.parsed).length : 0);
    if (result.parsed) {
        console.log('Keys:', Object.keys(result.parsed).join(', '));
    }
    loaded = true;
    loadedFrom = '.env.local';
} else if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath, override: true });
    console.log('✅ Loaded environment from .env');
    console.log('Variables loaded:', result.parsed ? Object.keys(result.parsed).length : 0);
    if (result.parsed) {
        console.log('Keys:', Object.keys(result.parsed).join(', '));
    }
    loaded = true;
    loadedFrom = '.env';
}

if (!loaded) {
    console.warn('⚠️ No .env or .env.local file found');
}

// Check specifically for DATABASE_URL
console.log('\n🔍 Checking critical environment variables:');
console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✅ SET (' + process.env.DATABASE_URL.substring(0, 30) + '...)' : '❌ NOT SET'}`);
console.log(`  PORT: ${process.env.PORT ? '✅ ' + process.env.PORT : '❌ NOT SET'}`);
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'not set (defaulting to development)'}\n`);

// test-env-full.js
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envLocalPath = path.resolve(process.cwd(), '.env.local');

console.log('Reading full .env.local file...\n');

if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf-8');
    const lines = content.split('\n');

    console.log('--- Full File Content ---');
    lines.forEach((line, i) => {
        const lineNum = String(i + 1).padStart(3, ' ');
        console.log(`${lineNum}: ${line}`);
    });

    console.log('\n--- Checking DATABASE_URL ---');
    const dbLines = lines.filter((line, i) => {
        const upper = line.toUpperCase();
        return upper.includes('DATABASE') && !line.trim().startsWith('#');
    });

    console.log('Non-commented lines with DATABASE:', dbLines.length);
    dbLines.forEach(line => console.log('  ', line));

    console.log('\n--- Parsing with dotenv ---');
    const result = dotenv.config({ path: envLocalPath });
    console.log('Parsed keys:', result.parsed ? Object.keys(result.parsed).join(', ') : 'none');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND');
} else {
    console.log('File not found!');
}

// test-env.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envLocalPath = path.resolve(process.cwd(), '.env.local');

console.log('Checking .env.local file...');
console.log('Path:', envLocalPath);
console.log('Exists:', fs.existsSync(envLocalPath));

if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf-8');
    console.log('\n--- File Content (first 500 chars) ---');
    console.log(content.substring(0, 500));
    console.log('\n--- Lines containing DATABASE ---');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (line.toUpperCase().includes('DATABASE')) {
            console.log(`Line ${i + 1}: ${line}`);
        }
    });

    console.log('\n--- Parsing with dotenv ---');
    const result = dotenv.config({ path: envLocalPath });
    if (result.error) {
        console.error('Error parsing .env.local:', result.error);
    } else {
        console.log('Parsed variables:', Object.keys(result.parsed || {}).length);
        console.log('DATABASE_URL from parsed:', result.parsed?.DATABASE_URL ? 'FOUND' : 'NOT FOUND');
        console.log('DATABASE_URL from process.env:', process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND');
    }
}

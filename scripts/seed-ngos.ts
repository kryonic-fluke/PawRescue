// scripts/seed-ngos.ts
import { db } from '../src/db';  // Updated import path
import { ngos } from '../src/db/schema';  // Import from db/schema

const seedNGOs = async () => {
  const sampleNGOs = [
    {
      name: 'Paws & Care',
      email: 'contact@pawsandcare.org',
      phone: '+1234567890',
      address: '123 Pet Street, Animal City',
      city: 'Animal City',  // Added required field
      state: 'CA',          // Added required field
      description: 'Dedicated to rescuing and rehoming abandoned animals',
      website: 'https://pawsandcare.org',
      verified: true,       // Added default value
      rating: 4.8,          // Added default value
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Add more sample NGOs
  ];

  try {
    await db.insert(ngos).values(sampleNGOs);
    console.log('✅ Successfully seeded NGOs');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding NGOs:', error);
    process.exit(1);
  }
};

seedNGOs();
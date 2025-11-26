// scripts/seed.ts
import { db } from '../src/lib/db';
import { shelters, pets, type NewShelter, type NewPet } from '../src/lib/schema';
import { sql } from 'drizzle-orm';

const delhiNgoShelters: Omit<NewShelter, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Friendicoes SECA',
    type: 'ngo',
    address: '271 & 273, Defence Colony, Jor Bagh, New Delhi, Delhi 110003',
    city: 'New Delhi',
    phone: '+91 11 24314787',
    email: 'friendicoes@gmail.com',
    website: 'https://friendicoes.org/',
    description: 'One of the oldest animal welfare organizations in Delhi, working since 1979.',
    verified: true,
    images: ['/shelters/friendicoes1.jpg', '/shelters/friendicoes2.jpg']
  },
  {
    name: 'Sanjay Gandhi Animal Care Centre',
    type: 'shelter',
    address: 'Jahangirpuri, New Delhi, Delhi 110033',
    city: 'New Delhi',
    phone: '+91 11 27251250',
    email: 'sanjaygandhianimalcarecentre@gmail.com',
    website: 'http://www.sgacc.org/',
    description: 'Delhi\'s oldest and largest animal shelter, established in 1980.',
    verified: true,
    images: ['/shelters/sgacc1.jpg']
  },
  {
    name: 'Red Paws Rescue',
    type: 'ngo',
    address: 'Saket, New Delhi, Delhi 110017',
    city: 'New Delhi',
    phone: '+91 98 1055 6000',
    email: 'redpawsrescue@gmail.com',
    website: 'https://redpawsrescue.in/',
    description: 'Dedicated to rescuing and rehabilitating street animals in Delhi NCR.',
    verified: true,
    images: ['/shelters/redpaws1.jpg', '/shelters/redpaws2.jpg']
  }
];

const samplePets: Omit<NewPet, 'id' | 'shelter_id' | 'created_at' | 'updated_at' | 'medical_history' | 'images'>[] = [
  {
    name: 'Bruno',
    type: 'dog', // Changed from species to type
    breed: 'Indian Pariah',
    age: 2,
    gender: 'male',
    size: 'medium',
    description: 'Friendly and energetic, loves to play fetch and go for long walks.',
    vaccinated: true,
    neutered: true,
    adoption_fee: 2000, // Changed to snake_case
    status: 'available',
    image_url: '/pets/bruno.jpg' // Added image_url
  },
  {
    name: 'Luna',
    type: 'cat', // Changed from species to type
    breed: 'Domestic Shorthair',
    age: 1,
    gender: 'female',
    size: 'small',
    description: 'Playful and affectionate, gets along well with other cats.',
    vaccinated: true,
    neutered: true,
    adoption_fee: 1500, // Changed to snake_case
    status: 'available',
    image_url: '/pets/luna.jpg' // Added image_url
  },
  {
    name: 'Max',
    type: 'dog', // Changed from species to type
    breed: 'Labrador Retriever',
    age: 4,
    gender: 'male',
    size: 'large',
    description: 'Gentle giant, great with kids and other pets. House-trained and well-behaved.',
    vaccinated: true,
    neutered: true,
    adoption_fee: 3000, // Changed to snake_case
    status: 'available',
    image_url: '/pets/max.jpg' // Added image_url
  }
];

async function seedDatabase() {
  console.log('Seeding database...');
  
  try {
    // Insert shelters
    console.log('Inserting shelters...');
    const insertedShelters = await db
      .insert(shelters)
      .values(delhiNgoShelters)
      .returning();

    console.log(`Inserted ${insertedShelters.length} shelters`);

    // Insert pets
    const petsWithShelters = samplePets.map((pet, index) => {
      const shelter = insertedShelters[index % insertedShelters.length];
      if (!shelter?.id) {
        throw new Error('Failed to get shelter ID');
      }

      // Map pet data to match schema
      return {
        ...pet,
        shelter_id: shelter.id, // Changed to snake_case
        medical_history: { // Changed to snake_case
          vaccinated: pet.vaccinated,
          neutered: pet.neutered,
          last_vaccination: new Date().toISOString().split('T')[0] // Changed to snake_case
        },
        images: [`/pets/${pet.name.toLowerCase()}.jpg`],
        created_at: new Date(), // Changed to snake_case
        updated_at: new Date(), // Changed to snake_case
      };
    });

    const insertedPets = await db
      .insert(pets)
      .values(petsWithShelters)
      .returning();

    console.log(`Inserted ${insertedPets.length} pets`);
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:');
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
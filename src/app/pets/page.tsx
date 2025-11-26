// src/app/pets/page.tsx
import { db } from '@/db';
import { schema } from '@/lib/schema';

export default async function PetsPage() {
  const pets = await db.select().from(schema.pets);
  
  return (
    <div>
      <h1>All Pets</h1>
      <ul>
        {pets.map((pet) => (
          <li key={pet.id}>{pet.name}</li>
        ))}
      </ul>
    </div>
  );
}
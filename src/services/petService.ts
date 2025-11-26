// src/services/petService.ts
import { Pet } from '@/lib/schema';

const API_BASE_URL = '/api';

export const fetchPets = async (): Promise<Pet[]> => {
  const response = await fetch(`${API_BASE_URL}/pets`);
  if (!response.ok) {
    throw new Error('Failed to fetch pets');
  }
  return response.json();
};

export const createPet = async (petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pet> => {
  const response = await fetch(`${API_BASE_URL}/pets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(petData),
  });
  if (!response.ok) {
    throw new Error('Failed to create pet');
  }
  return response.json();
};
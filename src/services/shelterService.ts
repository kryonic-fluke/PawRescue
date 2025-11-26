// src/services/shelterService.ts
import { Shelter } from '@/lib/schema';

const API_BASE_URL = '/api';

export const fetchShelters = async (): Promise<Shelter[]> => {
  const response = await fetch(`${API_BASE_URL}/shelters`);
  if (!response.ok) {
    throw new Error('Failed to fetch shelters');
  }
  return response.json();
};

export const createShelter = async (shelterData: Omit<Shelter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shelter> => {
  const response = await fetch(`${API_BASE_URL}/shelters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shelterData),
  });
  if (!response.ok) {
    throw new Error('Failed to create shelter');
  }
  return response.json();
};
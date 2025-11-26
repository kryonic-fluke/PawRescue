// src/types/api.ts

export interface PetResponse {
  id: number;
  name: string;
  type: string;
  breed?: string;
  age?: string;
  size?: string;
  location?: string;
  description?: string;
  image?: string;
  status?: string;
  gender?: string;
  contact?: string;
  vaccinated?: boolean;
  neutered?: boolean;
}
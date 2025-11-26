// src/types/ngo.ts
export interface NGO {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address: string;
  position: [number, number];
  lat: number; 
  lng: number; 
   type: string; 
  city?: string;
  description?: string;
  services: string;
  website?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
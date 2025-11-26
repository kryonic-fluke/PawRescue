import { NGO } from './ngo';

export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  position: [number, number];
  type: string;
  address: string;
  phone?: string;
  website?: string;
  services?: string | string[];
  rating?: number;
  hours?: string;
  description?: string;
  city?: string;
}

export interface MapNGO extends Omit<NGO, 'position' | 'lat' | 'lng' | 'type'> {
  position: [number, number];
  lat: number;
  lng: number;
  type: string;
}

// Helper type to convert between NGO and MapLocation
export type ToMapLocation = (ngo: MapNGO) => MapLocation;

// Optional: Create a function to convert NGO to MapLocation
export const convertToMapLocation = (ngo: MapNGO): MapLocation => ({
  id: ngo.id.toString(),
  name: ngo.name,
  lat: ngo.lat,
  lng: ngo.lng,
  position: ngo.position,
  type: ngo.type,
  address: ngo.address,
  phone: ngo.phone,
  website: ngo.website,
  services: ngo.services,
  description: ngo.description,
  city: ngo.city
});
// src/services/mockApi.ts
import { MapNGO } from '@/types/map';
import { PetResponse } from '@/types/api';

// Mock data with accurate coordinates
let ngos: MapNGO[] = [
  // Paws & Care Foundation - Jangpura Extension
  {
    id: 1,
    name: "Paws & Care Foundation",
    address: "G-1/2, Jangpura Extension, New Delhi 110014",
    position: [28.5932, 77.2503] as [number, number],
    lat: 28.5932,
    lng: 77.2503,
    type: "ngo",
    phone: "+911145678901",
    website: "https://pawsandcare.org",
    services: "Rescue, Adoption, Medical Care, Sterilization",
  },
  // Friendicoes SECA - Defence Colony
  {
    id: 2,
    name: "Friendicoes SECA",
    address: "271 & 273, Defence Colony, New Delhi 110024",
    position: [28.5693, 77.2307] as [number, number],
    lat: 28.5693,
    lng: 77.2307,
    type: "ngo",
    phone: "+911124350522",
    website: "https://friendicoes.org",
    services: "Shelter, Medical Care, Adoption, Emergency Rescue",
  },
  // Sanjay Gandhi Animal Care Centre - Raja Garden
  {
    id: 3,
    name: "Sanjay Gandhi Animal Care Centre",
    address: "Shriram Mandir Marg, Raja Garden, New Delhi 110015",
    position: [28.6562, 77.1210] as [number, number],
    lat: 28.6562,
    lng: 77.1210,
    type: "shelter",
    phone: "+911125413702",
    services: "Shelter, Medical Care, Adoption, Vaccination",
  },
  // Red Paws Rescue - Dwarka
  {
    id: 4,
    name: "Red Paws Rescue",
    address: "Sector 12, Dwarka, New Delhi 110075",
    position: [28.5924, 77.0409] as [number, number],
    lat: 28.5924,
    lng: 77.0409,
    type: "shelter",
    phone: "+919999999999",
    services: "Rescue, Foster Care, Adoption, Medical Aid",
  },
  // Pet Hospital & Research Centre - Patel Nagar
  {
    id: 5,
    name: "Pet Hospital & Research Centre",
    address: "A-2, West Patel Nagar, New Delhi 110008",
    position: [28.6505, 77.1662] as [number, number],
    lat: 28.6505,
    lng: 77.1662,
    type: "hospital",
    phone: "+911125785432",
    services: "24/7 Emergency, Surgery, Vaccination, Grooming",
  },
  // City Pet Clinic - South Extension
  {
    id: 6,
    name: "City Pet Clinic",
    address: "E-1, South Extension Part 1, New Delhi 110049",
    position: [28.5671, 77.2147] as [number, number],
    lat: 28.5671,
    lng: 77.2147,
    type: "hospital",
    phone: "+911124625432",
    services: "General Medicine, Surgery, Dental Care, Grooming",
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock pets dataset (returns PetResponse[])
const mockPets: PetResponse[] = [
  {
    id: 1,
    name: "Buddy",
    type: "dog",
    breed: "Golden Retriever",
    age: "2 years",
    size: "Large",
    location: "New Delhi",
    description: "Friendly and playful. Loves long walks and playing fetch.",
    image: "/images/pets/1.jpg",
    status: "Available",
    gender: "Male",
    contact: "contact@example.com",
    vaccinated: true,
    neutered: true,
  },
  {
    id: 2,
    name: "Whiskers",
    type: "cat",
    breed: "Domestic Shorthair",
    age: "1.5 years",
    size: "Small",
    location: "Mumbai",
    description: "Gentle and affectionate. Gets along well with other cats.",
    image: "/images/pets/2.jpg",
    status: "Available",
    gender: "Female",
    contact: "contact@example.com",
    vaccinated: true,
    neutered: true,
  },
  {
    id: 3,
    name: "Milo",
    type: "dog",
    breed: "Beagle",
    age: "3 years",
    size: "Medium",
    location: "Gurgaon",
    description: "Curious and energetic. Great with kids.",
    image: "/images/pets/3.jpg",
    status: "Available",
    gender: "Male",
    contact: "contact@example.com",
    vaccinated: true,
    neutered: false,
  }
  // add more mock pets if needed
];

export const mockApi = {
  // NGOs
  getNGOs: async (): Promise<MapNGO[]> => {
    await delay(500); // Simulate network delay
    return [...ngos];
  },

  getNGOById: async (id: number): Promise<MapNGO | undefined> => {
    await delay(200);
    return ngos.find(ngo => ngo.id === id);
  },

  createNGO: async (ngo: Omit<MapNGO, 'id'>): Promise<MapNGO> => {
    await delay(300);
    const newNGO: MapNGO = {
      ...ngo,
      id: Math.max(0, ...ngos.map(n => n.id || 0)) + 1
    };
    ngos = [...ngos, newNGO];
    return newNGO;
  },

  updateNGO: async (id: number, updates: Partial<MapNGO>): Promise<MapNGO | undefined> => {
    await delay(300);
    const index = ngos.findIndex(n => n.id === id);
    if (index === -1) return undefined;

    ngos[index] = { ...ngos[index], ...updates };
    return ngos[index];
  },

  deleteNGO: async (id: number): Promise<boolean> => {
    await delay(300);
    const initialLength = ngos.length;
    ngos = ngos.filter(ngo => ngo.id !== id);
    return ngos.length < initialLength;
  },

  // Pets
  getPets: async (): Promise<PetResponse[]> => {
    await delay(500);
    // return a shallow clone to prevent accidental mutation
    return mockPets.map(p => ({ ...p }));
  },
};

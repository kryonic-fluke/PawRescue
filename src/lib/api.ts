// src/lib/api.ts
// Using empty string as base URL since we're using relative paths with proxy
const API_BASE_URL = '';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: string;
  size?: string;
  location?: string;
  description?: string;
  images?: string[];
  status?: string;
  [key: string]: any;
}

interface DonationData {
  amount: number;
  email: string;
  name: string;
  [key: string]: any;
}

interface ContactData {
  name: string;
  email: string;
  message: string;
  [key: string]: any;
}

export const api = {
  // Pets
  getPets: async (query = ''): Promise<Pet[]> => {
    const res = await fetch(`/api/pets${query ? `?${query}` : ''}`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch pets');
    }
    return res.json();
  },

  // Get single pet by ID
  getPetById: async (id: string): Promise<Pet> => {
    const res = await fetch(`/api/pets/${id}`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || `Failed to fetch pet with ID: ${id}`);
    }
    return res.json();
  },

  // Shelters
  getShelters: async (): Promise<any[]> => {
    const res = await fetch('/api/shelters');
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch shelters');
    }
    return res.json();
  },

  // Donations
  createDonation: async (data: DonationData): Promise<{ clientSecret: string }> => {
    const res = await fetch('/api/donate/create-payment-intent', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create donation');
    }
    return res.json();
  },

  // Contact/Email
  sendContactEmail: async (data: ContactData): Promise<{ success: boolean; message?: string }> => {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to send email');
    }
    return res.json();
  },

  // Adoption application
  submitAdoption: async (petId: string, data: any): Promise<{ success: boolean; message?: string }> => {
    const res = await fetch(`/api/pets/${petId}/adopt`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to submit adoption application');
    }
    return res.json();
  }
};
// src/components/PetList.tsx
'use client';

import { useEffect, useState } from 'react';
import { Pet } from '@/lib/schema';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Search, Info } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

interface PetListProps {
  filters?: {
    type?: string;
    size?: string;
    location?: string;
    search?: string;
  };
  limit?: number;
}

interface PetWithLocation extends Omit<Pet, 'images'> {
  location?: string;
  images: string[];
}

// Helper function to get default pet image based on type
const getDefaultPetImage = (type: string | null | undefined, id: string | number | null | undefined) => {
  const petType = (type || 'dog').toLowerCase();
  
  const dogImages = [
    'https://images.unsplash.com/photo-1601758133732-5e0a1a0cda6a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605463286342-a10b845922d6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&auto=format&fit=crop&q=80'
  ];
  
  const catImages = [
    'https://images.unsplash.com/photo-1596854407944-bf87ed6e4a1e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=800&auto=format&fit=crop&q=80'
  ];

  const images = petType === 'cat' ? catImages : dogImages;
  const idStr = id ? id.toString() : Math.random().toString();
  const index = Math.abs(parseInt(idStr, 36)) % images.length;
  return images[Math.max(0, index)];
};

// Helper function to ensure valid image URL
const getValidImageUrl = (url: string | undefined, type: string | null | undefined, id: string | number | null | undefined) => {
  if (!url) return getDefaultPetImage(type, id);
  try {
    if (url.startsWith('/')) {
      return new URL(url, window.location.origin).toString();
    }
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    return getDefaultPetImage(type, id);
  } catch (e) {
    return getDefaultPetImage(type, id);
  }
};

export default function PetList({ filters = {}, limit }: PetListProps) {
  const [pets, setPets] = useState<PetWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToFavorites, isFavorite } = useFavorites();

  useEffect(() => {
    const loadPets = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.size) queryParams.append('size', filters.size);
        if (filters.location) queryParams.append('location', filters.location);
        if (filters.search) queryParams.append('search', filters.search);
        if (limit) queryParams.append('limit', limit.toString());

        const data = await api.getPets(queryParams.toString());
        const transformedData = data.map((pet: any) => ({
          ...pet,
          images: pet.images || [],
          location: pet.location || 'Unknown location'
        }));
        setPets(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pets');
        console.error('Error loading pets:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPets();
  }, [filters, limit]);

  const handleFavoriteClick = (pet: PetWithLocation, e: React.MouseEvent) => {
    e.stopPropagation();
    addToFavorites({
      id: pet.id.toString(),
      name: pet.name || 'Unnamed Pet',
      type: pet.type || 'pet',
      breed: pet.breed || 'Mixed',
      age: pet.age?.toString() || 'Unknown',
      location: pet.location || 'Location not specified',
      image: pet.images?.[0] || getDefaultPetImage(pet.type, pet.id)
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error loading pets. Please try again later.</div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No pets found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {pets.map((pet) => {
        const imageUrl = getValidImageUrl(pet.images?.[0], pet.type, pet.id);
        
        return (
          <div key={pet.id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
            <div className="relative aspect-video bg-muted">
              <img
                src={imageUrl}
                alt={pet.name || 'Pet'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getDefaultPetImage(pet.type, pet.id);
                  target.onerror = null;
                }}
                loading="lazy"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleFavoriteClick(pet, e)}
                className="absolute top-2 right-2 z-10 h-10 w-10 rounded-full bg-white/80 hover:bg-white"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite(pet.id.toString()) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                  }`}
                />
              </Button>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold">{pet.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pet.breed || 'Mixed'} • {pet.age}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {pet.type}
                </Badge>
              </div>
              {pet.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {pet.description}
                </p>
              )}
              {pet.location && (
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{pet.location}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link to={`/animal/${pet.id}`}>
                    <Info className="h-4 w-4 mr-2" />
                    Details
                  </Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link to={`/adopt/${pet.id}`}>
                    <Heart className="h-4 w-4 mr-2" />
                    Adopt
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
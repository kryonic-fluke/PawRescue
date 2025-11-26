import { useState, useEffect } from 'react';

export interface FavoritePet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  location: string;
  image: string;
  addedDate: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoritePet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pawrescue_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('pawrescue_favorites', JSON.stringify(favorites));
    }
  }, [favorites, isLoading]);

  const addToFavorites = (pet: Omit<FavoritePet, 'addedDate'>) => {
    setFavorites(prev => {
      // Check if already in favorites
      if (prev.some(fav => fav.id === pet.id)) {
        return prev;
      }
      return [...prev, { ...pet, addedDate: new Date().toISOString() }];
    });
  };

  const removeFromFavorites = (id: string) => {
    setFavorites(prev => prev.filter(pet => pet.id !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.some(pet => pet.id === id);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    isLoading
  };
};
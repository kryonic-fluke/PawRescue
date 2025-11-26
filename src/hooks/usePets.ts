// src/hooks/usePets.ts
import { useQuery } from '@tanstack/react-query';
import { getAllPets } from '@/lib/db/queries';

export function usePets() {
  return useQuery({
    queryKey: ['pets'],
    queryFn: getAllPets,
  });
}
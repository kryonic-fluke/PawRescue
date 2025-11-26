// src/components/SheltersList.tsx
'use client';

import { useEffect, useState } from 'react';
import { Shelter } from '@/lib/schema';
import { fetchShelters } from '@/services/shelterService';

export default function SheltersList() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShelters = async () => {
      try {
        const data = await fetchShelters();
        setShelters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shelters');
      } finally {
        setLoading(false);
      }
    };

    loadShelters();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {shelters.map((shelter) => (
        <div key={shelter.id} className="border rounded-lg p-4 shadow-sm">
          <h3 className="text-xl font-semibold">{shelter.name}</h3>
          <p>Type: {shelter.type}</p>
          <p>Location: {shelter.city}</p>
          <p>Phone: {shelter.phone}</p>
          <p>Email: {shelter.email}</p>
          {shelter.website && (
            <a
              href={shelter.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Visit Website
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
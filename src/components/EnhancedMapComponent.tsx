// src/components/EnhancedMapComponent.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { MapLocation } from '@/types/map';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Navigation, User } from 'lucide-react';
import { toast } from 'sonner';

// ---------------------- Leaflet marker icon fixes ----------------------
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// small factory for colored markers (uses the same external images you used previously)
const createCustomIcon = (color: string) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const locationIcons = {
  shelter: createCustomIcon('green'),
  ngo: createCustomIcon('blue'),
  hospital: createCustomIcon('red'),
  default: createCustomIcon('grey'),
};

const userIcon = createCustomIcon('violet');
const searchedLocationIcon = createCustomIcon('red');

const getMarkerColor = (type: string) => {
  switch (type) {
    case 'shelter':
      return '#22c55e';
    case 'ngo':
      return '#3b82f6';
    case 'hospital':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

// ---------------------- MapController (uses correct MapLocation type) ----------------------
const MapController = ({
  userLocation,
  searchedLocation,
}: {
  userLocation: { lat: number; lng: number; address?: string; accuracy?: number } | null;
  searchedLocation: MapLocation | null;
}) => {
  const map = useMap();

  useEffect(() => {
    if (searchedLocation && typeof searchedLocation.lat === 'number' && typeof searchedLocation.lng === 'number') {
      map.setView([searchedLocation.lat, searchedLocation.lng], 14);
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [userLocation, searchedLocation, map]);

  return null;
};

// ---------------------- Component Props ----------------------
interface EnhancedMapComponentProps {
  className?: string;
  height?: string;
  onLocationSelect?: (location: MapLocation) => void;
  searchTerm?: string;
  filterType?: string;
  searchedLocation?: MapLocation | null;
  showDirections?: boolean;
  locations?: MapLocation[];
  userLocation?: { lat: number; lng: number; address?: string; accuracy?: number } | null;
  // new fallback center props
  lat?: number;
  lng?: number;
}

// ---------------------- Main Component ----------------------
const EnhancedMapComponent: React.FC<EnhancedMapComponentProps> = ({
  className = '',
  height = '500px',
  onLocationSelect,
  searchTerm = '',
  filterType = 'all',
  searchedLocation = null,
  showDirections = false,
  locations = [],
  userLocation = null,
  lat,
  lng,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [routeLine, setRouteLine] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ duration?: number; distance?: number } | null>(null);

  const defaultCenter: [number, number] =
    typeof lat === 'number' && typeof lng === 'number' ? [lat, lng] : [28.6139, 77.2090]; // Default to New Delhi center

  // Filter locations
  const filteredLocations = locations.filter((loc) => {
    if (!loc) return false;
    const matchesSearch =
      searchTerm === '' ||
      loc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || loc.type === filterType;
    return matchesSearch && matchesType;
  });

  // Handlers
  const handleMarkerClick = useCallback(
    (location: MapLocation) => {
      setSelectedLocation(location);
      onLocationSelect && onLocationSelect(location);
    },
    [onLocationSelect]
  );

  const getDirections = useCallback(
    (location: MapLocation) => {
      if (!userLocation) {
        toast.error('User location not available. Please allow location access.');
        return;
      }

      try {
        const origin = `${userLocation.lat},${userLocation.lng}`;
        const destination = `${location.lat},${location.lng}`;
        const googleMapsUrl =
          `https://www.google.com/maps/dir/?api=1` +
          `&origin=${encodeURIComponent(origin)}` +
          `&destination=${encodeURIComponent(destination)}` +
          `&travelmode=driving` +
          `&dir_action=navigate`;

        window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
        toast.success(`Opening directions to ${location.name} in Google Maps!`);
      } catch (error) {
        console.error('Error getting directions:', error);
        toast.error('Failed to open directions. Please try again.');
      }
    },
    [userLocation]
  );

  const handleCall = useCallback((phone?: string) => {
    if (!phone) {
      toast.error('Phone number not available');
      return;
    }
    window.location.href = `tel:${phone}`;
  }, []);

  // ---------------------- Return (slim wrapper) ----------------------
  return (
    <div className={`${className} h-full w-full`} style={{ height }}>
      <MapContainer
        center={
          searchedLocation
            ? [searchedLocation.lat, searchedLocation.lng]
            : userLocation
            ? [userLocation.lat, userLocation.lng]
            : defaultCenter
        }
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User Location Marker + Accuracy Circle (uses divIcon and accuracy if available) */}
        {userLocation && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                className: 'user-location-marker',
                html: `<div style="
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  width:36px;
                  height:36px;
                  border-radius:50%;
                  background:linear-gradient(135deg,#3b82f6,#06b6d4);
                  color:white;
                  box-shadow:0 2px 6px rgba(0,0,0,0.3);
                  font-size:18px;
                ">📍</div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
              })}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold">Your Location</h3>
                  <p className="text-sm text-gray-600">{userLocation.address ?? 'Current location'}</p>
                </div>
              </Popup>
            </Marker>

            <Circle
              center={[userLocation.lat, userLocation.lng]}
              // Use provided accuracy if present; otherwise fallback to 100m
              radius={(userLocation as any)?.accuracy ?? 100}
              interactive={false}
              pathOptions={{
                fillColor: '#3b82f6',
                fillOpacity: 0.12,
                color: '#3b82f6',
                weight: 1,
              }}
            />
          </>
        )}

        {/* Other Location Markers */}
        {filteredLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={createCustomIcon(location.type === 'ngo' ? 'red' : location.type === 'shelter' ? 'green' : 'blue')}
            eventHandlers={{
              click: () => handleMarkerClick(location),
            }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{location.name}</p>
                <p className="text-sm text-gray-600">{location.address}</p>
                {location.phone && <p className="text-sm">📞 {location.phone}</p>}
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${location.lat},${location.lng}&travelmode=driving`;
                    window.open(url, '_blank');
                  }}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route if showing directions */}
        {showDirections && routeLine.length > 0 && <Polyline positions={routeLine} pathOptions={{ color: '#3b82f6' }} />}

        <MapController userLocation={userLocation ?? null} searchedLocation={searchedLocation ?? null} />
      </MapContainer>
    </div>
  );
};

export default EnhancedMapComponent;

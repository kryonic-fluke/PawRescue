// src/pages/LiveMap.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Navigation,
  Search,
  Star,
  Phone,
  X,
  Loader2,
  Crosshair,
  RefreshCw,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { mockApi } from "@/services/mockApi";
import { cn } from "@/lib/utils";

/* --- Leaflet Imports --- */
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";

/* --- Fix Leaflet Default Icons --- */
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

/* --- Types --- */
interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: "ngo" | "shelter" | "hospital";
  address: string;
  phone?: string;
  services?: string[];
  rating?: number;
  distance?: number;
}

interface UserLocation {
  lat: number;
  lng: number;
  addressName?: string;
}

/* --- Helpers --- */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Nominatim Reverse Geocoding
const getAddressFromCoords = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return (
      data.address.suburb ||
      data.address.city_district ||
      data.address.city ||
      "Unknown Location"
    );
  } catch (e) {
    return "Current Location";
  }
};

/* --- Sub-Components --- */
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

/* --- Main Component --- */
const LiveMap: React.FC = () => {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // Load Initial Data (Mock)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await mockApi.getNGOs();
        const formatted: MapLocation[] = data.map((item: any, idx: number) => ({
          id: item.id?.toString() || `loc-${idx}`,
          lat: parseFloat(item.lat) || 28.6139 + (Math.random() * 0.1),
          lng: parseFloat(item.lng) || 77.209 + (Math.random() * 0.1),
          name: item.name || "Unknown Location",
          type: item.type || "ngo",
          address: item.address || "Address unavailable",
          phone: item.phone,
          services: Array.isArray(item.services) ? item.services : (item.services || "").split(","),
          rating: item.rating || 4.5,
        }));
        setLocations(formatted);
      } catch (err) {
        toast.error("Failed to load locations");
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  // Find Nearest Logic
  const findNearestLocation = (uLat: number, uLng: number, locs: MapLocation[]) => {
    let nearest: MapLocation | null = null;
    let minDist = Infinity;
    locs.forEach((loc) => {
      const dist = calculateDistance(uLat, uLng, loc.lat, loc.lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = loc;
      }
    });
    return nearest;
  };

  // 1. Detect Location (Standard Browser API)
  const handleDetectLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error("Browser does not support geolocation");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const addressName = await getAddressFromCoords(latitude, longitude);
        
        setUserLocation({ lat: latitude, lng: longitude, addressName });
        
        const nearest = findNearestLocation(latitude, longitude, locations);
        if (nearest) setSelectedLocation(nearest);
        
        setIsLocating(false);
        toast.success("Location updated!");
      },
      (err) => {
        console.error(err);
        toast.error("Unable to retrieve location. Try allowing permission.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // 2. Map Click
  const handleMapClick = async (lat: number, lng: number) => {
    const addressName = await getAddressFromCoords(lat, lng);
    setUserLocation({ lat, lng, addressName });
    const nearest = findNearestLocation(lat, lng, locations);
    if (nearest) setSelectedLocation(nearest);
  };

  const handleGetDirections = (destination: MapLocation) => {
    if (!userLocation) {
      toast.warning("Please detect your location first!");
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destination.lat},${destination.lng}`;
    window.open(url, "_blank");
  };

  // Sorting
  const displayLocations = useMemo(() => {
    let result = [...locations];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(l => l.name.toLowerCase().includes(lower) || l.address.toLowerCase().includes(lower));
    }
    if (userLocation) {
      result = result
        .map(loc => ({ ...loc, distance: calculateDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng) }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    return result;
  }, [locations, searchTerm, userLocation]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400"><Loader2 className="animate-spin mr-2" /> Loading Map...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 text-zinc-100">
      <Card className="max-w-7xl mx-auto h-[calc(100vh-50px)] flex flex-col bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
        
        {/* --- Header --- */}
        <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-900 z-10 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-amber-500 flex items-center gap-2">
                <MapPin className="fill-amber-500 text-zinc-900" />
                Pet Rescue Map
              </CardTitle>
              <p className="text-sm text-zinc-400 mt-1">Emergency Navigation System</p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button
                onClick={handleDetectLocation}
                disabled={isLocating}
                className={cn(
                  "w-full md:w-auto transition-all",
                  userLocation 
                    ? "bg-zinc-800 text-amber-500 border border-amber-500/50 hover:bg-zinc-700" 
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                )}
              >
                {isLocating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : userLocation ? (
                  <RefreshCw className="mr-2 h-4 w-4" />
                ) : (
                  <Crosshair className="mr-2 h-4 w-4" />
                )}
                {isLocating 
                  ? "Locating..." 
                  : userLocation 
                    ? userLocation.addressName || "My Location" 
                    : "Detect My Location"}
              </Button>
            </div>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search NGOs, shelters..."
              className="pl-9 bg-zinc-950 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        {/* --- Main Content --- */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* LEFT: List (35%) */}
          <div className="w-full md:w-[35%] border-r border-zinc-800 bg-zinc-900 flex flex-col h-full">
            <div className="p-3 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-500 flex justify-between shrink-0">
               <span>{displayLocations.length} Locations</span>
               {userLocation && <span className="text-amber-500">Sorted by Distance</span>}
            </div>

            <ScrollArea className="flex-1">
              <div className="flex flex-col pb-4">
                {displayLocations.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    className={cn(
                      "p-4 border-b border-zinc-800 cursor-pointer transition-colors hover:bg-zinc-800",
                      selectedLocation?.id === loc.id 
                        ? "bg-zinc-800 border-l-4 border-l-amber-500" 
                        : "border-l-4 border-l-transparent"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-zinc-200">{loc.name}</h3>
                      {loc.distance && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-[10px]">
                          {loc.distance.toFixed(1)} km
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-1">{loc.address}</p>
                    
                    <div className="flex gap-2 mt-3">
                        <Badge className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-[10px] uppercase tracking-wider">
                            {loc.type}
                        </Badge>
                        {loc.rating && (
                            <div className="flex items-center text-xs text-zinc-400">
                                <Star className="w-3 h-3 text-amber-500 mr-1 fill-amber-500" />
                                {loc.rating}
                            </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: Map (65%) */}
          <div className="w-full md:w-[65%] relative bg-zinc-100 flex-1 h-full min-h-[400px]">
            <MapContainer
              center={[28.6139, 77.209]}
              zoom={13}
              style={{ height: "100%", width: "100%", zIndex: 0 }}
              zoomControl={false}
            >
              {/* WHITE / COLORED MAP */}
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              <MapClickHandler onMapClick={handleMapClick} />
              {selectedLocation && <MapController center={[selectedLocation.lat, selectedLocation.lng]} />}
              
              {/* User Pin */}
              {userLocation && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={L.divIcon({
                    className: "custom-pin",
                    html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.4);"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                  })}
                />
              )}

              {/* NGO Markers */}
              {locations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={[loc.lat, loc.lng]}
                  eventHandlers={{ click: () => setSelectedLocation(loc) }}
                />
              ))}
            </MapContainer>

            {/* --- Overlay Card --- */}
            {selectedLocation && (
              <div className="absolute bottom-6 right-6 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-4 z-[999] animate-in slide-in-from-bottom-5">
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <h3 className="text-lg font-bold text-zinc-100 pr-6">{selectedLocation.name}</h3>
                <p className="text-sm text-zinc-400 mt-1">{selectedLocation.address}</p>
                
                {/* Fixed Alignment: Flex + explicit heights */}
                <div className="flex gap-3 mt-4 items-center">
                  <Button
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white h-10"
                    onClick={() => handleGetDirections(selectedLocation)}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Directions
                  </Button>
                  
                  {selectedLocation.phone && (
                    <a 
                      href={`tel:${selectedLocation.phone}`}
                      // Directly using button styling on the anchor to ensure alignment
                      className={cn(buttonVariants({ variant: "outline", size: "icon" }), 
                        "h-10 w-10 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      )}
                    >
                       <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {!userLocation && (
                  <p className="text-[10px] text-amber-500/80 mt-2 text-center uppercase tracking-wide">
                    * Detect location for directions
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LiveMap;
// src/pages/LiveMap.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  MapPin,
  Navigation,
  Share2,
  AlertTriangle,
  Search,
  Bookmark,
  BookmarkCheck,
  Star,
  Phone,
  RefreshCw,
  Filter,
  X,
  Map,
  Loader2,
  Info,
  Heart,
} from "lucide-react";
import { MapLocation } from "@/types/map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockApi } from "@/services/mockApi";
import { cn } from "@/lib/utils";

/* --- Leaflet / react-leaflet imports and default icon fix --- */
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

// Fix default icon paths for Leaflet (Next.js / webpack environments)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

/* -------------------------
   Types
   ------------------------- */
type UserLocation = {
  lat: number;
  lng: number;
  address?: string;
  accuracy?: number;
  timestamp?: number;
} | null;

/* -------------------------
   Helper: Reverse geocode (Nominatim)
   ------------------------- */
async function getAddressFromCoords(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=16`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch address");
    }

    const data = await response.json();

    // Build address from most specific to least specific
    const addressParts: string[] = [];
    const { address } = data || {};

    if (address?.road) addressParts.push(address.road);
    if (address?.suburb) addressParts.push(address.suburb);
    if (address?.city_district) addressParts.push(address.city_district);
    if (address?.city) addressParts.push(address.city);
    if (address?.state) addressParts.push(address.state);
    if (address?.postcode) addressParts.push(address.postcode);
    if (address?.country) addressParts.push(address.country);

    return addressParts.length > 0
      ? addressParts.join(", ")
      : data.display_name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  } catch (error) {
    console.error("Error getting address:", error);
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
}

/* -------------------------
   MapLayers - Layers & Markers used inside MapContainer
   This component uses useMap() so it must be a child of MapContainer.
   ------------------------- */
const MapLayers: React.FC<{
  locations: MapLocation[];
  onLocationSelect: (loc: MapLocation) => void;
  userLocation: UserLocation;
  currentLocationAddress: string;
  selectedLocation: MapLocation | null;
  onCloseDetails: () => void;
}> = ({ locations, onLocationSelect, userLocation, currentLocationAddress }) => {
  const map = useMap();

  // Center on user location when it changes
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [userLocation, map]);

  // No direct centering on selected location here (that logic kept in parent if needed)

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* User marker with animated ping (divIcon) */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={L.divIcon({
            className: "user-location-marker",
            html: `  
              <div style="width:24px;height:24px;position:relative;transform:translate(-12px,-12px);">
                <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);">
                  <div style="position:absolute;left:-6px;top:-6px;width:16px;height:16px;border-radius:9999px;background:rgba(59,130,246,0.4);animation:leaflet-ping 1.5s infinite;"></div>
                  <div style="width:12px;height:12px;border-radius:9999px;background:#2563eb;border:2px solid white;"></div>
                </div>
              </div>
              <style>
                @keyframes leaflet-ping {
                  0% { transform: scale(0.6); opacity: 0.7; }
                  70% { transform: scale(1.8); opacity: 0.0; }
                  100% { transform: scale(1.8); opacity: 0; }
                }
              </style>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })}
        >
          <Popup>
            <div className="font-medium">Your Location</div>
            <div className="text-sm">{currentLocationAddress || userLocation.address || "Location detected"}</div>
            {userLocation.accuracy != null && (
              <div className="text-xs text-gray-600">Accuracy: ~{Math.round(userLocation.accuracy)} m</div>
            )}
          </Popup>
        </Marker>
      )}

      {/* Location markers */}
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          eventHandlers={{
            click: () => onLocationSelect(loc),
          }}
        >
          <Popup>
            <div className="font-medium">{loc.name}</div>
            <div className="text-sm text-gray-500">{loc.address}</div>
            {loc.phone && (
              <div className="mt-1">
                <a href={`tel:${loc.phone}`} className="text-blue-600 underline">
                  Call
                </a>
              </div>
            )}
          </Popup>
        </Marker>
      ))}
    </>
  );
};

/* -------------------------
   LiveMap Component
   ------------------------- */
const LiveMap: React.FC = () => {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation>(null);
  const [currentLocationAddress, setCurrentLocationAddress] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "ngo" | "shelter" | "hospital">("all");
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Load locations + saved locations
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        const data = await mockApi.getNGOs();
        const formatted: MapLocation[] = data.map((ngo: any, i: number) => {
          const lat = ngo.lat ? parseFloat(ngo.lat) : 28.6139 + (Math.random() * 0.2 - 0.1);
          const lng = ngo.lng ? parseFloat(ngo.lng) : 77.2090 + (Math.random() * 0.2 - 0.1);
          return {
            id: ngo.id?.toString() || `location-${i}`,
            lat,
            lng,
            position: [lat, lng],
            name: ngo.name || "Unnamed Location",
            type: (ngo.type || "ngo") as "ngo" | "shelter" | "hospital",
            address: ngo.address || "Address not available",
            phone: ngo.phone,
            website: ngo.website,
            services:
              ngo.services
                ? typeof ngo.services === "string"
                  ? ngo.services.split(",").map((s: string) => s.trim())
                  : ngo.services
                : [],
            rating: ngo.rating ? parseFloat(ngo.rating) : 4.0 + Math.random() * 1.5,
            hours: ngo.hours || "9 AM - 6 PM",
          } as MapLocation;
        });
        setLocations(formatted);
      } catch (err) {
        console.error("Error loading locations:", err);
        setError("Failed to load locations. Please try again later.");
        toast.error("Failed to load locations");
      } finally {
        setLoading(false);
      }
    };

    loadLocations();

    const saved = localStorage.getItem("pawrescue_saved_locations");
    if (saved) {
      try {
        setSavedLocations(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved locations:", e);
      }
    }
  }, []);

  // Get user's current location (with timestamp) - updated implementation requested
  const getUserLocation = useCallback(async (): Promise<UserLocation> => {
    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true, // Request highest accuracy
            timeout: 10000, // 10 second timeout
            maximumAge: 0, // Force fresh location
          }
        );
      });

      const { latitude: lat, longitude: lng, accuracy } = position.coords;

      // Create location object with coordinates
      const location = {
        lat,
        lng,
        accuracy,
        address: "Current Location",
        timestamp: Date.now(),
      };

      // Update state
      setUserLocation(location);

      // Get address in background (don't wait for it)
      getAddressFromCoords(lat, lng)
        .then(address => {
          setCurrentLocationAddress(address);
        })
        .catch(e => console.warn("Could not get address:", e));

      return location;
    } catch (error) {
      console.error("Error getting location:", error);
      toast.error("Could not get your location. Please try again.");
      return null;
    } finally {
      setIsLocating(false);
    }
  }, []);

  // Distance util (Haversine)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Filter & sort
  const filteredLocations = useMemo(() => {
    if (!locations.length) return [];
    const q = searchTerm.trim().toLowerCase();
    return locations.filter((location) => {
      const matchesType = filterType === "all" || location.type === filterType;
      if (!q) return matchesType;
      const nameMatch = location.name?.toLowerCase().includes(q);
      const addressMatch = (location.address || "").toLowerCase().includes(q);
      const servicesMatch = Array.isArray(location.services)
        ? location.services.some((s) => s.toLowerCase().includes(q))
        : String(location.services || "").toLowerCase().includes(q);
      return matchesType && (nameMatch || addressMatch || servicesMatch);
    });
  }, [locations, searchTerm, filterType]);

  const sortedLocations = useMemo(() => {
    if (!userLocation) return filteredLocations;
    return [...filteredLocations].sort((a, b) => {
      const da = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const db = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return da - db;
    });
  }, [filteredLocations, userLocation, calculateDistance]);

  // handlers
  const handleLocationSelect = useCallback((loc: MapLocation) => {
    setSelectedLocation(loc);
    if (window.innerWidth < 768 && mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  const handleShareLocation = useCallback((loc: MapLocation) => {
    const url = `https://www.google.com/maps?q=${loc.lat},${loc.lng}`;
    if (navigator.share) {
      navigator.share({ title: loc.name, text: loc.address, url }).catch((err) => {
        console.error("Share failed:", err);
        toast.error("Unable to share");
      });
    } else {
      navigator.clipboard.writeText(url).then(() => toast.success("Link copied to clipboard")).catch((err) => {
        console.error("Clipboard write failed:", err);
        toast.error("Unable to copy link");
      });
    }
  }, []);

  const toggleSaveLocation = useCallback((locationId: string) => {
    const isSaved = savedLocations.includes(locationId);
    const updated = isSaved ? savedLocations.filter((id) => id !== locationId) : [...savedLocations, locationId];
    setSavedLocations(updated);
    localStorage.setItem("pawrescue_saved_locations", JSON.stringify(updated));
    toast.success(isSaved ? "Location removed from saved" : "Location saved!");
  }, [savedLocations]);

  // Updated handleGetDirections: use 8 decimal precision and minimal params (daddr-style)
  const handleGetDirections = useCallback(async (destination: MapLocation) => {
    try {
      toast.info("Getting your current location...");
      const currentLocation = await getUserLocation();

      if (!currentLocation) {
        toast.error("Could not get your location. Please try again.");
        return;
      }

      // Format coordinates with high precision (8 decimal places)
      const formatCoord = (coord: number) => coord.toFixed(8);

      // Build URL using Google's preferred directions params
      const origin = `${formatCoord(currentLocation.lat)},${formatCoord(currentLocation.lng)}`;
      const dest = `${formatCoord(destination.lat)},${formatCoord(destination.lng)}`;

      const originAccuracy = Math.round(currentLocation.accuracy || 50);
      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving&dir_action=navigate&origin_accuracy=${originAccuracy}&_=${Date.now()}`;

      // Open in new tab
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.location.href = url;
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error getting directions:", error);
      toast.error("Failed to get directions. Please try again.");
    }
  }, [getUserLocation]);

  // initial user location on mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Loading & error UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading map data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we load the nearest locations</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load map</h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={() => getUserLocation()} disabled={isLocating}>
            {isLocating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Locating...
              </>
            ) : (
              <>
                <Navigation className="mr-2 h-4 w-4" />
                Use My Location
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  /* -------------------------
     Render main UI
     ------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Card className="overflow-hidden shadow-lg">
          <div className="p-6 pb-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Pet Rescue Map
                </h1>
                <p className="text-gray-600 mt-1">Find shelters, NGOs, and veterinary services near you</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* UPDATED button: Detect My Location */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const location = await getUserLocation();
                    if (location?.address) {
                      setCurrentLocationAddress(location.address);
                    }
                  }}
                  disabled={isLocating}
                  className="flex items-center gap-2"
                >
                  {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                  <span>Detect My Location</span>
                </Button>

                <Button
                  variant={isFilterOpen ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsFilterOpen((v) => !v)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </div>
            </div>

            {/* Show detected address below the button */}
            {currentLocationAddress && (
              <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded-md inline-flex items-center gap-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                <span>{currentLocationAddress}</span>
              </div>
            )}

            {/* Search & filter bar */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, address, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {isFilterOpen && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                  {["all", "shelter", "ngo", "hospital"].map((t) => (
                    <Button
                      key={t}
                      variant={filterType === (t as any) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType(t as any)}
                      className="capitalize"
                    >
                      {t === "all" ? "All" : t}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row h-[calc(100vh-250px)]">
            {/* Left list */}
            <div className="w-full md:w-1/3 border-r">
              <ScrollArea className="h-full">
                <div className="divide-y">
                  {sortedLocations.length > 0 ? (
                    sortedLocations.map((location) => (
                      <div
                        key={location.id}
                        onClick={() => handleLocationSelect(location)}
                        className={cn(
                          "p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                          selectedLocation?.id === location.id && "bg-blue-50"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{location.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{location.address}</p>
                            <div className="mt-2 flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {location.type}
                              </Badge>
                              {location.rating && (
                                <div className="flex items-center text-amber-500 text-xs">
                                  <Star className="h-3 w-3 fill-current mr-1" />
                                  {location.rating.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-2">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGetDirections(location);
                                }}
                                className="flex items-center"
                              >
                                <Navigation className="h-4 w-4 mr-2" />
                                Directions
                              </Button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShareLocation(location);
                                }}
                                className="p-2 rounded-md hover:bg-gray-100"
                                title="Share"
                              >
                                <Share2 className="h-4 w-4" />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSaveLocation(location.id);
                                }}
                                className="p-2 rounded-md hover:bg-gray-100"
                                title={savedLocations.includes(location.id) ? "Unsave" : "Save"}
                              >
                                {savedLocations.includes(location.id) ? (
                                  <BookmarkCheck className="h-5 w-5 text-blue-500 fill-current" />
                                ) : (
                                  <Bookmark className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">No locations found. Try adjusting your search.</div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Map area */}
            <div ref={mapContainerRef} className="w-full md:w-2/3 h-[400px] md:h-auto relative">
              <div className="absolute inset-0">
                <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }} zoomControl={false}>
                  <MapLayers
                    locations={sortedLocations}
                    onLocationSelect={handleLocationSelect}
                    userLocation={userLocation}
                    currentLocationAddress={currentLocationAddress}
                    selectedLocation={selectedLocation}
                    onCloseDetails={handleCloseDetails}
                  />
                </MapContainer>
              </div>

              {/* Center / locate button */}
              <Button onClick={() => getUserLocation()} variant="outline" size="icon" className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full shadow-md bg-white">
                <MapPin className="h-5 w-5" />
              </Button>

              {/* Selected location details card */}
              {selectedLocation && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md z-10">
                  <Card className="shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{selectedLocation.name}</CardTitle>
                          <p className="text-sm text-gray-500">{selectedLocation.address}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="default" size="sm" onClick={() => handleGetDirections(selectedLocation)} className="flex items-center">
                            <Navigation className="h-4 w-4 mr-2" />
                            Directions
                          </Button>
                          <Button variant="outline" size="icon" onClick={handleCloseDetails}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">Type</p>
                          <p className="capitalize">{selectedLocation.type}</p>
                        </div>

                        {selectedLocation.rating && (
                          <div>
                            <p className="font-medium text-gray-900">Rating</p>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 fill-current mr-1" />
                              <span>{selectedLocation.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        )}

                        {selectedLocation.hours && (
                          <div>
                            <p className="font-medium text-gray-900">Hours</p>
                            <p>{selectedLocation.hours}</p>
                          </div>
                        )}

                        {selectedLocation.website && (
                          <div>
                            <p className="font-medium text-gray-900">Website</p>
                            <a href={selectedLocation.website.startsWith("http") ? selectedLocation.website : `https://${selectedLocation.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>

                      {selectedLocation.services && selectedLocation.services.length > 0 && (
                        <div className="mt-4">
                          <p className="font-medium text-gray-900 mb-2">Services</p>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(selectedLocation.services) ? (
                              selectedLocation.services.map((service: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {service}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {selectedLocation.services}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LiveMap;

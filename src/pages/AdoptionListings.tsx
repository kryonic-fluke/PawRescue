// src/pages/AdoptionListings.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Heart, MapPin, Info, Bell, Building, DollarSign, Phone, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/mockApi";
import * as Collapsible from '@radix-ui/react-collapsible';

interface Animal {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: string;
  size?: string;
  location?: string;
  description?: string;
  image?: string;
  shelterId?: number;
  status?: string;
  gender?: string;
  contact?: string;
  vaccinated?: boolean;
  neutered?: boolean;
}

interface RawPet {
  id?: string | number;
  name?: string;
  type?: string;
  breed?: string;
  breedName?: string;
  age?: string;
  size?: string;
  location?: string;
  city?: string;
  description?: string;
  image?: string;
  photo?: string;
  shelterId?: number;
  status?: string;
  gender?: string;
  contact?: string;
  vaccinated?: boolean;
  neutered?: boolean;
}

const AdoptionListings: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    size: "all",
    location: "all"
  });
  const { addToFavorites, isFavorite } = useFavorites();
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // New: pets state + loading
  const [pets, setPets] = useState<Animal[]>([]);
  const [petsLoading, setPetsLoading] = useState<boolean>(true);
  const [petsError, setPetsError] = useState<string | null>(null);

  // New: expanded pet details control
  const [expandedPet, setExpandedPet] = useState<string | null>(null);
  const togglePetDetails = (petId: string) => {
    setExpandedPet(prev => (prev === petId ? null : petId));
  };

  useEffect(() => {
    const loadPets = async () => {
      setPetsLoading(true);
      setPetsError(null);
      try {
        // Attempt to load from mockApi; fallback to an empty list if not available
        const data = (await (mockApi.getPets ? mockApi.getPets() : Promise.resolve([]))) as RawPet[];
        // Normalize to our Animal type and string ids
        const formatted: Animal[] = (data || []).map((p: RawPet) => ({
          id: p.id?.toString() ?? String(Math.random()).slice(2),
          name: p.name || "Unnamed",
          type: p.type || "dog",
          breed: p.breed || p.breedName || "Mixed",
          age: p.age || "Unknown",
          size: p.size || "medium",
          location: p.location || p.city || "Unknown",
          description: p.description || "",
          image: p.image || p.photo || "/images/pets/placeholder-pet.jpg",
          shelterId: p.shelterId,
          status: p.status || "Available",
          gender: p.gender || "Unknown",
          contact: p.contact || "",
          vaccinated: !!p.vaccinated,
          neutered: !!p.neutered
        }));
        setPets(formatted);
      } catch (err) {
        console.error("Error loading pets:", err);
        setPetsError("Failed to load pets. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load pets.",
        });
      } finally {
        setPetsLoading(false);
      }
    };

    loadPets();
  }, []);

  const handleAdoptClick = (petId: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    navigate(`/adopt/${petId}`);
  };

  const handleSetAlerts = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Alerts Set Up",
      description: "You'll be notified when new pets matching your preferences are available.",
      variant: "default",
    });
  };

  const handleContactShelters = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/contact-shelters");
  };

  const handleDonateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/donate");
  };

  const handleFavoriteClick = (animal: Animal, e?: React.MouseEvent) => {
    e?.stopPropagation();
    addToFavorites({
      id: animal.id.toString(),
      name: animal.name,
      type: animal.type,
      breed: animal.breed || "",
      age: animal.age || "",
      location: animal.location || "",
      image: animal.image || ""
    });

    toast({
      title: isFavorite(animal.id.toString()) ? "Removed from favorites" : "Added to favorites",
      description: `${animal.name} has been ${isFavorite(animal.id.toString()) ? "removed from" : "added to"} your favorites.`,
    });
  };

  // Filtering logic
  const filteredPets = pets.filter((pet) => {
    if (filters.type !== "all" && pet.type !== filters.type) return false;
    if (filters.size !== "all" && pet.size !== filters.size) return false;
    if (filters.location !== "all" && pet.location?.toLowerCase() !== filters.location.toLowerCase()) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        pet.name?.toLowerCase().includes(q) ||
        pet.breed?.toLowerCase().includes(q) ||
        pet.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // PetFacts component with interactive statistics
  const PetFacts = () => {
    const [activeTab, setActiveTab] = useState('dogs');

    const petStats = {
      dogs: {
        title: 'Dogs in India',
        icon: <Heart className="h-6 w-6 text-rose-500" />,
        stats: [
          { value: '35M+', label: 'Stray Dogs' },
          { value: '20%', label: 'of urban strays are vaccinated' },
          { value: '1.5M+', label: 'dog bite cases annually' },
          { value: '70%', label: 'of rabies cases are from dog bites' }
        ],
        fact: 'India has the largest population of stray dogs in the world, with an estimated 35 million street dogs.'
      },
      cats: {
        title: 'Cats in India',
        icon: <MapPin className="h-6 w-6 text-amber-500" />,
        stats: [
          { value: '9.5M+', label: 'Stray Cats' },
          { value: '60%', label: 'live in urban areas' },
          { value: '1 in 3', label: 'Indian households feed street cats' },
          { value: '40%', label: 'higher adoption rate in last 5 years' }
        ],
        fact: 'Mumbai has one of the highest populations of street cats in India, with many local communities actively caring for them.'
      },
      wildlife: {
        title: 'Wildlife Rescue',
        icon: <Shield className="h-6 w-6 text-emerald-500" />,
        stats: [
          { value: '50K+', label: 'wildlife rescues annually' },
          { value: '200+', label: 'wildlife rescue centers' },
          { value: '60%', label: 'successful rehabilitation rate' },
          { value: '24/7', label: 'rescue helplines available' }
        ],
        fact: 'Wildlife SOS operates one of the largest rescue and rehabilitation programs for wildlife in India, including the famous ' +
          'sloth bear rescue and rehabilitation center.'
      }
    };

    const currentPet = petStats[activeTab as keyof typeof petStats];

    return (
      <div className="mt-12 bg-gradient-to-r from-rose-50 to-amber-50 p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-amber-500">
            Pet & Wildlife Insights
          </span>
        </h2>

        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(petStats).map(([key, { title, icon }]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === key
                  ? 'bg-rose-100 text-rose-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center space-x-2">
                {icon}
                <span>{title}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-2 p-6 bg-white/80 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Key Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {currentPet.stats.map((stat, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Did You Know?</h3>
            <div className="bg-gradient-to-br from-rose-50 to-amber-50 p-4 rounded-lg flex-1 flex items-center">
              <p className="text-gray-700 italic">"{currentPet.fact}"</p>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>Source: Animal Welfare Board of India & WHO</p>
            </div>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://en.wikipedia.org/wiki/Animal_shelter#In_India"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Info className="h-4 w-4" />
            Learn more about pet care and adoption in India
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Find Your Perfect Companion
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse through our loving animals waiting for their forever homes.
            </p>
          </div>

          <div className="bg-card rounded-lg p-4 md:p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or breed..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="md:hidden">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>

              <div className={`${showFilters ? 'block' : 'hidden'} md:block col-span-1 md:col-span-3`}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Animal Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="dog">Dogs</SelectItem>
                      <SelectItem value="cat">Cats</SelectItem>
                      <SelectItem value="bird">Birds</SelectItem>
                      <SelectItem value="rabbit">Rabbits</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.size}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, size: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sizes</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.location}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="gurgaon">Gurgaon</SelectItem>
                      <SelectItem value="noida">Noida</SelectItem>
                      <SelectItem value="faridabad">Faridabad</SelectItem>
                      <SelectItem value="ghaziabad">Ghaziabad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            {petsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-48 bg-gray-100" />
                    <CardHeader>
                      <CardTitle className="text-lg"><Skeleton className="h-6 w-40" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : petsError ? (
              <div className="text-center text-red-500">{petsError}</div>
            ) : filteredPets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No matching pets found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPets.map((pet) => (
                  <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img
                        src={pet.image || `/images/pets/placeholder-pet.jpg`}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          const target = e.currentTarget;
                          target.onerror = null; // Prevent infinite loop
                          target.src = '/images/pets/placeholder-pet.jpg';
                        }}
                      />
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{pet.name}</CardTitle>
                          <p className="text-sm text-gray-600">{pet.breed}</p>
                        </div>
                        <Badge variant={pet.status === 'Available' ? 'default' : 'secondary'}>
                          {pet.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div><span className="font-medium">Age:</span> {pet.age}</div>
                        <div><span className="font-medium">Gender:</span> {pet.gender}</div>
                        <div><span className="font-medium">Size:</span> {pet.size}</div>
                        <div><span className="font-medium">Location:</span> {pet.location}</div>
                      </div>

                      <Collapsible.Root
                        open={expandedPet === pet.id}
                        onOpenChange={() => togglePetDetails(pet.id)}
                        className="w-full"
                      >
                        <div className="flex gap-2 w-full">
                          <Collapsible.Trigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              {expandedPet === pet.id ? 'Hide Details' : 'View Details'}
                            </Button>
                          </Collapsible.Trigger>

                          <Button
                            variant={isFavorite(pet.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFavoriteClick(pet as Animal)}
                            title={isFavorite(pet.id) ? "Remove favorite" : "Add to favorites"}
                          >
                            <Heart className={`h-4 w-4 ${isFavorite(pet.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>

                        <Collapsible.Content className="CollapsibleContent">
                          <div className="mt-3 p-3 bg-gray-100 rounded-md text-sm">
                            <p className="mb-2 text-gray-800">{pet.description || 'No description available.'}</p>
                            <div className="space-y-1 text-gray-800">
                              <p><span className="font-medium">Contact:</span> <span className="text-gray-700">{pet.contact || 'N/A'}</span></p>
                              <p><span className="font-medium">Status:</span> <span className="text-gray-700">{pet.status || 'N/A'}</span></p>
                              <p><span className="font-medium">Vaccinated:</span> <span className="text-gray-700">{pet.vaccinated ? 'Yes' : 'No'}</span></p>
                              <p><span className="font-medium">Neutered/Spayed:</span> <span className="text-gray-700">{pet.neutered ? 'Yes' : 'No'}</span></p>
                            </div>
                            <Button
                              className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleAdoptClick(pet.id)}
                            >
                              Adopt Me
                            </Button>
                          </div>
                        </Collapsible.Content>
                      </Collapsible.Root>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <PetFacts />
        </div>
      </div>
    </div>
  );
};

export default AdoptionListings;

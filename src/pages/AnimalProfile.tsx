import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Shield, 
  Activity,
  MessageCircle,
  Phone,
  Mail,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data - in real app this would come from API
const mockAnimal = {
  id: "1",
  name: "Luna",
  type: "Dog",
  breed: "Golden Retriever Mix",
  age: "2 years",
  gender: "Female",
  size: "Large",
  weight: "28 kg",
  color: "Golden",
  location: "Mumbai, Maharashtra",
  shelter: {
    name: "Happy Tails Rescue",
    phone: "+91 98765 43210",
    email: "contact@happytails.org",
    address: "123 Animal Street, Bandra, Mumbai"
  },
  description: "Luna is a gentle, loving dog who gets along well with children and other pets. She was rescued from the streets when she was just a puppy and has been in our care for over a year. Luna is house-trained, knows basic commands, and absolutely loves playing fetch. She would do best in a home with a yard where she can run around and play.",
  photos: [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800",
    "https://images.unsplash.com/photo-1534351450181-ea9854250d18?w=800"
  ],
  medicalInfo: {
    vaccinated: true,
    spayed: true,
    microchipped: true,
    lastCheckup: "2024-01-10",
    conditions: [],
    medications: "None"
  },
  personality: {
    energy: "Medium",
    goodWith: ["children", "dogs", "cats"],
    training: ["House-trained", "Knows basic commands", "Leash trained"],
    temperament: ["Friendly", "Gentle", "Playful", "Loyal"]
  },
  requirements: {
    experience: "Beginner friendly",
    homeType: "House with yard preferred",
    timeCommitment: "2-3 hours daily",
    otherPets: "Compatible with other pets"
  },
  story: "Luna was found as a small puppy wandering the busy streets of Mumbai. She was scared, malnourished, and had a minor injury on her paw. Our rescue team took her in, and after months of care, love, and training, she has blossomed into the wonderful dog she is today. Luna has been waiting for her forever family for over 8 months now, and we know she will bring immense joy to the right home.",
  posted: "2 days ago",
  views: 127,
  favorites: 23
};

const AnimalProfile = () => {
  const { id } = useParams();
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // In real app, fetch animal data based on ID
  const animal = mockAnimal;

  const getEnergyColor = (energy: string) => {
    switch (energy.toLowerCase()) {
      case 'high': return 'bg-urgent text-urgent-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/adopt">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <Card className="card-warm overflow-hidden">
              <div className="relative">
                <img
                  src={animal.photos[selectedPhoto]}
                  alt={animal.name}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant={isFavorited ? "default" : "outline"}
                    className="bg-white/90 backdrop-blur-sm"
                    onClick={() => setIsFavorited(!isFavorited)}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {animal.photos.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {animal.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPhoto(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedPhoto === index ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img src={photo} alt={`${animal.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Animal Details Tabs */}
            <Tabs defaultValue="about" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="personality">Personality</TabsTrigger>
                <TabsTrigger value="story">Story</TabsTrigger>
              </TabsList>

              <TabsContent value="about">
                <Card className="card-warm">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">{animal.description}</p>
                    
                    <Separator />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold">Basic Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Breed:</span>
                            <span>{animal.breed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Age:</span>
                            <span>{animal.age}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Size:</span>
                            <span>{animal.size}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weight:</span>
                            <span>{animal.weight}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Color:</span>
                            <span>{animal.color}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold">Requirements</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Experience:</span>
                            <span>{animal.requirements.experience}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Home Type:</span>
                            <span>{animal.requirements.homeType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time Commitment:</span>
                            <span>{animal.requirements.timeCommitment}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Other Pets:</span>
                            <span>{animal.requirements.otherPets}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical">
                <Card className="card-warm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {animal.medicalInfo.vaccinated && (
                        <Badge className="bg-accent text-accent-foreground">
                          <Shield className="h-3 w-3 mr-1" />
                          Vaccinated
                        </Badge>
                      )}
                      {animal.medicalInfo.spayed && (
                        <Badge className="bg-secondary text-secondary-foreground">
                          Spayed/Neutered
                        </Badge>
                      )}
                      {animal.medicalInfo.microchipped && (
                        <Badge className="bg-primary text-primary-foreground">
                          Microchipped
                        </Badge>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold">Health Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Checkup:</span>
                            <span>{animal.medicalInfo.lastCheckup}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Medications:</span>
                            <span>{animal.medicalInfo.medications}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Conditions:</span>
                            <span>{animal.medicalInfo.conditions.length > 0 ? animal.medicalInfo.conditions.join(', ') : 'None'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="personality">
                <Card className="card-warm">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Energy Level</h4>
                      <Badge className={getEnergyColor(animal.personality.energy)}>
                        <Activity className="h-3 w-3 mr-1" />
                        {animal.personality.energy} Energy
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Temperament</h4>
                      <div className="flex flex-wrap gap-2">
                        {animal.personality.temperament.map((trait) => (
                          <Badge key={trait} variant="outline">{trait}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Gets Along With</h4>
                      <div className="flex flex-wrap gap-2">
                        {animal.personality.goodWith.map((category) => (
                          <Badge key={category} className="bg-accent text-accent-foreground">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Training</h4>
                      <ul className="space-y-2">
                        {animal.personality.training.map((skill) => (
                          <li key={skill} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="story">
                <Card className="card-warm">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground leading-relaxed">{animal.story}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="card-warm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{animal.name}</CardTitle>
                  <Badge variant="outline">{animal.gender}</Badge>
                </div>
                <p className="text-muted-foreground">{animal.breed} • {animal.age}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {animal.location}
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Button 
                    className="w-full btn-hope" 
                    size="lg"
                    onClick={() => alert('Adoption application form opened! (This would connect to a real form in production)')}
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Apply to Adopt
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => alert('Opening chat with shelter... (This would connect to real messaging in production)')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Ask Questions
                  </Button>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Posted {animal.posted}
                  </div>
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    {animal.views} views • {animal.favorites} favorites
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shelter Info */}
            <Card className="card-warm">
              <CardHeader>
                <CardTitle>Contact Shelter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground">{animal.shelter.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{animal.shelter.address}</p>
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    {animal.shelter.phone}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    {animal.shelter.email}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Adoption Process */}
            <Card className="card-warm">
              <CardHeader>
                <CardTitle>Adoption Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</div>
                    <div>
                      <p className="font-medium">Submit Application</p>
                      <p className="text-muted-foreground">Fill out our adoption form</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</div>
                    <div>
                      <p className="font-medium">Meet & Greet</p>
                      <p className="text-muted-foreground">Visit and spend time together</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</div>
                    <div>
                      <p className="font-medium">Home Check</p>
                      <p className="text-muted-foreground">Ensure safe environment</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">4</div>
                    <div>
                      <p className="font-medium">Adoption Day</p>
                      <p className="text-muted-foreground">Take your new friend home!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalProfile;
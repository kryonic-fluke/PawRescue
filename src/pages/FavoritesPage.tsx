import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Heart, 
  X, 
  Search, 
  Share2, 
  MessageSquare,
  BookOpen,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Star,
  Bookmark,
  Calendar,
  Home,
  PawPrint,
  Stethoscope,
  Utensils,
  MapPin,
  Users,
  Phone,
  Mail,
  HeartOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import type { FavoritePet } from "@/hooks/useFavorites";
import AIChatAdvisor from "./AIChatAdvisor";

// Interface for resource sections
interface ResourceSection {
  title: string;
  items: string[];
}

interface ResourceContent {
  sections: ResourceSection[];
}

interface Resource {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  actionText: string;
  actionLink: string;
  content: ResourceContent;
}

// Mock data for favorites
const mockFavoritePets = [
  {
    id: "1",
    name: "Bruno",
    type: "dog",
    breed: "Indian Pariah",
    age: "1.5 years",
    location: "Delhi",
    image: "https://images.unsplash.com/photo-1601758133732-5e0a1a0cda6a?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    addedDate: new Date().toISOString()
  },
  {
    id: "2",
    name: "Milo",
    type: "cat",
    breed: "Bombay Cat",
    age: "8 months",
    location: "Gurgaon",
    image: "https://images.unsplash.com/photo-1596854407944-bf87ed6e4a1e?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    addedDate: new Date().toISOString()
  },
  {
    id: "3",
    name: "Rex",
    type: "dog",
    breed: "Rajapalayam",
    age: "2 years",
    location: "Noida",
    image: "https://images.unsplash.com/photo-1605463286342-a10b845922d6?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    addedDate: new Date().toISOString()
  }
];

// Mock AI Chat Message Interface
interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// Mock AI Match Score
const calculateAIMatchScore = (pet: FavoritePet): number => {
  let score = 50; // Base score
  
  if (pet.type === 'dog') score += 10;
  if (pet.breed?.toLowerCase().includes('pariah')) score += 15;
  if (pet.age && parseInt(pet.age) < 2) score += 10;
  
  return Math.min(100, Math.max(0, score));
};

// Mock AI Chat Advisor
// const AIChatAdvisor = () => {
//   const [messages, setMessages] = useState<ChatMessage[]>([
//     {
//       id: '1',
//       sender: 'ai',
//       content: "Hello! I'm your pet adoption advisor. Ask me anything about these pets or compare them to help make your decision easier.",
//       timestamp: new Date()
//     }
//   ]);
//   const [input, setInput] = useState('');

//   const handleSend = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const userMessage: ChatMessage = {
//       id: Date.now().toString(),
//       sender: 'user',
//       content: input,
//       timestamp: new Date()
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInput('');

//     setTimeout(() => {
//       const responses = [
//         "That's a great question! Based on my analysis, I'd recommend considering the pet's energy level and how it matches your lifestyle.",
//         "I can help you compare the size, temperament, and care requirements of these pets. What would you like to know more about?",
//         "Many adopters find it helpful to consider their living situation and daily routine when choosing between these pets.",
//         "Both pets have their unique qualities. The right choice depends on what you're looking for in a companion.",
//         "I can see you're interested in these pets. Would you like me to highlight the key differences between them?"
//       ];
      
//       const aiMessage: ChatMessage = {
//         id: (Date.now() + 1).toString(),
//         sender: 'ai',
//         content: responses[Math.floor(Math.random() * responses.length)],
//         timestamp: new Date()
//       };

//       setMessages(prev => [...prev, aiMessage]);
//     }, 1000);
//   };

//   return (
//     <Card className="h-full flex flex-col">
//       <CardHeader className="border-b">
//         <CardTitle className="flex items-center gap-2">
//           <MessageSquare className="h-5 w-5 text-primary" />
//           AI Adoption Advisor
//         </CardTitle>
//       </CardHeader>
//       <ScrollArea className="flex-1 p-4">
//         <div className="space-y-4">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//             >
//               <div
//                 className={`max-w-[80%] rounded-lg px-4 py-2 ${
//                   message.sender === 'user'
//                     ? 'bg-primary text-primary-foreground'
//                     : 'bg-muted'
//                 }`}
//               >
//                 <p className="text-sm">{message.content}</p>
//                 <p className="text-xs opacity-70 mt-1 text-right">
//                   {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </ScrollArea>
//       <div className="border-t p-4">
//         <form onSubmit={handleSend} className="flex gap-2">
//           <Input
//             placeholder="Ask about these pets..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             className="flex-1"
//           />
//           <Button type="submit">Send</Button>
//         </form>
//       </div>
//     </Card>
//   );
// };

// Pet Comparison Component
const ComparePets = ({ pets, onClose }: { pets: FavoritePet[], onClose: () => void }) => {
  if (pets.length === 0) return null;

  const attributes = [
    { name: 'Breed', key: 'breed' },
    { name: 'Age', key: 'age' },
    { name: 'Location', key: 'location' },
    { name: 'Temperament', key: 'temperament' },
    { name: 'Energy Level', key: 'energy' },
    { name: 'Good with Kids', key: 'goodWithKids' },
    { name: 'Good with Pets', key: 'goodWithPets' },
    { name: 'Training Needs', key: 'training' },
    { name: 'Grooming Needs', key: 'grooming' }
  ];

  const mockPetData: Record<string, Record<string, string>> = {
    '1': {
      temperament: 'Friendly, Playful, Energetic',
      energy: 'High',
      goodWithKids: 'Yes',
      goodWithPets: 'Yes, with proper introduction',
      training: 'Moderate - Eager to please but needs consistency',
      grooming: 'Weekly brushing, seasonal shedding'
    },
    '2': {
      temperament: 'Gentle, Affectionate, Calm',
      energy: 'Low to Moderate',
      goodWithKids: 'Yes, older children',
      goodWithPets: 'Yes, especially with other cats',
      training: 'Low - Litter box trained, may learn basic commands',
      grooming: 'Weekly brushing, regular nail trimming'
    },
    '3': {
      temperament: 'Loyal, Intelligent, Active',
      energy: 'High',
      goodWithKids: 'Yes, with supervision',
      goodWithPets: 'Yes, with proper socialization',
      training: 'High - Very trainable, enjoys learning',
      grooming: 'Weekly brushing, regular baths'
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>Compare Pets</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          <div className="overflow-auto px-6 pt-4">
            <div className="min-w-max">
              <div className="sticky top-0 z-10 bg-background pb-4">
                <div className="grid" style={{ 
                  gridTemplateColumns: `200px repeat(${pets.length}, minmax(180px, 1fr))` 
                }}>
                  <div className="font-medium p-2">Attributes</div>
                  {pets.map((pet) => (
                    <div key={pet.id} className="flex flex-col items-center space-y-2 p-2">
                      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-white shadow-md">
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                          loading="lazy"
                        />
                      </div>
                      <h3 className="font-semibold text-center">{pet.name}</h3>
                      <Badge variant="outline" className="capitalize text-xs">
                        {pet.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {attributes.map((attr) => (
                  <div 
                    key={attr.key} 
                    className="grid items-center hover:bg-muted/50 rounded-lg"
                    style={{ 
                      gridTemplateColumns: `200px repeat(${pets.length}, minmax(180px, 1fr))` 
                    }}
                  >
                    <div className="p-3 font-medium text-sm">{attr.name}</div>
                    {pets.map((pet) => {
                      let value = mockPetData[pet.id]?.[attr.key] || 
                                (pet as any)[attr.key] || 
                                'N/A';

                      return (
                        <div key={`${pet.id}-${attr.key}`} className="p-3">
                          <div className="flex items-center gap-2">
                            {['goodWithKids', 'goodWithPets'].includes(attr.key) ? (
                              value.toString().toLowerCase() === 'yes' ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                              )
                            ) : null}
                            <span className="text-sm">{value}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <CardFooter className="border-t p-4 flex justify-end gap-2 bg-background">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            {pets.map((pet) => (
              <Button key={pet.id} asChild variant="default">
                <Link to={`/animal/${pet.id}`}>
                  {pet.name}'s Profile
                </Link>
              </Button>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

// Resource Card Component
const ResourceCard = ({ 
  title, 
  description, 
  icon: Icon, 
  actionText, 
  actionLink,
  content
}: { 
  title: string; 
  description: string; 
  icon: React.ComponentType<{ className?: string }>; 
  actionText: string; 
  actionLink: string;
  content: ResourceContent;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (actionLink === '#') {
      setIsExpanded(!isExpanded);
    } else {
      window.open(actionLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className={`h-full flex flex-col transition-all ${isExpanded ? 'border-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        
        {isExpanded && content?.sections && (
          <div className="space-y-4 mt-4 border-t pt-4">
            {content.sections.map((section, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-medium text-sm">{section.title}</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button 
          variant="link" 
          className="p-0 flex items-center gap-1"
          onClick={handleAction}
        >
          {isExpanded ? 'Show Less' : actionText}
          <ArrowRight className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </Button>
        
        {actionLink !== '#' && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto h-8 w-8"
            onClick={() => {
              navigator.clipboard.writeText(actionLink);
              toast({
                title: 'Link copied!',
                description: 'The resource link has been copied to your clipboard.',
              });
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Image error handler with fallbacks
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  // Try a fallback image first
  const fallbackImages = [
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&auto=format&fit=crop&q=80', // Dog
    'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&auto=format&fit=crop&q=80', // Cat
    'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=800&auto=format&fit=crop&q=80'  // Another dog
  ];
  
  // If this is the first error, try a fallback image
  if (!target.dataset.retry) {
    target.src = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    target.dataset.retry = 'true';
  } else {
    // If fallback also fails, use local placeholder
    target.src = '/placeholder-pet.png';
    target.onerror = null; // Prevent infinite loop
  }
};

const FavoritesPage = () => {
  const { favorites, removeFromFavorites } = useFavorites();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [activeTab, setActiveTab] = useState("favorites");
  const { toast } = useToast();

  // Use mock data if favorites is empty
  const displayFavorites = favorites.length > 0 ? favorites : mockFavoritePets;

  // Filter favorites based on search term
  const filteredFavorites = displayFavorites.filter((pet) =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    pet.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Resources data
  const resources: Resource[] = [
    {
      id: '1',
      title: 'Adoption Guide',
      description: 'Comprehensive guide to help you understand the pet adoption process and requirements.',
      icon: BookOpen,
      actionText: 'Read Guide',
      actionLink: '#',
      content: {
        sections: [
          {
            title: 'Adoption Process',
            items: [
              'Research and choose the right pet for your lifestyle',
              'Complete the adoption application',
              'Home visit and interview (if required)',
              'Meet and greet with the pet',
              'Finalize adoption paperwork',
              'Bring your new pet home!'
            ]
          },
          {
            title: 'Requirements',
            items: [
              'Valid government-issued ID',
              'Proof of address',
              'Proof of pet-friendly housing (if renting)',
              'Veterinary reference (sometimes required)'
            ]
          }
        ]
      }
    },
    {
      id: '2',
      title: 'Pet Care Essentials',
      description: 'Everything you need to know about daily care, grooming, and maintaining your pet\'s health.',
      icon: PawPrint,
      actionText: 'View Guide',
      actionLink: '#',
      content: {
        sections: [
          {
            title: 'Daily Care',
            items: [
              'Feeding schedule and portion control',
              'Fresh water availability',
              'Exercise requirements',
              'Grooming needs',
              'Dental care',
              'Litter box maintenance (for cats)'
            ]
          },
          {
            title: 'Health Check',
            items: [
              'Regular vet check-ups',
              'Vaccination schedule',
              'Parasite prevention',
              'Signs of illness to watch for'
            ]
          }
        ]
      }
    },
    {
      id: '3',
      title: 'Training Resources',
      description: 'Effective training techniques and resources to help your pet learn good behavior.',
      icon: CheckCircle,
      actionText: 'Start Training',
      actionLink: '#',
      content: {
        sections: [
          {
            title: 'Basic Commands',
            items: [
              'Sit, Stay, Come',
              'Leave it/Drop it',
              'Leash training',
              'House training',
              'Crate training'
            ]
          },
          {
            title: 'Training Tips',
            items: [
              'Use positive reinforcement',
              'Keep training sessions short',
              'Be consistent with commands',
              'Use high-value treats',
              'End on a positive note'
            ]
          }
        ]
      }
    },
    {
      id: '4',
      title: 'Pet-Proofing Your Home',
      description: 'Essential steps to create a safe and comfortable environment for your new pet.',
      icon: Home,
      actionText: 'Learn How',
      actionLink: '#',
      content: {
        sections: [
          {
            title: 'Indoor Safety',
            items: [
              'Secure electrical cords',
              'Remove toxic plants',
              'Keep small objects out of reach',
              'Secure trash cans',
              'Use baby gates if needed'
            ]
          },
          {
            title: 'Outdoor Safety',
            items: [
              'Secure fencing',
              'Remove toxic substances',
              'Provide shade and water',
              'Check for escape routes',
              'Supervise outdoor time'
            ]
          }
        ]
      }
    },
    {
      id: '5',
      title: 'Veterinary Care Guide',
      description: 'Comprehensive information about veterinary care, vaccinations, and health monitoring.',
      icon: Stethoscope,
      actionText: 'View Guide',
      actionLink: '#',
      content: {
        sections: [
          {
            title: 'Preventive Care',
            items: [
              'Vaccination schedule',
              'Flea and tick prevention',
              'Heartworm prevention',
              'Dental cleanings',
              'Annual check-ups'
            ]
          },
          {
            title: 'Emergency Signs',
            items: [
              'Difficulty breathing',
              'Loss of appetite',
              'Lethargy',
              'Vomiting/Diarrhea',
              'Difficulty urinating',
              'Seizures'
            ]
          }
        ]
      }
    },
    {
      id: '6',
      title: 'Pet Nutrition',
      description: 'Essential information about proper nutrition, feeding schedules, and dietary needs.',
      icon: Utensils,
      actionText: 'Read More',
      actionLink: '#',
      content: {
        sections: [
          {
            title: 'Nutrition Basics',
            items: [
              'Age-appropriate food',
              'Portion control',
              'Feeding schedule',
              'Healthy treats',
              'Foods to avoid'
            ]
          },
          {
            title: 'Special Diets',
            items: [
              'Weight management',
              'Food allergies',
              'Prescription diets',
              'Homemade food safety'
            ]
          }
        ]
      }
    }
  ];

  // Filter resources based on search term
  const filteredResources = activeTab === "resources" 
    ? resources.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) 
    : [];

  // Toggle pet selection for comparison
  const togglePetSelection = (petId: string) => {
    setSelectedForComparison(prev => {
      const newSet = new Set(prev);
      if (newSet.has(petId)) {
        newSet.delete(petId);
      } else {
        if (newSet.size < 3) {
          newSet.add(petId);
        } else {
          toast({
            title: "Maximum selection reached",
            description: "You can compare up to 3 pets at a time.",
            variant: "destructive",
          });
        }
      }
      return newSet;
    });
  };

  // Handle remove from favorites
  const handleRemoveFavorite = (petId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromFavorites(petId);
    setSelectedForComparison(prev => {
      const newSet = new Set(prev);
      newSet.delete(petId);
      return newSet;
    });
    
    toast({
      title: "Removed from favorites",
      description: "This pet has been removed from your favorites.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Your Favorites</h1>
        <p className="text-muted-foreground">
          {activeTab === "favorites" 
            ? "Manage your saved pets and compare your favorites"
            : "Helpful resources for new pet parents"}
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="favorites">My Favorites ({displayFavorites.length})</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          {activeTab === "favorites" && (
            <div className="w-full md:w-1/3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
          )}
        </div>

        <TabsContent value="favorites" className="space-y-6">
          {filteredFavorites.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedForComparison.size > 0 ? "default" : "outline"}
                  onClick={() => {
                    if (selectedForComparison.size > 0) {
                      setShowComparison(true);
                    } else {
                      toast({
                        title: "No pets selected",
                        description: "Please select at least one pet to compare.",
                      });
                    }
                  }}
                  disabled={selectedForComparison.size === 0}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compare ({selectedForComparison.size})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedForComparison.size > 0) {
                      setSelectedForComparison(new Set());
                      toast({
                        title: "Selection cleared",
                        description: "Your selection has been cleared.",
                      });
                    }
                  }}
                  disabled={selectedForComparison.size === 0}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((pet) => {
                  const matchScore = calculateAIMatchScore(pet);
                  
                  return (
                    <Card 
                      key={pet.id} 
                      className={`overflow-hidden transition-all ${
                        selectedForComparison.has(pet.id) ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => togglePetSelection(pet.id)}
                    >
                      <div className="relative aspect-video bg-muted">
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                          loading="lazy"
                        />
                        <Badge 
                          className="absolute top-2 left-2 capitalize"
                          variant={selectedForComparison.has(pet.id) ? "default" : "secondary"}
                        >
                          {pet.type}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(pet.id, e);
                          }}
                        >
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{pet.name}</h3>
                            <p className="text-sm text-muted-foreground">{pet.breed}</p>
                          </div>
                          <Checkbox
                            checked={selectedForComparison.has(pet.id)}
                            onCheckedChange={() => togglePetSelection(pet.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5 rounded-full"
                          />
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Match Score</span>
                            <span className="font-medium">
                              {matchScore}%
                            </span>
                          </div>
                          <Progress value={matchScore} className="h-2" />
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{pet.location}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link to={`/animal/${pet.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12 space-y-4">
              <HeartOff className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">No favorites yet</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "No pets match your search. Try a different term."
                  : "Save pets you're interested in by clicking the heart icon."}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link to="/adopt">Browse Pets</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{filteredResources.length} resources available</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  title={resource.title}
                  description={resource.description}
                  icon={resource.icon}
                  actionText={resource.actionText}
                  actionLink={resource.actionLink}
                  content={resource.content}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 space-y-4">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium">No resources found</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "No resources match your search. Try a different term."
                    : "No resources available at the moment."}
                </p>
              </div>
            )}
          </div>
          
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Need help with something specific? <a href="#" className="text-primary hover:underline">Contact our support team</a></p>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Chat Advisor - Only show when pets are selected */}
     <AIChatAdvisor
   selectedPets={displayFavorites.filter(pet => selectedForComparison.has(pet.id))} 
/>

      {/* Comparison Modal */}
      {showComparison && (
        <ComparePets 
          pets={displayFavorites.filter(pet => selectedForComparison.has(pet.id))} 
          onClose={() => setShowComparison(false)} 
        />
      )}
    </div>
  );
};

export default FavoritesPage;
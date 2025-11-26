import { useState, useEffect } from "react";
import { Search, Phone, Mail, MapPin, Globe, Clock, Building, Users, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Shelter {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  capacity: number;
  currentAnimals: number;
  services: string;
  operatingHours: string;
  website: string;
  createdAt: string;
}

const ShelterDirectory = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/animal-shelters?limit=100");
      if (response.ok) {
        const data = await response.json();
        setShelters(data);
      } else {
        toast.error("Failed to load shelters");
      }
    } catch (error) {
      console.error("Error fetching shelters:", error);
      toast.error("Error loading shelters");
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (shelter: Shelter) => {
    try {
      const response = await fetch("/api/email-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: shelter.email,
          subject: "New Inquiry from PawRescue",
          message: `Hello ${shelter.name},\n\nA user from PawRescue would like to connect with you regarding animal shelter services and adoption opportunities.\n\nPlease respond at your earliest convenience.\n\nBest regards,\nPawRescue Team`,
        }),
      });

      if (response.ok) {
        toast.success(`Notification sent to ${shelter.name}!`);
      } else {
        toast.error("Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Error sending notification");
    }
  };

  const filteredShelters = shelters.filter(
    (shelter) =>
      shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shelter.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shelter.services?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateOccupancy = (current: number, capacity: number) => {
    if (!capacity) return 0;
    return Math.round((current / capacity) * 100);
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <PawPrint className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Animal Shelter Directory</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Find animal shelters in New Delhi providing care, rehabilitation, and adoption services.
            Connect directly with shelters to adopt, volunteer, or support their mission.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Search and Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{shelters.length}</p>
              <p className="text-sm text-muted-foreground">Shelters Listed</p>
            </CardContent>
          </Card>
        </div>

        {/* Shelter Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredShelters.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-lg font-medium text-muted-foreground">No shelters found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShelters.map((shelter) => {
              const occupancy = calculateOccupancy(shelter.currentAnimals, shelter.capacity);
              return (
                <Card key={shelter.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Building className="h-8 w-8 text-primary" />
                      <Badge variant="secondary">{shelter.city}</Badge>
                    </div>
                    <CardTitle className="text-xl">{shelter.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Capacity Information */}
                    {shelter.capacity && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Capacity</span>
                          </div>
                          <span className={`text-sm font-bold ${getOccupancyColor(occupancy)}`}>
                            {occupancy}%
                          </span>
                        </div>
                        <Progress value={occupancy} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">
                          {shelter.currentAnimals} / {shelter.capacity} animals
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <a href={`tel:${shelter.phone}`} className="hover:underline">
                          {shelter.phone}
                        </a>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <a href={`mailto:${shelter.email}`} className="hover:underline break-all">
                          {shelter.email}
                        </a>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{shelter.address}</span>
                      </div>
                      {shelter.operatingHours && (
                        <div className="flex items-start gap-2 text-sm">
                          <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{shelter.operatingHours}</span>
                        </div>
                      )}
                      {shelter.website && (
                        <div className="flex items-start gap-2 text-sm">
                          <Globe className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <a
                            href={shelter.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-primary"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>

                    {shelter.services && (
                      <div>
                        <p className="text-sm font-medium mb-2">Services:</p>
                        <div className="flex flex-wrap gap-1">
                          {shelter.services.split(",").map((service, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {service.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => (window.location.href = `/messages?contact=${shelter.phone}`)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => sendNotification(shelter)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Notify
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <PawPrint className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Want to Help?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              These shelters need support through adoption, volunteering, and donations.
              Every contribution helps save lives!
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => (window.location.href = "/rehoming")}>
                Adopt a Pet
              </Button>
              <Button size="lg" variant="outline" onClick={() => (window.location.href = "/donate")}>
                Make a Donation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShelterDirectory;

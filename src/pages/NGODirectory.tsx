import { useState, useEffect } from "react";
import { Search, Phone, Mail, MapPin, Globe, Clock, Building, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReviewDialog from '@/components/ReviewDialog';
import { DonationDialog } from '@/components/DonationDialog';
import { toast } from "sonner";

interface NGO {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  description: string;
  services: string;
  operatingHours: string;
  website: string;
  createdAt: string;
}

const NGODirectory = () => {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ngos?limit=100");
      if (response.ok) {
        const data = await response.json();
        setNgos(data);
      } else {
        toast.error("Failed to load NGOs");
      }
    } catch (error) {
      console.error("Error fetching NGOs:", error);
      toast.error("Error loading NGOs");
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (ngo: NGO) => {
    try {
      const response = await fetch("/api/email-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: ngo.email,
          subject: "New Inquiry from PawRescue",
          message: `Hello ${ngo.name},\n\nA user from PawRescue would like to connect with you regarding animal rescue and welfare services.\n\nPlease respond at your earliest convenience.\n\nBest regards,\nPawRescue Team`,
        }),
      });

      if (response.ok) {
        toast.success(`Notification sent to ${ngo.name}!`);
      } else {
        toast.error("Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Error sending notification");
    }
  };

  const filteredNGOs = ngos.filter(
    (ngo) =>
      ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.services?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Building className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">NGO Directory</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Connect with trusted animal welfare NGOs in New Delhi. These organizations work tirelessly to rescue,
            rehabilitate, and rehome animals in need.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
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
              <p className="text-3xl font-bold text-primary">{ngos.length}</p>
              <p className="text-sm text-muted-foreground">NGOs Listed</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredNGOs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-lg font-medium text-muted-foreground">No NGOs found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNGOs.map((ngo) => (
              <Card key={ngo.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Heart className="h-8 w-8 text-primary" />
                    <Badge variant="secondary">{ngo.city}</Badge>
                  </div>
                  <CardTitle className="text-xl">{ngo.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">{ngo.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <a href={`tel:${ngo.phone}`} className="hover:underline">
                        {ngo.phone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <a href={`mailto:${ngo.email}`} className="hover:underline break-all">
                        {ngo.email}
                      </a>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{ngo.address}</span>
                    </div>
                    {ngo.operatingHours && (
                      <div className="flex items-start gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{ngo.operatingHours}</span>
                      </div>
                    )}
                    {ngo.website && (
                      <div className="flex items-start gap-2 text-sm">
                        <Globe className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <a
                          href={ngo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-primary"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  {ngo.services && (
                    <div>
                      <p className="text-sm font-medium mb-2">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {ngo.services.split(",").map((service, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {service.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>

                <div className="p-4 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => (window.location.href = `/messages?contact=${ngo.phone}`)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => sendNotification(ngo)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Notify
                    </Button>
                  </div>

                  <DonationDialog target={{ id: ngo.id.toString(), name: ngo.name }}>
                    <Button className="w-full" variant="default">
                      <Heart className="h-4 w-4 mr-2" />
                      Donate Now
                    </Button>
                  </DonationDialog>

                  <div className="w-full">
                    <ReviewDialog ngoId={ngo.id} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NGODirectory;
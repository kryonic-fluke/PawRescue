import { useState, useEffect, useRef } from "react";
import { Camera, MapPin, AlertTriangle, Phone, Mail, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ReportAnimal = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [ngos, setNgos] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<any>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  const initialFormState = {
    animalType: "",
    condition: "",
    location: "",
    city: "",
    latitude: null as number | null,
    longitude: null as number | null,
    description: "",
    contactName: session?.user?.name || "",
    contactPhone: session?.user?.phone || "",
    contactEmail: session?.user?.email || "",
    isEmergency: false,
    photos: [] as File[],
    selectedOrgId: "",
    selectedOrgType: "ngo",
    breed: "",
    color: ""
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch NGOs and Shelters
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoadingOrgs(true);
        
        // Fetch NGOs and Shelters in parallel
        const [ngosResponse, sheltersResponse] = await Promise.allSettled([
          fetch('/api/ngos'),
          fetch('/api/animal-shelters')
        ]);
        
        // Process NGOs response
        if (ngosResponse.status === 'fulfilled' && ngosResponse.value.ok) {
          const ngoData = await ngosResponse.value.json();
          setNgos(Array.isArray(ngoData) ? ngoData : []);
        } else {
          console.warn('Failed to fetch NGOs:', ngosResponse.status);
          setNgos([]);
        }
        
        // Process Shelters response
        if (sheltersResponse.status === 'fulfilled' && sheltersResponse.value.ok) {
          const shelterData = await sheltersResponse.value.json();
          setShelters(Array.isArray(shelterData) ? shelterData : []);
        } else {
          console.warn('Failed to fetch Shelters:', sheltersResponse.status);
          setShelters([]);
        }
        
      } catch (error) {
        console.error('Error fetching organizations:', error);
        toast.error('Failed to load organization data. Some features may be limited.', {
          position: 'top-center',
          duration: 5000
        });
      } finally {
        setLoadingOrgs(false);
      }
    };
    
    fetchOrganizations();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).slice(0, 5 - formData.photos.length);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...files]
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Reset any previous errors
    toast.dismiss();

    try {
      // Check all required fields
      const requiredFields = {
        animalType: 'Animal Type',
        condition: "Animal's Condition",
        location: 'Address or Landmark',
        city: 'City/Town',
        description: 'Description',
        contactName: 'Your Name',
        contactPhone: 'Phone Number',
        contactEmail: 'Email Address'
      };

      // Check for missing required fields
      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !formData[key as keyof typeof formData]?.toString().trim())
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        // Show toast with missing fields
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`, {
          duration: 5000,
          position: 'top-center'
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        toast.error('Please enter a valid email address', { position: 'top-center' });
        return;
      }

      // Map form data to API expected format
      const submissionData = {
        reporter_name: formData.contactName || 'Anonymous',
        reporter_email: formData.contactEmail || 'no-email@example.com',
        reporter_phone: formData.contactPhone || '',
        animal_type: formData.animalType,
        breed: formData.breed || '',
        color: formData.color || '',
        location: formData.location,
        city: formData.city || formData.location.split(',')[0] || 'Unknown',
        description: formData.description,
        urgency: formData.isEmergency ? 'high' : 'medium',
        has_injuries: formData.condition === 'injured',
        injuries_description: formData.condition === 'injured' ? formData.description : '',
        is_dangerous: formData.condition === 'abused',
        additional_info: formData.description,
        status: 'pending'
      };

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        // Handle validation errors from the server
        if (response.status === 400 && responseData.details) {
          const errorMessages = Object.entries(responseData.details)
            .filter(([_, value]) => value)
            .map(([_, value]) => value);
          
          if (errorMessages.length > 0) {
            throw new Error(errorMessages.join('\n'));
          }
        }
        
        throw new Error(responseData.error || 'Failed to submit report. Please try again.');
      }

      setSubmittedReport(responseData.report);
      setShowSuccess(true);
      
      // Show success message
      toast.success('Report submitted successfully!', {
        position: 'top-center',
        duration: 5000
      });
      
      // Reset form after successful submission
      setFormData({
        ...initialFormState,
        // Keep user contact info for convenience
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
      });
      
      // Show email dialog if organization was selected
      if (formData.selectedOrgId) {
        setShowEmailDialog(true);
      }
      
      // Reset form
      setFormData(initialFormState);

    } catch (error) {
      console.error('Error submitting report:', error);
      
      // Show error toast with the error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit report';
      toast.error(errorMessage, {
        position: 'top-center',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!formData.selectedOrgId) {
      toast.error("Please select an organization first");
      return;
    }

    setSendingEmail(true);

    try {
      const selectedOrg = formData.selectedOrgType === 'ngo' 
        ? ngos.find(org => org.id.toString() === formData.selectedOrgId)
        : shelters.find(org => org.id.toString() === formData.selectedOrgId);

      if (!selectedOrg) {
        throw new Error("Selected organization not found");
      }

      const emailData = {
        recipientEmail: selectedOrg.email || "",
        recipientPhone: selectedOrg.phone || "",
        recipientName: selectedOrg.name || "",
        report: {
          ...formData,
          photos: formData.photos.map(photo => URL.createObjectURL(photo))
        }
      };

      const response = await fetch('/api/email-notifications-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      toast.success(`Notification sent to ${selectedOrg.name}`);
      setShowEmailDialog(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-urgent/5 via-background to-secondary/5">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-500 mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold">Report an Animal in Need</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Help us help them. Report stray, injured, or abandoned animals and connect 
            them with our network of rescuers and NGOs.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Emergency Tips Sidebar */}
          <div className="lg:order-2 space-y-6">
            <Card className="border-2 border-orange-100">
              <CardContent className="p-4">
                <div className="relative h-[200px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <p className="text-lg font-bold text-white drop-shadow-lg">Every Report Saves Lives</p>
                    <p className="text-sm text-white/90 drop-shadow-md">Your compassion makes a difference</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-red-100">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Emergency Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  <li className="flex items-start text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    If the animal is severely injured, contact local emergency vets immediately
                  </li>
                  <li className="flex items-start text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    Do not approach aggressive or scared animals without proper training
                  </li>
                  <li className="flex items-start text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    Provide water if safe to do so, but avoid feeding unknown animals
                  </li>
                  <li className="flex items-start text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    Take photos from a safe distance to help rescuers prepare
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center text-red-600 font-medium mb-2">
                    <Phone className="h-4 w-4 mr-2" />
                    Emergency Hotline
                  </div>
                  <p className="text-2xl font-bold text-red-600">1962</p>
                  <p className="text-sm text-muted-foreground mt-1">24/7 Animal Helpline</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                  Animal Report Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Emergency Checkbox */}
                  <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-100">
                    <Checkbox 
                      id="isEmergency"
                      checked={formData.isEmergency}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEmergency: !!checked }))}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="isEmergency" className="text-red-600 font-medium flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        This is an emergency situation
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Check if the animal requires immediate medical attention
                      </p>
                    </div>
                  </div>

                  {/* Animal Type & Condition */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="animalType">Animal Type *</Label>
                      <Select 
                        value={formData.animalType} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, animalType: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select animal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">Dog</SelectItem>
                          <SelectItem value="cat">Cat</SelectItem>
                          <SelectItem value="bird">Bird</SelectItem>
                          <SelectItem value="cow">Cow</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="condition">Animal's Condition *</Label>
                      <Select 
                        value={formData.condition} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="injured">Injured</SelectItem>
                          <SelectItem value="sick">Sick</SelectItem>
                          <SelectItem value="abandoned">Abandoned</SelectItem>
                          <SelectItem value="abused">Abused</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Breed and Color */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="breed">Breed</Label>
                      <Input
                        id="breed"
                        name="breed"
                        value={formData.breed}
                        onChange={handleInputChange}
                        placeholder="e.g., Golden Retriever, Persian, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        placeholder="e.g., Brown, Black & White, etc."
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Location</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Address or Landmark *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Enter the location where the animal was seen"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="latitude">Latitude (Optional)</Label>
                          <Input
                            id="latitude"
                            name="latitude"
                            type="number"
                            step="0.000001"
                            value={formData.latitude || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              latitude: e.target.value ? parseFloat(e.target.value) : null 
                            }))}
                            placeholder="Optional"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longitude">Longitude (Optional)</Label>
                          <Input
                            id="longitude"
                            name="longitude"
                            type="number"
                            step="0.000001"
                            value={formData.longitude || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              longitude: e.target.value ? parseFloat(e.target.value) : null 
                            }))}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City/Town *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Enter city or town"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide details about the animal's condition, behavior, and any visible injuries"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Photos */}
                  <div>
                    <Label>Photos (Max 5)</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload clear photos of the animal (optional but helpful)
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-2">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      {formData.photos.length < 5 && (
                        <div 
                          className="border-2 border-dashed rounded-md flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-muted/50"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-center text-muted-foreground">
                            Add Photo ({5 - formData.photos.length} left)
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Your Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Your Name *</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone Number *</Label>
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          type="tel"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="contactEmail"
                            name="contactEmail"
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                            placeholder="your.email@example.com"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Organization Notification */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notifyOrg"
                        checked={!!formData.selectedOrgId}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            setFormData(prev => ({ ...prev, selectedOrgId: "" }));
                          } else if (ngos.length > 0) {
                            setFormData(prev => ({ 
                              ...prev, 
                              selectedOrgId: ngos[0].id.toString(),
                              selectedOrgType: "ngo"
                            }));
                          }
                        }}
                      />
                      <Label htmlFor="notifyOrg">Notify an organization about this report</Label>
                    </div>

                    {!!formData.selectedOrgId && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Organization Type</Label>
                          <Select
                            value={formData.selectedOrgType}
                            onValueChange={(value) => setFormData(prev => ({ 
                              ...prev, 
                              selectedOrgType: value,
                              selectedOrgId: "" // Reset org ID when type changes
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ngo">NGO</SelectItem>
                              <SelectItem value="shelter">Animal Shelter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Select Organization *</Label>
                          <Select
                            value={formData.selectedOrgId}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, selectedOrgId: value }))}
                            required={!!formData.selectedOrgId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select organization" />
                            </SelectTrigger>
                            <SelectContent>
                              {(formData.selectedOrgType === 'ngo' ? ngos : shelters).map((org) => (
                                <SelectItem key={org.id} value={org.id.toString()}>
                                  {org.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-center">Report Submitted Successfully!</DialogTitle>
              <p className="text-center text-muted-foreground mt-2">
                Thank you for reporting this animal in need. Your report has been received and will be reviewed.
              </p>
            </div>
          </DialogHeader>
          <div className="mt-4 flex justify-center gap-4">
            <Button onClick={() => setShowSuccess(false)} variant="outline">
              Close
            </Button>
            <Button onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Notification Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notify Organization</DialogTitle>
            <DialogDescription>
              Send a notification about this report to the selected organization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              A notification will be sent to the organization with the report details.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
              disabled={sendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sendingEmail}
            >
              {sendingEmail ? 'Sending...' : 'Send Notification'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
};

export default ReportAnimal;
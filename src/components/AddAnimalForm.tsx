import { useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface AddAnimalFormProps {
  onClose: () => void;
}

const AddAnimalForm = ({ onClose }: AddAnimalFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    gender: "",
    size: "",
    weight: "",
    color: "",
    description: "",
    medicalInfo: {
      vaccinated: false,
      spayed: false,
      microchipped: false,
      conditions: "",
      medications: ""
    },
    personality: [] as string[],
    goodWith: [] as string[],
    training: [] as string[],
    photos: [] as File[]
  });

  const personalityTraits = [
    "Friendly", "Gentle", "Playful", "Loyal", "Energetic", "Calm", "Protective", "Social"
  ];

  const goodWithOptions = [
    "Children", "Dogs", "Cats", "Other pets", "Seniors", "First-time owners"
  ];

  const trainingOptions = [
    "House-trained", "Leash trained", "Basic commands", "Crate trained", "Well-socialized"
  ];

  const handlePersonalityToggle = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(t => t !== trait)
        : [...prev.personality, trait]
    }));
  };

  const handleGoodWithToggle = (option: string) => {
    setFormData(prev => ({
      ...prev,
      goodWith: prev.goodWith.includes(option)
        ? prev.goodWith.filter(o => o !== option)
        : [...prev.goodWith, option]
    }));
  };

  const handleTrainingToggle = (option: string) => {
    setFormData(prev => ({
      ...prev,
      training: prev.training.includes(option)
        ? prev.training.filter(t => t !== option)
        : [...prev.training, option]
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Minimal insert into Supabase animals table
      const { data: sessionData } = await import("@/integrations/supabase/client").then(m => m.supabase.auth.getSession());
      const userId = sessionData.session?.user?.id;
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("animals").insert({
        name: formData.name,
        species: formData.type || 'dog',
        breed: formData.breed,
        age: formData.age,
        gender: formData.gender,
        size: formData.size,
        color: formData.color,
        description: formData.description,
        image_url: null,
        location: "Shelter",
        ngo_id: userId || null,
      });
      if (error) throw error;
      toast({ description: "Animal profile created successfully!" });
      onClose();
    } catch (err: any) {
      toast({ description: err.message || "Failed to add animal", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Animal</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(90vh-100px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Animal's name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select animal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="rabbit">Rabbit</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    placeholder="Breed or mix"
                    value={formData.breed}
                    onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    placeholder="e.g., 2 years"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Select value={formData.size} onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    placeholder="e.g., 15 kg"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="Primary color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Photos</h3>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload clear, high-quality photos of the animal
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  Choose Photos
                </Button>
              </div>
              
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the animal's personality, behavior, and any special needs..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
              />
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medical Information</h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.medicalInfo.vaccinated}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, vaccinated: checked as boolean }
                      }))
                    }
                  />
                  <span>Vaccinated</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.medicalInfo.spayed}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, spayed: checked as boolean }
                      }))
                    }
                  />
                  <span>Spayed/Neutered</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.medicalInfo.microchipped}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, microchipped: checked as boolean }
                      }))
                    }
                  />
                  <span>Microchipped</span>
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="conditions">Medical Conditions</Label>
                  <Textarea
                    id="conditions"
                    placeholder="Any known medical conditions..."
                    value={formData.medicalInfo.conditions}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, conditions: e.target.value }
                      }))
                    }
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    placeholder="Any current medications..."
                    value={formData.medicalInfo.medications}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo, medications: e.target.value }
                      }))
                    }
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Personality */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personality & Behavior</h3>
              
              <div>
                <Label className="text-base">Personality Traits</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {personalityTraits.map((trait) => (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => handlePersonalityToggle(trait)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.personality.includes(trait)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base">Good With</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {goodWithOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleGoodWithToggle(option)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.goodWith.includes(option)
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base">Training & Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {trainingOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleTrainingToggle(option)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.training.includes(option)
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="btn-hope">
                Add Animal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAnimalForm;
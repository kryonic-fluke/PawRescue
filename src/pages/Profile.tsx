// src/pages/Profile.tsx
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit,
  Save,
  Heart,
  Award,
  Calendar,
  Activity,
  Settings as SettingsIcon,
  LogOut,
  ImagePlus,
  User
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslationSafe } from "@/hooks/useTranslationSafe";

const Profile = () => {
  const { t, i18n } = useTranslationSafe();
  const navigate = useNavigate();
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [cameraPopoverOpen, setCameraPopoverOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // User profile state
  const [profile, setProfile] = useState({
    bio: "",
    location: "",
    phone: "",
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    adoptionAlerts: true,
    rescueUpdates: true,
    newsletter: false,
  });

  const mockStats = {
    animalsHelped: 23,
    adoptions: 2,
    donations: 8,
    reportsSubmitted: 15,
  };

  const badges = [
    { name: "Animal Advocate", icon: "🏆", color: "bg-primary", description: "Helped 20+ animals" },
    { name: "Rescue Hero", icon: "🦸", color: "bg-secondary", description: "Submitted 10+ rescue reports" },
    { name: "Adoption Champion", icon: "💝", color: "bg-accent", description: "Successfully adopted 2+ pets" },
  ];

  const adoptedPets = [
    {
      id: "1",
      name: "Luna",
      type: "Dog",
      breed: "Golden Retriever Mix",
      adoptedDate: "2023-08-15",
      photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    },
  ];

  const activityTimeline = [
    { date: "2024-01-15", action: "Reported injured dog", location: "Lodhi Garden", icon: "📍" },
    { date: "2024-01-10", action: "Donated to animal shelter", location: "Friendicoes SECA", icon: "💰" },
    { date: "2024-01-05", action: "Adopted a cat", location: "Sanjay Gandhi Animal Care Centre", icon: "🏠" },
  ];

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("pawrescue_profile");
    if (savedProfile) setProfile(JSON.parse(savedProfile));

    const savedPrefs = localStorage.getItem("pawrescue_preferences");
    if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
  }, []);

  // Save profile when it changes
  useEffect(() => {
    if (isEditing) return;
    localStorage.setItem("pawrescue_profile", JSON.stringify(profile));
  }, [profile, isEditing]);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem("pawrescue_preferences", JSON.stringify(preferences));
  }, [preferences]);

  const handleChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success(t('profile.updateSuccess', 'Profile updated successfully'));
  };

  const handleAvatarUpload = (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      // In a real app, you would upload the file to your server here
      // and then update the user's avatar URL
      setIsUploading(false);
      setAvatarDialogOpen(false);
      toast.success(t('profile.avatarUpdateSuccess', 'Profile picture updated!'));
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title', 'Profile')}</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
          <Card className="overflow-hidden">
            <div className="relative group">
              <div className="h-32 bg-gradient-to-r from-primary to-secondary"></div>
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || t('common.user', 'User')} />
                    <AvatarFallback>
                      <UserIcon className="h-12 w-12 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => setAvatarDialogOpen(true)}
                    className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors"
                    aria-label={t('profile.changeAvatar', 'Change profile picture')}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-16 pb-6 px-6 text-center">
              <h2 className="text-xl font-bold">{user?.fullName || t('common.user', 'User')}</h2>
              <p className="text-muted-foreground text-sm">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {profile.bio || t('profile.noBio', 'No bio provided')}
              </p>
              
              <div className="mt-4 flex justify-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {mockStats.animalsHelped} {t('profile.animalsHelped', 'helped')}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {mockStats.adoptions} {t('profile.adopted', 'adopted')}
                </Badge>
              </div>
              
              <Button 
                variant="outline" 
                className="mt-4 w-full" 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <Save className="h-4 w-4 mr-2" />
                ) : (
                  <Edit className="h-4 w-4 mr-2" />
                )}
                {isEditing ? t('common.save', 'Save Changes') : t('profile.editProfile', 'Edit Profile')}
              </Button>
            </div>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold flex items-center">
                <SettingsIcon className="h-4 w-4 mr-2" />
                {t('settings.title', 'Preferences')}
              </h3>
              <div className="space-y-4">
                {Object.entries(preferences).map(([key, value]) => {
                  const preferenceLabels = {
                    emailNotifications: t('settings.emailNotifications', 'Email Notifications'),
                    pushNotifications: t('settings.pushNotifications', 'Push Notifications'),
                    adoptionAlerts: t('settings.adoptionAlerts', 'Adoption Alerts'),
                    rescueUpdates: t('settings.rescueUpdates', 'Rescue Updates'),
                    newsletter: t('settings.newsletter', 'Newsletter')
                  };
                  
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="text-sm font-medium">
                        {preferenceLabels[key as keyof typeof preferenceLabels] || key}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, [key]: checked })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-2/3 lg:w-3/4 space-y-6">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="profile">{t('profile.tabs.profile', 'Profile')}</TabsTrigger>
                  <TabsTrigger value="activity">{t('profile.tabs.activity', 'Activity')}</TabsTrigger>
                  <TabsTrigger value="achievements">{t('profile.tabs.achievements', 'Badges')}</TabsTrigger>
                  <TabsTrigger value="pets">{t('profile.tabs.pets', 'Pets')}</TabsTrigger>
                  <TabsTrigger value="preferences">{t('profile.tabs.preferences', 'Settings')}</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">
                      {t('profile.personalInfo', 'Personal Information')}
                    </h3>
                    <Button
                      onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                      size="sm"
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4 mr-2" /> {t('common.save', 'Save')}
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" /> {t('profile.editProfile', 'Edit Profile')}
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> {t('profile.phone', 'Phone')}
                      </Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        disabled={!isEditing}
                        placeholder={t('profile.phonePlaceholder', 'Enter your phone number')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> {t('profile.location', 'Location')}
                      </Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        disabled={!isEditing}
                        placeholder={t('profile.locationPlaceholder', 'Enter your location')}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio" className="flex items-center gap-2">
                        <Edit className="h-4 w-4" /> {t('profile.bio', 'Bio')}
                      </Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        value={profile.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        disabled={!isEditing}
                        placeholder={t('profile.bioPlaceholder', 'Tell us about yourself...')}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">
                    {t('profile.recentActivity', 'Recent Activity')}
                  </h3>
                  {activityTimeline.map((activity, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">{activity.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {t(`profile.activity.${activity.action.toLowerCase().replace(/\s+/g, '')}`, activity.action)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t(`profile.locations.${activity.location.replace(/\s+/g, '')}`, activity.location)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {new Date(activity.date).toLocaleDateString(i18n.language, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements" className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">
                    {t('profile.badges', 'Badges & Achievements')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges.map((badge, index) => (
                      <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className={`h-12 w-12 rounded-full ${badge.color} flex items-center justify-center text-2xl`}>
                            {badge.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {t(`profile.badges.${badge.name.toLowerCase().replace(/\s+/g, '')}`, badge.name)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {t(`profile.badges.${badge.name.toLowerCase().replace(/\s+/g, '')}Desc`, badge.description)}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Pets Tab */}
                <TabsContent value="pets" className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">
                      {t('profile.myPets', 'My Adopted Pets')}
                    </h3>
                    <Button variant="outline" size="sm">
                      <ImagePlus className="h-4 w-4 mr-2" />
                      {t('profile.addPet', 'Add Pet')}
                    </Button>
                  </div>

                  {adoptedPets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {adoptedPets.map((pet) => (
                        <Card key={pet.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="h-40">
                            <img
                              src={pet.photo}
                              alt={pet.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-medium">{pet.name}</h4>
                            <p className="text-sm text-muted-foreground">{pet.breed}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {t('profile.adoptedOn', 'Adopted on')}{' '}
                              {new Date(pet.adoptedDate).toLocaleDateString(i18n.language, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <Button variant="outline" size="sm" className="mt-3 w-full">
                              {t('common.viewDetails', 'View Details')}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Heart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h4 className="font-medium">
                        {t('profile.noPetsYet', 'No adopted pets yet')}
                      </h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        {t('profile.adoptPetMessage', 'Adopt a pet and give them a forever home!')}
                      </p>
                      <Button className="mt-4">
                        {t('profile.browsePets', 'Browse Pets')}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">
                    {t('settings.title', 'Account Settings')}
                  </h3>
                  
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <h4 className="font-medium">
                          {t('settings.notifications', 'Notifications')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.manageNotifications', 'Manage your notification preferences')}
                        </p>
                        
                        <div className="mt-4 space-y-4">
                          {Object.entries(preferences).map(([key, value]) => {
                            const preferenceLabels = {
                              emailNotifications: t('settings.emailNotifications', 'Email Notifications'),
                              pushNotifications: t('settings.pushNotifications', 'Push Notifications'),
                              adoptionAlerts: t('settings.adoptionAlerts', 'Adoption Alerts'),
                              rescueUpdates: t('settings.rescueUpdates', 'Rescue Updates'),
                              newsletter: t('settings.newsletter', 'Newsletter')
                            };
                            
                            return (
                              <div key={key} className="flex items-center justify-between">
                                <Label htmlFor={key} className="text-sm font-medium">
                                  {preferenceLabels[key as keyof typeof preferenceLabels] || key}
                                </Label>
                                <Switch
                                  id={key}
                                  checked={value}
                                  onCheckedChange={(checked) =>
                                    setPreferences({ ...preferences, [key]: checked })
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="space-y-2">
                        <h4 className="font-medium text-destructive">
                          {t('settings.dangerZone', 'Danger Zone')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.dangerZoneDesc', 'These actions are irreversible')}
                        </p>
                        
                        <div className="mt-4 space-y-4">
                          <Button variant="destructive" className="w-full justify-start">
                            <LogOut className="h-4 w-4 mr-2" />
                            {t('settings.deleteAccount', 'Delete Account')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avatar Change Dialog */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('profile.changeProfilePicture', 'Change Profile Picture')}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || t('common.user', 'User')} />
                <AvatarFallback>
                  <UserIcon className="h-16 w-16 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                  />
                  {isUploading 
                    ? t('common.uploading', 'Uploading...') 
                    : t('profile.uploadPhoto', 'Upload Photo')}
                </Button>
                
                <Popover open={cameraPopoverOpen} onOpenChange={setCameraPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      {t('profile.takePhoto', 'Take Photo')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <div className="space-y-4">
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                          {t('profile.cameraPreview', 'Camera preview')}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        ref={cameraInputRef}
                        className="hidden" 
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(file);
                        }}
                      />
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => cameraInputRef.current?.click()}
                        >
                          {t('profile.takePhoto', 'Take Photo')}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setCameraPopoverOpen(false)}
                        >
                          {t('common.cancel', 'Cancel')}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button 
                variant="ghost" 
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  // In a real app, you would remove the avatar from the server
                  toast.success(t('profile.avatarRemoved', 'Profile picture removed'));
                  setAvatarDialogOpen(false);
                }}
              >
                {t('profile.removePhoto', 'Remove Photo')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
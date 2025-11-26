import { useState, useEffect } from "react";
import { User, Download, Upload, Palette, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

const Settings = () => {
  const { user } = useUser();
  const { t, i18n: i18nInstance } = useTranslation();
  const { theme: currentTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>("account");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // User data state
  const [userData, setUserData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    phone: user?.phoneNumbers?.[0]?.phoneNumber || "",
    profileImage: user?.imageUrl || ""
  });

  // Appearance state initialized with current theme and language
  const [appearance, setAppearance] = useState({
    theme: currentTheme || "system",
    language: i18nInstance.language || "en"
  });

  // Load saved appearance settings on mount
  useEffect(() => {
    const savedAppearance = localStorage.getItem("settings_appearance");
    if (savedAppearance) {
      try {
        const parsed = JSON.parse(savedAppearance);
        setAppearance(parsed);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.language) i18nInstance.changeLanguage(parsed.language);
      } catch (error) {
        console.error("Error parsing saved appearance:", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save appearance to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("settings_appearance", JSON.stringify(appearance));
    } catch (error) {
      console.error("Error saving appearance:", error);
    }
  }, [appearance]);

  // Handle theme change
  const handleThemeChange = (value: string) => {
    setAppearance(prev => ({ ...prev, theme: value }));
    setTheme(value);
    toast.success(`Theme set to ${value}`);
  };

  // Handle language change
  const handleLanguageChange = (value: string) => {
    setAppearance(prev => ({ ...prev, language: value }));
    i18nInstance.changeLanguage(value);

    const languageNames: { [key: string]: string } = {
      en: "English",
      es: "Español",
      fr: "Français",
      de: "Deutsch",
      hi: "हिंदी",
      ja: "日本語",
      zh: "中文"
    };

    toast.success(`Language set to ${languageNames[value] || value}`);
  };

  // Handle profile image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      setUserData(prev => ({ ...prev, profileImage: imageUrl }));
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // Export user data
  const handleExportData = () => {
    try {
      const data = {
        user: {
          name: `${userData.firstName} ${userData.lastName}`.trim(),
          email: userData.email,
          phone: userData.phone,
          accountCreated: user?.createdAt,
          lastLogin: user?.lastSignInAt
        },
        settings: { appearance },
        exportedAt: new Date().toISOString()
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `pawrescue-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  // Import user data
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.settings?.appearance) {
          const { appearance: importedAppearance } = data.settings;
          setAppearance(importedAppearance);
          if (importedAppearance.theme) setTheme(importedAppearance.theme);
          if (importedAppearance.language) i18nInstance.changeLanguage(importedAppearance.language);
          localStorage.setItem("settings_appearance", JSON.stringify(importedAppearance));
        }
        toast.success("Data imported successfully");
      } catch (error) {
        console.error("Error parsing imported file:", error);
        toast.error("Invalid data file");
      }
    };
    reader.readAsText(file);
  };

  // Save account information
  const handleAccountSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Account information updated successfully");
  };

  // Save appearance settings explicitly
  const handleAppearanceSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("settings_appearance", JSON.stringify(appearance));
      toast.success("Appearance settings saved");
    } catch (error) {
      console.error("Error saving appearance settings:", error);
      toast.error("Failed to save appearance settings");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" defaultValue="account">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="account"><User className="w-4 h-4 mr-2" />Account</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="w-4 h-4 mr-2" />Appearance</TabsTrigger>
          <TabsTrigger value="export"><Download className="w-4 h-4 mr-2" />Export Data</TabsTrigger>
          <TabsTrigger value="import"><Upload className="w-4 h-4 mr-2" />Import Data</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details and profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccountSave} className="space-y-6">
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-muted overflow-hidden">
                      {userData.profileImage ? (
                        <img src={userData.profileImage} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10">
                          <User className="h-12 w-12 text-primary" />
                        </div>
                      )}
                    </div>
                    <label htmlFor="profile-picture" className="absolute -bottom-2 -right-2 bg-background p-2 rounded-full border shadow-sm cursor-pointer hover:bg-accent" title="Change profile picture">
                      <Camera className="h-4 w-4" />
                      <input id="profile-picture" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">Click on the camera icon to change your profile picture</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" value={userData.firstName} onChange={e => setUserData({ ...userData, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" value={userData.lastName} onChange={e => setUserData({ ...userData, lastName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={userData.email} onChange={e => setUserData({ ...userData, email: e.target.value })} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={userData.phone} onChange={e => setUserData({ ...userData, phone: e.target.value })} placeholder="+1 (555) 123-4567" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isUploading}>{isUploading ? "Saving..." : "Save Changes"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAppearanceSave} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={appearance.theme} onValueChange={handleThemeChange}>
                      <SelectTrigger><SelectValue placeholder="Select theme" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={appearance.language} onValueChange={handleLanguageChange}>
                      <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="hi">हिंदी</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit">Save Appearance</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Your Data</CardTitle>
              <CardDescription>Download a copy of your personal data in JSON format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-start">
                  <Download className="h-5 w-5 text-primary mt-0.5" />
                  <div className="ml-3 flex-1">
                    <h3 className="font-medium">Download your data</h3>
                    <p className="text-sm text-muted-foreground">This will include your account information and preferences.</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={handleExportData} className="w-full md:w-auto">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>Restore your data from a previously exported file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-start">
                  <Upload className="h-5 w-5 text-primary mt-0.5" />
                  <div className="ml-3 flex-1">
                    <h3 className="font-medium">Import your data</h3>
                    <p className="text-sm text-muted-foreground">Upload a previously exported JSON file to restore your data.</p>
                  </div>
                </div>
                <div className="mt-4">
                  <input type="file" id="import-file" accept=".json" onChange={handleImportData} className="hidden" />
                  <label htmlFor="import-file" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                  <p className="mt-2 text-sm text-muted-foreground">Only JSON files exported from PawRescue are supported.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

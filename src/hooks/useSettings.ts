import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';

export interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    adoptionUpdates: boolean;
    rescueAlerts: boolean;
  };
  privacy: {
    profileVisibility: string;
    showEmail: boolean;
    showPhone: boolean;
  };
  appearance: {
    theme: string;
    language: string;
    timezone: string;
    emailFrequency: string;
  };
}

const defaultSettings: Settings = {
  notifications: {
    email: true,
    push: true,
    sms: false,
    adoptionUpdates: true,
    rescueAlerts: true,
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
  },
  appearance: {
    theme: 'system',
    language: 'en',
    timezone: 'Asia/Kolkata',
    emailFrequency: 'daily',
  },
};

export const useSettings = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = () => {
    const stored = localStorage.getItem(`settings_${user?.id}`);
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    setLoading(true);
    try {
      localStorage.setItem(`settings_${user?.id}`, JSON.stringify(newSettings));
      setSettings(newSettings);
      toast({ title: 'Settings saved successfully!' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { settings, saveSettings, loading };
};

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Storage buckets
export const STORAGE_BUCKETS = {
  ANIMAL_PHOTOS: 'animal-photos',
  REPORT_PHOTOS: 'report-photos',
  USER_AVATARS: 'user-avatars',
  ORGANIZATION_LOGOS: 'organization-logos'
};

// File upload helper
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return { data, publicUrl };
};

// Delete file helper
export const deleteFile = async (bucket: string, filePath: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
  return data;
};

// Subscribe to auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
  return data;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data;
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Upload user avatar
export const uploadUserAvatar = async (userId: string, file: File) => {
  // Delete old avatar if exists
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single();

  if (profile?.avatar_url) {
    const oldAvatarPath = profile.avatar_url.split('/').pop();
    if (oldAvatarPath) {
      await deleteFile(STORAGE_BUCKETS.USER_AVATARS, `public/${oldAvatarPath}`);
    }
  }

  // Upload new avatar
  const { publicUrl } = await uploadFile(
    STORAGE_BUCKETS.USER_AVATARS,
    'public',
    file
  );

  // Update user profile with new avatar URL
  const updatedProfile = await updateUserProfile(userId, {
    avatar_url: publicUrl
  });

  return updatedProfile;
};

// Report an animal
export const reportAnimal = async (reportData: any, photos: File[]) => {
  const { data: report, error: reportError } = await supabase
    .from('reports_animal')
    .insert({
      ...reportData,
      reporter_id: (await getCurrentUser())?.id
    })
    .select()
    .single();

  if (reportError) throw reportError;

  // Upload photos if any
  if (photos && photos.length > 0) {
    const photoUrls = await Promise.all(
      photos.map(async (photo) => {
        const { publicUrl } = await uploadFile(
          STORAGE_BUCKETS.REPORT_PHOTOS,
          report.id,
          photo
        );
        return { report_id: report.id, url: publicUrl };
      })
    );

    // Save photo references to database
    if (photoUrls.length > 0) {
      const { error: photoError } = await supabase
        .from('report_photos')
        .insert(photoUrls);

      if (photoError) throw photoError;
    }
  }

  return report;
};

// Get nearby organizations (shelters, NGOs, hospitals)
export const getNearbyOrganizations = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
  organizationType?: string
) => {
  const query = supabase
    .from('organizations')
    .select('*')
    .gte('is_verified', true);

  if (organizationType) {
    query.eq('organization_type', organizationType);
  }

  const { data: organizations, error } = await query;
  
  if (error) throw error;

  // Filter by distance
  return organizations.filter(org => {
    if (!org.latitude || !org.longitude) return false;
    
    const distance = calculateDistance(
      latitude,
      longitude,
      org.latitude,
      org.longitude
    );
    
    return distance <= radiusKm;
  });
};

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Get animals with filters
export const getAnimals = async (filters: any = {}) => {
  const {
    searchTerm = '',
    species = [],
    status = ['available'],
    organizationId,
    limit = 20,
    offset = 0
  } = filters;

  const { data, error } = await supabase
    .rpc('search_animals', {
      search_term: searchTerm,
      species_filter: species.length ? species : null,
      status_filter: status.length ? status : null,
      organization_id_filter: organizationId || null,
      limit_rows: limit,
      offset_rows: offset
    });

  if (error) throw error;
  return data;
};

// Create a donation intent
export const createDonationIntent = async (donationData: any) => {
  const { data, error } = await supabase
    .from('donations')
    .insert({
      ...donationData,
      donor_id: (await getCurrentUser())?.id,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update donation status
export const updateDonationStatus = async (donationId: string, status: string, paymentData: any = {}) => {
  const { data, error } = await supabase
    .from('donations')
    .update({
      status,
      ...(paymentData.payment_id && { payment_id: paymentData.payment_id }),
      ...(paymentData.receipt_url && { receipt_url: paymentData.receipt_url }),
      ...(paymentData.payment_method && { payment_method: paymentData.payment_method }),
      updated_at: new Date().toISOString()
    })
    .eq('id', donationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

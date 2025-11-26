-- Migration: Add tables for Find Pet page functionality
-- Created: 2025-11-20

-- Enable extensions if not already enabled
create extension if not exists "uuid-ossp" with schema extensions;

-- Create enum types for new tables
create type adoption_status as enum ('submitted', 'contacted', 'approved', 'rejected');
create type notification_type as enum ('email', 'push', 'both');

-- Add missing columns to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS other_contacts jsonb,
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS source_url text;

-- Add missing columns to animals table
ALTER TABLE public.animals
ADD COLUMN IF NOT EXISTS location_lat double precision,
ADD COLUMN IF NOT EXISTS location_lng double precision,
ADD COLUMN IF NOT EXISTS source_url text,
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS health_status text;

-- Create adoptions table
CREATE TABLE IF NOT EXISTS public.adoptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  pet_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  message text,
  status adoption_status DEFAULT 'submitted',
  submitted_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  org_notified boolean DEFAULT false,
  org_notification_sent_at timestamp with time zone,
  receipt_path text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create pet_alerts table for user subscriptions
CREATE TABLE IF NOT EXISTS public.pet_alerts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  device_token text,
  criteria jsonb NOT NULL, -- e.g., {"species": "dog", "city": "Delhi", "breed": "Indian Pariah"}
  notification_type notification_type DEFAULT 'email',
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create adoption_audit_log for tracking status changes
CREATE TABLE IF NOT EXISTS public.adoption_audit_log (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  adoption_id uuid NOT NULL REFERENCES public.adoptions(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_status adoption_status,
  new_status adoption_status NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_animals_status ON public.animals(status);
CREATE INDEX IF NOT EXISTS idx_animals_species_breed ON public.animals(species, breed);
CREATE INDEX IF NOT EXISTS idx_animals_location ON public.animals(city, district);
CREATE INDEX IF NOT EXISTS idx_adoptions_pet_id ON public.adoptions(pet_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_status ON public.adoptions(status);
CREATE INDEX IF NOT EXISTS idx_pet_alerts_user_id ON public.pet_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_alerts_criteria ON public.pet_alerts USING GIN (criteria);

-- Create trigger function for adoption status changes
CREATE OR REPLACE FUNCTION public.handle_adoption_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.adoption_audit_log (adoption_id, changed_by, previous_status, new_status, notes)
    VALUES (
      NEW.id,
      auth.uid(),
      OLD.status,
      NEW.status,
      'Status changed from ' || OLD.status || ' to ' || NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for adoption status changes
DROP TRIGGER IF EXISTS adoption_status_change_trigger ON public.adoptions;
CREATE TRIGGER adoption_status_change_trigger
AFTER UPDATE OF status ON public.adoptions
FOR EACH ROW
EXECUTE FUNCTION public.handle_adoption_status_change();

-- Create function to get nearby organizations
CREATE OR REPLACE FUNCTION public.get_nearby_organizations(
  lat double precision,
  lng double precision,
  radius_km integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  organization_type organization_type,
  address text,
  city text,
  district text,
  distance_km double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.organization_type,
    o.address,
    o.city,
    o.district,
    (6371 * acos(
      cos(radians(lat)) * 
      cos(radians(o.latitude)) * 
      cos(radians(o.longitude) - radians(lng)) + 
      sin(radians(lat)) * 
      sin(radians(o.latitude))
    )) AS distance_km
  FROM 
    public.organizations o
  WHERE 
    o.latitude IS NOT NULL 
    AND o.longitude IS NOT NULL
    AND (6371 * acos(
      cos(radians(lat)) * 
      cos(radians(o.latitude)) * 
      cos(radians(o.longitude) - radians(lng)) + 
      sin(radians(lat)) * 
      sin(radians(o.latitude))
    )) <= radius_km
  ORDER BY 
    distance_km;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to find matching pets for alerts
CREATE OR REPLACE FUNCTION public.find_matching_pets_for_alerts()
RETURNS TRIGGER AS $$
DECLARE
  alert_record RECORD;
  match_count integer;
BEGIN
  -- Only process if this is a new available pet
  IF TG_OP = 'INSERT' AND NEW.status = 'available' THEN
    -- Find all active alerts that match this pet's criteria
    FOR alert_record IN 
      SELECT * FROM public.pet_alerts 
      WHERE active = true
      AND (
        (criteria->>'species' IS NULL OR criteria->>'species' = NEW.species)
        AND (criteria->>'breed' IS NULL OR criteria->>'breed' = NEW.breed)
        AND (criteria->>'city' IS NULL OR criteria->>'city' = (SELECT city FROM public.organizations WHERE id = NEW.organization_id))
        AND (criteria->>'district' IS NULL OR criteria->>'district' = (SELECT district FROM public.organizations WHERE id = NEW.organization_id))
      )
    LOOP
      -- Here you would implement the actual notification logic
      -- For now, we'll just log the matches
      INSERT INTO public.adoption_audit_log (
        adoption_id, 
        changed_by, 
        new_status, 
        notes
      ) VALUES (
        NULL, -- No adoption_id for alert matches
        alert_record.user_id,
        'submitted', -- Using this field to indicate alert match
        format('Alert match for pet %s (ID: %s) - User: %s, Criteria: %s', 
               NEW.name, NEW.id, alert_record.user_email, alert_record.criteria::text)
      );
      
      -- In a real implementation, you would call a notification service here
      -- For example: PERFORM notify_user(alert_record.user_id, 'New pet matching your criteria', ...);
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new pet alerts
DROP TRIGGER IF EXISTS new_pet_alert_trigger ON public.animals;
CREATE TRIGGER new_pet_alert_trigger
AFTER INSERT OR UPDATE OF status ON public.animals
FOR EACH ROW
EXECUTE FUNCTION public.find_matching_pets_for_alerts();

-- Update RLS policies for new tables
ALTER TABLE public.adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoption_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for adoptions
CREATE POLICY "Users can view their own adoptions"
ON public.adoptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Organization admins can view their organization's adoptions"
ON public.adoptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organizations o
    JOIN public.animals a ON a.organization_id = o.id
    WHERE a.id = pet_id
    AND o.id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid() AND is_organization = true
    )
  )
);

CREATE POLICY "Users can create their own adoptions"
ON public.adoptions
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- RLS policies for pet_alerts
CREATE POLICY "Users can manage their own alerts"
ON public.pet_alerts
FOR ALL
USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE public.adoptions IS 'Tracks pet adoption applications';
COMMENT ON TABLE public.pet_alerts IS 'Stores user subscriptions for pet availability alerts';
COMMENT ON TABLE public.adoption_audit_log IS 'Audit log for tracking changes to adoption statuses';

-- Create a function to generate adoption receipt
CREATE OR REPLACE FUNCTION public.generate_adoption_receipt(adoption_id_param uuid)
RETURNS text AS $$
DECLARE
  receipt_text text;
  adoption_record RECORD;
  pet_record RECORD;
  org_record RECORD;
BEGIN
  SELECT * INTO adoption_record 
  FROM public.adoptions 
  WHERE id = adoption_id_param;
  
  SELECT a.*, o.name as org_name, o.primary_phone as org_phone, o.email as org_email
  INTO pet_record
  FROM public.animals a
  JOIN public.organizations o ON a.organization_id = o.id
  WHERE a.id = adoption_record.pet_id;
  
  receipt_text := format(
    'Adoption Application Receipt
--------------------------------
' ||
    'Application ID: %s
' ||
    'Submitted At: %s
' ||
    'Applicant: %s
' ||
    'Email: %s
' ||
    'Phone: %s
' ||
    'Pet: %s (%s, %s)
' ||
    'Organization: %s
' ||
    'Org Contact: %s, %s
' ||
    'Address: %s

' ||
    'Message:
%s

' ||
    'Current status: %s

' ||
    'Notes:
- Keep this receipt for your records.
- The organization will contact you regarding next steps.
- For any queries, please contact the organization directly.
',
    adoption_record.id,
    adoption_record.submitted_at,
    adoption_record.applicant_name,
    adoption_record.applicant_email,
    adoption_record.applicant_phone,
    COALESCE(pet_record.name, 'Unnamed'),
    pet_record.species,
    COALESCE(pet_record.breed, 'Mixed'),
    pet_record.org_name,
    COALESCE(pet_record.org_phone, 'Not provided'),
    COALESCE(pet_record.org_email, 'Not provided'),
    adoption_record.address || ', ' || adoption_record.city,
    COALESCE(adoption_record.message, 'No message provided'),
    adoption_record.status
  );
  
  RETURN receipt_text;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create a function to notify organization about new adoption
CREATE OR REPLACE FUNCTION public.notify_organization(adoption_id_param uuid)
RETURNS void AS $$
DECLARE
  adoption_record RECORD;
  pet_record RECORD;
  org_record RECORD;
  email_subject text;
  email_body text;
BEGIN
  -- Get adoption details
  SELECT * INTO adoption_record 
  FROM public.adoptions 
  WHERE id = adoption_id_param;
  
  -- Get pet and organization details
  SELECT a.*, o.name as org_name, o.primary_phone as org_phone, o.email as org_email
  INTO pet_record
  FROM public.animals a
  JOIN public.organizations o ON a.organization_id = o.id
  WHERE a.id = adoption_record.pet_id;
  
  -- Update adoption record
  UPDATE public.adoptions
  SET 
    org_notified = true,
    org_notification_sent_at = NOW(),
    updated_at = NOW()
  WHERE id = adoption_id_param;
  
  -- In a real implementation, you would send an email here
  -- For example:
  -- email_subject := format('New Adoption Application for %s', COALESCE(pet_record.name, 'Unnamed Pet'));
  -- email_body := format('A new adoption application has been received for %s...', ...);
  -- PERFORM send_email(pet_record.org_email, email_subject, email_body);
  
  -- For now, we'll just log the notification
  INSERT INTO public.adoption_audit_log (
    adoption_id, 
    changed_by, 
    new_status, 
    notes
  ) VALUES (
    adoption_id_param,
    NULL,
    adoption_record.status,
    format('Notification sent to organization for pet %s (ID: %s)', 
           COALESCE(pet_record.name, 'Unnamed'), pet_record.id)
  );
  
  -- Also update the pet status to 'pending' if it's still 'available'
  IF (SELECT status FROM public.animals WHERE id = pet_record.id) = 'available' THEN
    UPDATE public.animals 
    SET status = 'pending', updated_at = NOW()
    WHERE id = pet_record.id;
  END IF;
  
  RETURN;
EXCEPTION WHEN OTHERS THEN
  -- Log any errors
  INSERT INTO public.adoption_audit_log (
    adoption_id, 
    changed_by, 
    new_status, 
    notes
  ) VALUES (
    adoption_id_param,
    NULL,
    adoption_record.status,
    format('ERROR sending notification: %s', SQLERRM)
  );
  
  -- Re-raise the exception
  RAISE EXCEPTION 'Error notifying organization: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable UUID extension
create extension if not exists "uuid-ossp" with schema extensions;

-- Create enum types
create type animal_status as enum ('available', 'adopted', 'pending', 'reserved');
create type organization_type as enum ('shelter', 'ngo', 'hospital');
create type report_status as enum ('pending', 'in_progress', 'resolved', 'closed');
create type donation_status as enum ('pending', 'completed', 'failed', 'refunded');

-- Create organizations table (for shelters, NGOs, hospitals)
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null unique,
  phone text,
  address text,
  city text,
  state text,
  country text default 'India',
  pincode text,
  organization_type organization_type not null,
  description text,
  website text,
  logo_url text,
  latitude double precision,
  longitude double precision,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create animals table
create table public.animals (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade,
  name text,
  species text not null,
  breed text,
  age_years integer,
  age_months integer,
  gender text,
  size text,
  color text,
  description text,
  status animal_status default 'available',
  is_vaccinated boolean default false,
  is_neutered boolean default false,
  is_house_trained boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create animal_photos table
create table public.animal_photos (
  id uuid default uuid_generate_v4() primary key,
  animal_id uuid references public.animals(id) on delete cascade,
  url text not null,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reports table
create table public.reports_animal (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  animal_type text not null,
  condition text,
  description text,
  location_name text,
  latitude double precision,
  longitude double precision,
  status report_status default 'pending',
  is_emergency boolean default false,
  contact_name text,
  contact_phone text,
  contact_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create report_photos table
create table public.report_photos (
  id uuid default uuid_generate_v4() primary key,
  report_id uuid references public.reports_animal(id) on delete cascade,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create donations table
create table public.donations (
  id uuid default uuid_generate_v4() primary key,
  donor_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  amount decimal(10, 2) not null,
  currency text default 'INR',
  payment_id text,
  payment_method text,
  status donation_status default 'pending',
  receipt_url text,
  message text,
  is_anonymous boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_profiles table (extending auth.users)
create table public.user_profiles (
  id uuid references auth.users(id) primary key,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  address text,
  city text,
  state text,
  pincode text,
  is_organization boolean default false,
  organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.organizations enable row level security;
alter table public.animals enable row level security;
alter table public.animal_photos enable row level security;
alter table public.reports_animal enable row level security;
alter table public.report_photos enable row level security;
alter table public.donations enable row level security;
alter table public.user_profiles enable row level security;

-- Create storage buckets
insert into storage.buckets (id, name, public)
values ('animal_photos', 'animal-photos', true),
       ('report_photos', 'report-photos', true),
       ('user_avatars', 'user-avatars', true),
       ('organization_logos', 'organization-logos', true);

-- Create triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_organizations_updated_at
  before update on public.organizations
  for each row execute procedure public.handle_updated_at();

create trigger handle_animals_updated_at
  before update on public.animals
  for each row execute procedure public.handle_updated_at();

create trigger handle_reports_updated_at
  before update on public.reports_animal
  for each row execute procedure public.handle_updated_at();

create trigger handle_donations_updated_at
  before update on public.donations
  for each row execute procedure public.handle_updated_at();

create trigger handle_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create RLS policies for organizations
create policy "Enable read access for all users"
on public.organizations for select
using (true);

create policy "Enable insert for authenticated users"
on public.organizations for insert
with check (auth.role() = 'authenticated');

create policy "Enable update for organization admins"
on public.organizations for update
using (auth.uid() in (
  select user_id from auth.identities 
  where identity_data->>'email' = email
));

-- Similar policies for other tables...
-- (I'll continue with more RLS policies in the next step)

-- Create indexes for better performance
create index idx_animals_organization_id on public.animals(organization_id);
create index idx_animal_photos_animal_id on public.animal_photos(animal_id);
create index idx_reports_organization_id on public.reports_animal(organization_id);
create index idx_reports_reporter_id on public.reports_animal(reporter_id);
create index idx_donations_organization_id on public.donations(organization_id);
create index idx_donations_donor_id on public.donations(donor_id);

-- Add comments to tables and columns
comment on table public.organizations is 'Stores information about animal shelters, NGOs, and hospitals';
comment on table public.animals is 'Stores information about animals available for adoption';
comment on table public.animal_photos is 'Stores photos of animals';
comment on table public.reports_animal is 'Stores reports of animals in need';
comment on table public.report_photos is 'Stores photos related to animal reports';
comment on table public.donations is 'Stores donation information';
comment on table public.user_profiles is 'Stores additional user profile information';

-- Create a function to search animals
create or replace function public.search_animals(
  search_term text,
  species_filter text[] default null,
  status_filter animal_status[] default null,
  organization_id_filter uuid default null,
  limit_rows int default 20,
  offset_rows int default 0
)
returns table (
  id uuid,
  name text,
  species text,
  breed text,
  age_years integer,
  age_months integer,
  gender text,
  status animal_status,
  organization_name text,
  primary_photo_url text,
  match_count bigint
)
language sql
as $$
  with search_results as (
    select 
      a.*,
      o.name as organization_name,
      ap.url as primary_photo_url,
      count(*) over () as match_count,
      to_tsvector('english', 
        coalesce(a.name, '') || ' ' || 
        coalesce(a.species, '') || ' ' || 
        coalesce(a.breed, '') || ' ' || 
        coalesce(a.description, '')
      ) as document
    from public.animals a
    left join public.organizations o on a.organization_id = o.id
    left join (
      select animal_id, url 
      from public.animal_photos 
      where is_primary = true
    ) ap on a.id = ap.animal_id
    where 
      (search_term is null or search_term = '' or 
       to_tsvector('english', 
         coalesce(a.name, '') || ' ' || 
         coalesce(a.species, '') || ' ' || 
         coalesce(a.breed, '') || ' ' || 
         coalesce(a.description, '')
       ) @@ websearch_to_tsquery('english', search_term))
      and (species_filter is null or a.species = any(species_filter))
      and (status_filter is null or a.status = any(status_filter))
      and (organization_id_filter is null or a.organization_id = organization_id_filter)
  )
  select 
    id, name, species, breed, age_years, age_months, gender, 
    status, organization_name, primary_photo_url, match_count
  from search_results
  order by ts_rank(document, websearch_to_tsquery('english', coalesce(search_term, ''))) desc
  limit limit_rows
  offset offset_rows;
$$;

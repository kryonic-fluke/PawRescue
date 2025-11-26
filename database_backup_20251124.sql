--
-- PostgreSQL database dump
--

\restrict evVyKJ2tDNwkw6m0PAObxYC0S1UPCZ4b0baMSrEzX5Fwrxfjd8uGewGBsN8nL1G

-- Dumped from database version 17.5 (aa1f746)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_session_jwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_session_jwt WITH SCHEMA public;


--
-- Name: EXTENSION pg_session_jwt; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_session_jwt IS 'pg_session_jwt: manage authentication sessions using JWTs';


--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO neondb_owner;

--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA neon_auth;


ALTER SCHEMA neon_auth OWNER TO neondb_owner;

--
-- Name: pgrst; Type: SCHEMA; Schema: -; Owner: neon_service
--

CREATE SCHEMA pgrst;


ALTER SCHEMA pgrst OWNER TO neon_service;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: adoption_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.adoption_status AS ENUM (
    'available',
    'pending',
    'adopted'
);


ALTER TYPE public.adoption_status OWNER TO neondb_owner;

--
-- Name: message_direction; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.message_direction AS ENUM (
    'incoming',
    'outgoing'
);


ALTER TYPE public.message_direction OWNER TO neondb_owner;

--
-- Name: notification_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.notification_status AS ENUM (
    'pending',
    'sent',
    'failed',
    'delivered'
);


ALTER TYPE public.notification_status OWNER TO neondb_owner;

--
-- Name: pre_config(); Type: FUNCTION; Schema: pgrst; Owner: neon_service
--

CREATE FUNCTION pgrst.pre_config() RETURNS void
    LANGUAGE sql
    AS $$
  SELECT
      set_config('pgrst.db_schemas', 'public', true)
    , set_config('pgrst.db_aggregates_enabled', 'true', true)
    , set_config('pgrst.db_anon_role', 'anonymous', true)
    , set_config('pgrst.jwt_role_claim_key', '.role', true)
$$;


ALTER FUNCTION pgrst.pre_config() OWNER TO neon_service;

--
-- Name: update_modified_column(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION public.update_modified_column() OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: neondb_owner
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: neondb_owner
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: neondb_owner
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: users_sync; Type: TABLE; Schema: neon_auth; Owner: neondb_owner
--

CREATE TABLE neon_auth.users_sync (
    raw_json jsonb NOT NULL,
    id text GENERATED ALWAYS AS ((raw_json ->> 'id'::text)) STORED NOT NULL,
    name text GENERATED ALWAYS AS ((raw_json ->> 'display_name'::text)) STORED,
    email text GENERATED ALWAYS AS ((raw_json ->> 'primary_email'::text)) STORED,
    created_at timestamp with time zone GENERATED ALWAYS AS (to_timestamp((trunc((((raw_json ->> 'signed_up_at_millis'::text))::bigint)::double precision) / (1000)::double precision))) STORED,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE neon_auth.users_sync OWNER TO neondb_owner;

--
-- Name: adoption_applications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.adoption_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id integer NOT NULL,
    pet_id uuid NOT NULL,
    status public.adoption_status DEFAULT 'pending'::public.adoption_status NOT NULL,
    application_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    notes text
);


ALTER TABLE public.adoption_applications OWNER TO neondb_owner;

--
-- Name: TABLE adoption_applications; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON TABLE public.adoption_applications IS 'Tracks pet adoption applications from users';


--
-- Name: COLUMN adoption_applications.status; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.adoption_applications.status IS 'Current status of the application (pending/approved/rejected)';


--
-- Name: app_users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.app_users (
    id integer NOT NULL,
    name text,
    email text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    role text DEFAULT 'user'::text
);


ALTER TABLE public.app_users OWNER TO neondb_owner;

--
-- Name: app_users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.app_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.app_users_id_seq OWNER TO neondb_owner;

--
-- Name: app_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.app_users_id_seq OWNED BY public.app_users.id;


--
-- Name: email_notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id integer NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    status public.notification_status DEFAULT 'pending'::public.notification_status NOT NULL,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_notifications OWNER TO neondb_owner;

--
-- Name: TABLE email_notifications; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON TABLE public.email_notifications IS 'Stores email notifications sent to users';


--
-- Name: COLUMN email_notifications.status; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.email_notifications.status IS 'Current status of the email notification (pending/sent/failed/delivered)';


--
-- Name: ngos; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ngos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    website text,
    email text,
    phone text,
    address text,
    city text,
    verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ngos OWNER TO neondb_owner;

--
-- Name: TABLE ngos; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON TABLE public.ngos IS 'Stores information about non-governmental organizations';


--
-- Name: COLUMN ngos.verified; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.ngos.verified IS 'Whether the NGO has been verified by the admin';


--
-- Name: pets; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text,
    breed text,
    age integer,
    gender text,
    size text,
    description text,
    status text,
    image_url text,
    medical_history jsonb,
    vaccinated boolean,
    neutered boolean,
    adoption_fee integer,
    shelter_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    images text[],
    species text
);


ALTER TABLE public.pets OWNER TO neondb_owner;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reporter_name text NOT NULL,
    reporter_email text NOT NULL,
    reporter_phone text,
    animal_type text NOT NULL,
    breed text,
    color text,
    location text NOT NULL,
    city text NOT NULL,
    description text NOT NULL,
    urgency text NOT NULL,
    has_injuries boolean DEFAULT false,
    injuries_description text,
    is_dangerous boolean DEFAULT false,
    additional_info text,
    images jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.reports OWNER TO neondb_owner;

--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    id text NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    user_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: shelters; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shelters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text,
    type text,
    address text,
    city text,
    phone text,
    email text,
    website text,
    description text,
    verified boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    images text[]
);


ALTER TABLE public.shelters OWNER TO neondb_owner;

--
-- Name: team_members; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id integer NOT NULL,
    role text NOT NULL,
    joined_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true
);


ALTER TABLE public.team_members OWNER TO neondb_owner;

--
-- Name: TABLE team_members; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON TABLE public.team_members IS 'Stores team member information and their roles';


--
-- Name: COLUMN team_members.is_active; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.team_members.is_active IS 'Whether the team member is currently active';


--
-- Name: whatsapp_messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.whatsapp_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id integer NOT NULL,
    message text NOT NULL,
    direction text NOT NULL,
    status text DEFAULT 'sent'::text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.whatsapp_messages OWNER TO neondb_owner;

--
-- Name: TABLE whatsapp_messages; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON TABLE public.whatsapp_messages IS 'Stores WhatsApp messages sent/received';


--
-- Name: COLUMN whatsapp_messages.direction; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.whatsapp_messages.direction IS 'Direction of the message (incoming/outgoing)';


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: app_users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.app_users ALTER COLUMN id SET DEFAULT nextval('public.app_users_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: neondb_owner
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: users_sync; Type: TABLE DATA; Schema: neon_auth; Owner: neondb_owner
--

COPY neon_auth.users_sync (raw_json, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: adoption_applications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.adoption_applications (id, user_id, pet_id, status, application_date, updated_at, notes) FROM stdin;
\.


--
-- Data for Name: app_users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.app_users (id, name, email, password_hash, created_at, updated_at, role) FROM stdin;
\.


--
-- Data for Name: email_notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_notifications (id, user_id, subject, body, status, sent_at, created_at) FROM stdin;
\.


--
-- Data for Name: ngos; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ngos (id, name, description, website, email, phone, address, city, verified, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pets; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pets (id, name, type, breed, age, gender, size, description, status, image_url, medical_history, vaccinated, neutered, adoption_fee, shelter_id, created_at, updated_at, images, species) FROM stdin;
ee176ee3-9204-43f1-b840-104e0a398b15	Buddy	Dog	Golden Retriever	3	Male	Large	Friendly and playful	Available	https://example.com/buddy.jpg	{"notes": "Healthy", "vaccinations": ["rabies", "distemper"]}	t	t	200	67283bbc-012f-4f61-8bd9-b150071034bf	2025-11-22 14:48:42.717866+00	2025-11-22 14:48:42.717866+00	\N	\N
c50756e2-60d1-4cd4-8455-c0d01ca979d4	Max	Dog	Labrador	2	Male	Large	Friendly and energetic	Available	https://example.com/max.jpg	{"notes": "Up to date on all shots", "allergies": ["none"]}	t	t	250	61c5bdd4-dc8a-4db4-a3c4-64911368717e	2025-11-22 14:53:56.556678+00	2025-11-22 14:53:56.556678+00	\N	\N
6a3ea23c-7a55-41f3-9d7f-a4c14bd4a9ff	Bella	Cat	Siamese	1	Female	Small	Playful and affectionate	Available	https://example.com/bella.jpg	{"notes": "Litter trained", "special_needs": "None"}	t	t	150	b36f5979-d6c6-4b14-94b7-0163f5f38ccf	2025-11-22 14:53:58.191816+00	2025-11-22 14:53:58.191816+00	\N	\N
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reports (id, reporter_name, reporter_email, reporter_phone, animal_type, breed, color, location, city, description, urgency, has_injuries, injuries_description, is_dangerous, additional_info, images, status, created_at, updated_at) FROM stdin;
fe000d44-4487-44ed-a577-2676b9bffd85	Rishabh	rishabhshan7@gmail.com	9205641721	dog	street dog	black	pratap enclave,mohan garden,dwarka mor,new delhi-110059	new delhi	dog is injured	yes	f	2 injuries	t	none	\N	bad	2025-11-22 00:00:00+00	2025-11-22 17:13:02.783893+00
3c9d617c-07b8-411b-a21d-32cc1fcee9fd	Rishabh shan	rishabhshan7@gmail.com	09205641721	dog	Golden Retreiver	Black	pratap enclave,mohan garden,new delhi-110059	Delhi	dog is injured	high	t	dog is injured	f	dog is injured	[]	pending	2025-11-22 17:15:17.417+00	2025-11-22 17:15:17.417+00
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (id, token, expires_at, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: shelters; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shelters (id, name, type, address, city, phone, email, website, description, verified, created_at, updated_at, images) FROM stdin;
62f82c5e-983c-438e-a922-436c62ffccbb	Friendicoes SECA	ngo	271 & 273, Defence Colony, Jor Bagh, New Delhi, Delhi 110003	New Delhi	+91 11 24314787	friendicoes@gmail.com	https://friendicoes.org/	One of the oldest animal welfare organizations in Delhi, working since 1979.	t	2025-11-21 14:59:35.456755+00	2025-11-21 14:59:35.456755+00	\N
67283bbc-012f-4f61-8bd9-b150071034bf	Happy Paws Shelter	Rescue	123 Pet Street	Petville	123-456-7890	info@happypaws.com	https://happypaws.com	A shelter for happy pets	t	2025-11-22 14:48:32.836217+00	2025-11-22 14:48:32.836217+00	{https://example.com/shelter1.jpg}
61c5bdd4-dc8a-4db4-a3c4-64911368717e	Red Paws Rescue	ngo	Saket, New Delhi, Delhi 110017	New Delhi	+91 98 1055 6000	redpawsrescue@gmail.com	https://redpawsrescue.in/	Dedicated to rescuing and rehabilitating street animals in Delhi NCR.	t	2025-11-21 14:59:35.456755+00	2025-11-21 14:59:35.456755+00	\N
b36f5979-d6c6-4b14-94b7-0163f5f38ccf	Sanjay Gandhi Animal Care Centre	shelter	Jahangirpuri, New Delhi, Delhi 110033	New Delhi	+91 11 27251250	sanjaygandhianimalcarecentre@gmail.com	http://www.sgacc.org/	Delhi's oldest and largest animal shelter, established in 1980.	t	2025-11-21 14:59:35.456755+00	2025-11-21 14:59:35.456755+00	\N
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.team_members (id, user_id, role, joined_at, is_active) FROM stdin;
\.


--
-- Data for Name: whatsapp_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.whatsapp_messages (id, user_id, message, direction, status, created_at, updated_at) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: neondb_owner
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: app_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.app_users_id_seq', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: users_sync users_sync_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neondb_owner
--

ALTER TABLE ONLY neon_auth.users_sync
    ADD CONSTRAINT users_sync_pkey PRIMARY KEY (id);


--
-- Name: adoption_applications adoption_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.adoption_applications
    ADD CONSTRAINT adoption_applications_pkey PRIMARY KEY (id);


--
-- Name: app_users app_users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_email_key UNIQUE (email);


--
-- Name: app_users app_users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);


--
-- Name: email_notifications email_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_pkey PRIMARY KEY (id);


--
-- Name: ngos ngos_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ngos
    ADD CONSTRAINT ngos_email_key UNIQUE (email);


--
-- Name: ngos ngos_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ngos
    ADD CONSTRAINT ngos_pkey PRIMARY KEY (id);


--
-- Name: pets pets_new_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_new_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: shelters shelters_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shelters
    ADD CONSTRAINT shelters_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_user_role_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_role_key UNIQUE (user_id, role);


--
-- Name: whatsapp_messages whatsapp_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_pkey PRIMARY KEY (id);


--
-- Name: users_sync_deleted_at_idx; Type: INDEX; Schema: neon_auth; Owner: neondb_owner
--

CREATE INDEX users_sync_deleted_at_idx ON neon_auth.users_sync USING btree (deleted_at);


--
-- Name: idx_adoption_applications_pet_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_adoption_applications_pet_id ON public.adoption_applications USING btree (pet_id);


--
-- Name: idx_adoption_applications_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_adoption_applications_status ON public.adoption_applications USING btree (status);


--
-- Name: idx_adoption_applications_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_adoption_applications_user_id ON public.adoption_applications USING btree (user_id);


--
-- Name: idx_email_notifications_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_email_notifications_status ON public.email_notifications USING btree (status);


--
-- Name: idx_email_notifications_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_email_notifications_user_id ON public.email_notifications USING btree (user_id);


--
-- Name: idx_ngos_city_verified; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_ngos_city_verified ON public.ngos USING btree (city, verified);


--
-- Name: idx_pets_shelter_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pets_shelter_id ON public.pets USING btree (shelter_id);


--
-- Name: idx_team_members_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_team_members_user_id ON public.team_members USING btree (user_id);


--
-- Name: idx_whatsapp_messages_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_whatsapp_messages_user_id ON public.whatsapp_messages USING btree (user_id);


--
-- Name: adoption_applications update_adoption_applications_modtime; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER update_adoption_applications_modtime BEFORE UPDATE ON public.adoption_applications FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: ngos update_ngos_modtime; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER update_ngos_modtime BEFORE UPDATE ON public.ngos FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: whatsapp_messages update_whatsapp_messages_modtime; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER update_whatsapp_messages_modtime BEFORE UPDATE ON public.whatsapp_messages FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: adoption_applications adoption_applications_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.adoption_applications
    ADD CONSTRAINT adoption_applications_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;


--
-- Name: adoption_applications adoption_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.adoption_applications
    ADD CONSTRAINT adoption_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- Name: email_notifications email_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- Name: pets pets_new_shelter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_new_shelter_id_fkey FOREIGN KEY (shelter_id) REFERENCES public.shelters(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- Name: whatsapp_messages whatsapp_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO authenticated;


--
-- Name: SCHEMA pgrst; Type: ACL; Schema: -; Owner: neon_service
--

GRANT USAGE ON SCHEMA pgrst TO authenticator;


--
-- Name: FUNCTION pre_config(); Type: ACL; Schema: pgrst; Owner: neon_service
--

GRANT ALL ON FUNCTION pgrst.pre_config() TO authenticator;


--
-- Name: FUNCTION update_modified_column(); Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT ALL ON FUNCTION public.update_modified_column() TO authenticated;


--
-- Name: TABLE adoption_applications; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.adoption_applications TO authenticated;


--
-- Name: TABLE app_users; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.app_users TO authenticated;


--
-- Name: SEQUENCE app_users_id_seq; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT USAGE ON SEQUENCE public.app_users_id_seq TO authenticated;


--
-- Name: TABLE email_notifications; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.email_notifications TO authenticated;


--
-- Name: TABLE ngos; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.ngos TO authenticated;


--
-- Name: TABLE pets; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.pets TO authenticated;


--
-- Name: TABLE reports; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.reports TO authenticated;


--
-- Name: TABLE session; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.session TO authenticated;


--
-- Name: TABLE shelters; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.shelters TO authenticated;


--
-- Name: TABLE team_members; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.team_members TO authenticated;


--
-- Name: TABLE whatsapp_messages; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.whatsapp_messages TO authenticated;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: neondb_owner
--

ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public GRANT USAGE ON SEQUENCES TO authenticated;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: neondb_owner
--

ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: neondb_owner
--

ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO authenticated;


--
-- PostgreSQL database dump complete
--

\unrestrict evVyKJ2tDNwkw6m0PAObxYC0S1UPCZ4b0baMSrEzX5Fwrxfjd8uGewGBsN8nL1G


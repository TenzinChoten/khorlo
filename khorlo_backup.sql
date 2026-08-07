--
-- PostgreSQL database dump
--

\restrict CMAhvUldCSlvz6DiCu9UkPxNGcVtmasFzEpbcvN5zQOunBL6F4XbbP9LT002BLj

-- Dumped from database version 16.14 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

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
-- Name: ApplicationApprovalStatus; Type: TYPE; Schema: public; Owner: choten
--

CREATE TYPE public."ApplicationApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ApplicationApprovalStatus" OWNER TO choten;

--
-- Name: ApplicationStatus; Type: TYPE; Schema: public; Owner: choten
--

CREATE TYPE public."ApplicationStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN'
);


ALTER TYPE public."ApplicationStatus" OWNER TO choten;

--
-- Name: BillingCycle; Type: TYPE; Schema: public; Owner: choten
--

CREATE TYPE public."BillingCycle" AS ENUM (
    'MONTHLY',
    'YEARLY'
);


ALTER TYPE public."BillingCycle" OWNER TO choten;

--
-- Name: CampaignImageType; Type: TYPE; Schema: public; Owner: choten
--

CREATE TYPE public."CampaignImageType" AS ENUM (
    'PRODUCT',
    'REFERENCE',
    'BRAND_LOGO',
    'MOOD_BOARD',
    'OTHER'
);


ALTER TYPE public."CampaignImageType" OWNER TO choten;

--
-- Name: CampaignStatus; Type: TYPE; Schema: public; Owner: choten
--

CREATE TYPE public."CampaignStatus" AS ENUM (
    'DRAFT',
    'OPEN',
    'CLOSED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."CampaignStatus" OWNER TO choten;

--
-- Name: CompensationType; Type: TYPE; Schema: public; Owner: choten
--

CREATE TYPE public."CompensationType" AS ENUM (
    'PAID',
    'FREE_PRODUCT',
    'PAID_AND_PRODUCT'
);


ALTER TYPE public."CompensationType" OWNER TO choten;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: choten
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'NON_BINARY',
    'PREFER_NOT_TO_SAY'
);


ALTER TYPE public."Gender" OWNER TO choten;

--
-- Name: LocationType; Type: TYPE; Schema: public; Owner: choten
--

CREATE TYPE public."LocationType" AS ENUM (
    'ONLINE',
    'OFFLINE',
    'HYBRID'
);


ALTER TYPE public."LocationType" OWNER TO choten;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: choten
--

CREATE TYPE public."NotificationType" AS ENUM (
    'APPLICATION',
    'MESSAGE',
    'CAMPAIGN',
    'REVIEW',
    'SYSTEM',
    'SUBSCRIPTION'
);


ALTER TYPE public."NotificationType" OWNER TO choten;

--
-- Name: Platform; Type: TYPE; Schema: public; Owner: choten
--

CREATE TYPE public."Platform" AS ENUM (
    'INSTAGRAM',
    'TIKTOK',
    'YOUTUBE',
    'LINKEDIN',
    'X',
    'FACEBOOK'
);


ALTER TYPE public."Platform" OWNER TO choten;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: choten
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'BUSINESS',
    'INFLUENCER'
);


ALTER TYPE public."Role" OWNER TO choten;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: choten
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO choten;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Application; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."Application" (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "influencerId" text NOT NULL,
    "coverLetter" text,
    status public."ApplicationStatus" DEFAULT 'PENDING'::public."ApplicationStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Application" OWNER TO choten;

--
-- Name: BusinessProfile; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."BusinessProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "companyName" text NOT NULL,
    "companyLogo" text,
    website text,
    "companyDescription" text,
    country text,
    state text,
    city text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BusinessProfile" OWNER TO choten;

--
-- Name: Campaign; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."Campaign" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "productName" text,
    "compensationType" public."CompensationType" NOT NULL,
    budget double precision,
    currency text DEFAULT 'USD'::text,
    "creatorSlots" integer DEFAULT 1 NOT NULL,
    "applicationDeadline" timestamp(3) without time zone,
    "contentDeadline" timestamp(3) without time zone,
    "locationType" public."LocationType" DEFAULT 'ONLINE'::public."LocationType" NOT NULL,
    country text,
    state text,
    city text,
    address text,
    status public."CampaignStatus" DEFAULT 'DRAFT'::public."CampaignStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Campaign" OWNER TO choten;

--
-- Name: CampaignContentFormat; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."CampaignContentFormat" (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "contentFormatId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CampaignContentFormat" OWNER TO choten;

--
-- Name: CampaignContentNiche; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."CampaignContentNiche" (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "contentNicheId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CampaignContentNiche" OWNER TO choten;

--
-- Name: CampaignImage; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."CampaignImage" (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "imageUrl" text NOT NULL,
    "imageType" public."CampaignImageType" DEFAULT 'OTHER'::public."CampaignImageType" NOT NULL,
    caption text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CampaignImage" OWNER TO choten;

--
-- Name: ContentFormat; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."ContentFormat" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ContentFormat" OWNER TO choten;

--
-- Name: ContentNiche; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."ContentNiche" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ContentNiche" OWNER TO choten;

--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."Conversation" (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Conversation" OWNER TO choten;

--
-- Name: InfluencerContentFormat; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."InfluencerContentFormat" (
    id text NOT NULL,
    "influencerId" text NOT NULL,
    "contentFormatId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InfluencerContentFormat" OWNER TO choten;

--
-- Name: InfluencerContentNiche; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."InfluencerContentNiche" (
    id text NOT NULL,
    "influencerId" text NOT NULL,
    "contentNicheId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InfluencerContentNiche" OWNER TO choten;

--
-- Name: InfluencerProfile; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."InfluencerProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "displayName" text NOT NULL,
    "profilePhoto" text,
    bio text,
    age integer,
    gender public."Gender",
    country text,
    state text,
    city text,
    ethnicity text,
    "previousBrands" text,
    "applicationStatus" public."ApplicationApprovalStatus" DEFAULT 'PENDING'::public."ApplicationApprovalStatus" NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InfluencerProfile" OWNER TO choten;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "senderId" text NOT NULL,
    message text NOT NULL,
    "attachmentUrl" text,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Message" OWNER TO choten;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    type public."NotificationType" NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Notification" OWNER TO choten;

--
-- Name: Plan; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."Plan" (
    id text NOT NULL,
    name text NOT NULL,
    price double precision NOT NULL,
    "billingCycle" public."BillingCycle" NOT NULL,
    "campaignLimit" integer NOT NULL,
    "messageLimit" integer NOT NULL,
    "advancedSearch" boolean DEFAULT false NOT NULL,
    "featuredCampaigns" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Plan" OWNER TO choten;

--
-- Name: Portfolio; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."Portfolio" (
    id text NOT NULL,
    "influencerId" text NOT NULL,
    title text NOT NULL,
    description text,
    thumbnail text,
    url text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Portfolio" OWNER TO choten;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "reviewerId" text NOT NULL,
    "revieweeId" text NOT NULL,
    rating integer NOT NULL,
    review text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Review" OWNER TO choten;

--
-- Name: SocialAccount; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."SocialAccount" (
    id text NOT NULL,
    "userId" text NOT NULL,
    platform public."Platform" NOT NULL,
    username text NOT NULL,
    "profileUrl" text,
    followers integer DEFAULT 0 NOT NULL,
    "engagementRate" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SocialAccount" OWNER TO choten;

--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."Subscription" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "planId" text NOT NULL,
    "startsAt" timestamp(3) without time zone NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    status public."SubscriptionStatus" DEFAULT 'ACTIVE'::public."SubscriptionStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Subscription" OWNER TO choten;

--
-- Name: User; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" NOT NULL,
    "heardAboutUs" text,
    "emailVerifiedAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO choten;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: choten
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO choten;

--
-- Data for Name: Application; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."Application" (id, "campaignId", "influencerId", "coverLetter", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BusinessProfile; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."BusinessProfile" (id, "userId", "companyName", "companyLogo", website, "companyDescription", country, state, city, "isVerified", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Campaign; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."Campaign" (id, "businessId", title, description, "productName", "compensationType", budget, currency, "creatorSlots", "applicationDeadline", "contentDeadline", "locationType", country, state, city, address, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CampaignContentFormat; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."CampaignContentFormat" (id, "campaignId", "contentFormatId", quantity, "createdAt") FROM stdin;
\.


--
-- Data for Name: CampaignContentNiche; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."CampaignContentNiche" (id, "campaignId", "contentNicheId", "createdAt") FROM stdin;
\.


--
-- Data for Name: CampaignImage; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."CampaignImage" (id, "campaignId", "imageUrl", "imageType", caption, "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContentFormat; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."ContentFormat" (id, name, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContentNiche; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."ContentNiche" (id, name, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Conversation; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."Conversation" (id, "applicationId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: InfluencerContentFormat; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."InfluencerContentFormat" (id, "influencerId", "contentFormatId", "createdAt") FROM stdin;
\.


--
-- Data for Name: InfluencerContentNiche; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."InfluencerContentNiche" (id, "influencerId", "contentNicheId", "createdAt") FROM stdin;
\.


--
-- Data for Name: InfluencerProfile; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."InfluencerProfile" (id, "userId", "displayName", "profilePhoto", bio, age, gender, country, state, city, ethnicity, "previousBrands", "applicationStatus", "approvedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."Message" (id, "conversationId", "senderId", message, "attachmentUrl", "isRead", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."Notification" (id, "userId", title, body, type, "isRead", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Plan; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."Plan" (id, name, price, "billingCycle", "campaignLimit", "messageLimit", "advancedSearch", "featuredCampaigns", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Portfolio; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."Portfolio" (id, "influencerId", title, description, thumbnail, url, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."Review" (id, "campaignId", "reviewerId", "revieweeId", rating, review, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SocialAccount; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."SocialAccount" (id, "userId", platform, username, "profileUrl", followers, "engagementRate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."Subscription" (id, "businessId", "planId", "startsAt", "expiresAt", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public."User" (id, name, email, password, role, "heardAboutUs", "emailVerifiedAt", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: choten
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
116a39dc-b463-4b08-abdf-7ff09a6da495	5ac1a35208713bdd558cb8c0d1a8e79fd15e3b4e6062a75990528604682ca3aa	2026-08-07 17:33:48.209883+05:30	20260807114831_init	\N	\N	2026-08-07 17:33:48.173725+05:30	1
\.


--
-- Name: Application Application_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_pkey" PRIMARY KEY (id);


--
-- Name: BusinessProfile BusinessProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."BusinessProfile"
    ADD CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY (id);


--
-- Name: CampaignContentFormat CampaignContentFormat_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."CampaignContentFormat"
    ADD CONSTRAINT "CampaignContentFormat_pkey" PRIMARY KEY (id);


--
-- Name: CampaignContentNiche CampaignContentNiche_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."CampaignContentNiche"
    ADD CONSTRAINT "CampaignContentNiche_pkey" PRIMARY KEY (id);


--
-- Name: CampaignImage CampaignImage_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."CampaignImage"
    ADD CONSTRAINT "CampaignImage_pkey" PRIMARY KEY (id);


--
-- Name: Campaign Campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Campaign"
    ADD CONSTRAINT "Campaign_pkey" PRIMARY KEY (id);


--
-- Name: ContentFormat ContentFormat_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."ContentFormat"
    ADD CONSTRAINT "ContentFormat_pkey" PRIMARY KEY (id);


--
-- Name: ContentNiche ContentNiche_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."ContentNiche"
    ADD CONSTRAINT "ContentNiche_pkey" PRIMARY KEY (id);


--
-- Name: Conversation Conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY (id);


--
-- Name: InfluencerContentFormat InfluencerContentFormat_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."InfluencerContentFormat"
    ADD CONSTRAINT "InfluencerContentFormat_pkey" PRIMARY KEY (id);


--
-- Name: InfluencerContentNiche InfluencerContentNiche_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."InfluencerContentNiche"
    ADD CONSTRAINT "InfluencerContentNiche_pkey" PRIMARY KEY (id);


--
-- Name: InfluencerProfile InfluencerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."InfluencerProfile"
    ADD CONSTRAINT "InfluencerProfile_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Plan Plan_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Plan"
    ADD CONSTRAINT "Plan_pkey" PRIMARY KEY (id);


--
-- Name: Portfolio Portfolio_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Portfolio"
    ADD CONSTRAINT "Portfolio_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: SocialAccount SocialAccount_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."SocialAccount"
    ADD CONSTRAINT "SocialAccount_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Application_campaignId_influencerId_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "Application_campaignId_influencerId_key" ON public."Application" USING btree ("campaignId", "influencerId");


--
-- Name: Application_influencerId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Application_influencerId_idx" ON public."Application" USING btree ("influencerId");


--
-- Name: Application_status_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Application_status_idx" ON public."Application" USING btree (status);


--
-- Name: BusinessProfile_country_state_city_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "BusinessProfile_country_state_city_idx" ON public."BusinessProfile" USING btree (country, state, city);


--
-- Name: BusinessProfile_userId_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "BusinessProfile_userId_key" ON public."BusinessProfile" USING btree ("userId");


--
-- Name: CampaignContentFormat_campaignId_contentFormatId_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "CampaignContentFormat_campaignId_contentFormatId_key" ON public."CampaignContentFormat" USING btree ("campaignId", "contentFormatId");


--
-- Name: CampaignContentFormat_contentFormatId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "CampaignContentFormat_contentFormatId_idx" ON public."CampaignContentFormat" USING btree ("contentFormatId");


--
-- Name: CampaignContentNiche_campaignId_contentNicheId_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "CampaignContentNiche_campaignId_contentNicheId_key" ON public."CampaignContentNiche" USING btree ("campaignId", "contentNicheId");


--
-- Name: CampaignContentNiche_contentNicheId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "CampaignContentNiche_contentNicheId_idx" ON public."CampaignContentNiche" USING btree ("contentNicheId");


--
-- Name: CampaignImage_campaignId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "CampaignImage_campaignId_idx" ON public."CampaignImage" USING btree ("campaignId");


--
-- Name: CampaignImage_imageType_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "CampaignImage_imageType_idx" ON public."CampaignImage" USING btree ("imageType");


--
-- Name: Campaign_applicationDeadline_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Campaign_applicationDeadline_idx" ON public."Campaign" USING btree ("applicationDeadline");


--
-- Name: Campaign_businessId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Campaign_businessId_idx" ON public."Campaign" USING btree ("businessId");


--
-- Name: Campaign_compensationType_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Campaign_compensationType_idx" ON public."Campaign" USING btree ("compensationType");


--
-- Name: Campaign_country_state_city_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Campaign_country_state_city_idx" ON public."Campaign" USING btree (country, state, city);


--
-- Name: Campaign_locationType_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Campaign_locationType_idx" ON public."Campaign" USING btree ("locationType");


--
-- Name: Campaign_status_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Campaign_status_idx" ON public."Campaign" USING btree (status);


--
-- Name: ContentFormat_name_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "ContentFormat_name_key" ON public."ContentFormat" USING btree (name);


--
-- Name: ContentNiche_name_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "ContentNiche_name_key" ON public."ContentNiche" USING btree (name);


--
-- Name: Conversation_applicationId_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "Conversation_applicationId_key" ON public."Conversation" USING btree ("applicationId");


--
-- Name: InfluencerContentFormat_contentFormatId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "InfluencerContentFormat_contentFormatId_idx" ON public."InfluencerContentFormat" USING btree ("contentFormatId");


--
-- Name: InfluencerContentFormat_influencerId_contentFormatId_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "InfluencerContentFormat_influencerId_contentFormatId_key" ON public."InfluencerContentFormat" USING btree ("influencerId", "contentFormatId");


--
-- Name: InfluencerContentNiche_contentNicheId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "InfluencerContentNiche_contentNicheId_idx" ON public."InfluencerContentNiche" USING btree ("contentNicheId");


--
-- Name: InfluencerContentNiche_influencerId_contentNicheId_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "InfluencerContentNiche_influencerId_contentNicheId_key" ON public."InfluencerContentNiche" USING btree ("influencerId", "contentNicheId");


--
-- Name: InfluencerProfile_applicationStatus_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "InfluencerProfile_applicationStatus_idx" ON public."InfluencerProfile" USING btree ("applicationStatus");


--
-- Name: InfluencerProfile_country_state_city_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "InfluencerProfile_country_state_city_idx" ON public."InfluencerProfile" USING btree (country, state, city);


--
-- Name: InfluencerProfile_gender_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "InfluencerProfile_gender_idx" ON public."InfluencerProfile" USING btree (gender);


--
-- Name: InfluencerProfile_userId_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "InfluencerProfile_userId_key" ON public."InfluencerProfile" USING btree ("userId");


--
-- Name: Message_conversationId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Message_conversationId_idx" ON public."Message" USING btree ("conversationId");


--
-- Name: Message_createdAt_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Message_createdAt_idx" ON public."Message" USING btree ("createdAt");


--
-- Name: Message_isRead_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Message_isRead_idx" ON public."Message" USING btree ("isRead");


--
-- Name: Message_senderId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Message_senderId_idx" ON public."Message" USING btree ("senderId");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_isRead_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Notification_isRead_idx" ON public."Notification" USING btree ("isRead");


--
-- Name: Notification_type_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Notification_type_idx" ON public."Notification" USING btree (type);


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: Plan_billingCycle_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Plan_billingCycle_idx" ON public."Plan" USING btree ("billingCycle");


--
-- Name: Plan_isActive_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Plan_isActive_idx" ON public."Plan" USING btree ("isActive");


--
-- Name: Plan_name_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "Plan_name_key" ON public."Plan" USING btree (name);


--
-- Name: Portfolio_influencerId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Portfolio_influencerId_idx" ON public."Portfolio" USING btree ("influencerId");


--
-- Name: Review_campaignId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Review_campaignId_idx" ON public."Review" USING btree ("campaignId");


--
-- Name: Review_campaignId_reviewerId_revieweeId_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "Review_campaignId_reviewerId_revieweeId_key" ON public."Review" USING btree ("campaignId", "reviewerId", "revieweeId");


--
-- Name: Review_revieweeId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Review_revieweeId_idx" ON public."Review" USING btree ("revieweeId");


--
-- Name: SocialAccount_engagementRate_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "SocialAccount_engagementRate_idx" ON public."SocialAccount" USING btree ("engagementRate");


--
-- Name: SocialAccount_followers_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "SocialAccount_followers_idx" ON public."SocialAccount" USING btree (followers);


--
-- Name: SocialAccount_platform_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "SocialAccount_platform_idx" ON public."SocialAccount" USING btree (platform);


--
-- Name: SocialAccount_userId_platform_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "SocialAccount_userId_platform_key" ON public."SocialAccount" USING btree ("userId", platform);


--
-- Name: Subscription_businessId_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Subscription_businessId_idx" ON public."Subscription" USING btree ("businessId");


--
-- Name: Subscription_expiresAt_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Subscription_expiresAt_idx" ON public."Subscription" USING btree ("expiresAt");


--
-- Name: Subscription_status_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "Subscription_status_idx" ON public."Subscription" USING btree (status);


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: choten
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_isActive_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "User_isActive_idx" ON public."User" USING btree ("isActive");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: choten
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: Application Application_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."Campaign"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Application Application_influencerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES public."InfluencerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BusinessProfile BusinessProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."BusinessProfile"
    ADD CONSTRAINT "BusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignContentFormat CampaignContentFormat_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."CampaignContentFormat"
    ADD CONSTRAINT "CampaignContentFormat_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."Campaign"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignContentFormat CampaignContentFormat_contentFormatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."CampaignContentFormat"
    ADD CONSTRAINT "CampaignContentFormat_contentFormatId_fkey" FOREIGN KEY ("contentFormatId") REFERENCES public."ContentFormat"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignContentNiche CampaignContentNiche_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."CampaignContentNiche"
    ADD CONSTRAINT "CampaignContentNiche_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."Campaign"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignContentNiche CampaignContentNiche_contentNicheId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."CampaignContentNiche"
    ADD CONSTRAINT "CampaignContentNiche_contentNicheId_fkey" FOREIGN KEY ("contentNicheId") REFERENCES public."ContentNiche"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignImage CampaignImage_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."CampaignImage"
    ADD CONSTRAINT "CampaignImage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."Campaign"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Campaign Campaign_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Campaign"
    ADD CONSTRAINT "Campaign_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."BusinessProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public."Application"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InfluencerContentFormat InfluencerContentFormat_contentFormatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."InfluencerContentFormat"
    ADD CONSTRAINT "InfluencerContentFormat_contentFormatId_fkey" FOREIGN KEY ("contentFormatId") REFERENCES public."ContentFormat"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InfluencerContentFormat InfluencerContentFormat_influencerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."InfluencerContentFormat"
    ADD CONSTRAINT "InfluencerContentFormat_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES public."InfluencerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InfluencerContentNiche InfluencerContentNiche_contentNicheId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."InfluencerContentNiche"
    ADD CONSTRAINT "InfluencerContentNiche_contentNicheId_fkey" FOREIGN KEY ("contentNicheId") REFERENCES public."ContentNiche"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InfluencerContentNiche InfluencerContentNiche_influencerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."InfluencerContentNiche"
    ADD CONSTRAINT "InfluencerContentNiche_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES public."InfluencerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InfluencerProfile InfluencerProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."InfluencerProfile"
    ADD CONSTRAINT "InfluencerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Portfolio Portfolio_influencerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Portfolio"
    ADD CONSTRAINT "Portfolio_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES public."InfluencerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."Campaign"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_revieweeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SocialAccount SocialAccount_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."SocialAccount"
    ADD CONSTRAINT "SocialAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscription Subscription_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."BusinessProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscription Subscription_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: choten
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."Plan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict CMAhvUldCSlvz6DiCu9UkPxNGcVtmasFzEpbcvN5zQOunBL6F4XbbP9LT002BLj


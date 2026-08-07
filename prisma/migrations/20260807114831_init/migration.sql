-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BUSINESS', 'INFLUENCER');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'LINKEDIN', 'X', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "CompensationType" AS ENUM ('PAID', 'FREE_PRODUCT', 'PAID_AND_PRODUCT');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CampaignImageType" AS ENUM ('PRODUCT', 'REFERENCE', 'BRAND_LOGO', 'MOOD_BOARD', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION', 'MESSAGE', 'CAMPAIGN', 'REVIEW', 'SYSTEM', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "ApplicationApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "heardAboutUs" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyLogo" TEXT,
    "website" TEXT,
    "companyDescription" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfluencerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "bio" TEXT,
    "age" INTEGER,
    "gender" "Gender",
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "ethnicity" TEXT,
    "previousBrands" TEXT,
    "applicationStatus" "ApplicationApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfluencerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "username" TEXT NOT NULL,
    "profileUrl" TEXT,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentNiche" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentNiche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfluencerContentNiche" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "contentNicheId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfluencerContentNiche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentFormat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentFormat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfluencerContentFormat" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "contentFormatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfluencerContentFormat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "productName" TEXT,
    "compensationType" "CompensationType" NOT NULL,
    "budget" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'USD',
    "creatorSlots" INTEGER NOT NULL DEFAULT 1,
    "applicationDeadline" TIMESTAMP(3),
    "contentDeadline" TIMESTAMP(3),
    "locationType" "LocationType" NOT NULL DEFAULT 'ONLINE',
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "address" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignContentNiche" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contentNicheId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignContentNiche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignContentFormat" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contentFormatId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignContentFormat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignImage" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageType" "CampaignImageType" NOT NULL DEFAULT 'OTHER',
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "coverLetter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "campaignLimit" INTEGER NOT NULL,
    "messageLimit" INTEGER NOT NULL,
    "advancedSearch" BOOLEAN NOT NULL DEFAULT false,
    "featuredCampaigns" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_userId_key" ON "BusinessProfile"("userId");

-- CreateIndex
CREATE INDEX "BusinessProfile_country_state_city_idx" ON "BusinessProfile"("country", "state", "city");

-- CreateIndex
CREATE UNIQUE INDEX "InfluencerProfile_userId_key" ON "InfluencerProfile"("userId");

-- CreateIndex
CREATE INDEX "InfluencerProfile_country_state_city_idx" ON "InfluencerProfile"("country", "state", "city");

-- CreateIndex
CREATE INDEX "InfluencerProfile_gender_idx" ON "InfluencerProfile"("gender");

-- CreateIndex
CREATE INDEX "InfluencerProfile_applicationStatus_idx" ON "InfluencerProfile"("applicationStatus");

-- CreateIndex
CREATE INDEX "SocialAccount_platform_idx" ON "SocialAccount"("platform");

-- CreateIndex
CREATE INDEX "SocialAccount_followers_idx" ON "SocialAccount"("followers");

-- CreateIndex
CREATE INDEX "SocialAccount_engagementRate_idx" ON "SocialAccount"("engagementRate");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_userId_platform_key" ON "SocialAccount"("userId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "ContentNiche_name_key" ON "ContentNiche"("name");

-- CreateIndex
CREATE INDEX "InfluencerContentNiche_contentNicheId_idx" ON "InfluencerContentNiche"("contentNicheId");

-- CreateIndex
CREATE UNIQUE INDEX "InfluencerContentNiche_influencerId_contentNicheId_key" ON "InfluencerContentNiche"("influencerId", "contentNicheId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentFormat_name_key" ON "ContentFormat"("name");

-- CreateIndex
CREATE INDEX "InfluencerContentFormat_contentFormatId_idx" ON "InfluencerContentFormat"("contentFormatId");

-- CreateIndex
CREATE UNIQUE INDEX "InfluencerContentFormat_influencerId_contentFormatId_key" ON "InfluencerContentFormat"("influencerId", "contentFormatId");

-- CreateIndex
CREATE INDEX "Campaign_businessId_idx" ON "Campaign"("businessId");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Campaign_compensationType_idx" ON "Campaign"("compensationType");

-- CreateIndex
CREATE INDEX "Campaign_locationType_idx" ON "Campaign"("locationType");

-- CreateIndex
CREATE INDEX "Campaign_applicationDeadline_idx" ON "Campaign"("applicationDeadline");

-- CreateIndex
CREATE INDEX "Campaign_country_state_city_idx" ON "Campaign"("country", "state", "city");

-- CreateIndex
CREATE INDEX "CampaignContentNiche_contentNicheId_idx" ON "CampaignContentNiche"("contentNicheId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignContentNiche_campaignId_contentNicheId_key" ON "CampaignContentNiche"("campaignId", "contentNicheId");

-- CreateIndex
CREATE INDEX "CampaignContentFormat_contentFormatId_idx" ON "CampaignContentFormat"("contentFormatId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignContentFormat_campaignId_contentFormatId_key" ON "CampaignContentFormat"("campaignId", "contentFormatId");

-- CreateIndex
CREATE INDEX "CampaignImage_campaignId_idx" ON "CampaignImage"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignImage_imageType_idx" ON "CampaignImage"("imageType");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_influencerId_idx" ON "Application"("influencerId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_campaignId_influencerId_key" ON "Application"("campaignId", "influencerId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_applicationId_key" ON "Conversation"("applicationId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_isRead_idx" ON "Message"("isRead");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Review_revieweeId_idx" ON "Review"("revieweeId");

-- CreateIndex
CREATE INDEX "Review_campaignId_idx" ON "Review"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_campaignId_reviewerId_revieweeId_key" ON "Review"("campaignId", "reviewerId", "revieweeId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE INDEX "Plan_isActive_idx" ON "Plan"("isActive");

-- CreateIndex
CREATE INDEX "Plan_billingCycle_idx" ON "Plan"("billingCycle");

-- CreateIndex
CREATE INDEX "Subscription_businessId_idx" ON "Subscription"("businessId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_expiresAt_idx" ON "Subscription"("expiresAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Portfolio_influencerId_idx" ON "Portfolio"("influencerId");

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerProfile" ADD CONSTRAINT "InfluencerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerContentNiche" ADD CONSTRAINT "InfluencerContentNiche_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerContentNiche" ADD CONSTRAINT "InfluencerContentNiche_contentNicheId_fkey" FOREIGN KEY ("contentNicheId") REFERENCES "ContentNiche"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerContentFormat" ADD CONSTRAINT "InfluencerContentFormat_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerContentFormat" ADD CONSTRAINT "InfluencerContentFormat_contentFormatId_fkey" FOREIGN KEY ("contentFormatId") REFERENCES "ContentFormat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignContentNiche" ADD CONSTRAINT "CampaignContentNiche_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignContentNiche" ADD CONSTRAINT "CampaignContentNiche_contentNicheId_fkey" FOREIGN KEY ("contentNicheId") REFERENCES "ContentNiche"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignContentFormat" ADD CONSTRAINT "CampaignContentFormat_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignContentFormat" ADD CONSTRAINT "CampaignContentFormat_contentFormatId_fkey" FOREIGN KEY ("contentFormatId") REFERENCES "ContentFormat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignImage" ADD CONSTRAINT "CampaignImage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

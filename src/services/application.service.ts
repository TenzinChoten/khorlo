import { requireRole } from "@/src/lib/require-role";
import { applicationRepository } from "@/src/repositories/application.repository";
import { campaignRepository } from "@/src/repositories/campaign.repository";
import { influencerRepository } from "@/src/repositories/influencer.repository";
import { businessRepository } from "@/src/repositories/business.repository";
import { notificationService } from "@/src/services/notification.service";
import { prisma } from "@/src/lib/prisma";
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from "@/src/validations/application.validation";
import type {
  ApplicationResponse,
  ApplicationListMeResponse,
  ApplicationListCampaignResponse,
  ApplicationDetailResponse,
} from "@/src/types/application";
import {
  ValidationError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from "@/src/types";

function parseValidation<T>(
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: { flatten: () => { fieldErrors: Record<string, string[]> } } } },
  body: unknown,
  message: string
): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError(
      message,
      result.error.flatten().fieldErrors as Record<string, string[]>
    );
  }
  return result.data;
}

export const applicationService = {
  async apply(body: unknown): Promise<ApplicationResponse> {
    const user = await requireRole("INFLUENCER");

    const profile = await influencerRepository.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundError("You must create an influencer profile to apply.");
    }

    const data = parseValidation(createApplicationSchema, body, "Invalid application data");

    const campaign = await campaignRepository.findById(data.campaignId);
    if (!campaign) {
      throw new NotFoundError("Campaign not found.");
    }

    // Business rule: Cannot apply to inactive or closed campaigns
    if (campaign.status !== "OPEN") {
      throw new ConflictError("This campaign is not open for applications.");
    }

    // Business rule: Cannot apply after the deadline
    if (campaign.applicationDeadline && new Date() > campaign.applicationDeadline) {
      throw new ConflictError("The application deadline has passed.");
    }

    // Business rule: Duplicate prevention
    const alreadyApplied = await applicationRepository.checkExists(campaign.id, profile.id);
    if (alreadyApplied) {
      throw new ConflictError("You have already applied to this campaign.");
    }

    // Business rule: Business owners cannot apply to their own campaign (if they also have an influencer profile)
    // We check if the current user also has a business profile and if it owns this campaign.
    const businessProfile = await businessRepository.findByUserId(user.id);
    if (businessProfile && businessProfile.id === campaign.business.id) {
      throw new ForbiddenError("You cannot apply to your own campaign.");
    }

    const application = await applicationRepository.create({
      campaignId: campaign.id,
      influencerId: profile.id,
      coverLetter: data.coverLetter,
    });

    // Notify Business Owner
    const campaignOwnerProfile = await prisma.businessProfile.findUnique({
      where: { id: campaign.business.id },
      select: { userId: true },
    });
    
    if (campaignOwnerProfile) {
      await notificationService.createNotification(
        campaignOwnerProfile.userId,
        "New Application Received",
        `Someone applied to your campaign: ${campaign.title}`,
        "APPLICATION"
      );
    }

    return { application };
  },

  async getMyApplications(): Promise<ApplicationListMeResponse> {
    const user = await requireRole("INFLUENCER");

    const profile = await influencerRepository.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundError("Influencer profile not found.");
    }

    const applications = await applicationRepository.findByInfluencerId(profile.id);

    return { applications };
  },

  async getCampaignApplications(campaignId: string): Promise<ApplicationListCampaignResponse> {
    const user = await requireRole("BUSINESS");

    const businessProfile = await businessRepository.findByUserId(user.id);
    if (!businessProfile) {
      throw new NotFoundError("Business profile not found.");
    }

    const campaignOwnerId = await campaignRepository.findOwner(campaignId);
    if (!campaignOwnerId) {
      throw new NotFoundError("Campaign not found.");
    }

    if (campaignOwnerId !== businessProfile.id) {
      throw new ForbiddenError("You do not own this campaign.");
    }

    const applications = await applicationRepository.findByCampaignId(campaignId);

    return { applications };
  },

  async getApplicationById(id: string): Promise<ApplicationDetailResponse> {
    const user = await requireRole("INFLUENCER", "BUSINESS");

    const application = await applicationRepository.findById(id);
    if (!application) {
      throw new NotFoundError("Application not found.");
    }

    // Verify ownership: must be the applicant or the campaign owner
    let isAuthorized = false;

    if (user.role === "INFLUENCER") {
      const profile = await influencerRepository.findByUserId(user.id);
      if (profile && profile.id === application.influencerId) {
        isAuthorized = true;
      }
    } else if (user.role === "BUSINESS") {
      const businessProfile = await businessRepository.findByUserId(user.id);
      if (businessProfile && businessProfile.id === application.campaign.business.id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new ForbiddenError("You are not authorized to view this application.");
    }

    return { application };
  },

  async updateStatus(id: string, body: unknown): Promise<ApplicationResponse> {
    const user = await requireRole("BUSINESS");

    const data = parseValidation(updateApplicationStatusSchema, body, "Invalid status data");

    const application = await applicationRepository.findById(id);
    if (!application) {
      throw new NotFoundError("Application not found.");
    }

    const businessProfile = await businessRepository.findByUserId(user.id);
    if (!businessProfile || businessProfile.id !== application.campaign.business.id) {
      throw new ForbiddenError("You are not authorized to update this application.");
    }

    // Status transition validation
    if (application.status !== "PENDING") {
      throw new ConflictError(`Cannot update status from ${application.status}.`);
    }

    const updatedApplication = await applicationRepository.updateStatus(id, {
      status: data.status,
    });

    // Notify Influencer
    const influencerProfile = await prisma.influencerProfile.findUnique({
      where: { id: application.influencerId },
      select: { userId: true },
    });

    if (influencerProfile) {
      const action = data.status === "ACCEPTED" ? "accepted" : "rejected";
      await notificationService.createNotification(
        influencerProfile.userId,
        `Application ${data.status}`,
        `Your application for ${application.campaign.title} has been ${action}.`,
        "APPLICATION"
      );
    }

    return { application: updatedApplication };
  },

  async deleteApplication(id: string): Promise<void> {
    const user = await requireRole("INFLUENCER");

    const application = await applicationRepository.findById(id);
    if (!application) {
      throw new NotFoundError("Application not found.");
    }

    const profile = await influencerRepository.findByUserId(user.id);
    if (!profile || profile.id !== application.influencerId) {
      throw new ForbiddenError("You are not authorized to delete this application.");
    }

    // Cannot withdraw if already accepted
    if (application.status === "ACCEPTED") {
      throw new ConflictError("Cannot withdraw an accepted application.");
    }

    await applicationRepository.delete(id);
  },
};

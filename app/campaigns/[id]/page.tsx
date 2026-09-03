import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { campaignRepository } from "@/src/repositories/campaign.repository";

// [Reason] Campaign metadata is request-specific and must not be prerendered at build time
export const dynamic = "force-dynamic";

function toAbsoluteUrl(path: string | null | undefined, origin: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

async function getRequestOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

// [Reason] Apply and share clicks must land on the Vite app, not this API-host metadata page
function getFrontendOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  return raw.replace(/\/+$/, "");
}

function pickShareImage(campaign: {
  images: { imageUrl: string; imageType: string }[];
  business: { companyLogo: string | null };
}): string | null {
  const preferred =
    campaign.images.find((img) => img.imageType === "PRODUCT" || img.imageType === "OTHER") ||
    campaign.images.find((img) => img.imageType === "BRAND_LOGO") ||
    campaign.images[0];
  return preferred?.imageUrl || campaign.business.companyLogo;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const campaign = await campaignRepository.findById(id);
  if (!campaign) {
    return { title: "Campaign not found | Khorlo" };
  }

  const origin = await getRequestOrigin();
  const frontendOrigin = getFrontendOrigin();
  const url = `${frontendOrigin}/campaigns/${campaign.id}`;
  const description = campaign.description.trim().slice(0, 200) || "Check out this campaign on Khorlo.";
  const image = toAbsoluteUrl(pickShareImage(campaign), origin);

  // [Reason] Social crawlers need server-rendered Open Graph tags; the SPA cannot provide them
  return {
    title: `${campaign.title} | Khorlo`,
    description,
    openGraph: {
      title: `${campaign.title} | Khorlo`,
      description,
      url,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${campaign.title} | Khorlo`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PublicCampaignMetadataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await campaignRepository.findById(id);
  if (!campaign) notFound();

  const frontendOrigin = getFrontendOrigin();
  const campaignPath = `/campaigns/${campaign.id}`;
  // [Reason] Apply from this API-host fallback must open SPA login, then return to the public campaign
  const applyHref = `${frontendOrigin}/login?redirect=${encodeURIComponent(campaignPath)}`;
  const viewHref = `${frontendOrigin}${campaignPath}`;
  const niches = campaign.contentNiches.map((n) => n.name).filter(Boolean).join(", ") || "Any";
  const compensation = campaign.budget
    ? `${campaign.currency || "USD"} ${campaign.budget.toLocaleString()}`
    : campaign.compensationType === "FREE_PRODUCT"
      ? "Free Product"
      : "Unpaid";

  return (
    <main style={{ minHeight: "100vh", background: "#0A0A0A", maxWidth: "none" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 1.5rem", color: "#fff" }}>
      <p style={{ color: "#3B82F6", fontWeight: 500 }}>{campaign.business.companyName}</p>
      <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 1rem" }}>{campaign.title}</h1>
      <p style={{ color: "#A3A3A3", whiteSpace: "pre-wrap" }}>{campaign.description}</p>
      <p style={{ color: "#A3A3A3", marginTop: "1.5rem" }}>Compensation: {compensation}</p>
      <p style={{ color: "#A3A3A3" }}>Niches: {niches}</p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "2rem" }}>
        <a
          href={applyHref}
          style={{
            display: "inline-block",
            padding: "0.75rem 1.25rem",
            background: "#3B82F6",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Apply Now
        </a>
        <a
          href={viewHref}
          style={{
            display: "inline-block",
            padding: "0.75rem 1.25rem",
            border: "1px solid #404040",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          View campaign
        </a>
      </div>
      </div>
    </main>
  );
}

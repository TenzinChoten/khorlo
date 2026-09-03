export function getPublicCampaignPath(campaignId) {
  return `/campaigns/${campaignId}`;
}

// [Reason] Address-bar /dashboard/campaign/:id links are what people often share
export function getCampaignIdFromDashboardPath(pathname) {
  const match = typeof pathname === 'string'
    ? pathname.match(/^\/dashboard\/campaign\/([^/?#]+)$/)
    : null;
  return match?.[1] || null;
}

export function getPublicCampaignUrl(campaignId) {
  const path = getPublicCampaignPath(campaignId);
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}

export function getWhatsAppShareText(campaignTitle, campaignUrl) {
  return `Check out this campaign on Khorlo:\n\n${campaignTitle}\n\nApply here:\n${campaignUrl}`;
}

export function getWhatsAppShareUrl(campaignTitle, campaignUrl) {
  return `https://wa.me/?text=${encodeURIComponent(getWhatsAppShareText(campaignTitle, campaignUrl))}`;
}

export function getNativeShareText(description) {
  const trimmed = (description || '').trim();
  return trimmed ? trimmed.slice(0, 200) : 'Check out this campaign on Khorlo.';
}

export async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // [Reason] Older browsers have no Clipboard API, so fall back to a hidden textarea copy
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) {
    throw new Error('Clipboard unavailable');
  }
}

import React, { useEffect, useState } from 'react';
import { Link2, MessageCircle, Share2, X } from 'lucide-react';
import { copyTextToClipboard, getNativeShareText, getWhatsAppShareUrl } from '../lib/campaignShare';

const ShareCampaignModal = ({ open, onClose, campaignTitle, campaignUrl, description }) => {
  const [copyFeedback, setCopyFeedback] = useState('');
  const [copyError, setCopyError] = useState('');
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    if (!open) {
      setCopyFeedback('');
      setCopyError('');
    }
  }, [open]);

  if (!open) return null;

  const handleCopy = async () => {
    setCopyError('');
    try {
      await copyTextToClipboard(campaignUrl);
      setCopyFeedback('Link copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch {
      setCopyError('Could not copy the link. Please copy it manually.');
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: campaignTitle,
        text: getNativeShareText(description),
        url: campaignUrl,
      });
    } catch (err) {
      // [Reason] Dismissing the system share sheet is not a failure
      if (err?.name === 'AbortError') return;
      setCopyError('Sharing is unavailable on this device.');
    }
  };

  return (
    <div className="share-campaign-overlay" onClick={onClose}>
      <div className="apple-panel share-campaign-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Share Campaign</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share menu"
            style={{ background: 'none', border: 'none', color: 'var(--apple-text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="share-campaign-actions">
          <button type="button" className="btn btn-outline share-campaign-action" onClick={handleCopy}>
            <Link2 size={18} /> {copyFeedback || 'Copy Link'}
          </button>
          <a
            className="btn btn-outline share-campaign-action"
            href={getWhatsAppShareUrl(campaignTitle, campaignUrl)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
          {canNativeShare && (
            <button type="button" className="btn btn-primary btn-accent share-campaign-action" onClick={handleNativeShare}>
              <Share2 size={18} /> More / Share
            </button>
          )}
          <button type="button" className="btn btn-outline share-campaign-action" onClick={onClose}>
            Close
          </button>
        </div>

        {copyError && (
          <p style={{ color: '#ff3b30', fontSize: '0.875rem', marginTop: '1rem' }}>{copyError}</p>
        )}
      </div>
    </div>
  );
};

export default ShareCampaignModal;

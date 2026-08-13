import React, { useState } from 'react';
import { Plus, Save, X, ImagePlus } from 'lucide-react';
import { fetchApi, getMediaUrl } from '../lib/api';
import ImageCropper from './ImageCropper';

const AddPortfolioModal = ({ item, onClose, onSaved }) => {
  const isEditing = Boolean(item?.id);
  const [form, setForm] = useState({
    title: item?.title || '',
    description: item?.description || '',
    thumbnail: item?.thumbnail || '',
    url: item?.url || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [cropImageSrc, setCropImageSrc] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropImageSrc(URL.createObjectURL(file));
    e.target.value = null;
  };

  const handleCropComplete = async (croppedFile) => {
    setCropImageSrc(null);
    setUploading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('file', croppedFile);
      const res = await fetchApi('/upload', { method: 'POST', body: data });
      setForm((prev) => ({ ...prev, thumbnail: res.url }));
    } catch {
      setError('Failed to upload thumbnail. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      // [Reason] Include id when editing so the API updates the same row instead of creating another
      const res = await fetchApi('/influencer/me', {
        method: 'PATCH',
        body: JSON.stringify({
          portfolioItem: {
            ...(isEditing ? { id: item.id } : {}),
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            thumbnail: form.thumbnail || undefined,
            url: form.url.trim() || undefined,
          },
        }),
      });
      onSaved(res.profile);
    } catch (err) {
      setError(err.message || (isEditing ? 'Failed to update portfolio item' : 'Failed to add portfolio item'));
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    color: 'white',
    outline: 'none',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.5rem',
      }}
    >
      {cropImageSrc && (
        <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', zIndex: 1100 }}>
          <ImageCropper
            imageSrc={cropImageSrc}
            onCropComplete={handleCropComplete}
            onCancel={() => setCropImageSrc(null)}
            cropShape="rect"
            aspect={16 / 9}
            filename="portfolio-thumbnail.jpg"
          />
        </div>
      )}

      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '520px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{isEditing ? 'Edit portfolio item' : 'Add portfolio item'}</h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', borderRadius: '8px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Title</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Brand campaign, reel, or case study" style={inputStyle} required />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="What you created and the result"
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Thumbnail</label>
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                minHeight: '140px',
                borderRadius: '12px',
                border: '1px dashed var(--glass-border)',
                background: 'rgba(255,255,255,0.03)',
                cursor: uploading ? 'wait' : 'pointer',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {form.thumbnail ? (
                <img src={getMediaUrl(form.thumbnail)} alt="Thumbnail preview" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              ) : (
                <>
                  <ImagePlus size={28} color="var(--text-secondary)" />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {uploading ? 'Uploading…' : isEditing ? 'Click to replace thumbnail' : 'Click to upload a thumbnail'}
                  </span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleThumbnailSelect} hidden disabled={uploading} />
            </label>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>URL</label>
            <input type="url" name="url" value={form.url} onChange={handleChange} placeholder="https://…" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={saving || uploading} className="btn btn-primary" style={{ display: 'flex', gap: '0.4rem' }}>
              {isEditing ? <Save size={16} /> : <Plus size={16} />}
              {saving ? (isEditing ? 'Saving…' : 'Adding…') : (isEditing ? 'Save changes' : 'Add item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPortfolioModal;

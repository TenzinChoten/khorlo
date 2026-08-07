import React from 'react';
import { ArrowLeft, Calendar, DollarSign, Target, MapPin, Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const CampaignDetail = () => {
  const { id } = useParams();

  return (
    <div className="animate-fade-in">
      <Link to="/dashboard/search-campaigns" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', textDecoration: 'none', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Campaigns
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <img src="https://ui-avatars.com/api/?name=TechNova&background=random&color=fff" alt="TechNova" style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }} />
            <div>
              <p style={{ color: 'var(--accent)', fontWeight: 500, marginBottom: '0.25rem' }}>TechNova</p>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Smart Home Hub Launch</h1>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>About the Campaign</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }}>
              We are launching our new Smart Home Hub and are looking for tech-savvy creators to help us spread the word. The ideal video will showcase the unboxing experience, setting it up with existing smart devices, and demonstrating the voice control features. We want authentic reactions and honest reviews.
            </p>
            
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Requirements</h3>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: 1.8 }}>
              <li>1x Dedicated YouTube Video (minimum 5 minutes)</li>
              <li>1x YouTube Short highlighting key features</li>
              <li>Link in description for 30 days</li>
              <li>Must have a smart home setup already</li>
            </ul>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Mood Board</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[1, 2, 3].map(item => (
                <img key={item} src={`https://picsum.photos/400/400?random=${item}`} alt="Mood board" style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', objectFit: 'cover' }} />
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
            <button className="btn btn-primary btn-accent" style={{ width: '100%', marginBottom: '1rem' }}>Apply Now</button>
            <button className="btn btn-outline" style={{ width: '100%', display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              <Share2 size={18} /> Share Campaign
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--accent)' }}><DollarSign size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Compensation</div>
                  <div style={{ fontWeight: 600 }}>$500 - $1,000</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--accent)' }}><Target size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Platform</div>
                  <div style={{ fontWeight: 600 }}>YouTube</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--accent)' }}><MapPin size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Location</div>
                  <div style={{ fontWeight: 600 }}>Global (English)</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--accent)' }}><Calendar size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Application Deadline</div>
                  <div style={{ fontWeight: 600 }}>Oct 15, 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;

import React from 'react';
import { Mail } from 'lucide-react';

const InstagramIcon = ({ size = 24, color = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Contact = () => {
  return (
    <div style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>contact us.</h1>
      <div className="prose">
        <p>We'd love to hear from you. Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.</p>
        
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>email</h3>
          <p>
            <a href="mailto:khorlo.network@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
              <Mail size={16} color="var(--text-primary)" /> khorlo.network@gmail.com
            </a>
          </p>
          
          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>support</h3>
          <p>
            <a href="https://www.instagram.com/khorlo.network" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
              <InstagramIcon size={16} color="var(--text-primary)" /> khorlo.network
            </a>
          </p>
          
          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>headquarters</h3>
          <p>Built by Tibetans, for Tibetans.</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;

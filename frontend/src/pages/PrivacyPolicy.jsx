import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>privacy policy.</h1>
      <div className="prose">
        <p>Effective Date: 01/09/2026</p>
        <p>At Khorlo Network, your privacy is a top priority. This policy outlines how we collect, use, and protect your information.</p>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>1. information we collect</h3>
        <p>We collect information you provide directly to us when creating an account, such as your name, email address, and profile details.</p>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>2. how we use information</h3>
        <p>Your information is used to provide, maintain, and improve our platform, process transactions, and communicate with you.</p>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>3. data sharing</h3>
        <p>We do not sell your personal data. Information may be shared with trusted third parties solely for providing our services (e.g., payment processors).</p>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>4. security</h3>
        <p>We implement reasonable security measures to protect your personal data from unauthorized access or disclosure.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

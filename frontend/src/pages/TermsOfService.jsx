import React from 'react';

const TermsOfService = () => {
  return (
    <div style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>terms of service.</h1>
      <div className="prose">
        <p>Effective Date: 01/09/2026</p>
        <p>Welcome to Khorlo Network. By accessing or using our platform, you agree to be bound by these Terms of Service.</p>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>1. acceptance of terms</h3>
        <p>By creating an account, you confirm that you have read, understood, and agreed to these terms.</p>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>2. user accounts</h3>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>3. content & conduct</h3>
        <p>Users must not post content that is illegal, abusive, or infringes on the intellectual property of others.</p>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>4. modifications</h3>
        <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of the modified terms.</p>
      </div>
    </div>
  );
};

export default TermsOfService;

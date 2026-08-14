import React from 'react';

const About = () => {
  return (
    <section id="about" className="editorial-section">
      <div className="editorial-sphere sphere-3"></div>
      
      <div className="section-header">
        <h2 className="section-title">who<br/>we<br/>are.</h2>
        <div className="section-intro">
          <p>
            a society grows when they help each other. at khorlo we connect businesses, brands, and communities with creators, innovators and people.
          </p>
          <p style={{ fontWeight: 700, marginTop: '1rem', fontSize: '1.2rem' }}>
            built by tibetans, built for tibetans.
          </p>
        </div>
      </div>

      <div className="editorial-grid">
        <div className="editorial-card">
          <h3>community first.</h3>
          <p>upcoming creators to turn their passions into realities and for the brands and communities, their ideas to be felt and seen by all.</p>
        </div>
        <div className="editorial-card">
          <h3>shared values.</h3>
          <p>connect with each other through similar niches, with shared enthusiasm and goal. grow with the same motivation and purpose.</p>
        </div>
        <div className="editorial-card">
          <h3>secure & transparent.</h3>
          <p>from payments to contracts, everything is handled securely. we keep in mind for the society to thrive, trust is the must.</p>
        </div>
      </div>
    </section>
  );
};

export default About;

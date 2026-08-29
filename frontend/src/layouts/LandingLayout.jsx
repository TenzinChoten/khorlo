import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingLayout = () => {
  return (
    <>
      <div className="app-container">
        <Navbar />
      <main style={{ flex: 1, paddingTop: '80px' }}>
        <Outlet />
      </main>
        <Footer />
      </div>
    </>
  );
};

export default LandingLayout;

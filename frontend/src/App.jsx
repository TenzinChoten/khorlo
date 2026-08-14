import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'

// Layouts
import LandingLayout from './layouts/LandingLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Pages
import Hero from './components/Hero'
import Features from './components/Features'
import Pricing from './components/Pricing'
import About from './components/About'
import ScrollToTop from './components/ScrollToTop'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import BusinessDashboard from './pages/BusinessDashboard'
import InfluencerDashboard from './pages/InfluencerDashboard'
import SearchInfluencers from './pages/SearchInfluencers'
import SearchCampaigns from './pages/SearchCampaigns'
import CampaignDetail from './pages/CampaignDetail'
import ApplicationReview from './pages/ApplicationReview'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import ChangePassword from './pages/ChangePassword'
import Chat from './pages/Chat'
import Notifications from './pages/Notifications'
import FAQ from './pages/FAQ'
import BusinessOnboarding from './pages/BusinessOnboarding'
import CreatorOnboarding from './pages/CreatorOnboarding'
import CheckoutSuccess from './pages/CheckoutSuccess'
import Billing from './pages/Billing'
import CreateCampaign from './pages/CreateCampaign'
import PublishedCampaigns from './pages/PublishedCampaigns'

// A wrapper for the landing page content
const LandingPage = () => (
  <>
    <Hero />
    <Features />
    <Pricing />
    <About />
  </>
)

function App() {
  React.useEffect(() => {
    // 3D Tilt Effect for Glass Panels
    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -5; // Subtle 5deg max tilt
      const rotateY = ((x - centerX) / centerX) * 5;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    };
    
    const handleMouseLeave = (e) => {
      const card = e.currentTarget;
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s ease-out';
    };

    let cards = [];
    
    const applyTilt = () => {
      cards = document.querySelectorAll('.glass-panel');
      cards.forEach(card => {
        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    applyTilt();

    const observer = new MutationObserver(() => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
      applyTilt();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className="noise-overlay"></div>
      <ScrollToTop />
      <Routes>
        {/* Public Routes with Landing Layout */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding/business" element={<BusinessOnboarding />} />
        <Route path="/onboarding/creator" element={<CreatorOnboarding />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
      </Route>

      {/* Authenticated Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="business" element={<BusinessDashboard />} />
        <Route path="business/campaigns/new" element={<CreateCampaign />} />
        <Route path="business/campaigns" element={<PublishedCampaigns />} />
        <Route path="influencer" element={<InfluencerDashboard />} />
        <Route path="search-influencers" element={<SearchInfluencers />} />
        <Route path="search-campaigns" element={<SearchCampaigns />} />
        <Route path="campaign/:id" element={<CampaignDetail />} />
        <Route path="application/:id" element={<ApplicationReview />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="profile/change-password" element={<ChangePassword />} />
        <Route path="messages" element={<Chat />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="billing" element={<Billing />} />
      </Route>
    </Routes>
    </>
  )
}

export default App

import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'

// [Reason] Layouts and landing sections stay eager so first paint does not wait on a route chunk
import LandingLayout from './layouts/LandingLayout'
import Hero from './components/Hero'
import Features from './components/Features'
import Pricing from './components/Pricing'
import About from './components/About'
import ScrollToTop from './components/ScrollToTop'

// [Reason] Dashboard chrome is unused on marketing/auth routes
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))

// [Reason] Split each route so visitors do not download the full app on first load
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const BusinessDashboard = lazy(() => import('./pages/BusinessDashboard'))
const InfluencerDashboard = lazy(() => import('./pages/InfluencerDashboard'))
const SearchInfluencers = lazy(() => import('./pages/SearchInfluencers'))
const InfluencerPublicProfile = lazy(() => import('./pages/InfluencerPublicProfile'))
const SearchCampaigns = lazy(() => import('./pages/SearchCampaigns'))
const CampaignDetail = lazy(() => import('./pages/CampaignDetail'))
const ApplicationReview = lazy(() => import('./pages/ApplicationReview'))
const Profile = lazy(() => import('./pages/Profile'))
const EditProfile = lazy(() => import('./pages/EditProfile'))
const ChangePassword = lazy(() => import('./pages/ChangePassword'))
const Chat = lazy(() => import('./pages/Chat'))
const Notifications = lazy(() => import('./pages/Notifications'))
const FAQ = lazy(() => import('./pages/FAQ'))
const BusinessOnboarding = lazy(() => import('./pages/BusinessOnboarding'))
const CreatorOnboarding = lazy(() => import('./pages/CreatorOnboarding'))
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'))
const Billing = lazy(() => import('./pages/Billing'))
const CreateCampaign = lazy(() => import('./pages/CreateCampaign'))
const PublishedCampaigns = lazy(() => import('./pages/PublishedCampaigns'))

// A wrapper for the landing page content
const LandingPage = () => (
  <>
    <Hero />
    <Features />
    <Pricing />
    <About />
  </>
)

// [Reason] Match existing page loading copy while a route chunk downloads
function RouteFallback() {
  return (
    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      Loading...
    </div>
  )
}

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
      // [Reason] Sidebar/header tilt shifts hit targets so Log Out and nav clicks miss
      cards = document.querySelectorAll('.glass-panel:not(.sidebar):not(.top-nav)');
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
      <Suspense fallback={<RouteFallback />}>
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
        {/* [Reason] Shared campaign links must open without authentication */}
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
      </Route>

      {/* Authenticated Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="business" element={<BusinessDashboard />} />
        <Route path="business/campaigns/new" element={<CreateCampaign />} />
        <Route path="business/campaigns" element={<PublishedCampaigns />} />
        <Route path="influencer" element={<InfluencerDashboard />} />
        <Route path="search-influencers" element={<SearchInfluencers />} />
        {/* [Reason] Avoid /dashboard/influencer/:id so it does not collide with the creator dashboard */}
        <Route path="influencers/:id" element={<InfluencerPublicProfile />} />
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
      </Suspense>
    </>
  )
}

export default App

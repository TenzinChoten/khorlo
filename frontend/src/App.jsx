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
  return (
    <>
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

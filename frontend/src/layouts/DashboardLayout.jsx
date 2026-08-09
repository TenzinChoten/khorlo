import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  Bell, 
  User, 
  LogOut,
  Target,
  CreditCard,
  LayoutList,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role === 'BUSINESS' ? 'brand' : 'creator';
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dummyNotifications = [
    { id: 1, title: 'New Application', message: 'Jane Doe applied to your Smart Home Hub Launch campaign.', time: '2m ago', link: '/dashboard/business' },
    { id: 2, title: 'Campaign Approved', message: 'Your latest campaign was approved and is now live.', time: '1h ago', link: '/dashboard/business' },
    { id: 3, title: 'New Message', message: 'You have a new message from TechNova.', time: '3h ago', link: '/dashboard/messages' }
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
      navigate('/');
    }
  };

  const handleNotificationClick = () => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      navigate('/dashboard/notifications');
      setShowNotifications(false);
    } else {
      setShowNotifications(!showNotifications);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar glass-panel ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-start' }}>
          <img src="/logo.png" alt="Khorlo Logo" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
          <span className="gradient-text">Khorlo</span>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-group">
            <div className="nav-group-title">Main</div>
            <NavLink to={role === 'brand' ? "/dashboard/business" : "/dashboard/influencer"} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"} onClick={() => setIsSidebarOpen(false)}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Discover</div>
            <NavLink to={role === 'brand' ? "/dashboard/search-influencers" : "/dashboard/search-campaigns"} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"} onClick={() => setIsSidebarOpen(false)}>
              <Search size={20} />
              <span>{role === 'brand' ? 'Influencers' : 'Campaigns'}</span>
            </NavLink>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Personal</div>
            <NavLink to="/dashboard/messages" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"} onClick={() => setIsSidebarOpen(false)}>
              <MessageSquare size={20} />
              <span>Messages</span>
            </NavLink>
            <NavLink to="/dashboard/notifications" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"} onClick={() => setIsSidebarOpen(false)}>
              <Bell size={20} />
              <span>Notifications</span>
            </NavLink>
            <NavLink to="/dashboard/profile" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"} onClick={() => setIsSidebarOpen(false)}>
              <User size={20} />
              <span>Profile</span>
            </NavLink>
            {role === 'brand' && (
              <NavLink to="/dashboard/billing" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"} onClick={() => setIsSidebarOpen(false)}>
                <CreditCard size={20} />
                <span>Billing</span>
              </NavLink>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top Navigation */}
        <header className="top-nav glass-panel" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, justifyContent: 'space-between' }}>
          
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="top-nav-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }} ref={notifRef}>
            <Link to="/dashboard/faq" className="faq-btn">
              <MessageSquare size={16} strokeWidth={2.5} />
              FAQs
            </Link>
            <button className="notification-btn" onClick={handleNotificationClick}>
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <Link to="/dashboard/notifications" className="view-all" onClick={() => setShowNotifications(false)}>View All</Link>
                </div>
                <div className="dropdown-body">
                  {dummyNotifications.map(notif => (
                    <Link key={notif.id} to={notif.link} className="notification-item" onClick={() => setShowNotifications(false)}>
                      <div className="notif-title">{notif.title}</div>
                      <div className="notif-message">{notif.message}</div>
                      <div className="notif-time">{notif.time}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-content-inner">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

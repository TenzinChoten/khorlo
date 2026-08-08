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
  LayoutList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role === 'BUSINESS' ? 'brand' : 'creator';
  const [showNotifications, setShowNotifications] = useState(false);
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

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-brand gradient-text">Khorlo</div>
        
        <nav className="sidebar-nav">
          <div className="nav-group">
            <span className="nav-group-title">Main</span>
            {role === 'brand' ? (
              <NavLink to="/dashboard/business" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </NavLink>
            ) : (
              <NavLink to="/dashboard/influencer" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </NavLink>
            )}
          </div>

          <div className="nav-group">
            <span className="nav-group-title">Discover</span>
            {role === 'brand' ? (
              <NavLink to="/dashboard/search-influencers" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <Search size={20} />
                <span>Influencers</span>
              </NavLink>
            ) : (
              <NavLink to="/dashboard/search-campaigns" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <Target size={20} />
                <span>Campaigns</span>
              </NavLink>
            )}
          </div>

          <div className="nav-group">
            <span className="nav-group-title">Personal</span>
            <NavLink to="/dashboard/messages" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <MessageSquare size={20} />
              <span>Messages</span>
            </NavLink>
            <NavLink to="/dashboard/notifications" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <Bell size={20} />
              <span>Notifications</span>
            </NavLink>
            <NavLink to="/dashboard/profile" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <User size={20} />
              <span>Profile</span>
            </NavLink>
            {role === 'brand' && (
              <>
                <NavLink to="/dashboard/business/campaigns" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                  <LayoutList size={20} />
                  <span>Campaigns</span>
                </NavLink>
                <NavLink to="/dashboard/billing" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                  <CreditCard size={20} />
                  <span>Billing</span>
                </NavLink>
              </>
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
        {/* TOP NAV BAR */}
        <div className="top-nav">
          <div className="top-nav-actions" ref={notifRef}>
            <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown glass-panel">
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
        </div>

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

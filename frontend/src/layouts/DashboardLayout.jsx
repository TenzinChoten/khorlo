import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  Bell, 
  User, 
  LogOut,
  CreditCard,
  Menu
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

function formatRelativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function notificationLink(type, role) {
  if (type === 'MESSAGE') return '/dashboard/messages';
  if (type === 'SUBSCRIPTION') return '/dashboard/billing';
  if (role === 'BUSINESS') return '/dashboard/business';
  return '/dashboard/influencer';
}

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role === 'BUSINESS' ? 'brand' : 'creator';
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const loadNotificationPreview = () => {
    // [Reason] Bell badge and dropdown must show real Notification rows, not hardcoded samples
    fetchApi('/notifications/unread-count')
      .then((res) => setUnreadCount(res.count || 0))
      .catch(() => setUnreadCount(0));
    fetchApi('/notifications?limit=5')
      .then((res) => setNotifications(res.notifications || []))
      .catch(() => setNotifications([]));
  };

  const markAllNotificationsRead = async () => {
    // [Reason] Opening the bell means the user has seen the alerts, so the red unread badge should clear
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetchApi('/notifications/read-all', { method: 'PATCH' });
    } catch {
      loadNotificationPreview();
    }
  };

  useEffect(() => {
    if (!user) return;
    loadNotificationPreview();
    const id = setInterval(loadNotificationPreview, 30000);
    const onUpdated = () => loadNotificationPreview();
    window.addEventListener('khorlo:notifications-changed', onUpdated);
    return () => {
      clearInterval(id);
      window.removeEventListener('khorlo:notifications-changed', onUpdated);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
      navigate('/');
    }
  };

  const handleNotificationClick = () => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      markAllNotificationsRead();
      navigate('/dashboard/notifications');
      setShowNotifications(false);
    } else {
      const opening = !showNotifications;
      setShowNotifications(opening);
      if (opening && unreadCount > 0) {
        markAllNotificationsRead();
      }
    }
  };

  const handleNotificationItemClick = async (notif) => {
    setShowNotifications(false);
    if (!notif.isRead) {
      setUnreadCount((count) => Math.max(0, count - 1));
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
      try {
        await fetchApi(`/notifications/${notif.id}/read`, { method: 'PATCH' });
      } catch {
        loadNotificationPreview();
      }
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
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <Link to="/dashboard/notifications" className="view-all" onClick={() => setShowNotifications(false)}>View All</Link>
                </div>
                <div className="dropdown-body">
                  {notifications.length === 0 ? (
                    <div className="notification-item" style={{ cursor: 'default' }}>
                      <div className="notif-message">No notifications yet.</div>
                    </div>
                  ) : notifications.map(notif => (
                    <Link
                      key={notif.id}
                      to={notificationLink(notif.type, user?.role)}
                      className="notification-item"
                      onClick={() => handleNotificationItemClick(notif)}
                    >
                      <div className="notif-title">{notif.title}</div>
                      <div className="notif-message">{notif.body}</div>
                      <div className="notif-time">{formatRelativeTime(notif.createdAt)}</div>
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

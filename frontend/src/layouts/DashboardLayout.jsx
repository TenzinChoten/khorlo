import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  Bell, 
  User, 
  LogOut,
  Target,
  CreditCard
} from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'brand'; // Default to brand if not found

  const handleLogout = () => {
    navigate('/login');
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
                <span>Business Dash</span>
              </NavLink>
            ) : (
              <NavLink to="/dashboard/influencer" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <LayoutDashboard size={20} />
                <span>Influencer Dash</span>
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
              <NavLink to="/dashboard/billing" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
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
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

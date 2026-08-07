import React from 'react';
import { Bell, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

const Notifications = () => {
  const notifications = [
    { id: 1, type: 'message', icon: <MessageSquare size={20} />, title: 'New Message from TechNova', time: '10 mins ago', read: false },
    { id: 2, type: 'application', icon: <CheckCircle size={20} />, title: 'Application Approved: Summer Collection', time: '2 hours ago', read: false },
    { id: 3, type: 'system', icon: <Bell size={20} />, title: 'Your portfolio was viewed 15 times this week', time: '1 day ago', read: true },
    { id: 4, type: 'alert', icon: <AlertCircle size={20} />, title: 'Action Required: Sign Contract for GlowCosmetics', time: '2 days ago', read: true },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Notifications</h1>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.875rem' }}>
          Mark all as read
        </button>
      </div>

      <div className="glass-panel">
        {notifications.map((notif, index) => (
          <div 
            key={notif.id} 
            style={{ 
              padding: '1.5rem', 
              display: 'flex', 
              gap: '1rem', 
              alignItems: 'flex-start',
              borderBottom: index !== notifications.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              background: notif.read ? 'transparent' : 'rgba(255,255,255,0.02)'
            }}
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              color: notif.read ? 'var(--text-secondary)' : 'var(--accent)',
              flexShrink: 0
            }}>
              {notif.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: notif.read ? 500 : 600, marginBottom: '0.25rem', color: notif.read ? 'var(--text-secondary)' : 'white' }}>
                {notif.title}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{notif.time}</p>
            </div>
            {!notif.read && (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', marginTop: '0.5rem' }}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;

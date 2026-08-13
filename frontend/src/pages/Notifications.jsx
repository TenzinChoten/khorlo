import React, { useEffect, useState } from 'react';
import { Bell, MessageSquare, CheckCircle, AlertCircle, Megaphone } from 'lucide-react';
import { fetchApi } from '../lib/api';

function formatRelativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function typeIcon(type) {
  switch (type) {
    case 'MESSAGE': return <MessageSquare size={20} />;
    case 'APPLICATION': return <CheckCircle size={20} />;
    case 'CAMPAIGN': return <Megaphone size={20} />;
    case 'REVIEW': return <CheckCircle size={20} />;
    case 'SUBSCRIPTION': return <AlertCircle size={20} />;
    default: return <Bell size={20} />;
  }
}

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = () => {
    return fetchApi('/notifications?limit=50')
      .then((res) => setNotifications(res.notifications || []))
      .catch((err) => setError(err.message || 'Failed to load notifications'));
  };

  useEffect(() => {
    loadNotifications().finally(() => setLoading(false));
  }, []);

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await fetchApi('/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event('khorlo:notifications-changed'));
    } catch (err) {
      alert(err.message || 'Failed to mark notifications as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleOpen = async (notif) => {
    if (notif.isRead) return;
    try {
      await fetchApi(`/notifications/${notif.id}/read`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
      window.dispatchEvent(new Event('khorlo:notifications-changed'));
    } catch {
      // [Reason] Keep the list usable even if a single read update fails
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Notifications</h1>
        <button
          onClick={handleMarkAll}
          disabled={markingAll || notifications.every((n) => n.isRead)}
          style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.875rem', opacity: markingAll ? 0.6 : 1 }}
        >
          {markingAll ? 'Updating...' : 'Mark all as read'}
        </button>
      </div>

      <div className="glass-panel">
        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading notifications...</div>
        )}
        {error && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#ff3b30' }}>{error}</div>
        )}
        {!loading && !error && notifications.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No notifications yet.
          </div>
        )}
        {notifications.map((notif, index) => (
          <div
            key={notif.id}
            onClick={() => handleOpen(notif)}
            style={{
              padding: '1.5rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              borderBottom: index !== notifications.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              background: notif.isRead ? 'transparent' : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
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
              color: notif.isRead ? 'var(--text-secondary)' : 'var(--accent)',
              flexShrink: 0
            }}>
              {typeIcon(notif.type)}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: notif.isRead ? 500 : 600, marginBottom: '0.25rem', color: notif.isRead ? 'var(--text-secondary)' : 'white' }}>
                {notif.title}
              </h3>
              {notif.body && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{notif.body}</p>
              )}
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatRelativeTime(notif.createdAt)}</p>
            </div>
            {!notif.isRead && (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', marginTop: '0.5rem' }}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;

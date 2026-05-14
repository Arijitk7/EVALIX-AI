import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TYPE_ICONS = { SIGNUP:'🎉', ASSIGNMENT_PUBLISHED:'📋', ASSIGNMENT_REMINDER:'⏰', SUBMISSION_CONFIRMED:'✅', RESULT_PUBLISHED:'🎯', FLAGGED_REVIEW:'🚩', SYSTEM:'⚙️' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/notifications?limit=50`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) { console.error('[Notifs]', err); }
    finally { setLoading(false); }
  };

  const markAllRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${API_URL}/api/notifications/read-all/all`, { method: 'PATCH', headers: { Authorization: `Bearer ${session.access_token}` } });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="flex min-h-screen bg-evalix-gradient">
      <Navbar />
      <div className="main-content p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="heading-lg text-white mb-2">🔔 Notifications</h1>
            <p className="text-slate-400">{unreadCount} unread notifications</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary text-sm">
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="loading-spinner"></div></div>
        ) : notifications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">🔕</div>
            <div className="text-lg font-semibold text-white">No notifications yet</div>
            <div className="text-slate-400 mt-2">You'll be notified about assignments, results, and more</div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div key={n.id} className={`glass-card p-4 flex gap-4 items-start animate-fade-in-up ${!n.is_read ? 'border-blue-500/20' : ''}`}
                   style={{ animationDelay: `${i * 0.03}s` }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${!n.is_read ? 'bg-blue-500/20' : 'bg-slate-700/30'}`}>
                  {TYPE_ICONS[n.type] || '📌'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-white">{n.title}</div>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{n.message}</div>
                  <div className="text-xs text-slate-600 mt-2">
                    {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
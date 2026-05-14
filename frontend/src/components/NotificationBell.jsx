import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('[NotificationBell] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API_URL}/api/notifications/read-all/all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const TYPE_ICONS = {
    SIGNUP: '🎉',
    ASSIGNMENT_PUBLISHED: '📋',
    ASSIGNMENT_REMINDER: '⏰',
    SUBMISSION_CONFIRMED: '✅',
    RESULT_PUBLISHED: '🎯',
    FLAGGED_REVIEW: '🚩',
    SYSTEM: '⚙️',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen(prev => !prev); if (!open) fetchNotifications(); }}
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-blue-900/30 transition-colors"
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 bottom-12 w-80 glass-card p-0 overflow-hidden z-50 shadow-2xl"
             style={{ border: '1px solid rgba(96,165,250,0.2)' }}>
          <div className="flex items-center justify-between p-3 border-b border-blue-900/30">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`p-3 border-b border-blue-900/20 cursor-pointer hover:bg-blue-900/20 transition-colors ${!n.is_read ? 'bg-blue-900/10' : ''}`}
                >
                  <div className="flex gap-2 items-start">
                    <span className="text-base flex-shrink-0">{TYPE_ICONS[n.type] || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{n.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-blue-900/30">
            <button 
              onClick={() => { navigate('/student/notifications'); setOpen(false); }}
              className="w-full text-xs text-blue-400 hover:text-blue-300 py-1 text-center"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
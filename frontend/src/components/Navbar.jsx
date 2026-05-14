import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import logo from '../assets/pod5.png';

const teacherLinks = [
  { path: '/teacher-dashboard', label: 'Dashboard', icon: '⬛' },
  { path: '/teacher/assignments/new', label: 'Create Assignment', icon: '✏️' },
  { path: '/teacher/flagged', label: 'Flagged Reviews', icon: '🚩' },
  { path: '/teacher/generate-questions', label: 'AI Question Generator', icon: '🤖' },
  { path: '/teacher/analytics', label: 'Analytics', icon: '📊' },
];

const studentLinks = [
  { path: '/student-dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/student/analytics', label: 'My Analytics', icon: '📈' },
  { path: '/student/notifications', label: 'Notifications', icon: '🔔' },
];

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // theme sync
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('evalix-theme') || 'dark';
  });

  useEffect(() => {
    // Apply the theme attribute to the root element for CSS selectors to work
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('evalix-theme', theme);
  }, [theme]);

  const links = role === 'TEACHER' ? teacherLinks : studentLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="p-5 border-b border-blue-900/30 flex items-center gap-3.5 relative overflow-hidden">
        {/* Subtle background ambient backlighting */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#c77c3a]/5 to-transparent pointer-events-none" />
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#c77c3a] to-[#3b82f6] animate-pulse-glow opacity-75 blur-[3px]" />
          <img src={logo} alt="EVALIX AI" className="relative w-10 h-10 rounded-xl object-cover border border-white/10 shadow-lg transform transition-transform duration-300 hover:scale-105" />
        </div>
        <div className="relative z-10">
          <div className="font-bold text-base leading-tight heading-md" style={{ color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
            EVALIX <span className="text-gradient-copper">AI</span>
          </div>
          <div className="text-xs text-slate-500">Academic Intelligence</div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 pt-4">
        <div className={`badge ${role === 'TEACHER' ? 'badge-copper' : 'badge-blue'} text-xs w-full justify-center py-2`}>
          {role === 'TEACHER' ? '👨‍🏫 Teacher Portal' : '🎓 Student Portal'}
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Info + Notification Bell + Theme Toggle */}
      <div className="border-t border-blue-900/30 p-4">
        <div className="flex items-center gap-3 mb-3">
          {user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Avatar" 
              className="w-9 h-9 rounded-full object-cover border-2 border-blue-500/30"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-sm font-bold text-white">
              {(user?.user_metadata?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
              {user?.user_metadata?.name || 'User'}
            </div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
          </div>
          <NotificationBell />
        </div>

        {/* Action Buttons Row */}
        <div className="flex gap-2">
          <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="btn-secondary flex-1 text-xs py-2 justify-center"
            title="Toggle Theme"
            style={{ padding: '8px 4px' }}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button 
            onClick={handleLogout}
            className="btn-secondary flex-1 text-xs py-2 justify-center"
            style={{ padding: '8px 4px', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

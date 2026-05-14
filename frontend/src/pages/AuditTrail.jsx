import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ACTION_CONFIG = {
  AI_GRADED:         { icon: '🤖', label: 'AI Graded',          color: '#3b82f6' },
  TEACHER_OVERRIDDEN:{ icon: '✏️', label: 'Teacher Override',   color: '#f59e0b' },
  TEACHER_APPROVED:  { icon: '✅', label: 'Teacher Approved',    color: '#10b981' },
  TEACHER_REJECTED:  { icon: '❌', label: 'Teacher Rejected',    color: '#ef4444' },
  VIVA_GENERATED:    { icon: '🎤', label: 'Viva Generated',      color: '#d97706' },
  RESULT_PUBLISHED:  { icon: '📣', label: 'Result Published',    color: '#059669' },
};

export default function AuditTrail() {
  const { submissionId } = useParams();
  const [trail, setTrail] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${API_URL}/api/audit/${submissionId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        setTrail(data.trail || []);
      } catch (err) { console.error('[AuditTrail]', err); }
      finally { setLoading(false); }
    };
    if (submissionId) load();
  }, [submissionId]);

  return (
    <div className="flex min-h-screen bg-evalix-gradient">
      <Navbar />
      <div className="main-content p-8">
        <div className="mb-8">
          <h1 className="heading-lg text-white mb-2">🔍 Audit Trail</h1>
          <p className="text-slate-400">Complete history of every action on this submission</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="loading-spinner"></div></div>
        ) : trail.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <div className="text-lg font-semibold text-white">No Audit Entries Yet</div>
          </div>
        ) : (
          <div className="glass-card p-6">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent"></div>
              <div className="space-y-6">
                {trail.map((entry, i) => {
                  const cfg = ACTION_CONFIG[entry.action] || { icon: '📌', label: entry.action, color: '#64748b' };
                  return (
                    <div key={entry.id} className="flex gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 z-10 relative"
                           style={{ background: cfg.color + '20', border: `2px solid ${cfg.color}50` }}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 glass-card-sm p-4">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div>
                            <div className="text-sm font-semibold text-white">{cfg.label}</div>
                            <div className="text-xs text-slate-500 mt-0.5">by {entry.actor?.name} ({entry.actor?.role})</div>
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(entry.created_at).toLocaleString('en-IN')}
                          </div>
                        </div>
                        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                          <div className="mt-2 p-2 rounded bg-navy-900/50 border border-blue-900/30 text-xs font-mono">
                            {Object.entries(entry.metadata).map(([k, v]) => (
                              <div key={k}><span className="text-blue-400">{k}:</span> <span className="text-slate-300">{String(v)}</span></div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AnalyticsDashboard() {
  const { role } = useAuth();
  const { assignmentId } = useParams(); // for teacher; for student we use auth user
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const url = role === 'TEACHER'
          ? `${API_URL}/api/analytics/teacher/${assignmentId}`
          : `${API_URL}/api/analytics/student/${user.id}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('[Analytics] Load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assignmentId, role, user?.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-evalix-gradient">
        <Navbar />
        <div className="main-content flex items-center justify-center">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-evalix-gradient">
      <Navbar />
      <div className="main-content p-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="heading-lg text-white mb-2">
            📊 {role === 'TEACHER' ? 'Assignment Analytics' : 'My Learning Analytics'}
          </h1>
          <p className="text-slate-400">
            {role === 'TEACHER' ? 'Class performance insights and integrity alerts' : 'Track your progress and weak areas'}
          </p>
        </div>

        {/* TEACHER ANALYTICS */}
        {role === 'TEACHER' && data && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
              {[
                { label: 'Total Students', value: data.summary.totalStudents, icon: '👥', cls: 'badge-blue' },
                { label: 'Average Score', value: `${data.summary.avgScore}/${data.summary.totalMaxMarks}`, icon: '📈', cls: 'badge-green' },
                { label: 'Flagged Reviews', value: data.summary.flaggedCount, icon: '🚩', cls: data.summary.flaggedCount > 0 ? 'badge-red' : 'badge-gray' },
                { label: 'Plagiarism Alerts', value: data.summary.plagiarismAlerts, icon: '⚠️', cls: data.summary.plagiarismAlerts > 0 ? 'badge-yellow' : 'badge-gray' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>
                    {s.value}
                  </div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Score Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 animate-fade-in-up stagger-2">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Score Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={Object.entries(data.scoreDistribution).map(([range, count]) => ({ range, count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(96,165,250,0.1)" />
                    <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#0f2040', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Leaderboard */}
              <div className="glass-card p-6 animate-fade-in-up stagger-3">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">🏆 Leaderboard</h3>
                <div className="space-y-2">
                  {(data.leaderboard || []).slice(0, 6).map((entry, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 w-5">{i + 1}</span>
                        <span className="text-sm text-slate-300">{entry.name}</span>
                      </div>
                      <span className="badge badge-blue">{entry.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Analytics */}
            <div className="glass-card p-6 animate-fade-in-up stagger-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Per-Question Difficulty</h3>
              <div className="space-y-4">
                {(data.questionAnalytics || []).map((q, i) => (
                  <div key={i} className="glass-card-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300 truncate flex-1 mr-4">Q{i + 1}: {q.questionText}...</span>
                      <div className="flex gap-2 flex-shrink-0">
                        <span className="badge badge-blue">Avg: {q.avgScore}/{q.maxMarks}</span>
                        <span className={`badge ${q.difficultyPercent > 60 ? 'badge-red' : q.difficultyPercent > 40 ? 'badge-yellow' : 'badge-green'}`}>
                          {q.difficultyPercent}% Difficulty
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ 
                        width: `${q.maxMarks > 0 ? (q.avgScore / q.maxMarks) * 100 : 0}%`,
                        background: q.difficultyPercent > 60 ? '#ef4444' : q.difficultyPercent > 40 ? '#f59e0b' : '#10b981',
                      }}></div>
                    </div>
                    {q.topMissingConcepts?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-xs text-slate-500">Missing: </span>
                        {q.topMissingConcepts.map((c, j) => (
                          <span key={j} className="badge badge-yellow text-xs">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STUDENT ANALYTICS */}
        {role === 'STUDENT' && data && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in-up">
              {[
                { label: 'Submissions', value: data.totalSubmissions, icon: '📝' },
                { label: 'Avg Score', value: data.avgScore?.toFixed(1), icon: '⭐' },
                { label: 'Weak Topics', value: data.topWeakTopics?.length, icon: '📚' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Score Trend */}
            {data.trend?.length > 0 && (
              <div className="glass-card p-6 animate-fade-in-up stagger-2">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">📈 Score Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(96,165,250,0.1)" />
                    <XAxis dataKey="title" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0f2040', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Weak Topics */}
            {data.topWeakTopics?.length > 0 && (
              <div className="glass-card p-6 animate-fade-in-up stagger-3">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">🎯 Areas to Improve</h3>
                <div className="space-y-3">
                  {data.topWeakTopics.map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm flex-1">{t.topic}</span>
                      <span className="badge badge-red">{t.count}x missed</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
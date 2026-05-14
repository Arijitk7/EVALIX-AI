import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PlagiarismBadge from '../components/PlagiarismBadge';
import ConfidenceBadge from '../components/ConfidenceBadge';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FLAG_TABS = [
  { key: '', label: 'All Flagged' },
  { key: 'PLAGIARISM', label: '🔴 Plagiarism' },
  { key: 'LOW_CONFIDENCE', label: '⚠️ Low Confidence' },
  { key: 'AI_DISAGREEMENT', label: '🤖 AI Disagreement' },
  { key: 'OCR_UNCERTAIN', label: '📷 OCR Uncertain' },
  { key: 'AI_GENERATED_TEXT', label: '🤖 AI-Generated' },
];

export default function FlaggedSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  const load = async (tab = activeTab, pg = page) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const params = new URLSearchParams({ page: pg });
      if (tab) params.set('flagReason', tab);
      
      const res = await fetch(`${API_URL}/api/teacher/flagged?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setSubmissions(data.flaggedSubmissions || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('[Flagged] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeTab, page]);

  const approveAnswer = async (submissionId, answerId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API_URL}/api/teacher/submissions/${submissionId}/answers/${answerId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      toast.success('AI decision approved');
      load();
    } catch { toast.error('Failed to approve'); }
  };

  const rejectAnswer = async (submissionId, answerId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API_URL}/api/teacher/submissions/${submissionId}/answers/${answerId}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Flagged for manual review' }),
      });
      toast.success('Flagged for manual review');
      load();
    } catch { toast.error('Failed to reject'); }
  };

  return (
    <div className="flex min-h-screen bg-evalix-gradient">
      <Navbar />
      <div className="main-content p-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="heading-lg text-white mb-2">🚩 Flagged Submissions</h1>
          <p className="text-slate-400">Human-in-the-Loop review queue — AI needs your oversight</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FLAG_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key 
                  ? 'bg-blue-600 text-white' 
                  : 'glass-card-sm text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-4">✅</div>
            <div className="text-lg font-semibold text-white">No Flagged Submissions</div>
            <div className="text-slate-400 mt-2">All submissions are clear for this filter</div>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub, si) => (
              <div key={sub.id} className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: `${si * 0.05}s` }}>
                {/* Submission Header */}
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {sub.student?.name || 'Unknown Student'}
                    </div>
                    <div className="text-xs text-slate-500">{sub.student?.email}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      📋 {sub.assignment?.title} · {sub.assignment?.subject}
                    </div>
                  </div>
                  <Link 
                    to={`/teacher/submissions/${sub.id}`}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Full Review →
                  </Link>
                </div>

                {/* Flagged Answers */}
                <div className="space-y-3">
                  {(sub.answers || []).map((ans, ai) => (
                    <div key={ans.id} className="glass-card-sm p-4">
                      <div className="text-xs text-slate-400 mb-2 truncate">
                        Q: {ans.question?.question_text?.substring(0, 80)}...
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="badge badge-red">
                          🚩 {ans.flag_reason?.replace(/_/g, ' ')}
                        </span>
                        <ConfidenceBadge score={ans.confidence_score} />
                        <PlagiarismBadge riskLevel={ans.risk_level} score={ans.plagiarism_score} />
                        {ans.gemini_score !== null && ans.llama_score !== null && (
                          <span className="badge badge-copper" style={{ background: 'rgba(199,124,58,0.15)', color: '#e8b280', border: '1px solid rgba(199,124,58,0.3)' }}>
                            Gemini: {ans.gemini_score?.toFixed(1)} | Llama: {ans.llama_score?.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => approveAnswer(sub.id, ans.id)}
                          className="btn-success text-xs py-2 px-4"
                        >
                          ✅ Approve AI
                        </button>
                        <button
                          onClick={() => rejectAnswer(sub.id, ans.id)}
                          className="btn-danger text-xs py-2 px-4"
                        >
                          ❌ Reject
                        </button>
                        <Link
                          to={`/teacher/submissions/${sub.id}`}
                          className="btn-secondary text-xs py-2 px-4"
                        >
                          Override Score
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary text-sm py-2 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-slate-400 text-sm flex items-center">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary text-sm py-2 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
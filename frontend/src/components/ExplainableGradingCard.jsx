import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ConfidenceBadge from './ConfidenceBadge';
import PlagiarismBadge from './PlagiarismBadge';

/**
 * ExplainableGradingCard — Full explainable AI grading display
 * Shows: score, strengths, weaknesses, missing concepts, mark breakdown, improvement suggestions
 */
export default function ExplainableGradingCard({ answer, question, showViva = false }) {
  const { 
    score, 
    gemini_score, 
    llama_score,
    confidence_score,
    plagiarism_score,
    risk_level,
    ai_generated,
    strengths, 
    weaknesses, 
    missing_concepts, 
    improvement_suggestions,
    mark_breakdown,
    ai_feedback,
    teacher_feedback,
    teacher_approved,
    viva_questions,
    is_flagged,
    flag_reason,
    self_verified,
  } = answer;

  const maxMarks = question?.max_marks || 0;
  const scorePercent = maxMarks > 0 ? Math.round((score / maxMarks) * 100) : 0;
  const scoreColor = scorePercent >= 80 ? '#10b981' : scorePercent >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-4">
      {/* Score Overview */}
      <div className="glass-card p-5">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Score Awarded</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold" style={{ color: scoreColor, fontFamily: 'Space Grotesk' }}>
                {score ?? '—'}
              </span>
              <span className="text-slate-400 text-lg">/ {maxMarks}</span>
            </div>
            <div className="progress-bar mt-2 w-48">
              <div className="progress-fill" style={{ width: `${scorePercent}%`, background: scoreColor }}></div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            <ConfidenceBadge score={confidence_score} />
            <PlagiarismBadge riskLevel={risk_level} score={plagiarism_score} aiGenerated={ai_generated} />
            {is_flagged && (
              <span className="badge badge-red">
                🚩 Flagged: {flag_reason?.replace(/_/g, ' ')}
              </span>
            )}
            {self_verified && (
              <span className="badge badge-blue">✓ Self-Verified</span>
            )}
            {teacher_approved === true && (
              <span className="badge badge-green">👨‍🏫 Teacher Approved</span>
            )}
          </div>
        </div>

        {/* Dual AI Scores */}
        {(gemini_score !== null && gemini_score !== undefined) && (
          <div className="border-t border-blue-900/30 pt-3 mt-3">
            <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Dual AI Consensus</div>
            <div className="flex gap-4">
              <div className="text-sm">
                <span className="text-slate-500">Gemini: </span>
                <span className="text-blue-400 font-semibold">{gemini_score?.toFixed(1)}</span>
              </div>
              {llama_score !== null && llama_score !== undefined && (
                <div className="text-sm">
                  <span className="text-slate-500">Llama: </span>
                  <span className="text-copper-400 font-semibold" style={{ color: '#e8b280' }}>{llama_score?.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mark Breakdown */}
      {mark_breakdown && Array.isArray(mark_breakdown) && mark_breakdown.length > 0 && (
        <div className="glass-card p-5">
          <div className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            📊 Mark Breakdown
          </div>
          <div className="space-y-2">
            {mark_breakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{item.item}</span>
                <div className="flex items-center gap-2">
                  <div className="progress-bar w-24">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${item.max > 0 ? (item.awarded / item.max) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-white w-16 text-right">
                    {item.awarded}/{item.max}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strengths && Array.isArray(strengths) && strengths.length > 0 && (
          <div className="glass-card p-4">
            <div className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              ✅ Strengths
            </div>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {weaknesses && Array.isArray(weaknesses) && weaknesses.length > 0 && (
          <div className="glass-card p-4">
            <div className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              ❌ Weaknesses
            </div>
            <ul className="space-y-2">
              {weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">−</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Missing Concepts */}
      {missing_concepts && Array.isArray(missing_concepts) && missing_concepts.length > 0 && (
        <div className="glass-card p-4">
          <div className="text-sm font-semibold text-amber-400 mb-3">⚠️ Missing Concepts</div>
          <div className="flex flex-wrap gap-2">
            {missing_concepts.map((c, i) => (
              <span key={i} className="badge badge-yellow">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Suggestions */}
      {improvement_suggestions && Array.isArray(improvement_suggestions) && improvement_suggestions.length > 0 && (
        <div className="glass-card p-4">
          <div className="text-sm font-semibold text-blue-400 mb-3">📈 How to Improve</div>
          <ul className="space-y-2">
            {improvement_suggestions.map((s, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2">
                <span className="text-blue-400 flex-shrink-0">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Feedback Markdown */}
      {ai_feedback && (
        <div className="glass-card p-4">
          <div className="text-sm font-semibold text-slate-300 mb-3">🤖 AI Detailed Feedback</div>
          <div className="feedback-markdown text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {ai_feedback}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Teacher Feedback */}
      {teacher_feedback && (
        <div className="glass-card p-4 border border-amber-500/20">
          <div className="text-sm font-semibold text-amber-400 mb-2">👨‍🏫 Teacher Feedback</div>
          <p className="text-sm text-slate-300">{teacher_feedback}</p>
        </div>
      )}

      {/* Viva Questions */}
      {showViva && viva_questions && Array.isArray(viva_questions) && viva_questions.length > 0 && (
        <div className="glass-card p-4 border border-purple-500/20">
          <div className="text-sm font-semibold text-purple-400 mb-3">🎤 AI Viva Copilot — Suggested Questions</div>
          <ol className="space-y-2">
            {viva_questions.map((q, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-3">
                <span className="text-purple-400 font-bold flex-shrink-0">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
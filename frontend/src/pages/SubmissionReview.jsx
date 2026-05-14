import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Bot,
  User,
  CheckCircle2,
  FileText,
  Save,
  Edit3,
  BrainCircuit,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ─── Styles ─── */
const injectStyles = () => {
  if (document.getElementById("sr-styles")) return;
  const s = document.createElement("style");
  s.id = "sr-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --brand:      #D85A30;
      --brand-dim:  #993C1D;
      --brand-glow: rgba(216,90,48,.2);
      --brand-g2:   rgba(216,90,48,.07);
      --brand-g3:   rgba(216,90,48,.12);
      --bg-base:    #131210;
      --bg-panel:   #1A1917;
      --bg-card:    #201F1D;
      --bg-hover:   #272523;
      --border:     #2E2D2A;
      --border-hi:  #403E3A;
      --txt-1:      #F5F3EE;
      --txt-2:      #C8C5BC;
      --txt-3:      #7A7870;
      --emerald:    #34d399;
      --emerald-g:  rgba(52,211,153,.1);
      --emerald-b:  rgba(52,211,153,.2);
      --amber:      #f59e0b;
      --r-lg:       14px;
      --r-md:       10px;
      --r-sm:       7px;
      --tx:         220ms cubic-bezier(.4,0,.2,1);
    }
    *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0 }
    body { font-family: 'DM Sans', sans-serif; background: var(--bg-base); color: var(--txt-1); -webkit-font-smoothing: antialiased }
    ::-webkit-scrollbar { width: 4px; height: 4px }
    ::-webkit-scrollbar-track { background: transparent }
    ::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 99px }
    @keyframes spin { to { transform: rotate(360deg) } }
    @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }

    /* ── Header ── */
    .sr-header {
      position: sticky; top: 0; z-index: 30;
      background: var(--bg-panel);
      border-bottom: 1px solid var(--border);
      height: 64px;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 28px;
      gap: 16px;
    }
    .sr-header-left { display: flex; align-items: center; gap: 14px; min-width: 0 }
    .sr-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0 }
    .sr-brand-ring {
      width: 34px; height: 34px; border-radius: 50%;
      border: 2px solid var(--brand);
      background: var(--brand-g2);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 10px var(--brand-glow);
      flex-shrink: 0;
    }
    .sr-brand-name {
      font-family: 'Syne', sans-serif; font-weight: 800;
      font-size: 15px; letter-spacing: .06em; color: #fff;
    }
    .sr-brand-name span { color: var(--brand) }
    .sr-divider { color: var(--border-hi); font-size: 18px; margin: 0 2px; flex-shrink: 0 }
    .sr-page-title {
      font-family: 'Syne', sans-serif; font-size: 16px;
      font-weight: 700; color: #fff; letter-spacing: -.01em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .sr-page-sub { font-size: 11px; color: var(--txt-3); margin-top: 1px }
    .sr-back-btn {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: var(--r-sm);
      border: 1px solid var(--border);
      background: transparent; color: var(--txt-2);
      cursor: pointer; transition: all var(--tx); flex-shrink: 0;
    }
    .sr-back-btn:hover { color: #fff; border-color: var(--border-hi); background: var(--bg-hover) }
    .sr-n8n-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: var(--r-sm);
      border: 1px solid rgba(52,211,153,.3);
      background: rgba(52,211,153,.08); color: var(--emerald);
      font-size: 12px; font-weight: 700; font-family: 'Syne', sans-serif;
      cursor: pointer; transition: all var(--tx); flex-shrink: 0;
    }
    .sr-n8n-btn:hover:not(:disabled) { background: rgba(52,211,153,.15); border-color: var(--emerald); color: #fff }
    .sr-n8n-btn:disabled { opacity: .5; cursor: not-allowed }

    /* ── Header right score/status ── */
    .sr-header-right { display: flex; align-items: center; gap: 20px; flex-shrink: 0 }
    .sr-score-block { text-align: right }
    .sr-score-label {
      font-size: 10px; color: var(--txt-3); text-transform: uppercase;
      letter-spacing: .1em; font-weight: 600; margin-bottom: 2px;
    }
    .sr-score-value {
      font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: var(--brand);
    }
    .sr-score-max { font-size: 13px; color: var(--txt-2); font-weight: 400 }
    .sr-divider-line {
      width: 1px; height: 36px; background: var(--border-hi); flex-shrink: 0;
    }
    .sr-status-block { text-align: right }
    .sr-status-label {
      font-size: 10px; color: var(--txt-3); text-transform: uppercase;
      letter-spacing: .1em; font-weight: 600; margin-bottom: 2px;
    }
    .sr-badge-graded {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 12px; font-weight: 600; color: var(--emerald);
    }
    .sr-badge-review {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 12px; font-weight: 600; color: var(--amber);
    }

    /* ── Loading / Empty ── */
    .sr-center {
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 14px; color: var(--txt-3);
    }
    .sr-center-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: var(--txt-2) }

    /* ── Main ── */
    .sr-main {
      max-width: 1200px; margin: 0 auto;
      padding: 28px 28px 80px;
      display: flex; flex-direction: column; gap: 20px;
    }

    /* ── Answer Card ── */
    .sr-answer-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      overflow: hidden;
      animation: fadeUp .3s ease forwards;
    }

    /* Question header */
    .sr-q-head {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
      padding: 18px 22px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-panel);
    }
    .sr-q-head-left { display: flex; gap: 14px; align-items: flex-start }
    .sr-q-num {
      width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
      background: var(--bg-card); border: 1px solid var(--border-hi);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: var(--brand);
    }
    .sr-q-chip {
      display: inline-block; padding: 2px 8px;
      background: var(--bg-hover); border: 1px solid var(--border-hi);
      border-radius: 4px; font-size: 10px; font-weight: 700;
      color: var(--txt-3); letter-spacing: .1em; text-transform: uppercase;
      margin-bottom: 6px; font-family: 'Syne', sans-serif;
    }
    .sr-q-text { font-size: 14.5px; color: var(--txt-1); line-height: 1.65; font-weight: 500 }
    .sr-q-marks {
      font-size: 12px; font-weight: 600; color: var(--txt-2);
      flex-shrink: 0; white-space: nowrap;
    }

    /* Two-col body */
    .sr-body-grid {
      display: grid; grid-template-columns: 1fr 1fr;
    }
    .sr-col-left {
      padding: 22px; border-right: 1px solid var(--border);
      background: var(--bg-card);
    }
    .sr-col-right {
      padding: 22px; background: var(--bg-panel);
      display: flex; flex-direction: column;
    }

    /* Section labels */
    .sr-section-label {
      display: flex; align-items: center; gap: 7px;
      font-size: 10.5px; font-weight: 700; color: var(--txt-3);
      letter-spacing: .1em; text-transform: uppercase;
      margin-bottom: 14px;
    }

    /* OCR text box */
    .sr-ocr-box {
      padding: 14px 16px;
      background: var(--bg-panel); border: 1px solid var(--border-hi);
      border-radius: var(--r-md);
      font-size: 13.5px; color: var(--txt-2); font-style: italic; line-height: 1.65;
    }
    /* File link */
    .sr-file-link {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px;
      background: var(--bg-panel); border: 1px solid var(--border-hi);
      border-radius: var(--r-md);
      text-decoration: none; transition: border-color var(--tx);
      margin-top: 10px;
    }
    .sr-file-link:hover { border-color: var(--brand) }
    .sr-file-icon {
      padding: 8px; background: var(--bg-card); border-radius: 7px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sr-file-title { font-size: 13.5px; font-weight: 600; color: var(--txt-1) }
    .sr-file-sub { font-size: 11px; color: var(--txt-3); margin-top: 2px }

    /* AI score badge */
    .sr-ai-score-badge {
      padding: 4px 12px; border-radius: 6px;
      font-size: 11.5px; font-weight: 700; font-family: 'Syne', sans-serif;
      border: 1px solid; transition: all var(--tx);
    }
    .sr-ai-score-active { background: var(--emerald-g); border-color: var(--emerald-b); color: var(--emerald) }
    .sr-ai-score-struck { background: var(--bg-hover); border-color: var(--border-hi); color: var(--txt-3); text-decoration: line-through }

    /* AI feedback box */
    .sr-ai-box {
      padding: 14px 16px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--r-md);
      font-size: 13.5px; color: var(--txt-2); line-height: 1.65;
    }

    /* Divider */
    .sr-divider-h { width: 100%; height: 1px; background: var(--border); margin: 18px 0 }

    /* HITL block */
    .sr-hitl-head {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
    }
    .sr-override-link {
      font-size: 12px; font-weight: 600; color: var(--brand);
      background: none; border: none; cursor: pointer; padding: 0;
      transition: color var(--tx);
    }
    .sr-override-link:hover { color: var(--brand-dim) }

    /* Override form */
    .sr-override-form { display: flex; flex-direction: column; gap: 12px }
    .sr-override-row { display: flex; align-items: flex-end; gap: 12px }
    .sr-field { display: flex; flex-direction: column; gap: 5px }
    .sr-field-label {
      font-size: 10px; font-weight: 700; color: var(--txt-3);
      letter-spacing: .1em; text-transform: uppercase;
    }
    .sr-input {
      padding: 8px 12px;
      background: var(--bg-card); border: 1px solid var(--border-hi);
      border-radius: var(--r-sm); color: var(--txt-1);
      font-size: 13.5px; font-family: 'DM Sans', sans-serif;
      outline: none; transition: border-color var(--tx);
    }
    .sr-input:focus { border-color: var(--brand) }
    .sr-input-wide { flex: 1 }
    .sr-input-score { width: 80px; text-align: center }

    /* Override action buttons */
    .sr-save-btn {
      display: flex; align-items: center; gap: 7px;
      padding: 8px 18px; border-radius: var(--r-sm);
      background: var(--brand); border: none;
      color: #fff; font-size: 13px; font-weight: 700;
      font-family: 'Syne', sans-serif;
      cursor: pointer; transition: background var(--tx), opacity var(--tx);
    }
    .sr-save-btn:hover { background: var(--brand-dim) }
    .sr-save-btn:disabled { opacity: .4; cursor: not-allowed }
    .sr-cancel-btn {
      padding: 8px 14px; border-radius: var(--r-sm);
      background: transparent; border: none;
      color: var(--txt-2); font-size: 13px; font-weight: 600;
      font-family: 'DM Sans', sans-serif; cursor: pointer;
      transition: color var(--tx);
    }
    .sr-cancel-btn:hover { color: var(--txt-1) }

    /* Override result chip */
    .sr-override-result {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; border-radius: var(--r-md);
      border: 1px solid;
    }
    .sr-override-result-active {
      background: var(--brand-g3); border-color: rgba(216,90,48,.25);
    }
    .sr-override-result-ai {
      background: var(--bg-card); border-color: var(--border);
    }
    .sr-override-result-name {
      font-size: 13px; font-weight: 600; margin-bottom: 2px;
    }
    .sr-override-result-name-active { color: var(--brand) }
    .sr-override-result-name-ai { color: var(--txt-2) }
    .sr-override-feedback { font-size: 12px; color: var(--txt-3); margin-top: 2px }
    .sr-override-score {
      font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: var(--txt-1);
    }
    .sr-override-score-dim { font-size: 13px; font-weight: 400; color: var(--txt-3) }

    .sr-btn-row { display: flex; align-items: center; gap: 8px }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .sr-body-grid { grid-template-columns: 1fr }
      .sr-col-left { border-right: none; border-bottom: 1px solid var(--border) }
    }
    @media (max-width: 640px) {
      .sr-header { padding: 0 16px; height: 56px }
      .sr-page-sub { display: none }
      .sr-main { padding: 16px 14px 80px }
      .sr-score-block { display: none }
      .sr-divider-line { display: none }
      .sr-override-row { flex-direction: column; align-items: stretch }
      .sr-input-score { width: 100% }
    }
  `;
  document.head.appendChild(s);
};

/* ─── Component ─── */
const SubmissionReview = () => {
  injectStyles();
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [isTriggeringN8n, setIsTriggeringN8n] = useState(false);

  const triggerN8nAgent = async () => {
    setIsTriggeringN8n(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${API_URL}/api/teacher/submissions/${submissionId}/trigger-n8n`,
        { method: "POST", headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to trigger n8n grading agent.");
      }
      toast.success("n8n grading agent triggered successfully!");
      setSubmission(prev => prev ? { ...prev, status: "UNDER_REVIEW" } : null);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Could not trigger n8n grading agent.");
    } finally {
      setIsTriggeringN8n(false);
    }
  };

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error("Authentication error.");
        const response = await fetch(`${API_URL}/api/teacher/submissions/${submissionId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) {
          if (response.status === 404) throw new Error("Submission not found.");
          throw new Error("Failed to load submission data.");
        }
        const json = await response.json();
        if (json.submission) {
          const calculatedMaxScore = (json.submission.answers || []).reduce(
            (sum, ans) => sum + (ans.question?.max_marks || 0), 0
          );
          setSubmission({ ...json.submission, student_name: json.submission.student?.name || "Unknown Student", max_score: calculatedMaxScore });
          setAnswers(json.submission.answers || []);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Could not load the submission.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  const handleOverrideChange = (answerId, field, value) => {
    setOverrides((prev) => ({ ...prev, [answerId]: { ...prev[answerId], [field]: value } }));
  };

  const initOverride = (answer) => {
    if (!overrides[answer.id]) {
      setOverrides((prev) => ({ ...prev, [answer.id]: { score: answer.score ?? 0, feedback: answer.teacher_feedback ?? "" } }));
    }
  };

  const submitOverride = async (answerId, maxMarks) => {
    const overrideData = overrides[answerId];
    if (!overrideData) return;
    if (overrideData.score < 0 || overrideData.score > maxMarks)
      return toast.error(`Score must be between 0 and ${maxMarks}.`);
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const payload = { newScore: Number(overrideData.score), teacherFeedback: overrideData.feedback };
      const response = await fetch(
        `${API_URL}/api/teacher/submissions/${submissionId}/answers/${answerId}/override`,
        { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify(payload) }
      );
      if (!response.ok) throw new Error("Failed to save override.");
      const json = await response.json();
      toast.success("Score updated successfully!");
      setAnswers((prev) => prev.map((ans) => ans.id === answerId ? { ...ans, score: payload.newScore, teacher_feedback: payload.teacherFeedback } : ans));
      if (json.newTotalScore !== undefined) setSubmission((prev) => ({ ...prev, total_score: json.newTotalScore }));
      setOverrides((prev) => { const n = { ...prev }; delete n[answerId]; return n; });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update the score.");
    } finally {
      setIsSaving(false);
    }
  };

  const isImage = (url) => url && url.match(/\.(jpeg|jpg|gif|png)$/i) != null;

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)" }} className="sr-center">
        <Loader2 size={36} color="var(--brand)" style={{ animation: "spin 1s linear infinite" }} />
        <span className="sr-center-title">Loading submission & AI insights…</span>
      </div>
    );
  }

  if (!submission) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--txt-1)", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ── */}
      <header className="sr-header">
        <div className="sr-header-left">
          <div className="sr-brand">
            <div className="sr-brand-ring"><BrainCircuit size={16} color="var(--brand)" /></div>
            <span className="sr-brand-name">EVALIX <span>AI</span></span>
          </div>
          <span className="sr-divider">·</span>
          <div style={{ minWidth: 0 }}>
            <div className="sr-page-title">Review: {submission.student_name}</div>
            <div className="sr-page-sub">Submission #{submission.id.substring(0, 8)}</div>
          </div>
        </div>

        <div className="sr-header-right">
          <div className="sr-score-block">
            <div className="sr-score-label">Final Score</div>
            <div className="sr-score-value">
              {submission.total_score}
              <span className="sr-score-max"> / {submission.max_score}</span>
            </div>
          </div>
          <div className="sr-divider-line" />
          <div className="sr-status-block">
            <div className="sr-score-label">Status</div>
            {submission.status === "GRADED" ? (
              <div className="sr-badge-graded"><CheckCircle2 size={14} /> Finalized</div>
            ) : (
              <div className="sr-badge-review"><AlertCircle size={14} /> Needs Review</div>
            )}
          </div>
          <button
            onClick={triggerN8nAgent}
            disabled={isTriggeringN8n}
            className="sr-n8n-btn"
            title="Handover to external n8n workflow"
          >
            {isTriggeringN8n ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Bot size={13} />}
            Trigger n8n Agent
          </button>
          <button className="sr-back-btn" onClick={() => navigate(-1)} title="Go back">
            <ArrowLeft size={16} />
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="sr-main">
        {answers.map((answer, index) => {
          const finalScore = answer.score ?? 0;
          const isOverridden = !!answer.teacher_feedback;
          const isEditing = overrides[answer.id] !== undefined;

          return (
            <div key={answer.id} className="sr-answer-card" style={{ animationDelay: `${index * 60}ms` }}>

              {/* Question header */}
              <div className="sr-q-head">
                <div className="sr-q-head-left">
                  <div className="sr-q-num">{index + 1}</div>
                  <div>
                    <div className="sr-q-chip">Question</div>
                    <div className="sr-q-text">{answer.question?.question_text || "No question text."}</div>
                  </div>
                </div>
                <div className="sr-q-marks">{answer.question?.max_marks || 0} pts</div>
              </div>

              {/* Body */}
              <div className="sr-body-grid">

                {/* ── Left: Student Submission ── */}
                <div className="sr-col-left">
                  <div className="sr-section-label">
                    <User size={13} color="var(--brand)" /> Student Response
                  </div>
                  {answer.ocr_text && (
                    <div className="sr-ocr-box">"{answer.ocr_text}"</div>
                  )}
                  {answer.file_url && (
                    isImage(answer.file_url) ? (
                      <div style={{ borderRadius: "var(--r-md)", overflow: "hidden", border: "1px solid var(--border-hi)", padding: 4, background: "var(--bg-panel)", marginTop: 10 }}>
                        <img src={answer.file_url} alt="Student submission" style={{ width: "100%", height: "auto", borderRadius: "var(--r-sm)", display: "block" }} />
                      </div>
                    ) : (
                      <a href={answer.file_url} target="_blank" rel="noreferrer" className="sr-file-link">
                        <div className="sr-file-icon"><FileText size={18} color="var(--brand)" /></div>
                        <div>
                          <div className="sr-file-title">View Uploaded Document</div>
                          <div className="sr-file-sub">Opens in new tab</div>
                        </div>
                      </a>
                    )
                  )}
                  {!answer.ocr_text && !answer.file_url && (
                    <div className="sr-ai-box" style={{ color: "var(--txt-3)", fontStyle: "italic" }}>No response submitted.</div>
                  )}
                </div>

                {/* ── Right: AI Evaluation + HITL ── */}
                <div className="sr-col-right">

                  {/* AI block */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div className="sr-section-label" style={{ marginBottom: 0 }}>
                        <Bot size={13} color="var(--emerald)" /> AI Evaluation
                      </div>
                      <span className={`sr-ai-score-badge ${isOverridden ? "sr-ai-score-struck" : "sr-ai-score-active"}`}>
                        Score: {finalScore} / {answer.question?.max_marks}
                      </span>
                    </div>
                    <div className="sr-ai-box">
                      {answer.ai_feedback || "No AI feedback provided."}
                    </div>
                  </div>

                  <div className="sr-divider-h" />

                  {/* HITL block */}
                  <div style={{ marginTop: "auto" }}>
                    <div className="sr-hitl-head">
                      <div className="sr-section-label" style={{ marginBottom: 0 }}>
                        <Edit3 size={13} color="var(--brand)" /> Instructor Grading
                      </div>
                      {!isEditing && (
                        <button className="sr-override-link" onClick={() => initOverride(answer)}>
                          {isOverridden ? "Edit Override" : "Override Score"}
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="sr-override-form">
                        <div className="sr-override-row">
                          <div className="sr-field">
                            <label className="sr-field-label">Final Score</label>
                            <input
                              type="number" min="0" max={answer.question?.max_marks}
                              value={overrides[answer.id].score}
                              onChange={(e) => handleOverrideChange(answer.id, "score", Number(e.target.value))}
                              className="sr-input sr-input-score"
                            />
                          </div>
                          <div className="sr-field" style={{ flex: 1 }}>
                            <label className="sr-field-label">Remarks (Optional)</label>
                            <input
                              type="text" placeholder="Why are you overriding?"
                              value={overrides[answer.id].feedback}
                              onChange={(e) => handleOverrideChange(answer.id, "feedback", e.target.value)}
                              className="sr-input sr-input-wide"
                            />
                          </div>
                        </div>
                        <div className="sr-btn-row">
                          <button
                            onClick={() => submitOverride(answer.id, answer.question?.max_marks)}
                            disabled={isSaving}
                            className="sr-save-btn"
                          >
                            {isSaving
                              ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                              : <Save size={14} />}
                            Update Grade
                          </button>
                          <button
                            className="sr-cancel-btn"
                            onClick={() => { const n = { ...overrides }; delete n[answer.id]; setOverrides(n); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`sr-override-result ${isOverridden ? "sr-override-result-active" : "sr-override-result-ai"}`}>
                        <div>
                          <div className={`sr-override-result-name ${isOverridden ? "sr-override-result-name-active" : "sr-override-result-name-ai"}`}>
                            {isOverridden ? "Manual Override Applied" : "Using AI Score"}
                          </div>
                          {isOverridden && answer.teacher_feedback && (
                            <div className="sr-override-feedback">{answer.teacher_feedback}</div>
                          )}
                        </div>
                        <div className="sr-override-score">
                          {finalScore}
                          <span className="sr-override-score-dim"> / {answer.question?.max_marks}</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default SubmissionReview;
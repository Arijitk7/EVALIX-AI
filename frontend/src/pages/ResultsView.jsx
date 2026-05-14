import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  Loader2,
  Bot,
  User,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  GraduationCap,
  Award,
  AlertCircle,
  Lightbulb,
  BrainCircuit,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ─── Styles ─── */
const injectStyles = () => {
  if (document.getElementById("rv-styles")) return;
  const s = document.createElement("style");
  s.id = "rv-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --brand:      #D85A30;
      --brand-dim:  #993C1D;
      --brand-glow: rgba(216,90,48,.2);
      --brand-g2:   rgba(216,90,48,.07);
      --brand-g3:   rgba(216,90,48,.13);
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
      --emerald-b:  rgba(52,211,153,.18);
      --amber:      #f59e0b;
      --r-lg:       14px;
      --r-md:       10px;
      --r-sm:       7px;
      --tx:         220ms cubic-bezier(.4,0,.2,1);
    }
    *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0 }
    body { font-family: 'DM Sans', sans-serif; background: var(--bg-base); color: var(--txt-1); -webkit-font-smoothing: antialiased }
    ::-webkit-scrollbar { width: 4px }
    ::-webkit-scrollbar-track { background: transparent }
    ::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 99px }
    @keyframes spin { to { transform: rotate(360deg) } }
    @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }

    /* ── Loading / Error ── */
    .rv-center {
      min-height: 100vh; background: var(--bg-base);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 14px;
      color: var(--txt-3);
    }
    .rv-center-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: var(--txt-2) }

    /* Time-lock screen */
    .rv-lock-screen {
      min-height: 100vh; background: var(--bg-base);
      display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .rv-lock-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--r-lg); padding: 36px 32px;
      max-width: 400px; width: 100%; text-align: center;
    }
    .rv-lock-icon {
      width: 60px; height: 60px; border-radius: 16px;
      background: var(--brand-g3); border: 1px solid rgba(216,90,48,.25);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 18px;
    }
    .rv-lock-title {
      font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700;
      color: var(--txt-1); margin-bottom: 8px;
    }
    .rv-lock-sub { font-size: 13.5px; color: var(--txt-2); line-height: 1.65; margin-bottom: 24px }
    .rv-lock-btn {
      padding: 10px 24px; border-radius: var(--r-md);
      background: var(--bg-panel); border: 1px solid var(--border-hi);
      color: var(--txt-1); font-size: 13px; font-weight: 700;
      font-family: 'Syne', sans-serif; cursor: pointer;
      transition: all var(--tx);
    }
    .rv-lock-btn:hover { border-color: var(--brand); color: var(--brand) }

    /* ── Header ── */
    .rv-header {
      position: sticky; top: 0; z-index: 30;
      background: var(--bg-panel); border-bottom: 1px solid var(--border);
      height: 64px;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 28px; gap: 16px;
    }
    .rv-header-left { display: flex; align-items: center; gap: 14px; min-width: 0 }
    .rv-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0 }
    .rv-brand-ring {
      width: 34px; height: 34px; border-radius: 50%;
      border: 2px solid var(--brand); background: var(--brand-g2);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 10px var(--brand-glow); flex-shrink: 0;
    }
    .rv-brand-name {
      font-family: 'Syne', sans-serif; font-weight: 800;
      font-size: 15px; letter-spacing: .06em; color: #fff;
    }
    .rv-brand-name span { color: var(--brand) }
    .rv-divider { color: var(--border-hi); font-size: 18px; margin: 0 2px; flex-shrink: 0 }
    .rv-page-title {
      font-family: 'Syne', sans-serif; font-size: 16px;
      font-weight: 700; color: #fff; letter-spacing: -.01em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .rv-page-sub { font-size: 11px; color: var(--txt-3); margin-top: 1px }
    .rv-back-btn {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: var(--r-sm);
      border: 1px solid var(--border); background: transparent;
      color: var(--txt-2); cursor: pointer; transition: all var(--tx); flex-shrink: 0;
    }
    .rv-back-btn:hover { color: #fff; border-color: var(--border-hi); background: var(--bg-hover) }

    /* Header right */
    .rv-header-right { display: flex; align-items: center; gap: 18px; flex-shrink: 0 }
    .rv-score-block { text-align: right }
    .rv-score-label {
      font-size: 10px; color: var(--txt-3); text-transform: uppercase;
      letter-spacing: .1em; font-weight: 600; margin-bottom: 2px;
    }
    .rv-score-val {
      display: flex; align-items: center; gap: 7px;
      font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: var(--brand);
    }
    .rv-score-max { font-size: 13px; color: var(--txt-2); font-weight: 400 }
    .rv-divider-line { width: 1px; height: 36px; background: var(--border-hi); flex-shrink: 0 }
    .rv-evaluated-badge {
      display: flex; align-items: center; gap: 5px;
      font-size: 12px; font-weight: 600; color: var(--emerald);
    }

    /* ── Main ── */
    .rv-main {
      max-width: 1000px; margin: 0 auto;
      padding: 28px 28px 80px;
      display: flex; flex-direction: column; gap: 20px;
    }

    /* Intro card */
    .rv-intro-card {
      display: flex; align-items: flex-start; gap: 16px;
      padding: 20px 22px;
      background: var(--brand-g3); border: 1px solid rgba(216,90,48,.2);
      border-radius: var(--r-lg);
    }
    .rv-intro-icon {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      background: rgba(216,90,48,.2); border: 1px solid rgba(216,90,48,.3);
      display: flex; align-items: center; justify-content: center;
    }
    .rv-intro-title {
      font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
      color: var(--txt-1); margin-bottom: 4px;
    }
    .rv-intro-sub { font-size: 13px; color: var(--txt-2); line-height: 1.6 }

    /* ── Question card ── */
    .rv-q-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--r-lg); overflow: hidden;
      animation: fadeUp .3s ease forwards;
    }
    .rv-q-head {
      padding: 18px 22px; border-bottom: 1px solid var(--border);
      background: var(--bg-panel);
    }
    .rv-q-head-row {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
      margin-bottom: 0;
    }
    .rv-q-left { display: flex; gap: 14px; align-items: flex-start }
    .rv-q-num {
      width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
      background: var(--bg-card); border: 1px solid var(--border-hi);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: var(--brand);
    }
    .rv-q-chip {
      display: inline-block; padding: 2px 8px; margin-bottom: 6px;
      background: var(--bg-hover); border: 1px solid var(--border-hi);
      border-radius: 4px; font-size: 10px; font-weight: 700;
      color: var(--txt-3); letter-spacing: .1em; text-transform: uppercase;
      font-family: 'Syne', sans-serif;
    }
    .rv-q-text { font-size: 14.5px; color: var(--txt-1); line-height: 1.65; font-weight: 500 }
    .rv-q-score {
      flex-shrink: 0; text-align: right;
    }
    .rv-q-score-label {
      font-size: 10px; color: var(--txt-3); text-transform: uppercase;
      letter-spacing: .1em; font-weight: 600; margin-bottom: 3px;
    }
    .rv-q-score-val {
      font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: var(--brand);
    }
    .rv-q-score-max { font-size: 12px; color: var(--txt-2); font-weight: 400 }
    .rv-q-image {
      margin-top: 14px; margin-left: 44px;
      border-radius: var(--r-md); overflow: hidden;
      border: 1px solid var(--border-hi); display: inline-block;
    }

    /* ── Section label ── */
    .rv-section-label {
      display: flex; align-items: center; gap: 7px;
      font-size: 10.5px; font-weight: 700; color: var(--txt-3);
      letter-spacing: .1em; text-transform: uppercase; margin-bottom: 14px;
    }

    /* ── MCQ layout ── */
    .rv-mcq-body { padding: 22px; display: flex; flex-direction: column; gap: 10px }

    .rv-option {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 13px 16px; border-radius: var(--r-md); border: 2px solid;
      transition: all var(--tx);
    }
    /* Default (unselected/unrelated) */
    .rv-option-default {
      background: var(--bg-panel); border-color: var(--border);
    }
    /* Selected + Correct */
    .rv-option-correct-selected {
      background: rgba(52,211,153,.08); border-color: var(--emerald);
    }
    /* Selected + Wrong */
    .rv-option-wrong-selected {
      background: rgba(239,68,68,.08); border-color: #ef4444;
    }
    /* Not selected but is correct answer */
    .rv-option-correct-unselected {
      background: rgba(52,211,153,.05); border-color: rgba(52,211,153,.35); border-style: dashed;
    }

    .rv-option-left { display: flex; align-items: center; gap: 12px }
    .rv-option-letter {
      width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
    }
    .rv-option-letter-default { background: var(--bg-card); border: 1px solid var(--border-hi); color: var(--txt-3) }
    .rv-option-letter-active { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15); color: #fff }
    .rv-option-text { font-size: 14px }
    .rv-option-text-default { color: var(--txt-2) }
    .rv-option-text-active { font-weight: 600; color: var(--txt-1) }

    .rv-option-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0 }
    .rv-option-badge {
      padding: 3px 10px; border-radius: 5px;
      font-size: 10.5px; font-weight: 700; font-family: 'Syne', sans-serif;
      letter-spacing: .06em; text-transform: uppercase; border: 1px solid;
    }
    .rv-badge-correct-selected { background: var(--emerald-g); border-color: var(--emerald-b); color: var(--emerald) }
    .rv-badge-wrong { background: rgba(239,68,68,.1); border-color: rgba(239,68,68,.25); color: #ef4444 }
    .rv-badge-correct-hint { background: var(--emerald-g); border-color: var(--emerald-b); color: var(--emerald) }

    /* MCQ explanation */
    .rv-explanation {
      margin-top: 8px; padding: 14px 16px;
      background: var(--bg-panel); border: 1px solid var(--border-hi);
      border-radius: var(--r-md);
      font-size: 13.5px; color: var(--txt-2); line-height: 1.65;
    }
    .rv-explanation-border {
      padding-top: 18px; margin-top: 18px; border-top: 1px solid var(--border);
    }

    /* ── Descriptive layout ── */
    .rv-desc-body { padding: 22px }
    .rv-desc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px }

    /* Text box variants */
    .rv-text-box {
      padding: 14px 16px; border-radius: var(--r-md);
      font-size: 13.5px; line-height: 1.65; border: 1px solid;
    }
    .rv-text-box-default { background: var(--bg-panel); border-color: var(--border-hi); color: var(--txt-2); font-style: italic }
    .rv-text-box-ai { background: var(--bg-card); border-color: var(--border); color: var(--txt-2) }
    .rv-text-box-teacher { background: var(--brand-g3); border-color: rgba(216,90,48,.25); color: var(--txt-2) }
    .rv-text-box-model { background: var(--emerald-g); border-color: var(--emerald-b); color: rgba(240,253,244,.85) }
    .rv-text-box-empty { background: var(--bg-panel); border-color: var(--border-hi); color: var(--txt-3); display: flex; align-items: center; gap: 8px; font-style: normal }

    .rv-file-link {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px; border-radius: var(--r-md);
      background: var(--bg-panel); border: 1px solid var(--border-hi);
      text-decoration: none; transition: border-color var(--tx); margin-top: 10px;
    }
    .rv-file-link:hover { border-color: var(--brand) }
    .rv-file-icon { padding: 8px; background: var(--bg-card); border-radius: 7px }
    .rv-file-title { font-size: 13.5px; font-weight: 600; color: var(--txt-1) }
    .rv-file-sub { font-size: 11px; color: var(--txt-3); margin-top: 2px }

    .rv-model-section {
      margin-top: 22px; padding-top: 20px; border-top: 1px solid var(--border);
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .rv-header { padding: 0 16px; height: 56px }
      .rv-main { padding: 16px 14px 80px }
      .rv-page-sub { display: none }
      .rv-score-block { display: none }
      .rv-divider-line { display: none }
      .rv-desc-grid { grid-template-columns: 1fr }
      .rv-q-image { margin-left: 0; margin-top: 14px }
    }
    @media (max-width: 540px) {
      .rv-option { flex-direction: column; align-items: flex-start }
      .rv-option-right { margin-left: 42px }
    }
  `;
  document.head.appendChild(s);
};

/* ─── Component ─── */
const ResultsView = () => {
  injectStyles();
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [maxTotalMarks, setMaxTotalMarks] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error("Authentication error.");
        const response = await fetch(`${API_URL}/api/assignments/${id}/result`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = await response.json();
        if (!response.ok) {
          if (response.status === 403) { setErrorMsg(json.error || "Results are not released yet."); return; }
          throw new Error(json.error || "Failed to load results.");
        }
        if (json.success && json.submission) {
          setResultData(json.submission);
          const totalMax = (json.submission.assignment.questions || []).reduce((sum, q) => sum + (q.max_marks || 0), 0);
          setMaxTotalMarks(totalMax);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Could not load the results.");
        setErrorMsg("An error occurred while fetching your results.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  const isImage = (url) => url && url.match(/\.(jpeg|jpg|gif|png)$/i) != null;

  if (isLoading) {
    return (
      <div className="rv-center">
        <Loader2 size={36} color="var(--brand)" style={{ animation: "spin 1s linear infinite" }} />
        <span className="rv-center-title">Retrieving your evaluated results…</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="rv-lock-screen">
        <div className="rv-lock-card">
          <div className="rv-lock-icon"><Lock size={24} color="var(--brand)" /></div>
          <div className="rv-lock-title">Results Locked</div>
          <p className="rv-lock-sub">{errorMsg}</p>
          <button className="rv-lock-btn" onClick={() => navigate("/student-dashboard")}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!resultData) return null;

  const { assignment, answers } = resultData;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--txt-1)", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ── */}
      <header className="rv-header">
        <div className="rv-header-left">
          <div className="rv-brand">
            <div className="rv-brand-ring"><BrainCircuit size={16} color="var(--brand)" /></div>
            <span className="rv-brand-name">EVALIX <span>AI</span></span>
          </div>
          <span className="rv-divider">·</span>
          <div style={{ minWidth: 0 }}>
            <div className="rv-page-title">{assignment?.title || "Assignment Results"}</div>
            <div className="rv-page-sub">{assignment?.subject || "Subject"}</div>
          </div>
        </div>

        <div className="rv-header-right">
          <div className="rv-score-block">
            <div className="rv-score-label">Final Score</div>
            <div className="rv-score-val">
              <Award size={16} />
              {resultData.total_score}
              <span className="rv-score-max">/ {maxTotalMarks}</span>
            </div>
          </div>
          <div className="rv-divider-line" />
          <div>
            <div className="rv-score-label">Status</div>
            <div className="rv-evaluated-badge"><CheckCircle2 size={14} /> Evaluated</div>
          </div>
          <button className="rv-back-btn" onClick={() => navigate("/student-dashboard")} title="Back">
            <ArrowLeft size={16} />
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="rv-main">

        {/* Intro card */}
        <div className="rv-intro-card">
          <div className="rv-intro-icon"><GraduationCap size={20} color="var(--brand)" /></div>
          <div>
            <div className="rv-intro-title">Evaluation Complete</div>
            <p className="rv-intro-sub">Review the detailed breakdown below to understand your score and areas for improvement.</p>
          </div>
        </div>

        {/* Questions */}
        {assignment?.questions?.map((question, index) => {
          const studentAnswer = answers.find((a) => a.question_id === question.id);
          const score = studentAnswer?.score ?? 0;
          const hasTeacherNote = !!studentAnswer?.teacher_feedback;
          const isMCQ = assignment.type === "MCQ" || (question.mcq_options && question.mcq_options.length > 0);

          return (
            <div key={question.id} className="rv-q-card" style={{ animationDelay: `${index * 60}ms` }}>

              {/* Question header */}
              <div className="rv-q-head">
                <div className="rv-q-head-row">
                  <div className="rv-q-left">
                    <div className="rv-q-num">{index + 1}</div>
                    <div>
                      <div className="rv-q-chip">{isMCQ ? "Multiple Choice" : "Descriptive"}</div>
                      <div className="rv-q-text">{question.question_text}</div>
                    </div>
                  </div>
                  <div className="rv-q-score">
                    <div className="rv-q-score-label">Score</div>
                    <div className="rv-q-score-val">
                      {score} <span className="rv-q-score-max">/ {question.max_marks}</span>
                    </div>
                  </div>
                </div>
                {question.image_url && (
                  <div className="rv-q-image">
                    <img src={question.image_url} alt="Question Reference" style={{ maxHeight: 280, width: "auto", objectFit: "contain", display: "block" }} />
                  </div>
                )}
              </div>

              {/* ── MCQ body ── */}
              {isMCQ ? (
                <div className="rv-mcq-body">
                  {question.mcq_options?.map((option, optIdx) => {
                    const studentChoice = studentAnswer?.mcq_selected?.trim();
                    const correctAnswer = question.mcq_answer?.trim();
                    const currentOption = option?.trim();
                    const isSelected = studentChoice === currentOption;
                    const isCorrect = correctAnswer === currentOption;

                    let optClass = "rv-option-default";
                    let letterClass = "rv-option-letter-default";
                    let textClass = "rv-option-text-default";
                    let badge = null;
                    let icon = null;

                    if (isSelected && isCorrect) {
                      optClass = "rv-option-correct-selected";
                      letterClass = "rv-option-letter-active";
                      textClass = "rv-option-text-active";
                      badge = <span className="rv-option-badge rv-badge-correct-selected">Your Answer · Correct</span>;
                      icon = <CheckCircle2 size={16} color="var(--emerald)" />;
                    } else if (isSelected && !isCorrect) {
                      optClass = "rv-option-wrong-selected";
                      letterClass = "rv-option-letter-active";
                      textClass = "rv-option-text-active";
                      badge = <span className="rv-option-badge rv-badge-wrong">Your Answer · Wrong</span>;
                      icon = <XCircle size={16} color="#ef4444" />;
                    } else if (!isSelected && isCorrect) {
                      optClass = "rv-option-correct-unselected";
                      letterClass = "rv-option-letter-active";
                      textClass = "rv-option-text-active";
                      badge = <span className="rv-option-badge rv-badge-correct-hint">Correct Answer</span>;
                      icon = <CheckCircle2 size={16} color="var(--emerald)" style={{ opacity: .7 }} />;
                    }

                    return (
                      <div key={optIdx} className={`rv-option ${optClass}`}>
                        <div className="rv-option-left">
                          <span className={`rv-option-letter ${letterClass}`}>{String.fromCharCode(65 + optIdx)}</span>
                          <span className={`rv-option-text ${textClass}`}>{option}</span>
                        </div>
                        {(badge || icon) && (
                          <div className="rv-option-right">
                            {badge}
                            {icon}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {question.mcq_explanation && (
                    <div className="rv-explanation-border">
                      <div className="rv-section-label">
                        <Lightbulb size={13} color="var(--amber)" /> Explanation
                      </div>
                      <div className="rv-explanation">{question.mcq_explanation}</div>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Descriptive body ── */
                <div className="rv-desc-body">
                  <div className="rv-desc-grid">

                    {/* Left: Student response */}
                    <div>
                      <div className="rv-section-label">
                        <User size={13} color="var(--txt-3)" /> Your Response
                      </div>
                      {!studentAnswer ? (
                        <div className={`rv-text-box rv-text-box-empty`}>
                          <AlertCircle size={14} /> No answer submitted.
                        </div>
                      ) : (
                        <>
                          {studentAnswer.ocr_text && (
                            <div className="rv-text-box rv-text-box-default">"{studentAnswer.ocr_text}"</div>
                          )}
                          {studentAnswer.file_url && (
                            isImage(studentAnswer.file_url) ? (
                              <div style={{ borderRadius: "var(--r-md)", overflow: "hidden", border: "1px solid var(--border-hi)", padding: 4, background: "var(--bg-panel)", marginTop: 10 }}>
                                <img src={studentAnswer.file_url} alt="Your submission" style={{ width: "100%", height: "auto", borderRadius: "var(--r-sm)", display: "block" }} />
                              </div>
                            ) : (
                              <a href={studentAnswer.file_url} target="_blank" rel="noreferrer" className="rv-file-link">
                                <div className="rv-file-icon"><FileText size={16} color="var(--brand)" /></div>
                                <div>
                                  <div className="rv-file-title">View Uploaded Document</div>
                                  <div className="rv-file-sub">Opens in new tab</div>
                                </div>
                              </a>
                            )
                          )}
                        </>
                      )}
                    </div>

                    {/* Right: AI + Teacher feedback */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                      {studentAnswer?.ai_feedback && (
                        <div>
                          <div className="rv-section-label">
                            <Bot size={13} color="var(--emerald)" /> AI Evaluation
                          </div>
                          <div className="rv-text-box rv-text-box-ai">{studentAnswer.ai_feedback}</div>
                        </div>
                      )}
                      {hasTeacherNote && (
                        <div>
                          <div className="rv-section-label" style={{ color: "var(--brand)" }}>
                            <Award size={13} color="var(--brand)" /> Instructor Remarks
                          </div>
                          <div className="rv-text-box rv-text-box-teacher">{studentAnswer.teacher_feedback}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Model answer */}
                  {question.model_answer && (
                    <div className="rv-model-section">
                      <div className="rv-section-label">
                        <CheckCircle2 size={13} color="var(--emerald)" /> Model Answer
                      </div>
                      <div className="rv-text-box rv-text-box-model">{question.model_answer}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default ResultsView;
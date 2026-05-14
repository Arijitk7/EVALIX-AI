import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  BrainCircuit,
  Sparkles,
  Download,
  FileText,
  Loader2,
  BookOpen,
  Zap,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ─── Styles ─── */
const injectStyles = () => {
  if (document.getElementById("gq-styles")) return;
  const s = document.createElement("style");
  s.id = "gq-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --brand:     #D85A30;
      --brand-dim: #993C1D;
      --brand-glow:rgba(216,90,48,.2);
      --brand-g2:  rgba(216,90,48,.07);
      --bg-base:   #131210;
      --bg-panel:  #1A1917;
      --bg-card:   #201F1D;
      --bg-hover:  #272523;
      --border:    #2E2D2A;
      --border-hi: #403E3A;
      --txt-1:     #F5F3EE;
      --txt-2:     #C8C5BC;
      --txt-3:     #7A7870;
      --emerald:   #34d399;
      --emerald-g: rgba(52,211,153,.12);
      --emerald-b: rgba(52,211,153,.2);
      --r-lg:      14px;
      --r-md:      10px;
      --r-sm:      7px;
      --tx:        220ms cubic-bezier(.4,0,.2,1);
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;background:var(--bg-base);color:var(--txt-1);-webkit-font-smoothing:antialiased}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:var(--border-hi);border-radius:99px}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer{0%,100%{opacity:.6}50%{opacity:1}}

    /* ── Header ── */
    .gq-header{
      position:sticky;top:0;z-index:30;
      background:var(--bg-panel);
      border-bottom:1px solid var(--border);
      height:64px;
      display:flex;align-items:center;justify-content:space-between;
      padding:0 28px;
    }
    .gq-header-left{display:flex;align-items:center;gap:14px}
    .gq-brand{display:flex;align-items:center;gap:10px}
    .gq-brand-ring{
      width:34px;height:34px;border-radius:50%;
      border:2px solid var(--brand);
      background:var(--brand-g2);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 10px var(--brand-glow);
      flex-shrink:0;
    }
    .gq-brand-name{
      font-family:'Syne',sans-serif;font-weight:800;
      font-size:15px;letter-spacing:.06em;color:#fff;
    }
    .gq-brand-name span{color:var(--brand)}
    .gq-back-btn{
      display:flex;align-items:center;justify-content:center;
      width:36px;height:36px;border-radius:var(--r-sm);
      border:1px solid var(--border);
      background:transparent;color:var(--txt-2);
      cursor:pointer;transition:all var(--tx);flex-shrink:0;
    }
    .gq-back-btn:hover{color:#fff;border-color:var(--border-hi);background:var(--bg-hover)}
    .divider-dot{color:var(--border-hi);font-size:18px;margin:0 2px}
    .gq-page-title{
      font-family:'Syne',sans-serif;font-size:18px;
      font-weight:700;color:#fff;letter-spacing:-.01em;
    }
    .gq-page-sub{font-size:12px;color:var(--txt-3);margin-top:1px}

    /* ── Body layout ── */
    .gq-wrap{
      max-width:1320px;width:100%;margin:0 auto;
      padding:28px 28px 60px;
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:24px;
      min-height:calc(100vh - 64px);
    }

    /* ── Card ── */
    .gq-card{
      background:var(--bg-card);
      border:1px solid var(--border);
      border-radius:var(--r-lg);
      overflow:hidden;
    }
    .gq-card-head{
      display:flex;align-items:center;gap:8px;
      padding:14px 20px;
      border-bottom:1px solid var(--border);
      background:var(--bg-panel);
    }
    .gq-card-title{
      font-family:'Syne',sans-serif;font-size:11.5px;font-weight:700;
      color:var(--txt-2);letter-spacing:.12em;text-transform:uppercase;
    }
    .gq-card-body{padding:20px;display:flex;flex-direction:column;gap:16px}

    /* ── Form ── */
    .field-label{
      display:block;font-size:11px;font-weight:600;
      color:var(--txt-3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;
    }
    .req{color:var(--brand);margin-left:2px}
    .gq-input,.gq-textarea{
      width:100%;padding:10px 14px;
      background:var(--bg-panel);
      border:1px solid var(--border-hi);
      border-radius:var(--r-sm);
      color:#fff;font-size:13.5px;
      font-family:'DM Sans',sans-serif;
      outline:none;
      transition:border-color var(--tx),background var(--tx);
    }
    .gq-input::placeholder,.gq-textarea::placeholder{color:var(--txt-3)}
    .gq-input:focus,.gq-textarea:focus{border-color:var(--brand);background:var(--bg-hover)}
    .gq-textarea{resize:vertical;line-height:1.6}

    /* ── Generate btn ── */
    .gen-btn{
      width:100%;padding:13px 20px;
      background:var(--brand);border:none;
      border-radius:var(--r-md);
      color:#fff;font-size:14px;font-weight:700;
      font-family:'Syne',sans-serif;letter-spacing:.02em;
      display:flex;align-items:center;justify-content:center;gap:9px;
      cursor:pointer;transition:background var(--tx),opacity var(--tx);
      box-shadow:0 4px 24px -6px var(--brand-glow);
    }
    .gen-btn:hover{background:var(--brand-dim)}
    .gen-btn:disabled{opacity:.4;cursor:not-allowed}

    /* ── Output panel ── */
    .output-panel{
      background:var(--bg-card);
      border:1px solid var(--border);
      border-radius:var(--r-lg);
      display:flex;flex-direction:column;
      position:sticky;top:88px;
      height:calc(100vh - 108px);
      overflow:hidden;
    }
    .output-head{
      display:flex;align-items:center;justify-content:space-between;
      padding:14px 20px;
      border-bottom:1px solid var(--border);
      background:var(--bg-panel);
      flex-shrink:0;
    }
    .output-title{
      font-family:'Syne',sans-serif;font-size:11.5px;font-weight:700;
      color:var(--txt-2);letter-spacing:.12em;text-transform:uppercase;
      display:flex;align-items:center;gap:8px;
    }
    .export-btn{
      display:flex;align-items:center;gap:7px;
      padding:7px 16px;border-radius:var(--r-sm);
      background:var(--emerald-g);
      border:1px solid var(--emerald-b);
      color:var(--emerald);
      font-size:12.5px;font-weight:600;
      font-family:'DM Sans',sans-serif;
      cursor:pointer;transition:all var(--tx);
    }
    .export-btn:hover{background:rgba(52,211,153,.2);border-color:var(--emerald)}
    .export-btn:disabled{opacity:.35;cursor:not-allowed}
    .output-scroll{flex:1;overflow-y:auto;padding:20px}

    /* ── Empty state ── */
    .empty-state{
      height:100%;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:14px;
      color:var(--txt-3);
    }
    .empty-icon{
      width:72px;height:72px;border-radius:20px;
      background:var(--bg-panel);border:1px solid var(--border);
      display:flex;align-items:center;justify-content:center;
    }
    .empty-title{
      font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--txt-2);
    }
    .empty-sub{font-size:12.5px;text-align:center;max-width:260px;line-height:1.6}

    /* ── Loading skeleton ── */
    .skeleton-wrap{display:flex;flex-direction:column;gap:14px}
    .skeleton-card{
      background:var(--bg-panel);border:1px solid var(--border);
      border-radius:var(--r-md);padding:18px;
      display:flex;flex-direction:column;gap:10px;
    }
    .skel{
      border-radius:4px;background:linear-gradient(90deg,var(--border) 25%,var(--border-hi) 50%,var(--border) 75%);
      background-size:200% 100%;
      animation:shimmer 1.4s ease infinite;
    }

    /* ── Question card ── */
    .q-result-card{
      background:var(--bg-panel);
      border:1px solid var(--border);
      border-radius:var(--r-md);padding:18px;
      animation:fadeUp .3s ease forwards;
      display:flex;flex-direction:column;gap:12px;
    }
    .q-result-top{display:flex;align-items:center;justify-content:space-between}
    .q-num-badge{
      display:flex;align-items:center;gap:7px;
      font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--brand);
    }
    .marks-badge{
      padding:3px 10px;
      background:var(--bg-card);border:1px solid var(--border-hi);
      border-radius:5px;font-size:10.5px;font-weight:700;
      color:var(--txt-3);letter-spacing:.08em;
      font-family:'Syne',sans-serif;
    }
    .q-text{font-size:14px;font-weight:600;color:#fff;line-height:1.6}
    .model-answer-box{
      background:var(--emerald-g);
      border:1px solid var(--emerald-b);
      border-radius:var(--r-sm);padding:12px 14px;
    }
    .model-answer-label{
      display:flex;align-items:center;gap:5px;
      font-size:10.5px;font-weight:700;color:var(--emerald);
      letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;
    }
    .model-answer-text{font-size:13px;color:rgba(240,253,244,.85);line-height:1.65}

    /* ── Progress bar (loading) ── */
    .gen-progress{
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      height:100%;gap:18px;color:var(--txt-3);
    }
    .progress-ring{
      width:60px;height:60px;border-radius:50%;
      border:2px solid var(--border);
      border-top-color:var(--brand);
      animation:spin 1s linear infinite;
    }
    .gen-progress-title{
      font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--txt-2);
    }
    .gen-progress-sub{font-size:12.5px;text-align:center;max-width:220px;line-height:1.6}

    /* ── Responsive ── */
    @media(max-width:1024px){
      .gq-wrap{grid-template-columns:1fr;padding:20px 18px 60px}
      .output-panel{position:static;height:auto;min-height:480px}
    }
    @media(max-width:640px){
      .gq-header{padding:0 16px;height:58px}
      .gq-wrap{padding:16px 14px 60px}
      .gq-page-sub{display:none}
    }
  `;
  document.head.appendChild(s);
};

/* ─── Component ─── */
const GenerateQuestionsView = () => {
  injectStyles();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [syllabus, setSyllabus]                   = useState("");
  const [pyqs, setPyqs]                           = useState("");
  const [instructions, setInstructions]           = useState("");
  const [marksDistribution, setMarksDistribution] = useState("Five 2-mark questions, Two 5-mark questions");
  const [isLoading, setIsLoading]                 = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const handleGenerate = async () => {
    if (!syllabus.trim() || !marksDistribution.trim())
      return toast.error("Syllabus and Marks Distribution are required.");
    setIsLoading(true);
    setGeneratedQuestions([]);
    try {
      const { data: { session }, error: se } = await supabase.auth.getSession();
      if (se || !session) throw new Error("Authentication required.");
      const res = await fetch(`${API_URL}/api/teacher/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ syllabus, pyqs, instructions, marksDistribution }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed.");
      setGeneratedQuestions(json.questions);
      toast.success("Questions generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to connect to AI engine.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!generatedQuestions.length) return;
    const excelData = generatedQuestions.map((q, i) => ({
      "Question No.": i + 1,
      "Marks": q.marks,
      "Question Text": q.question_text,
      "Model Answer / Key Points": q.model_answer,
    }));
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    ws["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 60 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, ws, "AI Questions");
    XLSX.writeFile(wb, `Generated_Exam_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Excel file downloaded!");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--txt-1)", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <header className="gq-header">
        <div className="gq-header-left">
          <div className="gq-brand">
            <div className="gq-brand-ring"><BrainCircuit size={16} color="var(--brand)" /></div>
            <span className="gq-brand-name">EVALIX <span>AI</span></span>
          </div>
          <span className="divider-dot">·</span>
          <div>
            <div className="gq-page-title">AI Exam Generator</div>
            <div className="gq-page-sub">Generate exam questions from your syllabus instantly</div>
          </div>
        </div>
        <button className="gq-back-btn" onClick={() => navigate(-1)} title="Go back">
          <ArrowLeft size={16} />
        </button>
      </header>

      {/* Body */}
      <div className="gq-wrap">

        {/* ── LEFT: Input ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Source Material */}
          <div className="gq-card">
            <div className="gq-card-head">
              <BookOpen size={14} color="var(--brand)" />
              <span className="gq-card-title">Source Material</span>
            </div>
            <div className="gq-card-body">
              <div>
                <label className="field-label">Syllabus / Topics <span className="req">*</span></label>
                <textarea
                  className="gq-textarea"
                  rows={5}
                  value={syllabus}
                  onChange={e => setSyllabus(e.target.value)}
                  placeholder="Paste syllabus topics here (e.g., 'Thermodynamics: Laws 1 & 2, Entropy, Enthalpy…')"
                />
              </div>
              <div>
                <label className="field-label">Previous Year Questions <span style={{ color: "var(--txt-3)", fontWeight: 400, letterSpacing: 0 }}>(Optional)</span></label>
                <textarea
                  className="gq-textarea"
                  rows={4}
                  value={pyqs}
                  onChange={e => setPyqs(e.target.value)}
                  placeholder="Paste old questions here so the AI can mimic your style and difficulty…"
                />
              </div>
            </div>
          </div>

          {/* AI Instructions */}
          <div className="gq-card">
            <div className="gq-card-head">
              <Sparkles size={14} color="#f59e0b" />
              <span className="gq-card-title">AI Instructions</span>
            </div>
            <div className="gq-card-body">
              <div>
                <label className="field-label">Marks Distribution <span className="req">*</span></label>
                <input
                  className="gq-input"
                  type="text"
                  value={marksDistribution}
                  onChange={e => setMarksDistribution(e.target.value)}
                  placeholder="e.g., Five 2-mark questions, Three 5-mark questions"
                />
              </div>
              <div>
                <label className="field-label">Custom Rules <span style={{ color: "var(--txt-3)", fontWeight: 400, letterSpacing: 0 }}>(Optional)</span></label>
                <textarea
                  className="gq-textarea"
                  rows={3}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="e.g., 'Make all questions scenario-based. No simple definitions.'"
                />
              </div>
              <button
                className="gen-btn"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading
                  ? <><div className="progress-ring" style={{ width: 18, height: 18, borderWidth: 2 }} />Generating…</>
                  : <><Zap size={16} />Generate Exam Questions</>
                }
              </button>
            </div>
          </div>

        </div>

        {/* ── RIGHT: Output ── */}
        <div className="output-panel">
          <div className="output-head">
            <div className="output-title">
              <FileText size={14} />
              Output Preview
              {generatedQuestions.length > 0 && (
                <span style={{
                  background: "var(--brand-g2)", border: "1px solid rgba(216,90,48,.3)",
                  color: "var(--brand)", borderRadius: 99, padding: "2px 10px",
                  fontSize: 11, fontWeight: 700
                }}>
                  {generatedQuestions.length} Questions
                </span>
              )}
            </div>
            <button
              className="export-btn"
              onClick={handleExportExcel}
              disabled={generatedQuestions.length === 0 || isLoading}
            >
              <Download size={13} />
              Export Excel
            </button>
          </div>

          <div className="output-scroll">
            {isLoading ? (
              <div className="gen-progress">
                <div className="progress-ring" />
                <div>
                  <div className="gen-progress-title">AI is thinking…</div>
                  <div className="gen-progress-sub">Generating exam questions from your syllabus. This may take a moment.</div>
                </div>
              </div>
            ) : generatedQuestions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <BrainCircuit size={30} color="var(--txt-3)" />
                </div>
                <div className="empty-title">No Questions Yet</div>
                <div className="empty-sub">Fill out the source material form and hit Generate to see your exam here.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="q-result-card"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="q-result-top">
                      <div className="q-num-badge">
                        <CheckCircle2 size={14} />
                        Q{idx + 1}
                      </div>
                      <span className="marks-badge">{q.marks} MARKS</span>
                    </div>
                    <div className="q-text">{q.question_text}</div>
                    <div className="model-answer-box">
                      <div className="model-answer-label">
                        <CheckCircle2 size={11} />
                        Model Answer / Rubric
                      </div>
                      <div className="model-answer-text">{q.model_answer}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GenerateQuestionsView;
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft, Users, Loader2, AlertCircle, CheckCircle2, Clock,
  FileText, Search, BarChart3, BrainCircuit, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import logo from "../assets/pod5.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const injectStyles = () => {
  if (document.getElementById("av-styles")) return;
  const s = document.createElement("style");
  s.id = "av-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    :root {
      --brand:#D85A30; --brand-dim:#993C1D; --brand-glow:rgba(216,90,48,.2); --brand-g2:rgba(216,90,48,.07);
      --bg-base:#131210; --bg-panel:#1A1917; --bg-card:#201F1D; --bg-hover:#272523;
      --border:#2E2D2A; --border-hi:#403E3A;
      --txt-1:#F5F3EE; --txt-2:#C8C5BC; --txt-3:#7A7870;
      --teal:rgba(45,212,191,1); --teal-g:rgba(45,212,191,.08); --teal-b:rgba(45,212,191,.2);
      --amber:rgba(251,191,36,1); --amber-g:rgba(251,191,36,.08); --amber-b:rgba(251,191,36,.2);
      --r-lg:14px; --r-md:10px; --r-sm:7px; --tx:220ms cubic-bezier(.4,0,.2,1);
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;background:var(--bg-base);color:var(--txt-1);-webkit-font-smoothing:antialiased}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:var(--border-hi);border-radius:99px}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.6)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}

    /* ── Header ── */
    .av-header{
      position:sticky;top:0;z-index:30;
      background:var(--bg-panel);
      border-bottom:1px solid var(--border);
      height:64px;
    }
    .av-header-inner{
      max-width:1400px;margin:0 auto;
      padding:0 24px;height:64px;
      display:flex;align-items:center;justify-content:space-between;gap:16px;
    }
    .av-header-left{display:flex;align-items:center;gap:12px;min-width:0}
    .av-back-btn{
      display:flex;align-items:center;justify-content:center;
      width:34px;height:34px;border-radius:var(--r-sm);
      border:1px solid var(--border);background:transparent;
      color:var(--txt-2);cursor:pointer;transition:all var(--tx);flex-shrink:0;
    }
    .av-back-btn:hover{color:#fff;border-color:var(--border-hi);background:var(--bg-hover)}

    /* Brand in header */
    .av-brand{display:flex;align-items:center;gap:8px;flex-shrink:0}
    .av-brand-ring{
      width:30px;height:30px;border-radius:50%;
      border:2px solid var(--brand);background:var(--brand-g2);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 8px var(--brand-glow);
    }
    .av-brand-name{font-family:'Syne',sans-serif;font-weight:800;font-size:13px;letter-spacing:.06em;color:#fff}
    .av-brand-name span{color:var(--brand)}
    .av-sep-dot{color:var(--border-hi);font-size:18px;flex-shrink:0}

    /* Title block */
    .av-title-block{min-width:0}
    .av-title{
      font-family:'Syne',sans-serif;font-size:16px;font-weight:700;
      color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .av-meta-row{
      display:flex;align-items:center;gap:6px;
      font-size:11px;color:var(--txt-3);letter-spacing:.06em;
      text-transform:uppercase;margin-top:2px;
    }
    .av-meta-dot{color:var(--border-hi)}

    /* Status badge */
    .av-status-live{
      display:flex;align-items:center;gap:6px;padding:6px 14px;
      border-radius:99px;font-size:12px;font-weight:700;
      color:var(--brand);background:var(--brand-g2);
      border:1px solid rgba(216,90,48,.3);flex-shrink:0;
      font-family:'Syne',sans-serif;letter-spacing:.04em;
    }
    .av-status-closed{
      display:flex;align-items:center;gap:6px;padding:6px 14px;
      border-radius:99px;font-size:12px;font-weight:600;
      color:var(--txt-3);background:var(--bg-card);
      border:1px solid var(--border-hi);flex-shrink:0;
    }
    .live-dot{width:6px;height:6px;border-radius:50%;background:var(--brand);animation:pulse 2s infinite}

    /* ── Full-page states ── */
    .av-fullpage{
      min-height:100vh;background:var(--bg-base);
      display:flex;flex-direction:column;align-items:center;
      justify-content:center;padding:24px;
      font-family:'DM Sans',sans-serif;
    }
    .av-error-card{
      background:var(--bg-card);border:1px solid var(--border);
      border-radius:var(--r-lg);padding:40px 32px;
      max-width:400px;width:100%;text-align:center;
    }
    .av-error-icon{
      width:56px;height:56px;border-radius:16px;
      background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);
      display:flex;align-items:center;justify-content:center;
      margin:0 auto 18px;
    }
    .av-error-title{font-family:'Syne',sans-serif;font-size:19px;font-weight:800;color:#fff;margin-bottom:8px}
    .av-error-sub{font-size:13.5px;color:var(--txt-3);line-height:1.6;margin-bottom:22px}
    .av-error-btn{
      display:inline-flex;align-items:center;gap:7px;
      padding:10px 22px;background:var(--bg-hover);
      border:1px solid var(--border-hi);border-radius:var(--r-sm);
      color:#fff;font-size:13px;font-weight:600;
      cursor:pointer;transition:all var(--tx);font-family:'DM Sans',sans-serif;
    }
    .av-error-btn:hover{border-color:var(--brand);color:var(--brand)}

    /* ── Body ── */
    .av-wrap{
      max-width:1400px;width:100%;margin:0 auto;
      padding:28px 24px 80px;
      display:flex;flex-direction:column;gap:24px;
    }

    /* ── Stats grid ── */
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
    .stat-card{
      background:var(--bg-card);border:1px solid var(--border);
      border-radius:var(--r-lg);padding:20px;
      display:flex;flex-direction:column;gap:12px;
      position:relative;overflow:hidden;
      transition:border-color var(--tx),transform var(--tx);
      animation:fadeUp .35s ease forwards;
    }
    .stat-card::before{
      content:'';position:absolute;top:0;left:0;right:0;height:2px;
      background:linear-gradient(90deg,var(--brand),transparent);
      opacity:0;transition:opacity var(--tx);
    }
    .stat-card:hover{border-color:var(--border-hi);transform:translateY(-2px)}
    .stat-card:hover::before{opacity:1}
    .stat-icon-row{display:flex;align-items:center;gap:7px;font-size:10.5px;font-weight:700;color:var(--txt-3);letter-spacing:.1em;text-transform:uppercase}
    .stat-icon-wrap{
      width:24px;height:24px;border-radius:6px;
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
    }
    .stat-val{
      font-family:'Syne',sans-serif;font-size:30px;font-weight:800;
      color:#fff;line-height:1;letter-spacing:-.02em;display:flex;align-items:baseline;gap:8px;
    }
    .stat-val-sub{font-size:13px;color:var(--txt-3);font-weight:400;font-family:'DM Sans',sans-serif}
    .stat-sub{font-size:12px;color:var(--txt-3)}
    .stat-sub.accent{color:var(--brand)}

    /* Progress bar */
    .prog-track{width:100%;height:4px;border-radius:99px;background:var(--bg-hover);margin-top:4px;overflow:hidden}
    .prog-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--brand-dim),var(--brand));transition:width .6s ease}

    /* Info stat card (deadline / release) */
    .info-stat{display:flex;flex-direction:column;gap:12px;justify-content:center}
    .info-row{display:flex;flex-direction:column;gap:3px}
    .info-lbl{font-size:10.5px;font-weight:700;color:var(--txt-3);letter-spacing:.1em;text-transform:uppercase}
    .info-val{font-size:13.5px;font-weight:600;color:#fff}

    /* ── Table card ── */
    .table-card{
      background:var(--bg-card);border:1px solid var(--border);
      border-radius:var(--r-lg);overflow:hidden;
    }
    .table-toolbar{
      display:flex;align-items:center;justify-content:space-between;
      padding:16px 22px;border-bottom:1px solid var(--border);
      background:var(--bg-panel);gap:14px;flex-wrap:wrap;
    }
    .table-title{
      font-family:'Syne',sans-serif;font-size:14px;font-weight:700;
      color:#fff;display:flex;align-items:center;gap:8px;
    }
    .table-title svg{color:var(--brand)}
    .search-wrap{position:relative;flex-shrink:0}
    .search-wrap svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--txt-3);pointer-events:none}
    .search-input{
      padding:8px 14px 8px 34px;background:var(--bg-card);
      border:1px solid var(--border-hi);border-radius:var(--r-sm);
      color:#fff;font-size:13px;font-family:'DM Sans',sans-serif;
      width:260px;outline:none;transition:border-color var(--tx);
    }
    .search-input::placeholder{color:var(--txt-3)}
    .search-input:focus{border-color:var(--brand)}

    /* Table */
    .av-table{width:100%;border-collapse:collapse;min-width:720px}
    .av-table thead tr{background:var(--bg-panel);border-bottom:1px solid var(--border)}
    .av-table th{
      padding:11px 20px;font-size:10.5px;font-weight:700;
      color:var(--txt-3);letter-spacing:.12em;text-transform:uppercase;text-align:left;
    }
    .av-table tbody tr{border-bottom:1px solid var(--border);transition:background var(--tx);cursor:default}
    .av-table tbody tr:last-child{border-bottom:none}
    .av-table tbody tr:hover{background:var(--bg-hover)}
    .av-table td{padding:14px 20px;vertical-align:middle}

    /* Student cell */
    .student-cell{display:flex;align-items:center;gap:11px}
    .student-avatar{
      width:34px;height:34px;border-radius:50%;
      background:linear-gradient(135deg,var(--brand-dim),var(--brand));
      border:1px solid rgba(216,90,48,.3);
      display:flex;align-items:center;justify-content:center;
      font-family:'Syne',sans-serif;font-size:13px;font-weight:800;
      color:#fff;flex-shrink:0;
    }
    .student-name{font-size:13.5px;font-weight:600;color:#fff}
    .student-email{font-size:11.5px;color:var(--txt-3);margin-top:1px;font-family:'DM Mono',monospace}

    /* Status badges */
    .badge-graded{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;color:var(--teal);background:var(--teal-g);border:1px solid var(--teal-b)}
    .badge-ai{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;color:var(--amber);background:var(--amber-g);border:1px solid var(--amber-b)}
    .badge-review{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;color:var(--txt-2);background:var(--bg-panel);border:1px solid var(--border-hi)}

    /* Score */
    .score-val{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff}
    .score-dash{font-size:13px;color:var(--txt-3);font-style:italic}

    /* Review btn */
    .review-btn{
      display:inline-flex;align-items:center;gap:6px;
      padding:7px 14px;border-radius:var(--r-sm);
      background:var(--bg-hover);border:1px solid var(--border-hi);
      color:var(--txt-2);font-size:12px;font-weight:600;
      cursor:pointer;transition:all var(--tx);font-family:'DM Sans',sans-serif;
    }
    .review-btn:hover{border-color:var(--brand);color:var(--brand);background:var(--brand-g2)}

    /* Empty state */
    .empty-state{padding:72px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px}
    .empty-icon{width:56px;height:56px;border-radius:16px;background:var(--bg-panel);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--txt-3)}
    .empty-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#fff}
    .empty-sub{font-size:13px;color:var(--txt-3);max-width:280px;line-height:1.6}

    /* Responsive */
    @media(max-width:1100px){.stats-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:768px){
      .av-header-inner{padding:0 16px}
      .av-wrap{padding:18px 14px 80px}
      .av-brand{display:none}
      .av-sep-dot{display:none}
      .table-toolbar{flex-direction:column;align-items:flex-start}
      .search-input{width:100%}
      .search-wrap{width:100%}
    }
    @media(max-width:560px){
      .stats-grid{grid-template-columns:1fr}
      .av-status-live,.av-status-closed{display:none}
    }
  `;
  document.head.appendChild(s);
};

const AssignmentView = () => {
  injectStyles();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading]   = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats]           = useState({ totalSubmissions: 0, gradedSubmissions: 0, averageScore: 0 });

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const { data: { session }, error: se } = await supabase.auth.getSession();
        if (se || !session) throw new Error("Authentication error.");
        const res = await fetch(`${API_URL}/api/teacher/assignments/${id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) { if (res.status === 404) throw new Error("Assignment not found."); throw new Error("Failed to load assignment data."); }
        const json = await res.json();
        setAssignment(json.assignmentInfo);
        setStats(json.stats);
        setSubmissions(json.submissions.map(sub => ({
          id: sub.id,
          student_name: sub.student?.name || "Unknown Student",
          student_email: sub.student?.email || "",
          submitted_at: sub.submitted_at || new Date().toISOString(),
          status: sub.status,
          score: sub.total_score,
        })));
      } catch (err) {
        console.error(err); toast.error(err.message || "Could not load assignment details.");
      } finally { setIsLoading(false); }
    };
    fetchAssignmentDetails();
  }, [id]);

  const formatEnum = (str) => {
    if (!str) return "";
    return str.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (val) => {
    if (!val) return "TBD";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return "TBD";
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
    } catch { return "TBD"; }
  };

  const filteredSubmissions = submissions.filter(s =>
    s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const initials = (name = "") => name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?";

  /* ── Loading ── */
  if (isLoading) return (
    <div className="av-fullpage">
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "var(--brand)", animation: "spin 1s linear infinite", marginBottom: 16 }} />
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Loading Analytics…</div>
      <div style={{ fontSize: 13, color: "var(--txt-3)" }}>Fetching assignment data</div>
    </div>
  );

  /* ── Not found ── */
  if (!assignment) return (
    <div className="av-fullpage">
      <div className="av-error-card">
        <div className="av-error-icon"><AlertCircle size={24} color="rgba(248,113,113,1)" /></div>
        <div className="av-error-title">Assignment Not Found</div>
        <div className="av-error-sub">This assignment may have been deleted or you don't have access to it.</div>
        <button className="av-error-btn" onClick={() => navigate("/teacher-dashboard")}><ArrowLeft size={14} />Return to Dashboard</button>
      </div>
    </div>
  );

  const isLive = assignment.deadline ? new Date(assignment.deadline) > new Date() : false;
  const completionPct = Math.round((stats.submitted / Math.max(stats.totalStudents, 1)) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--txt-1)", fontFamily: "'DM Sans',sans-serif" }}>

      {/* Header */}
      <header className="av-header">
        <div className="av-header-inner">
          <div className="av-header-left">
            <button className="av-back-btn" onClick={() => navigate("/teacher-dashboard")}><ArrowLeft size={15} /></button>
            <div className="av-brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", width: 30, height: 30, borderRadius: 8, overflow: "hidden", boxShadow: "0 0 10px rgba(216,90,48,0.3)", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
                <img src={logo} alt="EVALIX AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span className="av-brand-name" style={{ fontSize: 16, letterSpacing: "-0.01em" }}>EVALIX <span style={{ color: "var(--brand)" }}>AI</span></span>
            </div>
            <span className="av-sep-dot">·</span>
            <div className="av-title-block">
              <div className="av-title">{assignment.title}</div>
              <div className="av-meta-row">
                <span>{assignment.subject}</span>
                <span className="av-meta-dot">·</span>
                <span>{formatEnum(assignment.year)}</span>
                <span className="av-meta-dot">·</span>
                <span>{formatEnum(assignment.batch)}</span>
              </div>
            </div>
          </div>

          {isLive
            ? <div className="av-status-live"><span className="live-dot" />Accepting Submissions</div>
            : <div className="av-status-closed"><Clock size={13} />Closed</div>
          }
        </div>
      </header>

      <div className="av-wrap">

        {/* Stats */}
        <div className="stats-grid">

          {/* Completion Rate */}
          <div className="stat-card" style={{ animationDelay: "0ms" }}>
            <div className="stat-icon-row">
              <div className="stat-icon-wrap" style={{ background: "var(--brand-g2)" }}><Users size={14} color="var(--brand)" /></div>
              Completion Rate
            </div>
            <div className="stat-val">
              {stats.submitted}
              <span className="stat-val-sub">/ {stats.totalStudents} students</span>
            </div>
            <div>
              <div className="prog-track">
                <div className="prog-fill" style={{ width: `${completionPct}%` }} />
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--txt-3)" }}>{completionPct}% submitted</div>
            </div>
          </div>

          {/* Class Average */}
          <div className="stat-card" style={{ animationDelay: "60ms" }}>
            <div className="stat-icon-row">
              <div className="stat-icon-wrap" style={{ background: "var(--teal-g)" }}><BarChart3 size={14} color="var(--teal)" /></div>
              Class Average
            </div>
            <div className="stat-val">{stats.averageScore}<span style={{ fontSize: 20, color: "var(--txt-3)" }}>%</span></div>
            <div className="stat-sub">Based on graded submissions</div>
          </div>

          {/* Pending AI */}
          <div className="stat-card" style={{ animationDelay: "120ms" }}>
            <div className="stat-icon-row">
              <div className="stat-icon-wrap" style={{ background: "var(--amber-g)" }}><BrainCircuit size={14} color="var(--amber)" /></div>
              Pending AI Grading
            </div>
            <div className="stat-val">{stats.pendingAiGrading}</div>
            <div className="stat-sub accent">Requires your review</div>
          </div>

          {/* Dates */}
          <div className="stat-card info-stat" style={{ animationDelay: "180ms" }}>
            <div className="info-row">
              <div className="info-lbl">Deadline</div>
              <div className="info-val">{formatDate(assignment.deadline)}</div>
            </div>
            <div style={{ width: "100%", height: 1, background: "var(--border)" }} />
            <div className="info-row">
              <div className="info-lbl">Results Release</div>
              <div className="info-val">{formatDate(assignment.release_marks_at)}</div>
            </div>
          </div>

        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-title">
              <FileText size={15} />
              Student Submissions
              {filteredSubmissions.length > 0 && (
                <span style={{
                  padding: "2px 10px", borderRadius: 99,
                  background: "var(--brand-g2)", border: "1px solid rgba(216,90,48,.25)",
                  color: "var(--brand)", fontSize: 11, fontWeight: 700,
                }}>
                  {filteredSubmissions.length}
                </span>
              )}
            </div>
            <div className="search-wrap">
              <Search size={14} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or email…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><AlertCircle size={24} /></div>
              <div className="empty-title">{searchQuery ? "No Results Found" : "No Submissions Yet"}</div>
              <div className="empty-sub">
                {searchQuery ? "Try adjusting your search query." : "When students complete this assignment, they'll appear here."}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="av-table">
                <thead>
                  <tr>
                    <th style={{ width: "32%" }}>Student</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub, i) => (
                    <tr key={sub.id} style={{ animationDelay: `${i * 30}ms` }}>

                      {/* Student */}
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar">{initials(sub.student_name)}</div>
                          <div>
                            <div className="student-name">{sub.student_name}</div>
                            {sub.student_email && <div className="student-email">{sub.student_email}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Submitted At */}
                      <td>
                        <span style={{ fontSize: 13, color: "var(--txt-2)" }}>{formatDate(sub.submitted_at)}</span>
                      </td>

                      {/* Status */}
                      <td>
                        {sub.status === "GRADED" ? (
                          <span className="badge-graded"><CheckCircle2 size={11} />Graded</span>
                        ) : sub.status === "PENDING_AI" ? (
                          <span className="badge-ai">
                            <BrainCircuit size={11} style={{ animation: "pulse 1.5s infinite" }} />Evaluating…
                          </span>
                        ) : (
                          <span className="badge-review"><Clock size={11} />Needs Review</span>
                        )}
                      </td>

                      {/* Score */}
                      <td>
                        {sub.score !== null && sub.score !== undefined
                          ? <span className="score-val">{sub.score} <span style={{ fontSize: 12, color: "var(--txt-3)", fontWeight: 400 }}>/ {assignment.total_marks}</span></span>
                          : <span className="score-dash">—</span>
                        }
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="review-btn"
                          onClick={() => navigate(`/teacher/submissions/${sub.id}`)}
                        >
                          Review <ExternalLink size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentView;
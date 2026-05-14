import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  LogOut,
  Clock,
  CheckCircle,
  FileEdit,
  Calendar,
  Loader2,
  User,
  HelpCircle,
  Filter,
  PlayCircle,
  Lock,
  Award,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import logo from "../assets/pod5.png";

const ACADEMIC_YEARS = [
  { value: "BTECH_YEAR_1", label: "B.Tech - 1st Year" },
  { value: "BTECH_YEAR_2", label: "B.Tech - 2nd Year" },
  { value: "BTECH_YEAR_3", label: "B.Tech - 3rd Year" },
  { value: "BTECH_YEAR_4", label: "B.Tech - 4th Year" },
  { value: "MTECH_YEAR_1", label: "M.Tech - 1st Year" },
  { value: "MTECH_YEAR_2", label: "M.Tech - 2nd Year" },
];
const BATCHES = Array.from({ length: 10 }, (_, i) => ({
  value: `BATCH_${i + 1}`,
  label: `Batch ${i + 1}`,
}));
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ─── Styles ─── */
const injectStyles = () => {
  if (document.getElementById("sd-styles")) return;
  const s = document.createElement("style");
  s.id = "sd-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --brand:      #D85A30;
      --brand-dim:  #993C1D;
      --brand-glow: rgba(216,90,48,.2);
      --brand-g2:   rgba(216,90,48,.07);
      --brand-g3:   rgba(216,90,48,.14);
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
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

    /* ── Header ── */
    .sd-header {
      position: sticky; top: 0; z-index: 30;
      background: var(--bg-panel);
      border-bottom: 1px solid var(--border);
      height: 64px;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 28px;
      gap: 12px;
      overflow: hidden;
    }
    .sd-header-left {
      display: flex; align-items: center; gap: 12px;
      min-width: 0; flex: 1;
    }
    .sd-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0 }
    .sd-brand-ring {
      width: 34px; height: 34px; border-radius: 50%;
      border: 2px solid var(--brand);
      background: var(--brand-g2);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 10px var(--brand-glow); flex-shrink: 0;
    }
    .sd-brand-name {
      font-family: 'Syne', sans-serif; font-weight: 800;
      font-size: 15px; letter-spacing: .06em; color: #fff;
      white-space: nowrap;
    }
    .sd-brand-name span { color: var(--brand) }
    .sd-portal-badge {
      padding: 3px 10px; border-radius: 5px;
      background: var(--bg-hover); border: 1px solid var(--border-hi);
      font-size: 10.5px; font-weight: 700; color: var(--txt-3);
      letter-spacing: .1em; text-transform: uppercase;
      font-family: 'Syne', sans-serif; white-space: nowrap; flex-shrink: 0;
    }
    .sd-header-right { display: flex; align-items: center; gap: 14px; flex-shrink: 0 }
    .sd-user-info { text-align: right }
    .sd-user-name { font-size: 13px; font-weight: 600; color: var(--txt-1); white-space: nowrap }
    .sd-user-dept {
      font-size: 11px; color: var(--txt-3); margin-top: 1px;
      text-transform: uppercase; letter-spacing: .05em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;
    }
    .sd-logout-btn {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: var(--r-sm); flex-shrink: 0;
      border: 1px solid var(--border-hi); background: transparent;
      color: var(--txt-2); cursor: pointer; transition: all var(--tx);
    }
    .sd-logout-btn:hover { color: var(--brand); border-color: var(--brand) }

    /* ── Main Wrap ── */
    .sd-main {
      max-width: 1520px; margin: 0 auto;
      padding: 32px 28px 80px;
    }
    .sd-page-title {
      font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700;
      color: var(--txt-1); letter-spacing: -.02em; margin-bottom: 4px;
    }
    .sd-page-sub { font-size: 13.5px; color: var(--txt-3); margin-bottom: 24px; line-height: 1.5 }

    /* ── Filter Bar ── */
    .sd-filter-bar {
      display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end;
      padding: 18px 20px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--r-lg);
      margin-bottom: 24px;
    }
    .sd-filter-icon {
      width: 42px; height: 42px; border-radius: var(--r-md);
      background: var(--brand-g3); border: 1px solid rgba(216,90,48,.25);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      align-self: flex-end;
    }
    .sd-filter-group {
      display: flex; flex-direction: column; gap: 6px;
      flex: 1; min-width: 0;
    }
    .sd-filter-label {
      font-size: 10px; font-weight: 700; color: var(--txt-3);
      letter-spacing: .1em; text-transform: uppercase;
    }
    .sd-select {
      padding: 10px 34px 10px 14px; width: 100%;
      background: var(--bg-panel); border: 1px solid var(--border-hi);
      border-radius: var(--r-sm); color: var(--txt-1);
      font-size: 14px; font-family: 'DM Sans', sans-serif;
      outline: none; cursor: pointer; min-width: 0;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A7870' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 12px center;
      transition: border-color var(--tx), background var(--tx);
    }
    .sd-select:focus { border-color: var(--brand); background-color: var(--bg-hover) }
    .sd-select option { background: var(--bg-card); color: var(--txt-1) }

    /* ── Tabs ── */
    .sd-tabs {
      display: flex; gap: 4px; align-items: center;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--r-md); padding: 4px;
      width: 100%; margin-bottom: 24px;
    }
    .sd-tab {
      flex: 1; padding: 9px 12px; border-radius: 8px;
      font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      cursor: pointer; border: 1px solid transparent;
      transition: all var(--tx); color: var(--txt-3); background: transparent;
      white-space: nowrap;
    }
    .sd-tab:hover { color: var(--txt-2) }
    .sd-tab.active {
      background: var(--bg-hover); color: var(--txt-1);
      border-color: var(--border-hi);
    }
    .sd-tab-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--brand); animation: pulse 1.6s ease infinite;
      flex-shrink: 0;
    }

    /* ── Assignment Cards Grid ── */
    .sd-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
      gap: 16px;
    }
    .sd-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--r-lg); padding: 20px;
      display: flex; flex-direction: column;
      transition: border-color var(--tx);
      animation: fadeUp .3s ease forwards;
    }
    .sd-card:hover { border-color: var(--border-hi) }
    .sd-card-top {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 8px; margin-bottom: 14px;
    }
    .sd-subject-chip {
      padding: 3px 10px; border-radius: 5px;
      background: var(--bg-hover); border: 1px solid var(--border-hi);
      font-size: 11px; font-weight: 700; color: var(--txt-2);
      font-family: 'Syne', sans-serif; letter-spacing: .04em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;
    }
    .sd-live-badge {
      display: flex; align-items: center; gap: 5px; flex-shrink: 0;
      padding: 3px 10px; border-radius: 5px;
      background: var(--brand-g3); border: 1px solid rgba(216,90,48,.25);
      font-size: 10.5px; font-weight: 700; color: var(--brand);
      font-family: 'Syne', sans-serif; letter-spacing: .06em;
    }
    .sd-live-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--brand); animation: pulse 1.4s ease infinite; flex-shrink: 0;
    }
    .sd-card-title {
      font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700;
      color: var(--txt-1); line-height: 1.3; margin-bottom: 6px;
    }
    .sd-card-teacher {
      display: flex; align-items: center; gap: 6px;
      font-size: 12.5px; color: var(--txt-3); margin-bottom: 16px;
    }

    /* Meta info box */
    .sd-meta {
      background: var(--bg-panel); border: 1px solid var(--border);
      border-radius: var(--r-md); padding: 13px;
      display: flex; flex-direction: column; gap: 9px;
      margin-bottom: 16px; margin-top: auto;
    }
    .sd-meta-row {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 12.5px; gap: 8px;
    }
    .sd-meta-key {
      display: flex; align-items: center; gap: 6px; color: var(--txt-3);
      flex-shrink: 0;
    }
    .sd-meta-val {
      font-weight: 600; color: var(--txt-2);
      text-align: right; min-width: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .sd-meta-val-brand {
      font-weight: 600; color: var(--brand);
      text-align: right; min-width: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }

    /* Action buttons */
    .sd-btn {
      width: 100%; padding: 12px 16px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      border-radius: var(--r-md); font-size: 13.5px; font-weight: 700;
      font-family: 'Syne', sans-serif; cursor: pointer;
      transition: all var(--tx); border: 1px solid transparent;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .sd-btn-primary { background: var(--brand); color: #fff; box-shadow: 0 4px 18px -4px var(--brand-glow) }
    .sd-btn-primary:hover { background: var(--brand-dim) }
    .sd-btn-secondary { background: var(--bg-panel); color: var(--txt-1); border-color: var(--border-hi) }
    .sd-btn-secondary:hover { border-color: var(--brand); color: var(--brand) }
    .sd-btn-disabled { background: var(--bg-hover); color: var(--txt-3); border-color: var(--border); cursor: not-allowed; opacity: .65 }
    .sd-btn-danger { background: rgba(239,68,68,.08); color: #ef4444; border-color: rgba(239,68,68,.2); cursor: not-allowed }

    /* ── Empty / Loading states ── */
    .sd-empty {
      padding: 60px 24px; text-align: center;
      border: 1.5px dashed var(--border-hi);
      border-radius: var(--r-lg); background: var(--bg-card);
    }
    .sd-empty-icon {
      width: 56px; height: 56px; border-radius: 14px;
      background: var(--bg-panel); border: 1px solid var(--border-hi);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .sd-empty-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--txt-2); margin-bottom: 6px }
    .sd-empty-sub { font-size: 13px; color: var(--txt-3); max-width: 280px; margin: 0 auto; line-height: 1.6 }
    .sd-loading { padding: 80px 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px }
    .sd-loading-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: var(--txt-2) }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .sd-portal-badge { display: none }
    }
    @media (max-width: 768px) {
      .sd-header { padding: 0 16px; height: 58px }
      .sd-main { padding: 20px 16px 80px }
      .sd-user-info { display: none }
      .sd-filter-bar { flex-direction: column; gap: 12px; padding: 16px }
      .sd-filter-icon { display: none }
      .sd-filter-group { min-width: 100%; width: 100% }
      .sd-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 14px }
    }
    @media (max-width: 520px) {
      .sd-header { padding: 0 14px }
      .sd-brand-name { font-size: 13.5px }
      .sd-main { padding: 16px 14px 80px }
      .sd-page-title { font-size: 18px }
      .sd-page-sub { font-size: 13px }
      .sd-grid { grid-template-columns: 1fr }
      .sd-tab { font-size: 12px; padding: 8px 8px }
      .sd-card { padding: 18px }
    }
    @media (max-width: 360px) {
      .sd-brand-name { display: none }
      .sd-tab { font-size: 11.5px; padding: 8px 6px }
    }
  `;
  document.head.appendChild(s);
};

/* ─── Component ─── */
const StudentDashboard = () => {
  injectStyles();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Active Tasks");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = ["Active Tasks", "Upcoming", "Completed"];

  const handleLogout = async () => { await logout(); navigate("/auth"); };

  useEffect(() => {
    if (!selectedYear || !selectedBatch) { setAssignments([]); return; }
    const fetchAssignments = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error("Authentication error.");
        const endpoint = `${API_URL}/api/assignments/student?year=${selectedYear}&batch=${selectedBatch}`;
        const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (!response.ok) throw new Error("Failed to fetch assignments");
        const json = await response.json();
        if (json.success) setAssignments(json.assignments);
      } catch (error) {
        console.error(error); toast.error("Could not load assignments.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignments();
  }, [selectedYear, selectedBatch]);

  const now = new Date();
  const activeAssignments = assignments.filter((a) => new Date(a.start_time) <= now && new Date(a.end_time) >= now);
  const upcomingAssignments = assignments.filter((a) => new Date(a.start_time) > now);
  const completedAssignments = assignments.filter((a) => new Date(a.end_time) < now);
  const getDisplayList = () => {
    if (activeTab === "Active Tasks") return activeAssignments;
    if (activeTab === "Upcoming") return upcomingAssignments;
    return completedAssignments;
  };

  const formatDate = (dateString) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(dateString));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--txt-1)", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ── */}
      <header className="sd-header">
        <div className="sd-header-left">
          <div className="sd-brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 34, height: 34, borderRadius: 10, overflow: "hidden", boxShadow: "0 0 12px rgba(216,90,48,0.3)", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
              <img src={logo} alt="EVALIX AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span className="sd-brand-name" style={{ fontSize: 16, letterSpacing: "-0.01em" }}>EVALIX <span style={{ color: "var(--brand)" }}>AI</span></span>
          </div>
          <span className="sd-portal-badge">Student Portal</span>
        </div>
        <div className="sd-header-right">
          <div className="sd-user-info">
            <div className="sd-user-name">{user?.user_metadata?.full_name || "Student"}</div>
            <div className="sd-user-dept">{user?.user_metadata?.department?.replace(/_/g, " ")} Dept</div>
          </div>
          <button className="sd-logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="sd-main">
        <h1 className="sd-page-title">My Assignments</h1>
        <p className="sd-page-sub">Select your academic year and batch to view your pending evaluations.</p>

        {/* Filter Bar */}
        <div className="sd-filter-bar">
          <div className="sd-filter-icon"><Filter size={18} color="var(--brand)" /></div>
          <div className="sd-filter-group">
            <label className="sd-filter-label">Academic Year</label>
            <select className="sd-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="">Select Year…</option>
              {ACADEMIC_YEARS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
            </select>
          </div>
          <div className="sd-filter-group">
            <label className="sd-filter-label">Batch / Section</label>
            <select className="sd-select" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
              <option value="">Select Batch…</option>
              {BATCHES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="sd-tabs">
          {tabs.map((t) => (
            <button key={t} type="button" className={`sd-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
              {t}
              {t === "Active Tasks" && activeAssignments.length > 0 && <span className="sd-tab-dot" />}
            </button>
          ))}
        </div>

        {/* Content */}
        {!selectedYear || !selectedBatch ? (
          <div className="sd-empty">
            <div className="sd-empty-icon"><Filter size={22} color="var(--txt-3)" /></div>
            <div className="sd-empty-title">Select Your Cohort</div>
            <p className="sd-empty-sub">Choose your Academic Year and Batch above to load your specific assignments.</p>
          </div>
        ) : isLoading ? (
          <div className="sd-loading">
            <Loader2 size={32} color="var(--brand)" style={{ animation: "spin 1s linear infinite" }} />
            <div className="sd-loading-title">Fetching assignments for your cohort…</div>
          </div>
        ) : getDisplayList().length === 0 ? (
          <div className="sd-empty">
            <div className="sd-empty-icon">
              {activeTab === "Active Tasks"
                ? <CheckCircle size={22} color="var(--txt-3)" />
                : <Calendar size={22} color="var(--txt-3)" />}
            </div>
            <div className="sd-empty-title">Nothing to show here</div>
            <p className="sd-empty-sub">
              {activeTab === "Active Tasks"
                ? "You're all caught up! No active assignments for this cohort."
                : "Check back later for updates."}
            </p>
          </div>
        ) : (
          <div className="sd-grid">
            {getDisplayList().map((assignment, idx) => {
              const releaseMarksAt = new Date(assignment.release_marks_at);
              const hasSubmitted = assignment.submissions && assignment.submissions.length > 0;
              const resultsReady = hasSubmitted && now >= releaseMarksAt;
              const isLive = now >= new Date(assignment.start_time) && now <= new Date(assignment.end_time);
              const isUpcoming = now < new Date(assignment.start_time);

              return (
                <div key={assignment.id} className="sd-card" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="sd-card-top">
                    <span className="sd-subject-chip">{assignment.subject}</span>
                    {activeTab === "Active Tasks" && !hasSubmitted && (
                      <span className="sd-live-badge"><span className="sd-live-dot" />LIVE</span>
                    )}
                  </div>

                  <div className="sd-card-title">{assignment.title}</div>
                  <div className="sd-card-teacher">
                    <User size={13} /> {assignment.teacher?.name || "Instructor"}
                  </div>

                  <div className="sd-meta">
                    <div className="sd-meta-row">
                      <span className="sd-meta-key"><FileEdit size={13} /> Format</span>
                      <span className="sd-meta-val">{assignment.type}</span>
                    </div>
                    <div className="sd-meta-row">
                      <span className="sd-meta-key"><HelpCircle size={13} /> Questions</span>
                      <span className="sd-meta-val">{assignment._count?.questions || 0}</span>
                    </div>
                    <div className="sd-meta-row">
                      <span className="sd-meta-key"><Clock size={13} /> {activeTab === "Upcoming" ? "Opens" : "Deadline"}</span>
                      <span className={activeTab === "Active Tasks" && !hasSubmitted ? "sd-meta-val-brand" : "sd-meta-val"}>
                        {formatDate(activeTab === "Upcoming" ? assignment.start_time : assignment.end_time)}
                      </span>
                    </div>
                  </div>

                  {/* Action button */}
                  {hasSubmitted ? (
                    resultsReady ? (
                      <button className="sd-btn sd-btn-secondary" onClick={() => navigate(`/student/results/${assignment.id}`)}>
                        <Award size={15} color="var(--brand)" /> View Results
                      </button>
                    ) : (
                      <button className="sd-btn sd-btn-disabled" disabled>
                        <Lock size={14} /> Results Pending
                      </button>
                    )
                  ) : isLive ? (
                    <button className="sd-btn sd-btn-primary" onClick={() => navigate(`/student/assignments/${assignment.id}`)}>
                      <PlayCircle size={15} /> Start Assessment
                    </button>
                  ) : isUpcoming ? (
                    <button className="sd-btn sd-btn-disabled" disabled>
                      <Clock size={14} /> Unlocks {formatDate(assignment.start_time)}
                    </button>
                  ) : (
                    <button className="sd-btn sd-btn-danger" disabled>
                      <AlertCircle size={14} /> Missed Deadline
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
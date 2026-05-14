import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BrainCircuit,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  MoreVertical,
  Clock,
  Loader2,
  AlertCircle,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  FileText,
  TrendingUp,
  Users,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import logo from "../assets/pod5.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ─────────────────────────────────────────────
   Inline styles & CSS vars injected once
───────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById("evalix-styles")) return;
  const style = document.createElement("style");
  style.id = "evalix-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --brand:       #D85A30;
      --brand-dim:   #993C1D;
      --brand-glow:  rgba(216,90,48,0.18);
      --brand-glow2: rgba(216,90,48,0.06);
      --bg-base:     #131210;
      --bg-panel:    #1A1917;
      --bg-card:     #201F1D;
      --bg-hover:    #272523;
      --border:      #2E2D2A;
      --border-hi:   #403E3A;
      --txt-1:       #F5F3EE;
      --txt-2:       #C8C5BC;
      --txt-3:       #7A7870;
      --radius-lg:   14px;
      --radius-md:   10px;
      --sidebar-w:   260px;
      --sidebar-col: 72px;
      --hdr-h:       64px;
      --transition:  220ms cubic-bezier(.4,0,.2,1);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--bg-base);
      color: var(--txt-1);
      -webkit-font-smoothing: antialiased;
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 99px; }

    /* ── Layout shell ── */
    .evalix-shell {
      display: flex;
      min-height: 100svh;
    }

    /* ── Sidebar ── */
    .evalix-sidebar {
      position: fixed;
      top: 0; left: 0;
      height: 100%;
      width: var(--sidebar-w);
      background: var(--bg-panel);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      z-index: 50;
      transition: width var(--transition), transform var(--transition);
      overflow: hidden;
    }
    .evalix-sidebar.collapsed { width: var(--sidebar-col); }
    .evalix-sidebar.mobile-hidden { transform: translateX(-100%); }

    /* ── Sidebar brand ── */
    .sidebar-brand {
      height: var(--hdr-h);
      display: flex;
      align-items: center;
      padding: 0 18px;
      border-bottom: 1px solid var(--border);
      gap: 12px;
      flex-shrink: 0;
    }
    .brand-logo-ring {
      width: 36px; height: 36px;
      border-radius: 50%;
      border: 2px solid var(--brand);
      background: var(--brand-glow2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 0 12px var(--brand-glow);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      white-space: nowrap;
    }
    .brand-name {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 15px;
      letter-spacing: 0.06em;
      color: #fff;
      line-height: 1;
    }
    .brand-name span { color: var(--brand); }
    .brand-tagline {
      font-size: 10px;
      color: var(--txt-3);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-top: 2px;
    }

    /* ── Sidebar collapse toggle ── */
    .collapse-btn {
      position: absolute;
      right: -12px;
      top: 22px;
      width: 24px; height: 24px;
      border-radius: 50%;
      background: var(--bg-card);
      border: 1px solid var(--border-hi);
      color: var(--txt-3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 60;
      transition: color var(--transition), border-color var(--transition), background var(--transition);
    }
    .collapse-btn:hover {
      color: var(--brand);
      border-color: var(--brand);
      background: var(--brand-glow2);
    }

    /* ── Nav ── */
    .sidebar-nav {
      flex: 1;
      padding: 16px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      border: 1px solid transparent;
      color: var(--txt-2);
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      background: transparent;
      width: 100%;
      text-align: left;
      transition: all var(--transition);
      white-space: nowrap;
      position: relative;
    }
    .nav-item:hover {
      background: var(--bg-hover);
      color: var(--txt-1);
      border-color: var(--border);
    }
    .nav-item.active {
      background: var(--brand-glow);
      color: #fff;
      border-color: rgba(216,90,48,0.4);
      font-weight: 600;
    }
    .nav-item.active svg { color: var(--brand); }
    .evalix-sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 10px;
    }
    .evalix-sidebar.collapsed .nav-label { display: none; }

    /* Collapsed tooltip */
    .nav-tooltip {
      position: absolute;
      left: calc(100% + 14px);
      top: 50%;
      transform: translateY(-50%);
      background: var(--bg-card);
      border: 1px solid var(--border-hi);
      color: var(--txt-1);
      font-size: 12px;
      font-weight: 500;
      padding: 5px 10px;
      border-radius: 7px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 150ms;
    }
    .nav-item:hover .nav-tooltip { opacity: 1; }

    /* ── Sidebar footer ── */
    .sidebar-footer {
      padding: 14px 10px;
      border-top: 1px solid var(--border);
    }
    .user-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      margin-bottom: 8px;
      overflow: hidden;
    }
    .user-avatar {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--brand-dim), var(--brand));
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 13px;
      color: #fff;
      flex-shrink: 0;
    }
    .user-meta { overflow: hidden; }
    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 140px;
    }
    .user-role {
      font-size: 10.5px;
      color: var(--txt-3);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 9px 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: transparent;
      color: var(--txt-3);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition);
    }
    .logout-btn:hover {
      color: #ff6b6b;
      border-color: rgba(255,107,107,0.3);
      background: rgba(255,107,107,0.07);
    }
    .evalix-sidebar.collapsed .user-meta,
    .evalix-sidebar.collapsed .logout-label,
    .evalix-sidebar.collapsed .user-chip { display: none; }
    .evalix-sidebar.collapsed .logout-btn { padding: 9px; }

    /* ── Main ── */
    .evalix-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100svh;
      margin-left: var(--sidebar-w);
      transition: margin-left var(--transition);
      background: var(--bg-base);
    }
    .evalix-main.collapsed { margin-left: var(--sidebar-col); }

    /* ── Header ── */
    .evalix-header {
      height: var(--hdr-h);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      background: var(--bg-panel);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .page-title {
      font-family: 'Syne', sans-serif;
      font-size: 19px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.01em;
    }
    .hamburger {
      display: none;
      background: transparent;
      border: none;
      color: var(--txt-2);
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      transition: all var(--transition);
    }
    .hamburger:hover { color: #fff; background: var(--bg-hover); }
    .header-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: var(--brand-glow2);
      border: 1px solid rgba(216,90,48,0.25);
      border-radius: 99px;
      font-size: 12px;
      font-weight: 600;
      color: var(--brand);
      letter-spacing: 0.04em;
    }
    .live-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--brand);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%,100% { opacity: 1; transform: scale(1); }
      50% { opacity: .5; transform: scale(1.5); }
    }

    /* ── Content ── */
    .evalix-content {
      padding: 28px;
      max-width: 1320px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* ── Stats ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      overflow: hidden;
      transition: border-color var(--transition), transform var(--transition);
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--brand), transparent);
      opacity: 0;
      transition: opacity var(--transition);
    }
    .stat-card:hover { border-color: var(--border-hi); transform: translateY(-2px); }
    .stat-card:hover::before { opacity: 1; }
    .stat-icon-wrap {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: var(--brand-glow2);
      border: 1px solid var(--brand-glow);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--brand);
    }
    .stat-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--txt-3);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .stat-value {
      font-family: 'Syne', sans-serif;
      font-size: 34px;
      font-weight: 800;
      color: #fff;
      line-height: 1;
      letter-spacing: -0.02em;
    }
    .stat-sub {
      font-size: 12.5px;
      color: var(--txt-2);
    }

    /* ── Table card ── */
    .table-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      gap: 16px;
      flex-wrap: wrap;
    }
    .table-title {
      font-family: 'Syne', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .table-title svg { color: var(--brand); }
    .search-wrap {
      position: relative;
      flex-shrink: 0;
    }
    .search-wrap svg {
      position: absolute;
      left: 11px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--txt-3);
      pointer-events: none;
    }
    .search-input {
      padding: 8px 14px 8px 34px;
      background: var(--bg-panel);
      border: 1px solid var(--border-hi);
      border-radius: var(--radius-md);
      color: #fff;
      font-size: 13px;
      font-family: 'DM Sans', sans-serif;
      width: 240px;
      outline: none;
      transition: border-color var(--transition);
    }
    .search-input::placeholder { color: var(--txt-3); }
    .search-input:focus { border-color: var(--brand); }

    /* Table */
    .evalix-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 700px;
    }
    .evalix-table thead tr {
      background: var(--bg-panel);
      border-bottom: 1px solid var(--border);
    }
    .evalix-table th {
      padding: 11px 20px;
      font-size: 10.5px;
      font-weight: 700;
      color: var(--txt-3);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-align: left;
    }
    .evalix-table tbody tr {
      border-bottom: 1px solid var(--border);
      transition: background var(--transition);
      cursor: pointer;
    }
    .evalix-table tbody tr:last-child { border-bottom: none; }
    .evalix-table tbody tr:hover { background: var(--bg-hover); }
    .evalix-table td { padding: 16px 20px; vertical-align: middle; }

    .row-title {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 6px;
    }
    .row-badges { display: flex; flex-wrap: wrap; gap: 6px; }
    .badge {
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 5px;
      letter-spacing: 0.08em;
      background: var(--bg-panel);
      border: 1px solid var(--border-hi);
      color: var(--txt-2);
    }
    .type-chip {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 10px;
      background: var(--bg-panel);
      border: 1px solid var(--border-hi);
      border-radius: 6px;
      color: var(--txt-2);
    }
    .status-live {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--brand);
    }
    .status-closed {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--txt-3);
    }
    .status-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .dot-live { background: var(--brand); animation: pulse 2s infinite; }
    .dot-closed { background: var(--txt-3); }
    .deadline {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--txt-2);
    }
    .more-btn {
      background: transparent;
      border: none;
      color: var(--txt-3);
      cursor: pointer;
      padding: 6px;
      border-radius: 7px;
      transition: all var(--transition);
      display: flex;
    }
    .more-btn:hover { color: var(--brand); background: var(--brand-glow2); }

    /* Empty state */
    .empty-state {
      padding: 72px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .empty-icon-wrap {
      width: 64px; height: 64px;
      border-radius: 18px;
      background: var(--bg-panel);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--txt-3);
      margin-bottom: 4px;
    }
    .empty-title {
      font-family: 'Syne', sans-serif;
      font-size: 17px;
      font-weight: 700;
      color: #fff;
    }
    .empty-sub { font-size: 13.5px; color: var(--txt-3); max-width: 320px; }

    /* Loading */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 120px 24px;
      gap: 14px;
      color: var(--txt-3);
    }
    .loading-state p { font-size: 14px; }

    /* Mobile overlay */
    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 40;
      backdrop-filter: blur(4px);
      display: none;
    }
    .mobile-overlay.active { display: block; }

    /* Mobile close btn */
    .mobile-close-btn {
      display: none;
      background: transparent;
      border: none;
      color: var(--txt-2);
      cursor: pointer;
      padding: 6px;
      margin-left: auto;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .stats-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 768px) {
      .evalix-sidebar {
        transform: translateX(-100%);
        width: var(--sidebar-w) !important;
      }
      .evalix-sidebar.mobile-open { transform: translateX(0); }
      .evalix-sidebar.collapsed { width: var(--sidebar-w) !important; }
      .evalix-sidebar.collapsed .nav-label { display: inline; }
      .evalix-sidebar.collapsed .user-meta { display: flex; flex-direction: column; }
      .evalix-sidebar.collapsed .user-chip { display: flex; }
      .evalix-sidebar.collapsed .logout-btn { padding: 9px 12px; }
      .evalix-sidebar.collapsed .logout-label { display: inline; }
      .evalix-main { margin-left: 0 !important; }
      .hamburger { display: flex; }
      .mobile-close-btn { display: flex; }
      .collapse-btn { display: none !important; }
      .evalix-header { padding: 0 18px; }
      .evalix-content { padding: 18px; gap: 18px; }
      .table-header { flex-direction: column; align-items: flex-start; }
      .search-input { width: 100%; }
      .search-wrap { width: 100%; }
      .header-pill { display: none; }
    }
    @media (max-width: 560px) {
      .stats-grid { grid-template-columns: 1fr; }
      .stat-card { padding: 18px; }
      .stat-value { font-size: 28px; }
    }
  `;
  document.head.appendChild(style);
};

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const TeacherDashboard = () => {
  injectStyles();

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen]     = useState(false);
  const [isLoading, setIsLoading]                   = useState(true);
  const [dashboardData, setDashboardData]           = useState({
    stats: { activeAssignments: 0, pendingEvaluations: 0, avgPerformance: "0%" },
    assignments: [],
  });

  const handleLogout = async () => { await logout(); navigate("/auth"); };

  const navItems = [
    { name: "Overview",              icon: LayoutDashboard, path: "/teacher-dashboard" },
    { name: "Create Assignment",     icon: Plus,            path: "/teacher/assignments/new" },
    { name: "AI Question Generator", icon: Sparkles,        path: "/teacher/generate-questions" },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error("Authentication error.");
        const response = await fetch(`${API_URL}/api/teacher/dashboard`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const json = await response.json();
        setDashboardData({
          stats: {
            activeAssignments:  json.activeAssignments || 0,
            pendingEvaluations: json.pendingEvaluations || 0,
            avgPerformance:     `${json.avgPerformance || 0}%`,
          },
          assignments: json.recentAssignments || [],
        });
      } catch (error) {
        console.error(error);
        toast.error("Could not load your dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatEnum = (str) => {
    if (!str) return "";
    return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    }).format(new Date(dateString));

  const initials = (name = "") =>
    name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "IN";

  const statCards = [
    { label: "Active Assignments",    value: dashboardData.stats.activeAssignments,  sub: "Currently open to students",       icon: BookOpen },
    { label: "Pending Evaluations",   value: dashboardData.stats.pendingEvaluations, sub: "Requires AI or manual grading",    icon: Users },
    { label: "Avg. Class Performance",value: dashboardData.stats.avgPerformance,      sub: "Across all recent cohorts",        icon: TrendingUp },
  ];

  return (
    <div className="evalix-shell">

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <aside className={`evalix-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${isMobileMenuOpen ? "mobile-open" : ""}`}>

        {/* Collapse toggle (desktop) */}
        <button
          className="collapse-btn"
          onClick={() => setIsSidebarCollapsed((v) => !v)}
          style={{ display: "flex" }}
        >
          {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Brand */}
        <div className="sidebar-brand" style={{ overflow: "hidden", position: "relative" }}>
          {/* Ambient copper backlighting */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(216,90,48,0.06), transparent)", pointerEvents: "none" }} />
          <div className="brand-logo-ring" style={{ position: "relative", width: 40, height: 40, borderRadius: 11, overflow: "hidden", boxShadow: "0 0 16px rgba(216,90,48,0.4)", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
            <img src={logo} alt="EVALIX AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          {!isSidebarCollapsed && (
            <div className="brand-text">
              <span className="brand-name" style={{ letterSpacing: "-0.01em" }}>EVALIX <span>AI</span></span>
              <span className="brand-tagline">Instructor Portal</span>
            </div>
          )}
          <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.name}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                title={isSidebarCollapsed ? item.name : ""}
              >
                <item.icon size={17} style={{ flexShrink: 0 }} />
                <span className="nav-label">{item.name}</span>
                {isSidebarCollapsed && (
                  <div className="nav-tooltip">{item.name}</div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">
              {initials(user?.user_metadata?.full_name)}
            </div>
            <div className="user-meta">
              <div className="user-name">{user?.user_metadata?.full_name || "Instructor"}</div>
              <div className="user-role">{formatEnum(user?.user_metadata?.department) || "Department"}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={15} />
            <span className="logout-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={`evalix-main ${isSidebarCollapsed ? "collapsed" : ""}`}>

        {/* Header */}
        <header className="evalix-header">
          <div className="header-left">
            <button className="hamburger" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="page-title">Dashboard Overview</h1>
          </div>
          <div className="header-pill">
            <div className="live-dot" />
            Live Session
          </div>
        </header>

        {/* Content */}
        <div className="evalix-content">
          {isLoading ? (
            <div className="loading-state">
              <Loader2 size={32} color="var(--brand)" style={{ animation: "spin 1s linear infinite" }} />
              <p>Syncing classroom data…</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="stats-grid">
                {statCards.map((s, i) => (
                  <div className="stat-card" key={i}>
                    <div className="stat-icon-wrap">
                      <s.icon size={18} />
                    </div>
                    <div>
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-value">{s.value}</div>
                    </div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="table-card">
                <div className="table-header">
                  <div className="table-title">
                    <FileText size={16} />
                    Recent Assignments
                  </div>
                  <div className="search-wrap">
                    <Search size={14} />
                    <input
                      type="text"
                      placeholder="Search assignments…"
                      className="search-input"
                    />
                  </div>
                </div>

                {dashboardData.assignments.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon-wrap">
                      <AlertCircle size={28} />
                    </div>
                    <div className="empty-title">No assignments found</div>
                    <div className="empty-sub">
                      Create your first assignment to start evaluating students.
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="evalix-table">
                      <thead>
                        <tr>
                          <th>Title & Cohort</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Deadline</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.assignments.map((row) => {
                          const isLive =
                            new Date(row.end_time) > new Date() &&
                            new Date(row.start_time) <= new Date();

                          return (
                            <tr key={row.id} onClick={() => navigate(`/teacher/assignments/${row.id}`)}>
                              <td>
                                <div className="row-title">{row.title}</div>
                                <div className="row-badges">
                                  <span className="badge">{formatEnum(row.year)}</span>
                                  <span className="badge">{formatEnum(row.batch)}</span>
                                </div>
                              </td>
                              <td>
                                <span className="type-chip">{row.type}</span>
                              </td>
                              <td>
                                {isLive ? (
                                  <div className="status-live">
                                    <span className="status-dot dot-live" />
                                    Live
                                  </div>
                                ) : (
                                  <div className="status-closed">
                                    <span className="status-dot dot-closed" />
                                    Closed
                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="deadline">
                                  <Clock size={13} />
                                  {formatDate(row.end_time)}
                                </div>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button
                                  className="more-btn"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
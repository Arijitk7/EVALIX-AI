import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, Plus, Trash2, Save, Loader2,
  AlignLeft, CheckSquare, Settings2, Target, Clock, BookOpen,
  Image as ImageIcon, CheckCircle2, BrainCircuit, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../assets/pod5.png';

/* ─── Enums ─── */
const DEPARTMENTS = [
  { value: 'COMPUTER_SCIENCE_ENGINEERING', label: 'Computer Science Engineering' },
  { value: 'ELECTRONICS_AND_COMMUNICATION_ENGINEERING', label: 'Electronics & Comm. Engineering' },
  { value: 'ELECTRICAL_AND_ELECTRONICS_ENGINEERING', label: 'Electrical & Electronics Eng.' },
  { value: 'MECHANICAL_ENGINEERING', label: 'Mechanical Engineering' },
  { value: 'CIVIL_ENGINEERING', label: 'Civil Engineering' },
  { value: 'AUTOMOBILE_ENGINEERING', label: 'Automobile Engineering' },
  { value: 'CHEMICAL_ENGINEERING', label: 'Chemical Engineering' },
  { value: 'INFORMATION_TECHNOLOGY', label: 'Information Technology' },
  { value: 'BIOTECHNOLOGY', label: 'Biotechnology' },
  { value: 'PETROLEUM_ENGINEERING', label: 'Petroleum Engineering' },
  { value: 'AEROSPACE_ENGINEERING', label: 'Aerospace Engineering' },
  { value: 'METALLURGICAL_ENGINEERING', label: 'Metallurgical Engineering' },
  { value: 'INDUSTRIAL_ENGINEERING', label: 'Industrial Engineering' },
  { value: 'ENVIRONMENTAL_ENGINEERING', label: 'Environmental Engineering' },
  { value: 'DATA_SCIENCE_ENGINEERING', label: 'Data Science Engineering' },
  { value: 'ARTIFICIAL_INTELLIGENCE_ENGINEERING', label: 'Artificial Intelligence Eng.' },
  { value: 'ROBOTICS_ENGINEERING', label: 'Robotics Engineering' },
];
const ACADEMIC_YEARS = [
  { value: 'BTECH_YEAR_1', label: 'B.Tech – 1st Year' },
  { value: 'BTECH_YEAR_2', label: 'B.Tech – 2nd Year' },
  { value: 'BTECH_YEAR_3', label: 'B.Tech – 3rd Year' },
  { value: 'BTECH_YEAR_4', label: 'B.Tech – 4th Year' },
  { value: 'MTECH_YEAR_1', label: 'M.Tech – 1st Year' },
  { value: 'MTECH_YEAR_2', label: 'M.Tech – 2nd Year' },
];
const BATCHES = Array.from({ length: 10 }, (_, i) => ({
  value: `BATCH_${i + 1}`,
  label: `Batch ${i + 1}`,
}));

const generateId = () => Math.random().toString(36).substr(2, 9);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/* ─── Styles ─── */
const injectStyles = () => {
  if (document.getElementById('ca-styles')) return;
  const s = document.createElement('style');
  s.id = 'ca-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --brand:     #D85A30;
      --brand-dim: #993C1D;
      --brand-glow:rgba(216,90,48,.18);
      --brand-g2:  rgba(216,90,48,.06);
      --bg-base:   #131210;
      --bg-panel:  #1A1917;
      --bg-card:   #201F1D;
      --bg-hover:  #272523;
      --border:    #2E2D2A;
      --border-hi: #403E3A;
      --txt-1:     #F5F3EE;
      --txt-2:     #C8C5BC;
      --txt-3:     #7A7870;
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

    /* ── Header ── */
    .ca-header{
      position:sticky;top:0;z-index:30;
      background:var(--bg-panel);
      border-bottom:1px solid var(--border);
      height:64px;
      display:flex;align-items:center;justify-content:space-between;
      padding:0 28px;
    }
    .ca-header-left{display:flex;align-items:center;gap:14px}
    .ca-brand{display:flex;align-items:center;gap:10px}
    .ca-brand-ring{
      width:34px;height:34px;border-radius:50%;
      border:2px solid var(--brand);
      background:var(--brand-g2);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 10px var(--brand-glow);
      flex-shrink:0;
    }
    .ca-brand-name{
      font-family:'Syne',sans-serif;font-weight:800;
      font-size:15px;letter-spacing:.06em;color:#fff;
    }
    .ca-brand-name span{color:var(--brand)}
    .back-btn{
      display:flex;align-items:center;justify-content:center;
      width:36px;height:36px;border-radius:var(--r-sm);
      border:1px solid var(--border);
      background:transparent;color:var(--txt-2);
      cursor:pointer;transition:all var(--tx);
    }
    .back-btn:hover{color:#fff;border-color:var(--border-hi);background:var(--bg-hover)}
    .page-title{
      font-family:'Syne',sans-serif;font-size:18px;
      font-weight:700;color:#fff;letter-spacing:-.01em;
    }
    .divider-dot{color:var(--border-hi);font-size:18px;margin:0 2px}

    /* Publish btn */
    .publish-btn{
      display:flex;align-items:center;gap:8px;
      padding:9px 22px;border-radius:var(--r-sm);
      background:var(--brand);border:none;
      color:#fff;font-size:13.5px;font-weight:600;
      font-family:'DM Sans',sans-serif;
      cursor:pointer;transition:background var(--tx),opacity var(--tx);
      box-shadow:0 4px 18px -4px var(--brand-glow);
    }
    .publish-btn:hover{background:var(--brand-dim)}
    .publish-btn:disabled{opacity:.45;cursor:not-allowed}

    /* ── Layout ── */
    .ca-wrap{
      max-width:1520px;width:100%;margin:0 auto;
      padding:28px 28px 100px;
      display:grid;
      grid-template-columns:300px 1fr;
      gap:24px;
      align-items:start;
    }

    /* ── Aside (sticky settings) ── */
    .ca-aside{
      position:sticky;top:80px;
      display:flex;flex-direction:column;gap:18px;
    }

    /* ── Cards ── */
    .ca-card{
      background:var(--bg-card);
      border:1px solid var(--border);
      border-radius:var(--r-lg);
      overflow:hidden;
    }
    .ca-card-head{
      display:flex;align-items:center;gap:8px;
      padding:13px 18px;
      border-bottom:1px solid var(--border);
      background:var(--bg-panel);
    }
    .ca-card-title{
      font-family:'Syne',sans-serif;
      font-size:11.5px;font-weight:700;
      color:var(--txt-2);letter-spacing:.12em;text-transform:uppercase;
    }
    .ca-card-body{padding:18px;display:flex;flex-direction:column;gap:14px}

    /* ── Form elements ── */
    .field-label{
      display:block;font-size:11px;font-weight:600;
      color:var(--txt-3);letter-spacing:.1em;
      text-transform:uppercase;margin-bottom:6px;
    }
    .ca-input,.ca-select,.ca-textarea{
      width:100%;padding:9px 14px;
      background:var(--bg-panel);
      border:1px solid var(--border-hi);
      border-radius:var(--r-sm);
      color:#fff;font-size:13.5px;
      font-family:'DM Sans',sans-serif;
      outline:none;
      transition:border-color var(--tx),background var(--tx);
    }
    .ca-input::placeholder,.ca-textarea::placeholder{color:var(--txt-3)}
    .ca-input:focus,.ca-select:focus,.ca-textarea:focus{border-color:var(--brand);background:var(--bg-hover)}
    .ca-select{
      appearance:none;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A7870' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat:no-repeat;
      background-position:right 12px center;
      padding-right:32px;
      cursor:pointer;
    }
    .ca-select option{background:var(--bg-card);color:#fff}
    .ca-textarea{resize:vertical;line-height:1.6}
    .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}

    /* ── Type selector ── */
    .type-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:6px}
    .type-card{
      padding:20px;border-radius:var(--r-lg);
      border:1px solid var(--border);
      background:var(--bg-card);
      text-align:left;cursor:pointer;
      transition:all var(--tx);
      display:flex;flex-direction:column;gap:8px;
    }
    .type-card:hover{border-color:var(--border-hi);background:var(--bg-hover)}
    .type-card.active{
      border-color:var(--brand);
      background:rgba(216,90,48,.08);
      box-shadow:0 0 0 1px var(--brand);
    }
    .type-card-icon{
      width:38px;height:38px;border-radius:9px;
      display:flex;align-items:center;justify-content:center;
      background:var(--bg-panel);border:1px solid var(--border);
      color:var(--txt-3);
      transition:all var(--tx);
    }
    .type-card.active .type-card-icon{
      background:var(--brand-g2);border-color:rgba(216,90,48,.4);
      color:var(--brand);
    }
    .type-card h3{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff}
    .type-card p{font-size:12px;color:var(--txt-3);line-height:1.5}

    /* ── Section header ── */
    .section-head{
      display:flex;align-items:center;justify-content:space-between;
      padding-bottom:14px;
      border-bottom:1px solid var(--border);
      margin-bottom:4px;
    }
    .section-title{
      font-family:'Syne',sans-serif;font-size:16px;font-weight:700;
      color:#fff;display:flex;align-items:center;gap:8px;
    }
    .q-count{
      font-size:12px;font-weight:600;color:var(--txt-3);
      background:var(--bg-card);
      border:1px solid var(--border);
      padding:4px 12px;border-radius:99px;
    }

    /* ── Question card ── */
    .q-card{
      background:var(--bg-card);
      border:1px solid var(--border);
      border-radius:var(--r-lg);
      padding:22px;
      position:relative;
      transition:border-color var(--tx);
    }
    .q-card:hover{border-color:var(--border-hi)}
    .q-card-top{
      display:flex;align-items:center;justify-content:space-between;
      margin-bottom:18px;
    }
    .q-num{
      width:30px;height:30px;border-radius:8px;
      background:var(--bg-panel);border:1px solid var(--border-hi);
      display:flex;align-items:center;justify-content:center;
      font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--brand);
    }
    .q-del-btn{
      display:flex;align-items:center;justify-content:center;
      width:32px;height:32px;border-radius:8px;
      background:transparent;border:1px solid transparent;
      color:var(--txt-3);cursor:pointer;
      transition:all var(--tx);
    }
    .q-del-btn:hover{color:#ff6b6b;border-color:rgba(255,107,107,.3);background:rgba(255,107,107,.07)}

    /* Q fields grid */
    .q-fields{display:grid;grid-template-columns:1fr 180px 90px;gap:12px;margin-bottom:14px;align-items:end}
    .img-upload-label{
      display:flex;align-items:center;justify-content:center;gap:7px;
      height:40px;
      background:var(--bg-panel);
      border:1.5px dashed var(--border-hi);
      border-radius:var(--r-sm);
      font-size:12.5px;color:var(--txt-3);cursor:pointer;
      transition:all var(--tx);
    }
    .img-upload-label:hover{border-color:var(--brand);color:var(--brand)}
    .img-upload-label.has-file{border-style:solid;border-color:rgba(216,90,48,.5);color:var(--brand)}

    /* MCQ options panel */
    .mcq-panel{
      background:var(--bg-panel);
      border:1px solid var(--border);
      border-radius:var(--r-md);
      padding:16px;
      margin-top:4px;
    }
    .options-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
    .option-wrap{position:relative}
    .option-letter{
      position:absolute;left:10px;top:50%;transform:translateY(-50%);
      width:22px;height:22px;border-radius:5px;
      background:var(--bg-card);border:1px solid var(--border-hi);
      display:flex;align-items:center;justify-content:center;
      font-family:'Syne',sans-serif;font-size:11px;font-weight:700;
      color:var(--txt-3);pointer-events:none;
    }
    .option-input{padding-left:40px!important}
    .mcq-footer{
      display:grid;grid-template-columns:160px 1fr;gap:12px;
      padding-top:14px;border-top:1px solid var(--border);
    }

    /* Descriptive model answer */
    .model-panel{
      background:var(--bg-panel);
      border:1px solid var(--border);
      border-radius:var(--r-md);
      padding:16px;
      margin-top:4px;
    }
    .model-label{
      display:flex;align-items:center;gap:6px;
      font-size:11px;font-weight:700;
      color:var(--txt-3);letter-spacing:.1em;text-transform:uppercase;
      margin-bottom:8px;
    }
    .model-label svg{color:rgba(52,211,153,1)}

    /* Add question btn */
    .add-q-btn{
      width:100%;padding:18px;
      border:2px dashed var(--border-hi);
      border-radius:var(--r-lg);
      background:transparent;
      color:var(--txt-3);font-size:14px;font-weight:600;
      font-family:'DM Sans',sans-serif;
      display:flex;align-items:center;justify-content:center;gap:8px;
      cursor:pointer;transition:all var(--tx);
    }
    .add-q-btn:hover{
      border-color:var(--brand);color:var(--brand);
      background:var(--brand-g2);
    }

    /* ── Responsive ── */
    @media(max-width:1024px){
      .ca-wrap{grid-template-columns:1fr;padding:20px 18px 100px}
      .ca-aside{position:static}
    }
    @media(max-width:640px){
      .ca-header{padding:0 16px;height:58px}
      .ca-wrap{padding:16px 14px 100px}
      .type-grid{grid-template-columns:1fr}
      .q-fields{grid-template-columns:1fr 90px;gap:10px}
      .q-fields>:nth-child(2){grid-column:1/-1}
      .options-grid{grid-template-columns:1fr}
      .mcq-footer{grid-template-columns:1fr}
      .ca-brand-name{font-size:13px}
      .page-title{font-size:15px}
      .grid-2{grid-template-columns:1fr}
    }
  `;
  document.head.appendChild(s);
};

/* ─── Component ─── */
const CreateAssignment = () => {
  injectStyles();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle]                   = useState('');
  const [subject, setSubject]               = useState('');
  const [department, setDepartment]         = useState('COMPUTER_SCIENCE_ENGINEERING');
  const [year, setYear]                     = useState('BTECH_YEAR_1');
  const [batch, setBatch]                   = useState('BATCH_1');
  const [startTime, setStartTime]           = useState('');
  const [endTime, setEndTime]               = useState('');
  const [releaseMarksAt, setReleaseMarksAt] = useState('');
  const [type, setType]                     = useState('MCQ');

  const getEmptyQuestion = (t) =>
    t === 'MCQ'
      ? { id: generateId(), text: '', marks: 5, options: ['', '', '', ''], correctOptionIndex: 0, explanation: '', image_file: null }
      : { id: generateId(), text: '', marks: 10, model_answer: '', image_file: null };

  const [questions, setQuestions] = useState([getEmptyQuestion('MCQ')]);

  const handleTypeChange = (newType) => {
    if (newType === type) return;
    if (questions.length > 1 || questions[0].text !== '') {
      if (!window.confirm('Changing type will clear all current questions. Continue?')) return;
    }
    setType(newType);
    setQuestions([getEmptyQuestion(newType)]);
  };

  const handleAddQuestion    = () => setQuestions([...questions, getEmptyQuestion(type)]);
  const handleRemoveQuestion = (id) => {
    if (questions.length === 1) return toast.error('Need at least one question.');
    setQuestions(questions.filter(q => q.id !== id));
  };
  const updateQuestion = (id, field, value) =>
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  const updateOption = (qid, idx, val) =>
    setQuestions(questions.map(q => {
      if (q.id !== qid) return q;
      const opts = [...q.options]; opts[idx] = val;
      return { ...q, options: opts };
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subject || !startTime || !endTime || !releaseMarksAt)
      return toast.error('Fill in all required metadata and time locks.');
    setIsLoading(true);
    try {
      const { data: { session }, error: se } = await supabase.auth.getSession();
      if (se || !session) throw new Error('Authentication error. Please log in again.');

      const finalQuestions = await Promise.all(questions.map(async (q) => {
        let uploadedUrl = null;
        if (q.image_file) {
          const fd = new FormData(); fd.append('examFile', q.image_file);
          const up = await fetch(`${API_URL}/api/upload`, {
            method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` }, body: fd,
          });
          if (!up.ok) throw new Error('Failed to upload image for a question.');
          uploadedUrl = (await up.json()).fileUrl;
        }
        const base = { question_text: q.text, max_marks: Number(q.marks), ...(uploadedUrl && { image_url: uploadedUrl }) };
        if (type === 'MCQ') return {
          ...base,
          mcq_options: q.options.map((o, i) => `${String.fromCharCode(65+i)}. ${o}`),
          mcq_answer: `${String.fromCharCode(65+q.correctOptionIndex)}. ${q.options[q.correctOptionIndex]}`,
          mcq_explanation: q.explanation,
        };
        return { ...base, model_answer: q.model_answer };
      }));

      const res = await fetch(`${API_URL}/api/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ title, type, subject, start_time: new Date(startTime).toISOString(), end_time: new Date(endTime).toISOString(), release_marks_at: new Date(releaseMarksAt).toISOString(), department, year, batch, questions: finalQuestions }),
      });
      if (!res.ok) { const d = await res.json().catch(()=>({})); throw new Error(d.message || 'Failed to create assignment'); }
      toast.success('Assignment published successfully!');
      navigate('/teacher-dashboard');
    } catch (err) {
      console.error(err); toast.error(err.message || 'Unexpected error.');
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--txt-1)', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <header className="ca-header">
        <div className="ca-header-left">
          <div className="ca-brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 34, height: 34, borderRadius: 10, overflow: "hidden", boxShadow: "0 0 12px rgba(216,90,48,0.3)", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
              <img src={logo} alt="EVALIX AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span className="ca-brand-name" style={{ fontSize: 17, letterSpacing: "-0.01em" }}>EVALIX <span style={{ color: "var(--brand)" }}>AI</span></span>
          </div>
          <span className="divider-dot">·</span>
          <span className="page-title">Create Assignment</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="back-btn" onClick={() => navigate(-1)} title="Go back">
            <ArrowLeft size={16} />
          </button>
          <button className="publish-btn" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
            Publish Test
          </button>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </header>

      {/* Body */}
      <div className="ca-wrap">

        {/* ── LEFT ASIDE ── */}
        <aside className="ca-aside">

          {/* General Details */}
          <div className="ca-card">
            <div className="ca-card-head">
              <BookOpen size={14} color="var(--brand)" />
              <span className="ca-card-title">General Details</span>
            </div>
            <div className="ca-card-body">
              <div>
                <label className="field-label">Title *</label>
                <input className="ca-input" type="text" placeholder="e.g. Midterm Examination" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Subject *</label>
                <input className="ca-input" type="text" placeholder="e.g. Core Computer Science" value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="ca-card">
            <div className="ca-card-head">
              <Target size={14} color="#2dd4bf" />
              <span className="ca-card-title">Target Audience</span>
            </div>
            <div className="ca-card-body">
              <div>
                <label className="field-label">Department</label>
                <select className="ca-select" value={department} onChange={e => setDepartment(e.target.value)}>
                  {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div>
                  <label className="field-label">Year</label>
                  <select className="ca-select" value={year} onChange={e => setYear(e.target.value)}>
                    {ACADEMIC_YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Batch</label>
                  <select className="ca-select" value={batch} onChange={e => setBatch(e.target.value)}>
                    {BATCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="ca-card">
            <div className="ca-card-head">
              <Clock size={14} color="var(--brand)" />
              <span className="ca-card-title">Schedule & Time Locks</span>
            </div>
            <div className="ca-card-body">
              <div>
                <label className="field-label">Start Time (Opens) *</label>
                <input className="ca-input" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="field-label">End Time (Deadline) *</label>
                <input className="ca-input" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Release Marks At *</label>
                <input className="ca-input" type="datetime-local" value={releaseMarksAt} onChange={e => setReleaseMarksAt(e.target.value)} />
              </div>
            </div>
          </div>

        </aside>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Test Format */}
          <div className="type-grid">
            {[
              { t: 'MCQ', Icon: CheckSquare, label: 'Multiple Choice (MCQ)', desc: 'Auto-graded with specific correct options.' },
              { t: 'DESCRIPTIVE', Icon: AlignLeft, label: 'Descriptive / Theory', desc: 'AI-graded open-ended answers against a model.' },
            ].map(({ t, Icon, label, desc }) => (
              <button key={t} type="button" className={`type-card ${type === t ? 'active' : ''}`} onClick={() => handleTypeChange(t)}>
                <div className="type-card-icon"><Icon size={18} /></div>
                <h3>{label}</h3>
                <p>{desc}</p>
              </button>
            ))}
          </div>

          {/* Question Builder */}
          <div>
            <div className="section-head">
              <span className="section-title">
                <Settings2 size={17} color="var(--txt-3)" />
                Question Builder
              </span>
              <span className="q-count">{questions.length} {questions.length === 1 ? 'Question' : 'Questions'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
              {questions.map((q, idx) => (
                <div key={q.id} className="q-card">
                  <div className="q-card-top">
                    <div className="q-num">{idx + 1}</div>
                    <button type="button" className="q-del-btn" onClick={() => handleRemoveQuestion(q.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Question text / image / marks */}
                  <div className="q-fields">
                    <div>
                      <label className="field-label">Question Text *</label>
                      <textarea
                        className="ca-textarea"
                        rows={2}
                        placeholder="Enter your question here…"
                        value={q.text}
                        onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                        style={{ minHeight: 40, height: 40 }}
                      />
                    </div>
                    <div>
                      <label className="field-label">Diagram (Optional)</label>
                      <label className={`img-upload-label ${q.image_file ? 'has-file' : ''}`}>
                        {q.image_file ? <CheckCircle2 size={14} /> : <ImageIcon size={14} />}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                          {q.image_file ? q.image_file.name : 'Upload Image'}
                        </span>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => updateQuestion(q.id, 'image_file', e.target.files[0])} />
                      </label>
                    </div>
                    <div>
                      <label className="field-label">Marks</label>
                      <input className="ca-input" type="number" min="1" value={q.marks} onChange={e => updateQuestion(q.id, 'marks', e.target.value)} style={{ textAlign: 'center' }} />
                    </div>
                  </div>

                  {/* MCQ options */}
                  {type === 'MCQ' ? (
                    <div className="mcq-panel">
                      <label className="field-label" style={{ marginBottom: 12 }}>Options</label>
                      <div className="options-grid">
                        {['A', 'B', 'C', 'D'].map((letter, oi) => (
                          <div key={letter} className="option-wrap">
                            <span className="option-letter">{letter}</span>
                            <input
                              className="ca-input option-input"
                              type="text"
                              placeholder={`Option ${letter}`}
                              value={q.options[oi]}
                              onChange={e => updateOption(q.id, oi, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mcq-footer">
                        <div>
                          <label className="field-label">Correct Answer</label>
                          <select className="ca-select" value={q.correctOptionIndex} onChange={e => updateQuestion(q.id, 'correctOptionIndex', Number(e.target.value))}>
                            {['A', 'B', 'C', 'D'].map((l, i) => <option key={l} value={i}>Option {l}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="field-label">Explanation (Optional)</label>
                          <input className="ca-input" type="text" placeholder="Why is this answer correct?" value={q.explanation} onChange={e => updateQuestion(q.id, 'explanation', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="model-panel">
                      <div className="model-label">
                        <CheckCircle2 size={12} />
                        Model Answer (for AI Grading)
                      </div>
                      <textarea
                        className="ca-textarea"
                        rows={4}
                        placeholder="Write the ideal answer here. The AI will grade student responses against this logic…"
                        value={q.model_answer}
                        onChange={e => updateQuestion(q.id, 'model_answer', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}

              <button type="button" className="add-q-btn" onClick={handleAddQuestion}>
                <Plus size={18} />
                Add Another Question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignment;
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Loader2, Clock, AlertCircle, UploadCloud, 
  CheckCircle2, File as FileIcon, X, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TakeTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState(null);
  
  // Format: { [questionId]: "Option A" } OR { [questionId]: FileObject }
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState('');

  // --- 1. Initialization (Fetch Data) ---
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error('Authentication required.');

        const response = await fetch(`${API_URL}/api/assignments/${id}`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (!response.ok) throw new Error('Failed to load assignment.');

        const data = await response.json();
        setAssignment(data.assignment);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  // --- 2. Live Countdown Timer ---
  useEffect(() => {
    if (!assignment?.end_time) return;

    const timer = setInterval(() => {
      const distance = new Date(assignment.end_time).getTime() - new Date().getTime();
      
      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft('Time Expired');
        // Optional: Auto-trigger handleSubmit here if distance === 0
      } else {
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [assignment]);

  // --- 3. Input Handlers ---
  const handleMcqSelect = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleFileSelect = (questionId, file) => {
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File size must be under 5MB.');
    }
    setAnswers(prev => ({ ...prev, [questionId]: file }));
  };

  const removeFile = (questionId) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
  };

  // --- 4. The "Two-Step Dance" Submission Logic ---
  const handleSubmit = async () => {
    // Validation
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < assignment.questions.length) {
      const proceed = window.confirm(`You have only answered ${answeredCount}/${assignment.questions.length} questions. Submit anyway?`);
      if (!proceed) return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const finalAnswers = [];

      // Step 1: Upload Images (If Descriptive)
      if (assignment.type === 'DESCRIPTIVE') {
        const totalFiles = Object.keys(answers).length;
        let uploaded = 0;

        for (const [qId, file] of Object.entries(answers)) {
          setUploadProgress(`Uploading file ${uploaded + 1} of ${totalFiles}...`);
          
          const formData = new FormData();
          formData.append('examFile', file);

          const uploadRes = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.access_token}` }, // Notice NO 'Content-Type', fetch sets boundary automatically for FormData
            body: formData
          });

          if (!uploadRes.ok) throw new Error(`Failed to upload file for question ${uploaded + 1}`);
          
          const uploadData = await uploadRes.json();
          finalAnswers.push({ questionId: qId, fileUrl: uploadData.fileUrl });
          uploaded++;
        }
      } 
      // Handle MCQ Mapping
      else {
        setUploadProgress('Compiling responses...');
        for (const [qId, selectedOption] of Object.entries(answers)) {
          finalAnswers.push({ questionId: qId, selectedOption });
        }
      }

      // Step 2: Submit the Final Payload
      setUploadProgress('Finalizing submission...');
      
      const submitRes = await fetch(`${API_URL}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          assignmentId: id,
          answers: finalAnswers
        })
      });

      if (!submitRes.ok) throw new Error('Submission failed at the server.');

      toast.success('Test Submitted Successfully!');
      navigate('/student-dashboard', { replace: true });

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  // --- RENDERING ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary flex flex-col items-center justify-center text-text-dim font-sans">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-400" />
        <p className="font-medium text-[15px]">Loading secure exam environment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-secondary flex flex-col items-center justify-center font-sans p-6">
        <div className="bg-bg-primary border border-border-subtle rounded-[12px] p-8 max-w-md w-full text-center shadow-card">
          <AlertCircle className="w-12 h-12 text-danger-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-text-primary mb-2">Error Loading Assessment</h2>
          <p className="text-text-secondary text-[14px] mb-6">{error}</p>
          <button onClick={() => navigate('/student-dashboard')} className="px-6 py-2.5 bg-bg-tertiary text-text-primary hover:bg-border-subtle border border-border-strong rounded-[8px] font-medium text-[13px] transition-colors">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isTimeCritical = timeLeft.includes('m ') && parseInt(timeLeft.split('h ')[1]) < 10; // Less than 10 mins

  return (
    <div className="min-h-screen bg-bg-secondary text-text-primary font-sans pb-32">
      
      {/* Distraction-Free Header */}
      <header className="bg-bg-primary border-b border-border-subtle sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium tracking-tight mb-1">{assignment.title}</h1>
            <div className="flex items-center gap-3 text-[13px] text-text-secondary">
              <span className="px-2 py-0.5 bg-bg-tertiary border border-border-strong rounded-[4px] font-mono text-[11px] uppercase tracking-wider">{assignment.subject}</span>
              <span>•</span>
              <span>Secure Environment</span>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-[8px] border font-medium text-[14px] ${isTimeCritical ? 'bg-danger-50 border-danger-600/30 text-danger-600 animate-pulse' : 'bg-bg-secondary border-border-strong text-text-primary'}`}>
            <Clock className="w-4 h-4" />
            {timeLeft}
          </div>
        </div>
      </header>

      {/* Main Question Flow */}
      <main className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        {assignment.questions.map((q, index) => (
          <div key={q.id} className="bg-bg-primary border border-border-subtle rounded-[12px] p-6 sm:p-8 shadow-card">
            
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-[8px] bg-bg-secondary border border-border-strong text-[14px] font-medium text-text-primary">
                  {index + 1}
                </span>
                <p className="text-[16px] text-text-primary leading-relaxed mt-1">
                  {q.question_text}
                </p>
              </div>
              <span className="flex-shrink-0 text-[12px] font-medium text-text-dim ml-4 mt-1">
                {q.max_marks} Points
              </span>
            </div>

            {/* MCQ Render */}
            {assignment.type === 'MCQ' && (
              <div className="pl-12 space-y-3">
                {q.mcq_options.map((option, optIdx) => {
                  const isSelected = answers[q.id] === option;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleMcqSelect(q.id, option)}
                      className={`w-full flex items-center gap-4 px-4 py-3 border rounded-[8px] text-left transition-all ${
                        isSelected 
                          ? 'bg-brand-900/30 border-brand-400 ring-1 ring-brand-400 text-text-primary' 
                          : 'bg-bg-secondary border-border-strong text-text-secondary hover:border-text-dim hover:text-text-primary'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-brand-400 bg-brand-400' : 'border-text-dim'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-[15px]">{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Descriptive / Upload Render */}
            {assignment.type === 'DESCRIPTIVE' && (
              <div className="pl-12 mt-4">
                {answers[q.id] ? (
                  <div className="flex items-center justify-between p-4 bg-brand-900/20 border border-brand-800/50 rounded-[8px]">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-bg-primary rounded-[6px]">
                        <FileIcon className="w-5 h-5 text-brand-400" />
                      </div>
                      <div className="truncate">
                        <p className="text-[14px] font-medium text-text-primary truncate">{answers[q.id].name}</p>
                        <p className="text-[12px] text-brand-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Encrypted & Ready
                        </p>
                      </div>
                    </div>
                    <button onClick={() => removeFile(q.id)} className="p-2 text-text-dim hover:text-danger-600 transition-colors rounded-[6px]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border-strong rounded-[8px] hover:border-brand-400 hover:bg-brand-900/10 cursor-pointer transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 text-text-dim group-hover:text-brand-400 mb-3 transition-colors" />
                      <p className="mb-1 text-[14px] text-text-secondary"><span className="font-medium text-text-primary">Upload solution</span> or drag image here</p>
                    </div>
                    <input 
                      type="file" className="hidden" accept=".pdf,image/*"
                      onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(q.id, e.target.files[0]); }}
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        ))}
      </main>

      {/* Floating Action Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-bg-primary border-t border-border-subtle p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-[14px] text-text-secondary hidden sm:block">
            Progress: <span className="text-text-primary font-medium">{Object.keys(answers).length}</span> / {assignment.questions.length} Answered
          </div>
          
          <div className="w-full sm:w-auto flex items-center gap-4">
            {isSubmitting && <span className="text-[13px] text-text-secondary animate-pulse">{uploadProgress}</span>}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-brand-400 hover:bg-brand-600 text-white font-medium text-[14px] rounded-[8px] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isSubmitting ? 'Processing...' : 'Submit Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
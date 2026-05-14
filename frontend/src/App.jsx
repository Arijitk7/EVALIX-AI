import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Pages
import Auth from "./pages/Auth";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CreateAssignment from "./pages/CreateAssignment";
import TakeTest from "./pages/TakeTest";
import AssignmentView from "./pages/AssignmentView";
import SubmissionReview from "./pages/SubmissionReview";
import ResultsView from "./pages/ResultsView";
import GenerateQuestionsView from "./pages/GenerateQuestionsView";
import Home from "./pages/Home";
// New Pages
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import FlaggedSubmissions from "./pages/FlaggedSubmissions";
import AuditTrail from "./pages/AuditTrail";
import NotificationsPage from "./pages/NotificationsPage";

// Role-Based Route Guards
const TeacherRoute = ({ children }) => {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-evalix-gradient flex items-center justify-center"><div className="loading-spinner"></div></div>;
  if (!user || role !== "TEACHER") return <Navigate to="/auth" replace />;
  return children;
};

const StudentRoute = ({ children }) => {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-evalix-gradient flex items-center justify-center"><div className="loading-spinner"></div></div>;
  if (!user || role !== "STUDENT") return <Navigate to="/auth" replace />;
  return children;
};

const AnyAuthRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-evalix-gradient flex items-center justify-center"><div className="loading-spinner"></div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#0f2040",
              color: "#e2e8f0",
              border: "1px solid rgba(96,165,250,0.2)",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#064e3b" },
            },
            error: { iconTheme: { primary: "#ef4444", secondary: "#7f1d1d" } },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />

          {/* ── Teacher Routes ── */}
          <Route path="/teacher-dashboard" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
          <Route path="/teacher/assignments/new" element={<TeacherRoute><CreateAssignment /></TeacherRoute>} />
          <Route path="/teacher/assignments/:id" element={<TeacherRoute><AssignmentView /></TeacherRoute>} />
          <Route path="/teacher/submissions/:submissionId" element={<TeacherRoute><SubmissionReview /></TeacherRoute>} />
          <Route path="/teacher/generate-questions" element={<TeacherRoute><GenerateQuestionsView /></TeacherRoute>} />
          <Route path="/teacher/flagged" element={<TeacherRoute><FlaggedSubmissions /></TeacherRoute>} />
          <Route path="/teacher/analytics/:assignmentId" element={<TeacherRoute><AnalyticsDashboard /></TeacherRoute>} />
          <Route path="/teacher/audit/:submissionId" element={<TeacherRoute><AuditTrail /></TeacherRoute>} />

          {/* ── Student Routes ── */}
          <Route path="/student-dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
          <Route path="/student/assignments/:id" element={<StudentRoute><TakeTest /></StudentRoute>} />
          <Route path="/student/results/:id" element={<StudentRoute><ResultsView /></StudentRoute>} />
          <Route path="/student/analytics" element={<StudentRoute><AnalyticsDashboard /></StudentRoute>} />
          <Route path="/student/notifications" element={<StudentRoute><NotificationsPage /></StudentRoute>} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
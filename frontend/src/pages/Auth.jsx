import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import logo from "../assets/pod5.png";

/* 
   Auth.jsx: Login & Sign Up
*/
const GLOBAL_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&display=swap');

@keyframes pulseRing {
  0%,100% { opacity:.35; transform:scale(1); }
  50%      { opacity:.1;  transform:scale(1.07); }
}
@keyframes spin {
  to { transform:rotate(360deg); }
}

/* Dark mode input styles */
.auth-page .evalix-input::placeholder { color:rgba(255,255,255,0.25) !important; }
.auth-page .evalix-input:focus {
  border-color:rgba(216,90,48,.7) !important;
  box-shadow:0 0 0 3px rgba(216,90,48,.12) !important;
  outline:none;
}
.auth-page .evalix-select:focus { outline:none; border-color:rgba(216,90,48,.7) !important; }
.auth-page .evalix-select option { background:#2C2C2A; color:#fff; }
.auth-page .evalix-btn:hover:not(:disabled) { opacity:.88; transform:translateY(-1px); }
.auth-page .evalix-btn:active:not(:disabled) { transform:translateY(0); }

/* Light mode input styles */
[data-theme='light'] .auth-page .evalix-input::placeholder { color:rgba(0,0,0,0.35) !important; }
[data-theme='light'] .auth-page .evalix-select option { background:#fff; color:#1a1917; }
`;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("STUDENT");

  const { login, signup, user, role: userRole } = useAuth();
  const navigate = useNavigate();

  // Read theme from localStorage (set by Home / Navbar)
  const [theme, setTheme] = useState(() => localStorage.getItem("evalix-theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  // Listen for external theme changes
  useEffect(() => {
    const onStorage = (e) => { if (e.key === "evalix-theme") setTheme(e.newValue || "dark"); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isDark = theme === "dark";

  useEffect(() => {
    if (user && userRole) {
      navigate(userRole === "TEACHER" ? "/teacher-dashboard" : "/student-dashboard");
    }
  }, [user, userRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Authentication successful!");
      } else {
        if (!fullName) throw new Error("Full name is required for registration.");
        const metadata = { full_name: fullName, department, role };
        const data = await signup(email, password, metadata);
        if (data?.user && !data?.session) {
          toast.success("Registration successful! Please check your email to verify.");
          setIsLogin(true);
        } else {
          toast.success("Registration and sync complete!");
        }
      }
    } catch (err) {
      toast.error(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Theme-aware tokens ── */
  const t = {
    pageBg:    isDark ? "#0E0D0C" : "#F7F5F2",
    cardBg:    isDark ? "#1C1B1A" : "#FFFFFF",
    cardBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    cardShadow: isDark
      ? "0 0 0 1px rgba(216,90,48,0.07), 0 40px 80px -20px rgba(0,0,0,0.7)"
      : "0 0 0 1px rgba(0,0,0,0.04), 0 24px 64px -16px rgba(0,0,0,0.12)",
    logoBg:     isDark ? "linear-gradient(145deg, #131210, #0e0d0c)" : "linear-gradient(145deg, #f0ede8, #e8e5e0)",
    logoBorder: isDark ? "2px solid rgba(216,90,48,0.7)" : "2px solid rgba(200,78,34,0.5)",
    logoShadow: isDark
      ? "0 0 0 8px rgba(216,90,48,0.08), 0 0 45px rgba(216,90,48,0.35)"
      : "0 0 0 8px rgba(200,78,34,0.06), 0 0 30px rgba(200,78,34,0.12)",
    subtitleColor: isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.35)",
    descColor:     isDark ? "rgba(255,255,255,0.4)"  : "rgba(0,0,0,0.45)",
    inputBg:       isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    inputBorder:   isDark ? "rgba(255,255,255,0.1)"  : "rgba(0,0,0,0.1)",
    inputColor:    isDark ? "#FFFFFF" : "#1A1917",
    iconColor:     isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.3)",
    tabBg:         isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    tabBorder:     isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
    tabInactive:   isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)",
    tabActive:     isDark ? "#FFFFFF" : "#1A1917",
    dividerColor:  isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    dividerText:   isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.3)",
    googleBg:      isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    googleBorder:  isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
    googleColor:   isDark ? "#FFFFFF" : "#1A1917",
    googleHover:   isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    glowA: isDark
      ? "radial-gradient(ellipse, rgba(216,90,48,0.13) 0%, transparent 68%)"
      : "radial-gradient(ellipse, rgba(200,78,34,0.06) 0%, transparent 68%)",
    glowB: isDark
      ? "radial-gradient(ellipse, rgba(58,158,143,0.07) 0%, transparent 70%)"
      : "radial-gradient(ellipse, rgba(37,99,235,0.04) 0%, transparent 70%)",
    backColor:     isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)",
    backHoverColor: isDark ? "#fff" : "#1a1917",
  };

  const inputStyle = {
    width: "100%",
    paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
    borderRadius: 10, color: t.inputColor,
    fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    boxSizing: "border-box", transition: "border-color .2s, box-shadow .2s",
  };

  const iconStyle = {
    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
    color: t.iconColor, pointerEvents: "none", display: "flex", alignItems: "center",
  };

  return (
    <>
      <style>{GLOBAL_STYLE}</style>

      {/* ── Page shell ── */}
      <div className="auth-page" style={{
        minHeight: "100vh", width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: t.pageBg, padding: "48px 16px",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative", overflow: "hidden",
        transition: "background .35s ease",
      }}>

        {/* Ambient radial glows */}
        <div style={{
          position: "fixed", top: "-15%", left: "50%", transform: "translateX(-50%)",
          width: 720, height: 480, borderRadius: "50%",
          background: t.glowA, pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{
          position: "fixed", bottom: "-20%", right: "-10%",
          width: 500, height: 400, borderRadius: "50%",
          background: t.glowB, pointerEvents: "none", zIndex: 0,
        }} />

        {/* ── Back to Home ── */}
        <button
          onClick={() => navigate("/")}
          style={{
            position: "fixed", top: 24, left: 24, zIndex: 10,
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: t.backColor, fontSize: 14, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            transition: "color .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = t.backHoverColor}
          onMouseLeave={e => e.currentTarget.style.color = t.backColor}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* ── Theme toggle ── */}
        <button
          onClick={() => {
            const next = isDark ? "light" : "dark";
            setTheme(next);
            localStorage.setItem("evalix-theme", next);
          }}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            position: "fixed", top: 24, right: 24, zIndex: 10,
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
            borderRadius: 10, width: 40, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: t.backColor, transition: "all .22s ease",
          }}
        >
          {isDark
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>

        {/* ── Auth card ── */}
        <div style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: 440,
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          borderRadius: 22,
          padding: "40px 36px 44px",
          boxShadow: t.cardShadow,
          transition: "background .35s ease, box-shadow .35s ease, border-color .35s ease",
        }}>

          {/* ── Brand block ── */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:36 }}>
            <div style={{ position:"relative", marginBottom:18 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: t.logoBg, border: t.logoBorder,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
                boxShadow: t.logoShadow,
                transform: "translateZ(0)",
                transition: "box-shadow .35s ease, background .35s ease",
              }}>
                <img src={logo} alt="EVALIX AI" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.03)", transition: "transform 0.4s cubic-bezier(0.17, 0.84, 0.44, 1)" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1.03)"} />
              </div>
              <div style={{
                position: "absolute", inset: -7, borderRadius: "50%",
                border: `1px solid ${isDark ? "rgba(216,90,48,0.22)" : "rgba(200,78,34,0.15)"}`,
                animation: "pulseRing 3.2s ease-in-out infinite",
              }} />
            </div>

            <div style={{ textAlign: "center", lineHeight: 1 }}>
              {/* Force remount on theme change to fix the background-clip: text rendering bug */}
              <span key={theme} style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 30,
                letterSpacing: "0.14em",
                background: isDark
                  ? "linear-gradient(90deg, #D85A30 0%, #F09977 38%, #B8D8EA 65%, #7BB8D4 100%)"
                  : "linear-gradient(90deg, #C84E22 0%, #D97B5A 38%, #5A8BA6 65%, #3D7A9E 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text", display: "block",
              }}>EVALIX</span>
              <span style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 500, fontSize: 11,
                letterSpacing: "0.55em", color: t.subtitleColor,
                display: "block", marginTop: 3, paddingLeft: "0.55em",
              }}>AI</span>
            </div>

            <p style={{
              marginTop: 12, fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: t.descColor, letterSpacing: "0.01em",
            }}>
              {isLogin ? "Sign in to your account" : "Create your workspace"}
            </p>
          </div>

          {/* ── Tab toggle ── */}
          <div style={{
            display: "flex", background: t.tabBg,
            border: `1px solid ${t.tabBorder}`,
            borderRadius: 13, padding: 4, gap: 4, marginBottom: 30,
          }}>
            {[["Sign In", true], ["Sign Up", false]].map(([label, forLogin]) => {
              const active = isLogin === forLogin;
              return (
                <button
                  key={label}
                  onClick={() => setIsLogin(forLogin)}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 10,
                    border: active ? "1px solid rgba(216,90,48,0.38)" : "1px solid transparent",
                    background: active
                      ? "linear-gradient(135deg, rgba(216,90,48,0.18), rgba(216,90,48,0.07))"
                      : "transparent",
                    color: active ? t.tabActive : t.tabInactive,
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                    fontWeight: active ? 700 : 400, cursor: "pointer",
                    letterSpacing: "0.02em", transition: "all .2s",
                    boxShadow: active ? "0 0 14px rgba(216,90,48,0.1)" : "none",
                  }}
                >{label}</button>
              );
            })}
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: t.tabInactive,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  fontFamily: "'DM Sans', sans-serif", marginBottom: 8, marginTop: 0,
                }}>I am a</p>

                <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                  {["STUDENT","TEACHER"].map((r) => (
                    <label key={r} style={{
                      flex: 1, display:"flex", alignItems:"center", justifyContent:"center",
                      padding: "12px 0", borderRadius: 10,
                      border: role === r
                        ? `1.5px solid rgba(216,90,48,0.6)`
                        : `1px solid ${t.inputBorder}`,
                      background: role === r
                        ? "linear-gradient(135deg, rgba(216,90,48,0.14), rgba(216,90,48,0.05))"
                        : t.inputBg,
                      color: role === r ? t.tabActive : t.tabInactive,
                      fontSize: 13, fontWeight: role === r ? 700 : 500,
                      fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                      transition: "all .2s",
                      boxShadow: role === r ? "0 0 12px rgba(216,90,48,0.14)" : "none",
                      letterSpacing: "0.02em",
                    }}>
                      <input type="radio" name="role" value={r}
                        checked={role === r} onChange={(e) => setRole(e.target.value)}
                        style={{ display:"none" }} />
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </label>
                  ))}
                </div>

                {/* Department */}
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="evalix-select"
                  style={{
                    width:"100%", padding:"12px 16px",
                    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                    borderRadius:10,
                    color: department ? t.inputColor : t.iconColor,
                    fontSize:14, fontFamily:"'DM Sans', sans-serif", fontWeight:500,
                    appearance:"none", cursor:"pointer", boxSizing:"border-box",
                    marginBottom:14, transition:"border-color .2s",
                  }}
                >
                  <option value="" disabled>Select Department</option>
                  <option value="COMPUTER_SCIENCE_ENGINEERING">Computer Science Engineering</option>
                  <option value="ELECTRONICS_AND_COMMUNICATION_ENGINEERING">Electronics & Communication Engineering</option>
                  <option value="ELECTRICAL_AND_ELECTRONICS_ENGINEERING">Electrical & Electronics Engineering</option>
                  <option value="MECHANICAL_ENGINEERING">Mechanical Engineering</option>
                  <option value="CIVIL_ENGINEERING">Civil Engineering</option>
                  <option value="AUTOMOBILE_ENGINEERING">Automobile Engineering</option>
                  <option value="CHEMICAL_ENGINEERING">Chemical Engineering</option>
                  <option value="INFORMATION_TECHNOLOGY">Information Technology</option>
                  <option value="BIOTECHNOLOGY">Biotechnology</option>
                  <option value="PETROLEUM_ENGINEERING">Petroleum Engineering</option>
                  <option value="AEROSPACE_ENGINEERING">Aerospace Engineering</option>
                  <option value="METALLURGICAL_ENGINEERING">Metallurgical Engineering</option>
                  <option value="INDUSTRIAL_ENGINEERING">Industrial Engineering</option>
                  <option value="ENVIRONMENTAL_ENGINEERING">Environmental Engineering</option>
                  <option value="DATA_SCIENCE_ENGINEERING">Data Science Engineering</option>
                  <option value="ARTIFICIAL_INTELLIGENCE_ENGINEERING">Artificial Intelligence Engineering</option>
                  <option value="ROBOTICS_ENGINEERING">Robotics Engineering</option>
                </select>

                {/* Full Name */}
                <div style={{ position:"relative", marginBottom:14 }}>
                  <span style={iconStyle}><User size={17} /></span>
                  <input type="text" required value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name" className="evalix-input" style={inputStyle} />
                </div>
              </>
            )}

            {/* Email */}
            <div style={{ position:"relative", marginBottom:14 }}>
              <span style={iconStyle}><Mail size={17} /></span>
              <input type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address" className="evalix-input" style={inputStyle} />
            </div>

            {/* Password */}
            <div style={{ position:"relative", marginBottom:0 }}>
              <span style={iconStyle}><Lock size={17} /></span>
              <input type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" className="evalix-input" style={inputStyle} />
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="evalix-btn" style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              padding:"13px 0", marginTop:26,
              background: isLoading
                ? "rgba(216,90,48,0.35)"
                : "linear-gradient(135deg, #D85A30 0%, #b83e1a 100%)",
              border:"none", borderRadius:11, color:"#FFFFFF",
              fontSize:15, fontWeight:700, fontFamily:"'DM Sans', sans-serif",
              letterSpacing:"0.04em",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition:"opacity .2s, transform .15s, box-shadow .2s",
              boxShadow: isLoading ? "none" : "0 6px 24px rgba(216,90,48,0.38)",
            }}>
              {isLoading
                ? <Loader2 size={18} style={{ animation:"spin 1s linear infinite" }} />
                : isLogin ? "Sign In →" : "Create Account →"
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
            <div style={{ flex:1, height:1, background: t.dividerColor }} />
            <span style={{ fontSize:12, color: t.dividerText, fontFamily:"'DM Sans', sans-serif" }}>or</span>
            <div style={{ flex:1, height:1, background: t.dividerColor }} />
          </div>

          {/* Google OAuth */}
          <button
            onClick={async () => {
              try {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: window.location.origin + '/auth' }
                });
                if (error) throw error;
              } catch (err) {
                toast.error('Google sign-in failed: ' + err.message);
              }
            }}
            style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              padding:"12px 0", background: t.googleBg,
              border: `1px solid ${t.googleBorder}`, borderRadius:11,
              color: t.googleColor, fontSize:14, fontWeight:600,
              fontFamily:"'DM Sans', sans-serif", cursor:"pointer", transition:"all .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = t.googleHover}
            onMouseLeave={e => e.currentTarget.style.background = t.googleBg}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107"/>
              <path d="M6.306,14.691l6.571,4.819C14.655,15.108,19.002,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00"/>
              <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50"/>
              <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </>
  );
};

export default Auth;
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [department, setDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // The Sync Handshake
  const syncWithBackend = async (session) => {
    
    try {
      // ✅ FIXED: Changed single quotes to backticks below
      const response = await fetch(`${API_URL}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (!response.ok) throw new Error('Backend sync failed');
      return true;
    } catch (error) {
      console.error('Sync Error:', error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Initial Load (This is the ONLY time we show the black loading screen)
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const synced = await syncWithBackend(session);
        if (synced && mounted) {
          setUser(session.user);
          setRole(session.user.user_metadata?.role);
          setDepartment(session.user.user_metadata?.department);
        }
      }
      if (mounted) setIsLoading(false);
    };

    initializeAuth();

    // 2. Background Events (Tab focus, Token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
        setDepartment(null);
      } else if (session) {
        // SILENT BACKGROUND SYNC: Notice we removed setIsLoading(true) here!
        // This ensures your form never gets unmounted when switching windows.
        const synced = await syncWithBackend(session);
        if (synced && mounted) {
          setUser(session.user);
          setRole(session.user.user_metadata?.role);
          setDepartment(session.user.user_metadata?.department);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata } 
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, role, department, isLoading, login, signup, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
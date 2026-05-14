import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key"

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn("⚠️ VITE_SUPABASE_URL is missing from .env. Using placeholder values so UI can render locally.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 1. MUST load env variables first!
dotenv.config();

// 2. Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    }

    const token = authHeader.split(' ')[1];

    // Ask Supabase if the token is valid
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.warn(`🔒 [Auth] Blocked invalid token attempt: ${error?.message}`);
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    // Attach the verified user to the request
    req.user = user;
    next();

  } catch (error) {
    console.error("❌ [Auth] Middleware Error:", error);
    res.status(500).json({ error: 'Internal Server Error during authentication' });
  }
};
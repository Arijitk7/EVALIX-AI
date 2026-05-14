import { UserRepository } from '../repositories/user.repository.js';

export const AuthService = {
  async syncSupabaseUser(supabaseUser) {
    if (!supabaseUser || !supabaseUser.email) {
      throw new Error("Cannot sync user: missing email or profile payload.");
    }
    const email = supabaseUser.email;
    
    // Extract metadata sent from our custom React signup form
    const name = supabaseUser.user_metadata?.full_name || email.split('@')[0];
    const role = supabaseUser.user_metadata?.role || 'STUDENT';
    const department = supabaseUser.user_metadata?.department || null;

    // console.log(`🔄 [Auth Service] Syncing ${role}: ${email}`);

    // Pass everything to the repository
    return await UserRepository.syncUser(
      supabaseUser.id, 
      email, 
      name, 
      role, 
      department
    );
  }
};
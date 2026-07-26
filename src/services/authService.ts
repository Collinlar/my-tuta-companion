import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { trackSignUp, trackSignIn } from '@/lib/analytics';

type ProfileUpdate = Partial<Database['public']['Tables']['profiles']['Update']>;

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'student' | 'teacher';
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            user_type: data.userType,
            full_name: `${data.firstName} ${data.lastName}`
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { user: null, session: null, error };
      }

      // Profile will be created automatically by the database trigger
      console.log('User signed up successfully:', authData.user?.id);

      // Track sign up event
      trackSignUp('email');

      // Mark user as first-time user for onboarding
      localStorage.setItem('isFirstTimeUser', 'true');

      return {
        user: authData.user,
        session: authData.session,
        error: null
      };
    } catch (error) {
      console.error('Sign up exception:', error);
      return {
        user: null,
        session: null,
        error: error as Error
      };
    }
  }

  /**
   * Sign in an existing user
   */
  static async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        console.error('Sign in error:', error);
        return { user: null, session: null, error };
      }

      console.log('User signed in successfully:', authData.user?.id);

      // Clear any previous user's data from localStorage
      localStorage.removeItem('isFirstTimeUser');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('currentLessonPlan');
      
      // Load the correct user's profile from database
      if (authData.user) {
        try {
          const { profile: dbProfile } = await this.getUserProfile(authData.user.id);
          
          if (dbProfile) {
            // Create user profile object with data from database
            const userProfile = {
              id: authData.user.id,
              name: `${dbProfile.first_name || ''} ${dbProfile.last_name || ''}`.trim() || 
                    authData.user.user_metadata?.full_name || 
                    authData.user.email?.split('@')[0] || 
                    'User',
              email: authData.user.email,
              userType: dbProfile.user_type || 'student',
              school: dbProfile.school,
              grade: dbProfile.grade,
              subjects: dbProfile.subjects || [],
              goals: dbProfile.goals || [],
              bio: dbProfile.bio,
              avatar: dbProfile.avatar_url,
              parentContact: dbProfile.parent_contact,
              teachingExperience: dbProfile.teaching_experience
            };
            
            // Save the correct user's profile to localStorage
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            console.log('Loaded user profile:', userProfile.name);
          } else {
            // Fallback to basic profile from auth metadata
            const basicProfile = {
              id: authData.user.id,
              name: authData.user.user_metadata?.full_name || 
                    `${authData.user.user_metadata?.first_name || ''} ${authData.user.user_metadata?.last_name || ''}`.trim() ||
                    authData.user.email?.split('@')[0] || 
                    'User',
              email: authData.user.email,
              userType: authData.user.user_metadata?.user_type || 'student'
            };
            localStorage.setItem('userProfile', JSON.stringify(basicProfile));
            console.log('Using basic profile from auth metadata:', basicProfile.name);
          }
        } catch (profileError) {
          console.error('Error loading user profile:', profileError);
          // Continue with sign in even if profile loading fails
        }
      }

      // Track sign in event
      trackSignIn('email');

      return {
        user: authData.user,
        session: authData.session,
        error: null
      };
    } catch (error) {
      console.error('Sign in exception:', error);
      return {
        user: null,
        session: null,
        error: error as Error
      };
    }
  }

  /**
   * Start Google sign-in. This redirects the browser to Google and back to
   * /auth/callback — it does not resolve with a session directly. `userType`
   * is only meaningful for a new sign-up (existing users keep their stored
   * role); it's carried through as a query param since Google itself has no
   * concept of student vs teacher.
   */
  static async signInWithGoogle(userType?: 'student' | 'teacher'): Promise<{ error: Error | null }> {
    try {
      const baseUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const redirectTo = `${baseUrl}/auth/callback${userType ? `?type=${userType}` : ''}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Google sign-in exception:', error);
      return { error: error as Error };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }

      // Clear all user-specific data from localStorage
      localStorage.removeItem('userProfile');
      localStorage.removeItem('currentLessonPlan');
      localStorage.removeItem('isFirstTimeUser');
      localStorage.removeItem('tutaOnboarding');
      localStorage.removeItem('teacherContent');
      
      // Clear any mytuta-prefixed items (from smart storage)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mytuta_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('User signed out successfully and localStorage cleared');
      return { error: null };
    } catch (error) {
      console.error('Sign out exception:', error);
      return { error: error as Error };
    }
  }

  /**
   * Get the current user session
   */
  static async getSession(): Promise<{ session: Session | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Get session error:', error);
        return { session: null, error };
      }

      return { session: data.session, error: null };
    } catch (error) {
      console.error('Get session exception:', error);
      return { session: null, error: error as Error };
    }
  }

  /**
   * Get the current authenticated user
   */
  static async getCurrentUser(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Get user error:', error);
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Get user exception:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Get user profile from database
   */
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Get profile error:', error);
        return { profile: null, error };
      }

      return { profile: data, error: null };
    } catch (error) {
      console.error('Get profile exception:', error);
      return { profile: null, error: error as Error };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: ProfileUpdate) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Update profile error:', error);
        return { profile: null, error };
      }

      return { profile: data, error: null };
    } catch (error) {
      console.error('Update profile exception:', error);
      return { profile: null, error: error as Error };
    }
  }

  /**
   * Reset password (send reset email)
   */
  static async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const baseUrl = import.meta.env.VITE_SITE_URL || 'https://mytuta.org';

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/reset-password`
      });

      if (error) {
        console.error('Password reset error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Password reset exception:', error);
      return { error: error as Error };
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Update password error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Update password exception:', error);
      return { error: error as Error };
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      callback(event, session);
    });
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const { session } = await this.getSession();
    return session !== null;
  }
}



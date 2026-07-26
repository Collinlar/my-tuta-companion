import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './authService';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
    })),
  },
}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackSignUp: vi.fn(),
  trackSignIn: vi.fn(),
}));

import { supabase } from '@/integrations/supabase/client';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('signUp', () => {
    it('returns user and session on success', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-abc' };
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser as any, session: mockSession as any },
        error: null,
      });

      const result = await AuthService.signUp({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Ama',
        lastName: 'Owusu',
        userType: 'student',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('returns error when signUp fails', async () => {
      const mockError = new Error('Email already in use');
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError as any,
      });

      const result = await AuthService.signUp({
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Kwame',
        lastName: 'Mensah',
        userType: 'teacher',
      });

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signIn', () => {
    it('returns user on successful sign in', async () => {
      const mockUser = { id: 'user-456', email: 'kwame@example.com', user_metadata: {} };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser as any, session: { access_token: 'tok' } as any },
        error: null,
      });

      const result = await AuthService.signIn({
        email: 'kwame@example.com',
        password: 'securepass',
      });

      expect(result.user?.id).toBe('user-456');
      expect(result.error).toBeNull();
    });

    it('returns error on wrong credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: new Error('Invalid login credentials') as any,
      });

      const result = await AuthService.signIn({ email: 'bad@example.com', password: 'wrong' });

      expect(result.user).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });

  describe('signOut', () => {
    it('clears localStorage on sign out', async () => {
      localStorage.setItem('userProfile', JSON.stringify({ name: 'Test' }));
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      const result = await AuthService.signOut();

      expect(result.error).toBeNull();
      expect(localStorage.getItem('userProfile')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'tok' } as any },
        error: null,
      });

      const result = await AuthService.isAuthenticated();
      expect(result).toBe(true);
    });

    it('returns false when no session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await AuthService.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('uses VITE_SITE_URL or fallback domain in redirect URL', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ data: {}, error: null } as any);

      await AuthService.resetPassword('user@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/reset-password'),
        })
      );

      const callArgs = vi.mocked(supabase.auth.resetPasswordForEmail).mock.calls[0];
      const redirectTo: string = (callArgs[1] as any).redirectTo;
      expect(redirectTo).not.toContain('your-actual-domain');
    });
  });
});

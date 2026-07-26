import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('@/services/authService', () => ({
  AuthService: {
    isAuthenticated: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
}));

import { AuthService } from '@/services/authService';

function renderWithRouter(authenticated: boolean) {
  vi.mocked(AuthService.isAuthenticated).mockResolvedValue(authenticated);

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Dashboard content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/signin" element={<div>Sign in page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', async () => {
    renderWithRouter(true);
    await waitFor(() => {
      expect(screen.getByText('Dashboard content')).toBeInTheDocument();
    });
  });

  it('redirects to /signin when user is not authenticated', async () => {
    renderWithRouter(false);
    await waitFor(() => {
      expect(screen.getByText('Sign in page')).toBeInTheDocument();
    });
  });
});

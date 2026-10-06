import React, { ReactNode } from 'react';
import { captureException } from '@/lib/monitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, componentStack: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureException(error, {
      component: info.componentStack?.split('\n')[1]?.trim() ?? 'ErrorBoundary',
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F3F4F6', padding: '0 16px',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 440 }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
              Something went wrong on this page.
            </p>
            <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              autoFocus
              onClick={() => {
                this.setState({ hasError: false, error: null, componentStack: null });
                window.location.reload();
              }}
              style={{
                padding: '10px 22px', background: '#1D9E75', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

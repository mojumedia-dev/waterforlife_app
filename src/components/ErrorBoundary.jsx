import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Oops! Something Went Wrong</h1>
            <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
              We're having trouble loading the app. This could be due to a connection issue or browser compatibility problem.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              Reload Page
            </button>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              If this problem persists, please try:
              <ul style={{ textAlign: 'left', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Clearing your browser cache</li>
                <li>Using a different browser</li>
                <li>Checking your internet connection</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

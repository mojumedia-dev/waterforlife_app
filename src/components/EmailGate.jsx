import { useState } from 'react';
import storage from '../utils/storage';

function EmailGate({ onEmailSubmit }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Save email and notify parent
    storage.setItem('userEmail', email);
    onEmailSubmit(email);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          fontSize: '3rem',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          💧✨
        </div>
        
        <h2 style={{
          textAlign: 'center',
          marginBottom: '0.5rem',
          color: '#1f2937'
        }}>
          Welcome to Water & Light
        </h2>
        
        <p style={{
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: '2rem',
          fontSize: '0.95rem'
        }}>
          Enter your email to access frequency protocols and save your preferences
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.9rem'
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="your@email.com"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem',
                border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb'}
            />
            {error && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.85rem',
                marginTop: '0.5rem',
                marginBottom: 0
              }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.3)';
            }}
          >
            Continue to App →
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#9ca3af',
          marginTop: '1.5rem',
          marginBottom: 0
        }}>
          Your email is stored locally on your device and used only to save your preferences.
        </p>
      </div>
    </div>
  );
}

export default EmailGate;

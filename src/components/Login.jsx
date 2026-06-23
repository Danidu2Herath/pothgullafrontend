import { useState } from 'react';
import { useApp } from '../App';

const BOOK_SVG = 'M5 4a1 1 0 0 1 1-1h11v15H6a1 1 0 0 0-1 1z';

export default function Login() {
  const { signIn } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      fontFamily: "'Public Sans', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      {/* LEFT PANEL */}
      <div style={{
        width: '46%',
        background: 'linear-gradient(155deg,#0c2a1a 0%,#166534 55%,#22c55e 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '56px 52px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg,#16a34a,#22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,.25)',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={BOOK_SVG} />
              <path d="M5 19a1 1 0 0 1 1-1h13" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Spectral, Georgia, serif', fontWeight: 700, fontSize: 26, color: '#fff', letterSpacing: '-.3px' }}>
              Poth Gulla
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#86efac', marginTop: 1 }}>
              Smart Library System
            </div>
          </div>
        </div>

        <div style={{
          fontFamily: 'Spectral, Georgia, serif',
          fontStyle: 'italic',
          fontSize: 28,
          fontWeight: 500,
          color: '#fff',
          lineHeight: 1.35,
          marginBottom: 20,
          maxWidth: 380,
        }}>
          One library, every resource, fairly shared.
        </div>

        <div style={{ color: '#bbf7d0', fontSize: 14, lineHeight: 1.7, maxWidth: 360 }}>
          Books, devices and study spaces — booked, queued and tracked through a single transparent,
          points-based system. Sign in and the dashboard adapts to your role automatically.
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        flex: 1,
        background: '#eeeef4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: '36px 36px 30px',
            boxShadow: '0 4px 24px rgba(0,0,0,.07)',
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#16231b', marginBottom: 4 }}>
              Sign in
            </div>
            <div style={{ fontSize: 13, color: '#7c7e93', marginBottom: 24 }}>
              Use your Poth Gulla account. Access is granted based on your role.
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#5c5e72', display: 'block', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                autoFocus
                placeholder="you@iit.ac.lk"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#5c5e72', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{
                background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c',
                borderRadius: 10, padding: '9px 13px', fontSize: 12.5, marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 12,
                border: 'none',
                background: loading ? '#86efac' : 'linear-gradient(135deg,#16a34a,#22c55e)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'default' : 'pointer',
                boxShadow: '0 4px 16px rgba(22,163,74,.3)',
                transition: 'opacity .15s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#9b9db2' }}>
            Meridian University · Poth Gulla Smart Library
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1.5px solid #e7e7ef',
  background: '#f8f8fc',
  fontSize: 13.5,
  color: '#16231b',
  outline: 'none',
  boxSizing: 'border-box',
};

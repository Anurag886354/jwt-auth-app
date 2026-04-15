// src/components/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Dashboard.css';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/protected')
      .then(({ data }) => {
        setUserData(data);
        // Decode JWT payload for display (not verification—just for demo)
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setTokenInfo(payload);
          } catch (_) {}
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!userData) {
    return (
      <div className="dash-loading">
        <div className="loading-ring" />
        <p>Verifying JWT…</p>
      </div>
    );
  }

  const expiresAt = tokenInfo?.exp
    ? new Date(tokenInfo.exp * 1000).toLocaleTimeString()
    : '—';

  return (
    <div className="dash-bg">
      <div className="dash-container">

        {/* Header */}
        <header className="dash-header">
          <div className="dash-logo">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"
                fill="url(#sh2)" />
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="sh2" x1="3" y1="1" x2="21" y2="23" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#6c63ff" />
                  <stop offset="100%" stopColor="#48cfad" />
                </linearGradient>
              </defs>
            </svg>
            <span>SecureAuth</span>
          </div>
          <button className="btn-logout" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </header>

        {/* Welcome Hero */}
        <section className="dash-hero">
          <div className="dash-avatar">{userData.user.username[0].toUpperCase()}</div>
          <div>
            <p className="dash-greeting">Welcome back,</p>
            <h2 className="dash-username">{userData.user.username}</h2>
            <span className="dash-badge">✓ JWT Verified</span>
          </div>
        </section>

        {/* Info Cards */}
        <div className="dash-cards">
          <div className="dash-card">
            <div className="card-label">User ID</div>
            <div className="card-value">#{userData.user.id}</div>
          </div>
          <div className="dash-card">
            <div className="card-label">Username</div>
            <div className="card-value">{userData.user.username}</div>
          </div>
          <div className="dash-card">
            <div className="card-label">Token Expires</div>
            <div className="card-value expires">{expiresAt}</div>
          </div>
          <div className="dash-card">
            <div className="card-label">Auth Method</div>
            <div className="card-value">HS256 JWT</div>
          </div>
        </div>

        {/* Server Message */}
        <div className="dash-message">
          <div className="message-icon">🛡️</div>
          <div>
            <div className="message-label">Server Response  •  GET /api/protected  •  200 OK</div>
            <code className="message-body">
              {JSON.stringify({ message: userData.message, user: userData.user }, null, 2)}
            </code>
          </div>
        </div>

        {/* JWT Token Display */}
        <div className="dash-token-box">
          <div className="token-label">🔑 JWT stored in localStorage</div>
          <div className="token-parts">
            <span className="tp-header">Header</span>
            <span className="tp-dot">.</span>
            <span className="tp-payload">Payload</span>
            <span className="tp-dot">.</span>
            <span className="tp-sig">Signature</span>
          </div>
          <div className="token-raw">{localStorage.getItem('token')}</div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;

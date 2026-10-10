import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { modules } from '../data/modules';
import { getUserProgress } from '../utils/progress';

const PASSING_SCORE = 80; // percent required to unlock next module

export default function Dashboard() {
  const { currentUser, logout, userIsAdmin } = useAuth();
  const { dark, setDark } = useTheme();
  const navigate = useNavigate();
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  const bg = dark ? '#1a1a1a' : '#f5f0eb';
  const cardBg = dark ? '#2a2a2a' : '#fff';
  const text = dark ? '#f0f0f0' : '#2c1810';
  const sub = dark ? '#aaa' : '#666';

  useEffect(() => {
    if (currentUser) {
      getUserProgress(currentUser.uid).then((p) => { setProgress(p); setLoading(false); });
    }
  }, [currentUser]);

  function isUnlocked(index) {
    if (index === 0) return true;
    const prev = modules[index - 1];
    const p = progress[prev.id];
    return !!(p && p.percent >= PASSING_SCORE);
  }

  function getBadge(p) {
    if (!p) return null;
    if (p.percent >= 95) return { label: '🏆 OUTSTANDING!', bg: '#7c3aed' };
    if (p.percent >= 80) return { label: '🎉 EXCELLENT!', bg: '#22c55e' };
    if (p.percent >= 75) return { label: '👍 PASSED', bg: '#3b82f6' };
    return { label: '❌ FAILED — Retry', bg: '#ef4444' };
  }

  const passedCount = modules.filter((m) => {
    const p = progress[m.id];
    return p && p.percent >= PASSING_SCORE;
  }).length;

  const allDone = passedCount === modules.length;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div style={{ ...styles.container, background: bg }}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.logo}>🪚 Compass</div>
          <div style={styles.welcome}>Welcome, {currentUser?.displayName || 'Student'}</div>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.iconBtn} onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? '☀️' : '🌙'}</button>
          <button style={styles.iconBtn} onClick={() => navigate('/profile')} aria-label="Profile">👤</button>
          <button style={styles.iconBtn} onClick={() => navigate('/leaderboard')} aria-label="Leaderboard">🏆</button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      {/* Hero */}
      <div style={styles.hero}>
        <h2 style={styles.heroTitle}>Your Carpentry Journey</h2>
        <p style={styles.heroSub}>
          {loading ? 'Loading...' : `${passedCount} of ${modules.length} modules passed`}
        </p>
        <div style={styles.progressBarWrap}>
          <div style={{ ...styles.progressBar, width: `${(passedCount / modules.length) * 100}%` }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '8px' }}>
          Passing score required: {PASSING_SCORE}%
        </p>
      </div>

      {/* Certificate Banner */}
      {allDone && (
        <div style={styles.certBanner} onClick={() => navigate('/certificate')} role="button" tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/certificate')}>
          🎓 You passed all modules! Tap to get your Certificate →
        </div>
      )}

      {/* Module Cards */}
      <div style={styles.grid}>
        {modules.map((mod, index) => {
          const p = progress[mod.id];
          const unlocked = isUnlocked(index);
          const passed = p && p.percent >= PASSING_SCORE;
          const attempted = !!p;
          const badge = getBadge(p) ?? { label: '—', bg: '#9ca3af' };

          return (
            <div
              key={mod.id}
              style={{
                ...styles.card,
                background: unlocked ? cardBg : (dark ? '#1e1e1e' : '#f0f0f0'),
                borderTop: `4px solid ${unlocked ? mod.color : '#aaa'}`,
                opacity: unlocked ? 1 : 0.7,
                cursor: unlocked ? 'pointer' : 'not-allowed',
              }}
              onClick={() => unlocked && navigate(`/module/${mod.id}`)}
              role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && unlocked && navigate(`/module/${mod.id}`)}
              aria-label={unlocked ? `Open ${mod.title}` : `${mod.title} — locked`}
            >
              {/* Lock / Unlock icon */}
              <div style={styles.cardTopRow}>
                <div style={styles.cardIcon}>{mod.icon}</div>
                <div style={{ fontSize: '22px' }}>{unlocked ? (passed ? '🔓' : '🔓') : '🔒'}</div>
              </div>

              <h3 style={{ ...styles.cardTitle, color: unlocked ? text : (dark ? '#666' : '#aaa') }}>
                {mod.title}
              </h3>
              <p style={{ ...styles.cardDesc, color: sub }}>{mod.description}</p>

              {/* Status */}
              {!unlocked ? (
                <div style={{ ...styles.badge, background: '#9ca3af' }}>
                  🔒 Locked — Pass previous module ({PASSING_SCORE}%+)
                </div>
              ) : attempted ? (
                <div>
                  <div style={{ ...styles.badge, background: badge.bg, marginBottom: '8px' }}>
                    {badge.label} — {p.percent}%
                  </div>
                  <div style={styles.scoreBar}>
                    <div style={{ ...styles.scoreFill, width: `${p.percent}%`, background: badge.bg }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    {passed && index < modules.length - 1 && !progress[modules[index + 1].id] && (
                      <button
                        style={{ ...styles.nextBtn, background: mod.color }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/module/${modules[index + 1].id}`); }}
                        aria-label="Go to next module"
                      >
                        Next Module →
                      </button>
                    )}
                    <button
                      style={styles.retryBtn}
                      onClick={(e) => { e.stopPropagation(); navigate(`/module/${mod.id}`); }}
                      aria-label="Retry module"
                    >
                      {passed ? 'Review' : 'Retry'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ ...styles.badge, background: mod.color }}>Start Module →</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Buttons */}
      <div style={styles.bottomRow}>
        <button style={styles.feedbackBtn} onClick={() => navigate('/feedback')}>💬 Send Feedback</button>
        <button style={{ ...styles.feedbackBtn, background: '#1d4ed8' }} onClick={() => navigate('/leaderboard')}>🏆 Leaderboard</button>
        {userIsAdmin && (
          <button
            style={{...styles.feedbackBtn, background: '#8B4513', border: '2px solid #d4a574', fontWeight: '700'}}
            onClick={() => navigate('/instructor')}
            aria-label="Admin Dashboard"
          >
            🎓 Admin Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  header: {
    background: '#2c1810', color: '#fff', padding: '14px 16px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'sticky', top: 0, zIndex: 10,
  },
  logo: { fontSize: '18px', fontWeight: '700' },
  welcome: { fontSize: '12px', color: '#d4a574', marginTop: '2px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  iconBtn: {
    background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
    width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px',
  },
  logoutBtn: {
    background: 'transparent', border: '1.5px solid #d4a574', color: '#d4a574',
    padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
  },
  hero: {
    background: 'linear-gradient(135deg, #8B4513 0%, #d2691e 100%)',
    padding: '28px 20px', textAlign: 'center', color: '#fff',
  },
  heroTitle: { fontSize: '24px', fontWeight: '700', margin: '0 0 6px' },
  heroSub: { fontSize: '14px', opacity: 0.9, margin: '0 0 12px' },
  progressBarWrap: { background: 'rgba(255,255,255,0.3)', borderRadius: '10px', height: '10px', maxWidth: '300px', margin: '0 auto' },
  progressBar: { background: '#fff', borderRadius: '10px', height: '10px', transition: 'width 0.5s ease' },
  certBanner: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff',
    padding: '14px 20px', textAlign: 'center', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
    gap: '16px', padding: '20px 16px',
  },
  card: { borderRadius: '16px', padding: '22px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'opacity 0.3s' },
  cardTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  cardIcon: { fontSize: '38px' },
  cardTitle: { fontSize: '17px', fontWeight: '700', margin: '0 0 6px' },
  cardDesc: { fontSize: '13px', lineHeight: 1.5, margin: '0 0 14px' },
  badge: { display: 'inline-block', color: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  scoreBar: { height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' },
  scoreFill: { height: '6px', borderRadius: '3px', transition: 'width 0.4s' },
  nextBtn: {
    flex: 1, color: '#fff', border: 'none', padding: '8px 12px',
    borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
  },
  retryBtn: {
    background: 'transparent', border: '1.5px solid #aaa', color: '#666',
    padding: '7px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  },
  bottomRow: { display: 'flex', gap: '12px', padding: '0 16px 40px', justifyContent: 'center', flexWrap: 'wrap' },
  feedbackBtn: {
    background: '#2c1810', color: '#fff', border: 'none',
    padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
  },
};

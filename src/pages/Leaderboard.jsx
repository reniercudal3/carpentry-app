import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAllProgress } from '../utils/progress';
import { getUserProfiles } from '../utils/users';
import { modules } from '../data/modules';

export default function Leaderboard() {
  const { currentUser } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  const bg = dark ? '#1a1a1a' : '#f5f0eb';
  const cardBg = dark ? '#2a2a2a' : '#fff';
  const text = dark ? '#f0f0f0' : '#2c1810';
  const sub = dark ? '#aaa' : '#666';

  useEffect(() => {
    getAllProgress().then(async (data) => {
      // Group by userId
      const byUser = {};
      data.forEach((entry) => {
        if (!byUser[entry.userId]) byUser[entry.userId] = { userId: entry.userId, modules: 0, totalScore: 0, totalQ: 0 };
        byUser[entry.userId].modules++;
        byUser[entry.userId].totalScore += entry.score;
        byUser[entry.userId].totalQ += entry.total;
      });
      const sorted = Object.values(byUser)
        .map((u) => ({ ...u, percent: u.totalQ > 0 ? Math.round((u.totalScore / u.totalQ) * 100) : 0 }))
        .sort((a, b) => b.percent - a.percent || b.modules - a.modules);
      // Load real profiles
      const uids = sorted.map((r) => r.userId);
      const profileMap = await getUserProfiles(uids);
      setProfiles(profileMap);
      setRows(sorted);
      setLoading(false);
    });
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ ...styles.container, background: bg }}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/dashboard')} aria-label="Back">← Dashboard</button>
        <div style={styles.headerTitle}>🏆 Leaderboard</div>
      </div>

      <div style={styles.body}>
        <div style={{ ...styles.card, background: cardBg }}>
          <h3 style={{ ...styles.sectionTitle, color: text }}>Top Students</h3>
          {loading ? (
            <p style={{ color: sub }}>Loading scores...</p>
          ) : rows.length === 0 ? (
            <p style={{ color: sub }}>No scores yet. Complete a quiz to appear here!</p>
          ) : rows.map((row, i) => (
            <div key={row.userId}
              style={{ ...styles.row, background: row.userId === currentUser?.uid ? (dark ? '#3a2a1a' : '#fef3e2') : 'transparent' }}>
              <div style={styles.rank}>
                {i < 3 ? medals[i] : <span style={{ color: sub }}>#{i + 1}</span>}
              </div>
              <div style={styles.rowInfo}>
                <div style={{ color: text, fontWeight: row.userId === currentUser?.uid ? '700' : '500', fontSize: '15px' }}>
                  {row.userId === currentUser?.uid
                    ? `${profiles[row.userId]?.displayName ?? currentUser?.displayName} (You)`
                    : profiles[row.userId]?.displayName ?? `Student ${i + 1}`}
                </div>
                <div style={{ color: sub, fontSize: '12px' }}>{row.modules}/{modules.length} modules • {row.totalScore} correct answers</div>
              </div>
              <div style={{ ...styles.scoreBadge, background: row.percent >= 80 ? '#22c55e' : row.percent >= 50 ? '#f59e0b' : '#ef4444' }}>
                {row.percent}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  header: {
    background: '#2c1810', color: '#fff', padding: '14px 16px',
    display: 'flex', alignItems: 'center', gap: '14px',
    position: 'sticky', top: 0, zIndex: 10,
  },
  back: {
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
  },
  headerTitle: { fontSize: '17px', fontWeight: '700' },
  body: { padding: '16px', maxWidth: '600px', margin: '0 auto' },
  card: { borderRadius: '16px', padding: '22px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '16px' },
  row: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px', borderRadius: '10px', marginBottom: '8px',
  },
  rank: { fontSize: '24px', width: '36px', textAlign: 'center', flexShrink: 0 },
  rowInfo: { flex: 1 },
  scoreBadge: {
    color: '#fff', padding: '6px 12px', borderRadius: '20px',
    fontSize: '14px', fontWeight: '700', flexShrink: 0,
  },
};

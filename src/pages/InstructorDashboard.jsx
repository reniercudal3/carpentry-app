import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAllProgress, getAllFeedback } from '../utils/progress';
import { getAllAdmins, addAdmin, removeAdmin } from '../utils/admin';
import { getUserProfiles } from '../utils/users';
import { modules } from '../data/modules';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function InstructorDashboard() {
  const { currentUser, userIsAdmin } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [tab, setTab] = useState('students');
  const [loading, setLoading] = useState(true);
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminLabel, setNewAdminLabel] = useState('');
  const [adminMsg, setAdminMsg] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  const bg = dark ? '#1a1a1a' : '#f5f0eb';
  const cardBg = dark ? '#2a2a2a' : '#fff';
  const text = dark ? '#f0f0f0' : '#2c1810';
  const sub = dark ? '#aaa' : '#666';

  useEffect(() => {
    if (!userIsAdmin) return;
    Promise.all([getAllProgress(), getAllFeedback(), getAllAdmins()]).then(async ([p, f, a]) => {
      setProgress(p);
      setFeedback(f.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setAdmins(a);
      // Load real user profiles
      const uids = [...new Set(p.map((e) => e.userId))];
      const profileMap = await getUserProfiles(uids);
      setProfiles(profileMap);
      setLoading(false);
    });
  }, [userIsAdmin]);

  useEffect(() => {
    if (!userIsAdmin) return;
    const ref = collection(db, 'users');
    const unsub = onSnapshot(ref, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort by createdAt descending (newest first)
      list.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setAllUsers(list);
    });
    return () => unsub();
  }, [userIsAdmin]);

  if (!userIsAdmin) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ color: text }}>Access Denied</h2>
        <p style={{ color: sub }}>This page is for admins only.</p>
        <button style={styles.btn} onClick={() => navigate('/dashboard')}>Go Back</button>
      </div>
    );
  }

  // Student summary
  const byUser = {};
  progress.forEach((entry) => {
    if (!byUser[entry.userId]) byUser[entry.userId] = { userId: entry.userId, entries: [] };
    byUser[entry.userId].entries.push(entry);
  });
  const students = Object.values(byUser).map((u) => {
    const total = u.entries.reduce((a, b) => a + b.total, 0);
    const score = u.entries.reduce((a, b) => a + b.score, 0);
    return { ...u, modulesCompleted: u.entries.length, percent: total > 0 ? Math.round((score / total) * 100) : 0, score, total };
  }).sort((a, b) => b.percent - a.percent);

  async function handleAddAdmin() {
    if (!newAdminUid.trim()) return;
    try {
      await addAdmin(newAdminUid.trim(), currentUser.uid, newAdminLabel || 'Admin');
      const updated = await getAllAdmins();
      setAdmins(updated);
      setNewAdminUid('');
      setNewAdminLabel('');
      setAdminMsg('✅ Admin added successfully!');
      setTimeout(() => setAdminMsg(''), 3000);
    } catch {
      setAdminMsg('❌ Failed to add admin. Check the UID.');
      setTimeout(() => setAdminMsg(''), 3000);
    }
  }

  async function handleRemoveAdmin(uid) {
    if (uid === currentUser.uid) {
      setAdminMsg('❌ You cannot remove yourself.');
      setTimeout(() => setAdminMsg(''), 3000);
      return;
    }
    await removeAdmin(uid);
    const updated = await getAllAdmins();
    setAdmins(updated);
    setAdminMsg('✅ Admin removed.');
    setTimeout(() => setAdminMsg(''), 3000);
  }

  return (
    <div style={{ ...styles.container, background: bg }}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/dashboard')} aria-label="Back">← Dashboard</button>
        <div style={styles.headerTitle}>🎓 Instructor Panel</div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={{ ...styles.statBox, background: cardBg }}>
          <div style={{ ...styles.statNum, color: '#8B4513' }}>{students.length}</div>
          <div style={{ ...styles.statLabel, color: sub }}>Students</div>
        </div>
        <div style={{ ...styles.statBox, background: cardBg }}>
          <div style={{ ...styles.statNum, color: '#8B4513' }}>{progress.length}</div>
          <div style={{ ...styles.statLabel, color: sub }}>Completions</div>
        </div>
        <div style={{ ...styles.statBox, background: cardBg }}>
          <div style={{ ...styles.statNum, color: '#8B4513' }}>{feedback.length}</div>
          <div style={{ ...styles.statLabel, color: sub }}>Feedback</div>
        </div>
        <div style={{ ...styles.statBox, background: cardBg }}>
          <div style={{ ...styles.statNum, color: '#8B4513' }}>{admins.length}</div>
          <div style={{ ...styles.statLabel, color: sub }}>Admins</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['students', 'feedback', 'modules', 'admins'].map((t) => (
          <button key={t}
            style={tab === t ? { ...styles.tab, ...styles.tabActive } : { ...styles.tab, color: sub }}
            onClick={() => setTab(t)}>
            {t === 'students' ? '👥 Students' : t === 'feedback' ? '💬 Feedback' : t === 'modules' ? '📊 Modules' : '🔑 Admins'}
          </button>
        ))}
      </div>

      <div style={styles.body}>
        {loading ? <p style={{ color: sub }}>Loading...</p> : (
          <>
            {/* Students */}
            {tab === 'students' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {/* Total count */}
                <div style={{...styles.card, background: cardBg, padding: '12px 18px'}}>
                  <div style={{color: text, fontWeight: '700', fontSize: '15px'}}>
                    👥 {allUsers.length} Registered User{allUsers.length !== 1 ? 's' : ''}
                  </div>
                  <div style={{color: sub, fontSize: '12px', marginTop: '4px'}}>
                    Real-time · updates automatically as students register
                  </div>
                </div>

                {allUsers.length === 0 ? (
                  <div style={{...styles.card, background: cardBg, color: sub}}>No users registered yet.</div>
                ) : (
                  <div style={{...styles.card, background: cardBg}}>
                    {allUsers.map((u, i) => {
                      const userProgress = byUser[u.id];
                      const percent = userProgress
                        ? Math.round((userProgress.entries.reduce((a, b) => a + b.score, 0) /
                            Math.max(userProgress.entries.reduce((a, b) => a + b.total, 0), 1)) * 100)
                        : null;
                      const isCurrentUser = u.id === currentUser.uid;
                      return (
                        <div key={u.id} style={{...styles.studentRow,
                          borderBottom: i < allUsers.length - 1 ? '1px solid #f0f0f0' : 'none'}}>
                          <div style={{width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #8B4513, #d2691e)',
                            color: '#fff', fontSize: '16px', fontWeight: '700',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',}}>
                            {(u.displayName || u.email || 'U')[0].toUpperCase()}
                          </div>
                          <div style={styles.studentInfo}>
                            <div style={{color: text, fontWeight: '600', fontSize: '14px'}}>
                              {u.displayName || 'Legacy Account'}
                              {isCurrentUser && <span style={{color: '#22c55e', fontSize: '11px', marginLeft: '6px'}}>● You (Admin)</span>}
                            </div>
                            {u.email && (
                              <div style={{color: sub, fontSize: '12px', marginTop: '2px'}}>{u.email}</div>
                            )}
                            <div style={{color: sub, fontSize: '11px', marginTop: '2px'}}>
                              {u.createdAt
                                ? `Joined ${new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
                                : 'Join date unknown'}
                            </div>
                            {userProgress && (
                              <div style={{display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap'}}>
                                {userProgress.entries.map((e) => {
                                  const mod = modules.find((m) => m.id === e.moduleId);
                                  return (
                                    <span key={e.moduleId} style={{...styles.modTag, background: mod?.color ?? '#8B4513'}}>
                                      {mod?.icon} {e.percent}%
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          {percent !== null && (
                            <div style={{...styles.scoreBadge,
                              background: percent >= 80 ? '#22c55e' : percent >= 50 ? '#f59e0b' : '#ef4444'}}>
                              {percent}%
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Feedback */}
            {tab === 'feedback' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {feedback.length === 0
                  ? <div style={{ ...styles.card, background: cardBg, color: sub }}>No feedback yet.</div>
                  : feedback.map((f) => (
                    <div key={f.id} style={{ ...styles.card, background: cardBg }}>
                      <div style={styles.fbHeader}>
                        <div>
                          <div style={{ color: text, fontWeight: '600' }}>{f.name}</div>
                          <div style={{ color: sub, fontSize: '12px' }}>{f.email} • {new Date(f.date).toLocaleDateString()}</div>
                        </div>
                        <div style={styles.fbSubject}>{f.subject || 'General'}</div>
                      </div>
                      <p style={{ color: text, fontSize: '14px', marginTop: '10px', lineHeight: 1.6 }}>{f.message}</p>
                    </div>
                  ))}
              </div>
            )}

            {/* Modules */}
            {tab === 'modules' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {modules.map((mod) => {
                  const modEntries = progress.filter((p) => p.moduleId === mod.id);
                  const avgScore = modEntries.length > 0
                    ? Math.round(modEntries.reduce((a, b) => a + b.percent, 0) / modEntries.length) : 0;
                  return (
                    <div key={mod.id} style={{ ...styles.card, background: cardBg, borderLeft: `4px solid ${mod.color}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '28px' }}>{mod.icon}</span>
                          <div>
                            <div style={{ color: text, fontWeight: '600' }}>{mod.title}</div>
                            <div style={{ color: sub, fontSize: '12px' }}>{modEntries.length} completions</div>
                          </div>
                        </div>
                        <div style={{ ...styles.scoreBadge, background: mod.color }}>{avgScore}% avg</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Admins */}
            {tab === 'admins' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Add Admin */}
                <div style={{ ...styles.card, background: cardBg }}>
                  <h3 style={{ color: text, marginBottom: '16px', fontSize: '16px' }}>➕ Add New Admin</h3>
                  <p style={{ color: sub, fontSize: '13px', marginBottom: '12px', lineHeight: 1.5 }}>
                    To add an admin, you need their Firebase User UID.<br />
                    Find it in Firebase Console → Authentication → Users → copy the UID column.
                  </p>
                  {adminMsg && (
                    <div style={{ padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '14px',
                      background: adminMsg.includes('✅') ? '#dcfce7' : '#fee2e2',
                      color: adminMsg.includes('✅') ? '#166534' : '#dc2626' }}>
                      {adminMsg}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      style={{ ...styles.input, color: text, background: dark ? '#333' : '#fff', borderColor: dark ? '#555' : '#ddd' }}
                      placeholder="Firebase User UID (e.g. VTWCSTakXo...)"
                      value={newAdminUid}
                      onChange={(e) => setNewAdminUid(e.target.value)}
                      aria-label="Admin UID"
                    />
                    <input
                      style={{ ...styles.input, color: text, background: dark ? '#333' : '#fff', borderColor: dark ? '#555' : '#ddd' }}
                      placeholder="Label (e.g. Co-Instructor, Assistant)"
                      value={newAdminLabel}
                      onChange={(e) => setNewAdminLabel(e.target.value)}
                      aria-label="Admin label"
                    />
                    <button style={styles.btn} onClick={handleAddAdmin}>Add Admin</button>
                  </div>
                </div>

                {/* Current Admins */}
                <div style={{ ...styles.card, background: cardBg }}>
                  <h3 style={{ color: text, marginBottom: '16px', fontSize: '16px' }}>👥 Current Admins</h3>
                  {admins.length === 0 ? <p style={{ color: sub }}>No admins yet.</p>
                    : admins.map((a) => (
                      <div key={a.id} style={styles.adminRow}>
                        <div style={styles.adminAvatar}>
                          {(a.label?.[0] || 'A').toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: text, fontWeight: '600' }}>{a.label}</div>
                          <div style={{ color: sub, fontSize: '11px', wordBreak: 'break-all' }}>{a.uid}</div>
                          {a.uid === currentUser.uid && (
                            <div style={{ color: '#22c55e', fontSize: '11px', fontWeight: '600' }}>● You</div>
                          )}
                        </div>
                        {a.uid !== currentUser.uid && (
                          <button style={styles.removeBtn} onClick={() => handleRemoveAdmin(a.uid)} aria-label="Remove admin">
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
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
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', padding: '14px 14px 0' },
  statBox: { borderRadius: '12px', padding: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  statNum: { fontSize: '22px', fontWeight: '700' },
  statLabel: { fontSize: '10px', marginTop: '2px' },
  tabs: { display: 'flex', gap: '8px', padding: '12px 14px 0', flexWrap: 'wrap' },
  tab: {
    padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #ddd',
    background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
  },
  tabActive: { background: '#8B4513', color: '#fff', borderColor: '#8B4513' },
  body: { padding: '12px 14px 40px' },
  card: { borderRadius: '14px', padding: '18px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', marginBottom: '0' },
  studentRow: { display: 'flex', alignItems: 'flex-start', gap: '10px', paddingBottom: '14px', marginBottom: '14px', borderBottom: '1px solid #f0f0f0' },
  studentRank: { fontSize: '16px', fontWeight: '700', width: '28px', flexShrink: 0, paddingTop: '2px' },
  studentInfo: { flex: 1 },
  modTag: { color: '#fff', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
  scoreBadge: { color: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', flexShrink: 0 },
  fbHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' },
  fbSubject: { background: '#f3f4f6', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', color: '#555', flexShrink: 0 },
  input: { padding: '12px 14px', borderRadius: '8px', border: '1.5px solid', fontSize: '14px', fontFamily: 'inherit' },
  btn: { background: '#8B4513', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  adminRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  adminAvatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B4513, #d2691e)',
    color: '#fff', fontSize: '18px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  removeBtn: {
    background: '#fee2e2', color: '#dc2626', border: 'none',
    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  },
};

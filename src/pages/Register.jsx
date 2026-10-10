import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { saveUserProfile } from '../utils/users';
import { auth } from '../firebase';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register(email, password, username);
      await saveUserProfile(auth.currentUser.uid, username, email);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
    setLoading(false);
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logo}>🪚</div>
        <h1 style={styles.title}>Compass</h1>
        <p style={styles.subtitle}>Create your student account</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input} type="text" placeholder="Username"
            value={username} onChange={(e) => setUsername(e.target.value)}
            required aria-label="Username"
          />
          <input
            style={styles.input} type="email" placeholder="Email address"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required aria-label="Email address"
          />
          <input
            style={styles.input} type="password" placeholder="Password (min 6 chars)"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required aria-label="Password"
          />
          <input
            style={styles.input} type="password" placeholder="Confirm password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            required aria-label="Confirm password"
          />
          <button style={loading ? styles.btnDisabled : styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={styles.link}>
          Already have an account?{' '}
          <Link to="/login" style={styles.linkText}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #2c1810 0%, #8B4513 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  },
  card: {
    background: '#fff', borderRadius: '20px', padding: '40px 32px',
    width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center',
  },
  logo: { fontSize: '56px', marginBottom: '8px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#2c1810', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: '#888', marginBottom: '28px' },
  error: {
    background: '#fee2e2', color: '#dc2626', padding: '12px',
    borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  input: {
    padding: '14px 16px', borderRadius: '10px', border: '1.5px solid #e0e0e0',
    fontSize: '16px', outline: 'none',
  },
  btn: {
    padding: '14px', borderRadius: '10px', background: '#8B4513',
    color: '#fff', fontSize: '16px', fontWeight: '600', border: 'none', cursor: 'pointer', marginTop: '4px',
  },
  btnDisabled: {
    padding: '14px', borderRadius: '10px', background: '#ccc',
    color: '#fff', fontSize: '16px', fontWeight: '600', border: 'none', cursor: 'not-allowed', marginTop: '4px',
  },
  link: { marginTop: '20px', fontSize: '14px', color: '#666' },
  linkText: { color: '#8B4513', fontWeight: '600', textDecoration: 'none' },
};

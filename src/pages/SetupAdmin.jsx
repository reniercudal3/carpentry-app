// TEMPORARY PAGE — delete after use
// Visit /setup-admin while logged in as alanism665@gmail.com to grant admin access

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function SetupAdmin() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Setting up admin...');

  useEffect(() => {
    async function setup() {
      if (!currentUser) {
        setStatus('Please log in first with alanism665@gmail.com');
        return;
      }
      if (currentUser.email !== 'alanism665@gmail.com') {
        setStatus('❌ Wrong account. Please log in with alanism665@gmail.com');
        return;
      }
      try {
        await setDoc(doc(db, 'admins', currentUser.uid), {
          uid: currentUser.uid,
          label: 'Admin',
          addedBy: 'system',
          addedAt: new Date().toISOString()
        });
        setStatus('✅ Admin access granted! Redirecting...');
        setTimeout(() => navigate('/instructor'), 2000);
      } catch (err) {
        setStatus('❌ Error: ' + err.message);
      }
    }
    setup();
  }, [currentUser, navigate]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#2c1810', color: '#fff',
      fontFamily: 'sans-serif', fontSize: '18px', textAlign: 'center', padding: 24
    }}>
      <div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🧭</div>
        <p>{status}</p>
      </div>
    </div>
  );
}

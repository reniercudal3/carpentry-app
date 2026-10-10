import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { isAdmin, addAdmin } from '../utils/admin';
import { seedOwnerAdmin } from '../utils/seedAdmin';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  function register(email, password, username) {
    return createUserWithEmailAndPassword(auth, email, password).then((cred) =>
      updateProfile(cred.user, { displayName: username })
    );
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await seedOwnerAdmin(); // seeds owner on first ever login
        // Auto-grant admin for the owner email if not already admin
        if (user.email === 'alanism665@gmail.com') {
          const alreadyAdmin = await isAdmin(user.uid);
          if (!alreadyAdmin) {
            await addAdmin(user.uid, 'system', 'Owner / Head Instructor');
          }
        }
        const adminStatus = await isAdmin(user.uid);
        setUserIsAdmin(adminStatus);
      } else {
        setUserIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = { currentUser, userIsAdmin, register, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

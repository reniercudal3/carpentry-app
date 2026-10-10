// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBTS9cdw5WH2AhbCTR5FC3fcht6EmyPspU",
  authDomain: "carpentry-app-6800c.firebaseapp.com",
  projectId: "carpentry-app-6800c",
  storageBucket: "carpentry-app-6800c.firebasestorage.app",
  messagingSenderId: "55717902439",
  appId: "1:55717902439:web:dca800621d8ba22a2efcc2",
  measurementId: "G-0FM9H3WJWD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
const firebaseConfig = {
  apiKey: "AIzaSyBSG-BFD8kvEaDgK941RtpB_EXdUtPAhu4",
  authDomain: "aegis-35c13.firebaseapp.com",
  projectId: "aegis-35c13",
  storageBucket: "aegis-35c13.firebasestorage.app",
  messagingSenderId: "782610992724",
  appId: "1:782610992724:web:47827308ba032f81eda7c1",
  measurementId: "G-M4H6NV3X77"
};

const app = initializeApp(firebaseConfig)

export const firebaseAuth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
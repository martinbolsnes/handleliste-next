import { auth } from './config/firebase.config'; // Import the `auth` from config
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

export const currentUser = () => {
  return onAuthStateChanged(auth, (user) => {
    // Handle user state changes here
  });
};

export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider); // Sign in using auth
};

export const logOut = () => {
  return signOut(auth); // Sign out using auth
};

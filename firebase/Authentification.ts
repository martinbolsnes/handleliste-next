import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import firebase from './config/firebase.config';

export const auth = getAuth(firebase);

export const currentUser = () => {
  return onAuthStateChanged(auth, (user) => {});
};

export const signInWithGoogle = () =>
  signInWithPopup(auth, new GoogleAuthProvider());

export const logOut = () => signOut(auth);

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig); // Firebase app instance

// Get Firestore instance
const db = getFirestore(app);

// Get Auth instance
const auth = getAuth(app); // Pass FirebaseApp instance here

export { app, db, auth };

export const syncListWithPusher = (userId: string) => {
  if (!userId) return;

  // Query groceries where userId matches the logged-in user
  const groceriesQuery = query(
    collection(db, 'groceries'),
    where('userId', '==', userId)
  );

  onSnapshot(groceriesQuery, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Notify Pusher of the changes
    axios
      .post('/api/pusher', { event: 'grocery-updated', data })
      .catch(console.error);
  });
};

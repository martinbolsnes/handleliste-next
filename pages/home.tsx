import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config/firebase.config';
import { logOut } from '../firebase/Authentification';
import { FiLogOut, FiTrash, FiPlus } from 'react-icons/fi';
import { query, where } from 'firebase/firestore';
import Pusher from 'pusher-js';
import Link from 'next/link';

interface Grocery {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
}

const Home = () => {
  const [groceriesList, setGroceriesList] = useState<Grocery[]>([]);
  const [grocerieItem, setGroceriesItem] = useState('');
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Initialize Firestore listener
    const groceriesQuery = query(
      collection(db, 'groceries'),
      where('userId', '==', user.uid)
    );
    const unsubscribeFirestore = onSnapshot(groceriesQuery, (snapshot) => {
      setGroceriesList((prevGroceries) => {
        const fetchedGroceries: Grocery[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Grocery[];

        // Avoid duplicates by filtering out existing IDs
        const uniqueGroceries = fetchedGroceries.filter(
          (newItem) =>
            !prevGroceries.some((existing) => existing.id === newItem.id)
        );

        return [...prevGroceries, ...uniqueGroceries];
      });
    });

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe('grocery-channel');

    channel.bind('item-added', (data: Grocery) => {
      setGroceriesList((prev) => {
        if (prev.some((item) => item.id === data.id)) {
          return prev; // Prevent duplicate
        }
        return [...prev, data];
      });
    });

    channel.bind('item-updated', (data: { id: string; completed: boolean }) => {
      setGroceriesList((prev) =>
        prev.map((item) =>
          item.id === data.id ? { ...item, completed: data.completed } : item
        )
      );
    });

    channel.bind('item-deleted', (data: { id: string }) => {
      setGroceriesList((prev) => prev.filter((item) => item.id !== data.id));
    });

    return () => {
      unsubscribeFirestore();
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [user]);

  const addGrocerieItem = async () => {
    if (!user) {
      console.error('Error adding item: User is not authenticated');
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'groceries'), {
        title: grocerieItem,
        completed: false,
        userId: user?.uid,
      });

      // Send real-time update to Pusher
      await fetch('/api/pusher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'item-added',
          data: { id: docRef.id, title: grocerieItem, completed: false },
        }),
      });

      setGroceriesItem('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const toggleCompleted = async (groceryId: string, completed: boolean) => {
    const ref = doc(db, `groceries/${groceryId}`);
    await updateDoc(ref, { completed });

    // Notify Pusher
    await fetch('/api/pusher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'item-updated',
        data: { id: groceryId, completed },
      }),
    });
  };

  const deleteGrocery = async (groceryId: string) => {
    const ref = doc(db, `groceries/${groceryId}`);
    await deleteDoc(ref);

    // Notify Pusher
    await fetch('/api/pusher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'item-deleted', data: { id: groceryId } }),
    });
  };

  const Logout = () => {
    logOut().then(() => router.push('/'));
  };

  if (loading) {
    return <p>Loading...</p>; // Prevents rendering until user is set
  }
  return (
    <div className='flex flex-col h-full items-center max-w-md w-full'>
      <div className='flex items-center justify-between bg-greenPrimary w-full px-4 pb-2 pt-8 border-b-2 border-zinc-800/10 fixed z-50'>
        <Link href='/invites'>
          <button className='text-yellowPrimary font-sans'>Invites</button>
        </Link>
        <h1 className='font-heading text-3xl text-yellowPrimary'>
          Handleliste
        </h1>
        <FiLogOut color='#ddea90' size={30} className='' onClick={Logout} />
      </div>
      <div className='mt-24 flex flex-col w-full h-3/4 overflow-auto'>
        <ul>
          {groceriesList.map((grocery) => (
            <li
              key={grocery.id}
              className='flex justify-between items-center font-sans px-4 py-4 mt-4 mr-2 ml-2 bg-zinc-100 rounded-md'
            >
              <div className='flex items-center justify-center'>
                <input
                  id='input'
                  className='mr-6 h-6 w-6'
                  type='checkbox'
                  checked={grocery.completed}
                  onChange={(e) =>
                    toggleCompleted(grocery.id, e.target.checked)
                  }
                />
                <p className='font-sans text-lg'>{grocery.title}</p>
              </div>
              <FiTrash
                size={20}
                color='#C41A08'
                onClick={() => deleteGrocery(grocery.id)}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className='flex w-full max-w-md bg-greenPrimary justify-between items-center px-4 pt-6 pb-4 fixed bottom-6 border-t-2 border-zinc-800/10'>
        <input
          placeholder='Legg til...'
          className='w-3/4 font-sans px-4 py-4 mr-2 ml-2 h-12 bg-zinc-100 rounded-md'
          value={grocerieItem}
          onChange={(e) => setGroceriesItem(e.target.value)}
        />
        <button
          onClick={addGrocerieItem}
          className='w-12 h-12 bg-yellowPrimary rounded-full flex items-center justify-center'
        >
          <FiPlus size={30} />
        </button>
      </div>
      {/* <Toaster
        position='bottom-center'
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      /> */}
    </div>
  );
};
export default Home;

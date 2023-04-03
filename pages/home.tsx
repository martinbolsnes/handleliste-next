import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import firestore from '../firebase/config/firebase.config';
import { logOut } from '../firebase/Authentification';
import { FiLogOut, FiTrash, FiPlus } from 'react-icons/fi';

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
  const auth = getAuth(firestore);
  const db = getFirestore(firestore);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'groceries'), (snapshot) => {
      const fetchedGroceries: Grocery[] = [];
      snapshot.forEach((doc) => {
        const grocery = {
          id: doc.id,
          title: doc.data().title,
          completed: doc.data().completed,
          userId: doc.data().userId,
        };
        fetchedGroceries.push(grocery);
      });
      setGroceriesList(fetchedGroceries);
    });

    return () => {
      unsubscribe();
    };
  }, [db]);

  const addGrocerieItem = async () => {
    const doc = await addDoc(collection(db, 'groceries'), {
      title: grocerieItem,
      completed: false,
      userId: auth.currentUser?.uid,
    });
    setGroceriesItem('');
  };

  const toggleCompleted = async (groceryId: string, completed: boolean) => {
    const ref = doc(db, `groceries/${groceryId}`);
    await updateDoc(ref, { completed });
    setGroceriesList((prevGroceriesList) =>
      prevGroceriesList.map((grocery) =>
        grocery.id === groceryId ? { ...grocery, completed } : grocery
      )
    );
  };

  const deleteGrocery = async (groceryId: string) => {
    const ref = doc(db, `groceries/${groceryId}`);
    await deleteDoc(ref);
    setGroceriesList((prevGroceriesList) =>
      prevGroceriesList.filter((grocery) => grocery.id !== groceryId)
    );
  };

  const Logout = () => {
    logOut().then(() => router.push('/'));
  };
  return (
    <div className='flex flex-col h-full items-center max-w-md w-full'>
      <div className='flex items-center justify-center bg-greenPrimary w-full pb-2 pt-8 border-b-2 border-zinc-800/10 fixed z-50'>
        <h1 className='font-heading text-3xl text-yellowPrimary'>
          Handleliste
        </h1>
        <FiLogOut
          color='#ddea90'
          size={30}
          className='absolute right-4 top-9'
          onClick={Logout}
        />
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
                  className='mr-6 h-4 w-4'
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
      <div className='flex w-full justify-between items-center px-4 pt-6 fixed bottom-6 border-t-2 border-zinc-800/10'>
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

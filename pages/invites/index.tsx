import Invitations from '@/components/Invitations';
import InviteUser from '@/components/InviteUser';
import { logOut } from '@/firebase/Authentification';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiLogOut } from 'react-icons/fi';

const Invites = () => {
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const Logout = () => {
    logOut().then(() => router.push('/'));
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className='flex flex-col h-full items-center max-w-md w-full'>
      <div className='flex items-center justify-between bg-greenPrimary w-full px-4 pb-2 pt-8 border-b-2 border-zinc-800/10 fixed z-50'>
        <Link href='/'>
          <button className='text-yellowPrimary font-sans'>Home</button>
        </Link>
        <h1 className='font-heading text-3xl text-yellowPrimary'>
          Handleliste
        </h1>
        <FiLogOut color='#ddea90' size={30} className='' onClick={Logout} />
      </div>
      <div className='flex flex-col gap-4 justify-items-center mt-24 text-center'>
        <h2 className='font-sans text-xl text-yellowPrimary'>Invite Users</h2>
        <InviteUser user={user!} listId={'groceries'} />

        <h2 className='font-sans text-xl text-yellowPrimary'>
          Your Invitations
        </h2>
        <Invitations user={user!} />
      </div>
    </div>
  );
};

export default Invites;

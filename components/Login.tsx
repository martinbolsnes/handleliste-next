import React from 'react';
import { signInWithGoogle } from '../firebase/Authentification';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import { FiSmile } from 'react-icons/fi';
import Lottie from 'react-lottie-player';
import lottieJson from '../public/SNcJj53nfg.json';

function Login() {
  const router = useRouter();

  const LoginWithGoogle = () => {
    signInWithGoogle()
      .then(() => {
        router.push('/home');
      })
      .catch((error) => {
        toast(error.message, {
          icon: '⛔️',
        });
      });
  };

  return (
    <div className='flex flex-col gap-12 h-full items-center max-w-md w-full'>
      <div className='mt-12'>
        <FiSmile className='text-yellowPrimary' size={50} />
      </div>
      <div>
        <p className='font-heading font-normal text-3xl text-yellowPrimary'>
          Logg inn
        </p>
      </div>
      <div>
        <Lottie
          className='-mt-28'
          play
          loop
          animationData={lottieJson}
          style={{ height: '300px', width: '300px' }}
        ></Lottie>
      </div>
      <div className='flex'>
        <button
          className='flex items-center justify-center font-sans font-medium py-4 px-12 rounded-md bg-yellowPrimary'
          onClick={LoginWithGoogle}
        >
          Google
        </button>
      </div>
      <Toaster
        position='bottom-center'
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default Login;

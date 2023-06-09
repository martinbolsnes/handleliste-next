import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import AuthContext from '../store/auth.context';
import Loading from '../components/Loading';
import Login from '../components/Login';

function AuthCheck({ children }: any) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (user && !loading && router.pathname === '/') {
      router.replace('/home');
    }
  }, [loading, router, user]);

  if (user && !loading && router.pathname !== '/') {
    return children;
  } else if (!user && !loading) {
    return <Login />;
  } else {
    return <Loading />;
  }
}

export default AuthCheck;

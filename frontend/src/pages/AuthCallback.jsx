import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AuthCallback({ setUser }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      import('../services/api').then(({ auth }) => {
        auth.getMe().then(response => {
          setUser(response.data);
          navigate('/dashboard');
        }).catch(err => {
          console.error('Auth error:', err);
          navigate('/login');
        });
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setUser]);

  return <div className="loading">Authenticating...</div>;
}

export default AuthCallback;

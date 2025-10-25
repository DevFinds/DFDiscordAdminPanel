import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../services/api';

function AuthCallback({ setUser }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const token = searchParams.get('token');
        
        console.log('AuthCallback: token received:', !!token);
        
        if (!token) {
          console.error('AuthCallback: No token in URL');
          navigate('/login');
          return;
        }

        // Save token to localStorage
        localStorage.setItem('token', token);
        console.log('AuthCallback: token saved to localStorage');

        // Get user info with the token
        const response = await auth.getMe();
        console.log('AuthCallback: user data received:', response.data);
        
        setUser(response.data);
        
        // Navigate to dashboard
        console.log('AuthCallback: navigating to dashboard');
        navigate('/dashboard', { replace: true });
        
      } catch (err) {
        console.error('AuthCallback error:', err);
        console.error('Error response:', err.response?.data);
        
        // Clear potentially invalid token
        localStorage.removeItem('token');
        
        // Show error and redirect to login
        alert(`Ошибка авторизации: ${err.response?.data?.error || err.message}`);
        navigate('/login', { replace: true });
      }
    };

    handleAuth();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="loading">
          <div className="loading-spinner">🔄</div>
          <h2>Авторизация...</h2>
          <p style={{ color: 'var(--text-tertiary)' }}>
            Завершаем процесс входа в систему
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthCallback;
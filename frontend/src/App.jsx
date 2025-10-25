import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './components/Dashboard';
import ServerSettings from './pages/ServerSettings';
import Navbar from './components/Navbar';
import { auth } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    console.log('App: checking auth, token exists:', !!token);
    
    if (!token) {
      console.log('App: no token found, user not authenticated');
      setLoading(false);
      return;
    }

    try {
      console.log('App: fetching user data with token');
      const response = await auth.getMe();
      console.log('App: user data received:', response.data);
      setUser(response.data);
      setAuthError(null);
    } catch (err) {
      console.error('App: auth check failed:', err);
      console.error('App: error response:', err.response?.data);
      
      // Clear invalid token
      localStorage.removeItem('token');
      setUser(null);
      setAuthError(err.response?.data?.error || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('App: logging out user');
    try {
      await auth.logout();
    } catch (err) {
      console.error('App: logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setAuthError(null);
      console.log('App: user logged out, token cleared');
    }
  };

  const handleUserUpdate = (newUser) => {
    console.log('App: user updated:', newUser);
    setUser(newUser);
    setAuthError(null);
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="loading">
            <div className="loading-spinner animate-spin">🔄</div>
            <h2>Загрузка приложения...</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
              Проверяем авторизацию
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        {/* Error display */}
        {authError && !user && (
          <div className="alert alert-error" style={{ margin: 'var(--space-4)' }}>
            <span>⚠️</span>
            <div>
              <strong>Ошибка авторизации:</strong> {authError}
            </div>
          </div>
        )}
        
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
          />
          
          <Route 
            path="/auth/callback" 
            element={<AuthCallback setUser={handleUserUpdate} />} 
          />
          
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} 
          />
          
          <Route 
            path="/server/:guildId" 
            element={user ? <ServerSettings /> : <Navigate to="/login" replace />} 
          />
          
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
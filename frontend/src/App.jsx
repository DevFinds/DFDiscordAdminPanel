import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import ModernDashboard from './components/ModernDashboard';
import ServerSettings from './pages/ServerSettings';
import { ThemeProvider } from './contexts/ThemeContext';
import { auth } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await auth.getMe();
      setUser(response.data);
      setAuthError(null);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      setAuthError(err.response?.data?.error || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setAuthError(null);
    }
  };

  const handleUserUpdate = (newUser) => {
    setUser(newUser);
    setAuthError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-discord-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Загрузка приложения...</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Проверяем авторизацию</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
          {/* Error display */}
          {authError && !user && (
            <div className="mx-4 pt-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 max-w-md mx-auto">
                <div className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200 text-sm">Ошибка авторизации</h3>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">{authError}</p>
                </div>
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
              element={user ? <ModernDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
            />
            
            <Route 
              path="/server/:guildId" 
              element={user ? <ServerSettings /> : <Navigate to="/login" replace />} 
            />
            
            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
            
            <Route 
              path="*" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
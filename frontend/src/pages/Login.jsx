import React from 'react';
import { auth } from '../services/api';
import { FaDiscord } from 'react-icons/fa';

function Login() {
  const handleLogin = () => {
    window.location.href = auth.loginUrl();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Discord Admin Panel</h1>
        <p>Manage your Discord servers through an easy-to-use web dashboard</p>
        <button className="btn-discord" onClick={handleLogin}>
          <FaDiscord size={24} />
          Login with Discord
        </button>
      </div>
    </div>
  );
}

export default Login;

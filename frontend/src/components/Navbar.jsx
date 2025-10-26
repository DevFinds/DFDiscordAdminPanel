import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function Navbar({ user, onLogout }) {
  const avatarUrl = user?.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : '/default-avatar.png';
  return (
    <nav className="topbar">
      <div className="container topbar-inner">
        <Link to="/dashboard" className="brand">
          <span className="badge">DF</span>
          <span>DevFinds Admin Panel</span>
        </Link>
        <div className="right">
          <ThemeToggle />
          <img className="avatar" src={avatarUrl} alt={user?.username || 'avatar'} />
          <button className="btn" onClick={onLogout}>Выход</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

import React from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

function Navbar({ user, onLogout }) {
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
    : '/default-avatar.png';

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/dashboard" className="logo">Discord Admin Panel</Link>
        <div className="user-menu">
          <img src={avatarUrl} alt={user.username} className="avatar" />
          <span>{user.username}</span>
          <button onClick={onLogout} className="btn-logout">
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

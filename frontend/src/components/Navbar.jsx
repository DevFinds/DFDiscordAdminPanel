import React from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaCog } from 'react-icons/fa';
import Button from '../ui/Button';

function Navbar({ user, onLogout }) {
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
    : '/default-avatar.png';

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/dashboard" className="logo">
          <div className="flex items-center gap-3">
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, var(--brand), var(--success))',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--font-size-sm)'
            }}>
              DF
            </div>
            <span style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              letterSpacing: 'var(--letter-spacing-tight)'
            }}>
              DevFinds Discord Admin Panel
            </span>
          </div>
        </Link>
        
        <div className="user-menu">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={avatarUrl} 
                alt={user.username} 
                className="avatar"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  border: '2px solid var(--border-default)',
                  transition: 'border-color var(--duration-fast) var(--ease-out)'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = 'var(--border-interactive)'}
                onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-primary)'
                }}>
                  {user.username}
                </div>
                <div style={{ 
                  fontSize: 'var(--font-size-xs)', 
                  color: 'var(--text-tertiary)'
                }}>
                  Администратор
                </div>
              </div>
            </div>
            
            <div style={{ width: '1px', height: '24px', background: 'var(--border-default)' }} />
            
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FaSignOutAlt />}
              onClick={onLogout}
              className="btn-logout"
            >
              Выход
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
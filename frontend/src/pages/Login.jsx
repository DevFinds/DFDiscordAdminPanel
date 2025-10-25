import React from 'react';
import { auth } from '../services/api';
import { FaDiscord, FaShieldAlt, FaCog, FaUsers } from 'react-icons/fa';
import Button from '../ui/Button';

function Login() {
  const handleLogin = () => {
    window.location.href = auth.loginUrl();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, var(--brand), var(--success))',
            borderRadius: 'var(--radius-2xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: 'var(--font-size-2xl)',
            margin: '0 auto var(--space-6) auto',
            boxShadow: 'var(--shadow-lg)'
          }}>
            DF
          </div>
          
          <h1 className="text-gradient" style={{ marginBottom: 'var(--space-3)' }}>
            DevFinds Discord Admin Panel
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            lineHeight: 'var(--line-height-relaxed)',
            fontSize: 'var(--font-size-base)'
          }}>
            Профессиональная панель управления Discord серверами с автоматизацией и интеграциями
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)'
        }}>
          {[
            { icon: <FaUsers />, title: 'Приветствия', desc: 'Автоматические сообщения' },
            { icon: <FaShieldAlt />, title: 'Роли', desc: 'Управление доступом' },
            { icon: <FaCog />, title: 'Интеграции', desc: 'RSS и Buildin' }
          ].map((feature, index) => (
            <div 
              key={index}
              style={{
                background: 'var(--surface-overlay)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                textAlign: 'center',
                transition: 'all var(--duration-fast) var(--ease-out)'
              }}
              className="feature-card"
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--border-strong)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border-subtle)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{
                color: 'var(--brand)',
                fontSize: 'var(--font-size-xl)',
                marginBottom: 'var(--space-2)'
              }}>
                {feature.icon}
              </div>
              <div style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-1)'
              }}>
                {feature.title}
              </div>
              <div style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-tertiary)',
                lineHeight: 'var(--line-height-snug)'
              }}>
                {feature.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Login Button */}
        <Button
          variant="primary"
          size="xl"
          fullWidth
          leftIcon={<FaDiscord />}
          onClick={handleLogin}
          style={{
            fontSize: 'var(--font-size-lg)',
            background: 'linear-gradient(135deg, #5865F2, #7289DA)',
            border: 'none',
            boxShadow: 'var(--shadow-xl)',
            marginBottom: 'var(--space-6)'
          }}
        >
          Войти через Discord
        </Button>
        
        {/* Footer */}
        <div style={{
          textAlign: 'center',
          paddingTop: 'var(--space-6)',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-tertiary)',
            lineHeight: 'var(--line-height-relaxed)'
          }}>
            Безопасная авторизация через Discord OAuth2<br/>
            Мы не храним ваши личные данные
          </div>
          <div style={{
            marginTop: 'var(--space-3)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-quaternary)'
          }}>
            Powered by <span style={{ color: 'var(--brand)', fontWeight: 'var(--font-weight-semibold)' }}>DevFinds</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
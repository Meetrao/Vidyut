import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import './Header.css';

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/upload': return 'Data Portal';
      case '/analytics': return 'Deep Analytics';
      case '/history': return 'Usage History';
      case '/alerts': return 'Sentinels';
      case '/admin': return 'Admin Console';
      default: return 'VIDYUT';
    }
  };

  return (
    <header className="main-header animate-fade">
      <div className="header-left">
        <div className="breadcrumb">
          <Logo size={20} className="header-brand-logo" />
          <span className="root">VIDYUT</span>
          <span className="separator">/</span>
        </div>
        <div className="header-title-row">
          <h2 className="header-title">{getPageTitle()}</h2>
          <div className="sync-indicator">
            <span className="sync-dot"></span>
            Real-time Sync Active
          </div>
        </div>
      </div>

      <div className="header-right">
        <ThemeToggle />
        <NotificationCenter />
        
        <div className="v-divider"></div>
        
        <div className="user-greeting">
          <div className="greeting-text">
            <span>Welcome back,</span>
            <p>{user?.name}</p>
          </div>
          <div className="header-avatar-group">
            <div className="header-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="status-indicator"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
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
          <span className="root">VIDYUT</span>
          <span className="separator">/</span>
          <span className="current">{getPageTitle()}</span>
        </div>
        <h2 className="header-title">{getPageTitle()}</h2>
      </div>

      <div className="header-right">
        <NotificationCenter />
        
        <div className="v-divider"></div>
        
        <div className="user-greeting">
          <div className="greeting-text">
            <span>Welcome back,</span>
            <p>{user?.name}</p>
          </div>
          <div className="header-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

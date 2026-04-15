import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className={`theme-toggle-btn ${theme}`} 
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      <div className="toggle-track">
        <div className="toggle-icon sun">☀️</div>
        <div className="toggle-icon moon">🌙</div>
        <div className="toggle-thumb"></div>
      </div>
    </button>
  );
}

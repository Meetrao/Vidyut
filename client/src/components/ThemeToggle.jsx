import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from './Icons';
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
        <div className="toggle-icon sun">
          <Sun size={14} />
        </div>
        <div className="toggle-icon moon">
          <Moon size={14} />
        </div>
        <div className="toggle-thumb"></div>
      </div>
    </button>
  );
}

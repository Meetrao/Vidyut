import React from 'react';

export default function Logo({ size = 48, className = '' }) {
  return (
    <div className={`vidyut-logo ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Main Bolt/V Shape */}
        <path
          d="M30 15L75 15L45 50L80 50L25 90L40 55L15 55L30 15Z"
          fill="url(#logo-gradient)"
          filter="url(#logo-glow)"
          style={{ animation: 'shimmer 4s infinite linear' }}
        />
        
        {/* Accent Accents */}
        <path
          d="M30 15L75 15L65 25L35 25L30 15Z"
          fill="rgba(255,255,255,0.2)"
        />
      </svg>
    </div>
  );
}

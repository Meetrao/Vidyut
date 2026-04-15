import React from 'react';

export default function Loader() {
  return (
    <div className="loader-overlay">
      <div className="loader-rings">
        <div className="ring ring-1"></div>
        <div className="ring ring-2"></div>
        <div className="ring ring-3"></div>
      </div>
      <p className="loader-text">Initializing Intel...</p>
    </div>
  );
}

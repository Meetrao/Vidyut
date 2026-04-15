import React from 'react';
import { ArrowUpRight, ArrowDownRight } from './Icons';
import './StatCard.css';

export default function StatCard({ label, value, icon, variant, trend, trendDir }) {
  return (
    <div className={`card stat-card ${variant || ''}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <h2 className="stat-value">{value}</h2>
        {trend && (
          <span className={`stat-trend ${trendDir === 'up' ? 'up' : 'down'}`}>
            {trendDir === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {trend}
          </span>
        )}
      </div>
    </div>
  );
}

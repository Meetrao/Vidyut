import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import { getStats } from '../services/api';
import './Dashboard.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
);

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { labels: { color: 'var(--text-muted)', font: { size: 12, family: 'Inter' } } },
    tooltip: {
      backgroundColor: 'var(--tooltip-bg)',
      titleColor: 'var(--text-main)',
      bodyColor: 'var(--text-main)',
      titleFont: { size: 14, family: 'Outfit' },
      bodyFont: { size: 13, family: 'Inter' },
      padding: 12,
      cornerRadius: 12,
      borderColor: 'var(--accent-emerald)',
      borderWidth: 1
    }
  },
  scales: {
    x: { ticks: { color: 'var(--text-muted)' }, grid: { color: 'var(--grid-line)' } },
    y: { 
      ticks: { color: 'var(--text-muted)' }, 
      grid: { color: 'var(--grid-line)' },
      title: { display: true, text: 'Z-Score Intensity', color: 'var(--text-muted)' }
    },
  },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ from: '', to: '', peakOnly: false });

  useEffect(() => {
    const params = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.peakOnly) params.peakHour = 'true';

    setLoading(true);
    getStats(params)
      .then((res) => {
        setStats(res.data);
        setError('');
      })
      .catch(() => setError('Could not load data. Is the server running?'))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) return <div className="loader-container"><Loader /></div>;

  const monthly = stats?.monthly || [];

  const lineData = {
    labels: monthly.map((m) => m.month),
    datasets: [{
      label: 'Units (kWh)',
      data: monthly.map((m) => m.units),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#fff',
      pointHoverRadius: 6,
    }],
  };

  const barData = {
    labels: monthly.map((m) => m.month),
    datasets: [{
      label: 'Cost (₹)',
      data: monthly.map((m) => m.cost),
      backgroundColor: 'rgba(16, 185, 129, 0.5)',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 12,
    }],
  };

  return (
    <div className="animate-fade">
      {error && <div className="card" style={{ color: '#fca5a5', marginBottom: 32, border: '1px solid rgba(248,113,113,0.2)' }}>⚠️ {error}</div>}

      {stats?.anomalyCount > 0 && (
        <div className="card anomaly-banner">
          <div className="banner-icon">⚠️</div>
          <div className="banner-text">
            <strong>{stats.anomalyCount} Anomalous Reading(s) Detected</strong>
            <p>Unusual consumption spikes identified in your recent data. <Link to="/analytics">View Analysis →</Link></p>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <StatCard 
          label="Total Consumption" 
          value={`${stats?.totalUnits.toLocaleString('en-IN', { maximumFractionDigits: 1 })} kWh`} 
          icon="⚡" 
          variant="emerald"
        />
        <StatCard 
          label="Estimated Cost" 
          value={`₹${stats?.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} 
          icon="💰" 
          variant="green"
        />
        <StatCard 
          label="Avg. Monthly Units" 
          value={`${stats?.avgUnits.toLocaleString('en-IN', { maximumFractionDigits: 1 })} kWh`} 
          icon="📊" 
          variant="blue"
        />
        <StatCard 
          label="Total Anomalies" 
          value={stats?.anomalyCount || 0} 
          icon="🔴" 
          variant="red"
          trend={stats?.anomalyCount > 0 ? "Review Needed" : "System Healthy"}
          trendDir={stats?.anomalyCount > 0 ? "up" : "down"}
        />
      </div>

      {monthly.length > 0 ? (
        <div className="charts-container">
          <div className="card chart-card">
            <h3 className="chart-title">Consumption Trend (Monthly)</h3>
            <div style={{ flex: 1, minHeight: 300 }}>
              <Line data={lineData} options={CHART_OPTS} />
            </div>
          </div>
          <div className="card chart-card">
            <h3 className="chart-title">Cost Analysis (Monthly)</h3>
            <div style={{ flex: 1, minHeight: 300 }}>
              <Bar data={barData} options={CHART_OPTS} />
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-text">No data available for the selected period.</div>
            <div className="empty-state-sub">Please upload a CSV file or check your filters.</div>
          </div>
        </div>
      )}
    </div>
  );
}

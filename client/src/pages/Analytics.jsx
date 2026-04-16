import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getAnomalies, getRecommendations, getDaily } from '../services/api';
import Loader from '../components/Loader';
import { AlertCircle, Lightbulb, Brain, Sparkles, Zap } from '../components/Icons';
import './Analytics.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { labels: { color: '#94a3b8', font: { size: 12, family: 'Inter' } } },
    tooltip: {
      backgroundColor: 'rgba(1, 22, 22, 0.9)',
      titleFont: { size: 14, family: 'Outfit' },
      bodyFont: { size: 13, family: 'Inter' },
      padding: 12,
      cornerRadius: 12,
      borderColor: 'rgba(248, 113, 113, 0.3)',
      borderWidth: 1
    }
  },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { 
      ticks: { color: '#64748b' }, 
      grid: { color: 'rgba(255,255,255,0.05)' },
      title: { display: true, text: 'Breach Ratio Intensity', color: '#94a3b8' }
    },
  },
};

export default function Analytics() {
  const [anomalies, setAnomalies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '' });
  const [tempFilters, setTempFilters] = useState({ from: '', to: '' });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAnomalies(filters),
      getRecommendations(filters),
      getDaily(filters)
    ])
      .then(([aRes, rRes, dRes]) => {
        setAnomalies(aRes.data);
        setRecommendations(rRes.data.recommendations || []);
        // If filtering, we might want to show all daily records in the chart, not just last 30
        setDaily(filters.from || filters.to ? dRes.data : dRes.data.slice(-30));
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const handleApplyFilters = () => {
    setFilters({ ...tempFilters });
  };

  if (loading) return <div className="loader-container"><Loader /></div>;

  const fmtDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const anomalyChartData = {
    labels: daily.map((d) => fmtDate(d.date)),
    datasets: [{
      label: 'Anomaly Intensity (Breach Ratio)',
      data: daily.map((d) => d.breachRatio || 0),
      borderColor: '#f87171',
      backgroundColor: 'rgba(248, 113, 113, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: (context) => {
        const item = daily[context.dataIndex];
        return item?.anomaly ? '#f87171' : 'transparent';
      },
      pointBorderColor: (context) => {
        const item = daily[context.dataIndex];
        return item?.anomaly ? '#fff' : 'transparent';
      },
      pointRadius: (context) => {
        const item = daily[context.dataIndex];
        return item?.anomaly ? 6 : 0;
      },
      pointHoverRadius: (context) => {
        const item = daily[context.dataIndex];
        return item?.anomaly ? 8 : 0;
      },
    }],
  };

  return (
    <div className="animate-fade">

      {/* Sentinel Filter Bar */}
      <div className="card filter-bar animate-fade" style={{ marginBottom: 32, display: 'flex', gap: 20, alignItems: 'flex-end', padding: '24px 30px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8, letterSpacing: '0.05em' }}>OBSERVATION START</label>
          <input 
            type="date" 
            className="form-input" 
            style={{ width: '100%' }}
            value={tempFilters.from}
            onChange={(e) => setTempFilters({ ...tempFilters, from: e.target.value })}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8, letterSpacing: '0.05em' }}>OBSERVATION END</label>
          <input 
            type="date" 
            className="form-input" 
            style={{ width: '100%' }}
            value={tempFilters.to}
            onChange={(e) => setTempFilters({ ...tempFilters, to: e.target.value })}
          />
        </div>
        <button 
          className="btn btn-emerald" 
          style={{ height: 42, padding: '0 24px', fontWeight: 700, letterSpacing: '0.05em' }}
          onClick={handleApplyFilters}
        >
          APPLY FILTERS
        </button>
        {(filters.from || filters.to) && (
          <button 
            className="btn btn-ghost" 
            style={{ height: 42, color: '#f87171' }}
            onClick={() => {
              setTempFilters({ from: '', to: '' });
              setFilters({ from: '', to: '' });
            }}
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Main Analysis Chart */}
      <div className="card full-width-chart animate-fade" style={{ marginBottom: 32 }}>
        <h3 className="chart-title">Breach Ratio Intensity (Anomaly Detection)</h3>
        <div style={{ height: 350 }}>
          <Line data={anomalyChartData} options={CHART_OPTS} />
        </div>
      </div>

      <div className="grid-2">
        {/* Anomaly Records */}
        <div className="card section-card">
          <div className="section-header">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={20} /> Flagged Readings
            </h3>
            <span className="badge badge-red">{anomalies.length} Detected</span>
          </div>
          
          <div className="table-wrapper" style={{ marginTop: 20 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Units</th>
                  <th>Breach Ratio</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.length > 0 ? (
                  anomalies.map((a) => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 600 }}>{new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td><span className="badge badge-blue">{a.units} kWh</span></td>
                      <td><span className="badge badge-red">{a.breachRatio.toFixed(2)}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      No anomalies detected in the current data set.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card section-card recommendations-panel">
          <div className="section-header">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lightbulb size={20} /> Smart Initiatives
            </h3>
            <p className="section-desc">Personalized tips to lower your bills.</p>
          </div>

          <div className="rec-list">
            {recommendations.length > 0 ? (
              recommendations.map((rec, i) => (
                <div key={i} className="rec-item animate-fade">
                  <div className="rec-icon">
                    {rec.type === 'seasonal' ? <Sparkles size={20} /> : rec.type === 'high_usage' ? <AlertCircle size={20} /> : <Zap size={20} />}
                  </div>
                  <div className="rec-content">
                    <h4 className="rec-title">{rec.title}</h4>
                    <p className="rec-text">{rec.message}</p>
                    <div className="rec-footer">
                      <span className={`badge ${rec.severity === 'critical' ? 'badge-red' : rec.severity === 'warning' ? 'badge-blue' : 'badge-green'}`}>
                        {rec.saving} ESTIMATED SAVINGS
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><Brain size={48} /></div>
                <p className="empty-state-text">Waiting for real-time data...</p>
                <span className="empty-state-sub">AI insights will appear once patterns are detected.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

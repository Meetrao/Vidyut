import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getAnomalies, getRecommendations, getDaily } from '../services/api';
import Loader from '../components/Loader';
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
      title: { display: true, text: 'Z-Score Intensity', color: '#94a3b8' }
    },
  },
};

export default function Analytics() {
  const [anomalies, setAnomalies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnomalies(), getRecommendations(), getDaily()])
      .then(([aRes, rRes, dRes]) => {
        setAnomalies(aRes.data);
        setRecommendations(rRes.data);
        setDaily(dRes.data.slice(-30));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-container"><Loader /></div>;

  const fmtDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const anomalyChartData = {
    labels: daily.map((d) => fmtDate(d.date)),
    datasets: [{
      label: 'Anomaly Intensity (Z-Score)',
      data: daily.map((d) => d.anomalyScore || 0),
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

      {/* Main Analysis Chart */}
      <div className="card full-width-chart animate-fade" style={{ marginBottom: 32 }}>
        <h3 className="chart-title">Z-Score Intensity (Anomaly Detection)</h3>
        <div style={{ height: 350 }}>
          <Line data={anomalyChartData} options={CHART_OPTS} />
        </div>
      </div>

      <div className="grid-2">
        {/* Anomaly Records */}
        <div className="card section-card">
          <div className="section-header">
            <h3 className="section-title">🔴 Flagged Readings</h3>
            <span className="badge badge-red">{anomalies.length} Detected</span>
          </div>
          
          <div className="table-wrapper" style={{ marginTop: 20 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Units</th>
                  <th>Z-Score</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.length > 0 ? (
                  anomalies.map((a) => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 600 }}>{new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td><span className="badge badge-blue">{a.units} kWh</span></td>
                      <td><span className="badge badge-red">{a.anomalyScore.toFixed(2)}</span></td>
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
            <h3 className="section-title">💡 Smart Initiatives</h3>
            <p className="section-desc">Personalized tips to lower your BESCOM/Grid bills.</p>
          </div>

          <div className="rec-list">
            {recommendations.length > 0 ? (
              recommendations.map((rec, i) => (
                <div key={i} className="rec-item">
                  <div className="rec-icon">
                    {rec.type === 'Above-Average' ? '📈' : rec.type === 'Anomalous' ? '🚨' : '⏲️'}
                  </div>
                  <div className="rec-content">
                    <h4 className="rec-title">{rec.type} Strategy</h4>
                    <p className="rec-text">{rec.message}</p>
                    <div className="rec-footer">
                      <span className={`badge ${rec.priority === 'High' ? 'badge-red' : 'badge-green'}`}>
                        {rec.savings} SAVINGS
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-rec">
                Gathering insights... Keep uploading data to see smart tips.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

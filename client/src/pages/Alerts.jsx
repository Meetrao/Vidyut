import React, { useEffect, useState, useCallback } from 'react';
import { getAlerts, deleteAlert } from '../services/api';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
import { BarChart, Trash, Bell } from '../components/Icons';
import './Alerts.css';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { add } = useToast();

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await getAlerts();
      setAlerts(res.data);
    } catch (err) {
      add('Failed to load alerts', 'error');
    } finally {
      setLoading(false);
    }
  }, [add]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);


  const handleDelete = async (id) => {
    try {
      await deleteAlert(id);
      add('Sentinel deactivated', 'success');
      fetchAlerts();
    } catch (err) {
      add('Failed to delete alert', 'error');
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Active Alerts List */}
        <div className="card alert-list-card">
          <div className="card-header">
            <h3 className="card-title">Active Sentinels</h3>
            <p className="card-desc">Thresholds currently under monitoring for Bharat Intelligence.</p>
          </div>

          <div className="alert-items">
            {loading ? (
              <Loader />
            ) : alerts.length > 0 ? (
              alerts.map((a) => (
                <div key={a._id} className="alert-item card">
                  <div className="alert-item-icon">
                    {a.type === 'cost' ? <div style={{ fontSize: '1.2rem' }}>₹</div> : <BarChart size={20} />}
                  </div>
                  <div className="alert-item-content">
                    <h4>{a.name}</h4>
                    <p>Trigger: {a.type === 'cost' ? '₹' : ''}{a.threshold} {a.type === 'units' ? 'kWh' : ''}</p>
                  </div>
                  <button className="btn-icon" onClick={() => handleDelete(a._id)}><Trash size={18} /></button>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: '60px 20px' }}>
                <div className="empty-state-icon"><Bell size={32} /></div>
                <p>No active sentinels configured.</p>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Background AI monitoring is always active.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

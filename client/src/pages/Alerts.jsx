import React, { useEffect, useState, useCallback } from 'react';
import { getAlerts, createAlert, deleteAlert } from '../services/api';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
import { Zap, Radio, Coins, BarChart, Trash, Bell } from '../components/Icons';
import './Alerts.css';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { add } = useToast();
  
  const [form, setForm] = useState({
    name: '',
    type: 'cost',
    threshold: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAlert(form);
      add('Alert sentinel activated!', 'success');
      setForm({ name: '', type: 'cost', threshold: '' });
      fetchAlerts();
    } catch (err) {
      add('Failed to create alert', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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

      <div className="grid-2">
        {/* Create Alert Form */}
        <div className="card alert-config-card">
          <div className="card-header">
            <h3 className="card-title">New Sentinel</h3>
            <p className="card-desc">Set a trigger for automated notifications.</p>
          </div>

          <form onSubmit={handleSubmit} className="alert-form">
            <div className="form-group">
              <label className="form-label">Alert Profile Name</label>
              <input
                className="form-input"
                placeholder="e.g. Monthly Budget"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Monitored Metric</label>
              <div className="metric-toggle-btns">
                <button
                  type="button"
                  className={`btn ${form.type === 'cost' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => setForm({ ...form, type: 'cost' })}
                >
                  <Coins size={16} /> Currency
                </button>
                <button
                  type="button"
                  className={`btn ${form.type === 'units' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => setForm({ ...form, type: 'units' })}
                >
                  <Zap size={16} /> Units
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Threshold Value ({form.type === 'cost' ? '₹' : 'kWh'})</label>
              <input
                className="form-input"
                type="number"
                placeholder={`e.g. ${form.type === 'cost' ? '5000' : '400'}`}
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={submitting}>
              {submitting ? 'Activating...' : <><Radio size={18} /> Activate Alert</>}
            </button>
          </form>
        </div>

        {/* Active Alerts List */}
        <div className="card alert-list-card">
          <div className="card-header">
            <h3 className="card-title">Active Sentinels</h3>
            <p className="card-desc">Thresholds currently under monitoring.</p>
          </div>

          <div className="alert-items">
            {loading ? (
              <Loader />
            ) : alerts.length > 0 ? (
              alerts.map((a) => (
                <div key={a._id} className="alert-item card">
                  <div className="alert-item-icon">
                    {a.type === 'cost' ? <Coins size={20} /> : <BarChart size={20} />}
                  </div>
                  <div className="alert-item-content">
                    <h4>{a.name}</h4>
                    <p>Trigger: {a.type === 'cost' ? '₹' : ''}{a.threshold} {a.type === 'units' ? 'kWh' : ''}</p>
                  </div>
                  <button className="btn-icon" onClick={() => handleDelete(a._id)}><Trash size={18} /></button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><Bell size={32} /></div>
                <p>No alerts configured yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

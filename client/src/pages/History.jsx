import React, { useEffect, useState, useCallback } from 'react';
import { getUsage, deleteUsage, exportUsage } from '../services/api';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
import { Export, Trash, ArrowRight } from '../components/Icons';
import './History.css';

export default function History() {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { add } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsage({ ...filters, page, limit: 15 });
      setUsage(res.data.records);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      add('Failed to fetch history', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, page, add]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteUsage(id);
      add('Record deleted', 'success');
      fetchData();
    } catch (err) {
      add('Delete failed', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportUsage(filters);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `electricity_usage_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      add('Export successful', 'success');
    } catch (err) {
      add('Export failed', 'error');
    }
  };

  if (loading) return <div className="loader-container"><Loader /></div>;

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleExport}>
          <Export size={18} /> Export CSV
        </button>
      </div>

      <div className="card filter-card animate-fade" style={{ marginBottom: 32, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="filter-group">
          <label className="form-label">From</label>
          <input
            className="form-input"
            type="date"
            style={{ width: 160 }}
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label className="form-label">To</label>
          <input
            className="form-input"
            type="date"
            style={{ width: 160 }}
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <button
          className="btn btn-ghost"
          style={{ marginTop: 22 }}
          onClick={() => setFilters({ from: '', to: '' })}
        >
          Reset Filters
        </button>
      </div>

      <div className="table-wrapper animate-fade">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Consumption (kWh)</th>
              <th>Cost (₹)</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usage.length > 0 ? (
              usage.map((u) => (
                <tr key={u._id} className={u.anomaly ? 'anomaly-row' : ''}>
                  <td style={{ fontWeight: 600 }}>{new Date(u.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>{u.units} kWh</td>
                  <td>₹{u.cost.toLocaleString('en-IN')}</td>
                  <td>
                    {u.anomaly && <span className="badge badge-red" style={{ marginRight: 8 }}>Anomaly</span>}
                    {u.peakHour && <span className="badge badge-blue">Peak</span>}
                    {!u.anomaly && !u.peakHour && <span className="badge" style={{ opacity: 0.5 }}>Standard</span>}
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleDelete(u._id)} title="Delete record"><Trash size={18} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  No records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-bar animate-fade">
          <button 
            className="btn-pagination" 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <span className="page-info">
            Page <span className="current">{page}</span> of <span className="total">{totalPages}</span>
          </span>
          <button 
            className="btn-pagination" 
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

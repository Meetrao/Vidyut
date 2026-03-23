import React, { useState } from 'react';
import { useToast } from '../components/Toast';
import { uploadCSV, addUsage } from '../services/api';
import './Upload.css';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const { add } = useToast();
  
  const [manualData, setManualData] = useState({
    date: new Date().toISOString().split('T')[0],
    units: '',
    cost: ''
  });

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'text/csv' || droppedFile?.name.endsWith('.csv')) {
      setFile(droppedFile);
    } else {
      add('Please upload a valid CSV file', 'error');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadCSV(formData);
      add(`Successfully imported ${res.data.inserted} records!`, 'success');
      setFile(null);
    } catch (err) {
      add(err.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addUsage({ ...manualData, source: 'Manual' });
      add('Record saved successfully!', 'success');
      setManualData({
        date: new Date().toISOString().split('T')[0],
        units: '',
        cost: ''
      });
    } catch (err) {
      add(err.response?.data?.error || 'Failed to add record', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade">
      <header className="page-header">
        <h1 className="page-title">Data Portal</h1>
        <p className="page-subtitle">Feed VIDYUT with your latest consumption records.</p>
      </header>

      <div className="grid-2">
        {/* CSV Upload Section */}
        <div className="card upload-card">
          <div className="card-header">
            <h3 className="card-title">Bulk Upload</h3>
            <p className="card-desc">Drag and drop your electricity bill CSV here.</p>
          </div>

          <div
            className={`dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="dropzone-icon">☁️</div>
            <p>{file ? `Selected: ${file.name}` : 'Drop CSV file or click to browse'}</p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="fileInput"
            />
            <button className="btn btn-ghost" onClick={() => document.getElementById('fileInput').click()}>
              Browse Files
            </button>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 24 }}
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? 'Processing...' : '⚡ Sync to Cloud'}
          </button>
        </div>

        {/* Manual Entry Section */}
        <div className="card upload-card">
          <div className="card-header">
            <h3 className="card-title">Manual Log</h3>
            <p className="card-desc">Record a single reading from your meter.</p>
          </div>

          <form onSubmit={handleManualSubmit} className="manual-form">
            <div className="form-group">
              <label className="form-label">Reading Date</label>
              <input
                className="form-input"
                type="date"
                required
                value={manualData.date}
                onChange={(e) => setManualData({ ...manualData, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Units Consumed (kWh)</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 320"
                required
                value={manualData.units}
                onChange={(e) => setManualData({ ...manualData, units: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Cost (₹)</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 1850"
                required
                value={manualData.cost}
                onChange={(e) => setManualData({ ...manualData, cost: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? 'Saving...' : '💾 Save Record'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

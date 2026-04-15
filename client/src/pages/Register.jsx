import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useToast } from '../components/Toast';
import Logo from '../components/Logo';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { add } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      add('Account created! Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      add(err.response?.data?.error || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade">
      <div className="auth-card card">
        <div className="auth-header">
          <Logo size={64} className="auth-logo-center" />
          <h1 className="auth-title">VIDYUT</h1>
          <p className="auth-subtitle">Create Network Account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Arjun Singh"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="arjun@example.in"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Security Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Processing...' : 'Request Access'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have access? <Link to="/login">Sign In</Link></p>
          <p className="auth-note" style={{ marginTop: 12, fontSize: '0.75rem', opacity: 0.6 }}>
            💡 First registered user automatically becomes Admin
          </p>
        </div>
      </div>
    </div>
  );
}

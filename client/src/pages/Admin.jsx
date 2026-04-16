import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, updateUserRole, deleteUser, purgeSystemData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
import './Admin.css';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { add } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      add('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [add]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRole(userId, newRole);
      add(`User promoted to ${newRole}`, 'success');
      fetchUsers();
    } catch (err) {
      add('Update failed', 'error');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      add('User deleted', 'success');
      fetchUsers();
    } catch (err) {
      add('Delete failed', 'error');
    }
  };

  const handlePurge = async () => {
    if (!window.confirm('WARNING: This will permanently delete ALL consumption data and alerts. Proceed to Absolute Zero?')) return;
    try {
      await purgeSystemData();
      add('System Purified to Absolute Zero', 'success');
      window.location.reload(); 
    } catch (err) {
      add('Purge failed', 'error');
    }
  };

  if (loading) return <div className="loader-container"><Loader /></div>;

  return (
    <div className="animate-fade">

      <div className="card admin-stats animate-fade" style={{ marginBottom: 32, display: 'flex', gap: 40, padding: '30px 40px' }}>
        <div className="admin-stat-item">
          <span className="stat-label">Total Users</span>
          <h2 className="stat-value">{users.length}</h2>
        </div>
        <div className="admin-stat-item">
          <span className="stat-label">Network Status</span>
          <h2 className="stat-value" style={{ color: 'var(--accent-emerald)' }}>ONLINE</h2>
        </div>
        <div className="admin-stat-item" style={{ marginLeft: 'auto', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 40 }}>
           <button 
             className="btn btn-red"
             style={{ padding: '12px 24px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em' }}
             onClick={handlePurge}
           >
             PURGE ABSOLUTE ZERO
           </button>
        </div>
      </div>

      <div className="table-wrapper animate-fade">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{u.name} {u._id === currentUser.id && '(you)'}</span>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge-blue' : ''}`} style={{ opacity: u.role === 'admin' ? 1 : 0.6 }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>
                  {u._id !== currentUser.id && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => handleRoleChange(u._id, u.role)}
                      >
                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                      <button 
                        className="btn-icon" 
                        style={{ fontSize: '0.9rem' }}
                        onClick={() => handleDelete(u._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

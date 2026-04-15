import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead } from '../services/api';
import { Bell, AlertCircle, Radio, Lightbulb, Sparkles } from './Icons';
import './NotificationCenter.css';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  return (
    <div className="notification-center" ref={dropdownRef}>
      <button 
        className={`notification-trigger ${unreadCount > 0 ? 'has-unread' : ''} ${isOpen ? 'active' : ''}`} 
        onClick={handleToggle}
        aria-label="Toggle notifications"
      >
        <div className="bell-icon-wrapper">
          <Bell size={22} />
        </div>
        {unreadCount > 0 && <span className="notification-dot"></span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown animate-spring">
          <div className="dropdown-glow-top"></div>
          <div className="dropdown-header">
            <div className="header-meta">
              <h3>Intelligence Feed</h3>
              <p>{notifications.length} logs cached</p>
            </div>
            {unreadCount > 0 && <span className="unread-pill">{unreadCount} New</span>}
          </div>
          
          <div className="dropdown-scroll-area">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n._id} 
                  className={`n-card ${n.isRead ? 'read' : 'unread'} ${n.severity}`}
                  onClick={() => !n.isRead && handleMarkRead(n._id)}
                >
                  <div className="n-indicator"></div>
                  <div className="n-icon">
                    {n.type === 'anomaly' ? <AlertCircle size={18} /> : n.type === 'sentinel_breach' ? <Radio size={18} /> : <Lightbulb size={18} />}
                  </div>
                  <div className="n-content">
                    <div className="n-top">
                      <span className="n-title">{n.title}</span>
                      <span className="n-time">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="n-message">{n.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="n-empty">
                <div className="n-empty-icon">
                  <Sparkles size={32} />
                </div>
                <p>System is healthy.</p>
                <span>All anomalies processed.</span>
              </div>
            )}
          </div>

          <div className="dropdown-footer">
            <button 
              className="btn-text" 
              onClick={() => {
                setIsOpen(false);
                navigate('/history');
              }}
            >
              View All History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

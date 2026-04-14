import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, markNotificationRead } from '../services/api';
import './NotificationCenter.css';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

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
      <button className="notification-trigger" onClick={handleToggle}>
        <span className="icon">🔔</span>
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown animate-slide-down">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            <span className="count">{unreadCount} New</span>
          </div>
          <div className="dropdown-content">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n._id} 
                  className={`notification-item ${n.isRead ? 'read' : 'unread'} ${n.severity}`}
                  onClick={() => !n.isRead && handleMarkRead(n._id)}
                >
                  <div className="n-type-icon">
                    {n.type === 'anomaly' ? '🚨' : n.type === 'sentinel_breach' ? '📡' : '💡'}
                  </div>
                  <div className="n-body">
                    <p className="n-title">{n.title}</p>
                    <p className="n-message">{n.message}</p>
                    <span className="n-time">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {!n.isRead && <div className="unread-dot"></div>}
                </div>
              ))
            ) : (
              <div className="empty-notifications">
                <p>System is calm. No alerts.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

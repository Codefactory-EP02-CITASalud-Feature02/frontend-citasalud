import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'confirmation' | 'cancelled' | 'results' | 'system';
  priority: 'high' | 'medium' | 'low';
  time: string;
  read: boolean;
  icon: string;
  sentVia: string;
}

const STORAGE_KEY = 'medical-app-notifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      time: new Date().toLocaleString('es-ES', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return {
    notifications,
    addNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead
  };
};

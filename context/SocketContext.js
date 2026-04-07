'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../lib/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const accessToken = localStorage.getItem('accessToken');
      
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
        auth: { token: accessToken }
      });

      const fetchInitialData = async () => {
        try {
          const res = await api.get('/user/notifications');
          setNotifications(res.data.data);
          const unread = res.data.data.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        } catch (err) {
          console.error('Failed to fetch initial notifications:', err);
        }
      };
      fetchInitialData();

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('unread_count', (data) => {
        setUnreadCount(data.count);
      });

      newSocket.on('new_notification', (data) => {
        // data should be the notification object
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        if (Notification.permission === 'granted') {
          new Notification('MafynGate', {
            body: data.content || data.message,
            icon: '/favicon.ico'
          });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      setSocket(null);
    }
  }, [user]);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  const removeNotification = async (id) => {
    try {
      await api.delete(`/user/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearNotifications = async () => {
    try {
      await api.delete('/user/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      unreadCount, 
      notifications, 
      setUnreadCount, 
      requestNotificationPermission,
      removeNotification,
      clearNotifications
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

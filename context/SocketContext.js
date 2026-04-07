'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const accessToken = localStorage.getItem('accessToken'); // Assuming it's in localStorage or we get it from api.js
      
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
        auth: {
          token: accessToken
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('unread_count', (data) => {
        setUnreadCount(data.count);
      });

      newSocket.on('new_notification', (data) => {
        setUnreadCount(data.count);
        setNotifications(prev => [data, ...prev]);
        
        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification('MafynGate Chat', {
            body: data.message,
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

  return (
    <SocketContext.Provider value={{ socket, unreadCount, notifications, setUnreadCount, requestNotificationPermission }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

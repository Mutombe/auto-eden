/**
 * Custom hook for WebSocket connections in Auto Eden.
 * Provides real-time notifications and dashboard updates.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'wss://auto-eden-backend.onrender.com';

/**
 * Hook for managing WebSocket connection for notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const { isAuthenticated, tokens } = useSelector((state) => state.auth);

  const connect = useCallback(() => {
    if (!isAuthenticated || !tokens?.access) {
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`${WS_BASE_URL}/ws/notifications/?token=${tokens.access}`);

    ws.onopen = () => {
      console.log('Notification WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'notification') {
          setNotifications((prev) => [data.notification, ...prev]);
        } else if (data.type === 'connection_established') {
          console.log('Notification service ready');
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('Notification WebSocket closed:', event.code);
      setIsConnected(false);

      // Reconnect after 5 seconds if not intentionally closed
      if (event.code !== 1000 && isAuthenticated) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [isAuthenticated, tokens]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000);
      }
    };
  }, [connect]);

  const markAsRead = useCallback((notificationId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_read',
        notification_id: notificationId
      }));
    }
  }, []);

  const clearNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  return {
    notifications,
    isConnected,
    markAsRead,
    clearNotification,
    setNotifications
  };
}

/**
 * Hook for managing WebSocket connection for admin dashboard stats
 */
export function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const { isAuthenticated, tokens, user } = useSelector((state) => state.auth);

  const connect = useCallback(() => {
    if (!isAuthenticated || !tokens?.access || !user?.is_staff) {
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`${WS_BASE_URL}/ws/dashboard/?token=${tokens.access}`);

    ws.onopen = () => {
      console.log('Dashboard WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'initial_stats' || data.type === 'stats_update') {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('Dashboard WebSocket closed:', event.code);
      setIsConnected(false);

      // Reconnect after 5 seconds if not intentionally closed
      if (event.code !== 1000 && isAuthenticated && user?.is_staff) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [isAuthenticated, tokens, user]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000);
      }
    };
  }, [connect]);

  const refreshStats = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'refresh_stats'
      }));
    }
  }, []);

  return {
    stats,
    isConnected,
    refreshStats
  };
}

export default useNotifications;

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, CheckCheck, Trash2, RefreshCw, X, Settings } from "lucide-react";
import { CircularProgress } from "@mui/material";
import NotificationItem from "./NotificationItem";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllRead,
} from "../../redux/slices/notificationSlice";
import { useNavigate } from "react-router-dom";

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { items, unreadCount, loading, error } = useSelector(
    (state) => state.notifications || { items: [], unreadCount: 0, loading: false }
  );

  // Fetch notifications and unread count on mount
  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications());
    }
  }, [isOpen, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAllRead = () => {
    dispatch(clearAllRead());
  };

  const handleRefresh = () => {
    dispatch(fetchNotifications());
  };

  const handleNotificationClick = (notification) => {
    // Navigate based on notification type
    if (notification.related_object_id) {
      switch (notification.notification_type) {
        case "approval":
        case "rejection":
          navigate(`/vehicle/${notification.related_object_id}`);
          break;
        case "bid":
          navigate(`/dashboard`);
          break;
        default:
          break;
      }
    }
    setIsOpen(false);
  };

  const unreadItems = items.filter((n) => !n.is_read);
  const readItems = items.filter((n) => n.is_read);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              {unreadItems.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {readItems.length > 0 && (
                <button
                  onClick={handleClearAllRead}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Clear read notifications"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[400px]">
            {loading && items.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <CircularProgress size={32} />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <p>Failed to load notifications</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              <>
                {/* Unread Section */}
                {unreadItems.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New ({unreadItems.length})
                    </div>
                    {unreadItems.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onClick={handleNotificationClick}
                      />
                    ))}
                  </div>
                )}

                {/* Read Section */}
                {readItems.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earlier
                    </div>
                    {readItems.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onClick={handleNotificationClick}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
            <button
              onClick={() => {
                navigate("/settings/notifications");
                setIsOpen(false);
              }}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Notification Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

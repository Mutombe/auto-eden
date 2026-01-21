import React from "react";
import {
  CheckCircle,
  XCircle,
  DollarSign,
  Bell,
  AlertTriangle,
  Car,
  Trash2,
  Check
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NOTIFICATION_ICONS = {
  approval: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100" },
  rejection: { icon: XCircle, color: "text-red-500", bg: "bg-red-100" },
  bid: { icon: DollarSign, color: "text-blue-500", bg: "bg-blue-100" },
  registration: { icon: Car, color: "text-purple-500", bg: "bg-purple-100" },
  instant_sale: { icon: Car, color: "text-orange-500", bg: "bg-orange-100" },
  admin_alert: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-100" },
  default: { icon: Bell, color: "text-gray-500", bg: "bg-gray-100" },
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick
}) => {
  const {
    id,
    notification_type,
    message,
    is_read,
    created_at,
    related_object_id
  } = notification;

  const iconConfig = NOTIFICATION_ICONS[notification_type] || NOTIFICATION_ICONS.default;
  const IconComponent = iconConfig.icon;

  const handleClick = () => {
    if (!is_read) {
      onMarkAsRead?.(id);
    }
    onClick?.(notification);
  };

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    onMarkAsRead?.(id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  const timeAgo = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
    : "";

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-start gap-3 p-3 cursor-pointer transition-colors
        hover:bg-gray-50 border-b border-gray-100 last:border-b-0
        ${!is_read ? "bg-red-50/30" : "bg-white"}
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 p-2 rounded-full ${iconConfig.bg}`}>
        <IconComponent className={`w-4 h-4 ${iconConfig.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!is_read ? "font-medium text-gray-900" : "text-gray-700"}`}>
          {message}
        </p>
        <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {!is_read && (
          <button
            onClick={handleMarkAsRead}
            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Mark as read"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleDelete}
          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Unread indicator */}
      {!is_read && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
        </div>
      )}
    </div>
  );
};

export default NotificationItem;

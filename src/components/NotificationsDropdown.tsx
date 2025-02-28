import { useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotifications, Notification } from '../contexts/NotificationsContext';
import { format } from 'date-fns';

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // When opening with unread notifications, mark them as read
      markAllAsRead();
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <span className="bg-blue-100 text-blue-600 p-1 rounded-full">📦</span>;
      case 'user':
        return <span className="bg-green-100 text-green-600 p-1 rounded-full">👤</span>;
      case 'product':
        return <span className="bg-purple-100 text-purple-600 p-1 rounded-full">🏷️</span>;
      case 'topup':
        return <span className="bg-yellow-100 text-yellow-600 p-1 rounded-full">💰</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 p-1 rounded-full">📌</span>;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative text-gray-500 hover:text-gray-700"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex space-x-2">
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                title="Mark all as read"
              >
                <Check size={16} />
              </button>
              <button
                onClick={clearNotifications}
                className="text-sm text-red-600 hover:text-red-800 flex items-center"
                title="Clear all notifications"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <div className="mr-3">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-gray-600 text-sm">{notification.message}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {format(new Date(notification.timestamp), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;

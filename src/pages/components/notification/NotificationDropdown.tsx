import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import { useGetNotificationsQuery, useUpdateNotificationMutation } from '../../../redux/slices/notificationSlice';

interface NotificationDropdownProps {
  userId: string;
  userType: 'locum' | 'practice' | 'branch';
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  userId,
  userType,
  isOpen,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

  const getQueryParams = () => {
    switch (userType) {
      case 'locum':
        return { locumId: userId };
      case 'practice':
        return { practiceId: userId };
      case 'branch':
        return { branchId: userId };
      default:
        return {};
    }
  };

  const { data: notificationsData, isLoading, refetch } = useGetNotificationsQuery({
    ...getQueryParams(),
    limit: 50,
  });

  const [updateNotification] = useUpdateNotificationMutation();

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = async (notification: any) => {
    if (notification.status === 'UNREAD') {
      try {
        await updateNotification({
          id: notification.id,
          status: 'READ',
        }).unwrap();
        refetch();
      } catch (error) {
        console.error('Failed to update notification:', error);
      }
    }
    setSelectedNotificationId(notification.id);
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
      } else {
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
      }
    } catch {
      return 'Recently';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-opacity-20 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={dropdownRef}
        className="fixed top-16 right-4 md:right-8 w-96 max-w-[calc(100vw-2rem)] max-h-[600px] bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#C3EAE7]">
          <div className="flex items-center space-x-2">
            <FaBell className="text-gray-700" />
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition"
            aria-label="Close notifications"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaBell className="mx-auto text-4xl text-gray-300 mb-2" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const isUnread = notification.status === 'UNREAD';
                const isSelected = selectedNotificationId === notification.id;

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : isUnread
                        ? 'bg-gray-50 hover:bg-gray-100'
                        : 'hover:bg-gray-50'
                    } ${isUnread ? 'font-medium' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        isUnread ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
            <p className="text-xs text-gray-500">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;


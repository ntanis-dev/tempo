import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 for persistent
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out mb-3
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'translate-x-full opacity-0' : ''}
      `}
    >
      <div className={`
        rounded-lg border p-3 shadow-lg backdrop-blur-sm cursor-pointer
        ${getColorClasses()}
        max-w-xs w-full
      `}>
        <div className="flex items-start space-x-2" onClick={handleDismiss}>
          <div className={`flex-shrink-0 ${getIconColorClasses()}`}>
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold mb-1">
              {notification.title}
            </h4>
            {notification.message && (
              <p className="text-xs sm:text-sm opacity-90">
                {notification.message}
              </p>
            )}
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="mt-1 text-xs sm:text-sm font-medium underline hover:no-underline transition-all"
              >
                {notification.action.label}
              </button>
            )}
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-0.5 hover:bg-black/10 rounded-full transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 pointer-events-none w-80 max-w-[calc(100vw-2rem)]">
      <div className="pointer-events-auto">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
};
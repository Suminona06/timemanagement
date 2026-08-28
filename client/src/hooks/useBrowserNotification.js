import { useState, useEffect, useCallback } from 'react';

/**
 * useBrowserNotification — HTML5 Web Notification API trigger engine.
 * Fires native desktop/system notifications when timers or focus intervals complete.
 */
export function useBrowserNotification() {
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  /**
   * Request user permission for desktop notifications.
   */
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
      return 'denied';
    }
  }, []);

  /**
   * Fire a system notification with title, body, and auto-close timer.
   * @param {string} title
   * @param {NotificationOptions} [options]
   */
  const sendNotification = useCallback(
    (title, options = {}) => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      try {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          silent: false,
          ...options,
        });

        // Auto close notification after 6 seconds
        setTimeout(() => {
          notification.close();
        }, 6000);

        return notification;
      } catch (err) {
        console.warn('Failed to fire desktop notification:', err);
      }
    },
    []
  );

  return {
    isSupported: permission !== 'unsupported',
    isGranted: permission === 'granted',
    permission,
    requestPermission,
    sendNotification,
  };
}

export default useBrowserNotification;

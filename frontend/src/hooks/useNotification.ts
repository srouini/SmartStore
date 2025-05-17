import { useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  show: boolean;
  message: string;
  type: NotificationType;
}

export const useNotification = (timeout = 3000) => {
  const [notification, setNotification] = useState<Notification>({
    show: false,
    message: '',
    type: 'info'
  });

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });

    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, timeout);
  }, [timeout]);

  return {
    notification,
    showNotification
  };
};

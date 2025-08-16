import { useCallback } from 'react';
import { useNotification } from '@/lib/hooks/use-notification';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

export const useToast = () => {
  const { addNotification } = useNotification();
  
  const toast = useCallback((
    title: string, 
    options: {
      type?: NotificationType;
      message?: string;
      duration?: number;
    } = {}
  ) => {
    const { type = 'info', message, duration = 5000 } = options;
    
    addNotification({
      type,
      title,
      message,
      duration,
    });
  }, [addNotification]);
  
  return toast;
};

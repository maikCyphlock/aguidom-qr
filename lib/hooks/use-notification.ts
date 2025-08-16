"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from 'uuid';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

export function useNotification() {
  const queryClient = useQueryClient();
  
  const addNotification = useMutation({
    mutationFn: async (notification: Omit<Notification, 'id'>) => {
      const id = uuidv4();
      const newNotification: Notification = { ...notification, id };
      
      // Add to query cache
      queryClient.setQueryData(['notifications'], (old: Notification[] = []) => {
        return [...old, newNotification];
      });
      
      // Auto-remove after duration
      if (notification.duration) {
        setTimeout(() => {
          removeNotification(id);
        }, notification.duration);
      }
      
      return newNotification;
    },
  });
  
  const removeNotification = (id: string) => {
    queryClient.setQueryData(['notifications'], (old: Notification[] = []) => {
      return old.filter(n => n.id !== id);
    });
  };
  
  const clearNotifications = () => {
    queryClient.setQueryData(['notifications'], []);
  };
  
  const useNotifications = () => {
    return queryClient.getQueryData<Notification[]>(['notifications']) || [];
  };
  
  return {
    addNotification: addNotification.mutate,
    removeNotification,
    clearNotifications,
    useNotifications,
  };
}

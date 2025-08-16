"use client";

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
}

const notificationIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const notificationColors = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export function NotificationToast() {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Subscribe to notifications in the query cache
  useEffect(() => {
    const queryCache = queryClient.getQueryCache();
    const unsubscribe = queryCache.subscribe((event) => {
      // Check if the event is about the notifications query
      if (event.query && Array.isArray(event.query.queryKey) && event.query.queryKey[0] === 'notifications') {
        const data = queryClient.getQueryData<Notification[]>(['notifications']) || [];
        setNotifications(data);
      }
    });
    
    // Initial fetch
    const initialData = queryClient.getQueryData<Notification[]>(['notifications']) || [];
    setNotifications(initialData);
    
    return unsubscribe;
  }, [queryClient]);

  const removeNotification = (id: string) => {
    queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => 
      old.filter(n => n.id !== id)
    );
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = notificationIcons[notification.type];
        
        return (
          <div
            key={notification.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm animate-in slide-in-from-right-2",
              notificationColors[notification.type]
            )}
          >
            <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{notification.title}</h4>
              {notification.message && (
                <p className="text-sm mt-1 opacity-90">{notification.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeNotification(notification.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

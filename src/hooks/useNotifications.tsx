import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface AppNotification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (message: string, type?: AppNotification["type"]) => void;
  markAllRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback((message: string, type: AppNotification["type"] = "info") => {
    const notif: AppNotification = {
      id: crypto.randomUUID(),
      message,
      time: new Date().toLocaleTimeString(),
      read: false,
      type,
    };
    setNotifications(prev => [notif, ...prev.slice(0, 49)]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllRead, clearAll, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

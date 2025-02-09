import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface NotificationsState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => {
      const id = Math.random().toString(36).substring(7);
      const newNotification = { ...notification, id };
      
      // 自动移除通知
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, 3000);

      return {
        notifications: [...state.notifications, newNotification],
      };
    }),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
})); 
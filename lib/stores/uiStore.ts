import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  activeModal: string | null
  theme: 'light' | 'dark' | 'system'
  notifications: Notification[]
  
  // Actions
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
  openModal: (modal: string) => void
  closeModal: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  createdAt: Date
  duration?: number // en milisegundos, undefined = no auto-remove
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      activeModal: null,
      theme: 'system',
      notifications: [],

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      openSidebar: () => set({ sidebarOpen: true }),
      closeSidebar: () => set({ sidebarOpen: false }),

      openModal: (modal: string) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),

      setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          createdAt: new Date()
        }
        
        set(state => ({
          notifications: [...state.notifications, newNotification]
        }))

        // Auto-remove notification after duration
        if (notification.duration) {
          setTimeout(() => {
            get().removeNotification(newNotification.id)
          }, notification.duration)
        }
      },

      removeNotification: (id: string) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ 
        theme: state.theme 
      }),
    }
  )
)

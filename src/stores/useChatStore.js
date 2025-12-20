import { create } from 'zustand'

export const useChatStore = create((set) => ({
  messages: [],
  isConnected: false,
  onlineUsers: [],
  unreadCount: 0,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      unreadCount: state.unreadCount + 1,
    })),

  setMessages: (messages) => set({ messages }),

  setConnected: (isConnected) => set({ isConnected }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  resetUnreadCount: () => set({ unreadCount: 0 }),

  clearMessages: () => set({ messages: [], unreadCount: 0 }),
}))


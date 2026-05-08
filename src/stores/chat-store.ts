import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatState {
  isOpen: boolean
  messages: ChatMessage[]
  isTyping: boolean
  setOpen: (open: boolean) => void
  toggleOpen: () => void
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  setTyping: (typing: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'مرحباً! 👋 أنا مساعدتك الشخصية في دوناتيلا. كيف يمكنني مساعدتكِ اليوم؟',
      timestamp: new Date(),
    },
  ],
  isTyping: false,

  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          timestamp: new Date(),
        },
      ],
    })),
  setTyping: (typing) => set({ isTyping: typing }),
  clearMessages: () =>
    set({
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: 'مرحباً! 👋 أنا مساعدتك الشخصية في دوناتيلا. كيف يمكنني مساعدتكِ اليوم؟',
          timestamp: new Date(),
        },
      ],
    }),
}))

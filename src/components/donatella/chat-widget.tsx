'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatStore, type ChatMessage } from '@/stores/chat-store'
import { useUIStore } from '@/stores/ui-store'

const quickReplies = [
  {
    id: 'dress-help',
    label: 'أريد مساعدة في اختيار فستان',
    response:
      'بالتأكيد! لدينا مجموعة رائعة من الفساتين. ما هي المناسبة؟ سهرة، عمل، أم يومي؟ وسأقترح عليكِ أفضل الخيارات! ✨',
  },
  {
    id: 'offers',
    label: 'ما هي العروض الحالية؟',
    response:
      'يمكنك الاطلاع على أحدث العروض والخصومات من صفحة المتجر! 🎉 هل تريدين أن أعرض لكِ المنتجات المميزة؟',
  },
  {
    id: 'returns',
    label: 'كيف يمكنني إرجاع منتج؟',
    response:
      'إرجاع المنتجات مجاني خلال 14 يوم من تاريخ الاستلام! 📦 فقط تواصلي معنا وسنساعدكِ في الإجراءات.',
  },
]

const genericResponse =
  'شكراً لرسالتكِ! سأقوم بالبحث عن ذلك وأعود إليكِ قريباً. هل هناك أي شيء آخر يمكنني مساعدتكِ به؟ 😊'

function formatTime(date: Date): string {
  const now = new Date()
  const d = date instanceof Date ? date : new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-end gap-2"
    >
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#D4A574] to-[#b8885a] flex items-center justify-center shadow-sm flex-shrink-0">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="bg-muted/80 dark:bg-[#2A2522] rounded-2xl rounded-br-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-[#D4A574]"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.7, 1, 0.7] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#8B6F6F] to-[#6b5555] flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-white text-xs font-bold">أنتِ</span>
        </div>
      ) : (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#D4A574] to-[#b8885a] flex items-center justify-center shadow-sm flex-shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-[#D4A574] to-[#b8885a] text-white rounded-bl-sm shadow-md'
              : 'bg-muted/80 dark:bg-[#2A2522] text-foreground rounded-br-sm'
          }`}
        >
          {message.content}
        </div>
        <p className={`text-[10px] text-muted-foreground mt-1 ${isUser ? 'text-left' : 'text-right'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </motion.div>
  )
}

export default function ChatWidget() {
  const { isOpen, messages, isTyping, toggleOpen, addMessage, setTyping } = useChatStore()
  const currentPage = useUIStore((s) => s.currentPage)
  const [inputValue, setInputValue] = useState('')
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const [hasBeenOpened, setHasBeenOpened] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Don't show chat widget on admin pages
  const isAdmin = currentPage === 'admin' || currentPage.startsWith('admin-')

  // Derive unread count: show 1 for demo until chat is first opened
  const unreadCount = isOpen || hasBeenOpened ? 0 : 1

  // Mark as opened and toggle chat
  const handleToggleOpen = () => {
    if (!isOpen) {
      setHasBeenOpened(true)
    }
    toggleOpen()
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages, isTyping])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleQuickReply = (reply: (typeof quickReplies)[number]) => {
    setShowQuickReplies(false)
    addMessage({ role: 'user', content: reply.label })

    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      addMessage({ role: 'assistant', content: reply.response })
    }, 2000)
  }

  const handleSendMessage = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isTyping) return

    setShowQuickReplies(false)
    addMessage({ role: 'user', content: trimmed })
    setInputValue('')

    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      addMessage({ role: 'assistant', content: genericResponse })
    }, 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isAdmin) return null

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={handleToggleOpen}
            className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-[#D4A574] to-[#b8885a] shadow-xl shadow-[#D4A574]/25 hover:shadow-2xl hover:shadow-[#D4A574]/35 flex items-center justify-center transition-shadow duration-300"
            aria-label="فتح المحادثة"
          >
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full animate-ping bg-[#D4A574]/30" />

            <MessageCircle className="h-6 w-6 text-white relative z-10" />

            {/* Unread badge */}
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-white text-[10px] font-bold border-2 border-background shadow-sm">
                {unreadCount}
              </Badge>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-6 z-50 w-[340px] sm:w-[380px] max-h-[500px] rounded-2xl shadow-2xl border border-border/50 bg-card overflow-hidden flex flex-col"
            style={{
              boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(212,165,116,0.1)',
            }}
          >
            {/* Chat Header */}
            <div className="relative px-4 py-3 bg-gradient-to-l from-[#D4A574] to-[#b8885a] text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">مساعدة دوناتيلا</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[11px] text-white/80">متصل الآن</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleOpen}
                  className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Gold accent line */}
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-white/40 via-white/80 to-white/40" />
            </div>

            {/* Chat Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4 space-y-3 max-h-[300px] min-h-[200px]">
              {/* Welcome message with name */}
              <div className="text-center mb-2">
                <p className="text-xs text-muted-foreground">مساعدتك الذكية</p>
              </div>

              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && <TypingIndicator />}
              </AnimatePresence>

              {/* Quick Replies */}
              <AnimatePresence>
                {showQuickReplies && messages.length <= 1 && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="flex flex-col gap-2 mt-2"
                  >
                    {quickReplies.map((reply, i) => (
                      <motion.button
                        key={reply.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                        whileHover={{ scale: 1.02, x: -3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickReply(reply)}
                        className="text-right text-xs px-3 py-2.5 rounded-xl border border-[#D4A574]/30 bg-[#D4A574]/5 hover:bg-[#D4A574]/10 text-foreground transition-colors duration-200"
                      >
                        {reply.label}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-3 border-t border-border/50 bg-card">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتبي رسالتكِ..."
                  className="flex-1 h-10 rounded-xl text-sm border-border/50 focus:border-[#D4A574]/50 focus:ring-[#D4A574]/20 bg-secondary/30"
                  disabled={isTyping}
                  dir="rtl"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#b8885a] hover:from-[#b8885a] hover:to-[#D4A574] text-white shadow-md shadow-[#D4A574]/20 disabled:opacity-50 disabled:cursor-not-allowed p-0"
                >
                  <Send className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

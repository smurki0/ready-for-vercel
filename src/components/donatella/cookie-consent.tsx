'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'

const CONSENT_KEY = 'donatella-cookie-consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const setPage = useUIStore((s) => s.setPage)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 inset-x-0 z-[60] p-4 sm:p-6"
        >
          <div className="max-w-4xl mx-auto bg-background dark:bg-[#231F1C] border border-border dark:border-[#3A3532] rounded-2xl shadow-2xl dark:shadow-[0_0_30px_rgba(212,165,116,0.08)] p-4 sm:p-6 relative overflow-hidden dark-glow-card">
            {/* Decorative gradient accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-[#D4A574] via-[#C4A4A4] to-[#D4A574] dark:shadow-[0_0_8px_rgba(212,165,116,0.3)]" />
            
            <button
              onClick={handleDecline}
              className="absolute top-3 left-3 text-muted-foreground hover:text-foreground dark:hover:text-foreground transition-colors"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Icon */}
              <div className="shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#b8885a] flex items-center justify-center shadow-lg dark:shadow-lg dark:shadow-[#D4A574]/15">
                <Cookie className="h-6 w-6 text-white" />
              </div>

              {/* Text */}
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-semibold text-foreground dark:text-foreground">
                  سياسة ملفات تعريف الارتباط
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  نستخدم ملفات تعريف الارتباط لتحسين تجربتك. بالاستمرار في التصفح، فإنك توافق على{' '}
                  <button
                    onClick={() => setPage('contact')}
                    className="text-[#D4A574] dark:text-[#E8C9A0] hover:underline font-medium"
                  >
                    سياسة الخصوصية
                  </button>{' '}
                  الخاصة بنا.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none rounded-xl text-xs sm:text-sm dark:border-[#3A3532] dark:hover:bg-[#2A2522]"
                >
                  رفض
                </Button>
                <Button
                  onClick={handleAccept}
                  size="sm"
                  className="flex-1 sm:flex-none rounded-xl text-xs sm:text-sm bg-gradient-to-l from-[#D4A574] to-[#b8885a] hover:from-[#b8885a] hover:to-[#9a7348] text-white border-0 shadow-md dark:shadow-[#D4A574]/15"
                >
                  قبول
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

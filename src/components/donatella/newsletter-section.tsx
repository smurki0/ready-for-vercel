'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mail, CheckCircle2, Heart, Users, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useSiteSettings } from '@/hooks/use-site-settings'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const { getSetting } = useSiteSettings()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني')
      return
    }
    setSubmitting(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000))
    setSubscribed(true)
    toast.success('تم الاشتراك بنجاح! شكراً لكِ')
    setEmail('')
    setSubmitting(false)
    // Reset after 5 seconds
    setTimeout(() => setSubscribed(false), 5000)
  }

  return (
    <section className="py-12 sm:py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden border border-border/30 dark:border-[#D4A574]/15 dark-glow-card"
        >
          {/* Decorative background gradient - enhanced for dark mode */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4A574]/15 via-[#C4A4A4]/10 to-[#8B6F6F]/15 dark:from-[#D4A574]/6 dark:via-[#C4A4A4]/4 dark:to-[#8B6F6F]/6" />
          
          {/* Subtle pattern overlay - enhanced for dark */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }} />

          {/* Dark mode additional pattern layer */}
          <div className="absolute inset-0 hidden dark:block opacity-[0.02]" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(212,165,116,0.05) 20px, rgba(212,165,116,0.05) 21px)`,
          }} />

          {/* Decorative floating elements - enhanced for dark mode */}
          <div className="absolute top-6 right-8">
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[#D4A574]/20 dark:text-[#D4A574]/25"
            >
              <Gift className="h-16 w-16" />
            </motion.div>
          </div>
          <div className="absolute bottom-6 left-8">
            <motion.div
              animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[#C4A4A4]/20 dark:text-[#C4A4A4]/25"
            >
              <Heart className="h-12 w-12" />
            </motion.div>
          </div>
          <div className="absolute top-1/2 left-1/4 hidden sm:block">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="text-[#8B6F6F]/15 dark:text-[#8B6F6F]/20"
            >
              <Mail className="h-10 w-10" />
            </motion.div>
          </div>

          {/* Top decorative border - enhanced for dark */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4A574]/60 dark:via-[#D4A574]/50 to-transparent dark:shadow-[0_0_10px_rgba(212,165,116,0.2)]" />

          <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14">
            <div className="text-center max-w-xl mx-auto">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#b8885a] text-white mb-5 shadow-lg shadow-[#D4A574]/20 dark:shadow-[#D4A574]/30 dark-gold-pulse"
              >
                <Mail className="h-7 w-7" />
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center justify-center gap-2 mb-4"
              >
                <Users className="h-4 w-4 text-[#D4A574] dark:text-[#E8C9A0]" />
                <span className="text-sm font-medium text-[#D4A574] dark:text-[#E8C9A0]">
                  {getSetting('newsletterSubtitle', 'انضمي إلى +10,000 سيدة')}
                </span>
              </motion.div>

              <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-foreground mb-2">
                {getSetting('newsletterTitle', 'اشتركي في نشرتنا البريدية')}
              </h2>
              <p className="text-muted-foreground dark:text-muted-foreground text-sm mb-6 leading-relaxed">
                {getSetting('newsletterDescription', 'كوني أول من يعرف عن العروض الحصرية والمنتجات الجديدة')}
                <br className="hidden sm:block" />
                واحصلي على خصم 15% على طلبك الأول
              </p>

              {/* Form / Success Animation */}
              <AnimatePresence mode="wait">
                {subscribed ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, type: 'spring' }}
                    className="flex flex-col items-center gap-3"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, type: 'spring', delay: 0.1 }}
                    >
                      <CheckCircle2 className="h-16 w-16 text-emerald-500 dark:text-emerald-400" />
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg font-bold text-foreground"
                    >
                      مرحباً بكِ! 🎉
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-sm text-muted-foreground"
                    >
                      تم تسجيلك بنجاح. تفقدي بريدك الإلكتروني لكود الخصم
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="flex gap-2 max-w-md mx-auto"
                  >
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="أدخلي بريدك الإلكتروني"
                      className="h-12 rounded-xl text-sm bg-background/80 dark:bg-[#2A2522]/80 backdrop-blur-sm border-[#D4A574]/20 dark:border-[#D4A574]/20 focus:border-[#D4A574]/50 dark:focus:border-[#D4A574]/40"
                      dir="ltr"
                    />
                    <Button
                      type="submit"
                      className="h-12 px-6 rounded-xl gap-2 shrink-0 bg-gradient-to-r from-[#D4A574] to-[#b8885a] hover:from-[#b8885a] hover:to-[#9a7348] shadow-md shadow-[#D4A574]/20 dark:shadow-[#D4A574]/25"
                      disabled={submitting}
                    >
                      <Send className="h-4 w-4" />
                      {submitting ? 'جاري...' : getSetting('newsletterCtaText', 'اشتركي')}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Privacy note */}
              <p className="text-xs text-muted-foreground/60 dark:text-muted-foreground/50 mt-4">
                نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

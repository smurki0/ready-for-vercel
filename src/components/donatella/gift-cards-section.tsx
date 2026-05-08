'use client'

import { useState } from 'react'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { motion } from 'framer-motion'
import { Gift, Heart, Sparkles, Send, ShoppingBag, Crown, Star, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

const giftCardPreviews = [
  { label: '200 ج.م', gradient: 'from-[#D4A574] via-[#C9956A] to-[#B8855A]', icon: Gift },
  { label: '500 ج.م', gradient: 'from-[#C4A4A4] via-[#B89494] to-[#A88484]', icon: Heart },
  { label: '1,000 ج.م', gradient: 'from-[#8B6F6F] via-[#7A5E5E] to-[#6B4F4F]', icon: Crown },
  { label: '2,000 ج.م', gradient: 'from-[#C9A96E] via-[#B8944A] to-[#A08040]', icon: Star },
]

export default function GiftCardsSection() {
  const [customAmount, setCustomAmount] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const { getSetting } = useSiteSettings()

  const handleCustomAmount = () => {
    const amount = parseInt(customAmount)
    if (!amount || amount < 50) {
      toast.error('الحد الأدنى 50 ج.م')
      return
    }
    if (amount > 5000) {
      toast.error('الحد الأقصى 5,000 ج.م')
      return
    }
    toast.info('بطاقات الهدايا ستتوفر قريباً!')
  }

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#D4A574]/5 via-transparent to-[#C4A4A4]/5" />
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#D4A574]/5 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-[#C4A4A4]/5 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#8B6F6F]/3 blur-[100px]" />

      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #D4A574 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#C4A4A4] mb-4 shadow-lg shadow-[#D4A574]/20"
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
                rotate: [0, -8, 8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Gift className="h-8 w-8 text-white" />
            </motion.div>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{getSetting('giftCardsTitle', 'بطاقات الهدايا')}</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            {getSetting('giftCardsSubtitle', 'اهديها تجربة تسوق فاخرة من DONATELLA — بطاقات هدايا بأناقة لا تُنسى')}
          </p>
          <div className="w-24 h-0.5 mx-auto mt-4 bg-gradient-to-l from-transparent via-[#D4A574] to-transparent" />
        </motion.div>

        {/* Coming Soon Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="overflow-hidden border-dashed border-2 border-[#D4A574]/30 hover:border-[#D4A574]/50 transition-colors duration-300 bg-gradient-to-l from-[#D4A574]/5 to-transparent">
            <CardContent className="p-8 text-center">
              {/* Animated lock icon */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#b8885a] flex items-center justify-center shadow-lg shadow-[#D4A574]/20 mb-6"
              >
                <Lock className="h-10 w-10 text-white" />
              </motion.div>

              <h3 className="text-2xl font-bold text-foreground mb-3">قريباً</h3>

              <div className="inline-flex items-center gap-1.5 bg-[#D4A574]/10 text-[#D4A574] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                بطاقات هدايا رقمية
              </div>

              <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed mb-8">
                نعمل على إطلاق بطاقات هدايا رقمية يمكنك إرسالها لأحبائك بتصاميم فاخرة ومبالغ متنوعة. ستتوفر قريباً!
              </p>

              {/* Preview of card designs - blurred/locked */}
              <div className="flex justify-center gap-3 mb-8 flex-wrap">
                {giftCardPreviews.map((card, index) => {
                  const IconComp = card.icon
                  return (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative w-32 h-20 rounded-xl overflow-hidden opacity-40 blur-[1px]"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} flex items-center justify-between px-3`}>
                        <span className="text-white/80 text-[10px] font-bold">DONATELLA</span>
                        <IconComp className="h-4 w-4 text-white/60" />
                      </div>
                      <div className="absolute inset-0 bg-background/30 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white/60" />
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Notify me section */}
              <div className="max-w-sm mx-auto">
                <p className="text-xs text-muted-foreground mb-3">
                  أدخلي بريدك الإلكتروني وسنعلمك فور الإطلاق
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    className="rounded-xl h-10 border-[#D4A574]/20 focus:border-[#D4A574]"
                    dir="ltr"
                  />
                  <Button
                    className="rounded-xl gap-2 h-10 bg-gradient-to-l from-[#D4A574] to-[#C9956A] hover:from-[#C9956A] hover:to-[#B8855A]"
                    onClick={() => toast.success('سنقوم بإشعارك فور توفر بطاقات الهدايا!')}
                  >
                    <Send className="h-4 w-4" />
                    {getSetting('giftCardsCtaText', 'أبلغيني')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-12 h-px bg-gradient-to-l from-transparent via-[#D4A574]/20 to-transparent"
        />
      </div>
    </section>
  )
}

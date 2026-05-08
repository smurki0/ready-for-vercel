'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Percent, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'

// Flip digit animation for countdown
function FlipDigit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-12 w-11 sm:h-14 sm:w-13 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 rounded-xl bg-white/15 dark:bg-white/10 backdrop-blur-sm border border-white/10" />
        {/* Center dividing line */}
        <div className="absolute left-1 right-1 top-1/2 h-px bg-black/10 dark:bg-white/5 z-10" />
        {/* Digit */}
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0, rotateX: -90 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: 20, opacity: 0, rotateX: 90 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center text-lg sm:text-xl font-bold text-white font-mono"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] text-white/60 mt-1.5 font-medium">{label}</span>
    </div>
  )
}

// Separator colon between digits
function DigitSeparator() {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 h-12 sm:h-14">
      <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
      <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
    </div>
  )
}

interface PromoBannerProps {
  badge?: string
  title?: string
  description?: string
  ctaText?: string
}

export default function PromoBanner({
  badge = 'عرض محدود',
  title = 'خصم 20% على جميع الفساتين',
  description = 'استمتعي بخصم حصري على مجموعة الفساتين المميزة. العرض ينتهي قريباً!',
  ctaText = 'تسوقي الآن',
}: PromoBannerProps) {
  const navigateToShop = useUIStore((s) => s.navigateToShop)

  // Countdown timer - 2 days 14 hours from now (static for demo)
  const [timeLeft, setTimeLeft] = useState({ hours: 37, minutes: 42, seconds: 15 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) {
          return { hours: 0, minutes: 0, seconds: 0 }
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = useCallback((n: number) => n.toString().padStart(2, '0'), [])

  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Animated gradient border wrapper */}
        <div className="relative rounded-2xl p-[2px] overflow-hidden">
          {/* Spinning gradient border animation */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'conic-gradient(from 0deg, #D4A574, #E8C9A0, #C4A4A4, #8B6F6F, #C4A4A4, #E8C9A0, #D4A574)',
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          {/* Inner border mask - creates the border effect */}
          <div className="absolute inset-[2px] rounded-[14px] bg-background" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[14px] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #C4A4A4 0%, #B08E8E 40%, #9A7878 100%)',
            }}
          >
            {/* Dark mode overlay for better depth */}
            <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-[#8B6F6F] dark:via-[#7A5E5E] dark:to-[#6B4F4F] dark:opacity-80" />

            {/* ─── Decorative circles ────────────────────────────────────── */}
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#D4A574]" />
            <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full opacity-10 translate-x-1/4 translate-y-1/4 bg-white dark:bg-[#D4A574]" />
            <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#D4A574]" />

            {/* ─── Decorative geometric pattern ──────────────────────────── */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
              backgroundImage: `
                linear-gradient(30deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
                linear-gradient(150deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
                linear-gradient(30deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
                linear-gradient(150deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
                linear-gradient(60deg, #fff 25%, transparent 25.5%, transparent 75%, #fff 75%, #fff),
                linear-gradient(60deg, #fff 25%, transparent 25.5%, transparent 75%, #fff 75%, #fff)
              `,
              backgroundSize: '80px 140px',
              backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px',
            }} />

            {/* ─── Enhanced Shimmer animation across banner ───────────────── */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.08) 55%, transparent 75%)',
                backgroundSize: '250% 100%',
              }}
              animate={{
                backgroundPosition: ['250% 0', '-250% 0'],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'linear',
                repeatDelay: 1.5,
              }}
            />

            {/* ─── Secondary subtle shimmer ───────────────────────────────── */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(65deg, transparent 40%, rgba(212,165,116,0.08) 50%, transparent 60%)',
                backgroundSize: '300% 100%',
              }}
              animate={{
                backgroundPosition: ['300% 0', '-300% 0'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
                repeatDelay: 3,
                delay: 1,
              }}
            />

            {/* ─── Main Content ──────────────────────────────────────────── */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 sm:p-10">
              <div className="text-center sm:text-right flex-1">
                {/* Limited offer badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 border border-white/10">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Zap className="h-4 w-4 text-yellow-300 dark:text-[#E8C9A0]" />
                    </motion.div>
                    <span className="text-white dark:text-white text-sm font-medium">{badge}</span>
                    <Percent className="h-3.5 w-3.5 text-white/70 dark:text-[#E8C9A0]/70" />
                  </div>
                </motion.div>

                {/* Main heading with text glow */}
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 dark-text-glow">
                  {title}
                </h2>

                {/* Description */}
                <p className="text-white/80 dark:text-white/70 text-sm sm:text-base mb-4 sm:mb-0">
                  {description}
                </p>
              </div>

              {/* ─── Enhanced Countdown Timer with Flip Digits ──────────── */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex items-center gap-1.5 text-white/70 dark:text-white/60 text-xs mb-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>ينتهي العرض خلال</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2" dir="ltr">
                  <FlipDigit value={pad(timeLeft.hours)} label="ساعة" />
                  <DigitSeparator />
                  <FlipDigit value={pad(timeLeft.minutes)} label="دقيقة" />
                  <DigitSeparator />
                  <FlipDigit value={pad(timeLeft.seconds)} label="ثانية" />
                </div>

                {/* ─── Pulsing CTA Button ─────────────────────────────────── */}
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(255, 255, 255, 0.3)',
                      '0 0 0 8px rgba(255, 255, 255, 0)',
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  className="rounded-xl mt-1"
                >
                  <Button
                    onClick={() => navigateToShop()}
                    className="bg-white dark:bg-[#F0E6DC] text-[#C4A4A4] dark:text-[#8B6F6F] hover:bg-white/90 dark:hover:bg-[#F0E6DC]/90 px-8 py-3 rounded-xl text-base font-bold shrink-0 gap-2 group shadow-lg dark:shadow-[#D4A574]/10"
                    size="lg"
                  >
                    {ctaText}
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

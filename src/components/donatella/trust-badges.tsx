'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Truck, ShieldCheck, RotateCcw, Headphones, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSiteSettings } from '@/hooks/use-site-settings'

// Animated number counter with IntersectionObserver trigger
function AnimatedNumber({ target, duration = 1500, suffix = '', shouldAnimate }: { target: number; duration?: number; suffix?: string; shouldAnimate: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!shouldAnimate) return

    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }
    requestAnimationFrame(step)
  }, [target, duration, shouldAnimate])

  return <span>{count.toLocaleString('ar-SA')}{suffix}</span>
}

const badges = [
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'شحن مجاني',
    desc: 'للطلبات فوق 5000 ج.م',
    counter: { value: 27, suffix: '+', label: 'محافظة نوصّل لها' },
    gradient: 'from-[#D4A574]/15 to-[#C4A4A4]/15',
    iconBg: 'from-[#D4A574] to-[#b8885a]',
    darkGradient: 'from-[#D4A574]/10 to-[#C4A4A4]/10',
    hoverGlow: 'rgba(212, 165, 116, 0.2)',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'دفع آمن',
    desc: 'حماية كاملة لبياناتك',
    counter: { value: 100, suffix: '%', label: 'أصلي' },
    gradient: 'from-[#C4A4A4]/15 to-[#8B6F6F]/15',
    iconBg: 'from-[#C4A4A4] to-[#8B6F6F]',
    darkGradient: 'from-[#C4A4A4]/8 to-[#8B6F6F]/8',
    hoverGlow: 'rgba(196, 164, 164, 0.2)',
  },
  {
    icon: <RotateCcw className="h-6 w-6" />,
    title: 'إرجاع مجاني',
    desc: 'خلال 14 يوم',
    counter: { value: 14, suffix: '', label: 'يوم إرجاع' },
    gradient: 'from-[#8B6F6F]/15 to-[#D4A574]/15',
    iconBg: 'from-[#8B6F6F] to-[#D4A574]',
    darkGradient: 'from-[#8B6F6F]/8 to-[#D4A574]/8',
    hoverGlow: 'rgba(139, 111, 111, 0.2)',
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: 'دعم 24/7',
    desc: 'خدمة عملاء متواصلة',
    counter: { value: 24, suffix: '/7', label: 'دعم' },
    gradient: 'from-[#D4A574]/15 to-[#e8c9a0]/15',
    iconBg: 'from-[#e8c9a0] to-[#D4A574]',
    darkGradient: 'from-[#D4A574]/10 to-[#e8c9a0]/8',
    hoverGlow: 'rgba(232, 201, 160, 0.2)',
  },
  {
    icon: <BadgeCheck className="h-6 w-6" />,
    title: 'مضمون 100%',
    desc: 'منتجات أصلية ومضمونة',
    counter: { value: 100, suffix: '%', label: 'منتج أصلي' },
    gradient: 'from-[#C4A4A4]/15 to-[#e8c9a0]/15',
    iconBg: 'from-[#C4A4A4] to-[#e8c9a0]',
    darkGradient: 'from-[#C4A4A4]/8 to-[#e8c9a0]/8',
    hoverGlow: 'rgba(196, 164, 164, 0.2)',
  },
]

// Individual badge component with IntersectionObserver
function TrustBadge({ badge, index }: { badge: typeof badges[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const badgeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2, rootMargin: '30px' }
    )
    const el = badgeRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      ref={badgeRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        scale: 1.06,
        y: -4,
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      className={`flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-gradient-to-br ${badge.gradient} dark:${badge.darkGradient} border border-border/40 dark:border-[#3A3532]/80 hover:border-[#D4A574]/40 backdrop-blur-sm transition-all duration-300 cursor-default relative group dark-glow-card dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] min-w-[140px] sm:min-w-0`}
    >
      {/* Animated border glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `0 0 20px ${badge.hoverGlow}, 0 0 40px rgba(196, 164, 164, 0.08)`,
        }}
      />

      {/* Badge-level shimmer on hover */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out bg-gradient-to-r from-transparent via-[#D4A574]/8 dark:via-[#D4A574]/6 to-transparent" />
      </div>

      {/* Icon with gradient background + pulse ring + bounce on hover */}
      <div className="relative mb-3">
        {/* Pulse ring animation */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(212, 165, 116, 0.25)',
              '0 0 0 8px rgba(212, 165, 116, 0)',
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeOut',
            delay: index * 0.4,
          }}
        />
        <motion.div
          whileHover={{
            scale: [1, 1.18, 0.95, 1.12, 1],
            transition: { duration: 0.4, ease: 'easeInOut' },
          }}
          className={`relative h-13 w-13 rounded-xl bg-gradient-to-br ${badge.iconBg} flex items-center justify-center shadow-md dark:shadow-lg dark:shadow-[#D4A574]/15 dark:brightness-110`}
        >
          <div className="text-white">
            {badge.icon}
          </div>
          {/* Shimmer effect on icon */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </motion.div>
      </div>

      <h3 className="font-bold text-sm text-foreground dark:text-foreground mb-1">{badge.title}</h3>
      <p className="text-xs text-muted-foreground dark:text-muted-foreground leading-relaxed mb-2">{badge.desc}</p>

      {/* Animated counter - triggered by IntersectionObserver */}
      <div className="mt-auto pt-2 border-t border-border/20 dark:border-[#3A3532]/40 w-full">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className="text-sm font-bold text-[#D4A574] dark:text-[#D4A574]"
        >
          <AnimatedNumber target={badge.counter.value} suffix={badge.counter.suffix} shouldAnimate={isVisible} />
        </motion.p>
        <p className="text-[10px] text-muted-foreground dark:text-muted-foreground mt-0.5">{badge.counter.label}</p>
      </div>
    </motion.div>
  )
}

export default function TrustBadges() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const { getSetting } = useSiteSettings()

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    // RTL: scrollLeft is negative
    setCanScrollRight(el.scrollLeft > -(el.scrollWidth - el.clientWidth) + 10)
    setCanScrollLeft(el.scrollLeft < -10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll)
    return () => el.removeEventListener('scroll', checkScroll)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = 200
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="py-10 sm:py-14 relative overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-secondary/20 dark:from-[#2A2522]/40 dark:via-[#1A1614] dark:to-[#2A2522]/20" />
      {/* Animated subtle gradient orbs */}
      <motion.div
        className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#D4A574]/5 dark:bg-[#D4A574]/4 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#C4A4A4]/5 dark:bg-[#C4A4A4]/4 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#D4A574]/3 dark:bg-[#D4A574]/2 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      {/* Dark mode dot pattern */}
      <div className="absolute inset-0 hidden dark:block dark-dot-pattern opacity-30" />
      {/* Dark mode line pattern */}
      <div className="absolute inset-0 hidden dark:block dark-line-pattern opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8"
        >
          {getSetting('trustBadgesTitle', 'لماذا تختارين DONATELLA؟')}
        </motion.h2>
        <div className="relative">
          {/* Golden connecting line between badges - desktop only */}
          <div className="absolute top-1/2 inset-x-12 h-px bg-gradient-to-l from-transparent via-[#D4A574]/20 to-transparent hidden lg:block -translate-y-1/2 z-0" />

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 relative z-10">
            {badges.map((badge, i) => (
              <TrustBadge key={badge.title} badge={badge} index={i} />
            ))}
          </div>

          {/* Mobile: Horizontal scrollable layout */}
          <div className="md:hidden relative">
            {/* Scroll navigation arrows */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background/80 dark:bg-[#252220]/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-md"
              >
                <ChevronRight className="h-4 w-4 text-[#D4A574]" />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background/80 dark:bg-[#252220]/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-md"
              >
                <ChevronLeft className="h-4 w-4 text-[#D4A574]" />
              </button>
            )}

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {badges.map((badge, i) => (
                <div key={badge.title} className="snap-center">
                  <TrustBadge badge={badge} index={i} />
                </div>
              ))}
            </div>

            {/* Mobile scroll indicator dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {badges.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-[#D4A574]/20 transition-all duration-300"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

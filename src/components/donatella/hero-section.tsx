'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ArrowLeft, Eye, Flame, Sparkles, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { useSiteSettings } from '@/hooks/use-site-settings'

// Type for particles
interface ParticleType {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  isDiamond: boolean
  isGold: boolean
  rotation: number
}

// Floating particles component with diamond shapes and golden colors
function FloatingParticles() {
  const [particles, setParticles] = useState<ParticleType[]>([])

  /* eslint-disable react-hooks/set-state-in-effect -- client-only random values to avoid hydration mismatch */
  useEffect(() => {
    setParticles(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
        isDiamond: i % 4 === 0,
        isGold: i % 5 === 0,
        rotation: Math.random() * 360,
      }))
    )
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (particles.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={p.isDiamond ? 'absolute' : 'absolute rounded-full'}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.isGold
              ? 'rgba(212, 165, 116, 0.25)'
              : undefined,
            ...(p.isGold && !p.isDiamond
              ? { backgroundColor: 'rgba(212, 165, 116, 0.2)' }
              : {}),
            ...(!p.isGold && !p.isDiamond
              ? { backgroundColor: 'rgba(255,255,255,0.15)' }
              : {}),
            ...(p.isDiamond ? { rotate: '45deg' } : {}),
          }}
          animate={{
            y: [0, -30, 0],
            opacity: p.isGold ? [0.1, 0.3, 0.1] : [0.15, 0.4, 0.15],
            ...(p.isDiamond ? { rotate: [45, 90, 45] } : {}),
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {p.isDiamond && (
            <div
              className="w-full h-full"
              style={{
                backgroundColor: p.isGold
                  ? 'rgba(212, 165, 116, 0.25)'
                  : 'rgba(255,255,255,0.15)',
              }}
            />
          )}
        </motion.div>
      ))}
      {/* Connection lines between nearby particles */}
      <ParticleConnections particles={particles} />
    </div>
  )
}

// Subtle connection lines between nearby particles
function ParticleConnections({ particles }: { particles: ParticleType[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const positions = particles.map((p) => ({
        x: (p.x / 100) * canvas.width,
        y: (p.y / 100) * canvas.height,
      }))

      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x
          const dy = positions[i].y - positions[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.08
            ctx.strokeStyle = `rgba(212, 165, 116, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(positions[i].x, positions[i].y)
            ctx.lineTo(positions[j].x, positions[j].y)
            ctx.stroke()
          }
        }
      }
      frameRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(frameRef.current)
    }
  }, [particles])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}

// Season countdown component with flip animation and glow
function SeasonCountdown() {
  const { getBoolSetting, getSetting } = useSiteSettings()
  const showCountdown = getBoolSetting('showHeroCountdown', true)
  const countdownEndTime = getSetting('heroCountdownEndTime', '')

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    // Use admin-configured end time, or default to 30 days from now
    const target = countdownEndTime
      ? new Date(countdownEndTime)
      : (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d })()

    // If the target is in the past, don't start the timer
    if (target.getTime() <= Date.now()) {
      return
    }

    const timer = setInterval(() => {
      const now = new Date()
      const diff = target.getTime() - now.getTime()
      if (diff <= 0) {
        clearInterval(timer)
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdownEndTime])

  // Don't render if countdown is hidden
  if (!showCountdown) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
      className="flex items-center gap-3 mt-6"
    >
      <div className="flex items-center gap-2">
        {[
          { value: timeLeft.days, label: 'يوم' },
          { value: timeLeft.hours, label: 'ساعة' },
          { value: timeLeft.minutes, label: 'دقيقة' },
          { value: timeLeft.seconds, label: 'ثانية' },
        ].map((item, i) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              {/* Flip animation container */}
              <div className="relative w-12 h-10 sm:w-14 sm:h-12 md:w-16 md:h-14 overflow-hidden rounded-lg">
                {/* Glow behind */}
                <div className="absolute inset-0 rounded-lg shadow-[0_0_20px_rgba(212,165,116,0.15),0_0_40px_rgba(212,165,116,0.08)]" />
                {/* Background */}
                <div className="absolute inset-0 bg-white/[0.08] dark:bg-white/[0.04] border border-white/10 dark:border-[#D4A574]/15 rounded-lg backdrop-blur-md" />
                {/* Number with flip animation */}
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`${item.label}-${item.value}`}
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ rotateX: 90, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute inset-0 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold text-white"
                    style={{ perspective: '200px' }}
                  >
                    {String(item.value).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-[10px] text-white/50 dark:text-[#D4A574]/60 mt-0.5">{item.label}</span>
            </div>
            {i < 3 && <span className="text-white/30 dark:text-[#D4A574]/30 text-lg font-light">:</span>}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Arabic Islamic geometric ornamental pattern using CSS
function ArabicOrnamentalLine() {
  return (
    <div className="flex items-center justify-center gap-1 my-4" aria-hidden="true">
      <div className="flex items-center gap-[3px]">
        {/* Diamond pattern */}
        <div className="w-2 h-2 rotate-45 bg-[#D4A574]/60 dark:bg-[#D4A574]/80" />
        <div className="w-1.5 h-1.5 rotate-45 bg-[#D4A574]/40 dark:bg-[#D4A574]/60" />
        <div className="w-1 h-1 rotate-45 bg-[#D4A574]/30 dark:bg-[#D4A574]/50" />
      </div>
      <div className="h-[1px] w-8 bg-gradient-to-l from-[#D4A574]/30 to-transparent" />
      {/* Central star pattern */}
      <div className="relative w-6 h-6">
        <div className="absolute inset-0 rotate-0">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#D4A574]/50" />
        </div>
        <div className="absolute inset-0 rotate-45">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#D4A574]/50" />
        </div>
        <div className="absolute inset-0 rotate-90">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#D4A574]/50" />
        </div>
        <div className="absolute inset-0 rotate-[135deg]">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#D4A574]/50" />
        </div>
        <div className="absolute inset-[7px] rounded-full border border-[#D4A574]/40" />
        <div className="absolute inset-[10px] rounded-full bg-[#D4A574]/30" />
      </div>
      <div className="h-[1px] w-8 bg-gradient-to-r from-[#D4A574]/30 to-transparent" />
      <div className="flex items-center gap-[3px]">
        <div className="w-1 h-1 rotate-45 bg-[#D4A574]/30 dark:bg-[#D4A574]/50" />
        <div className="w-1.5 h-1.5 rotate-45 bg-[#D4A574]/40 dark:bg-[#D4A574]/60" />
        <div className="w-2 h-2 rotate-45 bg-[#D4A574]/60 dark:bg-[#D4A574]/80" />
      </div>
    </div>
  )
}

// Limited time offer floating badge
function LimitedOfferBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.5, type: 'spring' }}
      className="absolute top-8 left-8 sm:top-12 sm:left-12 z-20"
    >
      <motion.div
        animate={{
          boxShadow: [
            '0 0 15px rgba(212, 165, 116, 0.2), 0 0 30px rgba(212, 165, 116, 0.1)',
            '0 0 25px rgba(212, 165, 116, 0.4), 0 0 50px rgba(212, 165, 116, 0.2)',
            '0 0 15px rgba(212, 165, 116, 0.2), 0 0 30px rgba(212, 165, 116, 0.1)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="bg-gradient-to-l from-[#D4A574] to-[#b8885a] text-white rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-2 border border-[#E8C9A0]/30"
        >
          <Flame className="h-4 w-4 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] font-medium opacity-80">لفترة محدودة</span>
            <span className="text-xs font-bold">خصم حتى ٤٠٪</span>
          </div>
          <Sparkles className="h-3 w-3 opacity-60" />
        </motion.div>

        {/* Decorative corner dots */}
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E8C9A0] animate-ping" />
      </motion.div>
    </motion.div>
  )
}

// Word-by-word reveal animation for Arabic text (preserves letter connections)
function WordRevealText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ')
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.6,
            delay: delay + i * 0.15,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="inline-block"
          style={{ marginLeft: i < words.length - 1 ? '0.3em' : undefined }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// Particle burst on CTA button hover
function ButtonParticleBurst({ isActive }: { isActive: boolean }) {
  const [burstParticles, setBurstParticles] = useState<Array<{
    id: number
    angle: number
    distance: number
    size: number
    duration: number
  }>>([])

  /* eslint-disable react-hooks/set-state-in-effect -- client-only random values to avoid hydration mismatch */
  useEffect(() => {
    setBurstParticles(
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        angle: (i / 8) * Math.PI * 2,
        distance: 30 + Math.random() * 20,
        size: 2 + Math.random() * 2,
        duration: 0.4 + Math.random() * 0.3,
      }))
    )
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (burstParticles.length === 0) return null

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {burstParticles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute top-1/2 left-1/2 rounded-full bg-[#E8C9A0] pointer-events-none"
              style={{ width: p.size, height: p.size }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos(p.angle) * p.distance,
                y: Math.sin(p.angle) * p.distance,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, ease: 'easeOut' }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  )
}

// Scroll down indicator
function ScrollIndicator({ scrollY }: { scrollY: number }) {
  const opacity = Math.max(0, 1 - scrollY / 300)

  if (opacity <= 0) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center"
      >
        <ChevronDown className="h-6 w-6 text-white/50 dark:text-[#D4A574]/50" />
        <ChevronDown className="h-4 w-4 text-white/30 dark:text-[#D4A574]/30 -mt-2" />
      </motion.div>
      <span className="text-[10px] text-white/30 dark:text-[#D4A574]/30 font-medium tracking-wider">
        اسحبي للأسفل
      </span>
    </motion.div>
  )
}

interface Banner {
  id: string
  titleAr?: string
  titleEn?: string
  subtitleAr?: string
  subtitleEn?: string
  image: string
  linkType?: 'product' | 'category' | 'url' | 'none'
  linkId?: string
  position: 'hero' | 'middle' | 'sidebar' | 'footer'
}

export default function HeroSection() {
  const navigateToShop = useUIStore((s) => s.navigateToShop)
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [ctaHovered, setCtaHovered] = useState(false)
  
  // Banner state
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  
  // Fetch banners
  useEffect(() => {
    fetch('/api/banners?position=hero')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          setBanners(data.data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])
  
  // Auto-rotate banners
  useEffect(() => {
    if (banners.length === 0 || isHovered) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [banners.length, isHovered])
  
  const currentBanner = banners[currentIndex]
  
  const handleBannerClick = () => {
    if (!currentBanner?.linkType || currentBanner.linkType === 'none') {
      navigateToShop()
      return
    }
    
    // Handle different link types
    switch (currentBanner.linkType) {
      case 'product':
        // TODO: navigate to product
        window.location.href = `/product/${currentBanner.linkId}`
        break
      case 'category':
        window.location.href = `/shop?category=${currentBanner.linkId}`
        break
      case 'url':
        window.open(currentBanner.linkId, '_blank')
        break
    }
  }


  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        const isVisible = rect.bottom > 0 && rect.top < window.innerHeight
        if (isVisible) {
          setScrollY(window.scrollY)
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="relative h-[90vh] min-h-[650px] max-h-[950px] overflow-hidden">
      {/* Background Image with parallax (scrollY * 0.15) */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${scrollY * 0.15}px)` }}
      >
{loading || !currentBanner ? (
        <Image
          src="/hero-banner.png"
          alt="DONATELLA - أناقة بلا حدود"
          fill
          unoptimized
          priority
          className="object-cover scale-110"
        />
      ) : (
        <Image
          key={`banner-${currentBanner.id}`}
          src={currentBanner.image}
          alt={currentBanner.titleAr || 'بانر'}
          fill
          unoptimized={!loading}
          priority={!loading}
          className="object-cover scale-110 transition-opacity duration-1000"
        />
      )}
      </div>

      {/* Overlay gradients with slower parallax (scrollY * 0.08) */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${scrollY * 0.08}px)` }}
      >
        {/* Enhanced gradient overlay */}
        {/* Main overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/50 to-black/25 dark:from-black/80 dark:via-black/65 dark:to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent dark:from-black/50 dark:via-transparent dark:to-transparent" />
        
        {/* Banner-specific bottom overlay for text */}
        {currentBanner && (
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
        )}
        
        {/* Warm tone overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C4A4A4]/10 via-transparent to-[#D4A574]/10 dark:from-[#D4A574]/8 dark:via-transparent dark:to-[#C4A4A4]/8" />
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Decorative floating circles with faster parallax (scrollY * -0.05) */}
      <div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ transform: `translateY(${scrollY * -0.05}px)` }}
      >
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 rounded-full border border-white/5 dark:border-[#D4A574]/8 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-32 left-20 w-48 h-48 rounded-full border border-white/5 dark:border-[#C4A4A4]/8 pointer-events-none"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-[#D4A574]/5 dark:bg-[#D4A574]/10 pointer-events-none dark-gold-pulse"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-16 h-16 rounded-full bg-[#C4A4A4]/5 dark:bg-[#C4A4A4]/10 pointer-events-none"
          animate={{ y: [0, 15, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Limited Time Offer Badge */}
      <LimitedOfferBadge />

      {/* Dynamic banner content OR static */}
      <div 
        className="relative z-10 h-full flex items-center cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleBannerClick}
      >
        {/* Static hero content (when no banners or loading) */}
        {!currentBanner && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              {/* Season Label */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center gap-3 mb-5"
              >
                <div className="h-px w-12 bg-elegant-gold dark:shadow-[0_0_8px_rgba(212,165,116,0.3)]" />
                <p className="text-elegant-gold dark-gold-shimmer font-medium tracking-[0.2em] text-sm uppercase">
                  مجموعة ربيع ٢٠٢٦
                </p>
              </motion.div>

            {/* Main Heading with word-by-word reveal (preserves Arabic letter connections) */}
            <div className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-2">
              <WordRevealText text="أناقة بلا" delay={0.4} />
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="block bg-gradient-to-l from-[#D4A574] via-[#E8C9A0] to-[#D4A574] dark:from-[#D4A574] dark:via-[#F0D8B0] dark:to-[#D4A574] bg-clip-text text-transparent dark-gold-shimmer"
              >
                حدود
              </motion.span>
            </div>

            {/* Arabic Geometric Ornamental Pattern */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1.2, delay: 0.6 }}
            >
              <ArabicOrnamentalLine />
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-base sm:text-lg text-white/75 dark:text-white/80 mb-8 leading-relaxed max-w-md"
            >
              اكتشفي أحدث صيحات الموضة النسائية مع دوناتيلا. تصاميم فاخرة تناسب
              ذوقك الرفيع وتعكس جمالك الداخلي.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col items-start gap-4"
            >
              {/* Main CTA with animated gradient border and particle burst */}
              <div className="relative group/btn">
                {/* Animated gradient border */}
                <div className="absolute -inset-[2px] rounded-[14px] bg-gradient-to-l from-[#D4A574] via-[#E8C9A0] to-[#C4A4A4] to-[#D4A574] opacity-60 group-hover/btn:opacity-100 transition-opacity duration-500 animate-gradient-rotate" />
                <Button
                  onClick={() => navigateToShop()}
                  onMouseEnter={() => setCtaHovered(true)}
                  onMouseLeave={() => setCtaHovered(false)}
                  className="relative overflow-hidden bg-gradient-to-l from-[#D4A574] via-[#C49A6C] to-[#D4A574] hover:from-[#E8C9A0] hover:via-[#D4A574] hover:to-[#E8C9A0] text-white px-10 py-6 rounded-xl text-base font-bold gap-3 group shadow-xl shadow-[#D4A574]/20 dark:shadow-[#D4A574]/30 transition-all duration-300 hover:shadow-2xl hover:shadow-[#D4A574]/30 dark:hover:shadow-[#D4A574]/50 dark-gold-pulse hover:scale-[1.02]"
                  size="lg"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    تسوقي الآن
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1.5" />
                  </span>
                  {/* Enhanced shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 dark:via-white/15 to-transparent skew-x-12" />
                  {/* Particle burst on hover */}
                  <ButtonParticleBurst isActive={ctaHovered} />
                </Button>
              </div>

              {/* Secondary CTA */}
              <button
                onClick={() => navigateToShop()}
                className="flex items-center gap-2 text-white/70 hover:text-[#D4A574] dark:text-white/60 dark:hover:text-[#E8C9A0] transition-colors duration-300 text-sm group"
              >
                <Eye className="h-4 w-4" />
                <span>اكتشفي المجموعة</span>
                <span className="block max-w-0 group-hover:max-w-full h-px bg-[#D4A574] transition-all duration-300" />
              </button>
            </motion.div>

            {/* Countdown Timer */}
            <SeasonCountdown />
          </div>
        </div>
        )}
        
        {/* Dynamic banner overlay content */}
        {currentBanner && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              {/* Banner title */}
              <motion.h1
                key={`title-${currentBanner.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-4 lg:mb-6 drop-shadow-lg"
              >
                {currentBanner.titleAr || currentBanner.titleEn || 'اكتشفي الجديد'}
              </motion.h1>
              
              {/* Banner subtitle */}
              {currentBanner.subtitleAr && (
                <motion.p
                  key={`subtitle-${currentBanner.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl sm:text-2xl text-white/90 mb-8 max-w-lg leading-relaxed drop-shadow-md"
                >
                  {currentBanner.subtitleAr}
                </motion.p>
              )}
              
              {/* Banner CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex gap-4"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#D4A574] to-[#b8885a] hover:from-[#E8C9A0] hover:to-[#D4A574] text-white px-8 py-6 rounded-xl text-lg font-bold shadow-xl shadow-[#D4A574]/25 hover:shadow-2xl hover:shadow-[#D4A574]/40 transition-all duration-300"
                >
                  {currentBanner.linkType === 'none' ? 'اكتشفي المزيد' : 'تسوقي الآن'}
                </Button>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.5, delay: 1 }}
        className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent"
      />

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-[#D4A574]/30 dark:via-[#D4A574]/50 to-transparent" />

      {/* Scroll down indicator */}
      <ScrollIndicator scrollY={scrollY} />
    </section>
  )
}

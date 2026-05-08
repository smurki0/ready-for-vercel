'use client'

import { motion } from 'framer-motion'
import {
  MapPin,
  Clock,
  CalendarCheck,
  Navigation,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useSiteSettings } from '@/hooks/use-site-settings'

function MapPlaceholder() {
  return (
    <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden bg-gradient-to-br from-[#D4A574]/5 via-[#C4A4A4]/5 to-[#8B6F6F]/5 dark:from-[#D4A574]/10 dark:via-[#C4A4A4]/8 dark:to-[#8B6F6F]/10 border border-[#D4A574]/20 dark:border-[#D4A574]/25 dark-glow-card">
      {/* Abstract map background */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 50"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Abstract landmass shapes */}
        <path
          d="M10 10 Q20 8 30 12 Q40 15 50 10 Q60 5 70 12 Q80 18 90 10 L95 10 L95 45 Q85 40 75 42 Q65 44 55 38 Q45 35 35 42 Q25 48 15 40 L5 45 L5 10 Z"
          fill="none"
          stroke="rgba(212,165,116,0.15)"
          strokeWidth="0.3"
        />
        <path
          d="M15 15 Q25 12 35 18 Q45 22 55 15 Q65 10 75 18 L80 22 Q70 25 60 20 Q50 18 40 24 Q30 28 20 22 Z"
          fill="rgba(212,165,116,0.04)"
          stroke="rgba(212,165,116,0.1)"
          strokeWidth="0.2"
        />
        {/* Grid lines */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="5"
            y1={8 + i * 7}
            x2="95"
            y2={8 + i * 7}
            stroke="rgba(212,165,116,0.06)"
            strokeWidth="0.15"
            strokeDasharray="1 2"
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={10 + i * 11}
            y1="5"
            x2={10 + i * 11}
            y2="47"
            stroke="rgba(212,165,116,0.06)"
            strokeWidth="0.15"
            strokeDasharray="1 2"
          />
        ))}
      </svg>

      {/* Center pin for Egypt */}
      <motion.div
        className="absolute z-10"
        style={{
          left: '55%',
          top: '35%',
          transform: 'translate(-50%, -100%)',
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Pulse ring */}
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#D4A574]/20"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
          }}
        />
        {/* Pin dot */}
        <motion.div
          className="relative w-5 h-5 rounded-full bg-[#D4A574] shadow-lg shadow-[#D4A574]/30 border-2 border-white dark:border-[#1A1614]"
          animate={{ y: [0, -3, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Label */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[10px] font-semibold text-[#D4A574] bg-background/80 dark:bg-[#1A1614]/80 backdrop-blur-sm px-2 py-0.5 rounded">
           ألاسكندرية
          </span>
        </div>
      </motion.div>

      {/* Decorative corner accents */}
      <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#D4A574]/20 rounded-tr-lg" />
      <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#D4A574]/20 rounded-bl-lg" />

      {/* Compass rose */}
      <div className="absolute top-4 left-4">
        <Navigation className="h-4 w-4 text-[#D4A574]/30 rotate-45" />
      </div>
    </div>
  )
}

function ComingSoonCard() {
  const handleNotifyMe = () => {
    toast.success('سنقوم بإشعارك عند افتتاح فرع أخر!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      <div className="relative p-8 rounded-2xl bg-card border border-[#D4A574]/20 dark:border-[#D4A574]/25 dark-glow-card dark-elevated-card transition-all duration-300 hover:border-[#D4A574]/40 hover:shadow-lg hover:shadow-[#D4A574]/5 dark:hover:border-[#D4A574]/50 dark:hover:shadow-[#D4A574]/10 text-center">
        {/* Animated map pin icon */}
        <motion.div
          className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#b8885a] flex items-center justify-center shadow-md shadow-[#D4A574]/20 mx-auto mb-5"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <MapPin className="h-8 w-8 text-white" />
        </motion.div>

        <h3 className="text-2xl font-bold text-foreground mb-3">
          قريباً في فرع أخر
        </h3>

        <p className="text-muted-foreground text-sm mb-4 leading-relaxed max-w-md mx-auto">
           نسعى لتقديم تجربة تسوق فاخرة لعملائنا في القاهرة والإسكندرية والجيزة وغيرها من المحافظات.
        </p>

        {/* Coming soon cities */}
        <div className="flex flex-wrap justify-center gap-2 mb-5">
          {['القاهرة', 'الإسكندرية', 'الجيزة', 'المنصورة', 'دمنهور'].map((city) => (
            <span
              key={city}
              className="text-xs px-3 py-1.5 rounded-full bg-[#D4A574]/10 text-[#D4A574] border border-[#D4A574]/15 font-medium"
            >
              <MapPin className="h-3 w-3 inline ml-1" />
              {city}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-5">
          <Clock className="h-4 w-4 text-[#D4A574]" />
          <span>الافتتاح القادم: قريباً</span>
        </div>

        {/* Notify me button */}
        <Button
          onClick={handleNotifyMe}
          className="rounded-xl bg-gradient-to-l from-[#D4A574] to-[#b8885a] hover:from-[#b8885a] hover:to-[#a07848] text-white font-medium gap-2 shadow-md shadow-[#D4A574]/15 hover:shadow-lg hover:shadow-[#D4A574]/25 transition-all"
        >
          <CalendarCheck className="h-4 w-4" />
          أبلغيني عند الافتتاح
        </Button>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-[#D4A574]">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">استعدي لتجربة فاخرة</span>
          <Sparkles className="h-3.5 w-3.5" />
        </div>

        {/* Decorative golden corner accent */}
        <div className="absolute top-0 left-0 w-12 h-12 overflow-hidden rounded-tl-2xl">
          <div className="absolute top-0 left-0 w-px h-8 bg-gradient-to-b from-[#D4A574]/40 to-transparent" />
          <div className="absolute top-0 left-0 h-px w-8 bg-gradient-to-r from-[#D4A574]/40 to-transparent" />
        </div>
      </div>
    </motion.div>
  )
}

export default function StoreLocator() {
  const { getSetting } = useSiteSettings()
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#D4A574]/3 via-transparent to-[#C4A4A4]/3 dark:from-[#D4A574]/6 dark:via-transparent dark:to-[#C4A4A4]/6 dark-dot-pattern" />

      {/* Top decorative line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A574]/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4A574]/60" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#b8885a] flex items-center justify-center shadow-lg shadow-[#D4A574]/20">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4A574]/60" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">{getSetting('storeLocatorTitle', 'فروعنا')}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {getSetting('storeLocatorSubtitle', 'قريباً سنفتتح فروع أكثر في مصر لنكون أقرب إليكِ')}
          </p>
        </motion.div>

        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <MapPlaceholder />
        </motion.div>

        {/* Coming Soon Card */}
        <div className="max-w-xl mx-auto">
          <ComingSoonCard />
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <p className="text-xs text-muted-foreground">
            يمكنك التسوق أونلاين الآن والتوصيل لجميع محافظات مصر
          </p>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin, ChevronLeft, CreditCard, Smartphone, Shield, Download, ArrowUp, Lock, Send, CheckCircle, Clock, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Category {
  id: string
  nameAr: string
  slug: string
}

// Arabic Islamic geometric ornamental pattern at top (similar to hero section)
function FooterOrnamentalPattern() {
  return (
    <div className="relative overflow-hidden" aria-hidden="true">
      {/* Gradient background strip */}
      <div className="absolute inset-0 bg-gradient-to-l from-[#D4A574]/10 via-[#8B6F6F]/8 to-[#C4A4A4]/10" />
      {/* Islamic geometric SVG pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="footerIslamicPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M30 5L35 15L45 15L37 22L40 32L30 26L20 32L23 22L15 15L25 15Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.5"
            />
            <line x1="0" y1="30" x2="60" y2="30" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
            <line x1="30" y1="0" x2="30" y2="60" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
            <path d="M0 0L5 5L0 10L-5 5Z" fill="currentColor" opacity="0.2" />
            <path d="M60 0L65 5L60 10L55 5Z" fill="currentColor" opacity="0.2" />
            <path d="M0 60L5 65L0 70L-5 65Z" fill="currentColor" opacity="0.2" />
            <path d="M60 60L65 65L60 70L55 65Z" fill="currentColor" opacity="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footerIslamicPattern)" className="text-[#D4A574]" />
      </svg>
      {/* Central ornamental line pattern */}
      <div className="relative flex items-center justify-center py-6 gap-3">
        <div className="flex items-center gap-[3px]">
          <div className="w-2 h-2 rotate-45 bg-[#D4A574]/50" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#D4A574]/35" />
          <div className="w-1 h-1 rotate-45 bg-[#D4A574]/25" />
        </div>
        <div className="h-[1px] w-12 bg-gradient-to-l from-[#D4A574]/30 to-transparent" />
        {/* Central star pattern */}
        <div className="relative w-7 h-7">
          <div className="absolute inset-0 rotate-0">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#D4A574]/40" />
          </div>
          <div className="absolute inset-0 rotate-45">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#D4A574]/40" />
          </div>
          <div className="absolute inset-0 rotate-90">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#D4A574]/40" />
          </div>
          <div className="absolute inset-0 rotate-[135deg]">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#D4A574]/40" />
          </div>
          <div className="absolute inset-[8px] rounded-full border border-[#D4A574]/30" />
          <div className="absolute inset-[11px] rounded-full bg-[#D4A574]/20" />
        </div>
        <div className="h-[1px] w-12 bg-gradient-to-r from-[#D4A574]/30 to-transparent" />
        <div className="flex items-center gap-[3px]">
          <div className="w-1 h-1 rotate-45 bg-[#D4A574]/25" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#D4A574]/35" />
          <div className="w-2 h-2 rotate-45 bg-[#D4A574]/50" />
        </div>
      </div>
    </div>
  )
}

// Arabic pattern divider between columns
function ArabicPatternDivider() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center px-2" aria-hidden="true">
      <div className="flex flex-col items-center gap-2">
        <div className="w-1.5 h-1.5 rotate-45 bg-[#D4A574]/40" />
        <div className="w-0.5 h-8 bg-gradient-to-b from-[#D4A574]/30 via-[#D4A574]/15 to-transparent" />
        <div className="w-2.5 h-2.5 rotate-45 border border-[#D4A574]/30" />
        <div className="w-3 h-3 rotate-45 bg-[#D4A574]/10 border border-[#D4A574]/20" />
        <div className="w-2.5 h-2.5 rotate-45 border border-[#D4A574]/30" />
        <div className="w-0.5 h-8 bg-gradient-to-b from-transparent via-[#D4A574]/15 to-[#D4A574]/30" />
        <div className="w-1.5 h-1.5 rotate-45 bg-[#D4A574]/40" />
      </div>
    </div>
  )
}

// Secure Shopping badge section
function SecureShoppingBadge() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-warm-beige/5 dark:bg-warm-beige/[0.03] border border-warm-beige/10 dark:border-warm-beige/[0.06] mt-4">
      <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
        <Lock className="h-4 w-4 text-emerald-500" />
      </div>
      <div>
        <p className="text-xs font-semibold text-warm-beige/80 dark:text-warm-beige/90">تسوق بأمان</p>
        <p className="text-[10px] text-warm-beige/40 dark:text-warm-beige/50">حماية كاملة لبياناتك الدفعية</p>
      </div>
      <Shield className="h-4 w-4 text-emerald-500/40 mr-auto shrink-0" />
    </div>
  )
}

// Payment method icon component
function PaymentIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="h-9 px-3.5 rounded-lg bg-warm-beige/5 border border-warm-beige/10 flex items-center justify-center gap-1.5 hover:border-[#D4A574]/30 hover:bg-warm-beige/[0.08] transition-colors cursor-default"
      title={label}
    >
      {children}
    </motion.div>
  )
}

// Social media icon with hover animation
function SocialIcon({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) {
  return (
    <motion.a
      href={href}
      className="group/social relative h-10 w-10 rounded-full bg-warm-beige/10 dark:bg-warm-beige/5 flex items-center justify-center hover:bg-[#D4A574] hover:text-charcoal transition-all duration-300"
      whileHover={{ scale: 1.15, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
    >
      <Icon className="h-[18px] w-[18px] transition-transform duration-300 group-hover/social:scale-110" />
      {/* Ripple effect */}
      <span className="absolute inset-0 rounded-full bg-[#D4A574]/20 scale-0 group-hover/social:scale-150 opacity-0 group-hover/social:opacity-100 transition-all duration-500" />
      {/* Glow effect */}
      <span className="absolute inset-0 rounded-full opacity-0 group-hover/social:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(212,165,116,0.4)]" />
      {/* Tooltip */}
      <span className="absolute -top-9 right-1/2 translate-x-1/2 text-[10px] text-warm-beige/70 bg-charcoal/90 dark:bg-[#1A1614]/90 px-2.5 py-1 rounded-md opacity-0 group-hover/social:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
        {label}
      </span>
    </motion.a>
  )
}

// Store info item
function StoreInfoItem({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm text-warm-beige/55 group">
      <div className="h-9 w-9 rounded-lg bg-warm-beige/5 flex items-center justify-center group-hover:bg-[#D4A574]/10 transition-colors shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <span>{children}</span>
    </div>
  )
}

export default function Footer() {
  const setPage = useUIStore((s) => s.setPage)
  const navigateToShop = useUIStore((s) => s.navigateToShop)
  const [categories, setCategories] = useState<Category[]>([])
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch {
        // silently fail
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubscribe = () => {
    if (!email.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني')
      return
    }
    setSubscribed(true)
    toast.success('تم الاشتراك بنجاح!')
    setTimeout(() => {
      setSubscribed(false)
      setEmail('')
    }, 3000)
  }

  return (
    <footer className="mt-auto bg-charcoal dark:bg-[#1A1614] text-warm-beige/80 dark:text-warm-beige/90 relative">
      {/* Top gradient border */}
      <div className="h-1 bg-gradient-to-l from-[#D4A574] via-[#C4A4A4] to-[#D4A574]" />

      {/* Decorative Arabic Ornamental Pattern */}
      <FooterOrnamentalPattern />

      {/* Newsletter Section with gradient background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-[#D4A574]/10 via-[#8B6F6F]/8 to-[#C4A4A4]/10" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle, rgba(212,165,116,0.3) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-right">
              <h3 className="text-lg font-bold text-warm-beige dark:text-warm-beige/95 flex items-center gap-2 justify-center sm:justify-start">
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Send className="h-5 w-5 text-[#D4A574]" />
                </motion.span>
                اشتركي في نشرتنا البريدية
              </h3>
              <p className="text-sm text-warm-beige/50 dark:text-warm-beige/60 mt-1">
                احصلي على أحدث العروض والتصاميم مباشرة في بريدك
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <AnimatePresence mode="wait">
                {subscribed ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 text-emerald-400 text-sm font-medium"
                  >
                    <CheckCircle className="h-5 w-5" />
                    تم الاشتراك بنجاح!
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                      placeholder="بريدك الإلكتروني"
                      className="h-10 rounded-xl bg-warm-beige/5 dark:bg-warm-beige/[0.03] border-warm-beige/15 dark:border-warm-beige/10 text-warm-beige dark:text-warm-beige/90 placeholder:text-warm-beige/30 sm:w-[240px]"
                      dir="ltr"
                    />
                    <Button
                      onClick={handleSubscribe}
                      className="group/btn h-10 rounded-xl bg-gradient-to-l from-[#D4A574] to-[#b8885a] text-white px-6 shrink-0 hover:shadow-lg hover:shadow-[#D4A574]/20 transition-all relative overflow-hidden"
                    >
                      <span className="relative z-10">اشتركي</span>
                      {/* Shimmer hover effect */}
                      <span className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        {/* Bottom golden gradient of newsletter section */}
        <div className="h-px bg-gradient-to-l from-[#D4A574]/40 via-[#D4A574]/70 to-[#D4A574]/40" />
      </div>

      {/* Subtle gradient background for main content */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4A574]/[0.015] to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Main Footer Grid - 4 columns with pattern dividers */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-0">
            {/* Column 1: About */}
            <div className="space-y-4 lg:flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl font-bold tracking-wider text-warm-beige">DONATELLA</h3>
                <div className="h-px flex-1 bg-gradient-to-l from-warm-beige/20 to-transparent" />
              </div>
              <p className="text-sm leading-relaxed text-warm-beige/55 dark:text-warm-beige/60">
                متجر دوناتيلا للأزياء النسائية الفاخرة، نقدم لكِ أرقى التصاميم وأجمل
                القطع التي تعكس أناقتك وذوقك الرفيع. اكتشفي مجموعتنا المميزة من
                الفساتين والملابس اليومية وإكسسوارات السهرات.
              </p>

              {/* Social Media Icons with enhanced hover animations */}
              <div className="flex items-center gap-3 pt-3">
                <SocialIcon icon={Instagram} label="إنستجرام" href="https://www.instagram.com/donatella.women.wear?igsh=MXAwMTkyZnFmbjR4bw==" />
                {/* <SocialIcon icon={Twitter} label="تويتر" href="#" /> */}
                <SocialIcon icon={Facebook} label="فيسبوك" href="https://www.facebook.com/profile.php?id=61586281923112" />
              </div>

              {/* Store Info with phone/email */}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-warm-beige/[0.06]">
                <StoreInfoItem icon={Phone}>
                  <span dir="ltr">+20 100 123 4567</span>
                </StoreInfoItem>
                <StoreInfoItem icon={Mail}>
                  info@donatella.eg
                </StoreInfoItem>
                <StoreInfoItem icon={MapPin}>
                  الاسكندرية، جمهورية مصر العربية
                </StoreInfoItem>
                <StoreInfoItem icon={Clock}>
                  السبت - الخميس: 10 ص - 10 م
                </StoreInfoItem>
              </div>

              {/* Secure Shopping Badge */}
              <SecureShoppingBadge />
            </div>

            {/* Pattern divider */}
            <ArabicPatternDivider />

            {/* Column 2: Quick Links & Shop by Category */}
            <div className="space-y-6 lg:flex-1">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-warm-beige flex items-center gap-2">
                  <div className="h-px w-6 bg-[#D4A574]" />
                  روابط سريعة
                </h3>
                <nav className="flex flex-col gap-2.5">
                  <button
                    onClick={() => setPage('home')}
                    className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                  >
                    <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    الرئيسية
                  </button>
                  <button
                    onClick={() => setPage('shop')}
                    className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                  >
                    <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    المتجر
                  </button>
                  <button
                    onClick={() => setPage('shop')}
                    className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                  >
                    <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    العروض المميزة
                  </button>
                  <button
                    onClick={() => setPage('contact')}
                    className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                  >
                    <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    تواصلي معنا
                  </button>
                  <button
                    onClick={() => setPage('auth')}
                    className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                  >
                    <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    حسابي
                  </button>
                </nav>
              </div>

              {/* Shop by Category */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-warm-beige flex items-center gap-2">
                  <div className="h-px w-6 bg-[#D4A574]" />
                  تسوقي حسب التصنيف
                </h3>
                <nav className="flex flex-col gap-2.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => navigateToShop(cat.id)}
                      className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                    >
                      <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      {cat.nameAr}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Pattern divider */}
            <ArabicPatternDivider />

            {/* Column 3: Contact & Support */}
            <div className="space-y-6 lg:flex-1">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-warm-beige flex items-center gap-2">
                  <div className="h-px w-6 bg-[#D4A574]" />
                  خدمة العملاء
                </h3>
                <nav className="flex flex-col gap-2.5">
                  <button
                    onClick={() => setPage('contact')}
                    className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                  >
                    <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    تواصلي معنا
                  </button>
                  <button
                    className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                  >
                    <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    تتبع الطلب
                  </button>
                  <button
                    className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                  >
                    <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    دليل المقاسات
                  </button>
                  <button
                    className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                  >
                    <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    الشحن والتوصيل
                  </button>
                </nav>
              </div>

              {/* Working Hours Card */}
              <div className="p-4 rounded-xl bg-warm-beige/[0.03] border border-warm-beige/[0.06]">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-[#D4A574]" />
                  <span className="text-sm font-semibold text-warm-beige/80">ساعات العمل</span>
                </div>
                <div className="space-y-1.5 text-xs text-warm-beige/50">
                  <div className="flex justify-between">
                    <span>السبت - الخميس</span>
                    <span className="text-warm-beige/70">10:00 ص - 10:00 م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الجمعة</span>
                    <span className="text-warm-beige/70">2:00 م - 10:00 م</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pattern divider */}
            <ArabicPatternDivider />

            {/* Column 4: Site Policies */}
            <div className="space-y-4 lg:flex-1">
              <h3 className="text-lg font-semibold text-warm-beige flex items-center gap-2">
                <div className="h-px w-6 bg-[#D4A574]" />
                سياسة الموقع
              </h3>
              <nav className="flex flex-col gap-2.5">
                <button
                  className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                >
                  <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  سياسة الخصوصية
                </button>
                <button
                  className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                >
                  <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  شروط الاستخدام
                </button>
                <button
                  className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                >
                  <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  سياسة الإرجاع
                </button>
                <button
                  className="text-sm text-warm-beige/55 hover:text-[#D4A574] transition-colors text-right flex items-center gap-1 group"
                >
                  <ChevronLeft className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  الأسئلة الشائعة
                </button>
              </nav>

              {/* Second Newsletter form (compact) in column 4 */}
              <div className="mt-6 pt-4 border-t border-warm-beige/[0.06]">
                <p className="text-xs text-warm-beige/40 mb-2 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  اشتركي لتصلك العروض
                </p>
                <div className="flex gap-2">
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    placeholder="بريدك الإلكتروني"
                    className="h-8 text-xs rounded-lg bg-warm-beige/5 border-warm-beige/10 text-warm-beige placeholder:text-warm-beige/25"
                    dir="ltr"
                  />
                  <Button
                    onClick={handleSubscribe}
                    size="sm"
                    className="h-8 px-3 rounded-lg bg-[#D4A574] hover:bg-[#b8885a] text-white shrink-0"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods - Enhanced */}
          <div className="mt-12 pt-8 border-t border-warm-beige/10 dark:border-warm-beige/[0.06]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <span className="text-xs text-warm-beige/40 ml-2">طرق الدفع:</span>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {/* Visa */}
                  <PaymentIcon label="فيزا">
                    <CreditCard className="h-4 w-4 text-blue-400/70" />
                    <span className="text-xs font-bold text-warm-beige/60 italic">VISA</span>
                  </PaymentIcon>
                  {/* Mastercard */}
                  <PaymentIcon label="ماستركارد">
                    <CreditCard className="h-4 w-4 text-orange-400/70" />
                    <span className="text-xs font-bold text-warm-beige/60">MC</span>
                  </PaymentIcon>
                  {/* Apple Pay */}
                  <PaymentIcon label="آبل باي">
                    <Smartphone className="h-3.5 w-3.5 text-warm-beige/60" />
                    <span className="text-xs font-medium text-warm-beige/60">Pay</span>
                  </PaymentIcon>
                  {/* Fawry */}
                  <PaymentIcon label="فوري">
                    <span className="text-xs font-bold text-[#D4A574]/70">فوري</span>
                  </PaymentIcon>
                  {/* Vodafone Cash */}
                  <PaymentIcon label="فودافون كاش">
                    <Smartphone className="h-3.5 w-3.5 text-red-400/60" />
                    <span className="text-[10px] font-medium text-warm-beige/50">كاش</span>
                  </PaymentIcon>
                  {/* Cash on Delivery */}
                  <PaymentIcon label="الدفع عند الاستلام">
                    <span className="text-xs font-bold text-warm-beige/50">نقدي</span>
                  </PaymentIcon>
                </div>
              </div>

              {/* App Download Badges */}
              {/* <div className="flex items-center gap-3">
                <span className="text-xs text-warm-beige/40 ml-2">حملي التطبيق:</span>
                <div className="flex items-center gap-2"> */}
                  {/* App Store */}
                  {/* <motion.div
                    whileHover={{ y: -2, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="h-9 px-3 rounded-lg bg-warm-beige/5 border border-warm-beige/10 flex items-center gap-2 hover:border-[#D4A574]/30 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-warm-beige/50" />
                    <div className="flex flex-col">
                      <span className="text-[8px] text-warm-beige/40 leading-tight">تحميل من</span>
                      <span className="text-xs font-semibold text-warm-beige/60 leading-tight">App Store</span>
                    </div> */}
                  {/* </motion.div> */}
                  {/* Google Play */}
                  {/* <motion.div
                    whileHover={{ y: -2, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="h-9 px-3 rounded-lg bg-warm-beige/5 border border-warm-beige/10 flex items-center gap-2 hover:border-[#D4A574]/30 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-warm-beige/50" />
                    <div className="flex flex-col">
                      <span className="text-[8px] text-warm-beige/40 leading-tight">تحميل من</span>
                      <span className="text-xs font-semibold text-warm-beige/60 leading-tight">Google Play</span>
                    </div>
                  </motion.div>
                </div> */}
              {/* </div> */}
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 text-center">
            {/* Decorative divider line */}
            <div className="flex items-center gap-3 mb-4 px-8">
              <div className="flex-1 h-px bg-gradient-to-l from-warm-beige/15 to-transparent" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#D4A574]/40" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-warm-beige/15" />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <p className="text-xs text-warm-beige/35 dark:text-warm-beige/45">
                © {new Date().getFullYear()} DONATELLA. جميع الحقوق محفوظة.
              </p>
              <span className="hidden sm:inline text-warm-beige/20">|</span>
              <p className="text-xs text-warm-beige/35 dark:text-warm-beige/45 flex items-center gap-1">
                صنع بـ{' '}
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-[#D4A574] inline-block"
                >
                  <Heart className="h-3 w-3" />
                </motion.span>
                {' '}في جمهورية مصر العربية
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 25px rgba(212,165,116,0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="group/btt fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-gradient-to-bl from-[#D4A574] to-[#b8885a] text-white shadow-lg shadow-[#D4A574]/25 hover:shadow-2xl hover:shadow-[#D4A574]/40 transition-shadow flex items-center justify-center relative"
            aria-label="العودة للأعلى"
          >
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowUp className="h-5 w-5" />
            </motion.div>
            {/* Tooltip */}
            <span className="absolute -top-9 right-1/2 translate-x-1/2 text-[11px] text-warm-beige/80 bg-charcoal/95 dark:bg-[#1A1614]/95 px-3 py-1 rounded-lg opacity-0 group-hover/btt:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
              العودة للأعلى
            </span>
            {/* Pulse ring */}
            <motion.span
              animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-[#D4A574]/20"
            />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  )
}

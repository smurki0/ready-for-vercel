'use client'

import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useSiteSettings } from '@/hooks/use-site-settings'

import Navbar from '@/components/donatella/navbar'
import Footer from '@/components/donatella/footer'
import HeroSection from '@/components/donatella/hero-section'
import TrustBadges from '@/components/donatella/trust-badges'
import FeaturedSection from '@/components/donatella/featured-section'
import CategoriesSection from '@/components/donatella/categories-section'
import PromoBanner from '@/components/donatella/promo-banner'
import ReviewsCarousel from '@/components/donatella/reviews-carousel'
import NewArrivalsSection from '@/components/donatella/new-arrivals-section'
import RecentlyViewed from '@/components/donatella/recently-viewed'
import NewsletterSection from '@/components/donatella/newsletter-section'
import ScrollToTop from '@/components/donatella/scroll-to-top'
import ShopSection from '@/components/donatella/shop-section'
import ProductDetail from '@/components/donatella/product-detail'
import CartPanel from '@/components/donatella/cart-panel'
import CheckoutSection from '@/components/donatella/checkout-section'
import AuthSection from '@/components/donatella/auth-section'
import OrdersSection from '@/components/donatella/orders-section'
import AdminSection from '@/components/donatella/admin-section'
import WishlistSection from '@/components/donatella/wishlist-section'
import ProfileSection from '@/components/donatella/profile-section'
import ContactSection from '@/components/donatella/contact-section'
import CompareSection, { CompareFloatingBar } from '@/components/donatella/compare-section'
import QuickViewDialog from '@/components/donatella/quick-view-dialog'
import CookieConsent from '@/components/donatella/cookie-consent'
import BreadcrumbNav from '@/components/donatella/breadcrumb-nav'
import StyleRecommendations from '@/components/donatella/style-recommendations'
import ChatWidget from '@/components/donatella/chat-widget'
import GiftCardsSection from '@/components/donatella/gift-cards-section'
import FlashSaleBanner from '@/components/donatella/flash-sale-banner'
import TrendingCollection from '@/components/donatella/trending-collection'
import RecentlyAddedSection from '@/components/donatella/recently-added-section'
import OutfitBuilder from '@/components/donatella/outfit-builder'
import LookbookSection from '@/components/donatella/lookbook-section'
import AdvancedSearch from '@/components/donatella/advanced-search'
import StoreLocator from '@/components/donatella/store-locator'
import MobileBottomNav from '@/components/donatella/mobile-bottom-nav'

function HomePage() {
  const { getSetting, getBoolSetting, getIntSetting } = useSiteSettings()

  const sections = [
    { key: 'hero', show: getBoolSetting('showHeroBanner', true), order: getIntSetting('heroOrder', 1), component: <HeroSection /> },
    { key: 'trustBadges', show: getBoolSetting('showTrustBadges', true), order: getIntSetting('trustBadgesOrder', 2), component: <TrustBadges /> },
    { key: 'styleRec', show: getBoolSetting('showStyleRecommendations', true), order: getIntSetting('styleRecommendationsOrder', 3), component: <StyleRecommendations /> },
    { key: 'featured', show: getBoolSetting('showFeaturedProducts', true), order: getIntSetting('featuredOrder', 4), component: <FeaturedSection title={getSetting('featuredTitle', 'المنتجات المميزة')} subtitle={getSetting('featuredSubtitle', 'أفضل المنتجات المختارة لكِ')} /> },
    { key: 'categories', show: getBoolSetting('showCategories', true), order: getIntSetting('categoriesOrder', 5), component: <CategoriesSection title={getSetting('categoriesTitle', 'التصنيفات')} subtitle={getSetting('categoriesSubtitle', 'اختاري ما يناسب ذوقك')} /> },
    { key: 'flashSale', show: getBoolSetting('showFlashSale', true), order: getIntSetting('flashSaleOrder', 6), component: <FlashSaleBanner title={getSetting('flashSaleTitle', 'تخفيضات خاطفة')} subtitle={getSetting('flashSaleSubtitle', 'عروض لا تتكرر')} ctaText={getSetting('flashSaleCtaText', 'تسوقي الآن')} /> },
    { key: 'trending', show: getBoolSetting('showTrending', true), order: getIntSetting('trendingOrder', 7), component: <TrendingCollection badge={getSetting('trendingBadge', 'موسم ربيع 2026')} title={getSetting('trendingTitle', 'مجموعة ربيع 2026')} subtitle={getSetting('trendingSubtitle', 'تصاميم مستوحاة من أناقة الطبيعة')} description={getSetting('trendingDescription', 'اكتشفي أحدث تشكيلاتنا المستوحاة من ألوان الربيع الدافئة وتفاصيل الطبيعة الساحرة. قطع فريدة تجمع بين الأصالة والحداثة لتضيف لمسة ساحرة لإطلالتك.')} ctaText={getSetting('trendingCtaText', 'تسوقي المجموعة')} /> },
    { key: 'promo', show: getBoolSetting('showPromoBanner', true), order: getIntSetting('promoOrder', 8), component: <PromoBanner badge={getSetting('promoBadge', 'عرض محدود')} title={getSetting('promoTitle', 'خصم 20% على جميع الفساتين')} description={getSetting('promoDescription', 'استمتعي بخصم حصري على مجموعة الفساتين المميزة. العرض ينتهي قريباً!')} ctaText={getSetting('promoCtaText', 'تسوقي الآن')} /> },
    { key: 'giftCards', show: getBoolSetting('showGiftCards', true), order: getIntSetting('giftCardsOrder', 9), component: <GiftCardsSection /> },
    { key: 'reviews', show: getBoolSetting('showTestimonials', true), order: getIntSetting('testimonialsOrder', 10), component: <ReviewsCarousel /> },
    { key: 'newArrivals', show: getBoolSetting('showNewArrivals', true), order: getIntSetting('newArrivalsOrder', 11), component: <NewArrivalsSection /> },
    { key: 'recentlyAdded', show: getBoolSetting('showRecentlyAdded', true), order: getIntSetting('recentlyAddedOrder', 12), component: <RecentlyAddedSection /> },
    { key: 'newsletter', show: getBoolSetting('showNewsletter', true), order: getIntSetting('newsletterOrder', 13), component: <NewsletterSection /> },
    { key: 'storeLocator', show: getBoolSetting('showStoreLocator', true), order: getIntSetting('storeLocatorOrder', 14), component: <StoreLocator /> },
  ]

  const visibleSections = sections
    .filter(s => s.show)
    .sort((a, b) => a.order - b.order)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {visibleSections.map(section => (
        <div key={section.key}>{section.component}</div>
      ))}
      <RecentlyViewed />
    </motion.div>
  )
}

/* ─── Golden Progress Bar ─────────────────────────────────────────────── */
function GoldenProgressBar({ isTransitioning }: { isTransitioning: boolean }) {
  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[100] h-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Background track */}
          <div className="absolute inset-0 bg-[#D4A574]/10 dark:bg-[#D4A574]/5" />
          {/* Animated progress bar */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#D4A574] via-[#E8C9A0] to-[#D4A574]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          />
          {/* Shimmer overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Curtain Reveal Overlay ──────────────────────────────────────────── */
function CurtainReveal({ isTransitioning }: { isTransitioning: boolean }) {
  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div className="fixed inset-0 z-[99] pointer-events-none">
          {/* Golden flash pulse */}
          <motion.div
            className="absolute inset-0 bg-[#D4A574]/8 dark:bg-[#D4A574]/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.35, times: [0, 0.4, 1] }}
          />
          {/* Horizontal line sweep */}
          <motion.div
            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A574] to-transparent"
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
          {/* Clip-path reveal curtain - sweeps from top */}
          <motion.div
            className="absolute inset-0 bg-background"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(100% 0 0 0)' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
          {/* Secondary golden accent line */}
          <motion.div
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A574]/40 to-transparent"
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Page Renderer with Enhanced Transitions ─────────────────────────── */
function PageRenderer() {
  const currentPage = useUIStore((s) => s.currentPage)
  const [displayPage, setDisplayPage] = useState(currentPage)
  const [isFading, setIsFading] = useState(false)

  // Derive transitioning state: true when pages differ OR during fade-out
  const isTransitioning = currentPage !== displayPage || isFading

  // Sync display page with a brief delay for curtain effect
  useEffect(() => {
    if (currentPage !== displayPage) {
      const timer = setTimeout(() => {
        setDisplayPage(currentPage)
        setIsFading(true)
        // Keep progress bar visible briefly after content loads
        setTimeout(() => setIsFading(false), 120)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [currentPage, displayPage])

  const pages: Record<string, React.ReactNode> = {
    home: <HomePage />,
    shop: <ShopSection />,
    product: <ProductDetail />,
    checkout: <CheckoutSection />,
    auth: <AuthSection />,
    orders: <OrdersSection />,
    wishlist: <WishlistSection />,
    profile: <ProfileSection />,
    compare: <CompareSection />,
    contact: <ContactSection />,
    admin: <AdminSection />,
    'admin-products': <AdminSection />,
    'admin-orders': <AdminSection />,
    'admin-users': <AdminSection />,
    'admin-categories': <AdminSection />,
    'admin-settings': <AdminSection />,
    'outfit-builder': <OutfitBuilder />,
    lookbook: <LookbookSection />,
  }

  return (
    <>
      <GoldenProgressBar isTransitioning={isTransitioning} />
      <CurtainReveal isTransitioning={isTransitioning} />
      <AnimatePresence mode="wait">
        <motion.main
          key={displayPage}
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1], delay: 0.05 },
          }}
          exit={{
            opacity: 0,
            y: -4,
            transition: { duration: 0.12, ease: [0.4, 0, 1, 1] },
          }}
          className="flex-1"
        >
          {pages[displayPage] || <HomePage />}
        </motion.main>
      </AnimatePresence>
    </>
  )
}

export default function Home() {
  const checkAuth = useAuthStore((s) => s.checkAuth)
  const user = useAuthStore((s) => s.user)
  const fetchCart = useCartStore((s) => s.fetchCart)
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist)

  // Initialize auth check on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Fetch cart and wishlist when user auth state changes
  useEffect(() => {
    if (user) {
      fetchCart()
      fetchWishlist()
    }
  }, [user, fetchCart, fetchWishlist])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <BreadcrumbNav />
      <PageRenderer />
      <Footer />
      <CartPanel />
      <QuickViewDialog />
      <CompareFloatingBar />
      <ScrollToTop />
      <CookieConsent />
      <ChatWidget />
      <AdvancedSearch />
      <MobileBottomNav />
    </div>
  )
}

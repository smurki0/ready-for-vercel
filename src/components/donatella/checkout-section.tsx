'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Loader2,
  CreditCard,
  Banknote,
  Smartphone,
  Gift,
  Truck,
  CheckCheck,
  ChevronLeft,
  Package,
  CalendarDays,
  PartyPopper,
  Sparkles,
  MapPin,
  Bookmark,
  Eye,
  EyeOff,
  Wifi,
  Tag,
  Shield,
  Map,
  Home,
  Building2,
  Navigation,
  Star,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { safeJsonParse } from '@/lib/utils'

type PaymentMethod = 'cod' | 'credit_card' | 'apple_pay' | 'vodafone_cash' | 'instapay'
type CheckoutStep = 1 | 2 | 3

const DEFAULT_TAX_RATE = 14 // 14% VAT (Egypt)
const DEFAULT_SHIPPING_FEE = 30 // Default shipping fee (Egypt)
const DEFAULT_SHIPPING_THRESHOLD = 300 // Default free shipping above this

interface ShippingZone {
  id: string
  nameAr: string
  region: string
  price: number
  freeAbove: number | null
  estimatedDays: string
}

interface SavedAddress {
  id: string
  name: string
  phone: string
  address: string
  label: string
  isDefault: boolean
}

// Confetti component - enhanced
function ConfettiAnimation() {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    rotation: number
    color: string
    delay: number
    size: number
    shape: 'circle' | 'square' | 'star' | 'diamond'
  }>>([])

  useEffect(() => {
    const colors = [
      '#D4A574', '#E8B4B8', '#C9A96E', '#F5E6D3',
      '#8B6F47', '#D4738A', '#9B2335', '#FFD700',
      '#FF69B4', '#FFB6C1', '#C4A4A4', '#8B6F6F',
      '#E6C5A8', '#F0D5BD',
    ]
    const shapes: Array<'circle' | 'square' | 'star' | 'diamond'> = ['circle', 'square', 'star', 'diamond']
    const newParticles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      size: 4 + Math.random() * 10,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: `${p.y}vh`, rotate: 0, opacity: 1 }}
          animate={{
            y: '110vh',
            rotate: p.rotation + 720,
            x: `${p.x + (Math.random() - 0.5) * 30}vw`,
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            delay: p.delay,
            ease: 'easeOut',
          }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius:
              p.shape === 'circle' ? '50%' :
              p.shape === 'diamond' ? '2px' :
              p.shape === 'square' ? '3px' :
              '50%',
            transform: p.shape === 'diamond' ? 'rotate(45deg)' : undefined,
          }}
        />
      ))}
    </div>
  )
}

// Step indicator component
function StepIndicator({ currentStep }: { currentStep: CheckoutStep }) {
  const steps = [
    { num: 1, label: 'الشحن', icon: Truck },
    { num: 2, label: 'الدفع', icon: CreditCard },
    { num: 3, label: 'التأكيد', icon: CheckCheck },
  ]

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const isActive = currentStep === step.num
        const isCompleted = currentStep > step.num
        const Icon = step.icon

        return (
          <div key={step.num} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                scale: isActive ? 1.05 : 1,
              }}
              className="flex flex-col items-center"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 dark:bg-green-600 text-white shadow-lg shadow-green-500/30 dark:shadow-green-600/20'
                    : isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`text-xs mt-2 font-medium transition-colors ${
                  isActive ? 'text-primary' : isCompleted ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </motion.div>
            {index < steps.length - 1 && (
              <div className="mx-3 sm:mx-6 mb-5">
                <div className="w-12 sm:w-20 h-0.5 rounded-full overflow-hidden bg-muted">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-green-500"
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Payment method card
function PaymentMethodCard({
  method,
  selected,
  onSelect,
  customLabel,
  customDesc,
  instructions,
}: {
  method: PaymentMethod
  selected: boolean
  onSelect: () => void
  customLabel?: string
  customDesc?: string
  instructions?: string
}) {
  const config: Record<PaymentMethod, { icon: typeof Banknote; label: string; desc: string; color: string }> = {
    cod: { icon: Banknote, label: 'الدفع عند الاستلام', desc: 'ادفعي عند التوصيل', color: '#22c55e' },
    credit_card: { icon: CreditCard, label: 'بطاقة ائتمانية', desc: 'Visa / Mastercard', color: '#3b82f6' },
    apple_pay: { icon: Smartphone, label: 'Apple Pay', desc: 'دفع سريع وآمن', color: '#000000' },
    vodafone_cash: { icon: Smartphone, label: 'فودافون كاش', desc: 'ادفعي عبر فودافون كاش', color: '#e60000' },
    instapay: { icon: Wifi, label: 'انستاباي', desc: 'تحويل فوري عبر انستاباي', color: '#6366f1' },
  }

  const { icon: Icon, color } = config[method]
  const label = customLabel || config[method].label
  const desc = customDesc || config[method].desc

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
        selected
          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
          : 'border-border/50 bg-background hover:border-primary/30'
      }`}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 left-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
        </motion.div>
      )}
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}
          style={selected ? undefined : { backgroundColor: `${color}15`, color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      {selected && instructions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-2.5 rounded-lg bg-muted/50 text-xs text-muted-foreground"
        >
          {instructions}
        </motion.div>
      )}
    </motion.div>
  )
}

// Visual credit card preview
function CreditCardPreview({
  cardNumber,
  cardName,
  expiry,
}: {
  cardNumber: string
  cardName: string
  expiry: string
}) {
  const last4 = cardNumber.replace(/\s/g, '').slice(-4)
  const displayNumber = cardNumber
    ? `•••• •••• •••• ${last4}`
    : '•••• •••• •••• ••••'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, rotateY: -10 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-xs mx-auto aspect-[1.586/1] rounded-2xl overflow-hidden shadow-xl"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
      }}
    >
      {/* Card decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between p-5 text-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="h-8 w-12 rounded bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-80" />
          </div>
          <CreditCard className="h-6 w-6 text-white/60" />
        </div>

        <div>
          <p className="text-lg tracking-[0.2em] font-mono mb-4" dir="ltr">
            {displayNumber}
          </p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-white/50 mb-0.5">اسم حامل البطاقة</p>
              <p className="text-xs tracking-wider uppercase" dir="ltr">
                {cardName || 'YOUR NAME'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-white/50 mb-0.5">الانتهاء</p>
              <p className="text-xs tracking-wider" dir="ltr">
                {expiry || 'MM/YY'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function CheckoutSection() {
  const setPage = useUIStore((s) => s.setPage)
  const { items, getTotal, fetchCart } = useCartStore()
  const user = useAuthStore((s) => s.user)

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1)
  const [customerName, setCustomerName] = useState(user?.name || '')
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '')
  const [address, setAddress] = useState(user?.address || '')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [saveAddress, setSaveAddress] = useState(false)
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<string | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([])
  const [selectedZone, setSelectedZone] = useState('')
  const [apiShippingCost, setApiShippingCost] = useState<number | null>(null)
  const [apiFreeAbove, setApiFreeAbove] = useState<number | null>(null)
  const [apiEstimatedDays, setApiEstimatedDays] = useState<string>('3-5')
  const [expressDelivery, setExpressDelivery] = useState(false)

  // Site settings for tax & payment
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({})

  // Credit card fields
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [showCvv, setShowCvv] = useState(false)

  // ─── Helper functions for settings ────────────────────────────────────
  const getSetting = (key: string, defaultValue: string = ''): string => {
    return siteSettings[key] ?? defaultValue
  }
  const getBoolSetting = (key: string, defaultValue: boolean = true): boolean => {
    const val = siteSettings[key]
    if (val === undefined || val === '') return defaultValue
    return val === 'true'
  }
  const getNumSetting = (key: string, defaultValue: number = 0): number => {
    const val = siteSettings[key]
    if (val === undefined || val === '') return defaultValue
    return parseFloat(val) || defaultValue
  }

  // Tax settings from admin
  const taxEnabled = getBoolSetting('taxEnabled', true)
  const taxRate = getNumSetting('taxRate', DEFAULT_TAX_RATE) / 100
  const taxLabel = getSetting('taxLabel', 'ضريبة القيمة المضافة')
  const taxNumber = getSetting('taxNumber', '')

  // Payment method availability from admin
  const enableCOD = getBoolSetting('enableCOD', true)
  const enableCreditCard = getBoolSetting('enableCreditCard', false)
  const enableApplePay = getBoolSetting('enableApplePay', false)
  const enableVodafoneCash = getBoolSetting('enableVodafoneCash', true)
  const enableInstapay = getBoolSetting('enableInstapay', false)

  // Build available payment methods list
  const availablePaymentMethods: PaymentMethod[] = []
  if (enableCOD) availablePaymentMethods.push('cod')
  if (enableCreditCard) availablePaymentMethods.push('credit_card')
  if (enableApplePay) availablePaymentMethods.push('apple_pay')
  if (enableVodafoneCash) availablePaymentMethods.push('vodafone_cash')
  if (enableInstapay) availablePaymentMethods.push('instapay')
  // Fallback: always show COD if nothing is enabled
  if (availablePaymentMethods.length === 0) availablePaymentMethods.push('cod')

  // Fetch site settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        if (data.success) {
          setSiteSettings(data.data)
        }
      } catch {
        // Use defaults
      }
    }
    fetchSettings()
  }, [])

  // Load saved addresses from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('savedAddresses')
      if (stored) {
        try {
          setSavedAddresses(JSON.parse(stored))
        } catch {
          // ignore
        }
      }
    }
  }, [])

  // Fetch shipping zones from API
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch('/api/shipping/zones')
        const data = await res.json()
        if (data.success && data.data?.length > 0) {
          setShippingZones(data.data)
          if (!selectedZone && data.data.length > 0) {
            setSelectedZone(data.data[0].region)
          }
        }
      } catch {
        // Use defaults
      }
    }
    fetchZones()
  }, [selectedZone])

  const subtotal = getTotal()
  const discount = couponApplied ? discountAmount : 0

  // Calculate shipping via API when zone changes
  useEffect(() => {
    if (!selectedZone) return
    const calcShipping = async () => {
      try {
        const res = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region: selectedZone, cartTotal: subtotal }),
        })
        const data = await res.json()
        if (data.success) {
          setApiShippingCost(data.data.shippingCost)
          setApiFreeAbove(data.data.freeAbove)
          setApiEstimatedDays(data.data.estimatedDays)
        }
      } catch {
        setApiShippingCost(null)
      }
    }
    calcShipping()
  }, [selectedZone, subtotal])
  const shippingThreshold = apiFreeAbove || DEFAULT_SHIPPING_THRESHOLD
  const baseShipping = apiShippingCost !== null ? apiShippingCost : (subtotal >= DEFAULT_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE)
  const shipping = couponApplied && couponCode ? (discount > 0 ? baseShipping : baseShipping) : baseShipping
  const effectiveTaxRate = taxEnabled ? taxRate : 0
  const taxAmount = Math.max(subtotal - discount, 0) * effectiveTaxRate
  const grandTotal = subtotal - discount + shipping + taxAmount
  const savings = discount + (subtotal >= shippingThreshold ? (apiShippingCost || DEFAULT_SHIPPING_FEE) : 0)
  const deliveryDays = apiEstimatedDays || '3-5'
  const selectedZoneData = shippingZones.find((z) => z.region === selectedZone)

  // Auto-select first available payment method if current one is disabled
  useEffect(() => {
    if (availablePaymentMethods.length > 0 && !availablePaymentMethods.includes(paymentMethod)) {
      setPaymentMethod(availablePaymentMethods[0])
    }
  }, [siteSettings])

  // Handle coupon apply
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      toast.error('يرجى إدخال كود الخصم')
      return
    }
    setApplyingCoupon(true)
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal: subtotal, userId: user?.id }),
      })
      const data = await res.json()
      if (data.success && data.data.valid) {
        setCouponApplied(true)
        setDiscountAmount(data.data.discountAmount)
        toast.success('تم تطبيق كود الخصم بنجاح!')
      } else {
        setCouponApplied(false)
        setDiscountAmount(0)
        toast.error(data.data?.error || 'كود الخصم غير صالح')
      }
    } catch {
      toast.error('فشل التحقق من كود الخصم')
    } finally {
      setApplyingCoupon(false)
    }
  }, [couponCode, subtotal, user?.id])

  // Estimated delivery date based on shipping zone
  const getEstimatedDelivery = useCallback(() => {
    const days = apiEstimatedDays || '3-5'
    const parts = days.split('-')
    const minDays = parseInt(parts[0]) || 3
    const maxDays = parseInt(parts[1]) || 5
    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() + minDays)
    const end = new Date(now)
    end.setDate(end.getDate() + maxDays)
    const format = (d: Date) => d.toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' })
    return `${format(start)} - ${format(end)}`
  }, [apiEstimatedDays])

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '')
      setCustomerPhone(user.phone || '')
      setAddress(user.address || '')
    }
  }, [user])

  // Save address handler
  const handleSaveAddress = () => {
    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      toast.error('يرجى ملء جميع حقول العنوان أولاً')
      return
    }
    const newAddress: SavedAddress = {
      id: Date.now().toString(),
      name: customerName,
      phone: customerPhone,
      address,
      label: `عنوان ${savedAddresses.length + 1}`,
      isDefault: savedAddresses.length === 0,
    }
    const updated = [...savedAddresses, newAddress]
    setSavedAddresses(updated)
    localStorage.setItem('savedAddresses', JSON.stringify(updated))
    toast.success('تم حفظ العنوان بنجاح')
  }

  // Select saved address
  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedSavedAddress(addr.id)
    setCustomerName(addr.name)
    setCustomerPhone(addr.phone)
    setAddress(addr.address)
  }

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 16)
    return nums.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  // Format expiry
  const formatExpiry = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 4)
    if (nums.length > 2) return `${nums.slice(0, 2)}/${nums.slice(2)}`
    return nums
  }

  if (!user) {
    return (
      <div className="pt-6 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">يرجى تسجيل الدخول</h2>
          <p className="text-muted-foreground text-sm mb-6">
            يجب تسجيل الدخول لإتمام عملية الشراء
          </p>
          <Button onClick={() => setPage('auth')}>تسجيل الدخول</Button>
        </div>
      </div>
    )
  }

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="pt-6 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">السلة فارغة</h2>
          <p className="text-muted-foreground text-sm mb-6">
            أضيفي منتجات إلى السلة أولاً
          </p>
          <Button onClick={() => setPage('shop')}>تصفحي المتجر</Button>
        </div>
      </div>
    )
  }

  if (orderSuccess) {
    // Generate tracking number
    const trackingNumber = `DN-${orderNumber.slice(0, 8).toUpperCase()}`

    return (
      <div className="pt-6 pb-16 min-h-screen flex items-center justify-center relative">
        {showConfetti && <ConfettiAnimation />}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg mx-auto px-4"
        >
          {/* Celebration Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="relative inline-block mb-8"
          >
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-green-400 dark:from-green-500 to-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-2xl shadow-green-500/30 dark:shadow-green-600/20">
              <PartyPopper className="h-14 w-14 text-white" />
            </div>
            {/* Sparkle effects */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="h-6 w-6 text-yellow-400 dark:text-yellow-300" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-1 -left-3"
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-foreground mb-3"
          >
            تم تأكيد الطلب بنجاح! 🎉
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground mb-2 text-lg"
          >
            شكراً لكِ على طلبك من DONATELLA
          </motion.p>

          {/* Order Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-muted/50 rounded-xl p-4 mb-4 inline-block"
          >
            <p className="text-sm text-muted-foreground mb-1">رقم الطلب</p>
            <p className="font-bold text-xl text-primary">{orderNumber}</p>
          </motion.div>

          {/* Tracking Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="bg-[#D4A574]/10 dark:bg-[#D4A574]/15 border border-[#D4A574]/20 rounded-xl p-4 mb-4 inline-block"
          >
            <p className="text-sm text-muted-foreground mb-1">رقم التتبع</p>
            <p className="font-bold text-lg text-[#D4A574]" dir="ltr">{trackingNumber}</p>
          </motion.div>

          {/* Estimated Delivery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8"
          >
            <CalendarDays className="h-4 w-4" />
            <span>التوصيل المتوقع: {getEstimatedDelivery()}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button onClick={() => setPage('orders')} className="gap-2 rounded-xl h-11">
              <Navigation className="h-4 w-4" />
              تتبع طلبك
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage('shop')}
              className="gap-2 rounded-xl h-11"
            >
              متابعة التسوق
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  const validateStep1 = () => {
    if (!customerName.trim()) {
      toast.error('يرجى إدخال الاسم')
      return false
    }
    if (!customerPhone.trim()) {
      toast.error('يرجى إدخال رقم الهاتف')
      return false
    }
    if (!address.trim()) {
      toast.error('يرجى إدخال العنوان')
      return false
    }
    // Save address if checkbox is checked
    if (saveAddress) {
      handleSaveAddress()
    }
    return true
  }

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return
    setCurrentStep((prev) => Math.min(prev + 1, 3) as CheckoutStep)
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as CheckoutStep)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          address,
          notes: notes || undefined,
          paymentMethod,
          couponCode: couponApplied ? couponCode : undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setOrderNumber(data.data.id)
        setOrderSuccess(true)
        setShowConfetti(true)
        await fetchCart()
        toast.success('تم تأكيد الطلب بنجاح!')
        // Stop confetti after 5 seconds
        setTimeout(() => setShowConfetti(false), 5000)
      } else {
        toast.error(data.error || 'فشل إنشاء الطلب')
      }
    } catch {
      toast.error('حدث خطأ أثناء إنشاء الطلب')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pt-6 pb-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            إتمام الشراء
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            أكملي بياناتك لتأكيد الطلب
          </p>
        </motion.div>

        {/* Step Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StepIndicator currentStep={currentStep} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Shipping */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="rounded-2xl border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        بيانات الشحن
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Saved Addresses */}
                      {savedAddresses.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Bookmark className="h-4 w-4 text-[#D4A574]" />
                            عناوين محفوظة
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {savedAddresses.map((addr) => (
                              <motion.button
                                key={addr.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => handleSelectSavedAddress(addr)}
                                className={`text-right p-3 rounded-xl border-2 transition-all ${
                                  selectedSavedAddress === addr.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border/50 hover:border-primary/30'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {addr.isDefault ? (
                                    <Home className="h-3.5 w-3.5 text-primary" />
                                  ) : (
                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                  )}
                                  <span className="text-xs font-medium text-foreground">{addr.label}</span>
                                  {addr.isDefault && (
                                    <Badge className="text-[9px] h-4 px-1.5 bg-primary/10 text-primary border-0">
                                      الافتراضي
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{addr.address}</p>
                                <p className="text-[10px] text-muted-foreground mt-1" dir="ltr">{addr.phone}</p>
                              </motion.button>
                            ))}
                          </div>
                          <Separator className="bg-border/50" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input
                          id="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="أدخلي اسمك الكامل"
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">رقم الهاتف</Label>
                        <Input
                          id="phone"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="05xxxxxxxx"
                          className="rounded-xl h-11"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">العنوان</Label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="المدينة، الحي، الشارع، رقم المبنى"
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">ملاحظات التوصيل (اختياري)</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="مثال: رن الجرس مرتين، الشقة في الطابق الثاني..."
                          className="rounded-xl min-h-[80px] resize-none"
                        />
                      </div>

                      {/* Shipping Calculator */}
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="rounded-2xl border border-[#D4A574]/20 bg-gradient-to-bl from-[#D4A574]/5 via-transparent to-[#C4A4A4]/3 overflow-hidden"
                      >
                        <div className="p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm flex items-center gap-2">
                              <motion.div
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                              >
                                <Truck className="h-4 w-4 text-[#D4A574]" />
                              </motion.div>
                              حاسبة الشحن
                            </h4>
                            <Badge className="bg-[#D4A574]/10 text-[#D4A574] border-0 text-[10px]">
                              <MapPin className="h-3 w-3 ml-0.5" />
                              داخل مصر
                            </Badge>
                          </div>

                          {/* Zone Select */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">المنطقة</Label>
                            <Select value={selectedZone} onValueChange={(v) => { setSelectedZone(v); setExpressDelivery(false) }}>
                              <SelectTrigger className="rounded-xl h-10 border-[#D4A574]/20 focus:border-[#D4A574]">
                                <SelectValue placeholder="اختاري المنطقة" />
                              </SelectTrigger>
                              <SelectContent>
                                {shippingZones.map((zone) => (
                                  <SelectItem key={zone.id} value={zone.region}>
                                    {zone.nameAr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Shipping Options */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">طريقة الشحن</Label>

                            {/* Standard Shipping */}
                            <motion.div
                              layout
                              onClick={() => setExpressDelivery(false)}
                              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                !expressDelivery
                                  ? 'border-[#D4A574]/40 bg-[#D4A574]/5 shadow-sm shadow-[#D4A574]/10'
                                  : 'border-border/30 bg-secondary/20 hover:border-[#D4A574]/20'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-all ${
                                    !expressDelivery ? 'bg-[#D4A574]' : 'bg-muted border border-border'
                                  }`}>
                                    {!expressDelivery && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium">شحن عادي</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <CalendarDays className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">{deliveryDays} أيام عمل</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-left">
                                  {shipping === 0 ? (
                                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-0 text-xs gap-0.5">
                                      <CheckCircle2 className="h-3 w-3" />
                                      مجاني
                                    </Badge>
                                  ) : (
                                    <span className="text-sm font-bold">{baseShipping.toFixed(0)} ج.م</span>
                                  )}
                                </div>
                              </div>
                            </motion.div>

                            {/* Express Delivery */}
                            <motion.div
                              layout
                              onClick={() => setExpressDelivery(!expressDelivery)}
                              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                expressDelivery
                                  ? 'border-[#D4A574]/40 bg-[#D4A574]/5 shadow-sm shadow-[#D4A574]/10'
                                  : 'border-border/30 bg-secondary/20 hover:border-[#D4A574]/20'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-all ${
                                    expressDelivery ? 'bg-[#D4A574]' : 'bg-muted border border-border'
                                  }`}>
                                    {expressDelivery && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm font-medium">توصيل سريع</span>
                                      <Badge className="bg-[#D4A574]/10 text-[#D4A574] border-0 text-[10px] gap-0.5">
                                        <Zap className="h-2.5 w-2.5" />
                                        سريع
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <CalendarDays className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">1-2 يوم عمل</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-bold">
                                    +{baseShipping + 25} ج.م
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          </div>

                          {/* Free shipping threshold */}
                          <AnimatePresence mode="wait">
                            {subtotal < shippingThreshold ? (
                              <motion.div
                                key="threshold"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-2 p-3 rounded-xl bg-[#D4A574]/5 border border-[#D4A574]/10"
                              >
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>أضيفي {(shippingThreshold - subtotal).toFixed(0)} ج.م للشحن المجاني</span>
                                  <span>{subtotal.toFixed(0)}/{shippingThreshold.toFixed(0)} ج.م</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full bg-gradient-to-l from-[#D4A574] to-[#C4A4A4]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((subtotal / shippingThreshold) * 100, 100)}%` }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="free"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/10"
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">تهانينا! لديكِ شحن مجاني على هذا الطلب</span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Delivery Summary */}
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`${selectedZone}-${expressDelivery}`}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="p-3.5 rounded-xl bg-gradient-to-l from-muted/50 to-muted/30 border border-border/30"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-[#D4A574]" />
                                  <span className="text-xs font-medium">توصيل إلى {selectedZoneData?.nameAr || 'مصر'}</span>
                                </div>
                                <span className="text-xs font-bold text-[#D4A574]">{deliveryDays} أيام عمل</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">تكلفة الشحن</span>
                                <span className={`text-xs font-bold ${shipping === 0 ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                                  {shipping === 0 ? 'مجاني' : `${shipping} ج.م`}
                                </span>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </motion.div>

                      {/* Save Address Checkbox */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                        <Checkbox
                          id="save-address"
                          checked={saveAddress}
                          onCheckedChange={(checked) => setSaveAddress(checked === true)}
                          className="data-[state=checked]:bg-[#D4A574] data-[state=checked]:border-[#D4A574]"
                        />
                        <Label htmlFor="save-address" className="flex items-center gap-2 cursor-pointer text-sm">
                          <Bookmark className="h-4 w-4 text-[#D4A574]" />
                          حفظ هذا العنوان للمرة القادمة
                        </Label>
                      </div>

                      {/* Coupon Code */}
                      <div className="bg-gradient-to-l from-[#D4A574]/5 to-transparent rounded-xl p-4 border border-[#D4A574]/10 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <Tag className="h-4 w-4 text-[#D4A574]" />
                          كود الخصم
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="أدخلي كود الخصم"
                            className="h-9 text-sm rounded-lg border-[#D4A574]/20 focus:border-[#D4A574]"
                            dir="ltr"
                            disabled={couponApplied}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 rounded-lg shrink-0 border-[#D4A574]/30 text-[#D4A574] hover:bg-[#D4A574]/10"
                            onClick={handleApplyCoupon}
                            disabled={couponApplied || applyingCoupon}
                          >
                            {applyingCoupon ? '...' : couponApplied ? 'مُطبّق' : 'تطبيق'}
                          </Button>
                        </div>
                        {couponApplied && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">تم تطبيق الخصم بنجاح!</p>
                        )}
                      </div>

                      {/* Estimated Delivery */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-xl p-3">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        <span>التوصيل المتوقع: {getEstimatedDelivery()}</span>
                      </div>

                      <div className="pt-2">
                        <Button
                          className="w-full h-12 rounded-xl text-base font-semibold gap-2"
                          onClick={handleNextStep}
                        >
                          متابعة للدفع
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="rounded-2xl border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        طريقة الدفع
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availablePaymentMethods.map((method) => (
                          <PaymentMethodCard
                            key={method}
                            method={method}
                            selected={paymentMethod === method}
                            onSelect={() => setPaymentMethod(method)}
                            customLabel={getSetting(`${method === 'cod' ? 'cod' : method === 'credit_card' ? 'creditCard' : method === 'apple_pay' ? 'applePay' : method === 'vodafone_cash' ? 'vodafoneCash' : 'instapay'}Label`)}
                            customDesc={getSetting(`${method === 'cod' ? 'cod' : method === 'credit_card' ? 'creditCard' : method === 'apple_pay' ? 'applePay' : method === 'vodafone_cash' ? 'vodafoneCash' : 'instapay'}Description`)}
                            instructions={getSetting(`${method === 'cod' ? 'cod' : method === 'credit_card' ? 'creditCard' : method === 'apple_pay' ? 'applePay' : method === 'vodafone_cash' ? 'vodafoneCash' : 'instapay'}Instructions`)}
                          />
                        ))}
                      </div>

                      {/* Credit Card Form with Preview */}
                      {paymentMethod === 'credit_card' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          {/* Card Preview */}
                          <CreditCardPreview
                            cardNumber={cardNumber}
                            cardName={cardName}
                            expiry={cardExpiry}
                          />

                          {/* Card Fields */}
                          <div className="bg-muted/30 rounded-xl p-4 space-y-4">
                            <div className="space-y-2">
                              <Label>رقم البطاقة</Label>
                              <Input
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                className="rounded-xl h-11"
                                dir="ltr"
                                maxLength={19}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>اسم حامل البطاقة</Label>
                              <Input
                                placeholder="كما هو ظاهر على البطاقة"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                className="rounded-xl h-11"
                                dir="ltr"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>تاريخ الانتهاء</Label>
                                <Input
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                  className="rounded-xl h-11"
                                  dir="ltr"
                                  maxLength={5}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>CVV</Label>
                                <div className="relative">
                                  <Input
                                    placeholder="123"
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="rounded-xl h-11"
                                    dir="ltr"
                                    type={showCvv ? 'text' : 'password'}
                                    maxLength={4}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowCvv(!showCvv)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Security badge */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-green-50 dark:bg-green-950/20 p-3 rounded-xl border border-green-200 dark:border-green-900">
                            <Shield className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                            <span>جميع المعاملات مشفرة وآمنة بتقنية SSL 256-bit</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Vodafone Cash Payment */}
                      {paymentMethod === 'vodafone_cash' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          {/* Vodafone Cash Preview */}
                          <div className="max-w-xs mx-auto">
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-xl"
                              style={{
                                background: 'linear-gradient(135deg, #e60000 0%, #cc0000 40%, #990000 100%)',
                              }}
                            >
                              <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/4" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/4" />
                              </div>
                              <div className="relative z-10 h-full flex flex-col justify-between p-5 text-white">
                                <div className="flex justify-between items-start">
                                  <div className="text-lg font-bold tracking-wider">Vodafone Cash</div>
                                  <Smartphone className="h-6 w-6 text-white/60" />
                                </div>
                                <div>
                                  <p className="text-lg tracking-[0.2em] font-mono mb-4" dir="ltr">0100 XXX XXXX</p>
                                  <div className="flex justify-between items-end">
                                    <div>
                                      <p className="text-[10px] text-white/50 mb-0.5">رقم هاتف فودافون</p>
                                      <p className="text-xs tracking-wider" dir="ltr">01001234567</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-white/50 mb-0.5">الشبكة</p>
                                      <p className="text-xs tracking-wider">Vodafone EG</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>

                          {/* Vodafone Cash fields */}
                          <div className="bg-muted/30 rounded-xl p-4 space-y-4">
                            <div className="space-y-2">
                              <Label>رقم هاتف فودافون كاش</Label>
                              <Input
                                placeholder="01xxxxxxxxx"
                                className="rounded-xl h-11"
                                dir="ltr"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-green-50 dark:bg-green-950/20 p-3 rounded-xl border border-green-200 dark:border-green-900">
                            <Shield className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                            <span>{getSetting('vodafoneCashInstructions', 'معاملات فودافون كاش آمنة ومشفرة بالكامل')}</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Apple Pay */}
                      {paymentMethod === 'apple_pay' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-center bg-muted/30 rounded-xl p-6"
                        >
                          <div className="max-w-xs mx-auto mb-4">
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-xl"
                              style={{
                                background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 40%, #1a1a1a 100%)',
                              }}
                            >
                              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white gap-3">
                                <div className="text-2xl font-semibold">
                                  <span className="text-white/80">&#63743;</span> Pay
                                </div>
                                <div className="text-sm text-white/60">الدفع بنقرة واحدة</div>
                              </div>
                            </motion.div>
                          </div>
                          <Smartphone className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {getSetting('applePayInstructions', 'سيتم فتح Apple Pay عند تأكيد الطلب')}
                          </p>
                        </motion.div>
                      )}

                      {/* Instapay */}
                      {paymentMethod === 'instapay' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          {/* Instapay Preview */}
                          <div className="max-w-xs mx-auto">
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-xl"
                              style={{
                                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #4338ca 100%)',
                              }}
                            >
                              <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/4" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/4" />
                              </div>
                              <div className="relative z-10 h-full flex flex-col justify-between p-5 text-white">
                                <div className="flex justify-between items-start">
                                  <div className="text-lg font-bold tracking-wider">InstaPay</div>
                                  <Wifi className="h-6 w-6 text-white/60" />
                                </div>
                                <div>
                                  <p className="text-lg tracking-[0.2em] font-mono mb-4" dir="ltr">تحويل فوري</p>
                                  <div className="flex justify-between items-end">
                                    <div>
                                      <p className="text-[10px] text-white/50 mb-0.5">الشبكة الآمنة</p>
                                      <p className="text-xs tracking-wider">InstaPay EG</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-white/50 mb-0.5">نوع التحويل</p>
                                      <p className="text-xs tracking-wider">فوري</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>

                          {/* Instapay info */}
                          <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                            <p className="text-sm text-muted-foreground">
                              {getSetting('instapayInstructions', 'سيتم تحويلك لتطبيق انستاباي لإتمام التحويل.')}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-green-50 dark:bg-green-950/20 p-3 rounded-xl border border-green-200 dark:border-green-900">
                            <Shield className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                            <span>تحويل آمن ومعتمد من البنك المركزي المصري</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Order Summary for Step 2 */}
                      <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                        <h4 className="font-medium text-sm">ملخص الشحن</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Truck className="h-4 w-4 shrink-0" />
                          <span>{address}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-medium shrink-0">{customerName}</span>
                          <span>•</span>
                          <span dir="ltr">{customerPhone}</span>
                        </div>
                        {couponApplied && (
                          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                            <Tag className="h-4 w-4" />
                            <span>خصم {discount.toFixed(0)} ج.م</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1 h-12 rounded-xl font-semibold gap-2"
                          onClick={handlePrevStep}
                        >
                          <ArrowRight className="h-4 w-4" />
                          رجوع
                        </Button>
                        <Button
                          className="flex-1 h-12 rounded-xl text-base font-semibold gap-2"
                          onClick={handleNextStep}
                        >
                          مراجعة الطلب
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="rounded-2xl border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCheck className="h-5 w-5 text-primary" />
                        مراجعة وتأكيد الطلب
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* Shipping Info */}
                      <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Truck className="h-4 w-4 text-primary" />
                            بيانات الشحن
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 gap-1"
                            onClick={() => setCurrentStep(1)}
                          >
                            تعديل
                          </Button>
                        </div>
                        <p className="text-sm">{customerName}</p>
                        <p className="text-sm text-muted-foreground" dir="ltr">{customerPhone}</p>
                        <p className="text-sm text-muted-foreground">{address}</p>
                      </div>

                      {/* Payment Info */}
                      <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            طريقة الدفع
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 gap-1"
                            onClick={() => setCurrentStep(2)}
                          >
                            تعديل
                          </Button>
                        </div>
                        <p className="text-sm">
                          {paymentMethod === 'cod'
                            ? getSetting('codLabel', 'الدفع عند الاستلام')
                            : paymentMethod === 'credit_card'
                              ? `${getSetting('creditCardLabel', 'بطاقة ائتمانية')} •••• ${cardNumber.replace(/\s/g, '').slice(-4) || '••••'}`
                              : paymentMethod === 'apple_pay'
                                ? getSetting('applePayLabel', 'Apple Pay')
                                : paymentMethod === 'vodafone_cash'
                                  ? getSetting('vodafoneCashLabel', 'فودافون كاش')
                                  : getSetting('instapayLabel', 'انستاباي')}
                        </p>
                      </div>

                      {/* Discount */}
                      {couponApplied && (
                        <div className="flex items-center gap-2 text-sm bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-900">
                          <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>خصم {discount.toFixed(0)} ج.م</span>
                        </div>
                      )}

                      {/* Tax Info */}
                      {taxEnabled && taxAmount > 0 && (
                        <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <Shield className="h-3.5 w-3.5" />
                              {taxLabel} ({(taxRate * 100).toFixed(0)}%)
                            </span>
                            <span className="font-medium">{taxAmount.toFixed(2)} ج.م</span>
                          </div>
                          {taxNumber && (
                            <p className="text-[11px] text-muted-foreground" dir="ltr">الرقم الضريبي: {taxNumber}</p>
                          )}
                        </div>
                      )}

                      {/* Order Notes */}
                      {notes && (
                        <div className="bg-muted/30 rounded-xl p-4 space-y-1">
                          <h4 className="font-medium text-sm">ملاحظات التوصيل</h4>
                          <p className="text-sm text-muted-foreground">{notes}</p>
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">المنتجات ({items.length})</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {items.map((item) => {
                            const images: string[] = safeJsonParse<string[]>(item.product.images)
                            const mainImage = images[0] || '/products/dress-1.png'
                            const itemPrice =
                              item.product.discount > 0
                                ? item.product.price * (1 - item.product.discount / 100)
                                : item.product.price

                            return (
                              <div
                                key={item.id}
                                className="flex gap-3 bg-muted/30 rounded-xl p-3"
                              >
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                                  <Image
                                    src={mainImage}
                                    alt={item.product.nameAr}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium line-clamp-1">
                                    {item.product.nameAr}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    الكمية: {item.quantity}
                                    {item.size && ` • المقاس: ${item.size}`}
                                    {item.color && ` • اللون: ${item.color}`}
                                  </p>
                                </div>
                                <span className="text-sm font-bold shrink-0">
                                  {(itemPrice * item.quantity).toFixed(0)} ج.م
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Estimated Delivery */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 dark:bg-green-950/20 rounded-xl p-3 border border-green-200 dark:border-green-900">
                        <CalendarDays className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                        <span className="text-green-700 dark:text-green-400">
                          التوصيل المتوقع: {getEstimatedDelivery()}
                        </span>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1 h-12 rounded-xl font-semibold gap-2"
                          onClick={handlePrevStep}
                        >
                          <ArrowRight className="h-4 w-4" />
                          رجوع
                        </Button>
                        <Button
                          className="flex-1 h-12 rounded-xl text-base font-semibold gap-2"
                          onClick={handleSubmit}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              جاري التأكيد...
                            </>
                          ) : (
                            <>
                              <CheckCheck className="h-5 w-5" />
                              تأكيد الطلب
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-2xl border-border/50 sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items list */}
                <div className="space-y-3 max-h-52 overflow-y-auto">
                  {items.map((item) => {
                    const images: string[] = safeJsonParse<string[]>(item.product.images)
                    const mainImage = images[0] || '/products/dress-1.png'
                    const itemPrice =
                      item.product.discount > 0
                        ? item.product.price * (1 - item.product.discount / 100)
                        : item.product.price

                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                          <Image
                            src={mainImage}
                            alt={item.product.nameAr}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[9px] bg-primary text-primary-foreground rounded-full">
                            {item.quantity}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-1">
                            {item.product.nameAr}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {itemPrice.toFixed(0)} ج.م × {item.quantity}
                          </p>
                        </div>
                        <span className="text-xs font-bold shrink-0">
                          {(itemPrice * item.quantity).toFixed(0)} ج.م
                        </span>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                {/* Cost Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span>{subtotal.toFixed(0)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{expressDelivery ? 'الشحن (سريع)' : 'الشحن'}</span>
                    {shipping === 0 ? (
                      <span className="text-green-600 dark:text-green-400">مجاني</span>
                    ) : (
                      <span>{shipping.toFixed(0)} ج.م</span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الخصم</span>
                      <span className="text-destructive">-{discount.toFixed(0)} ج.م</span>
                    </div>
                  )}
                  {taxEnabled && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{taxLabel} ({(taxRate * 100).toFixed(0)}%)</span>
                      <span>{taxAmount.toFixed(2)} ج.م</span>
                    </div>
                  )}
                  {taxEnabled && taxNumber && (
                    <p className="text-[10px] text-muted-foreground" dir="ltr">الرقم الضريبي: {taxNumber}</p>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>الإجمالي</span>
                    <span className="text-primary text-lg">{grandTotal.toFixed(2)} ج.م</span>
                  </div>
                </div>

                {/* Savings */}
                {savings > 0 && (
                  <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-950/20 rounded-xl p-3 border border-green-200 dark:border-green-900">
                    <Star className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                    <span className="text-green-700 dark:text-green-400 font-medium">
                      وفّرتي {savings.toFixed(0)} ج.م
                    </span>
                  </div>
                )}

                {/* Delivery Estimate */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <span>توصيل: {getEstimatedDelivery()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

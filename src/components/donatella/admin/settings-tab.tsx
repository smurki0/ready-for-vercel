'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store,
  Phone,
  Globe,
  LayoutDashboard,
  ShoppingCart,
  Mail,
  MapPin,
  Instagram,
  Twitter,
  Save,
  RefreshCw,
  Image as ImageIcon,
  Facebook,
  Music2,
  CreditCard,
  Truck,
  Shield,
  UserPlus,
  UserX,
  ShoppingBag,
  Eye,
  EyeOff,
  AlertTriangle,
  DollarSign,
  ToggleLeft,
  ChevronLeft,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SiteSettings {
  [key: string]: string
}

// ─── Settings Sections Config ────────────────────────────────────────────────

interface SettingField {
  key: string
  label: string
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'switch'
  placeholder?: string
  dir?: string
  icon?: React.ReactNode
  options?: { value: string; label: string }[]
  defaultValue?: string
  description?: string
}

interface SettingsSection {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  darkColor: string
  bg: string
  darkBg: string
  fields: SettingField[]
}

const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    title: 'الإعدادات العامة',
    icon: <Store className="h-4 w-4" />,
    color: 'text-[#D4A574]',
    darkColor: 'dark:text-[#E8C9A0]',
    bg: 'bg-[#D4A574]/10',
    darkBg: 'dark:bg-[#D4A574]/15',
    fields: [
      { key: 'siteName', label: 'اسم الموقع', type: 'text', placeholder: 'DONATELLA' },
      { key: 'siteLogo', label: 'رابط شعار الموقع', type: 'text', placeholder: 'https://...', dir: 'ltr', icon: <ImageIcon className="h-3.5 w-3.5" /> },
      { key: 'currency', label: 'العملة', type: 'select', options: [
        { value: 'SAR', label: 'ريال سعودي (ر.س)' },
        { value: 'AED', label: 'درهم إماراتي (د.إ)' },
        { value: 'KWD', label: 'دينار كويتي (د.ك)' },
        { value: 'EGP', label: 'جنيه مصري (ج.م)' },
        { value: 'USD', label: 'دولار أمريكي ($)' },
      ]},
      { key: 'theme', label: 'المظهر', type: 'select', options: [
        { value: 'light', label: 'فاتح' },
        { value: 'dark', label: 'داكن' },
        { value: 'system', label: 'تلقائي' },
      ]},
    ],
  },
  {
    id: 'contact',
    title: 'معلومات التواصل',
    icon: <Phone className="h-4 w-4" />,
    color: 'text-green-600',
    darkColor: 'dark:text-green-400',
    bg: 'bg-green-50',
    darkBg: 'dark:bg-green-900/15',
    fields: [
      { key: 'contactEmail', label: 'البريد الإلكتروني', type: 'email', placeholder: 'info@donatella.com', dir: 'ltr', icon: <Mail className="h-3.5 w-3.5" /> },
      { key: 'contactPhone', label: 'رقم الهاتف', type: 'text', placeholder: '+966...', dir: 'ltr', icon: <Phone className="h-3.5 w-3.5" /> },
      { key: 'contactAddress', label: 'العنوان', type: 'textarea', placeholder: 'الرياض، المملكة العربية السعودية', icon: <MapPin className="h-3.5 w-3.5" /> },
      { key: 'whatsapp', label: 'واتساب', type: 'text', placeholder: '+966...', dir: 'ltr', icon: <Phone className="h-3.5 w-3.5" /> },
    ],
  },
  {
    id: 'social',
    title: 'وسائل التواصل الاجتماعي',
    icon: <Globe className="h-4 w-4" />,
    color: 'text-purple-600',
    darkColor: 'dark:text-purple-400',
    bg: 'bg-purple-50',
    darkBg: 'dark:bg-purple-900/15',
    fields: [
      { key: 'instagram', label: 'انستغرام', type: 'text', placeholder: 'https://instagram.com/...', dir: 'ltr', icon: <Instagram className="h-3.5 w-3.5" /> },
      { key: 'twitter', label: 'تويتر / إكس', type: 'text', placeholder: 'https://twitter.com/...', dir: 'ltr', icon: <Twitter className="h-3.5 w-3.5" /> },
      { key: 'facebook', label: 'فيسبوك', type: 'text', placeholder: 'https://facebook.com/...', dir: 'ltr', icon: <Facebook className="h-3.5 w-3.5" /> },
      { key: 'tiktok', label: 'تيك توك', type: 'text', placeholder: 'https://tiktok.com/...', dir: 'ltr', icon: <Music2 className="h-3.5 w-3.5" /> },
      { key: 'website', label: 'الموقع الإلكتروني', type: 'text', placeholder: 'https://...', dir: 'ltr', icon: <Globe className="h-3.5 w-3.5" /> },
    ],
  },
  {
    id: 'homepage',
    title: 'أقسام الصفحة الرئيسية',
    icon: <LayoutDashboard className="h-4 w-4" />,
    color: 'text-blue-600',
    darkColor: 'dark:text-blue-400',
    bg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/15',
    fields: [
      // Section visibility toggles
      { key: 'showHeroBanner', label: 'عرض البانر الرئيسي', type: 'switch', defaultValue: 'true', description: 'إظهار/إخفاء البانر الرئيسي في الصفحة الأولى' },
      { key: 'showTrustBadges', label: 'عرض شارات الثقة', type: 'switch', defaultValue: 'true', description: 'عرض شارات الثقة والأمان' },
      { key: 'showStyleRecommendations', label: 'عرض توصيات الأناقة', type: 'switch', defaultValue: 'true', description: 'عرض قسم توصيات الأناقة' },
      { key: 'showFeaturedProducts', label: 'عرض المنتجات المميزة', type: 'switch', defaultValue: 'true', description: 'عرض قسم المنتجات المميزة' },
      { key: 'showCategories', label: 'عرض الفئات', type: 'switch', defaultValue: 'true', description: 'عرض قسم الفئات' },
      { key: 'showFlashSale', label: 'عرض عروض الفلاش', type: 'switch', defaultValue: 'true', description: 'عرض قسم عروض الفلاش' },
      { key: 'showTrending', label: 'عرض المجموعة الرائجة', type: 'switch', defaultValue: 'true', description: 'عرض قسم المجموعة الرائجة' },
      { key: 'showPromoBanner', label: 'عرض البانر الترويجي', type: 'switch', defaultValue: 'true', description: 'عرض البانر الترويجي' },
      { key: 'showGiftCards', label: 'عرض بطاقات الهدايا', type: 'switch', defaultValue: 'true', description: 'عرض قسم بطاقات الهدايا' },
      { key: 'showTestimonials', label: 'عرض آراء العملاء', type: 'switch', defaultValue: 'true', description: 'عرض قسم آراء العملاء' },
      { key: 'showNewArrivals', label: 'عرض الوافدات الجديدة', type: 'switch', defaultValue: 'true', description: 'عرض قسم الوافدات الجديدة' },
      { key: 'showRecentlyAdded', label: 'عرض المضاف حديثاً', type: 'switch', defaultValue: 'true', description: 'عرض قسم المضاف حديثاً' },
      { key: 'showNewsletter', label: 'عرض النشرة البريدية', type: 'switch', defaultValue: 'true', description: 'عرض قسم الاشتراك في النشرة البريدية' },
      { key: 'showStoreLocator', label: 'عرض موقع المتجر', type: 'switch', defaultValue: 'true', description: 'عرض قسم موقع المتجر' },
      // Section order
      { key: 'heroOrder', label: 'ترتيب البانر الرئيسي', type: 'number', defaultValue: '1', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { key: 'trustBadgesOrder', label: 'ترتيب شارات الثقة', type: 'number', defaultValue: '2', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { key: 'styleRecommendationsOrder', label: 'ترتيب توصيات الأناقة', type: 'number', defaultValue: '3', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { key: 'featuredOrder', label: 'ترتيب المنتجات المميزة', type: 'number', defaultValue: '4', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { key: 'categoriesOrder', label: 'ترتيب الفئات', type: 'number', defaultValue: '5', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { key: 'flashSaleOrder', label: 'ترتيب عروض الفلاش', type: 'number', defaultValue: '6', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { key: 'trendingOrder', label: 'ترتيب المجموعة الرائجة', type: 'number', defaultValue: '7', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { key: 'promoOrder', label: 'ترتيب البانر الترويجي', type: 'number', defaultValue: '8', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { key: 'giftCardsOrder', label: 'ترتيب بطاقات الهدايا', type: 'number', defaultValue: '9', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { key: 'testimonialsOrder', label: 'ترتيب آراء العملاء', type: 'number', defaultValue: '10', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { key: 'newArrivalsOrder', label: 'ترتيب الوافدات الجديدة', type: 'number', defaultValue: '11', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { key: 'recentlyAddedOrder', label: 'ترتيب المضاف حديثاً', type: 'number', defaultValue: '12', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { key: 'newsletterOrder', label: 'ترتيب النشرة البريدية', type: 'number', defaultValue: '13', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      { key: 'storeLocatorOrder', label: 'ترتيب موقع المتجر', type: 'number', defaultValue: '14', dir: 'ltr', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
      // Section content
      { key: 'featuredTitle', label: 'عنوان المنتجات المميزة', type: 'text', defaultValue: 'المنتجات المميزة', placeholder: 'المنتجات المميزة' },
      { key: 'trendingBadge', label: 'شارة المجموعة الرائجة', type: 'text', defaultValue: 'موسم ربيع 2026', placeholder: 'موسم ربيع 2026' },
      { key: 'trendingTitle', label: 'عنوان المجموعة الرائجة', type: 'text', defaultValue: 'مجموعة ربيع 2026', placeholder: 'مجموعة ربيع 2026' },
      { key: 'trendingSubtitle', label: 'عنوان فرعي للمجموعة', type: 'text', defaultValue: 'تصاميم مستوحاة من أناقة الطبيعة', placeholder: 'تصاميم مستوحاة من أناقة الطبيعة' },
      { key: 'trendingDescription', label: 'وصف المجموعة', type: 'textarea', defaultValue: 'اكتشفي أحدث تشكيلاتنا المستوحاة من ألوان الربيع الدافئة وتفاصيل الطبيعة الساحرة.', placeholder: 'وصف المجموعة الرائجة' },
      { key: 'trendingCtaText', label: 'نص زر المجموعة', type: 'text', defaultValue: 'تسوقي المجموعة', placeholder: 'تسوقي المجموعة' },
      { key: 'promoBadge', label: 'شارة البانر الترويجي', type: 'text', defaultValue: 'عرض محدود', placeholder: 'عرض محدود' },
      { key: 'promoTitle', label: 'عنوان البانر الترويجي', type: 'text', defaultValue: 'خصم 20% على جميع الفساتين', placeholder: 'خصم 20% على جميع الفساتين' },
      { key: 'promoDescription', label: 'وصف البانر الترويجي', type: 'textarea', defaultValue: 'استمتعي بخصم حصري على مجموعة الفساتين المميزة. العرض ينتهي قريباً!', placeholder: 'وصف العرض الترويجي' },
      { key: 'promoCtaText', label: 'نص زر الترويج', type: 'text', defaultValue: 'تسوقي الآن', placeholder: 'تسوقي الآن' },
    ],
  },
  {
    id: 'order',
    title: 'إعدادات الطلب',
    icon: <ShoppingCart className="h-4 w-4" />,
    color: 'text-orange-600',
    darkColor: 'dark:text-orange-400',
    bg: 'bg-orange-50',
    darkBg: 'dark:bg-orange-900/15',
    fields: [
      { key: 'freeShippingThreshold', label: 'حد التوصيل المجاني', type: 'number', defaultValue: '500', placeholder: '500', dir: 'ltr', icon: <Truck className="h-3.5 w-3.5" />, description: 'الحد الأدنى للطلب للحصول على توصيل مجاني' },
      { key: 'defaultShippingCost', label: 'تكلفة التوصيل الافتراضية', type: 'number', defaultValue: '50', placeholder: '50', dir: 'ltr', icon: <DollarSign className="h-3.5 w-3.5" />, description: 'تكلفة التوصيل إذا لم يتجاوز الطلب الحد المجاني' },
      { key: 'orderPrefix', label: 'بادئة رقم الطلب', type: 'text', defaultValue: 'DON', placeholder: 'DON', dir: 'ltr', description: 'بادئة تظهر قبل رقم الطلب' },
    ],
  },
  {
    id: 'tax',
    title: 'إعدادات الضريبة',
    icon: <Shield className="h-4 w-4" />,
    color: 'text-amber-600',
    darkColor: 'dark:text-amber-400',
    bg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-900/15',
    fields: [
      { key: 'taxEnabled', label: 'تفعيل الضريبة', type: 'switch', defaultValue: 'true', description: 'إضافة ضريبة القيمة المضافة على الطلبات', icon: <Shield className="h-3.5 w-3.5" /> },
      { key: 'taxRate', label: 'نسبة الضريبة (%)', type: 'number', defaultValue: '14', placeholder: '14', dir: 'ltr', icon: <DollarSign className="h-3.5 w-3.5" />, description: 'نسبة ضريبة القيمة المضافة (مثلاً: 14 = 14%)' },
      { key: 'taxLabel', label: 'اسم الضريبة', type: 'text', defaultValue: 'ضريبة القيمة المضافة', placeholder: 'ضريبة القيمة المضافة', description: 'الاسم الظاهر في الفاتورة' },
      { key: 'taxNumber', label: 'الرقم الضريبي', type: 'text', defaultValue: '', placeholder: '300-XXX-XXXX', dir: 'ltr', description: 'الرقم الضريبي المسجل (يظهر في الفاتورة)' },
    ],
  },
  {
    id: 'payments',
    title: 'طرق الدفع',
    icon: <CreditCard className="h-4 w-4" />,
    color: 'text-emerald-600',
    darkColor: 'dark:text-emerald-400',
    bg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-900/15',
    fields: [
      // COD
      { key: 'enableCOD', label: 'الدفع عند الاستلام', type: 'switch', defaultValue: 'true', description: 'السماح بالدفع عند الاستلام', icon: <CreditCard className="h-3.5 w-3.5" /> },
      { key: 'codLabel', label: 'عنوان الدفع عند الاستلام', type: 'text', defaultValue: 'الدفع عند الاستلام', placeholder: 'الدفع عند الاستلام' },
      { key: 'codDescription', label: 'وصف الدفع عند الاستلام', type: 'text', defaultValue: 'ادفعي عند التوصيل', placeholder: 'ادفعي عند التوصيل' },
      { key: 'codInstructions', label: 'تعليمات الدفع عند الاستلام', type: 'textarea', defaultValue: 'سيتم الدفع عند استلام الطلب. يرجى تجهيز المبلغ المطلوب.', placeholder: 'تعليمات تظهر للعميل...' },
      // Credit Card
      { key: 'enableCreditCard', label: 'البطاقة الائتمانية', type: 'switch', defaultValue: 'false', description: 'تفعيل الدفع بالبطاقة الائتمانية (Visa / Mastercard)', icon: <CreditCard className="h-3.5 w-3.5" /> },
      { key: 'creditCardLabel', label: 'عنوان البطاقة الائتمانية', type: 'text', defaultValue: 'بطاقة ائتمانية', placeholder: 'بطاقة ائتمانية' },
      { key: 'creditCardDescription', label: 'وصف البطاقة الائتمانية', type: 'text', defaultValue: 'Visa / Mastercard', placeholder: 'Visa / Mastercard' },
      { key: 'creditCardInstructions', label: 'تعليمات البطاقة الائتمانية', type: 'textarea', defaultValue: 'سيتم تحويلك لبوابة الدفع الآمنة لإتمام العملية.', placeholder: 'تعليمات تظهر للعميل...' },
      // Apple Pay
      { key: 'enableApplePay', label: 'Apple Pay', type: 'switch', defaultValue: 'false', description: 'تفعيل الدفع عبر Apple Pay', icon: <CreditCard className="h-3.5 w-3.5" /> },
      { key: 'applePayLabel', label: 'عنوان Apple Pay', type: 'text', defaultValue: 'Apple Pay', placeholder: 'Apple Pay', dir: 'ltr' },
      { key: 'applePayDescription', label: 'وصف Apple Pay', type: 'text', defaultValue: 'دفع سريع وآمن', placeholder: 'دفع سريع وآمن' },
      { key: 'applePayInstructions', label: 'تعليمات Apple Pay', type: 'textarea', defaultValue: 'سيتم فتح واجهة Apple Pay لإتمام الدفع بشكل آمن.', placeholder: 'تعليمات تظهر للعميل...' },
      // Vodafone Cash
      { key: 'enableVodafoneCash', label: 'فودافون كاش', type: 'switch', defaultValue: 'true', description: 'تفعيل الدفع عبر فودافون كاش', icon: <CreditCard className="h-3.5 w-3.5" /> },
      { key: 'vodafoneCashLabel', label: 'عنوان فودافون كاش', type: 'text', defaultValue: 'فودافون كاش', placeholder: 'فودافون كاش' },
      { key: 'vodafoneCashDescription', label: 'وصف فودافون كاش', type: 'text', defaultValue: 'ادفعي عبر فودافون كاش', placeholder: 'ادفعي عبر فودافون كاش' },
      { key: 'vodafoneCashInstructions', label: 'تعليمات فودافون كاش', type: 'textarea', defaultValue: 'سيتم إرسال رقم المحفظة ورابط الدفع عبر رسالة.', placeholder: 'تعليمات تظهر للعميل...' },
      // Instapay
      { key: 'enableInstapay', label: 'انستاباي', type: 'switch', defaultValue: 'false', description: 'تفعيل الدفع عبر انستاباي', icon: <CreditCard className="h-3.5 w-3.5" /> },
      { key: 'instapayLabel', label: 'عنوان انستاباي', type: 'text', defaultValue: 'انستاباي', placeholder: 'انستاباي' },
      { key: 'instapayDescription', label: 'وصف انستاباي', type: 'text', defaultValue: 'تحويل فوري عبر انستاباي', placeholder: 'تحويل فوري عبر انستاباي' },
      { key: 'instapayInstructions', label: 'تعليمات انستاباي', type: 'textarea', defaultValue: 'سيتم تحويلك لتطبيق انستاباي لإتمام التحويل.', placeholder: 'تعليمات تظهر للعميل...' },
      // General payment
      { key: 'enableOnlinePayment', label: 'بوابة الدفع الإلكتروني', type: 'switch', defaultValue: 'false', description: 'تفعيل بوابة الدفع الإلكتروني بشكل عام', icon: <CreditCard className="h-3.5 w-3.5" /> },
    ],
  },
  {
    id: 'store',
    title: 'إعدادات المتجر',
    icon: <Store className="h-4 w-4" />,
    color: 'text-rose-600',
    darkColor: 'dark:text-rose-400',
    bg: 'bg-rose-50',
    darkBg: 'dark:bg-rose-900/15',
    fields: [
      { key: 'maintenanceMode', label: 'وضع الصيانة', type: 'switch', defaultValue: 'false', description: 'عند التفعيل، يظهر للمستخدمين صفحة صيانة', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
      { key: 'allowRegistration', label: 'السماح بالتسجيل', type: 'switch', defaultValue: 'true', description: 'السماح للمستخدمين الجدد بالتسجيل', icon: <UserPlus className="h-3.5 w-3.5" /> },
      { key: 'allowGuestCheckout', label: 'الشراء كضيف', type: 'switch', defaultValue: 'false', description: 'السماح بالشراء بدون تسجيل حساب', icon: <UserX className="h-3.5 w-3.5" /> },
      { key: 'minOrderAmount', label: 'الحد الأدنى للطلب', type: 'number', defaultValue: '0', placeholder: '0', dir: 'ltr', icon: <ShoppingBag className="h-3.5 w-3.5" />, description: 'الحد الأدنى لقيمة الطلب (0 = بدون حد)' },
    ],
  },
]

// ─── Helper ──────────────────────────────────────────────────────────────────

function getBoolValue(value: string | undefined, defaultValue: string): boolean {
  if (value === undefined || value === '') return defaultValue === 'true'
  return value === 'true'
}

// ─── Field Renderer ──────────────────────────────────────────────────────────

function SettingFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: SettingField
  value: string
  onChange: (key: string, value: string) => void
}) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
      return (
        <div className="space-y-2" key={field.key}>
          <Label htmlFor={field.key} className="text-sm flex items-center gap-1.5">
            {field.icon}
            {field.label}
          </Label>
          <Input
            id={field.key}
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="rounded-xl"
            dir={field.dir as 'ltr' | 'rtl' | undefined}
          />
          {field.description && (
            <p className="text-[11px] text-muted-foreground">{field.description}</p>
          )}
        </div>
      )

    case 'textarea':
      return (
        <div className="space-y-2" key={field.key}>
          <Label htmlFor={field.key} className="text-sm flex items-center gap-1.5">
            {field.icon}
            {field.label}
          </Label>
          <Textarea
            id={field.key}
            value={value || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="rounded-xl"
            rows={2}
          />
          {field.description && (
            <p className="text-[11px] text-muted-foreground">{field.description}</p>
          )}
        </div>
      )

    case 'select':
      return (
        <div className="space-y-2" key={field.key}>
          <Label htmlFor={field.key} className="text-sm">{field.label}</Label>
          <Select
            value={value || field.defaultValue || ''}
            onValueChange={(val) => onChange(field.key, val)}
          >
            <SelectTrigger className="rounded-xl w-full">
              <SelectValue placeholder={field.placeholder || 'اختر...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.description && (
            <p className="text-[11px] text-muted-foreground">{field.description}</p>
          )}
        </div>
      )

    case 'switch':
      return (
        <div className="flex items-center justify-between gap-3 py-2" key={field.key}>
          <div className="flex-1 min-w-0">
            <Label htmlFor={field.key} className="text-sm flex items-center gap-1.5">
              {field.icon}
              {field.label}
            </Label>
            {field.description && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{field.description}</p>
            )}
          </div>
          <Switch
            id={field.key}
            checked={getBoolValue(value, field.defaultValue || 'false')}
            onCheckedChange={(checked) => onChange(field.key, String(checked))}
          />
        </div>
      )

    default:
      return null
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SettingsTab({ isMobile }: { isMobile: boolean }) {
  const [settings, setSettings] = useState<SiteSettings>({})
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // ─── Fetch Settings ──────────────────────────────────────────────────

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
        setSettingsForm(data.data)
        setHasChanges(false)
      }
    } catch {
      toast.error('فشل تحميل الإعدادات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // ─── Handle Field Change ─────────────────────────────────────────────

  const handleFieldChange = (key: string, value: string) => {
    setSettingsForm((prev) => {
      const updated = { ...prev, [key]: value }
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(settings))
      return updated
    })
  }

  // ─── Save Settings ───────────────────────────────────────────────────

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      })
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
        setSettingsForm(data.data)
        setHasChanges(false)
        toast.success('تم حفظ الإعدادات بنجاح')
      } else {
        toast.error(data.error || 'فشل حفظ الإعدادات')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  // ─── Reset to Defaults ───────────────────────────────────────────────

  const resetForm = () => {
    setSettingsForm({ ...settings })
    setHasChanges(false)
    toast.info('تم إعادة الإعدادات إلى آخر نسخة محفوظة')
  }

  // ─── Compute Change Count ────────────────────────────────────────────

  const changedKeys = Object.keys(settingsForm).filter(
    (key) => settingsForm[key] !== settings[key]
  )

  // ─── Logo Preview ────────────────────────────────────────────────────

  const logoUrl = settingsForm.siteLogo || ''

  // ─── Loading Skeletons ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-40 rounded" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-10 rounded-xl" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // ─── Desktop: Cards Layout ───────────────────────────────────────────

  if (!isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-[#D4A574]/10 dark:bg-[#D4A574]/15 flex items-center justify-center">
                <Store className="h-4.5 w-4.5 text-[#D4A574] dark:text-[#E8C9A0]" />
              </div>
              إعدادات الموقع
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              إدارة الإعدادات العامة والتواصل والوسوم والمتجر
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
              disabled={!hasChanges || saving}
              className="gap-1.5 rounded-xl text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              إلغاء التعديلات
            </Button>
            {hasChanges && (
              <Badge className="bg-[#D4A574]/15 text-[#D4A574] dark:bg-[#D4A574]/20 dark:text-[#E8C9A0] text-[10px] px-2">
                {changedKeys.length} تعديل
              </Badge>
            )}
          </div>
        </div>

        {/* Settings Grid: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {settingsSections.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={section.id === 'homepage' || section.id === 'order' || section.id === 'tax' || section.id === 'payments' || section.id === 'store' ? 'lg:col-span-2' : ''}
            >
              <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg ${section.bg} ${section.darkBg} flex items-center justify-center ${section.color} ${section.darkColor}`}>
                      {section.icon}
                    </div>
                    {section.title}
                    {section.id === 'store' && settingsForm.maintenanceMode === 'true' && (
                      <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] mr-2">
                        صيانة
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Logo preview for general section */}
                  {section.id === 'general' && logoUrl && (
                    <div className="mb-4 p-3 rounded-xl bg-muted/30 dark:bg-[#2A2522]/50 border border-border/30 dark:border-[#3A3532]/40">
                      <p className="text-[11px] text-muted-foreground mb-2">معاينة الشعار</p>
                      <div className="h-16 w-32 flex items-center justify-center">
                        <img
                          src={logoUrl}
                          alt="شعار الموقع"
                          className="max-h-14 max-w-28 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Fields for non-switch-only sections */}
                  {section.id === 'general' || section.id === 'contact' || section.id === 'social' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {section.fields.map((field) => (
                        <SettingFieldRenderer
                          key={field.key}
                          field={field}
                          value={settingsForm[field.key] ?? field.defaultValue ?? ''}
                          onChange={handleFieldChange}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Switch-heavy sections: cleaner layout */
                    <div className="space-y-1">
                      {/* Non-switch fields first */}
                      {section.fields.filter((f) => f.type !== 'switch').map((field) => (
                        <SettingFieldRenderer
                          key={field.key}
                          field={field}
                          value={settingsForm[field.key] ?? field.defaultValue ?? ''}
                          onChange={handleFieldChange}
                        />
                      ))}
                      {/* Switch fields */}
                      {section.fields.some((f) => f.type === 'switch') && section.fields.some((f) => f.type !== 'switch') && (
                        <Separator className="my-3" />
                      )}
                      {section.fields.filter((f) => f.type === 'switch').map((field) => (
                        <SettingFieldRenderer
                          key={field.key}
                          field={field}
                          value={settingsForm[field.key] ?? field.defaultValue ?? ''}
                          onChange={handleFieldChange}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Save Button */}
        <div className="sticky bottom-4 z-10">
          <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card shadow-lg">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {hasChanges ? (
                  <span className="flex items-center gap-1.5 text-[#D4A574]">
                    <span className="w-2 h-2 rounded-full bg-[#D4A574] animate-pulse" />
                    لديك {changedKeys.length} تعديل غير محفوظ
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    جميع الإعدادات محفوظة
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={!hasChanges || saving}
                  className="rounded-xl text-sm"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={saveSettings}
                  disabled={saving || !hasChanges}
                  className="rounded-xl h-10 bg-gradient-to-l from-[#D4A574] to-[#b8885a] hover:from-[#b8885a] hover:to-[#9a7348] text-white border-0 shadow-md dark:shadow-[#D4A574]/15 text-sm font-medium gap-2 px-6"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      حفظ الإعدادات
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    )
  }

  // ─── Mobile: Accordion Layout ────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">إعدادات الموقع</h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            {hasChanges
              ? `${changedKeys.length} تعديل غير محفوظ`
              : 'جميع الإعدادات محفوظة'}
          </p>
        </div>
        {hasChanges && (
          <Badge className="bg-[#D4A574]/15 text-[#D4A574] dark:bg-[#D4A574]/20 dark:text-[#E8C9A0] text-[10px] px-2">
            {changedKeys.length} تعديل
          </Badge>
        )}
      </div>

      {/* Accordion Sections */}
      <Accordion type="multiple" defaultValue={['general', 'contact']} className="space-y-3">
        {settingsSections.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border-border/50 dark:border-[#3A3532]/60 rounded-2xl overflow-hidden bg-card dark:bg-[#231F1C] dark-glow-card px-4"
          >
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center gap-2.5 text-sm font-semibold">
                <div className={`h-8 w-8 rounded-lg ${section.bg} ${section.darkBg} flex items-center justify-center ${section.color} ${section.darkColor}`}>
                  {section.icon}
                </div>
                <span>{section.title}</span>
                {section.id === 'store' && settingsForm.maintenanceMode === 'true' && (
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[9px]">
                    صيانة
                  </Badge>
                )}
                {/* Show changed indicator */}
                {section.fields.some((f) => changedKeys.includes(f.key)) && (
                  <span className="w-2 h-2 rounded-full bg-[#D4A574] shrink-0" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              {/* Logo preview */}
              {section.id === 'general' && logoUrl && (
                <div className="p-3 rounded-xl bg-muted/30 dark:bg-[#2A2522]/50 border border-border/30 dark:border-[#3A3532]/40">
                  <p className="text-[11px] text-muted-foreground mb-2">معاينة الشعار</p>
                  <div className="h-14 w-28 flex items-center justify-center">
                    <img
                      src={logoUrl}
                      alt="شعار الموقع"
                      className="max-h-12 max-w-24 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* All fields */}
              {section.fields.map((field) => (
                <SettingFieldRenderer
                  key={field.key}
                  field={field}
                  value={settingsForm[field.key] ?? field.defaultValue ?? ''}
                  onChange={handleFieldChange}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Mobile Save Button - Fixed at bottom */}
      <div className="sticky bottom-4 z-10 pt-2">
        <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card shadow-lg">
          <CardContent className="p-3 flex gap-2">
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={!hasChanges || saving}
              className="rounded-xl flex-1 text-sm h-10"
            >
              إلغاء
            </Button>
            <Button
              onClick={saveSettings}
              disabled={saving || !hasChanges}
              className="rounded-xl flex-[2] h-10 bg-gradient-to-l from-[#D4A574] to-[#b8885a] hover:from-[#b8885a] hover:to-[#9a7348] text-white border-0 shadow-md dark:shadow-[#D4A574]/15 text-sm font-medium gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  حفظ الإعدادات
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

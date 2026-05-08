'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Save,
  RefreshCw,
  Check,
  LayoutDashboard,
  Shield,
  Sparkles,
  Star,
  Zap,
  TrendingUp,
  Tag,
  Gift,
  MessageSquare,
  PackagePlus,
  Clock,
  Mail,
  MapPin,
  GripVertical,
  ChevronLeft,
  Pencil,
  Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { invalidateSettingsCache } from '@/hooks/use-site-settings'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SiteSettings {
  [key: string]: string
}

interface SectionField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'datetime' | 'switch'
  placeholder?: string
  description?: string
}

interface SectionConfig {
  id: string
  name: string
  description: string
  visibilityKey: string
  orderKey: string
  icon: React.ReactNode
  color: string
  darkColor: string
  bg: string
  darkBg: string
  fields: SectionField[]
}

// ─── Section Definitions ────────────────────────────────────────────────────

const sectionDefinitions: SectionConfig[] = [
  {
    id: 'hero',
    name: 'البانر الرئيسي',
    description: 'القسم الرئيسي مع العد التنازلي',
    visibilityKey: 'showHeroBanner',
    orderKey: 'heroOrder',
    icon: <LayoutDashboard className="h-4 w-4" />,
    color: 'text-[#D4A574]',
    darkColor: 'dark:text-[#E8C9A0]',
    bg: 'bg-[#D4A574]/10',
    darkBg: 'dark:bg-[#D4A574]/15',
    fields: [
      { key: 'heroTitle', label: 'العنوان الرئيسي', type: 'text', placeholder: 'DONATELLA' },
      { key: 'heroSubtitle', label: 'العنوان الفرعي', type: 'text', placeholder: 'أناقة بلا حدود' },
      { key: 'heroCtaText', label: 'نص زر الإجراء', type: 'text', placeholder: 'تسوقي الآن' },
      { key: 'heroCtaLink', label: 'رابط الزر', type: 'text', placeholder: 'shop' },
      { key: 'showHeroCountdown', label: 'إظهار العداد التنازلي', type: 'switch', description: 'عرض العداد التنازلي في البانر الرئيسي' },
      { key: 'heroCountdownEndTime', label: 'وقت انتهاء العداد', type: 'datetime', placeholder: '', description: 'حدد التاريخ والوقت الذي ينتهي عنده العد التنازلي' },
    ],
  },
  {
    id: 'trustBadges',
    name: 'شارات الثقة',
    description: 'شارات الأمان والثقة',
    visibilityKey: 'showTrustBadges',
    orderKey: 'trustBadgesOrder',
    icon: <Shield className="h-4 w-4" />,
    color: 'text-green-600',
    darkColor: 'dark:text-green-400',
    bg: 'bg-green-50',
    darkBg: 'dark:bg-green-900/15',
    fields: [
      { key: 'trustBadgesTitle', label: 'عنوان القسم', type: 'text', placeholder: 'لماذا تختارين DONATELLA؟' },
    ],
  },
  {
    id: 'styleRecommendations',
    name: 'توصيات الأناقة',
    description: 'قسم توصيات الأسلوب',
    visibilityKey: 'showStyleRecommendations',
    orderKey: 'styleRecommendationsOrder',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'text-purple-600',
    darkColor: 'dark:text-purple-400',
    bg: 'bg-purple-50',
    darkBg: 'dark:bg-purple-900/15',
    fields: [
      { key: 'styleRecTitle', label: 'عنوان القسم', type: 'text', placeholder: 'توصيات الأناقة' },
      { key: 'styleRecSubtitle', label: 'العنوان الفرعي', type: 'text', placeholder: 'قطع مختارة بعناية لإطلالتك' },
    ],
  },
  {
    id: 'featured',
    name: 'المنتجات المميزة',
    description: 'قسم المنتجات المميزة',
    visibilityKey: 'showFeaturedProducts',
    orderKey: 'featuredOrder',
    icon: <Star className="h-4 w-4" />,
    color: 'text-amber-600',
    darkColor: 'dark:text-amber-400',
    bg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-900/15',
    fields: [
      { key: 'featuredTitle', label: 'عنوان القسم', type: 'text', placeholder: 'المنتجات المميزة' },
      { key: 'featuredSubtitle', label: 'العنوان الفرعي', type: 'text', placeholder: 'أفضل المنتجات المختارة لكِ' },
    ],
  },
  {
    id: 'categories',
    name: 'الفئات',
    description: 'شبكة فئات المنتجات',
    visibilityKey: 'showCategories',
    orderKey: 'categoriesOrder',
    icon: <LayoutDashboard className="h-4 w-4" />,
    color: 'text-blue-600',
    darkColor: 'dark:text-blue-400',
    bg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/15',
    fields: [
      { key: 'categoriesTitle', label: 'عنوان القسم', type: 'text', placeholder: 'تصفحي الفئات' },
      { key: 'categoriesSubtitle', label: 'العنوان الفرعي', type: 'text', placeholder: 'اختاري ما يناسب ذوقك' },
    ],
  },
  {
    id: 'flashSale',
    name: 'التخفيضات الخاطفة',
    description: 'بانر التخفيضات مع العد التنازلي',
    visibilityKey: 'showFlashSale',
    orderKey: 'flashSaleOrder',
    icon: <Zap className="h-4 w-4" />,
    color: 'text-red-600',
    darkColor: 'dark:text-red-400',
    bg: 'bg-red-50',
    darkBg: 'dark:bg-red-900/15',
    fields: [
      { key: 'flashSaleTitle', label: 'العنوان', type: 'text', placeholder: 'تخفيضات خاطفة' },
      { key: 'flashSaleSubtitle', label: 'العنوان الفرعي', type: 'text', placeholder: 'عروض لا تتكرر' },
      { key: 'flashSaleCtaText', label: 'نص الزر', type: 'text', placeholder: 'تسوقي الآن' },
      { key: 'showFlashSaleCountdown', label: 'إظهار العداد التنازلي', type: 'switch', description: 'عرض العداد التنازلي في قسم التخفيضات' },
      { key: 'flashSaleCountdownEndTime', label: 'وقت انتهاء العداد', type: 'datetime', placeholder: '', description: 'حدد التاريخ والوقت الذي ينتهي عنده العد التنازلي' },
    ],
  },
  {
    id: 'trending',
    name: 'مجموعة ربيع 2026',
    description: 'قسم المجموعة الموسمية',
    visibilityKey: 'showTrending',
    orderKey: 'trendingOrder',
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'text-emerald-600',
    darkColor: 'dark:text-emerald-400',
    bg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-900/15',
    fields: [
      { key: 'trendingBadge', label: 'نص الشارة', type: 'text', placeholder: 'موسم ربيع 2026' },
      { key: 'trendingTitle', label: 'العنوان الرئيسي', type: 'text', placeholder: 'مجموعة ربيع 2026' },
      { key: 'trendingSubtitle', label: 'العنوان الفرعي', type: 'text', placeholder: 'تصاميم مستوحاة من أناقة الطبيعة' },
      { key: 'trendingDescription', label: 'الوصف', type: 'textarea', placeholder: 'اكتشفي أحدث تشكيلاتنا...' },
      { key: 'trendingCtaText', label: 'نص الزر', type: 'text', placeholder: 'تسوقي المجموعة' },
    ],
  },
  {
    id: 'promoBanner',
    name: 'البانر الترويجي',
    description: 'بانر خصم 20% الترويجي',
    visibilityKey: 'showPromoBanner',
    orderKey: 'promoOrder',
    icon: <Tag className="h-4 w-4" />,
    color: 'text-rose-600',
    darkColor: 'dark:text-rose-400',
    bg: 'bg-rose-50',
    darkBg: 'dark:bg-rose-900/15',
    fields: [
      { key: 'promoBadge', label: 'نص الشارة', type: 'text', placeholder: 'عرض محدود' },
      { key: 'promoTitle', label: 'العنوان', type: 'text', placeholder: 'خصم 20% على جميع الفساتين' },
      { key: 'promoDescription', label: 'الوصف', type: 'textarea', placeholder: 'استمتعي بخصم حصري...' },
      { key: 'promoCtaText', label: 'نص الزر', type: 'text', placeholder: 'تسوقي الآن' },
    ],
  },
  {
    id: 'giftCards',
    name: 'بطاقات الهدايا',
    description: 'قسم بطاقات الهدايا',
    visibilityKey: 'showGiftCards',
    orderKey: 'giftCardsOrder',
    icon: <Gift className="h-4 w-4" />,
    color: 'text-pink-600',
    darkColor: 'dark:text-pink-400',
    bg: 'bg-pink-50',
    darkBg: 'dark:bg-pink-900/15',
    fields: [
      { key: 'giftCardsTitle', label: 'عنوان القسم', type: 'text', placeholder: 'بطاقات الهدايا' },
      { key: 'giftCardsSubtitle', label: 'العنوان الفرعي', type: 'text', placeholder: 'أهدي من تحب تجربة فريدة' },
      { key: 'giftCardsCtaText', label: 'نص الزر', type: 'text', placeholder: 'اشتري بطاقة هدية' },
    ],
  },
  {
    id: 'testimonials',
    name: 'آراء العملاء',
    description: 'قسم آراء العملاء',
    visibilityKey: 'showTestimonials',
    orderKey: 'testimonialsOrder',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'text-indigo-600',
    darkColor: 'dark:text-indigo-400',
    bg: 'bg-indigo-50',
    darkBg: 'dark:bg-indigo-900/15',
    fields: [
      { key: 'testimonialsTitle', label: 'عنوان القسم', type: 'text', placeholder: 'ماذا تقول عميلاتنا' },
      { key: 'testimonialsSubtitle', label: 'العنوان الفرعي', type: 'text', placeholder: 'آراء حقيقية من عميلات سعيدات' },
    ],
  },
  {
    id: 'newArrivals',
    name: 'الوافدات الجديدة',
    description: 'قسم الوافدات الجديدة',
    visibilityKey: 'showNewArrivals',
    orderKey: 'newArrivalsOrder',
    icon: <PackagePlus className="h-4 w-4" />,
    color: 'text-teal-600',
    darkColor: 'dark:text-teal-400',
    bg: 'bg-teal-50',
    darkBg: 'dark:bg-teal-900/15',
    fields: [
      { key: 'newArrivalsTitle', label: 'عنوان القسم', type: 'text', placeholder: 'الوافدات الجديدة' },
      { key: 'newArrivalsSubtitle', label: 'العنوان الفرعي', type: 'text', placeholder: 'أحدث القطع المضافة لمتجركِ' },
    ],
  },
  {
    id: 'recentlyAdded',
    name: 'المضافة حديثاً',
    description: 'قسم المنتجات المضافة حديثاً',
    visibilityKey: 'showRecentlyAdded',
    orderKey: 'recentlyAddedOrder',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-cyan-600',
    darkColor: 'dark:text-cyan-400',
    bg: 'bg-cyan-50',
    darkBg: 'dark:bg-cyan-900/15',
    fields: [
      { key: 'recentlyAddedTitle', label: 'عنوان القسم', type: 'text', placeholder: 'أضيفت مؤخراً' },
      { key: 'recentlyAddedSubtitle', label: 'العنوان الفرعي', type: 'text', placeholder: 'اكتشفي أحدث المنتجات' },
    ],
  },
  {
    id: 'newsletter',
    name: 'النشرة البريدية',
    description: 'قسم الاشتراك في النشرة البريدية',
    visibilityKey: 'showNewsletter',
    orderKey: 'newsletterOrder',
    icon: <Mail className="h-4 w-4" />,
    color: 'text-orange-600',
    darkColor: 'dark:text-orange-400',
    bg: 'bg-orange-50',
    darkBg: 'dark:bg-orange-900/15',
    fields: [
      { key: 'newsletterTitle', label: 'عنوان القسم', type: 'text', placeholder: 'اشتركي في نشرتنا البريدية' },
      { key: 'newsletterSubtitle', label: 'العنوان الفرعي', type: 'text', placeholder: 'احصلي على أحدث العروض والتصاميم' },
      { key: 'newsletterDescription', label: 'الوصف', type: 'textarea', placeholder: 'كوني أول من يعرف عن العروض الحصرية...' },
      { key: 'newsletterCtaText', label: 'نص الزر', type: 'text', placeholder: 'اشتركي الآن' },
    ],
  },
  {
    id: 'storeLocator',
    name: 'مواقع المتاجر',
    description: 'قسم مواقع المتاجر',
    visibilityKey: 'showStoreLocator',
    orderKey: 'storeLocatorOrder',
    icon: <MapPin className="h-4 w-4" />,
    color: 'text-sky-600',
    darkColor: 'dark:text-sky-400',
    bg: 'bg-sky-50',
    darkBg: 'dark:bg-sky-900/15',
    fields: [
      { key: 'storeLocatorTitle', label: 'عنوان القسم', type: 'text', placeholder: 'زورينا في متاجرنا' },
      { key: 'storeLocatorSubtitle', label: 'العنوان الفرعي', type: 'text', placeholder: 'اختاري أقرب فرع لكِ' },
    ],
  },
]

// ─── Helper ──────────────────────────────────────────────────────────────────

function getBoolValue(value: string | undefined, defaultValue: string): boolean {
  if (value === undefined || value === '') return defaultValue === 'true'
  return value === 'true'
}

function getOrderValue(value: string | undefined, defaultOrder: number): number {
  if (value === undefined || value === '') return defaultOrder
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultOrder : parsed
}

// ─── Section Card Component ──────────────────────────────────────────────────

function SectionCard({
  section,
  settings,
  formSettings,
  onChange,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isExpanded,
  onToggleExpand,
}: {
  section: SectionConfig
  settings: SiteSettings
  formSettings: SiteSettings
  onChange: (key: string, value: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const isVisible = getBoolValue(formSettings[section.visibilityKey], 'true')
  const currentOrder = getOrderValue(formSettings[section.orderKey], 0)
  const hasFields = section.fields.length > 0
  const hasFieldChanges = section.fields.some(
    (f) => formSettings[f.key] !== settings[f.key]
  )
  const hasVisibilityChange = formSettings[section.visibilityKey] !== settings[section.visibilityKey]
  const hasOrderChange = formSettings[section.orderKey] !== settings[section.orderKey]
  const hasChanges = hasFieldChanges || hasVisibilityChange || hasOrderChange

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card overflow-hidden transition-all duration-200 ${
        !isVisible ? 'opacity-60' : ''
      }`}>
        {/* Section Header */}
        <div
          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/30 transition-colors"
          onClick={onToggleExpand}
        >
          {/* Drag Handle */}
          <div className="text-muted-foreground/40 cursor-grab active:cursor-grabbing shrink-0">
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Icon */}
          <div className={`h-9 w-9 rounded-lg ${section.bg} ${section.darkBg} flex items-center justify-center ${section.color} ${section.darkColor} shrink-0`}>
            {section.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">{section.name}</h3>
              <Badge
                className={`text-[10px] px-2 py-0 shrink-0 ${
                  isVisible
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400'
                }`}
              >
                {isVisible ? 'ظاهر' : 'مخفي'}
              </Badge>
              {hasChanges && (
                <span className="w-2 h-2 rounded-full bg-[#D4A574] shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {section.description} · ترتيب: {currentOrder}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Visibility Toggle */}
            <button
              onClick={() => onChange(section.visibilityKey, String(!isVisible))}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isVisible
                  ? 'text-[#D4A574] dark:text-[#E8C9A0] hover:bg-[#D4A574]/10'
                  : 'text-muted-foreground hover:bg-accent/50'
              }`}
              title={isVisible ? 'إخفاء القسم' : 'إظهار القسم'}
            >
              {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>

            {/* Move Up */}
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className={`h-7 w-7 rounded-md flex items-center justify-center transition-all ${
                isFirst
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
              title="نقل لأعلى"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>

            {/* Move Down */}
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className={`h-7 w-7 rounded-md flex items-center justify-center transition-all ${
                isLast
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
              title="نقل لأسفل"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {/* Expand Arrow - Always visible */}
            <motion.div
              animate={{ rotate: isExpanded ? -90 : 90 }}
              transition={{ duration: 0.2 }}
              className="text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </div>
        </div>

        {/* Expandable Content - Always render when expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Separator className="bg-border/50 dark:bg-[#3A3532]/60" />
              <div className="p-4 space-y-4 bg-muted/20 dark:bg-[#1A1614]/50">
                {/* Visibility toggle inside expanded area */}
                <div className="flex items-center justify-between gap-3 py-1">
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Eye className="h-3 w-3" />
                      إظهار القسم على الصفحة الرئيسية
                    </Label>
                  </div>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={(checked) => onChange(section.visibilityKey, String(checked))}
                  />
                </div>

                {/* Order control */}
                <div className="flex items-center gap-3">
                  <Label className="text-xs font-medium min-w-[60px]">ترتيب العرض</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={currentOrder}
                    onChange={(e) => onChange(section.orderKey, e.target.value)}
                    className="rounded-xl text-sm w-20"
                    dir="ltr"
                  />
                </div>

                {/* Content fields */}
                {hasFields && (
                  <>
                    <Separator className="bg-border/30 dark:bg-[#3A3532]/40" />
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Pencil className="h-3 w-3" />
                      تعديل محتوى القسم
                    </div>
                    <div className="space-y-3">
                      {section.fields.map((field) => (
                        <div key={field.key} className="space-y-1.5">
                          {field.type === 'switch' ? (
                            <div className="flex items-center justify-between gap-3 py-1">
                              <div className="flex-1 min-w-0">
                                <Label htmlFor={field.key} className="text-xs font-medium flex items-center gap-1.5">
                                  <Timer className="h-3 w-3 text-[#D4A574]" />
                                  {field.label}
                                </Label>
                                {field.description && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{field.description}</p>
                                )}
                              </div>
                              <Switch
                                id={field.key}
                                checked={getBoolValue(formSettings[field.key], 'true')}
                                onCheckedChange={(checked) => onChange(field.key, String(checked))}
                              />
                            </div>
                          ) : (
                            <>
                              <Label htmlFor={field.key} className="text-xs font-medium flex items-center gap-1.5">
                                {field.type === 'datetime' && <Clock className="h-3 w-3 text-[#D4A574]" />}
                                {field.label}
                              </Label>
                              {field.description && (
                                <p className="text-[10px] text-muted-foreground">{field.description}</p>
                              )}
                              {field.type === 'textarea' ? (
                                <Textarea
                                  id={field.key}
                                  value={formSettings[field.key] ?? ''}
                                  onChange={(e) => onChange(field.key, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="rounded-xl text-sm"
                                  rows={2}
                                />
                              ) : field.type === 'datetime' ? (
                                <div className="space-y-2">
                                  <Input
                                    id={field.key}
                                    type="datetime-local"
                                    value={formSettings[field.key] ? new Date(formSettings[field.key]).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      if (val) {
                                        onChange(field.key, new Date(val).toISOString())
                                      } else {
                                        onChange(field.key, '')
                                      }
                                    }}
                                    className="rounded-xl text-sm"
                                    dir="ltr"
                                  />
                                  {/* Quick preset buttons */}
                                  <div className="flex flex-wrap gap-1.5">
                                    {[
                                      { label: 'بعد ساعة', offset: 60 * 60 * 1000 },
                                      { label: 'بعد 3 ساعات', offset: 3 * 60 * 60 * 1000 },
                                      { label: 'بعد 6 ساعات', offset: 6 * 60 * 60 * 1000 },
                                      { label: 'بعد يوم', offset: 24 * 60 * 60 * 1000 },
                                      { label: 'بعد 3 أيام', offset: 3 * 24 * 60 * 60 * 1000 },
                                      { label: 'بعد أسبوع', offset: 7 * 24 * 60 * 60 * 1000 },
                                      { label: 'بعد شهر', offset: 30 * 24 * 60 * 60 * 1000 },
                                    ].map((preset) => (
                                      <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => onChange(field.key, new Date(Date.now() + preset.offset).toISOString())}
                                        className="text-[10px] px-2 py-1 rounded-lg bg-[#D4A574]/10 dark:bg-[#D4A574]/15 text-[#D4A574] dark:text-[#E8C9A0] hover:bg-[#D4A574]/20 dark:hover:bg-[#D4A574]/25 transition-colors"
                                      >
                                        {preset.label}
                                      </button>
                                    ))}
                                  </div>
                                  {/* Show current value */}
                                  {formSettings[field.key] && (
                                    <p className="text-[10px] text-muted-foreground">
                                      الانتهاء: {new Date(formSettings[field.key]).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <Input
                                  id={field.key}
                                  type={field.type === 'number' ? 'number' : 'text'}
                                  value={formSettings[field.key] ?? ''}
                                  onChange={(e) => onChange(field.key, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="rounded-xl text-sm"
                                  dir={field.type === 'number' ? 'ltr' : undefined}
                                />
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Preview */}
                    <div className="p-3 rounded-xl bg-background dark:bg-[#231F1C] border border-border/30 dark:border-[#3A3532]/40">
                      <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        معاينة سريعة
                      </p>
                      <div className="space-y-1">
                        {section.fields.map((field) => {
                          if (field.type === 'switch') {
                            const isOn = getBoolValue(formSettings[field.key], 'true')
                            return (
                              <div key={field.key} className="flex items-start gap-2">
                                <span className="text-[10px] text-muted-foreground min-w-[60px] shrink-0">
                                  {field.label}:
                                </span>
                                <span className={`text-[11px] font-medium ${isOn ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                  {isOn ? 'مفعّل' : 'معطّل'}
                                </span>
                              </div>
                            )
                          }
                          if (field.type === 'datetime') {
                            const val = formSettings[field.key]
                            if (!val) return null
                            return (
                              <div key={field.key} className="flex items-start gap-2">
                                <span className="text-[10px] text-muted-foreground min-w-[60px] shrink-0">
                                  {field.label}:
                                </span>
                                <span className="text-[11px] text-foreground/80 line-clamp-2">
                                  {new Date(val).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            )
                          }
                          const val = formSettings[field.key] || field.placeholder || ''
                          if (!val) return null
                          return (
                            <div key={field.key} className="flex items-start gap-2">
                              <span className="text-[10px] text-muted-foreground min-w-[60px] shrink-0">
                                {field.label}:
                              </span>
                              <span className="text-[11px] text-foreground/80 line-clamp-2">
                                {val}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function HomepageTab({ isMobile }: { isMobile: boolean }) {
  const [settings, setSettings] = useState<SiteSettings>({})
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

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
    const updated = { ...settingsForm, [key]: value }
    setSettingsForm(updated)
    setHasChanges(JSON.stringify(updated) !== JSON.stringify(settings))
  }

  // ─── Get Sorted Sections ─────────────────────────────────────────────

  const getSortedSections = useCallback((): SectionConfig[] => {
    return [...sectionDefinitions].sort((a, b) => {
      const orderA = getOrderValue(settingsForm[a.orderKey], 99)
      const orderB = getOrderValue(settingsForm[b.orderKey], 99)
      return orderA - orderB
    })
  }, [settingsForm])

  // ─── Move Section ────────────────────────────────────────────────────

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sorted = getSortedSections()
    const idx = sorted.findIndex((s) => s.id === sectionId)
    if (idx === -1) return

    if (direction === 'up' && idx <= 0) return
    if (direction === 'down' && idx >= sorted.length - 1) return

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const currentSection = sorted[idx]
    const swapSection = sorted[swapIdx]

    const currentOrder = getOrderValue(settingsForm[currentSection.orderKey], idx + 1)
    const swapOrder = getOrderValue(settingsForm[swapSection.orderKey], swapIdx + 1)

    const updated = {
      ...settingsForm,
      [currentSection.orderKey]: String(swapOrder),
      [swapSection.orderKey]: String(currentOrder),
    }
    setSettingsForm(updated)
    setHasChanges(JSON.stringify(updated) !== JSON.stringify(settings))
  }

  // ─── Toggle Section Expand ───────────────────────────────────────────

  const toggleExpand = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
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
        invalidateSettingsCache()
        toast.success('تم حفظ إعدادات الصفحة الرئيسية بنجاح')
      } else {
        toast.error(data.error || 'فشل حفظ الإعدادات')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  // ─── Reset to Saved ─────────────────────────────────────────────────

  const resetForm = () => {
    setSettingsForm({ ...settings })
    setHasChanges(false)
    toast.info('تم إعادة الإعدادات إلى آخر نسخة محفوظة')
  }

  // ─── Toggle All ──────────────────────────────────────────────────────

  const toggleAllVisibility = (visible: boolean) => {
    const updated = { ...settingsForm }
    sectionDefinitions.forEach((section) => {
      updated[section.visibilityKey] = String(visible)
    })
    setSettingsForm(updated)
    setHasChanges(JSON.stringify(updated) !== JSON.stringify(settings))
  }

  // ─── Expand All / Collapse All ───────────────────────────────────────

  const expandAll = () => {
    setExpandedSections(new Set(sectionDefinitions.map((s) => s.id)))
  }

  const collapseAll = () => {
    setExpandedSections(new Set())
  }

  // ─── Compute Change Count ────────────────────────────────────────────

  const changedKeys = Object.keys(settingsForm).filter(
    (key) => settingsForm[key] !== settings[key]
  )

  // ─── Stats ───────────────────────────────────────────────────────────

  const visibleCount = sectionDefinitions.filter((s) =>
    getBoolValue(settingsForm[s.visibilityKey], 'true')
  ).length
  const hiddenCount = sectionDefinitions.length - visibleCount

  // ─── Loading Skeletons ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const sortedSections = getSortedSections()

  // ─── Desktop Layout ──────────────────────────────────────────────────

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
                <LayoutDashboard className="h-4.5 w-4.5 text-[#D4A574] dark:text-[#E8C9A0]" />
              </div>
              أقسام الصفحة الرئيسية
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              تحكمي في ظهور وترتيب ومحتوى أقسام الصفحة الرئيسية
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Quick Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-green-500" />
                {visibleCount} ظاهر
              </span>
              <span className="flex items-center gap-1">
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                {hiddenCount} مخفي
              </span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="gap-1.5 rounded-xl text-xs h-8"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              توسيع الكل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="gap-1.5 rounded-xl text-xs h-8"
            >
              <ChevronUp className="h-3.5 w-3.5" />
              طي الكل
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllVisibility(true)}
              className="gap-1.5 rounded-xl text-xs h-8"
            >
              <Eye className="h-3.5 w-3.5" />
              إظهار الكل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllVisibility(false)}
              className="gap-1.5 rounded-xl text-xs h-8"
            >
              <EyeOff className="h-3.5 w-3.5" />
              إخفاء الكل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
              disabled={!hasChanges || saving}
              className="gap-1.5 rounded-xl text-xs h-8"
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

        {/* Sections List */}
        <div className="space-y-2">
          {sortedSections.map((section, idx) => (
            <SectionCard
              key={section.id}
              section={section}
              settings={settings}
              formSettings={settingsForm}
              onChange={handleFieldChange}
              onMoveUp={() => moveSection(section.id, 'up')}
              onMoveDown={() => moveSection(section.id, 'down')}
              isFirst={idx === 0}
              isLast={idx === sortedSections.length - 1}
              isExpanded={expandedSections.has(section.id)}
              onToggleExpand={() => toggleExpand(section.id)}
            />
          ))}
        </div>

        {/* Save Button - Sticky */}
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
                      حفظ التغييرات
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

  // ─── Mobile Layout ───────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">أقسام الرئيسية</h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            {hasChanges
              ? `${changedKeys.length} تعديل غير محفوظ`
              : `${visibleCount} ظاهر · ${hiddenCount} مخفي`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge className="bg-[#D4A574]/15 text-[#D4A574] dark:bg-[#D4A574]/20 dark:text-[#E8C9A0] text-[10px] px-2">
              {changedKeys.length}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="gap-1 rounded-xl text-[10px] h-7 px-2"
          >
            <ChevronDown className="h-3 w-3" />
            توسيع
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="gap-1 rounded-xl text-[10px] h-7 px-2"
          >
            <ChevronUp className="h-3 w-3" />
            طي
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleAllVisibility(true)}
            className="gap-1 rounded-xl text-[10px] h-7 px-2"
          >
            <Eye className="h-3 w-3" />
            إظهار
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleAllVisibility(false)}
            className="gap-1 rounded-xl text-[10px] h-7 px-2"
          >
            <EyeOff className="h-3 w-3" />
            إخفاء
          </Button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-2">
        {sortedSections.map((section, idx) => (
          <SectionCard
            key={section.id}
            section={section}
            settings={settings}
            formSettings={settingsForm}
            onChange={handleFieldChange}
            onMoveUp={() => moveSection(section.id, 'up')}
            onMoveDown={() => moveSection(section.id, 'down')}
            isFirst={idx === 0}
            isLast={idx === sortedSections.length - 1}
            isExpanded={expandedSections.has(section.id)}
            onToggleExpand={() => toggleExpand(section.id)}
          />
        ))}
      </div>

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
                  حفظ التغييرات
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

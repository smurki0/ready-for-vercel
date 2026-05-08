'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Clock,
  ExternalLink,
  Filter,
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

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
  order: number
  startDate?: string
  endDate?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

type PositionFilter = 'all' | 'hero' | 'middle' | 'sidebar' | 'footer'

// ─── Constants ───────────────────────────────────────────────────────────────

const positionConfig: Record<string, { label: string; color: string; darkColor: string }> = {
  hero: { label: 'رئيسي', color: 'bg-pink-100 text-pink-800', darkColor: 'dark:bg-pink-900/30 dark:text-pink-400' },
  middle: { label: 'وسط الصفحة', color: 'bg-blue-100 text-blue-800', darkColor: 'dark:bg-blue-900/30 dark:text-blue-400' },
  sidebar: { label: 'الشريط الجانبي', color: 'bg-green-100 text-green-800', darkColor: 'dark:bg-green-900/30 dark:text-green-400' },
  footer: { label: 'التذييل', color: 'bg-orange-100 text-orange-800', darkColor: 'dark:bg-orange-900/30 dark:text-orange-400' },
}

const defaultBannerForm = {
  titleAr: '',
  titleEn: '',
  subtitleAr: '',
  subtitleEn: '',
  image: '',
  linkType: 'none' as 'product' | 'category' | 'url' | 'none',
  linkId: '',
  position: 'hero' as 'hero' | 'middle' | 'sidebar' | 'footer',
  order: 0,
  startDate: '',
  endDate: '',
  active: true,
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays < 30) return `منذ ${diffDays} يوم`
  return date.toLocaleDateString('ar-SA')
}

function isScheduled(banner: Banner): boolean {
  const now = new Date()
  if (banner.startDate && new Date(banner.startDate) > now) return true
  if (banner.endDate && new Date(banner.endDate) < now) return true
  return false
}

function isCurrentlyActive(banner: Banner): boolean {
  if (!banner.active) return false
  const now = new Date()
  if (banner.startDate && new Date(banner.startDate) > now) return false
  if (banner.endDate && new Date(banner.endDate) < now) return false
  return true
}

// ─── Banner Form Component ───────────────────────────────────────────────────

function BannerForm({
  form,
  setForm,
  isSheet = false,
}: {
  form: typeof defaultBannerForm
  setForm: React.Dispatch<React.SetStateAction<typeof defaultBannerForm>>
  isSheet?: boolean
}) {
  const cn = isSheet ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4 py-4'

  const getLinkIdLabel = () => {
    switch (form.linkType) {
      case 'product': return 'معرّف المنتج'
      case 'category': return 'معرّف الفئة'
      case 'url': return 'رابط URL'
      default: return 'المعرّف'
    }
  }

  const getLinkIdPlaceholder = () => {
    switch (form.linkType) {
      case 'product': return 'أدخل معرّف المنتج'
      case 'category': return 'أدخل معرّف الفئة'
      case 'url': return 'https://example.com/page'
      default: return 'أدخل المعرّف'
    }
  }

  return (
    <div className={cn}>
      <div className="space-y-2">
        <Label htmlFor="bannerTitleAr">العنوان بالعربية</Label>
        <Input
          id="bannerTitleAr"
          value={form.titleAr}
          onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
          placeholder="عنوان البانر بالعربية"
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bannerTitleEn">العنوان بالإنجليزية</Label>
        <Input
          id="bannerTitleEn"
          value={form.titleEn}
          onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
          placeholder="Banner title in English"
          className="rounded-xl"
          dir="ltr"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bannerSubtitleAr">العنوان الفرعي بالعربية</Label>
        <Input
          id="bannerSubtitleAr"
          value={form.subtitleAr}
          onChange={(e) => setForm({ ...form, subtitleAr: e.target.value })}
          placeholder="عنوان فرعي بالعربية"
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bannerSubtitleEn">العنوان الفرعي بالإنجليزية</Label>
        <Input
          id="bannerSubtitleEn"
          value={form.subtitleEn}
          onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })}
          placeholder="Subtitle in English"
          className="rounded-xl"
          dir="ltr"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="bannerImage">رابط الصورة *</Label>
        <Input
          id="bannerImage"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          placeholder="/products/banner.jpg أو https://example.com/image.jpg"
          className="rounded-xl"
          dir="ltr"
        />
        {form.image && (
          <div className="mt-2 rounded-xl overflow-hidden border border-border/50 dark:border-[#3A3532]/60 max-h-48">
            <img
              src={form.image}
              alt="معاينة البانر"
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="bannerLinkType">نوع الرابط</Label>
        <Select
          value={form.linkType}
          onValueChange={(value: 'product' | 'category' | 'url' | 'none') =>
            setForm({ ...form, linkType: value, linkId: '' })
          }
        >
          <SelectTrigger className="rounded-xl w-full">
            <SelectValue placeholder="اختر نوع الرابط" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون رابط</SelectItem>
            <SelectItem value="product">منتج</SelectItem>
            <SelectItem value="category">فئة</SelectItem>
            <SelectItem value="url">رابط خارجي</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {form.linkType !== 'none' && (
        <div className="space-y-2">
          <Label htmlFor="bannerLinkId">{getLinkIdLabel()}</Label>
          <Input
            id="bannerLinkId"
            value={form.linkId}
            onChange={(e) => setForm({ ...form, linkId: e.target.value })}
            placeholder={getLinkIdPlaceholder()}
            className="rounded-xl"
            dir={form.linkType === 'url' ? 'ltr' : 'rtl'}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="bannerPosition">الموضع *</Label>
        <Select
          value={form.position}
          onValueChange={(value: 'hero' | 'middle' | 'sidebar' | 'footer') =>
            setForm({ ...form, position: value })
          }
        >
          <SelectTrigger className="rounded-xl w-full">
            <SelectValue placeholder="اختر الموضع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hero">رئيسي (Hero)</SelectItem>
            <SelectItem value="middle">وسط الصفحة</SelectItem>
            <SelectItem value="sidebar">الشريط الجانبي</SelectItem>
            <SelectItem value="footer">التذييل</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bannerOrder">الترتيب</Label>
        <Input
          id="bannerOrder"
          type="number"
          min={0}
          value={form.order}
          onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
          className="rounded-xl"
          dir="ltr"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bannerStartDate">تاريخ البداية</Label>
        <Input
          id="bannerStartDate"
          type="datetime-local"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          className="rounded-xl"
          dir="ltr"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bannerEndDate">تاريخ النهاية</Label>
        <Input
          id="bannerEndDate"
          type="datetime-local"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          className="rounded-xl"
          dir="ltr"
        />
      </div>
      <div className="flex items-center gap-2 pt-2 sm:col-span-2">
        <Switch
          id="bannerActive"
          checked={form.active}
          onCheckedChange={(checked) => setForm({ ...form, active: checked })}
        />
        <Label htmlFor="bannerActive">نشط</Label>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BannersTab({ isMobile }: { isMobile: boolean }) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('all')

  // Dialog/Sheet state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [form, setForm] = useState(defaultBannerForm)
  const [saving, setSaving] = useState(false)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const fetchBanners = useCallback(async () => {
    setLoading(true)
    try {
      const url = positionFilter !== 'all'
        ? `/api/admin/banners?position=${positionFilter}`
        : '/api/admin/banners'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) setBanners(data.data)
    } catch {
      toast.error('فشل تحميل البانرات')
    } finally {
      setLoading(false)
    }
  }, [positionFilter])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  // ─── CRUD ─────────────────────────────────────────────────────────────

  const openBannerDialog = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner)
      setForm({
        titleAr: banner.titleAr || '',
        titleEn: banner.titleEn || '',
        subtitleAr: banner.subtitleAr || '',
        subtitleEn: banner.subtitleEn || '',
        image: banner.image,
        linkType: banner.linkType || 'none',
        linkId: banner.linkId || '',
        position: banner.position,
        order: banner.order,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '',
        active: banner.active,
      })
    } else {
      setEditingBanner(null)
      setForm(defaultBannerForm)
    }
    if (window.innerWidth < 768) {
      setSheetOpen(true)
    } else {
      setDialogOpen(true)
    }
  }

  const saveBanner = async () => {
    setSaving(true)
    try {
      const payload = {
        titleAr: form.titleAr || undefined,
        titleEn: form.titleEn || undefined,
        subtitleAr: form.subtitleAr || undefined,
        subtitleEn: form.subtitleEn || undefined,
        image: form.image,
        linkType: form.linkType === 'none' ? undefined : form.linkType,
        linkId: form.linkType !== 'none' && form.linkId ? form.linkId : undefined,
        position: form.position,
        order: form.order,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        active: form.active,
      }

      let res: Response
      if (editingBanner) {
        res = await fetch(`/api/admin/banners/${editingBanner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (data.success) {
        toast.success(editingBanner ? 'تم تحديث البانر بنجاح' : 'تم إضافة البانر بنجاح')
        setDialogOpen(false)
        setSheetOpen(false)
        fetchBanners()
      } else {
        toast.error(data.error || 'فشل حفظ البانر')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const deleteBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('تم حذف البانر بنجاح')
        fetchBanners()
      } else {
        toast.error(data.error || 'فشل حذف البانر')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحذف')
    }
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  const toggleBannerActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !banner.active }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(banner.active ? 'تم إلغاء تفعيل البانر' : 'تم تفعيل البانر')
        fetchBanners()
      }
    } catch {
      toast.error('فشل تحديث الحالة')
    }
  }

  const confirmDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name })
    setDeleteDialogOpen(true)
  }

  // ─── Loading Skeletons ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="rounded-2xl overflow-hidden dark-glow-card">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────

  const positionFilters: { key: PositionFilter; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'hero', label: 'رئيسي' },
    { key: 'middle', label: 'وسط' },
    { key: 'sidebar', label: 'جانبي' },
    { key: 'footer', label: 'تذييل' },
  ]

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">إدارة البانرات</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {banners.length} بانر{banners.length !== 1 ? 'ات' : ''}
          </p>
        </div>
        <Button
          onClick={() => openBannerDialog()}
          className="gap-2 rounded-xl bg-gradient-to-r from-[#D4A574] to-[#b8885a] hover:from-[#b8885a] hover:to-[#9a7450] text-white shadow-md shadow-[#D4A574]/20"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">إضافة بانر</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </motion.div>

      {/* ─── Position Filter Tabs ─── */}
      <div className="flex gap-2 flex-wrap">
        {positionFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setPositionFilter(filter.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              positionFilter === filter.key
                ? 'bg-primary/10 text-primary shadow-sm dark:bg-[#D4A574]/10 dark:text-[#E8C9A0]'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`}
          >
            {filter.label}
            {filter.key !== 'all' && (
              <span className="mr-1.5 text-xs opacity-60">
                ({banners.filter((b) => b.position === filter.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Banner Grid ─── */}
      {banners.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 dark:bg-[#2A2522] mb-4">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد بانرات</h3>
          <p className="text-muted-foreground text-sm mb-6">
            {positionFilter !== 'all'
              ? 'لا توجد بانرات في هذا الموضع'
              : 'ابدأ بإضافة بانر جديد للمتجر'}
          </p>
          <Button
            onClick={() => openBannerDialog()}
            className="gap-2 rounded-xl bg-gradient-to-r from-[#D4A574] to-[#b8885a] text-white"
          >
            <Plus className="h-4 w-4" />
            إضافة بانر جديد
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {banners.map((banner, idx) => {
              const posConfig = positionConfig[banner.position] || positionConfig.hero
              const scheduled = isScheduled(banner)
              const currentlyActive = isCurrentlyActive(banner)

              return (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                >
                  <Card
                    className={`rounded-2xl overflow-hidden dark-glow-card transition-all duration-300 hover:shadow-lg hover:shadow-[#D4A574]/5 ${
                      !banner.active ? 'opacity-60' : ''
                    } ${scheduled ? 'ring-2 ring-yellow-400/40 dark:ring-yellow-500/30' : ''}`}
                  >
                    {/* Image Preview */}
                    <div className="relative h-44 bg-muted/30 dark:bg-[#2A2522] overflow-hidden">
                      <img
                        src={banner.image}
                        alt={banner.titleAr || 'بانر'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement
                          el.style.display = 'none'
                          if (el.parentElement) {
                            el.parentElement.innerHTML = `
                              <div class="flex items-center justify-center h-full text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                              </div>
                            `
                          }
                        }}
                      />
                      {/* Overlay Badges */}
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <Badge
                          className={`${posConfig.color} ${posConfig.darkColor} text-xs font-medium backdrop-blur-sm`}
                        >
                          {posConfig.label}
                        </Badge>
                        {scheduled && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium backdrop-blur-sm gap-1">
                            <Clock className="h-3 w-3" />
                            مجدول
                          </Badge>
                        )}
                      </div>
                      {/* Active indicator */}
                      <div className="absolute top-2 left-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            currentlyActive
                              ? 'bg-green-500 shadow-lg shadow-green-500/50'
                              : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      {/* Order Badge */}
                      <div className="absolute bottom-2 left-2">
                        <Badge
                          variant="secondary"
                          className="text-xs backdrop-blur-sm bg-background/80 dark:bg-[#1A1614]/80"
                        >
                          <GripVertical className="h-3 w-3 ml-1" />
                          #{banner.order}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-3">
                      {/* Title & Subtitle */}
                      <div>
                        <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                          {banner.titleAr || banner.titleEn || 'بانر بدون عنوان'}
                        </h3>
                        {banner.subtitleAr && (
                          <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                            {banner.subtitleAr}
                          </p>
                        )}
                      </div>

                      {/* Link Info */}
                      {banner.linkType && banner.linkType !== 'none' && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ExternalLink className="h-3 w-3" />
                          <span>
                            {banner.linkType === 'product' && 'منتج'}
                            {banner.linkType === 'category' && 'فئة'}
                            {banner.linkType === 'url' && 'رابط خارجي'}
                          </span>
                        </div>
                      )}

                      {/* Schedule Info */}
                      {(banner.startDate || banner.endDate) && (
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {banner.startDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>من: {new Date(banner.startDate).toLocaleDateString('ar-SA')}</span>
                            </div>
                          )}
                          {banner.endDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>إلى: {new Date(banner.endDate).toLocaleDateString('ar-SA')}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Updated time */}
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(banner.updatedAt)}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50 dark:border-[#3A3532]/60">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBannerActive(banner)}
                            className="h-8 px-2 rounded-lg gap-1 text-xs"
                          >
                            {banner.active ? (
                              <>
                                <EyeOff className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">إلغاء التفعيل</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">تفعيل</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openBannerDialog(banner)}
                            className="h-8 w-8 p-0 rounded-lg text-[#D4A574] hover:text-[#b8885a] hover:bg-[#D4A574]/10"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              confirmDelete(
                                banner.id,
                                banner.titleAr || banner.titleEn || 'بانر'
                              )
                            }
                            className="h-8 w-8 p-0 rounded-lg text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ═══ Banner Sheet (Mobile) ═══ */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) setDialogOpen(false) }}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-3xl" dir="rtl">
          <SheetHeader>
            <SheetTitle>{editingBanner ? 'تعديل البانر' : 'إضافة بانر جديد'}</SheetTitle>
            <SheetDescription>
              {editingBanner ? 'قم بتعديل بيانات البانر' : 'أدخل بيانات البانر الجديد'}
            </SheetDescription>
          </SheetHeader>
          <BannerForm form={form} setForm={setForm} isSheet />
          <SheetFooter className="flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setSheetOpen(false)}
              className="rounded-xl flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={saveBanner}
              className="rounded-xl bg-gradient-to-r from-[#D4A574] to-[#b8885a] text-white flex-1"
              disabled={saving || !form.image}
            >
              {saving ? 'جاري الحفظ...' : editingBanner ? 'حفظ التعديلات' : 'إضافة البانر'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ═══ Banner Dialog (Desktop) ═══ */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSheetOpen(false) }}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto hidden md:block"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'تعديل البانر' : 'إضافة بانر جديد'}</DialogTitle>
            <DialogDescription>
              {editingBanner ? 'قم بتعديل بيانات البانر' : 'أدخل بيانات البانر الجديد'}
            </DialogDescription>
          </DialogHeader>
          <BannerForm form={form} setForm={setForm} />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              onClick={saveBanner}
              className="rounded-xl bg-gradient-to-r from-[#D4A574] to-[#b8885a] text-white"
              disabled={saving || !form.image}
            >
              {saving ? 'جاري الحفظ...' : editingBanner ? 'حفظ التعديلات' : 'إضافة البانر'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Delete Confirmation ═══ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف البانر &quot;{deleteTarget?.name}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteBanner(deleteTarget.id)}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

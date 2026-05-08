'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
  Gift,
  MapPin,
  Clock,
  DollarSign,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  X,
  Globe,
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

interface ShippingZone {
  id: string
  nameAr: string
  nameEn: string
  region: string
  price: number
  freeAbove?: number
  estimatedDays: string
  active: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface ShippingFormState {
  nameAr: string
  nameEn: string
  region: string
  price: number
  freeAbove: number
  estimatedDays: string
  active: boolean
  order: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const EGYPT_GOVERNORATES = [
  { nameAr: 'القاهرة', nameEn: 'Cairo', region: 'cairo' },
  { nameAr: 'الجيزة', nameEn: 'Giza', region: 'giza' },
  { nameAr: 'الإسكندرية', nameEn: 'Alexandria', region: 'alexandria' },
  { nameAr: 'الشرقية', nameEn: 'Sharqia', region: 'sharqia' },
  { nameAr: 'الدقهلية', nameEn: 'Dakahlia', region: 'dakahlia' },
  { nameAr: 'البحيرة', nameEn: 'Beheira', region: 'beheira' },
  { nameAr: 'المنيا', nameEn: 'Minya', region: 'minya' },
  { nameAr: 'الغربية', nameEn: 'Gharbia', region: 'gharbia' },
  { nameAr: 'المنوفية', nameEn: 'Monufia', region: 'monufia' },
  { nameAr: 'القليوبية', nameEn: 'Qalyubia', region: 'qalyubia' },
  { nameAr: 'سوهاج', nameEn: 'Sohag', region: 'sohag' },
  { nameAr: 'أسيوط', nameEn: 'Asyut', region: 'asyut' },
  { nameAr: 'الفيوم', nameEn: 'Fayoum', region: 'fayoum' },
  { nameAr: 'بني سويف', nameEn: 'Beni Suef', region: 'beni-suef' },
  { nameAr: 'قنا', nameEn: 'Qena', region: 'qena' },
  { nameAr: 'الأقصر', nameEn: 'Luxor', region: 'luxor' },
  { nameAr: 'أسوان', nameEn: 'Aswan', region: 'aswan' },
  { nameAr: 'دمياط', nameEn: 'Damietta', region: 'damietta' },
  { nameAr: 'بورسعيد', nameEn: 'Port Said', region: 'port-said' },
  { nameAr: 'الإسماعيلية', nameEn: 'Ismailia', region: 'ismailia' },
  { nameAr: 'السويس', nameEn: 'Suez', region: 'suez' },
  { nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', region: 'kafr-el-sheikh' },
  { nameAr: 'مطروح', nameEn: 'Matrouh', region: 'matrouh' },
  { nameAr: 'البحر الأحمر', nameEn: 'Red Sea', region: 'red-sea' },
  { nameAr: 'الوادي الجديد', nameEn: 'New Valley', region: 'new-valley' },
  { nameAr: 'شمال سيناء', nameEn: 'North Sinai', region: 'north-sinai' },
  { nameAr: 'جنوب سيناء', nameEn: 'South Sinai', region: 'south-sinai' },
]

const defaultShippingForm: ShippingFormState = {
  nameAr: '',
  nameEn: '',
  region: '',
  price: 0,
  freeAbove: 0,
  estimatedDays: '3-5',
  active: true,
  order: 0,
}

function formatCurrency(amount: number): string {
  return `${amount.toFixed(0)} ج.م`
}

// ─── Shipping Form Component ─────────────────────────────────────────────────

function ShippingForm({ form, setForm, customRegion, setCustomRegion, isSheet = false }: {
  form: ShippingFormState
  setForm: React.Dispatch<React.SetStateAction<ShippingFormState>>
  customRegion: string
  setCustomRegion: React.Dispatch<React.SetStateAction<string>>
  isSheet?: boolean
}) {
  const cn = isSheet ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4 py-4'

  return (
    <div className={cn}>
      {/* Name AR */}
      <div className="space-y-2">
        <Label htmlFor="ship-name-ar">الاسم بالعربية *</Label>
        <Input
          id="ship-name-ar"
          value={form.nameAr}
          onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
          placeholder="مثال: شحن القاهرة والجيزة"
          className="rounded-xl"
        />
      </div>

      {/* Name EN */}
      <div className="space-y-2">
        <Label htmlFor="ship-name-en">الاسم بالإنجليزية *</Label>
        <Input
          id="ship-name-en"
          value={form.nameEn}
          onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          placeholder="e.g. Cairo & Giza Shipping"
          className="rounded-xl"
          dir="ltr"
        />
      </div>

      {/* Region */}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="ship-region">المنطقة / المحافظة *</Label>
        <Select
          value={form.region}
          onValueChange={(value) => {
            const gov = EGYPT_GOVERNORATES.find((g) => g.region === value)
            setForm({
              ...form,
              region: value,
              // Auto-fill names if empty
              nameAr: form.nameAr || gov?.nameAr || '',
              nameEn: form.nameEn || gov?.nameEn || '',
            })
          }}
        >
          <SelectTrigger className="rounded-xl w-full">
            <SelectValue placeholder="اختر المحافظة أو أدخل منطقة مخصصة" />
          </SelectTrigger>
          <SelectContent>
            {EGYPT_GOVERNORATES.map((gov) => (
              <SelectItem key={gov.region} value={gov.region}>
                <span className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {gov.nameAr} ({gov.nameEn})
                </span>
              </SelectItem>
            ))}
            <SelectItem value="custom">
              <span className="flex items-center gap-2">
                <Globe className="h-3 w-3 text-muted-foreground" />
                منطقة مخصصة
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        {form.region === 'custom' && (
          <Input
            value={customRegion}
            onChange={(e) => setCustomRegion(e.target.value)}
            placeholder="أدخل اسم المنطقة المخصصة"
            className="rounded-xl mt-2"
          />
        )}
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="ship-price">تكلفة الشحن (ج.م) *</Label>
        <div className="relative">
          <Input
            id="ship-price"
            type="number"
            min={0}
            value={form.price || ''}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
            className="rounded-xl pr-10"
            dir="ltr"
          />
          <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Free Above */}
      <div className="space-y-2">
        <Label htmlFor="ship-free-above">شحن مجاني فوق (ج.م)</Label>
        <div className="relative">
          <Input
            id="ship-free-above"
            type="number"
            min={0}
            value={form.freeAbove || ''}
            onChange={(e) => setForm({ ...form, freeAbove: parseFloat(e.target.value) || 0 })}
            placeholder="0 = لا يوجد حد"
            className="rounded-xl pr-10"
            dir="ltr"
          />
          <Gift className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D4A574]" />
        </div>
        {form.freeAbove > 0 && (
          <p className="text-[10px] text-[#D4A574] flex items-center gap-1">
            <Truck className="h-3 w-3" />
            <Gift className="h-3 w-3" />
            شحن مجاني للطلبات فوق {formatCurrency(form.freeAbove)}
          </p>
        )}
      </div>

      {/* Estimated Days */}
      <div className="space-y-2">
        <Label htmlFor="ship-days">مدة التوصيل المتوقعة</Label>
        <div className="relative">
          <Input
            id="ship-days"
            value={form.estimatedDays}
            onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
            placeholder="3-5"
            className="rounded-xl pr-10"
            dir="ltr"
          />
          <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-[10px] text-muted-foreground">أيام عمل</p>
      </div>

      {/* Order */}
      <div className="space-y-2">
        <Label htmlFor="ship-order">الترتيب</Label>
        <Input
          id="ship-order"
          type="number"
          min={0}
          value={form.order}
          onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
          className="rounded-xl"
          dir="ltr"
        />
      </div>

      {/* Active Switch */}
      <div className="flex items-center gap-2 pt-2 sm:col-span-2">
        <Switch
          id="ship-active"
          checked={form.active}
          onCheckedChange={(checked) => setForm({ ...form, active: checked })}
        />
        <Label htmlFor="ship-active" className="flex items-center gap-1.5">
          {form.active ? (
            <ToggleRight className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          نشط
        </Label>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ShippingTab({ isMobile }: { isMobile: boolean }) {
  const [zones, setZones] = useState<ShippingZone[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog/Sheet state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
  const [form, setForm] = useState<ShippingFormState>(defaultShippingForm)
  const [customRegion, setCustomRegion] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchZones = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/shipping')
      const data = await res.json()
      if (data.success) {
        setZones(data.data || [])
      } else {
        toast.error('فشل تحميل مناطق الشحن')
      }
    } catch {
      toast.error('فشل تحميل مناطق الشحن')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchZones()
  }, [fetchZones])

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const openForm = (zone?: ShippingZone) => {
    if (zone) {
      setEditingZone(zone)
      setForm({
        nameAr: zone.nameAr,
        nameEn: zone.nameEn,
        region: zone.region,
        price: zone.price,
        freeAbove: zone.freeAbove || 0,
        estimatedDays: zone.estimatedDays,
        active: zone.active,
        order: zone.order,
      })
      setCustomRegion('')
    } else {
      setEditingZone(null)
      setForm({
        ...defaultShippingForm,
        order: zones.length,
      })
      setCustomRegion('')
    }
    if (window.innerWidth < 768) {
      setSheetOpen(true)
    } else {
      setDialogOpen(true)
    }
  }

  const saveZone = async () => {
    const actualRegion = form.region === 'custom' ? customRegion : form.region
    if (!form.nameAr || !form.nameEn || !actualRegion) {
      toast.error(form.region === 'custom' && !customRegion ? 'يرجى إدخال اسم المنطقة المخصصة' : 'يرجى ملء جميع الحقول المطلوبة')
      return
    }

    setSaving(true)
    try {
      const payload = {
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        region: actualRegion,
        price: form.price,
        freeAbove: form.freeAbove > 0 ? form.freeAbove : undefined,
        estimatedDays: form.estimatedDays || '3-5',
        active: form.active,
        order: form.order,
      }

      let res: Response
      if (editingZone) {
        res = await fetch(`/api/admin/shipping/${editingZone.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (data.success) {
        toast.success(editingZone ? 'تم تحديث منطقة الشحن بنجاح' : 'تم إضافة منطقة الشحن بنجاح')
        setDialogOpen(false)
        setSheetOpen(false)
        fetchZones()
      } else {
        toast.error(data.error || 'فشل حفظ منطقة الشحن')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const deleteZone = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/shipping/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('تم حذف منطقة الشحن بنجاح')
        fetchZones()
      } else {
        toast.error(data.error || 'فشل حذف منطقة الشحن')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحذف')
    }
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  const toggleActive = async (zone: ShippingZone) => {
    try {
      const res = await fetch(`/api/admin/shipping/${zone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !zone.active }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(zone.active ? 'تم إلغاء تفعيل المنطقة' : 'تم تفعيل المنطقة')
        fetchZones()
      }
    } catch {
      toast.error('فشل تحديث الحالة')
    }
  }

  const moveZoneOrder = async (zone: ShippingZone, direction: 'up' | 'down') => {
    const sorted = [...zones].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((z) => z.id === zone.id)
    if (direction === 'up' && idx <= 0) return
    if (direction === 'down' && idx >= sorted.length - 1) return

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const swapZone = sorted[swapIdx]

    try {
      await Promise.all([
        fetch(`/api/admin/shipping/${zone.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: swapZone.order }),
        }),
        fetch(`/api/admin/shipping/${swapZone.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: zone.order }),
        }),
      ])
      toast.success('تم إعادة ترتيب المناطق')
      fetchZones()
    } catch {
      toast.error('فشل إعادة الترتيب')
    }
  }

  // ─── Filter ───────────────────────────────────────────────────────────────

  const filteredZones = zones
    .filter((z) => {
      const q = searchQuery.toLowerCase()
      return (
        z.nameAr.toLowerCase().includes(q) ||
        z.nameEn.toLowerCase().includes(q) ||
        z.region.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => a.order - b.order)

  // ─── Get region label ─────────────────────────────────────────────────────

  const getRegionLabel = (region: string) => {
    const gov = EGYPT_GOVERNORATES.find((g) => g.region === region)
    return gov ? gov.nameAr : region
  }

  // ─── Loading Skeletons ────────────────────────────────────────────────────

  const renderLoading = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-4`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    </div>
  )

  // ─── Zone Card (shared for mobile and desktop) ────────────────────────────

  const renderZoneCard = (zone: ShippingZone, index: number) => {
    const gov = EGYPT_GOVERNORATES.find((g) => g.region === zone.region)
    const isFreeShipping = zone.freeAbove && zone.freeAbove > 0

    return (
      <motion.div
        key={zone.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
      >
        <Card className={`rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card overflow-hidden transition-all duration-200 hover:shadow-md ${
          !zone.active ? 'opacity-60' : ''
        }`}>
          <CardContent className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  zone.active
                    ? 'bg-primary/10 dark:bg-[#D4A574]/10'
                    : 'bg-muted/50 dark:bg-[#2A2522]/50'
                }`}>
                  <Truck className={`h-5 w-5 ${
                    zone.active
                      ? 'text-primary dark:text-[#E8C9A0]'
                      : 'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{zone.nameAr}</h3>
                  <p className="text-[10px] text-muted-foreground" dir="ltr">{zone.nameEn}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Reorder arrows */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveZoneOrder(zone, 'up')}
                    className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    title="نقل لأعلى"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => moveZoneOrder(zone, 'down')}
                    className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    title="نقل لأسفل"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Region Badge */}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline" className="text-[10px] gap-1 rounded-lg">
                {getRegionLabel(zone.region)}
              </Badge>
              {gov && (
                <Badge variant="outline" className="text-[10px] rounded-lg" dir="ltr">
                  {gov.nameEn}
                </Badge>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 dark:bg-[#2A2522]/50 rounded-lg p-2.5">
                <p className="text-muted-foreground text-[10px] mb-0.5 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  تكلفة الشحن
                </p>
                <p className="font-bold text-primary dark:text-[#E8C9A0] text-sm">
                  {zone.price === 0 ? 'مجاني' : formatCurrency(zone.price)}
                </p>
              </div>
              <div className="bg-muted/50 dark:bg-[#2A2522]/50 rounded-lg p-2.5">
                <p className="text-muted-foreground text-[10px] mb-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  مدة التوصيل
                </p>
                <p className="font-medium text-sm">{zone.estimatedDays} يوم</p>
              </div>
            </div>

            {/* Free Shipping Indicator */}
            {isFreeShipping && (
              <div className="flex items-center gap-2 bg-[#D4A574]/10 dark:bg-[#D4A574]/15 rounded-xl p-2.5">
                <div className="flex items-center -space-x-1">
                  <Truck className="h-4 w-4 text-[#D4A574]" />
                  <Gift className="h-4 w-4 text-[#D4A574]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#D4A574] font-medium">شحن مجاني فوق {formatCurrency(zone.freeAbove!)}</p>
                  <p className="text-[9px] text-muted-foreground">للطلبات التي تتجاوز هذا المبلغ</p>
                </div>
              </div>
            )}

            {/* Status & Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50 dark:border-[#3A3532]/40">
              {/* Quick Active Toggle */}
              <button
                onClick={() => toggleActive(zone)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  zone.active
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                {zone.active ? (
                  <>
                    <ToggleRight className="h-3.5 w-3.5" />
                    نشط
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-3.5 w-3.5" />
                    معطل
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openForm(zone)}
                  className="h-8 w-8 p-0 rounded-lg"
                  title="تعديل"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setDeleteTarget({ id: zone.id, name: zone.nameAr }); setDeleteDialogOpen(true) }}
                  className="h-8 w-8 p-0 rounded-lg text-destructive hover:text-destructive"
                  title="حذف"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-[#D4A574]/10 flex items-center justify-center shrink-0">
            <Truck className="h-5 w-5 text-primary dark:text-[#E8C9A0]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">مناطق الشحن</h2>
            <p className="text-xs text-muted-foreground">
              {zones.length} منطقة شحن
              {zones.filter((z) => z.active).length > 0 && ` · ${zones.filter((z) => z.active).length} نشطة`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchZones}
            className="rounded-xl gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            تحديث
          </Button>
          <Button
            onClick={() => openForm()}
            className="rounded-xl gap-1.5 text-xs bg-primary hover:bg-primary/90 dark:bg-[#D4A574] dark:hover:bg-[#b8885a] dark:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة منطقة
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="البحث بالاسم أو المنطقة..."
          className="rounded-xl pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        renderLoading()
      ) : filteredZones.length === 0 ? (
        <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
          <CardContent className="py-16 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-muted/50 dark:bg-[#2A2522]/50 flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد مناطق شحن بعد'}
              </p>
              <p className="text-xs text-muted-foreground">
                {searchQuery ? 'جرب اسم مختلف أو منطقة أخرى' : 'أضف أول منطقة شحن لبدء التوصيل'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => openForm()}
                  className="mt-4 rounded-xl gap-1.5 text-xs bg-primary hover:bg-primary/90 dark:bg-[#D4A574] dark:hover:bg-[#b8885a] dark:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  إضافة منطقة شحن
                </Button>
              )}
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-4`}>
          {filteredZones.map((zone, idx) => renderZoneCard(zone, idx))}
        </div>
      )}

      {/* ═══ Sheet (Mobile) ═══ */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) setDialogOpen(false) }}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-3xl" dir="rtl">
          <SheetHeader>
            <SheetTitle>{editingZone ? 'تعديل منطقة الشحن' : 'إضافة منطقة شحن جديدة'}</SheetTitle>
            <SheetDescription>
              {editingZone ? 'قم بتعديل بيانات منطقة الشحن' : 'أدخل بيانات منطقة الشحن الجديدة'}
            </SheetDescription>
          </SheetHeader>
          <ShippingForm form={form} setForm={setForm} customRegion={customRegion} setCustomRegion={setCustomRegion} isSheet />
          <SheetFooter className="flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setSheetOpen(false)} className="rounded-xl flex-1">
              إلغاء
            </Button>
            <Button
              onClick={saveZone}
              disabled={saving || !form.nameAr || !form.nameEn || !form.region || (form.region === 'custom' && !customRegion)}
              className="rounded-xl bg-primary hover:bg-primary/90 dark:bg-[#D4A574] dark:hover:bg-[#b8885a] dark:text-white flex-1"
            >
              {saving ? 'جارٍ الحفظ...' : editingZone ? 'حفظ التعديلات' : 'إضافة المنطقة'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ═══ Dialog (Desktop) ═══ */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSheetOpen(false) }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto hidden md:block" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingZone ? 'تعديل منطقة الشحن' : 'إضافة منطقة شحن جديدة'}</DialogTitle>
            <DialogDescription>
              {editingZone ? 'قم بتعديل بيانات منطقة الشحن' : 'أدخل بيانات منطقة الشحن الجديدة'}
            </DialogDescription>
          </DialogHeader>
          <ShippingForm form={form} setForm={setForm} customRegion={customRegion} setCustomRegion={setCustomRegion} />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={saveZone}
              disabled={saving || !form.nameAr || !form.nameEn || !form.region || (form.region === 'custom' && !customRegion)}
              className="rounded-xl bg-primary hover:bg-primary/90 dark:bg-[#D4A574] dark:hover:bg-[#b8885a] dark:text-white"
            >
              {saving ? 'جارٍ الحفظ...' : editingZone ? 'حفظ التعديلات' : 'إضافة المنطقة'}
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
              هل أنت متأكد من حذف منطقة الشحن &quot;{deleteTarget?.name}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteZone}
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

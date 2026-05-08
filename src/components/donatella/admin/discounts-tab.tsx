'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Search,
  Percent,
  DollarSign,
  Truck,
  Copy,
  Calendar,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Gift,
  Clock,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

interface DiscountCode {
  id: string
  code: string
  descriptionAr?: string
  descriptionEn?: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  minOrderValue: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  perUserLimit: number
  autoApply: boolean
  startDate?: string
  endDate?: string
  active: boolean
  createdAt: string
  updatedAt: string
  _count?: { usages: number }
}

interface DiscountFormState {
  code: string
  descriptionAr: string
  descriptionEn: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  minOrderValue: number
  maxDiscount: number
  usageLimit: number
  perUserLimit: number
  autoApply: boolean
  startDate: string
  endDate: string
  active: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────

const defaultDiscountForm: DiscountFormState = {
  code: '',
  descriptionAr: '',
  descriptionEn: '',
  type: 'percentage',
  value: 0,
  minOrderValue: 0,
  maxDiscount: 0,
  usageLimit: 0,
  perUserLimit: 1,
  autoApply: false,
  startDate: '',
  endDate: '',
  active: true,
}

const typeBadgeMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  percentage: {
    label: 'نسبة مئوية',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <Percent className="h-3 w-3" />,
  },
  fixed: {
    label: 'مبلغ ثابت',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: <DollarSign className="h-3 w-3" />,
  },
  free_shipping: {
    label: 'شحن مجاني',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    icon: <Truck className="h-3 w-3" />,
  },
}

function formatCurrency(amount: number): string {
  return `${amount.toFixed(0)} ج.م`
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── Discount Form Component ─────────────────────────────────────────────────

function DiscountForm({ form, setForm, isSheet = false }: {
  form: DiscountFormState
  setForm: React.Dispatch<React.SetStateAction<DiscountFormState>>
  isSheet?: boolean
}) {
  const cn = isSheet ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4 py-4'

  return (
    <div className={cn}>
      {/* Code */}
      <div className="space-y-2">
        <Label htmlFor="discount-code">كود الخصم *</Label>
        <div className="relative">
          <Input
            id="discount-code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="مثال: SUMMER25"
            className="rounded-xl uppercase pr-10"
            dir="ltr"
          />
          <Tag className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="discount-type">نوع الخصم *</Label>
        <Select
          value={form.type}
          onValueChange={(value: 'percentage' | 'fixed' | 'free_shipping') =>
            setForm({ ...form, type: value })
          }
        >
          <SelectTrigger className="rounded-xl w-full">
            <SelectValue placeholder="اختر نوع الخصم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
            <SelectItem value="fixed">مبلغ ثابت (ج.م)</SelectItem>
            <SelectItem value="free_shipping">شحن مجاني</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Value */}
      {form.type !== 'free_shipping' && (
        <div className="space-y-2">
          <Label htmlFor="discount-value">
            {form.type === 'percentage' ? 'نسبة الخصم (%)' : 'مبلغ الخصم (ج.م)'} *
          </Label>
          <Input
            id="discount-value"
            type="number"
            min={0}
            max={form.type === 'percentage' ? 100 : undefined}
            value={form.value || ''}
            onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
            className="rounded-xl"
            dir="ltr"
          />
        </div>
      )}

      {/* Min Order Value */}
      <div className="space-y-2">
        <Label htmlFor="discount-min">الحد الأدنى للطلب (ج.م)</Label>
        <Input
          id="discount-min"
          type="number"
          min={0}
          value={form.minOrderValue || ''}
          onChange={(e) => setForm({ ...form, minOrderValue: parseFloat(e.target.value) || 0 })}
          className="rounded-xl"
          dir="ltr"
        />
      </div>

      {/* Max Discount */}
      {form.type === 'percentage' && (
        <div className="space-y-2">
          <Label htmlFor="discount-max">الحد الأقصى للخصم (ج.م)</Label>
          <Input
            id="discount-max"
            type="number"
            min={0}
            value={form.maxDiscount || ''}
            onChange={(e) => setForm({ ...form, maxDiscount: parseFloat(e.target.value) || 0 })}
            placeholder="اختياري"
            className="rounded-xl"
            dir="ltr"
          />
        </div>
      )}

      {/* Usage Limit */}
      <div className="space-y-2">
        <Label htmlFor="discount-usage">الحد الأقصى للاستخدام</Label>
        <Input
          id="discount-usage"
          type="number"
          min={0}
          value={form.usageLimit || ''}
          onChange={(e) => setForm({ ...form, usageLimit: parseInt(e.target.value) || 0 })}
          placeholder="0 = بلا حدود"
          className="rounded-xl"
          dir="ltr"
        />
      </div>

      {/* Per User Limit */}
      <div className="space-y-2">
        <Label htmlFor="discount-per-user">الحد لكل مستخدم</Label>
        <Input
          id="discount-per-user"
          type="number"
          min={1}
          value={form.perUserLimit}
          onChange={(e) => setForm({ ...form, perUserLimit: parseInt(e.target.value) || 1 })}
          className="rounded-xl"
          dir="ltr"
        />
      </div>

      {/* Description AR */}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="discount-desc-ar">الوصف بالعربية</Label>
        <Input
          id="discount-desc-ar"
          value={form.descriptionAr}
          onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
          placeholder="خصم الصيف - خصم 25% على جميع المنتجات"
          className="rounded-xl"
        />
      </div>

      {/* Description EN */}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="discount-desc-en">الوصف بالإنجليزية</Label>
        <Input
          id="discount-desc-en"
          value={form.descriptionEn}
          onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
          placeholder="Summer Sale - 25% off all products"
          className="rounded-xl"
          dir="ltr"
        />
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <Label htmlFor="discount-start">تاريخ البداية</Label>
        <Input
          id="discount-start"
          type="date"
          value={form.startDate ? form.startDate.split('T')[0] : ''}
          onChange={(e) => setForm({ ...form, startDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
          className="rounded-xl"
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="discount-end">تاريخ الانتهاء</Label>
        <Input
          id="discount-end"
          type="date"
          value={form.endDate ? form.endDate.split('T')[0] : ''}
          onChange={(e) => setForm({ ...form, endDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
          className="rounded-xl"
          dir="ltr"
        />
      </div>

      {/* Switches */}
      <div className="flex items-center gap-6 pt-2 sm:col-span-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Switch
            id="discount-auto-apply"
            checked={form.autoApply}
            onCheckedChange={(checked) => setForm({ ...form, autoApply: checked })}
          />
          <Label htmlFor="discount-auto-apply" className="flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5" />
            تطبيق تلقائي
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="discount-active"
            checked={form.active}
            onCheckedChange={(checked) => setForm({ ...form, active: checked })}
          />
          <Label htmlFor="discount-active" className="flex items-center gap-1.5">
            {form.active ? (
              <ToggleRight className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            نشط
          </Label>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DiscountsTab({ isMobile }: { isMobile: boolean }) {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog/Sheet state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null)
  const [form, setForm] = useState<DiscountFormState>(defaultDiscountForm)
  const [saving, setSaving] = useState(false)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null)

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchDiscounts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/discounts')
      const data = await res.json()
      if (data.success) {
        setDiscounts(data.data?.discounts || data.data || [])
      } else {
        toast.error('فشل تحميل أكواد الخصم')
      }
    } catch {
      toast.error('فشل تحميل أكواد الخصم')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDiscounts()
  }, [fetchDiscounts])

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const openForm = (discount?: DiscountCode) => {
    if (discount) {
      setEditingDiscount(discount)
      setForm({
        code: discount.code,
        descriptionAr: discount.descriptionAr || '',
        descriptionEn: discount.descriptionEn || '',
        type: discount.type,
        value: discount.value,
        minOrderValue: discount.minOrderValue,
        maxDiscount: discount.maxDiscount || 0,
        usageLimit: discount.usageLimit || 0,
        perUserLimit: discount.perUserLimit,
        autoApply: discount.autoApply,
        startDate: discount.startDate || '',
        endDate: discount.endDate || '',
        active: discount.active,
      })
    } else {
      setEditingDiscount(null)
      setForm(defaultDiscountForm)
    }
    if (window.innerWidth < 768) {
      setSheetOpen(true)
    } else {
      setDialogOpen(true)
    }
  }

  const saveDiscount = async () => {
    if (!form.code) {
      toast.error('يرجى إدخال كود الخصم')
      return
    }
    if (form.type !== 'free_shipping' && form.value <= 0) {
      toast.error('يرجى إدخال قيمة الخصم')
      return
    }

    setSaving(true)
    try {
      const payload = {
        code: form.code.toUpperCase(),
        descriptionAr: form.descriptionAr || undefined,
        descriptionEn: form.descriptionEn || undefined,
        type: form.type,
        value: form.type === 'free_shipping' ? 0 : form.value,
        minOrderValue: form.minOrderValue,
        maxDiscount: form.type === 'percentage' && form.maxDiscount > 0 ? form.maxDiscount : undefined,
        usageLimit: form.usageLimit > 0 ? form.usageLimit : undefined,
        perUserLimit: form.perUserLimit,
        autoApply: form.autoApply,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        active: form.active,
      }

      let res: Response
      if (editingDiscount) {
        res = await fetch(`/api/admin/discounts/${editingDiscount.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/discounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (data.success) {
        toast.success(editingDiscount ? 'تم تحديث كود الخصم بنجاح' : 'تم إضافة كود الخصم بنجاح')
        setDialogOpen(false)
        setSheetOpen(false)
        fetchDiscounts()
      } else {
        toast.error(data.error || 'فشل حفظ كود الخصم')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const deleteDiscount = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/discounts/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('تم حذف كود الخصم بنجاح')
        fetchDiscounts()
      } else {
        toast.error(data.error || 'فشل حذف كود الخصم')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحذف')
    }
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  const toggleActive = async (discount: DiscountCode) => {
    try {
      const res = await fetch(`/api/admin/discounts/${discount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !discount.active }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(discount.active ? 'تم إلغاء تفعيل الكود' : 'تم تفعيل الكود')
        fetchDiscounts()
      }
    } catch {
      toast.error('فشل تحديث الحالة')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('تم نسخ الكود')
  }

  // ─── Filter ───────────────────────────────────────────────────────────────

  const filteredDiscounts = discounts.filter((d) => {
    const q = searchQuery.toLowerCase()
    return (
      d.code.toLowerCase().includes(q) ||
      (d.descriptionAr && d.descriptionAr.toLowerCase().includes(q))
    )
  })

  // ─── Render Helpers ───────────────────────────────────────────────────────

  const getValueDisplay = (discount: DiscountCode) => {
    if (discount.type === 'percentage') return `${discount.value}%`
    if (discount.type === 'fixed') return formatCurrency(discount.value)
    return 'مجاني'
  }

  const isExpired = (discount: DiscountCode) => {
    if (!discount.endDate) return false
    return new Date(discount.endDate) < new Date()
  }

  const isScheduled = (discount: DiscountCode) => {
    if (!discount.startDate) return false
    return new Date(discount.startDate) > new Date()
  }

  // ─── Loading Skeletons ────────────────────────────────────────────────────

  const renderLoading = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      {isMobile ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <Skeleton className="h-64 rounded-2xl" />
      )}
    </div>
  )

  // ─── Mobile Card ──────────────────────────────────────────────────────────

  const renderMobileCard = (discount: DiscountCode) => {
    const typeInfo = typeBadgeMap[discount.type]
    const expired = isExpired(discount)
    const scheduled = isScheduled(discount)

    return (
      <motion.div
        key={discount.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card overflow-hidden">
          <CardContent className="p-4 space-y-3">
            {/* Header row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-primary/10 dark:bg-[#D4A574]/10 flex items-center justify-center">
                  <Tag className="h-4 w-4 text-primary dark:text-[#E8C9A0]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm font-mono tracking-wide">{discount.code}</span>
                    <button onClick={() => copyCode(discount.code)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  {discount.descriptionAr && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{discount.descriptionAr}</p>
                  )}
                </div>
              </div>
              <Badge className={`${discount.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'} text-[10px]`}>
                {discount.active ? 'نشط' : 'معطل'}
              </Badge>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 dark:bg-[#2A2522]/50 rounded-lg p-2">
                <p className="text-muted-foreground text-[10px] mb-0.5">النوع</p>
                <Badge className={`${typeInfo.color} text-[9px] gap-0.5 px-1.5 py-0`}>
                  {typeInfo.icon}
                  {typeInfo.label}
                </Badge>
              </div>
              <div className="bg-muted/50 dark:bg-[#2A2522]/50 rounded-lg p-2">
                <p className="text-muted-foreground text-[10px] mb-0.5">القيمة</p>
                <p className="font-bold text-primary dark:text-[#E8C9A0]">{getValueDisplay(discount)}</p>
              </div>
              <div className="bg-muted/50 dark:bg-[#2A2522]/50 rounded-lg p-2">
                <p className="text-muted-foreground text-[10px] mb-0.5">الحد الأدنى</p>
                <p className="font-medium">{discount.minOrderValue > 0 ? formatCurrency(discount.minOrderValue) : 'بلا'}</p>
              </div>
              <div className="bg-muted/50 dark:bg-[#2A2522]/50 rounded-lg p-2">
                <p className="text-muted-foreground text-[10px] mb-0.5">الاستخدام</p>
                <p className="font-medium">
                  {discount.usageCount}
                  {discount.usageLimit ? ` / ${discount.usageLimit}` : ''}
                </p>
              </div>
            </div>

            {/* Date info */}
            {(discount.startDate || discount.endDate) && (
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {discount.startDate ? formatDate(discount.startDate) : '—'}
                  {' → '}
                  {discount.endDate ? formatDate(discount.endDate) : '—'}
                </span>
                {expired && <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px] px-1 py-0">منتهي</Badge>}
                {scheduled && <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[9px] px-1 py-0">مجدول</Badge>}
              </div>
            )}

            {/* Auto apply indicator */}
            {discount.autoApply && (
              <div className="flex items-center gap-1 text-[10px] text-[#D4A574]">
                <Gift className="h-3 w-3" />
                <span>تطبيق تلقائي</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-border/50 dark:border-[#3A3532]/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleActive(discount)}
                className="h-8 rounded-lg text-xs gap-1 flex-1"
              >
                {discount.active ? (
                  <>
                    <ToggleRight className="h-3.5 w-3.5 text-green-500" />
                    تعطيل
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-3.5 w-3.5" />
                    تفعيل
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openForm(discount)}
                className="h-8 rounded-lg text-xs gap-1"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setDeleteTarget({ id: discount.id, code: discount.code }); setDeleteDialogOpen(true) }}
                className="h-8 rounded-lg text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // ─── Desktop Table ────────────────────────────────────────────────────────

  const renderDesktopTable = () => (
    <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">الكود</TableHead>
              <TableHead className="text-xs">النوع</TableHead>
              <TableHead className="text-xs">القيمة</TableHead>
              <TableHead className="text-xs">الحد الأدنى</TableHead>
              <TableHead className="text-xs">الاستخدام</TableHead>
              <TableHead className="text-xs">الحالة</TableHead>
              <TableHead className="text-xs text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiscounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Tag className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد أكواد خصم</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredDiscounts.map((discount) => {
                const typeInfo = typeBadgeMap[discount.type]
                const expired = isExpired(discount)
                return (
                  <TableRow key={discount.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-mono tracking-wide text-sm">{discount.code}</span>
                        <button onClick={() => copyCode(discount.code)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                          <Copy className="h-3 w-3" />
                        </button>
                        {discount.autoApply && <Gift className="h-3 w-3 text-[#D4A574]" />}
                      </div>
                      {discount.descriptionAr && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{discount.descriptionAr}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${typeInfo.color} text-[10px] gap-0.5 px-1.5 py-0`}>
                        {typeInfo.icon}
                        {typeInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-primary dark:text-[#E8C9A0]">
                      {getValueDisplay(discount)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {discount.minOrderValue > 0 ? formatCurrency(discount.minOrderValue) : '—'}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span>{discount.usageCount}</span>
                      {discount.usageLimit ? <span className="text-muted-foreground"> / {discount.usageLimit}</span> : null}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge className={`${discount.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'} text-[10px]`}>
                          {discount.active ? 'نشط' : 'معطل'}
                        </Badge>
                        {expired && (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px] px-1 py-0">منتهي</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(discount)}
                          className="h-7 w-7 p-0 rounded-lg"
                          title={discount.active ? 'تعطيل' : 'تفعيل'}
                        >
                          {discount.active ? (
                            <ToggleRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openForm(discount)}
                          className="h-7 w-7 p-0 rounded-lg"
                          title="تعديل"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setDeleteTarget({ id: discount.id, code: discount.code }); setDeleteDialogOpen(true) }}
                          className="h-7 w-7 p-0 rounded-lg text-destructive hover:text-destructive"
                          title="حذف"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-[#D4A574]/10 flex items-center justify-center shrink-0">
            <Tag className="h-5 w-5 text-primary dark:text-[#E8C9A0]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">أكواد الخصم</h2>
            <p className="text-xs text-muted-foreground">
              {discounts.length} كود خصم
              {discounts.filter((d) => d.active).length > 0 && ` · ${discounts.filter((d) => d.active).length} نشط`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDiscounts}
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
            إضافة كود
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="البحث بالكود أو الوصف..."
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
      ) : filteredDiscounts.length === 0 ? (
        <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
          <CardContent className="py-16 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-muted/50 dark:bg-[#2A2522]/50 flex items-center justify-center mb-4">
                <Tag className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد أكواد خصم بعد'}
              </p>
              <p className="text-xs text-muted-foreground">
                {searchQuery ? 'جرب كود مختلف أو وصف آخر' : 'أضف أول كود خصم لبدء تقديم العروض'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => openForm()}
                  className="mt-4 rounded-xl gap-1.5 text-xs bg-primary hover:bg-primary/90 dark:bg-[#D4A574] dark:hover:bg-[#b8885a] dark:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  إضافة كود خصم
                </Button>
              )}
            </motion.div>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {filteredDiscounts.map(renderMobileCard)}
        </div>
      ) : (
        renderDesktopTable()
      )}

      {/* ═══ Sheet (Mobile) ═══ */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) setDialogOpen(false) }}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-3xl" dir="rtl">
          <SheetHeader>
            <SheetTitle>{editingDiscount ? 'تعديل كود الخصم' : 'إضافة كود خصم جديد'}</SheetTitle>
            <SheetDescription>
              {editingDiscount ? 'قم بتعديل بيانات كود الخصم' : 'أدخل بيانات كود الخصم الجديد'}
            </SheetDescription>
          </SheetHeader>
          <DiscountForm form={form} setForm={setForm} isSheet />
          <SheetFooter className="flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setSheetOpen(false)} className="rounded-xl flex-1">
              إلغاء
            </Button>
            <Button
              onClick={saveDiscount}
              disabled={saving || !form.code}
              className="rounded-xl bg-primary hover:bg-primary/90 dark:bg-[#D4A574] dark:hover:bg-[#b8885a] dark:text-white flex-1"
            >
              {saving ? 'جارٍ الحفظ...' : editingDiscount ? 'حفظ التعديلات' : 'إضافة الكود'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ═══ Dialog (Desktop) ═══ */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSheetOpen(false) }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto hidden md:block" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingDiscount ? 'تعديل كود الخصم' : 'إضافة كود خصم جديد'}</DialogTitle>
            <DialogDescription>
              {editingDiscount ? 'قم بتعديل بيانات كود الخصم' : 'أدخل بيانات كود الخصم الجديد'}
            </DialogDescription>
          </DialogHeader>
          <DiscountForm form={form} setForm={setForm} />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={saveDiscount}
              disabled={saving || !form.code}
              className="rounded-xl bg-primary hover:bg-primary/90 dark:bg-[#D4A574] dark:hover:bg-[#b8885a] dark:text-white"
            >
              {saving ? 'جارٍ الحفظ...' : editingDiscount ? 'حفظ التعديلات' : 'إضافة الكود'}
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
              هل أنت متأكد من حذف كود الخصم &quot;{deleteTarget?.code}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteDiscount}
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

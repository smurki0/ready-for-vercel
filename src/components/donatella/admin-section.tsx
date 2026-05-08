'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Star,
  Search,
  ChevronUp,
  ChevronDown,
  Save,
  Store,
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  RefreshCw,
  X,
  Tag,
  Truck,
  ImageIcon,
  Bell,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import AnalyticsTab from '@/components/donatella/admin/analytics-tab'
import DiscountsTab from '@/components/donatella/admin/discounts-tab'
import ShippingTab from '@/components/donatella/admin/shipping-tab'
import BannersTab from '@/components/donatella/admin/banners-tab'
import NotificationsTab from '@/components/donatella/admin/notifications-tab'
import SettingsTab from '@/components/donatella/admin/settings-tab'
import HomepageTab from '@/components/donatella/admin/homepage-tab'
import MessagesTab from '@/components/donatella/admin/messages-tab'
import ReviewsTab from '@/components/donatella/admin/reviews-tab'

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminTab = 'dashboard' | 'analytics' | 'products' | 'orders' | 'users' | 'categories' | 'discounts' | 'shipping' | 'banners' | 'notifications' | 'messages' | 'reviews' | 'settings' | 'homepage'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  totalProducts: number
  recentOrders: Array<{
    id: string
    status: string
    total: number
    customerName: string
    createdAt: string
  }>
  monthlyRevenue: Array<{ month: string; revenue: number }>
  topProducts?: Array<{
    id: string
    nameAr: string
    nameEn: string
    images: string | string[]
    price: number
    _count?: { orderItems: number }
  }>
}

interface ProductItem {
  id: string
  nameAr: string
  nameEn: string
  subtitleAr?: string
  subtitleEn?: string
  descriptionAr?: string
  descriptionEn?: string
  price: number
  discount: number
  images: string | string[]
  sizes: string | string[]
  colors: string | string[]
  stock: number
  featured: boolean
  active: boolean
  categoryId: string
  category?: { id: string; nameAr: string; nameEn: string; slug: string }
  createdAt: string
  // Extended fields
  sku?: string
  brand?: string
  badgeTextAr?: string
  badgeTextEn?: string
  isNew?: boolean
  freeShipping?: boolean
  freeShippingThreshold?: number
  materialAr?: string
  materialEn?: string
  weight?: number
  tags: string | string[]
  minOrderQty?: number
  maxOrderQty?: number
  shippingTimeAr?: string
  shippingTimeEn?: string
  videoUrl?: string
  careAr?: string
  careEn?: string
  returnPolicyAr?: string
  returnPolicyEn?: string
  metaTitle?: string
  metaDescription?: string
}

interface CategoryItem {
  id: string
  nameAr: string
  nameEn: string
  slug: string
  image?: string | null
  description?: string | null
  order: number
  _count?: { products: number }
  createdAt: string
}

interface SiteSettings {
  [key: string]: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  shipped: { label: 'تم الشحن', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
}

const paymentMethodLabels: Record<string, string> = {
  cod: 'عند الاستلام',
  credit_card: 'بطاقة ائتمانية',
  apple_pay: 'Apple Pay',
  vodafone_cash: 'فودافون كاش',
  instapay: 'InstaPay',
}

const adminTabs: { key: AdminTab; label: string; icon: React.ReactNode; shortLabel: string }[] = [
  { key: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard className="h-4 w-4" />, shortLabel: 'الرئيسية' },
  { key: 'analytics', label: 'التحليلات', icon: <BarChart3 className="h-4 w-4" />, shortLabel: 'التحليلات' },
  { key: 'products', label: 'المنتجات', icon: <Package className="h-4 w-4" />, shortLabel: 'المنتجات' },
  { key: 'orders', label: 'الطلبات', icon: <ShoppingCart className="h-4 w-4" />, shortLabel: 'الطلبات' },
  { key: 'users', label: 'المستخدمون', icon: <Users className="h-4 w-4" />, shortLabel: 'المستخدمون' },
  { key: 'categories', label: 'الفئات', icon: <Tags className="h-4 w-4" />, shortLabel: 'الفئات' },
  { key: 'discounts', label: 'أكواد الخصم', icon: <Tag className="h-4 w-4" />, shortLabel: 'الخصم' },
  { key: 'shipping', label: 'التوصيل', icon: <Truck className="h-4 w-4" />, shortLabel: 'التوصيل' },
  { key: 'banners', label: 'البنرات', icon: <ImageIcon className="h-4 w-4" />, shortLabel: 'البنرات' },
  { key: 'notifications', label: 'الإشعارات', icon: <Bell className="h-4 w-4" />, shortLabel: 'إشعارات' },
  { key: 'messages', label: 'رسائل التواصل', icon: <Mail className="h-4 w-4" />, shortLabel: 'الرسائل' },
  { key: 'reviews', label: 'تعليقات الزبائن', icon: <Star className="h-4 w-4" />, shortLabel: 'التعليقات' },
  { key: 'settings', label: 'الإعدادات', icon: <Settings className="h-4 w-4" />, shortLabel: 'الإعدادات' },
  { key: 'homepage', label: 'أقسام الرئيسية', icon: <LayoutDashboard className="h-4 w-4" />, shortLabel: 'الرئيسية' },
]

// ─── Helper ──────────────────────────────────────────────────────────────────

function getImagesArray(images: string | string[]): string[] {
  if (Array.isArray(images)) return images
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function formatCurrency(amount: number): string {
  return `${amount.toFixed(0)} ج.م`
}

// ─── Custom Tooltip for Charts ───────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border dark:border-[#3A3532] rounded-xl p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-bold text-foreground">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

function OrdersTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border dark:border-[#3A3532] rounded-xl p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-bold text-foreground">{payload[0].value} طلب</p>
      </div>
    )
  }
  return null
}

// ─── Product Form Component ───────────────────────────────────────────────

function ProductForm({ productForm, setProductForm, categories, isSheet = false }: {
  productForm: typeof defaultProductForm
  setProductForm: React.Dispatch<React.SetStateAction<typeof defaultProductForm>>
  categories: CategoryItem[]
  isSheet?: boolean
}) {
  const update = (field: string, value: unknown) => {
    setProductForm((prev) => ({ ...prev, [field]: value }))
  }

  const gridClass = 'grid grid-cols-1 sm:grid-cols-2 gap-4'

  return (
    <Accordion type="multiple" defaultValue={['basic', 'pricing', 'media', 'sizes', 'details', 'shipping', 'care', 'seo']} className="w-full">
      {/* ─── Section 1: المعلومات الأساسية ─── */}
      <AccordionItem value="basic">
        <AccordionTrigger className="text-sm font-semibold">المعلومات الأساسية</AccordionTrigger>
        <AccordionContent>
          <div className={gridClass}>
            <div className="space-y-2">
              <Label htmlFor="nameAr">الاسم بالعربية *</Label>
              <Input id="nameAr" value={productForm.nameAr} onChange={(e) => update('nameAr', e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">الاسم بالإنجليزية *</Label>
              <Input id="nameEn" value={productForm.nameEn} onChange={(e) => update('nameEn', e.target.value)} className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitleAr">العنوان الفرعي بالعربية</Label>
              <Input id="subtitleAr" value={productForm.subtitleAr} onChange={(e) => update('subtitleAr', e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitleEn">العنوان الفرعي بالإنجليزية</Label>
              <Input id="subtitleEn" value={productForm.subtitleEn} onChange={(e) => update('subtitleEn', e.target.value)} className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descriptionAr">الوصف بالعربية</Label>
              <Textarea id="descriptionAr" value={productForm.descriptionAr} onChange={(e) => update('descriptionAr', e.target.value)} className="rounded-xl" rows={3} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descriptionEn">الوصف بالإنجليزية</Label>
              <Textarea id="descriptionEn" value={productForm.descriptionEn} onChange={(e) => update('descriptionEn', e.target.value)} className="rounded-xl" rows={3} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">الماركة / العلامة التجارية</Label>
              <Input id="brand" value={productForm.brand} onChange={(e) => update('brand', e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">كود المنتج (SKU)</Label>
              <Input id="sku" value={productForm.sku} onChange={(e) => update('sku', e.target.value)} className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="categoryId">الفئة *</Label>
              <Select value={productForm.categoryId} onValueChange={(value) => update('categoryId', value)}>
                <SelectTrigger className="rounded-xl w-full">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ─── Section 2: التسعير والعرض ─── */}
      <AccordionItem value="pricing">
        <AccordionTrigger className="text-sm font-semibold">التسعير والعرض</AccordionTrigger>
        <AccordionContent>
          <div className={gridClass}>
            <div className="space-y-2">
              <Label htmlFor="price">السعر (ج.م) *</Label>
              <Input id="price" type="number" min={0} value={productForm.price} onChange={(e) => update('price', parseFloat(e.target.value) || 0)} className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">نسبة الخصم (%)</Label>
              <Input id="discount" type="number" min={0} max={100} value={productForm.discount} onChange={(e) => update('discount', parseFloat(e.target.value) || 0)} className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">المخزون *</Label>
              <Input id="stock" type="number" min={0} value={productForm.stock} onChange={(e) => update('stock', parseInt(e.target.value) || 0)} className="rounded-xl" dir="ltr" />
            </div>
            <div className="flex items-center gap-6 pt-6">
              <div className="flex items-center gap-2">
                <Switch id="featured" checked={productForm.featured} onCheckedChange={(checked) => update('featured', checked)} />
                <Label htmlFor="featured">منتج مميز</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="active" checked={productForm.active} onCheckedChange={(checked) => update('active', checked)} />
                <Label htmlFor="active">نشط</Label>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch id="isNew" checked={productForm.isNew} onCheckedChange={(checked) => update('isNew', checked)} />
                <Label htmlFor="isNew">شارة &quot;جديد&quot;</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="freeShipping" checked={productForm.freeShipping} onCheckedChange={(checked) => update('freeShipping', checked)} />
                <Label htmlFor="freeShipping">شحن مجاني</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="freeShippingThreshold">حد الشحن المجاني (ج.م)</Label>
              <Input id="freeShippingThreshold" type="number" min={0} value={productForm.freeShippingThreshold} onChange={(e) => update('freeShippingThreshold', e.target.value)} className="rounded-xl" dir="ltr" placeholder="اتركه فارغاً للتعطيل" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="badgeTextAr">نص الشارة بالعربية</Label>
              <Input id="badgeTextAr" value={productForm.badgeTextAr} onChange={(e) => update('badgeTextAr', e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="badgeTextEn">نص الشارة بالإنجليزية</Label>
              <Input id="badgeTextEn" value={productForm.badgeTextEn} onChange={(e) => update('badgeTextEn', e.target.value)} className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minOrderQty">الحد الأدنى للطلب</Label>
              <Input id="minOrderQty" type="number" min={1} value={productForm.minOrderQty} onChange={(e) => update('minOrderQty', parseInt(e.target.value) || 1)} className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxOrderQty">الحد الأقصى للطلب</Label>
              <Input id="maxOrderQty" type="number" min={1} value={productForm.maxOrderQty} onChange={(e) => update('maxOrderQty', e.target.value)} className="rounded-xl" dir="ltr" placeholder="اتركه فارغاً بلا حد" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ─── Section 3: الوسائط ─── */}
      <AccordionItem value="media">
        <AccordionTrigger className="text-sm font-semibold">الوسائط</AccordionTrigger>
        <AccordionContent>
          <div className={gridClass}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="images">روابط الصور (مفصولة بفواصل)</Label>
              <Input id="images" value={productForm.images} onChange={(e) => update('images', e.target.value)} placeholder="image1.jpg, image2.jpg" className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="videoUrl">رابط فيديو المنتج</Label>
              <Input id="videoUrl" value={productForm.videoUrl} onChange={(e) => update('videoUrl', e.target.value)} className="rounded-xl" dir="ltr" placeholder="https://youtube.com/..." />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ─── Section 4: المقاسات والألوان ─── */}
      <AccordionItem value="sizes">
        <AccordionTrigger className="text-sm font-semibold">المقاسات والألوان</AccordionTrigger>
        <AccordionContent>
          <div className={gridClass}>
            <div className="space-y-2">
              <Label htmlFor="sizes">المقاسات (مفصولة بفواصل)</Label>
              <Input id="sizes" value={productForm.sizes} onChange={(e) => update('sizes', e.target.value)} placeholder="S, M, L, XL" className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="colors">الألوان (مفصولة بفواصل)</Label>
              <Input id="colors" value={productForm.colors} onChange={(e) => update('colors', e.target.value)} placeholder="أحمر, أزرق, أخضر" className="rounded-xl" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ─── Section 5: تفاصيل المنتج ─── */}
      <AccordionItem value="details">
        <AccordionTrigger className="text-sm font-semibold">تفاصيل المنتج</AccordionTrigger>
        <AccordionContent>
          <div className={gridClass}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tags">الوسوم (مفصولة بفواصل)</Label>
              <Input id="tags" value={productForm.tags} onChange={(e) => update('tags', e.target.value)} placeholder="فستان, سهرة, أنيق" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="materialAr">الخامة بالعربية</Label>
              <Input id="materialAr" value={productForm.materialAr} onChange={(e) => update('materialAr', e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="materialEn">الخامة بالإنجليزية</Label>
              <Input id="materialEn" value={productForm.materialEn} onChange={(e) => update('materialEn', e.target.value)} className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">الوزن (كجم)</Label>
              <Input id="weight" type="number" min={0} step={0.01} value={productForm.weight} onChange={(e) => update('weight', e.target.value)} className="rounded-xl" dir="ltr" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ─── Section 6: الشحن والتوصيل ─── */}
      <AccordionItem value="shipping">
        <AccordionTrigger className="text-sm font-semibold">الشحن والتوصيل</AccordionTrigger>
        <AccordionContent>
          <div className={gridClass}>
            <div className="space-y-2">
              <Label htmlFor="shippingTimeAr">مدة التوصيل بالعربية</Label>
              <Input id="shippingTimeAr" value={productForm.shippingTimeAr} onChange={(e) => update('shippingTimeAr', e.target.value)} className="rounded-xl" placeholder="3-5 أيام عمل" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingTimeEn">مدة التوصيل بالإنجليزية</Label>
              <Input id="shippingTimeEn" value={productForm.shippingTimeEn} onChange={(e) => update('shippingTimeEn', e.target.value)} className="rounded-xl" dir="ltr" placeholder="3-5 business days" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ─── Section 7: العناية والإرجاع ─── */}
      <AccordionItem value="care">
        <AccordionTrigger className="text-sm font-semibold">العناية والإرجاع</AccordionTrigger>
        <AccordionContent>
          <div className={gridClass}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="careAr">تعليمات العناية بالعربية</Label>
              <Textarea id="careAr" value={productForm.careAr} onChange={(e) => update('careAr', e.target.value)} className="rounded-xl" rows={3} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="careEn">تعليمات العناية بالإنجليزية</Label>
              <Textarea id="careEn" value={productForm.careEn} onChange={(e) => update('careEn', e.target.value)} className="rounded-xl" rows={3} dir="ltr" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="returnPolicyAr">سياسة الإرجاع بالعربية</Label>
              <Textarea id="returnPolicyAr" value={productForm.returnPolicyAr} onChange={(e) => update('returnPolicyAr', e.target.value)} className="rounded-xl" rows={3} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="returnPolicyEn">سياسة الإرجاع بالإنجليزية</Label>
              <Textarea id="returnPolicyEn" value={productForm.returnPolicyEn} onChange={(e) => update('returnPolicyEn', e.target.value)} className="rounded-xl" rows={3} dir="ltr" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* ─── Section 8: تحسين محركات البحث SEO ─── */}
      <AccordionItem value="seo">
        <AccordionTrigger className="text-sm font-semibold">تحسين محركات البحث SEO</AccordionTrigger>
        <AccordionContent>
          <div className={gridClass}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="metaTitle">عنوان SEO</Label>
              <Input id="metaTitle" value={productForm.metaTitle} onChange={(e) => update('metaTitle', e.target.value)} className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="metaDescription">وصف SEO</Label>
              <Textarea id="metaDescription" value={productForm.metaDescription} onChange={(e) => update('metaDescription', e.target.value)} className="rounded-xl" rows={3} dir="ltr" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const defaultProductForm = {
  nameAr: '', nameEn: '', subtitleAr: '', subtitleEn: '',
  descriptionAr: '', descriptionEn: '',
  brand: '', sku: '',
  price: 0, discount: 0, stock: 0, featured: false, active: true,
  isNew: false, freeShipping: false, freeShippingThreshold: '',
  badgeTextAr: '', badgeTextEn: '',
  minOrderQty: 1, maxOrderQty: '',
  categoryId: '', images: '', sizes: '', colors: '',
  videoUrl: '',
  tags: '', materialAr: '', materialEn: '', weight: '',
  shippingTimeAr: '', shippingTimeEn: '',
  careAr: '', careEn: '', returnPolicyAr: '', returnPolicyEn: '',
  metaTitle: '', metaDescription: '',
}

const defaultCategoryForm = {
  nameAr: '', nameEn: '', slug: '', image: '', description: '', order: 0,
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminSection() {
  const setPage = useUIStore((s) => s.setPage)
  const currentPage = useUIStore((s) => s.currentPage)
  const isAdmin = useAuthStore((s) => s.isAdmin)

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([])
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([])
  const [products, setProducts] = useState<ProductItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [settings, setSettings] = useState<SiteSettings>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Product dialog/sheet state
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [productSheetOpen, setProductSheetOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [productForm, setProductForm] = useState(defaultProductForm)

  // Category dialog/sheet state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categorySheetOpen, setCategorySheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm)

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'category'; id: string; name: string } | null>(null)


  // Order detail sheet (mobile)
  const [orderDetailSheet, setOrderDetailSheet] = useState<Record<string, unknown> | null>(null)
  // Order detail dialog
  const [orderDetailDialog, setOrderDetailDialog] = useState(false)
  const [deliveryNotesText, setDeliveryNotesText] = useState('')

  // ─── Tab Sync ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (currentPage.startsWith('admin-')) {
      const tab = currentPage.replace('admin-', '') as AdminTab
      if (['dashboard', 'analytics', 'products', 'orders', 'users', 'categories', 'discounts', 'shipping', 'banners', 'notifications', 'messages', 'reviews', 'settings', 'homepage'].includes(tab)) {
        setActiveTab(tab)
      }
    } else if (currentPage === 'admin') {
      setActiveTab('dashboard')
    }
  }, [currentPage])

  useEffect(() => {
    if (!isAdmin()) {
      setPage('home')
    }
  }, [isAdmin, setPage])

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/dashboard')
      const data = await res.json()
      if (data.success) setStats(data.data)
    } catch {
      toast.error('فشل تحميل لوحة التحكم')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (data.success) setOrders(data.data.orders || data.data)
    } catch {
      toast.error('فشل تحميل الطلبات')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.success) setUsers(data.data.users || data.data)
    } catch {
      toast.error('فشل تحميل المستخدمين')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      if (data.success) setProducts(data.data)
    } catch {
      toast.error('فشل تحميل المنتجات')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.success) setCategories(data.data)
    } catch {
      toast.error('فشل تحميل الفئات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboard()
    else if (activeTab === 'orders') fetchOrders()
    else if (activeTab === 'users') fetchUsers()
    else if (activeTab === 'products') {
      fetchProducts()
      if (categories.length === 0) fetchCategories()
    }
    else if (activeTab === 'categories') fetchCategories()
  }, [activeTab, categories.length, fetchCategories, fetchProducts, fetchDashboard, fetchOrders, fetchUsers])



  // ─── Product CRUD ──────────────────────────────────────────────────────

  const openProductDialog = (product?: ProductItem) => {
    if (product) {
      setEditingProduct(product)
      setProductForm({
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        subtitleAr: product.subtitleAr || '',
        subtitleEn: product.subtitleEn || '',
        descriptionAr: product.descriptionAr || '',
        descriptionEn: product.descriptionEn || '',
        brand: product.brand || '',
        sku: product.sku || '',
        price: product.price,
        discount: product.discount,
        stock: product.stock,
        featured: product.featured,
        active: product.active,
        isNew: product.isNew || false,
        freeShipping: product.freeShipping || false,
        freeShippingThreshold: product.freeShippingThreshold ? String(product.freeShippingThreshold) : '',
        badgeTextAr: product.badgeTextAr || '',
        badgeTextEn: product.badgeTextEn || '',
        minOrderQty: product.minOrderQty || 1,
        maxOrderQty: product.maxOrderQty ? String(product.maxOrderQty) : '',
        categoryId: product.categoryId,
        images: Array.isArray(product.images) ? product.images.join(', ') : product.images,
        sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes,
        colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors,
        videoUrl: product.videoUrl || '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
        materialAr: product.materialAr || '',
        materialEn: product.materialEn || '',
        weight: product.weight ? String(product.weight) : '',
        shippingTimeAr: product.shippingTimeAr || '',
        shippingTimeEn: product.shippingTimeEn || '',
        careAr: product.careAr || '',
        careEn: product.careEn || '',
        returnPolicyAr: product.returnPolicyAr || '',
        returnPolicyEn: product.returnPolicyEn || '',
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
      })
    } else {
      setEditingProduct(null)
      setProductForm(defaultProductForm)
    }
    // Open Sheet on mobile, Dialog on desktop
    setProductSheetOpen(true)
    setProductDialogOpen(true)
  }

  const saveProduct = async () => {
    try {
      const payload = {
        nameAr: productForm.nameAr,
        nameEn: productForm.nameEn,
        subtitleAr: productForm.subtitleAr || undefined,
        subtitleEn: productForm.subtitleEn || undefined,
        descriptionAr: productForm.descriptionAr || undefined,
        descriptionEn: productForm.descriptionEn || undefined,
        brand: productForm.brand || undefined,
        sku: productForm.sku || undefined,
        price: productForm.price,
        discount: productForm.discount,
        stock: productForm.stock,
        featured: productForm.featured,
        active: productForm.active,
        isNew: productForm.isNew,
        freeShipping: productForm.freeShipping,
        freeShippingThreshold: productForm.freeShippingThreshold ? parseFloat(String(productForm.freeShippingThreshold)) : undefined,
        badgeTextAr: productForm.badgeTextAr || undefined,
        badgeTextEn: productForm.badgeTextEn || undefined,
        minOrderQty: productForm.minOrderQty || 1,
        maxOrderQty: productForm.maxOrderQty ? parseInt(String(productForm.maxOrderQty)) : undefined,
        categoryId: productForm.categoryId,
        images: productForm.images ? productForm.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
        sizes: productForm.sizes ? productForm.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
        colors: productForm.colors ? productForm.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
        videoUrl: productForm.videoUrl || undefined,
        tags: productForm.tags ? productForm.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
        materialAr: productForm.materialAr || undefined,
        materialEn: productForm.materialEn || undefined,
        weight: productForm.weight ? parseFloat(String(productForm.weight)) : undefined,
        shippingTimeAr: productForm.shippingTimeAr || undefined,
        shippingTimeEn: productForm.shippingTimeEn || undefined,
        careAr: productForm.careAr || undefined,
        careEn: productForm.careEn || undefined,
        returnPolicyAr: productForm.returnPolicyAr || undefined,
        returnPolicyEn: productForm.returnPolicyEn || undefined,
        metaTitle: productForm.metaTitle || undefined,
        metaDescription: productForm.metaDescription || undefined,
      }

      let res: Response
      if (editingProduct) {
        res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (data.success) {
        toast.success(editingProduct ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح')
        setProductDialogOpen(false)
        setProductSheetOpen(false)
        fetchProducts()
      } else {
        toast.error(data.error || 'فشل حفظ المنتج')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحفظ')
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('تم حذف المنتج بنجاح')
        fetchProducts()
      } else {
        toast.error(data.error || 'فشل حذف المنتج')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحذف')
    }
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  const toggleProductFeatured = async (product: ProductItem) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !product.featured }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(product.featured ? 'تم إزالة المنتج من المميزة' : 'تم تمييز المنتج')
        fetchProducts()
      }
    } catch {
      toast.error('فشل تحديث الحالة')
    }
  }

  const toggleProductActive = async (product: ProductItem) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !product.active }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(product.active ? 'تم إلغاء تفعيل المنتج' : 'تم تفعيل المنتج')
        fetchProducts()
      }
    } catch {
      toast.error('فشل تحديث الحالة')
    }
  }

  // ─── Category CRUD ─────────────────────────────────────────────────────

  const openCategoryDialog = (category?: CategoryItem) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        slug: category.slug,
        image: category.image || '',
        description: category.description || '',
        order: category.order,
      })
    } else {
      setEditingCategory(null)
      setCategoryForm(defaultCategoryForm)
    }
    setCategorySheetOpen(true)
    setCategoryDialogOpen(true)
  }

  const saveCategory = async () => {
    try {
      const payload = {
        nameAr: categoryForm.nameAr,
        nameEn: categoryForm.nameEn,
        slug: categoryForm.slug,
        image: categoryForm.image || undefined,
        description: categoryForm.description || undefined,
        order: categoryForm.order,
      }

      let res: Response
      if (editingCategory) {
        res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (data.success) {
        toast.success(editingCategory ? 'تم تحديث الفئة بنجاح' : 'تم إضافة الفئة بنجاح')
        setCategoryDialogOpen(false)
        setCategorySheetOpen(false)
        fetchCategories()
      } else {
        toast.error(data.error || 'فشل حفظ الفئة')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحفظ')
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('تم حذف الفئة بنجاح')
        fetchCategories()
      } else {
        toast.error(data.error || 'فشل حذف الفئة')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحذف')
    }
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  const moveCategoryOrder = async (category: CategoryItem, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((c) => c.id === category.id)
    if (direction === 'up' && idx <= 0) return
    if (direction === 'down' && idx >= sorted.length - 1) return

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const swapCategory = sorted[swapIdx]

    try {
      await Promise.all([
        fetch(`/api/admin/categories/${category.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: swapCategory.order }),
        }),
        fetch(`/api/admin/categories/${swapCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: category.order }),
        }),
      ])
      toast.success('تم إعادة ترتيب الفئات')
      fetchCategories()
    } catch {
      toast.error('فشل إعادة الترتيب')
    }
  }

  // ─── Order / User Updates ──────────────────────────────────────────────

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('تم تحديث حالة الطلب')
        fetchOrders()
        setOrderDetailSheet((prev) => prev ? { ...prev, status } : null)
      } else {
        toast.error(data.error || 'فشل تحديث الحالة')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const openOrderDetail = (order: Record<string, unknown>) => {
    setOrderDetailSheet(order)
    setOrderDetailDialog(true)
    setDeliveryNotesText((order.deliveryNotes as string) || '')
  }

  const saveDeliveryNotes = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryNotes: deliveryNotesText }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('تم حفظ ملاحظات التوصيل')
        fetchOrders()
        setOrderDetailSheet((prev) => prev ? { ...prev, deliveryNotes: deliveryNotesText } : null)
      } else {
        toast.error(data.error || 'فشل حفظ الملاحظات')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('تم تحديث دور المستخدم')
        fetchUsers()
      } else {
        toast.error(data.error || 'فشل التحديث')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const toggleUserBan = async (userId: string, banned: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(banned ? 'تم حظر المستخدم' : 'تم إلغاء حظر المستخدم')
        fetchUsers()
      } else {
        toast.error(data.error || 'فشل التحديث')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }



  // ─── Delete Handler ────────────────────────────────────────────────────

  const handleDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'product') deleteProduct(deleteTarget.id)
    else if (deleteTarget.type === 'category') deleteCategory(deleteTarget.id)
  }

  const confirmDelete = (type: 'product' | 'category', id: string, name: string) => {
    setDeleteTarget({ type, id, name })
    setDeleteDialogOpen(true)
  }

  // ─── Filtered Products ─────────────────────────────────────────────────

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase()
    return p.nameAr.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q)
  })

  // ─── Guard ─────────────────────────────────────────────────────────────

  if (!isAdmin()) return null

  // ─── Render ────────────────────────────────────────────────────────────


  // ─── Render Content Function ──────────────────────────────────────────
  function renderContent(isMobile: boolean) {
    return (
      <>
        {/* ═══════════ DASHBOARD TAB ═══════════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {loading ? (
              <>
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-3 md:gap-4`}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 md:h-32 rounded-2xl" />
                  ))}
                </div>
                <Skeleton className="h-80 rounded-2xl" />
              </>
            ) : stats ? (
              <>
                {/* Stat Cards - 2 per row on mobile, 4 on desktop */}
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-3 md:gap-4`}>
                  <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] md:text-xs text-muted-foreground mb-1">إجمالي الطلبات</p>
                          <p className="text-xl md:text-2xl font-bold">{stats.totalOrders}</p>
                        </div>
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 dark:bg-[#D4A574]/10 flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-primary dark:text-[#E8C9A0]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 md:mt-3 text-[10px] md:text-xs">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-green-500 font-medium">+12%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] md:text-xs text-muted-foreground mb-1">إجمالي الإيرادات</p>
                          <p className="text-xl md:text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                        </div>
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 md:mt-3 text-[10px] md:text-xs">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-green-500 font-medium">+8.5%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] md:text-xs text-muted-foreground mb-1">المستخدمون</p>
                          <p className="text-xl md:text-2xl font-bold">{stats.totalUsers}</p>
                        </div>
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 dark:bg-[#D4A574]/10 flex items-center justify-center">
                          <Users className="h-5 w-5 md:h-6 md:w-6 text-primary dark:text-[#E8C9A0]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 md:mt-3 text-[10px] md:text-xs">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-green-500 font-medium">+3%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] md:text-xs text-muted-foreground mb-1">المنتجات</p>
                          <p className="text-xl md:text-2xl font-bold">{stats.totalProducts}</p>
                        </div>
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 dark:bg-[#D4A574]/10 flex items-center justify-center">
                          <Package className="h-5 w-5 md:h-6 md:w-6 text-primary dark:text-[#E8C9A0]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 md:mt-3 text-[10px] md:text-xs">
                        <TrendingDown className="h-3 w-3 text-orange-500 dark:text-orange-400" />
                        <span className="text-orange-500 dark:text-orange-400 font-medium">-2%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Stats Summary */}
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-3`}>
                  <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-primary">{stats.recentOrders?.length || 0}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">طلبات حديثة</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {stats.recentOrders?.filter((o) => o.status === 'delivered').length || 0}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">طلبات مكتملة</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      {stats.recentOrders?.filter((o) => o.status === 'pending').length || 0}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">بانتظار المراجعة</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {stats.recentOrders?.filter((o) => o.status === 'cancelled').length || 0}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">طلبات ملغية</p>
                  </div>
                </div>

                {/* Charts */}
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
                  <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm md:text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        الإيرادات الشهرية
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 md:h-64 overflow-x-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.monthlyRevenue || []} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <defs>
                              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                              dataKey="month"
                              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip content={<RevenueTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="revenue"
                              stroke="var(--color-primary)"
                              strokeWidth={2.5}
                              fill="url(#revenueGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm md:text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        عدد الطلبات الشهرية
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 md:h-64 overflow-x-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={(stats.monthlyRevenue || []).map((m) => ({
                            month: m.month,
                            orders: Math.max(1, Math.round(m.revenue / 200)),
                          }))} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                              dataKey="month"
                              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip content={<OrdersTooltip />} />
                            <Bar dataKey="orders" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Products + Recent Orders */}
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
                  <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
                    <CardHeader>
                      <CardTitle className="text-sm md:text-base flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        المنتجات الأكثر مبيعاً
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(stats.topProducts && stats.topProducts.length > 0) ? (
                        <div className="space-y-3">
                          {stats.topProducts.slice(0, 5).map((product, idx) => {
                            const images = getImagesArray(product.images)
                            return (
                              <div key={product.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/50 transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 dark:bg-[#D4A574]/10 flex items-center justify-center text-sm font-bold text-primary dark:text-[#E8C9A0]">
                                  {idx + 1}
                                </div>
                                {images[0] ? (
                                  <img
                                    src={images[0]}
                                    alt={product.nameAr}
                                    className="h-10 w-10 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{product.nameAr}</p>
                                  <p className="text-xs text-muted-foreground">{formatCurrency(product.price)}</p>
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-bold text-primary dark:text-[#E8C9A0]">{product._count?.orderItems || 0}</p>
                                  <p className="text-xs text-muted-foreground">مبيعات</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">لا توجد مبيعات بعد</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
                    <CardHeader>
                      <CardTitle className="text-sm md:text-base flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        آخر الطلبات
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-[10px] md:text-xs">رقم الطلب</TableHead>
                              <TableHead className="text-[10px] md:text-xs">العميل</TableHead>
                              <TableHead className="text-[10px] md:text-xs">المبلغ</TableHead>
                              <TableHead className="text-[10px] md:text-xs">الحالة</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(stats.recentOrders || []).slice(0, 5).map((order) => {
                              const st = statusMap[order.status] || statusMap.pending
                              return (
                                <TableRow key={order.id}>
                                  <TableCell className="font-medium text-[10px] md:text-xs">#{order.id.slice(-6).toUpperCase()}</TableCell>
                                  <TableCell className="text-[10px] md:text-xs">{order.customerName}</TableCell>
                                  <TableCell className="text-[10px] md:text-xs">{formatCurrency(order.total)}</TableCell>
                                  <TableCell>
                                    <Badge className={`${st.color} text-[9px] md:text-[10px] px-1.5 py-0`}>{st.label}</Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ═══════════ ANALYTICS TAB ═══════════ */}
        {activeTab === 'analytics' && (
          <AnalyticsTab isMobile={isMobile} />
        )}

        {/* ═══════════ DISCOUNTS TAB ═══════════ */}
        {activeTab === 'discounts' && (
          <DiscountsTab isMobile={isMobile} />
        )}

        {/* ═══════════ SHIPPING TAB ═══════════ */}
        {activeTab === 'shipping' && (
          <ShippingTab isMobile={isMobile} />
        )}

        {/* ═══════════ BANNERS TAB ═══════════ */}
        {activeTab === 'banners' && (
          <BannersTab isMobile={isMobile} />
        )}

        {/* ═══════════ NOTIFICATIONS TAB ═══════════ */}
        {activeTab === 'notifications' && (
          <NotificationsTab isMobile={isMobile} />
        )}

        {/* ═══════════ PRODUCTS TAB ═══════════ */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9 rounded-xl"
                  />
                </div>
              </div>
              <Button onClick={() => openProductDialog()} className="hidden md:flex gap-2 rounded-xl bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                إضافة منتج
              </Button>
            </div>

            {/* Mobile Product Cards */}
            {isMobile && (
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">لا توجد منتجات</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openProductDialog()}
                      className="mt-3 gap-1 rounded-xl"
                    >
                      <Plus className="h-3 w-3" />
                      إضافة أول منتج
                    </Button>
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const images = getImagesArray(product.images)
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card dark:bg-[#231F1C] border border-border/50 dark:border-[#3A3532]/60 rounded-2xl p-4 dark-glow-card"
                      >
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted">
                            {images[0] ? (
                              <img src={images[0]} alt={product.nameAr} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{product.nameAr}</p>
                                <p className="text-xs text-muted-foreground truncate">{product.nameEn}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openProductDialog(product)}
                                  className="h-8 w-8 p-0 touch-target"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => confirmDelete('product', product.id, product.nameAr)}
                                  className="h-8 w-8 p-0 text-red-500 dark:text-red-400 touch-target"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-sm font-bold">{formatCurrency(product.price)}</span>
                              {product.discount > 0 && (
                                <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] px-1.5 py-0">
                                  خصم {product.discount}%
                                </Badge>
                              )}
                              <Badge
                                variant={product.stock > 10 ? 'secondary' : product.stock > 0 ? 'outline' : 'destructive'}
                                className="text-[10px] px-1.5 py-0"
                              >
                                {product.stock} مخزون
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1.5">
                                <Switch
                                  checked={product.featured}
                                  onCheckedChange={() => toggleProductFeatured(product)}
                                  className="scale-75"
                                />
                                <span className="text-[10px] text-muted-foreground">مميز</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Switch
                                  checked={product.active}
                                  onCheckedChange={() => toggleProductActive(product)}
                                  className="scale-75"
                                />
                                <span className="text-[10px] text-muted-foreground">نشط</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            )}

            {/* Desktop Products Table */}
            {!isMobile && (
              <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-6 space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 rounded-lg" />
                      ))}
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">لا توجد منتجات</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProductDialog()}
                        className="mt-3 gap-1 rounded-xl"
                      >
                        <Plus className="h-3 w-3" />
                        إضافة أول منتج
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">الصورة</TableHead>
                            <TableHead className="text-xs">اسم المنتج</TableHead>
                            <TableHead className="text-xs">السعر</TableHead>
                            <TableHead className="text-xs">المخزون</TableHead>
                            <TableHead className="text-xs">الفئة</TableHead>
                            <TableHead className="text-xs">مميز</TableHead>
                            <TableHead className="text-xs">الحالة</TableHead>
                            <TableHead className="text-xs">إجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProducts.map((product) => {
                            const images = getImagesArray(product.images)
                            return (
                              <TableRow key={product.id}>
                                <TableCell>
                                  {images[0] ? (
                                    <img src={images[0]} alt={product.nameAr} className="h-10 w-10 rounded-lg object-cover" />
                                  ) : (
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                      <Package className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-sm font-medium">{product.nameAr}</p>
                                    <p className="text-xs text-muted-foreground">{product.nameEn}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-sm font-bold">{formatCurrency(product.price)}</p>
                                    {product.discount > 0 && (
                                      <p className="text-xs text-green-600 dark:text-green-400">خصم {product.discount}%</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={product.stock > 10 ? 'secondary' : product.stock > 0 ? 'outline' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {product.stock}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs">
                                  {product.category?.nameAr || '—'}
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    checked={product.featured}
                                    onCheckedChange={() => toggleProductFeatured(product)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    checked={product.active}
                                    onCheckedChange={() => toggleProductActive(product)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => openProductDialog(product)} className="h-8 w-8 p-0">
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => confirmDelete('product', product.id, product.nameAr)}
                                      className="h-8 w-8 p-0 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ═══════════ ORDERS TAB ═══════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Refresh button */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                إدارة الطلبات
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders()}
                className="gap-1.5 rounded-xl text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                تحديث
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">لا توجد طلبات بعد</p>
              </div>
            ) : isMobile ? (
              /* Mobile Order Cards */
              <div className="space-y-3">
                {orders.map((order) => {
                  const st = statusMap[(order.status as string)] || statusMap.pending
                  return (
                    <motion.div
                      key={order.id as string}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => openOrderDetail(order)}
                      className="bg-card dark:bg-[#231F1C] border border-border/50 dark:border-[#3A3532]/60 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform dark-glow-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">#{(order.id as string).slice(-6).toUpperCase()}</span>
                          <Badge className={`${st.color} text-[9px] px-1.5 py-0`}>{st.label}</Badge>
                        </div>
                        <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">{order.customerName as string}</p>
                        </div>
                        <p className="text-sm font-bold">{formatCurrency(order.total as number)}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(order.createdAt as string).toLocaleDateString('ar-SA')}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              /* Desktop Orders Table */
              <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">رقم الطلب</TableHead>
                          <TableHead className="text-xs">العميل</TableHead>
                          <TableHead className="text-xs">الهاتف</TableHead>
                          <TableHead className="text-xs">المبلغ</TableHead>
                          <TableHead className="text-xs">طريقة الدفع</TableHead>
                          <TableHead className="text-xs">الحالة</TableHead>
                          <TableHead className="text-xs">التاريخ</TableHead>
                          <TableHead className="text-xs">تحديث الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => {
                          const st = statusMap[(order.status as string)] || statusMap.pending
                          return (
                            <TableRow
                              key={order.id as string}
                              className="cursor-pointer hover:bg-muted/50 dark:hover:bg-[#2A2522]/50"
                              onClick={() => openOrderDetail(order)}
                            >
                              <TableCell className="font-medium text-xs">#{(order.id as string).slice(-6).toUpperCase()}</TableCell>
                              <TableCell className="text-xs">{order.customerName as string}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{(order.customerPhone as string) || '—'}</TableCell>
                              <TableCell className="text-xs font-medium">{formatCurrency(order.total as number)}</TableCell>
                              <TableCell className="text-xs">
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                  {paymentMethodLabels[(order.paymentMethod as string)] || 'عند الاستلام'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${st.color} text-[10px] px-1.5 py-0`}>{st.label}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-[10px]">
                                {new Date(order.createdAt as string).toLocaleDateString('ar-SA')}
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value={order.status as string}
                                  onValueChange={(value) => updateOrderStatus(order.id as string, value)}
                                >
                                  <SelectTrigger className="w-32 h-8 text-xs rounded-lg">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                                    <SelectItem value="confirmed">مؤكد</SelectItem>
                                    <SelectItem value="shipped">تم الشحن</SelectItem>
                                    <SelectItem value="delivered">تم التوصيل</SelectItem>
                                    <SelectItem value="cancelled">ملغي</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ═══════════ USERS TAB ═══════════ */}
        {activeTab === 'users' && (
          <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                إدارة المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">لا يوجد مستخدمون</p>
                </div>
              ) : isMobile ? (
                /* Mobile User Cards */
                <div className="space-y-3">
                  {users.map((u) => (
                    <div key={u.id as string} className="bg-muted/30 dark:bg-[#2A2522]/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{u.name as string}</p>
                        <Badge
                          variant={u.banned ? 'destructive' : 'secondary'}
                          className="text-[9px] px-1.5 py-0"
                        >
                          {u.banned ? 'محظور' : 'نشط'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{u.email as string}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">الدور:</span>
                          <Select
                            value={u.role as string}
                            onValueChange={(value) => updateUserRole(u.id as string, value)}
                          >
                            <SelectTrigger className="w-24 h-7 text-[10px] rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">مستخدم</SelectItem>
                              <SelectItem value="admin">مدير</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserBan(u.id as string, !u.banned)}
                          className={`h-8 text-xs rounded-lg touch-target ${u.banned ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}
                        >
                          {u.banned ? 'إلغاء الحظر' : 'حظر'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">الاسم</TableHead>
                        <TableHead className="text-xs">البريد الإلكتروني</TableHead>
                        <TableHead className="text-xs">الدور</TableHead>
                        <TableHead className="text-xs">الحالة</TableHead>
                        <TableHead className="text-xs">تاريخ التسجيل</TableHead>
                        <TableHead className="text-xs">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id as string}>
                          <TableCell className="font-medium text-sm">{u.name as string}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{u.email as string}</TableCell>
                          <TableCell>
                            <Select
                              value={u.role as string}
                              onValueChange={(value) => updateUserRole(u.id as string, value)}
                            >
                              <SelectTrigger className="w-24 h-7 text-xs rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">مستخدم</SelectItem>
                                <SelectItem value="admin">مدير</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.banned ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                              {u.banned ? 'محظور' : 'نشط'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[10px] text-muted-foreground">
                            {new Date(u.createdAt as string).toLocaleDateString('ar-SA')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserBan(u.id as string, !u.banned)}
                              className={`h-7 text-xs rounded-lg ${u.banned ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}
                            >
                              {u.banned ? 'إلغاء الحظر' : 'حظر'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ═══════════ CATEGORIES TAB ═══════════ */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">إدارة الفئات</h2>
              <Button onClick={() => openCategoryDialog()} className="gap-2 rounded-xl bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">إضافة فئة</span>
                <span className="sm:hidden">إضافة</span>
              </Button>
            </div>

            {loading ? (
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60">
                <CardContent className="text-center py-16 text-muted-foreground">
                  <Tags className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">لا توجد فئات</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCategoryDialog()}
                    className="mt-3 gap-1 rounded-xl"
                  >
                    <Plus className="h-3 w-3" />
                    إضافة أول فئة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
                {[...categories]
                  .sort((a, b) => a.order - b.order)
                  .map((category) => (
                    <Card key={category.id} className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 overflow-hidden dark-glow-card">
                      <div className={`flex ${isMobile ? 'flex-row' : 'flex-row'}`}>
                        <div className="w-20 md:w-28 shrink-0">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.nameAr}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted dark:bg-[#2A2522] flex items-center justify-center">
                              <Tags className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-3 md:p-4">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm truncate">{category.nameAr}</h3>
                              <p className="text-[10px] md:text-xs text-muted-foreground truncate">{category.nameEn}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">/{category.slug}</p>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveCategoryOrder(category, 'up')}
                                className="h-7 w-7 p-0 touch-target"
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveCategoryOrder(category, 'down')}
                                className="h-7 w-7 p-0 touch-target"
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 md:mt-3">
                            <Badge variant="secondary" className="text-[9px] md:text-[10px]">
                              {category._count?.products || 0} منتج
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openCategoryDialog(category)}
                                className="h-7 w-7 p-0 touch-target"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => confirmDelete('category', category.id, category.nameAr)}
                                className="h-7 w-7 p-0 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 touch-target"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ SETTINGS TAB ═══════════ */}
        {activeTab === 'settings' && <SettingsTab isMobile={isMobile} />}

        {/* ═══════════ HOMEPAGE TAB ═══════════ */}
        {activeTab === 'messages' && (
          <MessagesTab isMobile={isMobile} />
        )}

        {/* ═══════════ REVIEWS TAB ═══════════ */}
        {activeTab === 'reviews' && (
          <ReviewsTab isMobile={isMobile} />
        )}

        {activeTab === 'homepage' && (
          <HomepageTab isMobile={isMobile} />
        )}
      </>
    )
  }

  return (
    <div className="pt-6 pb-24 md:pb-16 min-h-screen relative">
      {/* Dark mode background pattern */}
      <div className="absolute inset-0 -z-10 hidden dark:block dark-dot-pattern opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground mt-1 text-sm">إدارة متجر DONATELLA</p>
          </div>
          <Button variant="outline" onClick={() => setPage('home')} className="gap-2 rounded-xl text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">العودة للمتجر</span>
            <span className="sm:hidden">العودة</span>
          </Button>
        </motion.div>

        {/* ═══ Mobile Horizontal Tab Bar ═══ */}
        <div className="md:hidden mb-6 -mx-4 px-4">
          <div className="flex gap-1.5 overflow-x-auto admin-tab-scroll pb-2">
            {adminTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearchQuery('') }}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 touch-target ${
                  activeTab === tab.key
                    ? 'bg-primary/10 text-primary shadow-sm dark:bg-[#D4A574]/10 dark:text-[#E8C9A0]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {tab.icon}
                {tab.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="w-60 shrink-0">
            <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 overflow-hidden dark-glow-card">
              <CardContent className="p-2 max-h-[75vh] overflow-y-auto">
                <nav className="flex flex-col gap-1">
                  {adminTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => { setActiveTab(tab.key); setSearchQuery('') }}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                        activeTab === tab.key
                          ? 'bg-primary/10 text-primary shadow-sm dark:bg-[#D4A574]/10 dark:text-[#E8C9A0]'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Desktop Content */}
          <div className="flex-1 min-w-0">
            {renderContent(false)}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="md:hidden">
          {renderContent(true)}
        </div>
      </div>

      {/* ═══ FAB (Floating Action Button) for Products Tab on Mobile ═══ */}
      <AnimatePresence>
        {activeTab === 'products' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => openProductDialog()}
            className="md:hidden fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-[#D4A574] to-[#b8885a] text-white shadow-xl shadow-[#D4A574]/30 flex items-center justify-center fab-bounce dark-gold-pulse"
            aria-label="إضافة منتج جديد"
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══ Product Sheet (Mobile) ═══ */}
      <Sheet open={productSheetOpen} onOpenChange={setProductSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-3xl" dir="rtl">
          <SheetHeader>
            <SheetTitle>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</SheetTitle>
            <SheetDescription>
              {editingProduct ? 'قم بتعديل بيانات المنتج' : 'أدخل بيانات المنتج الجديد'}
            </SheetDescription>
          </SheetHeader>
          <ProductForm
            productForm={productForm}
            setProductForm={setProductForm}
            categories={categories}
            isSheet
          />
          <SheetFooter className="flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setProductSheetOpen(false)} className="rounded-xl flex-1">
              إلغاء
            </Button>
            <Button
              onClick={saveProduct}
              className="rounded-xl bg-primary hover:bg-primary/90 flex-1"
              disabled={!productForm.nameAr || !productForm.nameEn || !productForm.categoryId}
            >
              {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ═══ Product Dialog (Desktop) ═══ */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto hidden md:block" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'قم بتعديل بيانات المنتج' : 'أدخل بيانات المنتج الجديد'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            productForm={productForm}
            setProductForm={setProductForm}
            categories={categories}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setProductDialogOpen(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={saveProduct}
              className="rounded-xl bg-primary hover:bg-primary/90"
              disabled={!productForm.nameAr || !productForm.nameEn || !productForm.categoryId}
            >
              {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Category Sheet (Mobile) ═══ */}
      <Sheet open={categorySheetOpen} onOpenChange={setCategorySheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto rounded-t-3xl" dir="rtl">
          <SheetHeader>
            <SheetTitle>{editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</SheetTitle>
            <SheetDescription>
              {editingCategory ? 'قم بتعديل بيانات الفئة' : 'أدخل بيانات الفئة الجديدة'}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="catNameAr">الاسم بالعربية *</Label>
              <Input
                id="catNameAr"
                value={categoryForm.nameAr}
                onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catNameEn">الاسم بالإنجليزية *</Label>
              <Input
                id="catNameEn"
                value={categoryForm.nameEn}
                onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                className="rounded-xl"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catSlug">الرابط (Slug) *</Label>
              <Input
                id="catSlug"
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                placeholder="e.g. dresses"
                className="rounded-xl"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catImage">رابط الصورة</Label>
              <Input
                id="catImage"
                value={categoryForm.image}
                onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                placeholder="/products/image.jpg"
                className="rounded-xl"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catDesc">الوصف</Label>
              <Textarea
                id="catDesc"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="rounded-xl"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catOrder">الترتيب</Label>
              <Input
                id="catOrder"
                type="number"
                min={0}
                value={categoryForm.order}
                onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                className="rounded-xl"
                dir="ltr"
              />
            </div>
          </div>
          <SheetFooter className="flex-row gap-2">
            <Button variant="outline" onClick={() => setCategorySheetOpen(false)} className="rounded-xl flex-1">
              إلغاء
            </Button>
            <Button
              onClick={saveCategory}
              className="rounded-xl bg-primary hover:bg-primary/90 flex-1"
              disabled={!categoryForm.nameAr || !categoryForm.nameEn || !categoryForm.slug}
            >
              {editingCategory ? 'حفظ التعديلات' : 'إضافة الفئة'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ═══ Category Dialog (Desktop) ═══ */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-lg hidden md:block" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'قم بتعديل بيانات الفئة' : 'أدخل بيانات الفئة الجديدة'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="catNameAr">الاسم بالعربية *</Label>
                <Input
                  id="catNameAr"
                  value={categoryForm.nameAr}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catNameEn">الاسم بالإنجليزية *</Label>
                <Input
                  id="catNameEn"
                  value={categoryForm.nameEn}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                  className="rounded-xl"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="catSlug">الرابط (Slug) *</Label>
              <Input
                id="catSlug"
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                placeholder="e.g. dresses"
                className="rounded-xl"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catImage">رابط الصورة</Label>
              <Input
                id="catImage"
                value={categoryForm.image}
                onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                placeholder="/products/image.jpg"
                className="rounded-xl"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catDesc">الوصف</Label>
              <Textarea
                id="catDesc"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="rounded-xl"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catOrder">الترتيب</Label>
              <Input
                id="catOrder"
                type="number"
                min={0}
                value={categoryForm.order}
                onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                className="rounded-xl"
                dir="ltr"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={saveCategory}
              className="rounded-xl bg-primary hover:bg-primary/90"
              disabled={!categoryForm.nameAr || !categoryForm.nameEn || !categoryForm.slug}
            >
              {editingCategory ? 'حفظ التعديلات' : 'إضافة الفئة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Order Detail Dialog ═══ */}
      <Dialog open={orderDetailDialog} onOpenChange={(open) => { if (!open) { setOrderDetailDialog(false); setOrderDetailSheet(null) } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" dir="rtl">
          {orderDetailSheet && (() => {
            const order = orderDetailSheet
            const st = statusMap[(order.status as string)] || statusMap.pending
            const orderItems = (order.orderItems as Array<Record<string, unknown>> | undefined) || []
            const orderUser = order.user as Record<string, unknown> | undefined
            const subtotal = orderItems.reduce((sum, item) => sum + ((item.price as number) || 0) * ((item.quantity as number) || 1), 0)

            return (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-[#D4A574]" />
                      تفاصيل الطلب #{(order.id as string)?.slice(-6).toUpperCase()}
                    </DialogTitle>
                    <Badge className={`${st.color} text-xs px-2 py-0.5`}>{st.label}</Badge>
                  </div>
                  <DialogDescription className="sr-only">
                    تفاصيل الطلب من {order.customerName as string}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 mt-2">
                  {/* ─── Customer Info Section ─── */}
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-[#D4A574]/10 flex items-center justify-center">
                        <Users className="h-3.5 w-3.5 text-[#D4A574]" />
                      </div>
                      بيانات العميل
                    </h3>
                    <div className="p-4 rounded-xl bg-muted/40 dark:bg-[#2A2522]/50 border border-border/30 dark:border-[#3A3532]/40">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5">الاسم</p>
                          <p className="text-sm font-semibold text-foreground">{order.customerName as string}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5">رقم الهاتف</p>
                          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5" dir="ltr">
                            <Phone className="h-3 w-3 text-[#D4A574]" />
                            {(order.customerPhone as string) || '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5">البريد الإلكتروني</p>
                          <p className="text-sm font-medium text-foreground flex items-center gap-1.5" dir="ltr">
                            <Mail className="h-3 w-3 text-[#D4A574]" />
                            {(orderUser?.email as string) || '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5">طريقة الدفع</p>
                          <Badge variant="outline" className="text-[11px] px-2 py-0.5 bg-green-50 dark:bg-green-900/10 border-green-200/50 dark:border-green-700/30 text-green-700 dark:text-green-400">
                            {paymentMethodLabels[(order.paymentMethod as string)] || 'عند الاستلام'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5">حساب مسجّل</p>
                          <p className="text-sm font-medium text-foreground">
                            {orderUser?.name ? (
                              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-[10px]">نعم — {orderUser.name as string}</Badge>
                            ) : (
                              <Badge className="bg-muted text-muted-foreground text-[10px]">زائر</Badge>
                            )}
                          </p>
                        </div>
                        {orderUser && (orderUser.phone as string) && (
                          <div>
                            <p className="text-[11px] text-muted-foreground mb-0.5">هاتف الحساب</p>
                            <p className="text-sm font-medium text-foreground" dir="ltr">{orderUser.phone as string}</p>
                          </div>
                        )}
                        <div className="col-span-2">
                          <p className="text-[11px] text-muted-foreground mb-0.5">عنوان التوصيل</p>
                          <p className="text-sm font-medium text-foreground bg-muted/50 dark:bg-[#1A1614]/50 p-2.5 rounded-lg flex items-start gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[#D4A574] mt-0.5 shrink-0" />
                            {(order.address as string) || '—'}
                          </p>
                        </div>
                        {(order.notes as string) && (
                          <div className="col-span-2">
                            <p className="text-[11px] text-muted-foreground mb-0.5">ملاحظات التوصيل (من العميل)</p>
                            <p className="text-sm text-foreground bg-yellow-50 dark:bg-yellow-900/10 p-2.5 rounded-lg border border-yellow-200/50 dark:border-yellow-700/30">
                              📝 {order.notes as string}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="dark:bg-[#3A3532]/60" />

                  {/* ─── Order Items Section ─── */}
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-[#D4A574]/10 flex items-center justify-center">
                        <Package className="h-3.5 w-3.5 text-[#D4A574]" />
                      </div>
                      المنتجات المطلوبة
                      <span className="text-xs font-normal text-muted-foreground">({orderItems.length} منتج)</span>
                    </h3>

                    {orderItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        لا توجد منتجات في هذا الطلب
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {orderItems.map((item, idx) => {
                          const product = item.product as Record<string, unknown> | null
                          const productImages = product?.images as string | string[] | undefined
                          let imgSrc = '/products/placeholder.png'
                          if (productImages) {
                            if (Array.isArray(productImages) && productImages.length > 0) {
                              imgSrc = productImages[0]
                            } else if (typeof productImages === 'string') {
                              try {
                                const parsed = JSON.parse(productImages)
                                if (Array.isArray(parsed) && parsed.length > 0) imgSrc = parsed[0]
                              } catch { /* keep default */ }
                            }
                          }
                          const itemTotal = ((item.price as number) || 0) * ((item.quantity as number) || 1)

                          return (
                            <div
                              key={(item.id as string) || idx}
                              className="flex gap-3 p-3 rounded-xl bg-muted/30 dark:bg-[#1A1614]/40 border border-border/20 dark:border-[#3A3532]/30 hover:border-[#D4A574]/20 transition-colors"
                            >
                              {/* Product Image */}
                              <div className="shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-muted border border-border/30">
                                <img
                                  src={imgSrc}
                                  alt={(product?.nameAr as string) || 'منتج'}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground line-clamp-1">
                                      {(product?.nameAr as string) || 'منتج محذوف'}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-1" dir="ltr">
                                      {(product?.nameEn as string) || ''}
                                    </p>
                                  </div>
                                  <p className="text-sm font-bold text-[#D4A574] shrink-0">
                                    {formatCurrency(itemTotal)}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-muted-foreground">السعر:</span>
                                    <span className="text-xs font-medium text-foreground">{formatCurrency((item.price as number) || 0)}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-muted-foreground">الكمية:</span>
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                      ×{((item.quantity as number) || 1)}
                                    </Badge>
                                  </div>
                                  {(item.size as string) && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] text-muted-foreground">المقاس:</span>
                                      <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                        {item.size as string}
                                      </Badge>
                                    </div>
                                  )}
                                  {(item.color as string) && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] text-muted-foreground">اللون:</span>
                                      <div className="flex items-center gap-1">
                                        <div
                                          className="h-3.5 w-3.5 rounded-full border border-border/50"
                                          style={{ backgroundColor: item.color as string }}
                                        />
                                        <span className="text-[10px] text-foreground">{item.color as string}</span>
                                      </div>
                                    </div>
                                  )}
                                  {product && (product.sku as string) && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] text-muted-foreground">SKU:</span>
                                      <span className="text-[10px] text-foreground font-mono" dir="ltr">{product.sku as string}</span>
                                    </div>
                                  )}
                                  {product && (product.brand as string) && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] text-muted-foreground">الماركة:</span>
                                      <span className="text-[10px] text-foreground">{product.brand as string}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <Separator className="dark:bg-[#3A3532]/60" />

                  {/* ─── Order Summary ─── */}
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-[#D4A574]/10 flex items-center justify-center">
                        <DollarSign className="h-3.5 w-3.5 text-[#D4A574]" />
                      </div>
                      ملخص الطلب
                    </h3>
                    <div className="p-4 rounded-xl bg-muted/40 dark:bg-[#2A2522]/50 border border-border/30 dark:border-[#3A3532]/40">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">المجموع الفرعي</span>
                          <span className="text-sm font-medium text-foreground">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">الشحن</span>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            {(order.total as number) > subtotal ? formatCurrency((order.total as number) - subtotal) : 'مجاني'}
                          </span>
                        </div>
                        <Separator className="dark:bg-[#3A3532]/60" />
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-foreground">الإجمالي</span>
                          <span className="text-lg font-bold text-[#D4A574]">{formatCurrency(order.total as number)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="dark:bg-[#3A3532]/60" />

                  {/* ─── Delivery Notes ─── */}
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-[#D4A574]/10 flex items-center justify-center">
                        <Truck className="h-3.5 w-3.5 text-[#D4A574]" />
                      </div>
                      ملاحظات التوصيل
                    </h3>
                    <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/30 dark:border-blue-700/20">
                      <Textarea
                        value={deliveryNotesText}
                        onChange={(e) => setDeliveryNotesText(e.target.value)}
                        placeholder="أضف ملاحظات التوصيل هنا... (مثل: رقم التتبع، شركة الشحن، تعليمات خاصة)"
                        className="rounded-xl bg-white/80 dark:bg-[#1A1614]/60 border-blue-200/40 dark:border-blue-700/30 min-h-[80px] text-sm resize-y"
                        rows={3}
                      />
                      <div className="flex items-center justify-between mt-2.5">
                        <p className="text-[10px] text-muted-foreground">هذه الملاحظات للأدارة فقط ولا يراها العميل</p>
                        <button
                          onClick={() => saveDeliveryNotes(order.id as string)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4A574] text-white text-xs font-medium hover:bg-[#C4956A] transition-colors"
                        >
                          <Save className="h-3 w-3" />
                          حفظ الملاحظات
                        </button>
                      </div>
                    </div>
                  </div>

                  <Separator className="dark:bg-[#3A3532]/60" />

                  {/* ─── Order Info & Status ─── */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">رقم الطلب</p>
                      <p className="text-sm font-mono font-bold text-foreground">#{(order.id as string).slice(-6).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">تاريخ الطلب</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(order.createdAt as string).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">آخر تحديث</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(order.updatedAt as string).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-2">تحديث الحالة</p>
                      <Select
                        value={order.status as string}
                        onValueChange={(value) => {
                          updateOrderStatus(order.id as string, value)
                          setOrderDetailSheet({ ...orderDetailSheet, status: value })
                        }}
                      >
                        <SelectTrigger className="rounded-xl h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                          <SelectItem value="confirmed">مؤكد</SelectItem>
                          <SelectItem value="shipped">تم الشحن</SelectItem>
                          <SelectItem value="delivered">تم التوصيل</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* ═══ Delete Confirmation ═══ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف &quot;{deleteTarget?.name}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

}
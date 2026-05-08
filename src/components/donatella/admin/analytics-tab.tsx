'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Target,
  BarChart3,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AnalyticsData {
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>
  revenueByMonth: Array<{ month: string; revenue: number; orders: number }>
  topProducts: Array<{
    id: string
    nameAr: string
    nameEn: string
    images: string | string[]
    totalSold: number
    revenue: number
  }>
  topCategories: Array<{
    id: string
    nameAr: string
    nameEn: string
    totalSold: number
    revenue: number
  }>
  conversionRate: { visitors: number; orders: number; rate: number }
  mostActiveUsers: Array<{
    id: string
    name: string
    email: string
    orderCount: number
    totalSpent: number
  }>
  orderStatusBreakdown: Array<{ status: string; count: number }>
  revenueGrowth: { thisMonth: number; lastMonth: number; growthPercent: number }
  averageOrderValue: number
}

type TimePeriod = '7d' | '30d' | '12m'

// ─── Constants ───────────────────────────────────────────────────────────────

const GOLD = '#D4A574'
const DUSTY_PINK = '#C4A4A4'
const STATUS_COLORS: Record<string, string> = {
  pending: '#eab308',
  confirmed: '#3b82f6',
  shipped: '#a855f7',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
}

const PERIOD_LABELS: Record<TimePeriod, string> = {
  '7d': '٧ أيام',
  '30d': '٣٠ يوم',
  '12m': '١٢ شهر',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `${amount.toFixed(0)} ج.م`
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toFixed(0)
}

function formatDateLabel(dateStr: string, period: TimePeriod): string {
  if (period === '12m') {
    // Already formatted as "Jan 2024" etc.
    return dateStr
  }
  const d = new Date(dateStr)
  const day = d.getDate()
  const month = d.toLocaleDateString('ar-SA', { month: 'short' })
  return `${day} ${month}`
}

// ─── Custom Chart Tooltips ───────────────────────────────────────────────────

function RevenueAreaTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}) {
  if (active && payload && payload.length) {
    const revenueData = payload.find((p) => p.name === 'الإيرادات')
    const ordersData = payload.find((p) => p.name === 'الطلبات')
    return (
      <div className="bg-background border border-border dark:border-[#3A3532] rounded-xl p-3 shadow-lg min-w-[140px]">
        <p className="text-xs text-muted-foreground mb-2 border-b border-border/50 pb-1.5">{label}</p>
        {revenueData && (
          <div className="flex items-center justify-between gap-4 mb-1">
            <span className="text-xs text-muted-foreground">الإيرادات</span>
            <span className="text-sm font-bold" style={{ color: GOLD }}>
              {formatCurrency(revenueData.value)}
            </span>
          </div>
        )}
        {ordersData && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">الطلبات</span>
            <span className="text-sm font-bold" style={{ color: DUSTY_PINK }}>
              {ordersData.value} طلب
            </span>
          </div>
        )}
      </div>
    )
  }
  return null
}

function CategoryBarTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border dark:border-[#3A3532] rounded-xl p-3 shadow-lg">
        <p className="text-sm font-bold mb-1">{payload[0].name}</p>
        <p className="text-xs text-muted-foreground">الإيرادات: {formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>
}) {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="bg-background border border-border dark:border-[#3A3532] rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.payload.fill }} />
          <span className="text-sm font-bold">{item.name}</span>
        </div>
        <p className="text-xs text-muted-foreground">{item.value} طلب</p>
      </div>
    )
  }
  return null
}

// ─── Skeleton Loaders ────────────────────────────────────────────────────────

function MetricCardSkeleton() {
  return (
    <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-24" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <Skeleton className="h-3 w-16 mt-3" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded-xl" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AnalyticsTab({ isMobile }: { isMobile: boolean }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<TimePeriod>('30d')

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/analytics')
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError('فشل تحميل البيانات')
        toast.error('فشل تحميل بيانات التحليلات')
      }
    } catch {
      setError('فشل تحميل البيانات')
      toast.error('حدث خطأ أثناء تحميل التحليلات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // ─── Derived chart data based on period ───────────────────────────────

  const revenueChartData = (() => {
    if (!data) return []
    if (period === '7d') {
      return data.revenueByDay.slice(-7).map((d) => ({
        name: formatDateLabel(d.date, period),
        الإيرادات: d.revenue,
        الطلبات: d.orders,
      }))
    }
    if (period === '30d') {
      return data.revenueByDay.map((d) => ({
        name: formatDateLabel(d.date, period),
        الإيرادات: d.revenue,
        الطلبات: d.orders,
      }))
    }
    // 12m
    return data.revenueByMonth.map((m) => ({
      name: m.month,
      الإيرادات: m.revenue,
      الطلبات: m.orders,
    }))
  })()

  // Total revenue for the selected period
  const totalRevenue = revenueChartData.reduce((sum, d) => sum + d['الإيرادات'], 0)
  const totalOrders = revenueChartData.reduce((sum, d) => sum + d['الطلبات'], 0)

  // ─── Pie chart data ───────────────────────────────────────────────────

  const pieData = (data?.orderStatusBreakdown || []).map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || '#94a3b8',
  }))

  // ─── Category bar chart data ──────────────────────────────────────────

  const categoryBarData = (data?.topCategories || []).map((cat) => ({
    name: cat.nameAr,
    الإيرادات: cat.revenue,
  }))

  // ─── Animation variants ───────────────────────────────────────────────

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ═══ Header with Period Filter ═══ */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#b8885a] flex items-center justify-center shadow-md shadow-[#D4A574]/20">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">التحليلات المتقدمة</h2>
            <p className="text-xs text-muted-foreground">تحليل شامل لأداء المتجر</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            className="rounded-xl gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <div className="flex bg-muted/50 dark:bg-[#2A2522] rounded-xl p-0.5">
            {(Object.keys(PERIOD_LABELS) as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  period === p
                    ? 'bg-background dark:bg-[#3A3532] text-foreground shadow-sm dark:text-[#E8C9A0]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ Loading State ═══ */}
      {loading && (
        <div className="space-y-6">
          <div
            className={`grid ${
              isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
            } gap-3 md:gap-4`}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
          <ChartSkeleton />
          <div
            className={`grid ${
              isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
            } gap-6`}
          >
            <TableSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      )}

      {/* ═══ Error State ═══ */}
      {!loading && !data && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-bold mb-2">
            {error || 'لا توجد بيانات متاحة'}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {error ? 'حدث خطأ أثناء تحميل بيانات التحليلات' : 'لم يتم العثور على بيانات لعرضها'}
          </p>
          <Button
            onClick={fetchAnalytics}
            className="rounded-xl gap-2"
            variant={error ? 'default' : 'outline'}
          >
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
        </motion.div>
      )}

      {/* ═══ Loaded Content ═══ */}
      {!loading && data && (
        <>
          {/* ─── 1. Metric Cards Row ─── */}
          <motion.div
            variants={itemVariants}
            className={`grid ${
              isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
            } gap-3 md:gap-4`}
          >
            {/* Total Revenue */}
            <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4A574]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-4 md:p-5 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground mb-1">إجمالي الإيرادات</p>
                    <p className="text-xl md:text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 md:mt-3">
                  {data.revenueGrowth.growthPercent >= 0 ? (
                    <>
                      <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-green-500 font-medium text-xs">
                        +{data.revenueGrowth.growthPercent.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-red-500 font-medium text-xs">
                        {data.revenueGrowth.growthPercent.toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="text-[10px] text-muted-foreground mr-1">مقارنة بالشهر السابق</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C4A4A4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-4 md:p-5 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground mb-1">إجمالي الطلبات</p>
                    <p className="text-xl md:text-2xl font-bold">{totalOrders}</p>
                  </div>
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 dark:bg-[#D4A574]/10 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-primary dark:text-[#E8C9A0]" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 md:mt-3">
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-green-500 font-medium text-xs">
                    {totalOrders > 0 ? '+' : ''}{totalOrders} طلب
                  </span>
                  <span className="text-[10px] text-muted-foreground mr-1">في الفترة المحددة</span>
                </div>
              </CardContent>
            </Card>

            {/* Average Order Value */}
            <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4A574]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-4 md:p-5 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground mb-1">متوسط قيمة الطلب</p>
                    <p className="text-xl md:text-2xl font-bold">{formatCurrency(data.averageOrderValue)}</p>
                  </div>
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Target className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 md:mt-3">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground text-xs">لكل الطلبات</span>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Rate */}
            <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C4A4A4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-4 md:p-5 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground mb-1">معدل التحويل</p>
                    <p className="text-xl md:text-2xl font-bold">{data.conversionRate.rate.toFixed(1)}%</p>
                  </div>
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Target className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 md:mt-3">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground text-xs">
                    {data.conversionRate.visitors} زائر / {data.conversionRate.orders} طلب
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── 2. Revenue Chart (AreaChart) ─── */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm md:text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#D4A574]" />
                    تطور الإيرادات
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-[#D4A574]/10 text-[#D4A574] dark:bg-[#D4A574]/20 dark:text-[#E8C9A0] border-0"
                  >
                    {PERIOD_LABELS[period]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={period}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="h-56 md:h-72"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={revenueChartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="analyticsRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={GOLD} stopOpacity={0.35} />
                            <stop offset="50%" stopColor={GOLD} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={GOLD} stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="analyticsOrdersGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={DUSTY_PINK} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={DUSTY_PINK} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.2}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                          interval={period === '7d' ? 0 : period === '30d' ? 6 : 1}
                        />
                        <YAxis
                          yAxisId="revenue"
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: number) => `${formatNumber(v)}`}
                          width={45}
                        />
                        <YAxis
                          yAxisId="orders"
                          orientation="left"
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                          width={0}
                        />
                        <Tooltip content={<RevenueAreaTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                          formatter={(value: string) => (
                            <span className="text-muted-foreground">{value}</span>
                          )}
                        />
                        <Area
                          yAxisId="revenue"
                          type="monotone"
                          dataKey="الإيرادات"
                          stroke={GOLD}
                          strokeWidth={2.5}
                          fill="url(#analyticsRevenueGrad)"
                          dot={false}
                          activeDot={{ r: 5, fill: GOLD, stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Area
                          yAxisId="orders"
                          type="monotone"
                          dataKey="الطلبات"
                          stroke={DUSTY_PINK}
                          strokeWidth={1.5}
                          fill="url(#analyticsOrdersGrad)"
                          dot={false}
                          activeDot={{ r: 4, fill: DUSTY_PINK, stroke: '#fff', strokeWidth: 2 }}
                          strokeDasharray="5 3"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── 3. Top Products + Order Status Pie ─── */}
          <motion.div
            variants={itemVariants}
            className={`grid ${
              isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
            } gap-6`}
          >
            {/* Left: Top Products Table */}
            <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#D4A574]" />
                  المنتجات الأكثر مبيعاً
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.topProducts.length > 0 ? (
                  <div className="overflow-x-auto max-h-80 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">#</TableHead>
                          <TableHead className="text-xs">المنتج</TableHead>
                          <TableHead className="text-xs text-center">المبيعات</TableHead>
                          <TableHead className="text-xs text-left">الإيرادات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.topProducts.slice(0, 8).map((product, idx) => {
                          const images =
                            typeof product.images === 'string'
                              ? (() => {
                                  try {
                                    return JSON.parse(product.images)
                                  } catch {
                                    return []
                                  }
                                })()
                              : product.images
                          return (
                            <TableRow key={product.id} className="hover:bg-accent/30 transition-colors">
                              <TableCell className="text-xs font-medium">
                                <div className="h-6 w-6 rounded-md bg-[#D4A574]/10 dark:bg-[#D4A574]/20 flex items-center justify-center text-[10px] font-bold text-[#D4A574] dark:text-[#E8C9A0]">
                                  {idx + 1}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {images?.[0] ? (
                                    <img
                                      src={images[0] as string}
                                      alt={product.nameAr}
                                      className="h-8 w-8 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                  )}
                                  <span className="text-xs font-medium truncate max-w-[100px] md:max-w-[160px]">
                                    {product.nameAr}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-center font-medium">
                                {product.totalSold}
                              </TableCell>
                              <TableCell className="text-xs text-left font-bold text-[#D4A574] dark:text-[#E8C9A0]">
                                {formatCurrency(product.revenue)}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">لا توجد مبيعات بعد</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Order Status PieChart */}
            <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-[#D4A574]" />
                  توزيع حالات الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="h-48 md:h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={isMobile ? 45 : 55}
                            outerRadius={isMobile ? 70 : 85}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                      {pieData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-1.5">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-xs text-muted-foreground">{entry.name}</span>
                          <span className="text-xs font-bold">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">لا توجد طلبات بعد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── 4. Categories Bar + Active Users ─── */}
          <motion.div
            variants={itemVariants}
            className={`grid ${
              isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
            } gap-6`}
          >
            {/* Left: Revenue by Category (Horizontal BarChart) */}
            <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#D4A574]" />
                  الإيرادات حسب الفئة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryBarData.length > 0 ? (
                  <div className="h-56 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryBarData}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.2}
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: number) => `${formatNumber(v)}`}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                          width={70}
                        />
                        <Tooltip content={<CategoryBarTooltip />} />
                        <Bar
                          dataKey="الإيرادات"
                          fill={GOLD}
                          radius={[0, 8, 8, 0]}
                          barSize={24}
                        >
                          {categoryBarData.map((_, index) => (
                            <Cell
                              key={`cat-cell-${index}`}
                              fill={
                                index === 0
                                  ? GOLD
                                  : index === 1
                                    ? DUSTY_PINK
                                    : index === 2
                                      ? '#8B6F6F'
                                      : '#94a3b8'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">لا توجد بيانات فئات</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Most Active Users Table */}
            <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#D4A574]" />
                  أكثر العملاء نشاطاً
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.mostActiveUsers.length > 0 ? (
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">العميل</TableHead>
                          <TableHead className="text-xs text-center">الطلبات</TableHead>
                          <TableHead className="text-xs text-left">الإنفاق</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.mostActiveUsers.slice(0, 8).map((user) => (
                          <TableRow key={user.id} className="hover:bg-accent/30 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#D4A574]/30 to-[#C4A4A4]/30 flex items-center justify-center text-[10px] font-bold text-[#D4A574] dark:text-[#E8C9A0]">
                                  {user.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="text-xs font-medium truncate max-w-[80px] md:max-w-[120px]">
                                    {user.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate max-w-[80px] md:max-w-[120px]">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-center font-medium">
                              {user.orderCount}
                            </TableCell>
                            <TableCell className="text-xs text-left font-bold text-[#D4A574] dark:text-[#E8C9A0]">
                              {formatCurrency(user.totalSpent)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">لا يوجد عملاء نشطون بعد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── 5. Revenue Growth Comparison Card ─── */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 dark-glow-card overflow-hidden">
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Growth indicator */}
                  <div
                    className={`flex-shrink-0 h-16 w-16 rounded-2xl flex items-center justify-center ${
                      data.revenueGrowth.growthPercent >= 0
                        ? 'bg-green-100 dark:bg-green-900/20'
                        : 'bg-red-100 dark:bg-red-900/20'
                    }`}
                  >
                    {data.revenueGrowth.growthPercent >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
                    )}
                  </div>

                  {/* Text info */}
                  <div className="flex-1">
                    <h3 className="text-base font-bold mb-1">مقارنة نمو الإيرادات</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      مقارنة بين أداء هذا الشهر والشهر الماضي
                    </p>

                    {/* Month comparison */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-[#D4A574]/5 dark:bg-[#D4A574]/10 rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground mb-1">هذا الشهر</p>
                        <p className="text-lg font-bold text-[#D4A574] dark:text-[#E8C9A0]">
                          {formatCurrency(data.revenueGrowth.thisMonth)}
                        </p>
                      </div>
                      <div className="bg-[#C4A4A4]/5 dark:bg-[#C4A4A4]/10 rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground mb-1">الشهر الماضي</p>
                        <p className="text-lg font-bold text-[#C4A4A4] dark:text-[#D4A4A4]">
                          {formatCurrency(data.revenueGrowth.lastMonth)}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">نسبة النمو</span>
                        <span
                          className={`text-sm font-bold ${
                            data.revenueGrowth.growthPercent >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {data.revenueGrowth.growthPercent >= 0 ? '+' : ''}
                          {data.revenueGrowth.growthPercent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted/50 dark:bg-[#2A2522] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              Math.abs(data.revenueGrowth.growthPercent),
                              100
                            )}%`,
                          }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                          className={`h-full rounded-full ${
                            data.revenueGrowth.growthPercent >= 0
                              ? 'bg-gradient-to-l from-green-500 to-green-400'
                              : 'bg-gradient-to-l from-red-500 to-red-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div
                    className={`hidden md:flex items-center justify-center h-20 w-20 rounded-2xl ${
                      data.revenueGrowth.growthPercent >= 0
                        ? 'bg-green-50 dark:bg-green-900/10'
                        : 'bg-red-50 dark:bg-red-900/10'
                    }`}
                  >
                    {data.revenueGrowth.growthPercent >= 0 ? (
                      <ArrowUpRight className="h-10 w-10 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-10 w-10 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* ═══ Empty / Error State ═══ */}
      {!loading && !data && (
        <motion.div
          variants={itemVariants}
          className="text-center py-16"
        >
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">لا توجد بيانات تحليلات متاحة</p>
          <Button
            variant="outline"
            onClick={fetchAnalytics}
            className="mt-4 rounded-xl gap-2"
            size="sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            إعادة المحاولة
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

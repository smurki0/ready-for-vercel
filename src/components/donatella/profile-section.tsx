'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Package,
  Heart,
  LogOut,
  Loader2,
  Save,
  ChevronLeft,
  Shield,
  Edit3,
  Eye,
  EyeOff,
  ShoppingBag,
  Award,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useCartStore } from '@/stores/cart-store'
import { toast } from 'sonner'
import LoyaltySection from '@/components/donatella/loyalty-section'

export default function ProfileSection() {
  const setPage = useUIStore((s) => s.setPage)
  const { user, logout, setUser } = useAuthStore()
  const wishlistItems = useWishlistStore((s) => s.items)
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist)
  const getItemCount = useCartStore((s) => s.getItemCount)
  const setAuthModalTab = useUIStore((s) => s.setAuthModalTab)

  // Profile edit form
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  // Change password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Orders summary
  const [ordersCount, setOrdersCount] = useState(0)
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Active tab
  const [activeTab, setActiveTab] = useState('account')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
      setAddress(user.address || '')
      setEmail(user.email || '')
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchWishlist()
      fetchOrdersCount()
    }
  }, [user, fetchWishlist])

  const fetchOrdersCount = async () => {
    setLoadingOrders(true)
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (data.success) {
        setOrdersCount(data.data.length)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingOrders(false)
    }
  }

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="pt-6 pb-16 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <User className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">يرجى تسجيل الدخول</h2>
          <p className="text-muted-foreground text-sm mb-6">
            يجب تسجيل الدخول للوصول إلى حسابك
          </p>
          <Button
            onClick={() => {
              setAuthModalTab('login')
              setPage('auth')
            }}
          >
            تسجيل الدخول
          </Button>
        </motion.div>
      </div>
    )
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('يرجى إدخال الاسم')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, address }),
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.data)
        setEditing(false)
        toast.success('تم تحديث البيانات بنجاح')
      } else {
        toast.error(data.error || 'فشل تحديث البيانات')
      }
    } catch {
      toast.error('حدث خطأ أثناء تحديث البيانات')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      toast.error('يرجى إدخال كلمة المرور الحالية')
      return
    }
    if (!newPassword.trim()) {
      toast.error('يرجى إدخال كلمة المرور الجديدة')
      return
    }
    if (newPassword.length < 6) {
      toast.error('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة')
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (data.success) {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        toast.success('تم تغيير كلمة المرور بنجاح')
      } else {
        toast.error(data.error || 'فشل تغيير كلمة المرور')
      }
    } catch {
      toast.error('حدث خطأ أثناء تغيير كلمة المرور')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setPage('home')
    toast.success('تم تسجيل الخروج بنجاح')
  }

  const cartCount = getItemCount()
  const wishlistCount = wishlistItems.length

  return (
    <div className="pt-6 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            حسابي
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            إدارة بياناتك الشخصية وإعدادات حسابك
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          <Card
            className="rounded-2xl border-border/50 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
            onClick={() => setPage('orders')}
          >
            <CardContent className="p-4 text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">
                {loadingOrders ? '...' : ordersCount}
              </p>
              <p className="text-xs text-muted-foreground">طلباتي</p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl border-border/50 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
            onClick={() => setPage('wishlist')}
          >
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 mx-auto mb-2 text-rose-500 dark:text-rose-400" />
              <p className="text-2xl font-bold text-foreground">{wishlistCount}</p>
              <p className="text-xs text-muted-foreground">المفضلة</p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl border-border/50 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
            onClick={() => useUIStore.getState().setCartOpen(true)}
          >
            <CardContent className="p-4 text-center">
              <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
              <p className="text-2xl font-bold text-foreground">{cartCount}</p>
              <p className="text-xs text-muted-foreground">السلة</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50">
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <p className="text-sm font-bold text-foreground mt-1">
                {user.role === 'admin' ? 'مدير' : 'عضو'}
              </p>
              <p className="text-xs text-muted-foreground">الحساب</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="w-full grid grid-cols-4 mb-6 rounded-xl h-12">
              <TabsTrigger value="account" className="rounded-lg gap-1.5 text-xs sm:text-sm">
                <User className="h-4 w-4" />
                البيانات الشخصية
              </TabsTrigger>
              <TabsTrigger value="password" className="rounded-lg gap-1.5 text-xs sm:text-sm">
                <Lock className="h-4 w-4" />
                كلمة المرور
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="rounded-lg gap-1.5 text-xs sm:text-sm">
                <Award className="h-4 w-4" />
                نقاط الولاء
              </TabsTrigger>
              <TabsTrigger value="summary" className="rounded-lg gap-1.5 text-xs sm:text-sm">
                <Package className="h-4 w-4" />
                ملخص
              </TabsTrigger>
            </TabsList>

            {/* Account Info Tab */}
            <TabsContent value="account">
              <Card className="rounded-2xl border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">البيانات الشخصية</CardTitle>
                  {!editing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-xl"
                      onClick={() => setEditing(true)}
                    >
                      <Edit3 className="h-4 w-4" />
                      تعديل
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="gap-2 rounded-xl"
                        onClick={handleSaveProfile}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        حفظ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => {
                          setEditing(false)
                          setName(user.name || '')
                          setPhone(user.phone || '')
                          setAddress(user.address || '')
                        }}
                      >
                        إلغاء
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Avatar & Name Display */}
                  <div className="flex items-center gap-4 pb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.role === 'admin' && (
                        <Badge className="mt-1 text-xs" variant="secondary">
                          مدير النظام
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        الاسم الكامل
                      </Label>
                      {editing ? (
                        <Input
                          id="profile-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="أدخلي اسمك الكامل"
                          className="rounded-xl h-11"
                        />
                      ) : (
                        <p className="h-11 flex items-center px-3 text-sm bg-muted/50 rounded-xl">
                          {user.name || '—'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        البريد الإلكتروني
                      </Label>
                      <p className="h-11 flex items-center px-3 text-sm bg-muted/50 rounded-xl">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        لا يمكن تغيير البريد الإلكتروني
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        رقم الهاتف
                      </Label>
                      {editing ? (
                        <Input
                          id="profile-phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="05xxxxxxxx"
                          className="rounded-xl h-11"
                          dir="ltr"
                        />
                      ) : (
                        <p className="h-11 flex items-center px-3 text-sm bg-muted/50 rounded-xl" dir="ltr">
                          {user.phone || '—'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-address" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        العنوان
                      </Label>
                      {editing ? (
                        <Input
                          id="profile-address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="المدينة، الحي، الشارع، رقم المبنى"
                          className="rounded-xl h-11"
                        />
                      ) : (
                        <p className="h-11 flex items-center px-3 text-sm bg-muted/50 rounded-xl">
                          {user.address || '—'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Change Password Tab */}
            <TabsContent value="password">
              <Card className="rounded-2xl border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    تغيير كلمة المرور
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="أدخلي كلمة المرور الحالية"
                        className="rounded-xl h-11 pl-10"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="أدخلي كلمة المرور الجديدة (6 أحرف على الأقل)"
                        className="rounded-xl h-11 pl-10"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعدي إدخال كلمة المرور الجديدة"
                      className="rounded-xl h-11"
                      dir="ltr"
                    />
                  </div>

                  <Button
                    className="w-full h-12 rounded-xl text-base font-semibold gap-2 mt-2"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري التغيير...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        تغيير كلمة المرور
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Loyalty Tab */}
            <TabsContent value="loyalty">
              <LoyaltySection />
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary">
              <div className="space-y-4">
                {/* Order History Summary */}
                <Card
                  className="rounded-2xl border-border/50 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
                  onClick={() => setPage('orders')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">طلباتي</h3>
                          <p className="text-sm text-muted-foreground">
                            {loadingOrders ? 'جاري التحميل...' : `${ordersCount} طلب`}
                          </p>
                        </div>
                      </div>
                      <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                {/* Wishlist Summary */}
                <Card
                  className="rounded-2xl border-border/50 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
                  onClick={() => setPage('wishlist')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                          <Heart className="h-6 w-6 text-rose-500 dark:text-rose-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">المفضلة</h3>
                          <p className="text-sm text-muted-foreground">
                            {wishlistCount} منتج
                          </p>
                        </div>
                      </div>
                      <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                {/* Cart Summary */}
                <Card
                  className="rounded-2xl border-border/50 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
                  onClick={() => useUIStore.getState().setCartOpen(true)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">سلة التسوق</h3>
                          <p className="text-sm text-muted-foreground">
                            {cartCount} منتج في السلة
                          </p>
                        </div>
                      </div>
                      <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                {/* Loyalty Summary Card */}
                <Card
                  className="rounded-2xl border-border/50 cursor-pointer hover:border-[#D4A574]/30 hover:shadow-md transition-all overflow-hidden"
                  onClick={() => setActiveTab('loyalty')}
                >
                  <CardContent className="p-0">
                    <div className="relative bg-gradient-to-l from-[#D4A574]/15 via-[#C4A4A4]/10 to-[#D4A574]/5 dark:from-[#D4A574]/10 dark:via-[#C4A4A4]/5 dark:to-[#D4A574]/5 p-6">
                      {/* Decorative */}
                      <div className="absolute top-2 left-2 opacity-[0.06]">
                        <Award className="h-20 w-20 text-[#D4A574]" />
                      </div>

                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#D4A574]/20 to-[#D4A574]/5 flex items-center justify-center border border-[#D4A574]/20">
                            <Award className="h-7 w-7 text-[#D4A574]" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">نقاط الولاء</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-2xl font-bold text-[#D4A574]">
                                ١٬٢٥٠
                              </span>
                              <span className="text-xs text-muted-foreground">نقطة</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge
                            className="gap-1 px-2.5 py-0.5 text-xs font-semibold border-0"
                            style={{
                              backgroundColor: '#D4A57420',
                              color: '#D4A574',
                            }}
                          >
                            <Crown className="h-3 w-3" />
                            فضية
                          </Badge>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span>٧٥٠ نقطة للترقية</span>
                            <ChevronLeft className="h-3 w-3" />
                          </div>
                        </div>
                      </div>

                      {/* Mini progress bar */}
                      <div className="mt-4 h-1.5 rounded-full bg-background/50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-l from-[#D4A574] to-[#D4A574]/60"
                          style={{ width: '62.5%' }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Separator className="my-4" />

                {/* Logout */}
                <Card className="rounded-2xl border-destructive/20 hover:border-destructive/40 transition-all">
                  <CardContent className="p-6">
                    <Button
                      variant="ghost"
                      className="w-full justify-center gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 h-12 rounded-xl text-base font-semibold"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      تسجيل الخروج
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

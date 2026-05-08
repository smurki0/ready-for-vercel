'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Mail, Lock, User, Phone, Eye, EyeOff, Chrome, Apple, Heart, ShoppingBag, Crown, Gem, Star, Scissors, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { toast } from 'sonner'

// Password strength calculator with Arabic labels
function getPasswordStrength(password: string): { level: number; label: string; color: string; bgColor: string; percentage: number } {
  if (!password) return { level: 0, label: '', color: '', bgColor: '', percentage: 0 }

  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { level: 1, label: 'ضعيف', color: 'text-red-500', bgColor: 'bg-red-500', percentage: 25 }
  if (score <= 2) return { level: 2, label: 'متوسط', color: 'text-amber-500', bgColor: 'bg-amber-500', percentage: 50 }
  if (score <= 3) return { level: 3, label: 'قوي', color: 'text-blue-500', bgColor: 'bg-blue-500', percentage: 75 }
  return { level: 4, label: 'ممتاز', color: 'text-emerald-500', bgColor: 'bg-emerald-500', percentage: 100 }
}

// Floating fashion icon component
function FloatingIcon({ icon: Icon, className, delay, duration }: {
  icon: React.ElementType
  className: string
  delay: number
  duration: number
}) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0],
        opacity: [0.08, 0.15, 0.08],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <Icon className="h-8 w-8 text-[#D4A574]" />
    </motion.div>
  )
}

// Animated sparkle component
function SparkleEffect({ className, delay }: { className: string; delay: number }) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        rotate: [0, 180],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <Sparkles className="h-4 w-4 text-[#D4A574]/40" />
    </motion.div>
  )
}

export default function AuthSection() {
  const setPage = useUIStore((s) => s.setPage)
  const authModalTab = useUIStore((s) => s.authModalTab)
  const setAuthModalTab = useUIStore((s) => s.setAuthModalTab)

  const { login, register, loading } = useAuthStore()
  const fetchCart = useCartStore((s) => s.fetchCart)
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({})

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})
  const [agreeTerms, setAgreeTerms] = useState(false)

  // Password strength
  const passwordStrength = useMemo(() => getPasswordStrength(regPassword), [regPassword])

  const validateLogin = () => {
    const errors: Record<string, string> = {}
    if (!loginEmail.trim()) errors.email = 'البريد الإلكتروني مطلوب'
    else if (!/\S+@\S+\.\S+/.test(loginEmail)) errors.email = 'بريد إلكتروني غير صالح'
    if (!loginPassword.trim()) errors.password = 'كلمة المرور مطلوبة'
    setLoginErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateRegister = () => {
    const errors: Record<string, string> = {}
    if (!regName.trim()) errors.name = 'الاسم مطلوب'
    if (!regEmail.trim()) errors.email = 'البريد الإلكتروني مطلوب'
    else if (!/\S+@\S+\.\S+/.test(regEmail)) errors.email = 'بريد إلكتروني غير صالح'
    if (!regPassword.trim()) errors.password = 'كلمة المرور مطلوبة'
    else if (regPassword.length < 6) errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    if (!agreeTerms) errors.terms = 'يجب الموافقة على الشروط والأحكام'
    setRegErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLogin()) return
    try {
      await login(loginEmail, loginPassword)
      toast.success('تم تسجيل الدخول بنجاح')
      await Promise.all([fetchCart(), fetchWishlist()])
      setPage('home')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل تسجيل الدخول')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRegister()) return
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone || undefined,
      })
      toast.success('تم إنشاء الحساب بنجاح')
      await Promise.all([fetchCart(), fetchWishlist()])
      setPage('home')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل إنشاء الحساب')
    }
  }

  const handleGuestContinue = () => {
    setPage('shop')
  }

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Decorative Background with gradient circles */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#D4A574]/5 dark:bg-[#D4A574]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#C4A4A4]/5 dark:bg-[#C4A4A4]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4A574]/3 dark:bg-[#D4A574]/4 rounded-full blur-3xl" />
        <div className="absolute top-10 left-1/3 w-64 h-64 bg-[#8B6F6F]/5 dark:bg-[#8B6F6F]/3 rounded-full blur-3xl" />

        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating fashion icons */}
        <FloatingIcon icon={Crown} className="top-[15%] right-[8%]" delay={0} duration={4} />
        <FloatingIcon icon={Gem} className="top-[25%] left-[12%]" delay={1} duration={5} />
        <FloatingIcon icon={Star} className="bottom-[30%] right-[15%]" delay={2} duration={4.5} />
        <FloatingIcon icon={Heart} className="bottom-[20%] left-[8%]" delay={0.5} duration={3.5} />
        <FloatingIcon icon={ShoppingBag} className="top-[60%] right-[5%]" delay={1.5} duration={4.2} />
        <FloatingIcon icon={Scissors} className="top-[40%] left-[5%]" delay={2.5} duration={3.8} />

        {/* Animated sparkle effects */}
        <SparkleEffect className="top-[20%] right-[25%]" delay={0} />
        <SparkleEffect className="top-[45%] left-[18%]" delay={0.8} />
        <SparkleEffect className="bottom-[35%] right-[12%]" delay={1.6} />
        <SparkleEffect className="top-[70%] left-[30%]" delay={2.4} />
        <SparkleEffect className="top-[10%] left-[45%]" delay={1.2} />
        <SparkleEffect className="bottom-[15%] right-[40%]" delay={3} />
        <SparkleEffect className="top-[55%] right-[35%]" delay={0.4} />
        <SparkleEffect className="bottom-[50%] left-[22%]" delay={2} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto px-4 relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#b8885a] mb-4 shadow-lg shadow-[#D4A574]/20">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold tracking-wider text-foreground mb-2">
            DONATELLA
          </h1>
          <p className="text-muted-foreground text-sm">
            مرحباً بكِ في متجرنا الفاخر
          </p>
        </div>

        <Card className="rounded-2xl border-border/50 shadow-lg overflow-hidden backdrop-blur-sm">
          <Tabs
            value={authModalTab}
            onValueChange={(val) => {
              setAuthModalTab(val as 'login' | 'register')
              setLoginErrors({})
              setRegErrors({})
            }}
          >
            <TabsList className="w-full rounded-none border-b border-border bg-transparent h-auto p-0">
              <TabsTrigger
                value="login"
                className="flex-1 rounded-none py-3.5 data-[state=active]:border-b-2 data-[state=active]:border-[#D4A574] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium transition-all duration-300 data-[state=active]:text-[#D4A574]"
              >
                تسجيل الدخول
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1 rounded-none py-3.5 data-[state=active]:border-b-2 data-[state=active]:border-[#D4A574] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium transition-all duration-300 data-[state=active]:text-[#D4A574]"
              >
                إنشاء حساب
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {authModalTab === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <TabsContent value="login" className="mt-0">
                    <CardContent className="pt-6">
                      {/* Welcome back greeting animation */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="text-center mb-5"
                      >
                        <motion.p
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                          className="text-lg font-bold text-foreground"
                        >
                          مرحباً بعودتك! 👑
                        </motion.p>
                        <p className="text-xs text-muted-foreground mt-1">
                          سجلي دخولك لمتابعة تجربة التسوق
                        </p>
                      </motion.div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">البريد الإلكتروني</Label>
                          <div className="relative">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="login-email"
                              type="email"
                              value={loginEmail}
                              onChange={(e) => {
                                setLoginEmail(e.target.value)
                                if (loginErrors.email) setLoginErrors((p) => ({ ...p, email: '' }))
                              }}
                              placeholder="example@email.com"
                              className={`rounded-xl h-11 pr-10 ${loginErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                              dir="ltr"
                            />
                          </div>
                          {loginErrors.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-destructive"
                            >
                              {loginErrors.email}
                            </motion.p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="login-password">كلمة المرور</Label>
                            <button
                              type="button"
                              className="text-xs text-[#D4A574] hover:underline"
                              onClick={() => toast.info('سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')}
                            >
                              نسيت كلمة المرور؟
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="login-password"
                              type={showLoginPassword ? 'text' : 'password'}
                              value={loginPassword}
                              onChange={(e) => {
                                setLoginPassword(e.target.value)
                                if (loginErrors.password) setLoginErrors((p) => ({ ...p, password: '' }))
                              }}
                              placeholder="••••••••"
                              className={`rounded-xl h-11 pr-10 pl-10 ${loginErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                              dir="ltr"
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {loginErrors.password && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-destructive"
                            >
                              {loginErrors.password}
                            </motion.p>
                          )}
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-11 rounded-xl font-semibold bg-gradient-to-l from-[#D4A574] to-[#b8885a] text-white shadow-md hover:shadow-lg transition-shadow"
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            'تسجيل الدخول'
                          )}
                        </Button>
                      </form>

                      {/* Divider */}
                      <div className="relative my-6">
                        <Separator />
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                          أو
                        </span>
                      </div>

                      {/* Social Login Buttons */}
                      <div className="space-y-2.5">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11 rounded-xl gap-2 font-medium border-border/50 hover:border-[#D4A574]/30 transition-colors"
                          onClick={() => toast.info('تسجيل الدخول عبر Google قريباً')}
                        >
                          <Chrome className="h-4 w-4" />
                          تسجيل الدخول عبر Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11 rounded-xl gap-2 font-medium border-border/50 hover:border-[#D4A574]/30 transition-colors"
                          onClick={() => toast.info('تسجيل الدخول عبر Apple قريباً')}
                        >
                          <Apple className="h-4 w-4" />
                          تسجيل الدخول عبر Apple
                        </Button>
                      </div>

                      {/* Continue as Guest */}
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full mt-4 text-muted-foreground hover:text-foreground rounded-xl"
                        onClick={handleGuestContinue}
                      >
                        تسجيل الدخول كضيف
                      </Button>
                    </CardContent>
                  </TabsContent>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <TabsContent value="register" className="mt-0">
                    <CardContent className="pt-6">
                      {/* Join the family greeting animation */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="text-center mb-5"
                      >
                        <motion.p
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                          className="text-lg font-bold text-foreground"
                        >
                          انضمي للعائلة! ✨
                        </motion.p>
                        <p className="text-xs text-muted-foreground mt-1">
                          أنشئي حسابك واستمتعي بمزايا حصرية
                        </p>
                      </motion.div>

                      {/* Social proof counter */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center justify-center gap-2 mb-5 py-2 px-3 rounded-xl bg-[#D4A574]/5 border border-[#D4A574]/10"
                      >
                        <Users className="h-4 w-4 text-[#D4A574]" />
                        <span className="text-xs text-foreground font-medium">
                          انضمت <span className="text-[#D4A574] font-bold">1,234</span> سيدة هذا الشهر
                        </span>
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-2 w-2 rounded-full bg-emerald-500"
                        />
                      </motion.div>

                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reg-name">الاسم الكامل</Label>
                          <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="reg-name"
                              value={regName}
                              onChange={(e) => {
                                setRegName(e.target.value)
                                if (regErrors.name) setRegErrors((p) => ({ ...p, name: '' }))
                              }}
                              placeholder="أدخلي اسمك الكامل"
                              className={`rounded-xl h-11 pr-10 ${regErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            />
                          </div>
                          {regErrors.name && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-destructive"
                            >
                              {regErrors.name}
                            </motion.p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-email">البريد الإلكتروني</Label>
                          <div className="relative">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="reg-email"
                              type="email"
                              value={regEmail}
                              onChange={(e) => {
                                setRegEmail(e.target.value)
                                if (regErrors.email) setRegErrors((p) => ({ ...p, email: '' }))
                              }}
                              placeholder="example@email.com"
                              className={`rounded-xl h-11 pr-10 ${regErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                              dir="ltr"
                            />
                          </div>
                          {regErrors.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-destructive"
                            >
                              {regErrors.email}
                            </motion.p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-password">كلمة المرور</Label>
                          <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="reg-password"
                              type={showRegPassword ? 'text' : 'password'}
                              value={regPassword}
                              onChange={(e) => {
                                setRegPassword(e.target.value)
                                if (regErrors.password) setRegErrors((p) => ({ ...p, password: '' }))
                              }}
                              placeholder="٦ أحرف على الأقل"
                              className={`rounded-xl h-11 pr-10 pl-10 ${regErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                              dir="ltr"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {regErrors.password && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-destructive"
                            >
                              {regErrors.password}
                            </motion.p>
                          )}

                          {/* Enhanced Password Strength Indicator */}
                          {regPassword.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-2"
                            >
                              {/* Progress bar */}
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${passwordStrength.percentage}%` }}
                                  transition={{ duration: 0.4, ease: 'easeOut' }}
                                  className={`h-full rounded-full ${passwordStrength.bgColor}`}
                                />
                              </div>
                              {/* 4-segment bar */}
                              <div className="flex gap-1">
                                {[1, 2, 3, 4].map((level) => (
                                  <div
                                    key={level}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                      passwordStrength.level >= level
                                        ? passwordStrength.bgColor
                                        : 'bg-muted'
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="flex items-center justify-between">
                                <p className={`text-[10px] font-medium ${passwordStrength.color}`}>
                                  قوة كلمة المرور: {passwordStrength.label}
                                </p>
                                <div className="flex gap-2 text-[9px] text-muted-foreground">
                                  <span className={passwordStrength.level >= 1 ? passwordStrength.color : ''}>6+ أحرف</span>
                                  <span className={passwordStrength.level >= 2 ? passwordStrength.color : ''}>حرف كبير</span>
                                  <span className={passwordStrength.level >= 3 ? passwordStrength.color : ''}>رقم</span>
                                  <span className={passwordStrength.level >= 4 ? passwordStrength.color : ''}>رمز</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-phone">رقم الهاتف (اختياري)</Label>
                          <div className="relative">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="reg-phone"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              placeholder="05xxxxxxxx"
                              className="rounded-xl h-11 pr-10"
                              dir="ltr"
                            />
                          </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-start gap-2.5">
                          <Checkbox
                            id="terms"
                            checked={agreeTerms}
                            onCheckedChange={(checked) => {
                              setAgreeTerms(checked === true)
                              if (regErrors.terms) setRegErrors((p) => ({ ...p, terms: '' }))
                            }}
                            className="mt-1"
                          />
                          <div>
                            <Label htmlFor="terms" className="text-xs leading-relaxed cursor-pointer">
                              أوافق على{' '}
                              <button
                                type="button"
                                className="text-[#D4A574] hover:underline"
                                onClick={() => toast.info('صفحة الشروط والأحكام قيد الإنشاء')}
                              >
                                الشروط والأحكام
                              </button>
                              {' '}و{' '}
                              <button
                                type="button"
                                className="text-[#D4A574] hover:underline"
                                onClick={() => toast.info('صفحة سياسة الخصوصية قيد الإنشاء')}
                              >
                                سياسة الخصوصية
                              </button>
                            </Label>
                            {regErrors.terms && (
                              <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-destructive mt-1"
                              >
                                {regErrors.terms}
                              </motion.p>
                            )}
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-11 rounded-xl font-semibold bg-gradient-to-l from-[#D4A574] to-[#b8885a] text-white shadow-md hover:shadow-lg transition-shadow"
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            'إنشاء حساب'
                          )}
                        </Button>
                      </form>

                      {/* Divider */}
                      <div className="relative my-6">
                        <Separator />
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                          أو
                        </span>
                      </div>

                      {/* Social Login Buttons */}
                      <div className="space-y-2.5">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11 rounded-xl gap-2 font-medium border-border/50 hover:border-[#D4A574]/30 transition-colors"
                          onClick={() => toast.info('التسجيل عبر Google قريباً')}
                        >
                          <Chrome className="h-4 w-4" />
                          التسجيل عبر Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11 rounded-xl gap-2 font-medium border-border/50 hover:border-[#D4A574]/30 transition-colors"
                          onClick={() => toast.info('التسجيل عبر Apple قريباً')}
                        >
                          <Apple className="h-4 w-4" />
                          التسجيل عبر Apple
                        </Button>
                      </div>

                      {/* Continue as Guest */}
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full mt-4 text-muted-foreground hover:text-foreground rounded-xl"
                        onClick={handleGuestContinue}
                      >
                        تسجيل الدخول كضيف
                      </Button>
                    </CardContent>
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  )
}

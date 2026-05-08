'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  CheckCircle2,
  Loader2,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

const subjectOptions = [
  { value: 'general', label: 'استفسار عام' },
  { value: 'complaint', label: 'شكوى' },
  { value: 'suggestion', label: 'اقتراح' },
  { value: 'technical', label: 'مشكلة تقنية' },
]

const contactCards = [
  {
    icon: Phone,
    title: 'الهاتف',
    value: '+20 100 123 4567',
    description: 'السبت - الخميس',
    color: 'from-[#D4A574] to-[#b8885a]',
  },
  {
    icon: Mail,
    title: 'البريد الإلكتروني',
    value: 'info@donatella.com',
    description: 'نرد خلال 24 ساعة',
    color: 'from-[#C4A4A4] to-[#a88484]',
  },
  {
    icon: MapPin,
    title: 'العنوان',
    value: 'الاسكندرية، مصر',
    description: 'جمهورية مصر العربية',
    color: 'from-[#8B6F6F] to-[#6b5252]',
  },
  {
    icon: Clock,
    title: 'ساعات العمل',
    value: '10 صباحاً - 10 مساءً',
    description: 'السبت - الخميس',
    color: 'from-[#b8885a] to-[#9a7348]',
  },
]

const socialLinks = [
  { icon: Instagram, label: 'انستغرام', href: 'https://instagram.com/donatella.eg', color: 'hover:bg-pink-500' },
  // { icon: Twitter, label: 'تويتر', href: 'https://twitter.com/donatella_eg', color: 'hover:bg-sky-500' },
  // { icon: Facebook, label: 'فيسبوك', href: 'https://facebook.com/donatella.eg', color: 'hover:bg-blue-600' },
  { icon: MessageCircle, label: 'واتساب', href: 'https://wa.me/201001234567', color: 'hover:bg-green-500' },
]

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        setSubmitted(true)
        toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        toast.error(data.error || 'حدث خطأ في إرسال الرسالة')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-6 pb-12 relative overflow-hidden">
      {/* Decorative background - enhanced for dark */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#D4A574]/5 dark:bg-[#D4A574]/4 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-[#C4A4A4]/5 dark:bg-[#C4A4A4]/4 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B6F6F]/3 dark:bg-[#8B6F6F]/3 rounded-full blur-3xl" />
      </div>
      {/* Dark mode dot pattern */}
      <div className="absolute inset-0 -z-10 hidden dark:block dark-dot-pattern opacity-20" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#D4A574]/10 dark:bg-[#D4A574]/8 text-[#D4A574] dark:text-[#E8C9A0] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <MessageCircle className="h-4 w-4" />
            تواصلي معنا
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground dark:text-foreground mb-3">
            نحن هنا لمساعدتك
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground max-w-xl mx-auto leading-relaxed">
            يسعدنا التواصل معكِ والإجابة على جميع استفساراتك. لا تترددي في التواصل معنا في أي وقت.
          </p>
          <div className="h-1 w-24 bg-gradient-to-l from-[#D4A574] to-[#C4A4A4] mx-auto mt-6 rounded-full dark:shadow-[0_0_10px_rgba(212,165,116,0.2)]" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-border/50 dark:border-[#3A3532]/60 shadow-lg dark:shadow-[0_0_20px_rgba(212,165,116,0.05)] overflow-hidden dark-glow-card">
              {/* Top gradient accent */}
              <div className="h-1 bg-gradient-to-l from-[#D4A574] via-[#C4A4A4] to-[#D4A574] dark:shadow-[0_0_8px_rgba(212,165,116,0.2)]" />
              <CardContent className="p-6 sm:p-8 bg-card dark:bg-[#231F1C]">
                {submitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground dark:text-foreground mb-2">تم الإرسال بنجاح!</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground text-sm">
                      شكراً لتواصلك معنا. سنرد عليكِ في أقرب وقت ممكن.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="text-lg font-semibold text-foreground dark:text-foreground flex items-center gap-2 mb-2">
                      <Send className="h-5 w-5 text-[#D4A574] dark:text-[#E8C9A0]" />
                      أرسلي لنا رسالة
                    </h2>

                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground dark:text-foreground">
                        الاسم <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="أدخلي اسمك الكامل"
                        className="rounded-xl dark:border-[#3A3532] dark:focus:border-[#D4A574]/40"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground dark:text-foreground">
                        البريد الإلكتروني <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="example@email.com"
                        dir="ltr"
                        className="rounded-xl text-right dark:border-[#3A3532] dark:focus:border-[#D4A574]/40"
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground dark:text-foreground">
                        الموضوع <span className="text-destructive">*</span>
                      </label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      >
                        <SelectTrigger className="rounded-xl dark:border-[#3A3532]">
                          <SelectValue placeholder="اختاري الموضوع" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjectOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground dark:text-foreground">
                        الرسالة <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="اكتبي رسالتك هنا..."
                        rows={5}
                        className="rounded-xl resize-none dark:border-[#3A3532] dark:focus:border-[#D4A574]/40"
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl h-11 bg-gradient-to-l from-[#D4A574] to-[#b8885a] hover:from-[#b8885a] hover:to-[#9a7348] text-white dark:text-white border-0 shadow-md dark:shadow-[#D4A574]/15 text-sm font-medium"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 ml-2" />
                          إرسال الرسالة
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info & Social */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card className="border-border/50 dark:border-[#3A3532]/60 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(212,165,116,0.08)] transition-all duration-300 group h-full dark-glow-card dark-elevated-card">
                    <CardContent className="p-5">
                      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform dark:shadow-lg dark:shadow-[#D4A574]/10`}>
                        <card.icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground dark:text-foreground mb-1">{card.title}</h3>
                      <p className="text-sm text-foreground/80 dark:text-foreground/90 font-medium" dir={card.icon === Phone ? 'ltr' : 'rtl'}>
                        {card.value}
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">{card.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Social Media */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-border/50 dark:border-[#3A3532]/60 dark-glow-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4 flex items-center gap-2">
                    <div className="h-px w-6 bg-[#D4A574] dark:shadow-[0_0_5px_rgba(212,165,116,0.2)]" />
                    تابعينا على وسائل التواصل
                  </h3>
                  <div className="flex items-center gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        aria-label={social.label}
                        className={`h-12 w-12 rounded-xl bg-muted dark:bg-[#2A2522] flex items-center justify-center transition-all duration-300 hover:text-white hover:scale-110 hover:shadow-lg dark:hover:shadow-[#D4A574]/10 text-muted-foreground dark:text-muted-foreground ${social.color}`}
                      >
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Map placeholder / Additional info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className="border-border/50 dark:border-[#3A3532]/60 overflow-hidden dark-glow-card">
                <div className="h-1 bg-gradient-to-l from-[#D4A574] via-[#C4A4A4] to-[#D4A574] dark:shadow-[0_0_8px_rgba(212,165,116,0.2)]" />
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#D4A574] dark:text-[#E8C9A0]" />
                    موقعنا
                  </h3>
                  <div className="h-48 rounded-xl bg-muted/50 dark:bg-[#2A2522]/50 flex items-center justify-center border border-border/30 dark:border-[#3A3532]/50">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 text-[#D4A574] dark:text-[#E8C9A0] mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground dark:text-foreground">القاهرة، مصر</p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">التوصيل لجميع المحافظات</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
                    <ChevronLeft className="h-3 w-3" />
                    <span>توصيل لجميع محافظات مصر</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

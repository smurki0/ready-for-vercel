'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Share2,
  MessageCircle,
  Send,
  Twitter,
  Facebook,
  Link2,
  Mail,
  Check,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'

interface SocialShareProps {
  productName: string
  productId: string
}

const shareOptions = [
  {
    key: 'whatsapp',
    label: 'واتساب',
    icon: MessageCircle,
    color: '#25D366',
    bgColor: 'bg-[#25D366]/10 hover:bg-[#25D366]/20 dark:bg-[#25D366]/15 dark:hover:bg-[#25D366]/25',
    getLink: (url: string, name: string) =>
      `https://wa.me/?text=${encodeURIComponent(name + ' ' + url)}`,
  },
  {
    key: 'telegram',
    label: 'تيليجرام',
    icon: Send,
    color: '#0088cc',
    bgColor: 'bg-[#0088cc]/10 hover:bg-[#0088cc]/20 dark:bg-[#0088cc]/15 dark:hover:bg-[#0088cc]/25',
    getLink: (url: string, name: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(name)}`,
  },
  {
    key: 'twitter',
    label: 'إكس / تويتر',
    icon: Twitter,
    color: '#000000',
    bgColor: 'bg-foreground/10 hover:bg-foreground/20 dark:bg-white/10 dark:hover:bg-white/20',
    getLink: (url: string, name: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(name)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: 'facebook',
    label: 'فيسبوك',
    icon: Facebook,
    color: '#1877F2',
    bgColor: 'bg-[#1877F2]/10 hover:bg-[#1877F2]/20 dark:bg-[#1877F2]/15 dark:hover:bg-[#1877F2]/25',
    getLink: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: 'email',
    label: 'البريد الإلكتروني',
    icon: Mail,
    color: '#D4A574',
    bgColor: 'bg-[#D4A574]/10 hover:bg-[#D4A574]/20 dark:bg-[#D4A574]/15 dark:hover:bg-[#D4A574]/25',
    getLink: (url: string, name: string) =>
      `mailto:?subject=${encodeURIComponent(name)}&body=${encodeURIComponent(name + '\n' + url)}`,
  },
]

export default function SocialShare({ productName, productId }: SocialShareProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?product=${productId}`
    : ''

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl)
      setCopied(true)
      toast.success('تم نسخ رابط المنتج')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = productUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      toast.success('تم نسخ رابط المنتج')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareClick = (option: typeof shareOptions[number]) => {
    const link = option.getLink(productUrl, productName)
    window.open(link, '_blank', 'noopener,noreferrer,width=600,height=500')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="h-12 w-12 rounded-xl border border-border bg-background flex items-center justify-center transition-colors hover:border-[#D4A574]/50 hover:bg-[#D4A574]/5"
          aria-label="مشاركة المنتج"
        >
          <Share2 className="h-5 w-5 text-muted-foreground hover:text-[#D4A574] transition-colors" />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-3 rounded-2xl border border-[#D4A574]/20 dark:border-[#D4A574]/30 dark-glow-card"
        side="bottom"
        align="center"
        dir="rtl"
      >
        <div className="space-y-1">
          {/* Header */}
          <div className="flex items-center gap-2 px-2 pb-2 mb-1 border-b border-border/50">
            <Share2 className="h-4 w-4 text-[#D4A574]" />
            <span className="text-sm font-semibold text-foreground">مشاركة المنتج</span>
          </div>

          {/* Share Options */}
          <AnimatePresence>
            {shareOptions.map((option, index) => (
              <motion.button
                key={option.key}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                onClick={() => handleShareClick(option)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-[#D4A574]/10 dark:hover:bg-[#D4A574]/15 group"
              >
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${option.bgColor}`}
                >
                  <option.icon
                    className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
                    style={{ color: option.color }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-[#D4A574] transition-colors">
                  {option.label}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>

          {/* Copy Link */}
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: shareOptions.length * 0.05, duration: 0.2 }}
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-[#D4A574]/10 dark:hover:bg-[#D4A574]/15 group"
          >
            <div className="h-9 w-9 rounded-lg bg-[#D4A574]/10 hover:bg-[#D4A574]/20 dark:bg-[#D4A574]/15 dark:hover:bg-[#D4A574]/25 flex items-center justify-center transition-colors">
              {copied ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Check className="h-4 w-4 text-emerald-500" />
                </motion.div>
              ) : (
                <Link2 className="h-4 w-4 text-[#D4A574] transition-transform duration-200 group-hover:scale-110" />
              )}
            </div>
            <span className="text-sm font-medium text-foreground group-hover:text-[#D4A574] transition-colors">
              {copied ? 'تم النسخ!' : 'نسخ الرابط'}
            </span>
          </motion.button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

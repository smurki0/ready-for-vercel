'use client'

import { motion } from 'framer-motion'
import {
  Award,
  Star,
  Gift,
  Percent,
  Truck,
  Sparkles,
  Crown,
  Medal,
  Lock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

// Tier definitions - visual design preserved
const tiers = [
  {
    name: 'برونزية',
    icon: Medal,
    minPoints: 0,
    maxPoints: 499,
    color: '#CD7F32',
    bgGradient: 'from-[#CD7F32]/20 to-[#CD7F32]/5',
  },
  {
    name: 'فضية',
    icon: Award,
    minPoints: 500,
    maxPoints: 1999,
    color: '#A8A9AD',
    bgGradient: 'from-[#A8A9AD]/20 to-[#A8A9AD]/5',
  },
  {
    name: 'ذهبية',
    icon: Crown,
    minPoints: 2000,
    maxPoints: 4999,
    color: '#D4A574',
    bgGradient: 'from-[#D4A574]/20 to-[#D4A574]/5',
  },
  {
    name: 'ألماسية',
    icon: Sparkles,
    minPoints: 5000,
    maxPoints: Infinity,
    color: '#B9F2FF',
    bgGradient: 'from-[#B9F2FF]/20 to-[#B9F2FF]/5',
  },
]

export default function LoyaltySection() {
  const BronzeIcon = tiers[0].icon

  return (
    <div className="space-y-6">
      {/* Coming Soon Card - preserves visual design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="rounded-2xl border-border/50 overflow-hidden">
          <div className="relative bg-gradient-to-l from-[#D4A574]/15 to-[#C4A4A4]/10 p-6 sm:p-8">
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 opacity-10">
              <BronzeIcon className="h-24 w-24" style={{ color: '#D4A574' }} />
            </div>
            <div className="absolute bottom-4 right-4 opacity-5">
              <Star className="h-16 w-16" style={{ color: '#D4A574' }} />
            </div>

            <div className="relative text-center">
              {/* Lock icon */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#b8885a] flex items-center justify-center shadow-lg shadow-[#D4A574]/20 mb-6"
              >
                <Lock className="h-10 w-10 text-white" />
              </motion.div>

              <h3 className="text-2xl font-bold text-foreground mb-3">
                برنامج الولاء
              </h3>

              <div className="inline-flex items-center gap-1.5 bg-[#D4A574]/10 text-[#D4A574] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                قريباً
              </div>

              <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed mb-6">
                نعمل على إطلاق برنامج ولاء مميز يكافئك على كل عملية شراء. سيتم إطلاقه قريباً مع نقاط ومكافآت حصرية!
              </p>

              {/* Tier preview - shows the visual tiers coming soon */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {tiers.map((tier, idx) => {
                  const TierI = tier.icon
                  return (
                    <div key={tier.name} className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] opacity-50"
                        style={{
                          backgroundColor: `${tier.color}15`,
                          color: tier.color,
                        }}
                      >
                        <TierI className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{tier.name}</span>
                      </div>
                      {idx < tiers.length - 1 && (
                        <div className="h-px w-4 bg-border/30" />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Coming soon rewards preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-background/50 border border-border/20 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#D4A57415' }}>
                    <Percent className="h-5 w-5" style={{ color: '#D4A574' }} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold">خصومات حصرية</p>
                    <p className="text-[10px] text-muted-foreground">للأعضاء المميزين</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-background/50 border border-border/20 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#8B6F6F15' }}>
                    <Truck className="h-5 w-5" style={{ color: '#8B6F6F' }} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold">شحن مجاني</p>
                    <p className="text-[10px] text-muted-foreground">للطلبات المميزة</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-background/50 border border-border/20 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#C4A4A415' }}>
                    <Gift className="h-5 w-5" style={{ color: '#C4A4A4' }} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold">هدايا ومفاجآت</p>
                    <p className="text-[10px] text-muted-foreground">بمناسبات خاصة</p>
                  </div>
                </div>
              </div>

              {/* Progress placeholder */}
              <div className="max-w-xs mx-auto">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>التحضير للإطلاق</span>
                  <span className="text-[#D4A574] font-medium">70%</span>
                </div>
                <Progress value={70} className="h-3 rounded-full bg-background/50" />
                <p className="text-[10px] text-muted-foreground mt-2">
                  سنتواصل معك فور إطلاق البرنامج
                </p>
              </div>

              <Button
                className="mt-6 rounded-xl gap-2 bg-gradient-to-l from-[#D4A574] to-[#b8885a] hover:from-[#b8885a] hover:to-[#a07848] text-white shadow-md shadow-[#D4A574]/15"
                onClick={() => {
                  // Will be connected to notification subscription
                }}
              >
                <Sparkles className="h-4 w-4" />
                أبلغيني عند الإطلاق
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

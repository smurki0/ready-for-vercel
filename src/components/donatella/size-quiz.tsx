'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Ruler,
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Sparkles,
  User,
  RulerIcon,
  Shirt,
  Calendar,
  Star,
  X,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'

interface QuizStep {
  id: string
  title: string
  icon: React.ReactNode
  options: { value: string; label: string; description?: string }[]
}

const quizSteps: QuizStep[] = [
  {
    id: 'bodyType',
    title: 'نوع جسمكِ',
    icon: <User className="h-5 w-5" />,
    options: [
      { value: 'hourglass', label: 'ساعة رملية', description: 'الأكتاف والورك متساويان مع خصر محدد' },
      { value: 'pear', label: 'كمثرى', description: 'الورك أعرض من الأكتاف' },
      { value: 'apple', label: 'تفاحة', description: 'الجزء العلوي أعرض من الورك' },
      { value: 'rectangle', label: 'مستطيل', description: 'الأكتاف والورك والخصر متقاربون' },
      { value: 'triangle', label: 'مثلث', description: 'الأكتاف أعرض من الورك' },
    ],
  },
  {
    id: 'height',
    title: 'طولكِ',
    icon: <RulerIcon className="h-5 w-5" />,
    options: [
      { value: 'short', label: 'قصيرة', description: 'أقل من 160 سم' },
      { value: 'medium', label: 'متوسطة', description: '160 - 170 سم' },
      { value: 'tall', label: 'طويلة', description: 'أكثر من 170 سم' },
    ],
  },
  {
    id: 'usualSize',
    title: 'مقاسك المعتاد',
    icon: <Shirt className="h-5 w-5" />,
    options: [
      { value: 'XS', label: 'XS', description: 'محيط صدر 80-84 سم' },
      { value: 'S', label: 'S', description: 'محيط صدر 84-88 سم' },
      { value: 'M', label: 'M', description: 'محيط صدر 88-92 سم' },
      { value: 'L', label: 'L', description: 'محيط صدر 92-96 سم' },
      { value: 'XL', label: 'XL', description: 'محيط صدر 96-100 سم' },
    ],
  },
  {
    id: 'preference',
    title: 'تفضيلكِ',
    icon: <Star className="h-5 w-5" />,
    options: [
      { value: 'tight', label: 'ضيق', description: 'يُبرز شكل الجسم' },
      { value: 'fitted', label: 'مناسب', description: 'مريح وأنيق' },
      { value: 'loose', label: 'فضفاض', description: 'حرية حركة كاملة' },
    ],
  },
  {
    id: 'occasion',
    title: 'المناسبة',
    icon: <Calendar className="h-5 w-5" />,
    options: [
      { value: 'casual', label: 'يومي', description: 'للاستخدام اليومي' },
      { value: 'work', label: 'عمل', description: 'للمكتب والعمل' },
      { value: 'evening', label: 'سهرة', description: 'للمناسبات والسهرات' },
      { value: 'sport', label: 'رياضة', description: 'للنشاط البدني' },
    ],
  },
]

// Size recommendation logic
function getSizeRecommendation(answers: Record<string, string>): {
  size: string
  confidence: number
  description: string
  fit: string
} {
  const usualSize = answers.usualSize || 'M'
  const preference = answers.preference || 'fitted'
  const bodyType = answers.bodyType || 'rectangle'
  const height = answers.height || 'medium'

  const sizeMap: Record<string, number> = { XS: 0, S: 1, M: 2, L: 3, XL: 4 }
  const sizeLabels = ['XS', 'S', 'M', 'L', 'XL']
  let sizeIndex = sizeMap[usualSize] ?? 2
  let confidence = 85
  let fitDesc = ''

  // Adjust based on preference
  if (preference === 'tight') {
    // Keep same size or go one down
    confidence -= 5
    fitDesc = 'قصة ضيقة تُبرز جسمكِ'
  } else if (preference === 'loose') {
    sizeIndex = Math.min(sizeIndex + 1, 4)
    confidence -= 3
    fitDesc = 'قصة فضفاضة مريحة وأنيقة'
  } else {
    fitDesc = 'قصة مناسبة مريحة ومتناسقة'
  }

  // Adjust based on body type
  if (bodyType === 'hourglass') {
    confidence += 5
    fitDesc += ' - مثالي لشكل ساعة الرمل'
  } else if (bodyType === 'pear') {
    confidence += 2
    fitDesc += ' - مصمم ليتناسب مع الورك'
  } else if (bodyType === 'apple') {
    sizeIndex = Math.min(sizeIndex + 1, 4)
    confidence -= 2
  }

  // Adjust based on height
  if (height === 'short') {
    confidence -= 3
  } else if (height === 'tall') {
    confidence += 3
  }

  // Occasion adjustments
  if (answers.occasion === 'evening') {
    confidence -= 2
  }

  confidence = Math.min(98, Math.max(65, confidence))

  return {
    size: sizeLabels[sizeIndex],
    confidence,
    description: fitDesc,
    fit: preference === 'tight' ? 'ضيق' : preference === 'loose' ? 'فضفاض' : 'مناسب',
  }
}

const sizeChartData = [
  { size: 'XS', chest: '80-84', waist: '60-64', hip: '88-92' },
  { size: 'S', chest: '84-88', waist: '64-68', hip: '92-96' },
  { size: 'M', chest: '88-92', waist: '68-72', hip: '96-100' },
  { size: 'L', chest: '92-96', waist: '72-76', hip: '100-104' },
  { size: 'XL', chest: '96-100', waist: '76-80', hip: '104-108' },
]

interface SizeQuizProps {
  onClose?: () => void
  compact?: boolean
}

export default function SizeQuiz({ onClose, compact }: SizeQuizProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)

  const progress = ((currentStep + (showResult ? 1 : 0)) / (quizSteps.length + 1)) * 100

  const handleSelect = useCallback((stepId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [stepId]: value }))
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setShowResult(true)
    }
  }, [currentStep])

  const handlePrev = useCallback(() => {
    if (showResult) {
      setShowResult(false)
    } else if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep, showResult])

  const handleReset = useCallback(() => {
    setCurrentStep(0)
    setAnswers({})
    setShowResult(false)
  }, [])

  const recommendation = getSizeRecommendation(answers)

  const step = quizSteps[currentStep]
  const isStepComplete = step ? !!answers[step.id] : false

  if (compact && showResult) {
    // Compact result mode for product detail page
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#D4A574]/10 flex items-center justify-center">
            <Ruler className="h-4 w-4 text-[#D4A574]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">المقاس المُقترح</p>
            <p className="text-xs text-muted-foreground">بناءً على إجاباتك</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#D4A574]/5 border border-[#D4A574]/20">
          <div className="h-12 w-12 rounded-xl bg-[#D4A574] flex items-center justify-center text-white font-bold text-lg">
            {recommendation.size}
          </div>
          <div>
            <p className="font-semibold text-foreground">{recommendation.size} - قصة {recommendation.fit}</p>
            <p className="text-xs text-muted-foreground">{recommendation.description}</p>
            <div className="flex items-center gap-1 mt-1">
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
                {recommendation.confidence}% ثقة
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-[#D4A574] gap-1"
          onClick={handleReset}
        >
          <RotateCcw className="h-3 w-3" />
          أعد الاختبار
        </Button>
      </div>
    )
  }

  return (
    <div className={`${compact ? '' : 'pt-6 pb-16 min-h-screen'}`}>
      <div className={`${compact ? '' : 'max-w-2xl mx-auto px-4 sm:px-6'}`}>
        {/* Header */}
        {!compact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A574]/10 border border-[#D4A574]/20 mb-4">
              <Ruler className="h-4 w-4 text-[#D4A574]" />
              <span className="text-sm font-medium text-[#D4A574]">دليل المقاسات الذكي</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">اختاري مقاسك المثالي</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              أجيبي عن 5 أسئلة بسيطة وسنساعدك في اختيار المقاس الأنسب لكِ
            </p>
          </motion.div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              {showResult ? 'النتيجة' : `الخطوة ${currentStep + 1} من ${quizSteps.length}`}
            </span>
            <span className="text-xs font-medium text-[#D4A574]">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-secondary/50 [&>div]:bg-gradient-to-l [&>div]:from-[#D4A574] [&>div]:to-[#C4A4A4]" />
        </div>

        {/* Quiz Content */}
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-[#D4A574]/10 flex items-center justify-center text-[#D4A574]">
                  {step.icon}
                </div>
                <h2 className="text-xl font-bold text-foreground">{step.title}</h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {step.options.map((option, i) => {
                  const isSelected = answers[step.id] === option.value
                  return (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(step.id, option.value)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-right ${
                        isSelected
                          ? 'border-[#D4A574] bg-[#D4A574]/5 shadow-sm'
                          : 'border-border/50 hover:border-border bg-card'
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-[#D4A574] bg-[#D4A574]' : 'border-border'
                      }`}>
                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isSelected ? 'text-[#D4A574]' : 'text-foreground'}`}>
                          {option.label}
                        </p>
                        {option.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Result Card */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="inline-flex h-24 w-24 rounded-2xl bg-gradient-to-bl from-[#D4A574] to-[#C4A4A4] items-center justify-center text-white font-bold text-4xl shadow-xl shadow-[#D4A574]/30"
                >
                  {recommendation.size}
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">مقاسك المثالي</h2>
                  <p className="text-muted-foreground mt-1">بناءً على إجاباتك، ننصحك بالمقاس التالي</p>
                </div>
              </div>

              {/* Recommendation Details */}
              <Card className="p-5 space-y-4 border-[#D4A574]/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">المقاس المُقترح</span>
                  <Badge className="bg-[#D4A574] text-white border-0 text-sm px-3">{recommendation.size}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">القصة</span>
                  <span className="font-medium">{recommendation.fit}</span>
                </div>
                <Separator className="bg-border/50" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">نسبة الثقة</span>
                  <div className="flex items-center gap-2">
                    <Progress value={recommendation.confidence} className="w-20 h-2 bg-secondary/50 [&>div]:bg-emerald-500" />
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {recommendation.confidence}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground bg-secondary/30 rounded-xl p-3">
                  <Info className="h-4 w-4 inline ml-1 text-[#D4A574]" />
                  {recommendation.description}
                </p>
              </Card>

              {/* Size Chart */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-[#D4A574]" />
                  جدول المقاسات
                </h3>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-3 py-2.5 text-right font-semibold">المقاس</th>
                        <th className="px-3 py-2.5 text-center font-semibold">الصدر</th>
                        <th className="px-3 py-2.5 text-center font-semibold">الخصر</th>
                        <th className="px-3 py-2.5 text-center font-semibold">الورك</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChartData.map((row) => {
                        const isRecommended = row.size === recommendation.size
                        return (
                          <tr
                            key={row.size}
                            className={`${isRecommended ? 'bg-[#D4A574]/10' : 'bg-background'} ${
                              isRecommended ? 'font-semibold' : ''
                            }`}
                          >
                            <td className="px-3 py-2.5 text-right">
                              <div className="flex items-center gap-2">
                                {isRecommended && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring' }}
                                  >
                                    <Check className="h-3.5 w-3.5 text-[#D4A574]" />
                                  </motion.div>
                                )}
                                <span className={isRecommended ? 'text-[#D4A574]' : ''}>{row.size}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-center text-muted-foreground">{row.chest}</td>
                            <td className="px-3 py-2.5 text-center text-muted-foreground">{row.waist}</td>
                            <td className="px-3 py-2.5 text-center text-muted-foreground">{row.hip}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
                  جميع المقاسات بالسنتيمتر • المقاس المُقترح مُميّز بالذهبي
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 gap-3">
          <Button
            variant="outline"
            className="rounded-xl gap-2"
            onClick={currentStep === 0 && !showResult ? (onClose || handleReset) : handlePrev}
            disabled={false}
          >
            {currentStep === 0 && !showResult ? (
              onClose ? (
                <>
                  <X className="h-4 w-4" />
                  إغلاق
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  إعادة
                </>
              )
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                السابق
              </>
            )}
          </Button>

          {!showResult && (
            <Button
              className="rounded-xl gap-2 bg-gradient-to-l from-[#D4A574] to-[#C4A4A4] text-white border-0 hover:opacity-90"
              onClick={handleNext}
              disabled={!isStepComplete}
            >
              {currentStep === quizSteps.length - 1 ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  عرض النتيجة
                </>
              ) : (
                <>
                  التالي
                  <ArrowLeft className="h-4 w-4" />
                </>
              )}
            </Button>
          )}

          {showResult && (
            <Button
              variant="outline"
              className="rounded-xl gap-2 border-[#D4A574]/30 text-[#D4A574] hover:bg-[#D4A574]/5"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
              أعد الاختبار
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

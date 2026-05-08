import { db } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding admin data...')

  // ─── Shipping Zones (Egyptian Governorates) ───────────────────
  const shippingZones = [
    { nameAr: 'القاهرة', nameEn: 'Cairo', region: 'cairo', price: 35, freeAbove: 500, estimatedDays: '2-3', active: true, order: 1 },
    { nameAr: 'الجيزة', nameEn: 'Giza', region: 'giza', price: 35, freeAbove: 500, estimatedDays: '2-3', active: true, order: 2 },
    { nameAr: 'الإسكندرية', nameEn: 'Alexandria', region: 'alexandria', price: 50, freeAbove: 700, estimatedDays: '3-4', active: true, order: 3 },
    { nameAr: 'القليوبية', nameEn: 'Qalyubia', region: 'qalyubia', price: 40, freeAbove: 600, estimatedDays: '2-3', active: true, order: 4 },
    { nameAr: 'الشرقية', nameEn: 'Sharqia', region: 'sharqia', price: 55, freeAbove: 800, estimatedDays: '3-5', active: true, order: 5 },
    { nameAr: 'الدقهلية', nameEn: 'Dakahlia', region: 'dakahlia', price: 55, freeAbove: 800, estimatedDays: '3-5', active: true, order: 6 },
    { nameAr: 'البحيرة', nameEn: 'Beheira', region: 'beheira', price: 55, freeAbove: 800, estimatedDays: '3-5', active: true, order: 7 },
    { nameAr: 'المنوفية', nameEn: 'Monufia', region: 'monufia', price: 45, freeAbove: 700, estimatedDays: '3-4', active: true, order: 8 },
    { nameAr: 'الغربية', nameEn: 'Gharbia', region: 'gharbia', price: 50, freeAbove: 700, estimatedDays: '3-4', active: true, order: 9 },
    { nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', region: 'kafr-el-sheikh', price: 60, freeAbove: 900, estimatedDays: '3-5', active: true, order: 10 },
    { nameAr: 'دمياط', nameEn: 'Damietta', region: 'damietta', price: 60, freeAbove: 900, estimatedDays: '3-5', active: true, order: 11 },
    { nameAr: 'بورسعيد', nameEn: 'Port Said', region: 'port-said', price: 65, freeAbove: 900, estimatedDays: '3-5', active: true, order: 12 },
    { nameAr: 'الإسماعيلية', nameEn: 'Ismailia', region: 'ismailia', price: 60, freeAbove: 900, estimatedDays: '3-5', active: true, order: 13 },
    { nameAr: 'السويس', nameEn: 'Suez', region: 'suez', price: 65, freeAbove: 900, estimatedDays: '3-5', active: true, order: 14 },
    { nameAr: 'شمال سيناء', nameEn: 'North Sinai', region: 'north-sinai', price: 80, freeAbove: 1200, estimatedDays: '5-7', active: true, order: 15 },
    { nameAr: 'جنوب سيناء', nameEn: 'South Sinai', region: 'south-sinai', price: 80, freeAbove: 1200, estimatedDays: '5-7', active: true, order: 16 },
    { nameAr: 'الفيوم', nameEn: 'Fayoum', region: 'fayoum', price: 60, freeAbove: 900, estimatedDays: '3-5', active: true, order: 17 },
    { nameAr: 'بني سويف', nameEn: 'Beni Suef', region: 'beni-suef', price: 65, freeAbove: 900, estimatedDays: '3-5', active: true, order: 18 },
    { nameAr: 'المنيا', nameEn: 'Minya', region: 'minya', price: 70, freeAbove: 1000, estimatedDays: '4-6', active: true, order: 19 },
    { nameAr: 'أسيوط', nameEn: 'Asyut', region: 'asyut', price: 75, freeAbove: 1000, estimatedDays: '4-6', active: true, order: 20 },
    { nameAr: 'سوهاج', nameEn: 'Sohag', region: 'sohag', price: 75, freeAbove: 1000, estimatedDays: '4-6', active: true, order: 21 },
    { nameAr: 'قنا', nameEn: 'Qena', region: 'qena', price: 80, freeAbove: 1100, estimatedDays: '5-7', active: true, order: 22 },
    { nameAr: 'الأقصر', nameEn: 'Luxor', region: 'luxor', price: 80, freeAbove: 1100, estimatedDays: '5-7', active: true, order: 23 },
    { nameAr: 'أسوان', nameEn: 'Aswan', region: 'aswan', price: 85, freeAbove: 1200, estimatedDays: '5-7', active: true, order: 24 },
    { nameAr: 'البحر الأحمر', nameEn: 'Red Sea', region: 'red-sea', price: 90, freeAbove: 1300, estimatedDays: '5-7', active: true, order: 25 },
    { nameAr: 'الوادي الجديد', nameEn: 'New Valley', region: 'new-valley', price: 95, freeAbove: 1500, estimatedDays: '6-8', active: true, order: 26 },
    { nameAr: 'مطروح', nameEn: 'Matrouh', region: 'matrouh', price: 90, freeAbove: 1300, estimatedDays: '5-7', active: true, order: 27 },
  ]

  for (const zone of shippingZones) {
    await db.shippingZone.upsert({
      where: { region: zone.region },
      update: zone,
      create: zone,
    })
  }
  console.log(`✅ Seeded ${shippingZones.length} shipping zones`)

  // ─── Site Settings ─────────────────────────────────────────
  const siteSettings = [
    { key: 'siteName', value: 'DONATELLA' },
    { key: 'siteLogo', value: '/logo.png' },
    { key: 'currency', value: 'EGP' },
    { key: 'theme', value: 'light' },
    { key: 'contactEmail', value: 'info@donatella.com' },
    { key: 'contactPhone', value: '+201000000000' },
    { key: 'contactAddress', value: 'القاهرة، مصر' },
    { key: 'whatsapp', value: '+201000000000' },
    { key: 'instagram', value: 'https://instagram.com/donatella' },
    { key: 'twitter', value: 'https://twitter.com/donatella' },
    { key: 'facebook', value: 'https://facebook.com/donatella' },
    { key: 'tiktok', value: 'https://tiktok.com/@donatella' },
    { key: 'website', value: 'https://donatella.com' },
    // Homepage section visibility
    { key: 'showHeroBanner', value: 'true' },
    { key: 'showFeaturedProducts', value: 'true' },
    { key: 'showNewArrivals', value: 'true' },
    { key: 'showCategories', value: 'true' },
    { key: 'showTestimonials', value: 'true' },
    { key: 'showNewsletter', value: 'true' },
    { key: 'showTrustBadges', value: 'true' },
    { key: 'showFlashSale', value: 'true' },
    { key: 'showTrending', value: 'true' },
    { key: 'showPromoBanner', value: 'true' },
    { key: 'showGiftCards', value: 'true' },
    { key: 'showRecentlyAdded', value: 'true' },
    { key: 'showStoreLocator', value: 'true' },
    { key: 'showStyleRecommendations', value: 'true' },
    // Homepage section order
    { key: 'heroOrder', value: '1' },
    { key: 'trustBadgesOrder', value: '2' },
    { key: 'styleRecommendationsOrder', value: '3' },
    { key: 'featuredOrder', value: '4' },
    { key: 'categoriesOrder', value: '5' },
    { key: 'flashSaleOrder', value: '6' },
    { key: 'trendingOrder', value: '7' },
    { key: 'promoOrder', value: '8' },
    { key: 'giftCardsOrder', value: '9' },
    { key: 'testimonialsOrder', value: '10' },
    { key: 'newArrivalsOrder', value: '11' },
    { key: 'recentlyAddedOrder', value: '12' },
    { key: 'newsletterOrder', value: '13' },
    { key: 'storeLocatorOrder', value: '14' },
    // Homepage section content
    { key: 'featuredTitle', value: 'المنتجات المميزة' },
    { key: 'trendingBadge', value: 'موسم ربيع 2026' },
    { key: 'trendingTitle', value: 'مجموعة ربيع 2026' },
    { key: 'trendingSubtitle', value: 'تصاميم مستوحاة من أناقة الطبيعة' },
    { key: 'trendingDescription', value: 'اكتشفي أحدث تشكيلاتنا المستوحاة من ألوان الربيع الدافئة وتفاصيل الطبيعة الساحرة. قطع فريدة تجمع بين الأصالة والحداثة لتضيف لمسة ساحرة لإطلالتك.' },
    { key: 'trendingCtaText', value: 'تسوقي المجموعة' },
    { key: 'promoBadge', value: 'عرض محدود' },
    { key: 'promoTitle', value: 'خصم 20% على جميع الفساتين' },
    { key: 'promoDescription', value: 'استمتعي بخصم حصري على مجموعة الفساتين المميزة. العرض ينتهي قريباً!' },
    { key: 'promoCtaText', value: 'تسوقي الآن' },
    // Order settings
    { key: 'freeShippingThreshold', value: '500' },
    { key: 'defaultShippingCost', value: '50' },
    { key: 'orderPrefix', value: 'DON' },
    { key: 'enableCOD', value: 'true' },
    { key: 'enableOnlinePayment', value: 'false' },
    // Tax settings
    { key: 'taxEnabled', value: 'true' },
    { key: 'taxRate', value: '14' },
    { key: 'taxLabel', value: 'ضريبة القيمة المضافة' },
    { key: 'taxNumber', value: '' },
    // Payment methods
    { key: 'enableCreditCard', value: 'false' },
    { key: 'enableApplePay', value: 'false' },
    { key: 'enableVodafoneCash', value: 'true' },
    { key: 'enableInstapay', value: 'false' },
    // Payment labels
    { key: 'codLabel', value: 'الدفع عند الاستلام' },
    { key: 'codDescription', value: 'ادفعي عند التوصيل' },
    { key: 'creditCardLabel', value: 'بطاقة ائتمانية' },
    { key: 'creditCardDescription', value: 'Visa / Mastercard' },
    { key: 'applePayLabel', value: 'Apple Pay' },
    { key: 'applePayDescription', value: 'دفع سريع وآمن' },
    { key: 'vodafoneCashLabel', value: 'فودافون كاش' },
    { key: 'vodafoneCashDescription', value: 'ادفعي عبر فودافون كاش' },
    { key: 'instapayLabel', value: 'انستاباي' },
    { key: 'instapayDescription', value: 'تحويل فوري عبر انستاباي' },
    // Payment instructions
    { key: 'codInstructions', value: 'سيتم الدفع عند استلام الطلب. يرجى تجهيز المبلغ المطلوب.' },
    { key: 'creditCardInstructions', value: 'سيتم تحويلك لبوابة الدفع الآمنة لإتمام العملية.' },
    { key: 'applePayInstructions', value: 'سيتم فتح واجهة Apple Pay لإتمام الدفع بشكل آمن.' },
    { key: 'vodafoneCashInstructions', value: 'سيتم إرسال رقم المحفظة ورابط الدفع عبر رسالة.' },
    { key: 'instapayInstructions', value: 'سيتم تحويلك لتطبيق انستاباي لإتمام التحويل.' },
    // Store settings
    { key: 'maintenanceMode', value: 'false' },
    { key: 'allowRegistration', value: 'true' },
    { key: 'allowGuestCheckout', value: 'false' },
    { key: 'minOrderAmount', value: '0' },
  ]

  for (const setting of siteSettings) {
    await db.siteSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }
  console.log(`✅ Seeded ${siteSettings.length} site settings`)

  console.log('🎉 Admin data seeding complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })

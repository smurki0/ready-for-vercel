import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await db.user.upsert({
    where: { email: 'admin@donatella.com' },
    update: {},
    create: {
      email: 'admin@donatella.com',
      name: 'مدير المتجر',
      password: adminPassword,
      role: 'admin',
      phone: '+201000000000',
    },
  });

  console.log('✅ Created admin user');

  // Create categories with fixed image paths
  await Promise.all([
    db.category.upsert({
      where: { slug: 'dresses' },
      update: { image: '/products/dress-1.png' },
      create: {
        nameAr: 'فساتين',
        nameEn: 'Dresses',
        slug: 'dresses',
        image: '/products/dress-1.png',
        description: 'أجمل الفساتين لمختلف المناسبات',
        order: 1,
      },
    }),
    db.category.upsert({
      where: { slug: 'casual' },
      update: { image: '/products/casual-1.png' },
      create: {
        nameAr: 'ملابس يومية',
        nameEn: 'Casual',
        slug: 'casual',
        image: '/products/casual-1.png',
        description: 'ملابس يومية أنيقة ومريحة',
        order: 2,
      },
    }),
    db.category.upsert({
      where: { slug: 'evening' },
      update: { image: '/products/evening-1.png' },
      create: {
        nameAr: 'سهرات',
        nameEn: 'Evening',
        slug: 'evening',
        image: '/products/evening-1.png',
        description: 'إطلالات سهرات فاخرة',
        order: 3,
      },
    }),
    db.category.upsert({
      where: { slug: 'accessories' },
      update: { image: '/products/accessory-1.png' },
      create: {
        nameAr: 'إكسسوارات',
        nameEn: 'Accessories',
        slug: 'accessories',
        image: '/products/accessory-1.png',
        description: 'إكسسوارات أنيقة تكمل إطلالتك',
        order: 4,
      },
    }),
  ]);

  console.log('✅ Created 4 categories');

  // Create site settings
  const settings = [
    { key: 'siteName', value: 'DONATELLA' },
    { key: 'siteNameAr', value: 'دوناتيلا' },
    { key: 'primaryColor', value: '#C4A4A4' },
    { key: 'secondaryColor', value: '#F5EDE6' },
    { key: 'accentColor', value: '#FDE8E8' },
    { key: 'currency', value: 'ج.م' },
    { key: 'currencyEn', value: 'EGP' },
  ];

  for (const setting of settings) {
    await db.siteSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✅ Created site settings');

  console.log('✅ Seeding completed!');
  console.log('👤 Admin: admin@donatella.com / admin123');
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());

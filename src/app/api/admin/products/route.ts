import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

const createProductSchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  discount: z.number().min(0).max(100).default(0),
  images: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  stock: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  categoryId: z.string().min(1, 'Category is required'),
  // Card Display Fields
  subtitleAr: z.string().optional(),
  subtitleEn: z.string().optional(),
  brand: z.string().optional(),
  badgeTextAr: z.string().optional(),
  badgeTextEn: z.string().optional(),
  isNew: z.boolean().default(false),
  freeShipping: z.boolean().default(false),
  freeShippingThreshold: z.number().optional(),
  // Product Details
  sku: z.string().optional(),
  tags: z.array(z.string()).default([]),
  materialAr: z.string().optional(),
  materialEn: z.string().optional(),
  weight: z.number().optional(),
  // Order Constraints
  minOrderQty: z.number().int().min(1).default(1),
  maxOrderQty: z.number().int().optional(),
  // Shipping & Delivery
  shippingTimeAr: z.string().optional(),
  shippingTimeEn: z.string().optional(),
  videoUrl: z.string().optional(),
  // Care & Returns
  careAr: z.string().optional(),
  careEn: z.string().optional(),
  returnPolicyAr: z.string().optional(),
  returnPolicyEn: z.string().optional(),
  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

function safeJsonParse(value: unknown, fallback: unknown = []) {
  if (value === undefined || value === null || value === 'undefined') return fallback;
  try {
    return JSON.parse(value as string);
  } catch {
    return fallback;
  }
}

function parseProduct(product: Record<string, unknown>) {
  return {
    ...product,
    images: safeJsonParse(product.images, []),
    sizes: safeJsonParse(product.sizes, []),
    colors: safeJsonParse(product.colors, []),
    tags: safeJsonParse(product.tags, []),
  };
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const products = await db.product.findMany({
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON fields
    const parsedProducts = products.map((product) => parseProduct(product));

    return successResponse(parsedProducts);
  } catch (err) {
    console.error('Admin products GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const result = createProductSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const data = result.data;

    // Verify category exists
    const category = await db.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      return errorResponse('Category not found', 404);
    }

    const product = await db.product.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr || null,
        descriptionEn: data.descriptionEn || null,
        price: data.price,
        discount: data.discount,
        images: JSON.stringify(data.images),
        sizes: JSON.stringify(data.sizes),
        colors: JSON.stringify(data.colors),
        stock: data.stock,
        featured: data.featured,
        active: data.active,
        categoryId: data.categoryId,
        // Card Display Fields
        subtitleAr: data.subtitleAr || null,
        subtitleEn: data.subtitleEn || null,
        brand: data.brand || null,
        badgeTextAr: data.badgeTextAr || null,
        badgeTextEn: data.badgeTextEn || null,
        isNew: data.isNew,
        freeShipping: data.freeShipping,
        freeShippingThreshold: data.freeShippingThreshold ?? null,
        // Product Details
        sku: data.sku || null,
        tags: JSON.stringify(data.tags),
        materialAr: data.materialAr || null,
        materialEn: data.materialEn || null,
        weight: data.weight ?? null,
        // Order Constraints
        minOrderQty: data.minOrderQty,
        maxOrderQty: data.maxOrderQty ?? null,
        // Shipping & Delivery
        shippingTimeAr: data.shippingTimeAr || null,
        shippingTimeEn: data.shippingTimeEn || null,
        videoUrl: data.videoUrl || null,
        // Care & Returns
        careAr: data.careAr || null,
        careEn: data.careEn || null,
        returnPolicyAr: data.returnPolicyAr || null,
        returnPolicyEn: data.returnPolicyEn || null,
        // SEO
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
      },
      include: {
        category: true,
      },
    });

    const parsedProduct = parseProduct(product);

    return successResponse(parsedProduct, 201);
  } catch (err) {
    console.error('Admin product POST error:', err);
    return errorResponse('Internal server error', 500);
  }
}

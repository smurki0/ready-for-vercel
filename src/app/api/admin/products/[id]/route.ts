import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

const updateProductSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.number().min(0).optional(),
  discount: z.number().min(0).max(100).optional(),
  images: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  categoryId: z.string().min(1).optional(),
  // Card Display Fields
  subtitleAr: z.string().optional(),
  subtitleEn: z.string().optional(),
  brand: z.string().optional(),
  badgeTextAr: z.string().optional(),
  badgeTextEn: z.string().optional(),
  isNew: z.boolean().optional(),
  freeShipping: z.boolean().optional(),
  freeShippingThreshold: z.number().optional(),
  // Product Details
  sku: z.string().optional(),
  tags: z.array(z.string()).optional(),
  materialAr: z.string().optional(),
  materialEn: z.string().optional(),
  weight: z.number().optional(),
  // Order Constraints
  minOrderQty: z.number().int().min(1).optional(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    const parsedProduct = parseProduct(product);

    return successResponse(parsedProduct);
  } catch (err) {
    console.error('Admin product GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateProductSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const data = result.data;

    // Check product exists
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Product not found', 404);
    }

    // If categoryId is being updated, verify it exists
    if (data.categoryId) {
      const category = await db.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        return errorResponse('Category not found', 404);
      }
    }

    // Build update data, stringifying JSON fields
    const updateData: Record<string, unknown> = {};
    if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.descriptionAr !== undefined) updateData.descriptionAr = data.descriptionAr || null;
    if (data.descriptionEn !== undefined) updateData.descriptionEn = data.descriptionEn || null;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.discount !== undefined) updateData.discount = data.discount;
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
    if (data.sizes !== undefined) updateData.sizes = JSON.stringify(data.sizes);
    if (data.colors !== undefined) updateData.colors = JSON.stringify(data.colors);
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    // Card Display Fields
    if (data.subtitleAr !== undefined) updateData.subtitleAr = data.subtitleAr || null;
    if (data.subtitleEn !== undefined) updateData.subtitleEn = data.subtitleEn || null;
    if (data.brand !== undefined) updateData.brand = data.brand || null;
    if (data.badgeTextAr !== undefined) updateData.badgeTextAr = data.badgeTextAr || null;
    if (data.badgeTextEn !== undefined) updateData.badgeTextEn = data.badgeTextEn || null;
    if (data.isNew !== undefined) updateData.isNew = data.isNew;
    if (data.freeShipping !== undefined) updateData.freeShipping = data.freeShipping;
    if (data.freeShippingThreshold !== undefined) updateData.freeShippingThreshold = data.freeShippingThreshold ?? null;
    // Product Details
    if (data.sku !== undefined) updateData.sku = data.sku || null;
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.materialAr !== undefined) updateData.materialAr = data.materialAr || null;
    if (data.materialEn !== undefined) updateData.materialEn = data.materialEn || null;
    if (data.weight !== undefined) updateData.weight = data.weight ?? null;
    // Order Constraints
    if (data.minOrderQty !== undefined) updateData.minOrderQty = data.minOrderQty;
    if (data.maxOrderQty !== undefined) updateData.maxOrderQty = data.maxOrderQty ?? null;
    // Shipping & Delivery
    if (data.shippingTimeAr !== undefined) updateData.shippingTimeAr = data.shippingTimeAr || null;
    if (data.shippingTimeEn !== undefined) updateData.shippingTimeEn = data.shippingTimeEn || null;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl || null;
    // Care & Returns
    if (data.careAr !== undefined) updateData.careAr = data.careAr || null;
    if (data.careEn !== undefined) updateData.careEn = data.careEn || null;
    if (data.returnPolicyAr !== undefined) updateData.returnPolicyAr = data.returnPolicyAr || null;
    if (data.returnPolicyEn !== undefined) updateData.returnPolicyEn = data.returnPolicyEn || null;
    // SEO
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle || null;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription || null;

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    const parsedProduct = parseProduct(product);

    return successResponse(parsedProduct);
  } catch (err) {
    console.error('Admin product PUT error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    await db.product.delete({ where: { id } });

    return successResponse({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Admin product DELETE error:', err);
    return errorResponse('Internal server error', 500);
  }
}

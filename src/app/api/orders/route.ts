import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Generate a unique order number
function generateOrderNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SWF-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      shippingAddress,
      paymentMethod = 'card',
      couponCode = null,
      userId = null,
      items,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);

    // Validate coupon
    let discount = 0;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (coupon.minOrder && subtotal < coupon.minOrder) {
          return NextResponse.json({ error: `Minimum order of $${coupon.minOrder} required for this coupon` }, { status: 400 });
        }
        if (coupon.type === 'percentage') {
          discount = subtotal * (coupon.value / 100);
        } else {
          discount = coupon.value;
        }
        // Increment used count
        await db.coupon.update({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } });
      } else {
        return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 400 });
      }
    }

    // Calculate shipping (get from settings)
    const settings = await db.storeSetting.findMany({ where: { key: { in: ['freeShippingThreshold', 'taxRate', 'currencySymbol'] } } });
    const settingMap: Record<string, string> = {};
    settings.forEach(s => { settingMap[s.key] = s.value; });

    const freeShippingThreshold = parseFloat(settingMap['freeShippingThreshold'] || '75');
    const taxRate = parseFloat(settingMap['taxRate'] || '0') / 100;
    const shipping = subtotal >= freeShippingThreshold ? 0 : 5.99;
    const tax = (subtotal - discount) * taxRate;
    const total = subtotal - discount + shipping + tax;

    // Find or create user
    let finalUserId = userId;
    if (email && !userId) {
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        finalUserId = existingUser.id;
      }
    }

    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: finalUserId,
        status: 'pending',
        total,
        subtotal,
        shipping,
        tax,
        discount,
        couponCode,
        shippingAddress: JSON.stringify(shippingAddress),
        paymentMethod,
        paymentStatus: 'paid',
        items: {
          create: items.map((item: { productId: string; productName: string; productImage: string | null; price: number; quantity: number }) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Update product sold counts
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { soldCount: { increment: item.quantity } },
      });
    }

    return NextResponse.json({ order, orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    console.error('Order create error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Try to get userId from auth token in header if not provided
    let finalUserId = userId;
    if (!finalUserId) {
      const token = request.headers.get('authorization')?.replace('Bearer ', '');
      if (token) {
        try {
          const authData = JSON.parse(atob(token));
          if (authData.userId) finalUserId = authData.userId;
        } catch {
          // ignore
        }
      }
    }

    if (!finalUserId) {
      // Return all recent orders if no user (admin-like, but limited)
      return NextResponse.json({ orders: [] });
    }

    const orders = await db.order.findMany({
      where: { userId: finalUserId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
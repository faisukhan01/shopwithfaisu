import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return NextResponse.json({
        error: `Minimum order amount is $${coupon.minOrder.toFixed(2)}`,
      }, { status: 400 });
    }

    const discount = coupon.type === 'percentage' ? coupon.value : 0;
    const discountAmount = coupon.type === 'percentage'
      ? subtotal * (coupon.value / 100)
      : coupon.value;

    return NextResponse.json({
      valid: true,
      type: coupon.type,
      value: coupon.value,
      discount: discount,
      discountAmount,
    });
  } catch (error) {
    console.error('Coupon validate error:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
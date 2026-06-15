import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// GET - List coupons (active only, or all for admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isAdmin = searchParams.get('admin') === 'true'

    const where: Prisma.CouponWhereInput = isAdmin ? {} : { isActive: true }
    const coupons = await db.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

// POST - Create coupon OR validate coupon
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate coupon mode
    if (body.code && body.orderTotal !== undefined) {
      const coupon = await db.coupon.findUnique({
        where: { code: body.code.toUpperCase() },
      })

      if (!coupon || !coupon.isActive) {
        return NextResponse.json({ valid: false, discount: 0, message: 'Invalid coupon code' })
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json({ valid: false, discount: 0, message: 'Coupon has expired' })
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ valid: false, discount: 0, message: 'Coupon has reached maximum uses' })
      }

      if (coupon.minOrder && body.orderTotal < coupon.minOrder) {
        return NextResponse.json({
          valid: false,
          discount: 0,
          message: `Minimum order amount of ${coupon.minOrder} required`,
        })
      }

      let discount = 0
      if (coupon.type === 'percentage') {
        discount = Math.round(body.orderTotal * (coupon.value / 100) * 100) / 100
      } else {
        discount = Math.min(coupon.value, body.orderTotal)
      }

      return NextResponse.json({
        valid: true,
        discount,
        message: `Coupon applied! You save ${discount}`,
      })
    }

    // Create coupon mode
    const { code, type, value, minOrder, maxUses, expiresAt, isActive } = body

    if (!code || !value) {
      return NextResponse.json({ error: 'code and value are required' }, { status: 400 })
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        type: type || 'percentage',
        value: parseFloat(value),
        minOrder: minOrder ? parseFloat(minOrder) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (error: unknown) {
    console.error('Error with coupon:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to process coupon' }, { status: 500 })
  }
}

// PUT - Update coupon
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Coupon id is required' }, { status: 400 })
    }

    const existing = await db.coupon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['code', 'type', 'value', 'minOrder', 'maxUses', 'expiresAt', 'isActive']

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'code') updateData[field] = String(data[field]).toUpperCase()
        else if (field === 'value' || field === 'minOrder') updateData[field] = parseFloat(data[field])
        else if (field === 'maxUses') updateData[field] = parseInt(data[field])
        else if (field === 'expiresAt') updateData[field] = data[field] ? new Date(data[field]) : null
        else updateData[field] = data[field]
      }
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}

// DELETE - Delete coupon
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Coupon id is required' }, { status: 400 })
    }

    const existing = await db.coupon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    await db.coupon.delete({ where: { id } })
    return NextResponse.json({ message: 'Coupon deleted successfully' })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
}
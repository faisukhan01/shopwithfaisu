import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')

    if (!sessionId && !userId) {
      return NextResponse.json({ error: 'sessionId or userId is required' }, { status: 400 })
    }

    const where: Prisma.CartItemWhereInput = {}
    if (userId) where.userId = userId
    if (sessionId) where.sessionId = sessionId

    const cartItems = await db.cartItem.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            comparePrice: true,
            images: true,
            stock: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    let subtotal = 0
    const formatted = cartItems.map((item) => {
      const price = item.product.price * item.quantity
      subtotal += price
      return {
        ...item,
        product: {
          ...item.product,
          images: JSON.parse(item.product.images),
        },
        price,
      }
    })

    return NextResponse.json({
      items: formatted,
      subtotal: Math.round(subtotal * 100) / 100,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, quantity, sessionId, userId } = body

    if (!productId || !quantity) {
      return NextResponse.json({ error: 'productId and quantity are required' }, { status: 400 })
    }

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 })
    }

    const effectiveQuantity = parseInt(quantity) || 1

    // Check if already in cart
    const cartWhere: Prisma.CartItemWhereInput = { productId }
    if (userId) cartWhere.userId = userId
    else if (sessionId) cartWhere.sessionId = sessionId

    const existingItem = await db.cartItem.findFirst({ where: cartWhere })

    if (existingItem) {
      const newQuantity = existingItem.quantity + effectiveQuantity
      if (product.stock < newQuantity) {
        return NextResponse.json({ error: 'Not enough stock available' }, { status: 400 })
      }

      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      })

      return NextResponse.json(updated)
    }

    if (product.stock < effectiveQuantity) {
      return NextResponse.json({ error: 'Not enough stock available' }, { status: 400 })
    }

    const cartItem = await db.cartItem.create({
      data: {
        userId: userId || null,
        sessionId: sessionId || null,
        productId,
        quantity: effectiveQuantity,
      },
      include: { product: true },
    })

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { cartItemId, quantity } = body

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json({ error: 'cartItemId and quantity are required' }, { status: 400 })
    }

    const effectiveQuantity = parseInt(quantity)

    if (effectiveQuantity === 0) {
      await db.cartItem.delete({ where: { id: cartItemId } })
      return NextResponse.json({ message: 'Item removed from cart' })
    }

    const existing = await db.cartItem.findUnique({ where: { id: cartItemId } })
    if (!existing) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    const product = await db.product.findUnique({ where: { id: existing.productId } })
    if (product && product.stock < effectiveQuantity) {
      return NextResponse.json({ error: 'Not enough stock available' }, { status: 400 })
    }

    const updated = await db.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: effectiveQuantity },
      include: { product: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { cartItemId } = body

    if (!cartItemId) {
      return NextResponse.json({ error: 'cartItemId is required' }, { status: 400 })
    }

    const existing = await db.cartItem.findUnique({ where: { id: cartItemId } })
    if (!existing) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    await db.cartItem.delete({ where: { id: cartItemId } })
    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const reviews = await db.review.findMany({
      where: { productId, isApproved: true },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, rating, title, comment, userName, userId } = body

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: 'productId, rating, and comment are required' },
        { status: 400 }
      )
    }

    const parsedRating = parseInt(rating)
    if (parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const review = await db.review.create({
      data: {
        productId,
        userId: userId || null,
        userName: userName || null,
        rating: parsedRating,
        title,
        comment,
        isApproved: true,
      },
    })

    // Update product rating and review count
    const allReviews = await db.review.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    })

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = totalRating / allReviews.length

    await db.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
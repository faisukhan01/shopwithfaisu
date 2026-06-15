import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await db.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...category,
      products: category.products.map((p) => ({ ...p, images: JSON.parse(p.images) })),
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'slug', 'description', 'image', 'parentId', 'sortOrder', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'sortOrder') {
          updateData[field] = parseInt(body[field]) || 0
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const category = await db.category.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    await db.category.delete({ where: { id } })
    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting category:', error)
    const err = error as { code?: string }
    if (err.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete category with associated products' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check database connection
    const productCount = await db.product.count();
    const categoryCount = await db.category.count();
    const settingsCount = await db.storeSetting.count();

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      data: {
        products: productCount,
        categories: categoryCount,
        settings: settingsCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

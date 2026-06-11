import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const productCount = await db.product.count();
    if (productCount > 0) {
      return NextResponse.json({ message: 'Database already seeded', count: productCount });
    }

    const electronics = await db.category.create({
      data: { name: 'Electronics', slug: 'electronics', description: 'Premium tech and gadgets', image: '/products/smartwatch.png', sortOrder: 1 },
    });
    const fashion = await db.category.create({
      data: { name: 'Fashion', slug: 'fashion', description: 'Curated style essentials', image: '/products/leather-bag.png', sortOrder: 2 },
    });
    const homeLiving = await db.category.create({
      data: { name: 'Home & Living', slug: 'home-living', description: 'Elevate your space', image: '/products/candle.png', sortOrder: 3 },
    });
    const beauty = await db.category.create({
      data: { name: 'Beauty', slug: 'beauty', description: 'Luxury beauty and wellness', image: '/products/skincare.png', sortOrder: 4 },
    });
    const accessories = await db.category.create({
      data: { name: 'Accessories', slug: 'accessories', description: 'The perfect finishing touches', image: '/products/analog-watch.png', sortOrder: 5 },
    });

    const products = [
      { name: 'Aura Pro Wireless Headphones', slug: 'aura-pro-wireless-headphones', description: 'Immerse yourself in crystal-clear audio with the Aura Pro. Featuring advanced noise-cancellation technology, 40mm custom drivers, and a premium matte black finish that feels as good as it sounds. The memory foam ear cushions provide all-day comfort, while the 30-hour battery life ensures your music never stops.', shortDesc: 'Premium noise-cancelling headphones with 30hr battery', price: 249.99, comparePrice: 299.99, costPrice: 120, images: JSON.stringify(['/products/headphones.png']), categoryId: electronics.id, stock: 45, sku: 'AURA-HP-001', isFeatured: true, isNew: true, attributes: JSON.stringify({ color: 'Matte Black', connectivity: 'Bluetooth 5.3', battery: '30 hours', weight: '250g' }), rating: 4.8, reviewCount: 124, soldCount: 892 },
      { name: 'Meridian Smart Watch', slug: 'meridian-smart-watch', description: 'The Meridian seamlessly blends classic watchmaking with modern technology. A stunning sapphire crystal display sits within a polished silver case, paired with a genuine Italian leather strap.', shortDesc: 'Elegant smart watch with leather strap', price: 349.99, comparePrice: 399.99, costPrice: 180, images: JSON.stringify(['/products/smartwatch.png']), categoryId: electronics.id, stock: 30, sku: 'MER-SW-002', isFeatured: true, isNew: true, attributes: JSON.stringify({ color: 'Silver / Brown Leather', display: '1.4" AMOLED', battery: '7 days', water_resistance: '5ATM' }), rating: 4.7, reviewCount: 89, soldCount: 567 },
      { name: 'Echo Portable Speaker', slug: 'echo-portable-speaker', description: 'Compact yet powerful, the Echo delivers rich 360° sound in a sleek dark grey enclosure. Its IP67 waterproof rating means it goes anywhere.', shortDesc: 'Waterproof portable speaker with 360° sound', price: 129.99, comparePrice: 159.99, costPrice: 55, images: JSON.stringify(['/products/speaker.png']), categoryId: electronics.id, stock: 60, sku: 'ECH-SP-003', isFeatured: false, isNew: false, attributes: JSON.stringify({ color: 'Dark Grey', bluetooth: '5.0', battery: '20 hours', water_resistance: 'IP67' }), rating: 4.5, reviewCount: 203, soldCount: 1456 },
      { name: 'Voyager Leather Crossbody', slug: 'voyager-leather-crossbody', description: 'Handcrafted from full-grain Italian leather, the Voyager is the perfect everyday companion. Its minimalist design houses a surprisingly spacious interior with thoughtfully organized compartments.', shortDesc: 'Handcrafted Italian leather crossbody bag', price: 189.99, comparePrice: 229.99, costPrice: 75, images: JSON.stringify(['/products/leather-bag.png']), categoryId: fashion.id, stock: 25, sku: 'VOY-BG-004', isFeatured: true, isNew: false, attributes: JSON.stringify({ color: 'Tan', material: 'Full-grain Italian Leather', dimensions: '25 x 18 x 8 cm', closure: 'Magnetic' }), rating: 4.9, reviewCount: 67, soldCount: 423 },
      { name: 'Haze Polarized Sunglasses', slug: 'haze-polarized-sunglasses', description: 'See the world with stunning clarity through Haze\'s premium polarized lenses. The ultra-light titanium frame provides all-day comfort without compromising on style.', shortDesc: 'Ultra-light titanium frame polarized sunglasses', price: 159.99, comparePrice: null, costPrice: 45, images: JSON.stringify(['/products/sunglasses.png']), categoryId: fashion.id, stock: 40, sku: 'HAZ-SG-005', isFeatured: false, isNew: true, attributes: JSON.stringify({ frame: 'Titanium', lens: 'Polarized UV400', weight: '22g', protection: 'UV400' }), rating: 4.6, reviewCount: 156, soldCount: 789 },
      { name: 'Stride Minimalist Sneakers', slug: 'stride-minimalist-sneakers', description: 'Clean lines and premium white leather define the Stride. Built on a cushioned sole for all-day comfort, these sneakers transition effortlessly from casual outings to smart-casual events.', shortDesc: 'Premium white leather minimalist sneakers', price: 179.99, comparePrice: 199.99, costPrice: 65, images: JSON.stringify(['/products/sneakers.png']), categoryId: fashion.id, stock: 35, sku: 'STR-SN-006', isFeatured: true, isNew: true, attributes: JSON.stringify({ color: 'White', material: 'Premium Leather', sole: 'Cushioned EVA', sizes: '6-13' }), rating: 4.7, reviewCount: 198, soldCount: 1234 },
      { name: 'Kintsugi Ceramic Vase', slug: 'kintsugi-ceramic-vase', description: 'Inspired by the Japanese art of Kintsugi, this handcrafted ceramic vase celebrates imperfection with its stunning earthy glaze and organic form. Each piece is unique.', shortDesc: 'Handcrafted artisan ceramic vase', price: 89.99, comparePrice: null, costPrice: 25, images: JSON.stringify(['/products/vase.png']), categoryId: homeLiving.id, stock: 20, sku: 'KIN-VS-007', isFeatured: false, isNew: true, attributes: JSON.stringify({ material: 'Stoneware Ceramic', height: '28 cm', style: 'Scandinavian', care: 'Wipe clean' }), rating: 4.8, reviewCount: 45, soldCount: 234 },
      { name: 'Lumière Scented Candle', slug: 'lumiere-scented-candle', description: 'Transform your space with the warm, inviting glow of Lumière. Housed in a handblown amber glass jar, this soy wax candle fills your room with notes of bergamot, vanilla, and sandalwood.', shortDesc: 'Luxury soy candle in amber glass, 60hr burn', price: 42.99, comparePrice: 54.99, costPrice: 12, images: JSON.stringify(['/products/candle.png']), categoryId: homeLiving.id, stock: 80, sku: 'LUM-CN-008', isFeatured: true, isNew: false, attributes: JSON.stringify({ scent: 'Bergamot, Vanilla & Sandalwood', wax: '100% Soy', burn_time: '60+ hours', weight: '350g' }), rating: 4.9, reviewCount: 312, soldCount: 2678 },
      { name: 'Serenity Cashmere Throw', slug: 'serenity-cashmere-throw', description: 'Wrap yourself in pure luxury with the Serenity throw. Woven from 100% Grade-A Mongolian cashmere, this blanket is incredibly soft yet remarkably durable.', shortDesc: '100% Grade-A Mongolian cashmere throw blanket', price: 299.99, comparePrice: 379.99, costPrice: 120, images: JSON.stringify(['/products/blanket.png']), categoryId: homeLiving.id, stock: 15, sku: 'SER-TB-009', isFeatured: true, isNew: false, attributes: JSON.stringify({ material: '100% Cashmere', size: '150 x 200 cm', weight: '450g', care: 'Dry clean only' }), rating: 4.9, reviewCount: 78, soldCount: 345 },
      { name: 'Radiance Skincare Set', slug: 'radiance-skincare-set', description: 'A complete morning and evening ritual in one beautifully packaged set. Includes a gentle cleanser, hydrating serum, rich moisturizer, and restorative night cream.', shortDesc: 'Complete skincare ritual, 4-piece set', price: 149.99, comparePrice: 189.99, costPrice: 45, images: JSON.stringify(['/products/skincare.png']), categoryId: beauty.id, stock: 50, sku: 'RAD-SS-010', isFeatured: true, isNew: true, attributes: JSON.stringify({ pieces: '4', skin_type: 'All skin types', ingredients: 'Natural & Organic', cruelty_free: 'Yes' }), rating: 4.7, reviewCount: 167, soldCount: 890 },
      { name: 'Noir Eau de Parfum', slug: 'noir-eau-de-parfum', description: 'An intoxicating blend of dark amber, black orchid, and warm vanilla. Noir is for those who leave a lasting impression.', shortDesc: 'Luxury fragrance, dark amber & orchid', price: 119.99, comparePrice: null, costPrice: 30, images: JSON.stringify(['/products/perfume.png']), categoryId: beauty.id, stock: 35, sku: 'NOI-EP-011', isFeatured: false, isNew: true, attributes: JSON.stringify({ notes: 'Amber, Orchid & Vanilla', volume: '100ml', longevity: '8+ hours', type: 'Eau de Parfum' }), rating: 4.6, reviewCount: 89, soldCount: 567 },
      { name: 'Chrono Rose Gold Watch', slug: 'chrono-rose-gold-watch', description: 'Timeless elegance meets modern craftsmanship in the Chrono. The warm rose gold case houses a clean white dial with slim hour markers.', shortDesc: 'Swiss movement, rose gold, leather strap', price: 279.99, comparePrice: 329.99, costPrice: 110, images: JSON.stringify(['/products/analog-watch.png']), categoryId: accessories.id, stock: 20, sku: 'CHR-WT-012', isFeatured: true, isNew: false, attributes: JSON.stringify({ case: 'Rose Gold 316L Steel', dial: 'White', movement: 'Swiss Quartz', water_resistance: '50m' }), rating: 4.8, reviewCount: 134, soldCount: 678 },
      { name: 'Essential Leather Wallet', slug: 'essential-leather-wallet', description: 'Slim, sophisticated, and built to last. The Essential wallet features 6 card slots, 2 bill compartments, and a hidden pocket.', shortDesc: 'Slim bifold wallet, full-grain leather', price: 79.99, comparePrice: 99.99, costPrice: 25, images: JSON.stringify(['/products/wallet.png']), categoryId: accessories.id, stock: 55, sku: 'ESS-WL-013', isFeatured: false, isNew: false, attributes: JSON.stringify({ material: 'Full-grain Leather', color: 'Brown', card_slots: '6', dimensions: '11 x 9 x 1.5 cm' }), rating: 4.5, reviewCount: 245, soldCount: 1890 },
      { name: 'Arc Brass Desk Lamp', slug: 'arc-brass-desk-lamp', description: 'Illuminate your workspace with the warm, focused light of the Arc desk lamp. The brushed brass finish and adjustable arm bring Scandinavian elegance to any desk.', shortDesc: 'Adjustable brass lamp with USB charging', price: 159.99, comparePrice: null, costPrice: 50, images: JSON.stringify(['/products/desk-lamp.png']), categoryId: homeLiving.id, stock: 30, sku: 'ARC-DL-014', isFeatured: false, isNew: true, attributes: JSON.stringify({ finish: 'Brushed Brass', light: 'LED Warm White', features: 'Touch Dimmer + USB-C', height: '45 cm' }), rating: 4.7, reviewCount: 56, soldCount: 345 },
      { name: 'Aura Pro Headphones — Midnight', slug: 'aura-pro-headphones-midnight', description: 'The same award-winning sound of the Aura Pro, now in an exclusive Midnight Blue finish. Limited edition with gold-accented ear cups.', shortDesc: 'Limited edition midnight blue, individually numbered', price: 279.99, comparePrice: 349.99, costPrice: 135, images: JSON.stringify(['/products/headphones.png']), categoryId: electronics.id, stock: 10, sku: 'AURA-HP-015-LE', isFeatured: false, isNew: true, attributes: JSON.stringify({ color: 'Midnight Blue / Gold', edition: 'Limited', battery: '30 hours', weight: '250g' }), rating: 4.9, reviewCount: 23, soldCount: 78 },
    ];

    for (const p of products) {
      await db.product.create({ data: p });
    }

    const settings = [
      { key: 'storeName', value: 'Shop with Faisu!!', group: 'general', label: 'Store Name' },
      { key: 'storeTagline', value: 'Where Style Meets Simplicity', group: 'general', label: 'Store Tagline' },
      { key: 'storeDescription', value: 'Discover curated collections of premium products at Shop with Faisu!!. Clean design, fair prices, exceptional quality.', group: 'general', label: 'Store Description' },
      { key: 'storeLogo', value: '', group: 'general', label: 'Store Logo URL' },
      { key: 'domainName', value: 'shopwithfaisu.com', group: 'general', label: 'Domain Name' },
      { key: 'primaryColor', value: '#1a1a1a', group: 'appearance', label: 'Primary Color' },
      { key: 'accentColor', value: '#d4a053', group: 'appearance', label: 'Accent Color' },
      { key: 'currency', value: 'USD', group: 'general', label: 'Currency' },
      { key: 'currencySymbol', value: '$', group: 'general', label: 'Currency Symbol' },
      { key: 'freeShippingThreshold', value: '75', group: 'general', label: 'Free Shipping Threshold', type: 'number' },
      { key: 'taxRate', value: '0', group: 'general', label: 'Tax Rate (%)', type: 'number' },
      { key: 'contactEmail', value: 'hello@shopwithfaisu.com', group: 'contact', label: 'Contact Email' },
      { key: 'contactPhone', value: '+1 (555) 123-4567', group: 'contact', label: 'Contact Phone' },
      { key: 'address', value: '123 Faisu Avenue, New York, NY 10001', group: 'contact', label: 'Address' },
      { key: 'socialFacebook', value: '', group: 'social', label: 'Facebook URL' },
      { key: 'socialInstagram', value: '', group: 'social', label: 'Instagram URL' },
      { key: 'socialTwitter', value: '', group: 'social', label: 'Twitter URL' },
      { key: 'socialYoutube', value: '', group: 'social', label: 'YouTube URL' },
      { key: 'heroTitle', value: 'Curated for the Modern You', group: 'homepage', label: 'Hero Title' },
      { key: 'heroSubtitle', value: 'Premium products, thoughtfully selected. Free shipping on orders over $75.', group: 'homepage', label: 'Hero Subtitle' },
      { key: 'heroCta', value: 'Shop Now', group: 'homepage', label: 'Hero CTA Text' },
      { key: 'heroImage', value: '/banners/hero.png', group: 'homepage', label: 'Hero Image URL', type: 'image' },
      { key: 'footerText', value: 'Shop with Faisu!! — Where every purchase feels special.', group: 'homepage', label: 'Footer Text' },
      { key: 'copyrightText', value: '© 2025 Shop with Faisu!!. All rights reserved.', group: 'homepage', label: 'Copyright Text' },
      { key: 'metaTitle', value: 'Shop with Faisu!! | Premium Products, Beautifully Presented', group: 'seo', label: 'Meta Title' },
      { key: 'metaDescription', value: 'Discover curated collections of premium products. Clean design, fair prices, exceptional quality.', group: 'seo', label: 'Meta Description' },
    ];

    for (const s of settings) {
      await db.storeSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
    }

    await db.user.upsert({
      where: { email: 'admin@shopwithfaisu.com' },
      update: {},
      create: { email: 'admin@shopwithfaisu.com', name: 'Faisu', role: 'admin', isActive: true },
    });

    await db.user.upsert({
      where: { email: 'demo@shopwithfaisu.com' },
      update: {},
      create: {
        email: 'demo@shopwithfaisu.com', name: 'Sarah Johnson', role: 'customer', isActive: true,
        address: JSON.stringify({ street: '456 Oak Lane', city: 'Brooklyn', state: 'NY', zipCode: '11201', country: 'US', phone: '+1 (555) 987-6543' }),
      },
    });

    await db.coupon.create({ data: { code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 50, maxUses: 1000, isActive: true } });
    await db.coupon.create({ data: { code: 'FLAT20', type: 'fixed', value: 20, minOrder: 100, maxUses: 500, isActive: true } });

    const createdProducts = await db.product.findMany({ select: { id: true, name: true } });
    const reviews = [
      { rating: 5, title: 'Absolutely stunning', comment: 'The quality exceeded my expectations. The packaging was beautiful too!', userName: 'Emily R.' },
      { rating: 5, title: 'Best purchase this year', comment: 'Incredible sound quality and so comfortable. Worth every penny.', userName: 'James M.' },
      { rating: 4, title: 'Great quality, fast shipping', comment: 'Love the design and build quality. Shipping was surprisingly fast.', userName: 'Aisha K.' },
      { rating: 5, title: 'Perfect gift', comment: 'Bought this as a gift and they absolutely loved it. Will definitely buy again.', userName: 'David L.' },
      { rating: 5, title: 'Exceeds expectations', comment: 'The attention to detail is remarkable. You can tell this is premium quality.', userName: 'Nina S.' },
    ];
    for (let i = 0; i < reviews.length && i < createdProducts.length; i++) {
      await db.review.create({ data: { ...reviews[i], productId: createdProducts[i].id } });
    }

    const candle = await db.product.findFirst({ where: { sku: 'LUM-CN-008' } });
    const sneakers = await db.product.findFirst({ where: { sku: 'STR-SN-006' } });
    const customer = await db.user.findFirst({ where: { email: 'demo@shopwithfaisu.com' } });

    if (candle && customer) {
      await db.order.create({
        data: {
          orderNumber: 'SWF-000001', userId: customer.id, status: 'delivered', total: 85.98, subtotal: 85.98, shipping: 0, tax: 0, paymentMethod: 'card', paymentStatus: 'paid',
          shippingAddress: JSON.stringify({ street: '456 Oak Lane', city: 'Brooklyn', state: 'NY', zipCode: '11201', country: 'US' }),
          items: { create: { productId: candle.id, productName: candle.name, productImage: candle.images, price: candle.price, quantity: 2 } },
        },
      });
    }
    if (sneakers && customer) {
      await db.order.create({
        data: {
          orderNumber: 'SWF-000002', userId: customer.id, status: 'shipped', total: 179.99, subtotal: 179.99, shipping: 0, tax: 0, paymentMethod: 'card', paymentStatus: 'paid', trackingNumber: 'TRK-9876543210',
          shippingAddress: JSON.stringify({ street: '456 Oak Lane', city: 'Brooklyn', state: 'NY', zipCode: '11201', country: 'US' }),
          items: { create: { productId: sneakers.id, productName: sneakers.name, productImage: sneakers.images, price: sneakers.price, quantity: 1 } },
        },
      });
    }

    return NextResponse.json({ message: 'Database seeded successfully', products: products.length, categories: 5 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}

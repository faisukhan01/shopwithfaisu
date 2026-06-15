-- ShopwithFaisu Database Schema for Turso

CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password TEXT,
    role TEXT DEFAULT 'customer',
    phone TEXT,
    address TEXT,
    avatar TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Category (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    parentId TEXT,
    sortOrder INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES Category(id)
);

CREATE TABLE IF NOT EXISTS Product (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    shortDesc TEXT,
    price REAL NOT NULL,
    comparePrice REAL,
    costPrice REAL,
    images TEXT DEFAULT '[]',
    categoryId TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    sku TEXT,
    weight REAL,
    dimensions TEXT,
    isFeatured INTEGER DEFAULT 0,
    isNew INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    attributes TEXT,
    rating REAL DEFAULT 0,
    reviewCount INTEGER DEFAULT 0,
    soldCount INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES Category(id)
);

CREATE TABLE IF NOT EXISTS CartItem (
    id TEXT PRIMARY KEY,
    userId TEXT,
    sessionId TEXT,
    productId TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id),
    FOREIGN KEY (productId) REFERENCES Product(id)
);

CREATE TABLE IF NOT EXISTS "Order" (
    id TEXT PRIMARY KEY,
    orderNumber TEXT UNIQUE NOT NULL,
    userId TEXT,
    sessionId TEXT,
    status TEXT DEFAULT 'pending',
    total REAL NOT NULL,
    subtotal REAL NOT NULL,
    shipping REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    couponCode TEXT,
    shippingAddress TEXT,
    billingAddress TEXT,
    paymentMethod TEXT,
    paymentStatus TEXT DEFAULT 'pending',
    notes TEXT,
    trackingNumber TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS OrderItem (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    productId TEXT NOT NULL,
    productName TEXT NOT NULL,
    productImage TEXT,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES "Order"(id),
    FOREIGN KEY (productId) REFERENCES Product(id)
);

CREATE TABLE IF NOT EXISTS StoreSetting (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    "group" TEXT DEFAULT 'general',
    label TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Review (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    userId TEXT,
    userName TEXT,
    rating INTEGER NOT NULL,
    title TEXT,
    comment TEXT NOT NULL,
    isApproved INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES Product(id),
    FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Coupon (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'percentage',
    value REAL NOT NULL,
    minOrder REAL,
    maxUses INTEGER,
    usedCount INTEGER DEFAULT 0,
    expiresAt TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Page (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    metaTitle TEXT,
    metaDesc TEXT,
    isPublished INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_category ON Product(categoryId);
CREATE INDEX IF NOT EXISTS idx_product_active ON Product(isActive);
CREATE INDEX IF NOT EXISTS idx_product_featured ON Product(isFeatured);
CREATE INDEX IF NOT EXISTS idx_order_user ON "Order"(userId);
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"(status);
CREATE INDEX IF NOT EXISTS idx_cartitem_user ON CartItem(userId);
CREATE INDEX IF NOT EXISTS idx_cartitem_session ON CartItem(sessionId);
CREATE INDEX IF NOT EXISTS idx_review_product ON Review(productId);

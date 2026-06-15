import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

declare global {
  var prismaGlobal: PrismaClient | undefined
}

function createPrismaClient() {
  // For Next.js API routes, environment variables are available
  const databaseUrl = process.env.DATABASE_URL
  const authToken = process.env.DATABASE_AUTH_TOKEN
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  // Use Turso (libSQL) if URL starts with libsql:// or https://
  if (databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('https://')) {
    if (!authToken) {
      throw new Error('DATABASE_AUTH_TOKEN environment variable is required for Turso')
    }
    
    const libsql = createClient({
      url: databaseUrl,
      authToken: authToken,
    })
    
    const adapter = new PrismaLibSQL(libsql)
    
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
    })
  }
  
  // Local SQLite
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
  })
}

export const db = global.prismaGlobal ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = db
}
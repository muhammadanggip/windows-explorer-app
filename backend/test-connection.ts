import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function testConnection() {
  console.log('🔍 Testing database connection...')
  console.log('Database URL:', process.env.DATABASE_URL)

  try {
    // Parse the database URL
    const url = new URL(process.env.DATABASE_URL || '')
    const host = url.hostname
    const port = parseInt(url.port) || 3306
    const user = url.username
    const password = url.password
    const database = url.pathname.slice(1)

    console.log('Connection details:')
    console.log('- Host:', host)
    console.log('- Port:', port)
    console.log('- User:', user)
    console.log('- Database:', database)
    console.log('- Password:', password ? '[SET]' : '[NOT SET]')

    // Test connection
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database
    })

    console.log('✅ Database connection successful!')
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test')
    console.log('✅ Query test successful:', rows)

    await connection.end()
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

testConnection()

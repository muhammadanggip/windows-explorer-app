import { drizzle } from 'drizzle-orm/mysql2'
import { migrate } from 'drizzle-orm/mysql2/migrator'
import mysql from 'mysql2/promise'
import { config } from '../config/config'

// Parse the database URL to extract connection details
const url = new URL(config.database.url)
const host = url.hostname
const port = parseInt(url.port) || 3306
const user = url.username
const password = url.password
const database = url.pathname.slice(1) // Remove leading slash

console.log('Setting up database...')

const connection = await mysql.createConnection({
  host,
  port,
  user,
  password,
  database
})

const db = drizzle(connection)

async function setupDatabase() {
  try {
    console.log('Running migrations...')
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('✅ Database setup completed successfully!')
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    await connection.end()
  }
}

setupDatabase()

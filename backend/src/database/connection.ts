import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

// Direct connection like the working test script
const connection = await mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'windows_explorer'
})

// Create the database instance
export const db = drizzle(connection)

export { connection }

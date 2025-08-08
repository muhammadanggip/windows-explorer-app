import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/mysql2'

// Load environment variables
dotenv.config()

async function createTables() {
  console.log('🗄️ Creating database tables...')

  try {
    // Parse the database URL
    const url = new URL(process.env.DATABASE_URL || '')
    const host = url.hostname
    const port = parseInt(url.port) || 3306
    const user = url.username
    const password = url.password
    const database = url.pathname.slice(1)

    // Create direct connection
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database
    })

    const db = drizzle(connection)

    // Create folders table using Drizzle schema
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS folders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        path TEXT NOT NULL,
        parent_id INT,
        is_root BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_path (path(255))
      )
    `)
    console.log('✅ Folders table created')

    // Create files table using Drizzle schema
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        path TEXT NOT NULL,
        folder_id INT NOT NULL,
        size INT DEFAULT 0,
        extension VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_path (path(255))
      )
    `)
    console.log('✅ Files table created')

    // Add foreign key constraints after tables are created
    await db.execute(sql`
      ALTER TABLE folders 
      ADD CONSTRAINT fk_folders_parent 
      FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE SET NULL
    `)
    console.log('✅ Folders foreign key constraint added')

    await db.execute(sql`
      ALTER TABLE files 
      ADD CONSTRAINT fk_files_folder 
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
    `)
    console.log('✅ Files foreign key constraint added')

    await connection.end()
    console.log('🎉 Database tables created successfully!')
  } catch (error) {
    console.error('❌ Failed to create tables:', error)
    process.exit(1)
  }
}

createTables()

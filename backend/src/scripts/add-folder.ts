import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/mysql2'
import { folders } from '../database/schema'
import { eq } from 'drizzle-orm'

// Load environment variables
dotenv.config()

interface AddFolderOptions {
  name: string
  parentPath?: string // e.g., '/Documents' or '/Documents/Work'
  isRoot?: boolean
}

async function addFolder(options: AddFolderOptions) {
  console.log('📁 Adding new folder...')

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

    let parentId: number | null = null
    let path: string

    if (options.isRoot) {
      // Root folder
      path = `/${options.name}`
      parentId = null
    } else if (options.parentPath) {
      // Subfolder
      path = `${options.parentPath}/${options.name}`
      
      // Find parent folder
      const parentFolder = await db.select().from(folders).where(eq(folders.path, options.parentPath))
      
      if (parentFolder.length === 0) {
        throw new Error(`Parent folder with path '${options.parentPath}' not found`)
      }
      
      parentId = parentFolder[0].id
    } else {
      throw new Error('Either parentPath or isRoot must be specified')
    }

    // Check if folder already exists
    const existingFolder = await db.select().from(folders).where(eq(folders.path, path))
    
    if (existingFolder.length > 0) {
      console.log(`⚠️  Folder '${options.name}' already exists at path '${path}'`)
      return
    }

    // Insert new folder
    await db.insert(folders).values({
      name: options.name,
      path: path,
      parentId: parentId,
      isRoot: options.isRoot || false
    })

    console.log(`✅ Folder '${options.name}' created successfully at path '${path}'`)

    await connection.end()
  } catch (error) {
    console.error('❌ Error adding folder:', error)
    process.exit(1)
  }
}

// Example usage
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
📁 Folder Addition Script

Usage:
  npm run add-folder <folder-name> [parent-path] [--root]

Examples:
  npm run add-folder "Downloads" --root
  npm run add-folder "Reports" "/Documents/Work"
  npm run add-folder "Photos" "/Pictures"

Options:
  --root    Create as root folder (optional)
    `)
    return
  }

  const folderName = args[0]
  const isRoot = args.includes('--root')
  const parentPath = isRoot ? undefined : (args[1] || '/Documents')

  await addFolder({
    name: folderName,
    parentPath: isRoot ? undefined : parentPath,
    isRoot: isRoot
  })
}

if (require.main === module) {
  main()
}

export { addFolder }

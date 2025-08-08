import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/mysql2'
import { folders, files } from './schema'
import { eq } from 'drizzle-orm'

// Load environment variables
dotenv.config()

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...')

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

    // Clear existing data
    await db.delete(files)
    await db.delete(folders)

    // Create root folders
    await db.insert(folders).values([
      {
        name: 'Documents',
        path: '/Documents',
        isRoot: true
      },
      {
        name: 'Pictures',
        path: '/Pictures',
        isRoot: true
      },
      {
        name: 'Music',
        path: '/Music',
        isRoot: true
      },
      {
        name: 'Videos',
        path: '/Videos',
        isRoot: true
      }
    ])

    console.log('✅ Root folders created')

    // Get the created root folders
    const rootFolders = await db.select().from(folders).where(eq(folders.isRoot, true))

    // Create subfolders
    await db.insert(folders).values([
      {
        name: 'Work',
        path: '/Documents/Work',
        parentId: rootFolders[0].id
      },
      {
        name: 'Personal',
        path: '/Documents/Personal',
        parentId: rootFolders[0].id
      },
      {
        name: 'Projects',
        path: '/Documents/Projects',
        parentId: rootFolders[0].id
      }
    ])

    await db.insert(folders).values([
      {
        name: 'Vacation',
        path: '/Pictures/Vacation',
        parentId: rootFolders[1].id
      },
      {
        name: 'Family',
        path: '/Pictures/Family',
        parentId: rootFolders[1].id
      }
    ])

    console.log('✅ Subfolders created')

    // Get the created subfolders
    const documentsSubfolders = await db.select().from(folders).where(eq(folders.parentId, rootFolders[0].id))
    const picturesSubfolders = await db.select().from(folders).where(eq(folders.parentId, rootFolders[1].id))

    // Create nested subfolders
    await db.insert(folders).values([
      {
        name: 'Reports',
        path: '/Documents/Work/Reports',
        parentId: documentsSubfolders[0].id
      },
      {
        name: 'Presentations',
        path: '/Documents/Work/Presentations',
        parentId: documentsSubfolders[0].id
      }
    ])

    await db.insert(folders).values([
      {
        name: 'Web Development',
        path: '/Documents/Projects/Web Development',
        parentId: documentsSubfolders[2].id
      },
      {
        name: 'Mobile Apps',
        path: '/Documents/Projects/Mobile Apps',
        parentId: documentsSubfolders[2].id
      }
    ])

    console.log('✅ Nested subfolders created')

    // Get the created nested subfolders
    const workSubfolders = await db.select().from(folders).where(eq(folders.parentId, documentsSubfolders[0].id))
    const projectsSubfolders = await db.select().from(folders).where(eq(folders.parentId, documentsSubfolders[2].id))

    // Create sample files
    await db.insert(files).values([
      {
        name: 'Q1 Report.pdf',
        path: '/Documents/Work/Reports/Q1 Report.pdf',
        folderId: workSubfolders[0].id,
        size: 2048576,
        extension: 'pdf'
      },
      {
        name: 'Q2 Report.pdf',
        path: '/Documents/Work/Reports/Q2 Report.pdf',
        folderId: workSubfolders[0].id,
        size: 1536000,
        extension: 'pdf'
      },
      {
        name: 'Company Presentation.pptx',
        path: '/Documents/Work/Presentations/Company Presentation.pptx',
        folderId: workSubfolders[1].id,
        size: 5120000,
        extension: 'pptx'
      },
      {
        name: 'README.md',
        path: '/Documents/Projects/Web Development/README.md',
        folderId: projectsSubfolders[0].id,
        size: 2048,
        extension: 'md'
      },
      {
        name: 'package.json',
        path: '/Documents/Projects/Web Development/package.json',
        folderId: projectsSubfolders[0].id,
        size: 1024,
        extension: 'json'
      },
      {
        name: 'beach.jpg',
        path: '/Pictures/Vacation/beach.jpg',
        folderId: picturesSubfolders[0].id,
        size: 3145728,
        extension: 'jpg'
      },
      {
        name: 'mountains.jpg',
        path: '/Pictures/Vacation/mountains.jpg',
        folderId: picturesSubfolders[0].id,
        size: 2097152,
        extension: 'jpg'
      },
      {
        name: 'family_photo.jpg',
        path: '/Pictures/Family/family_photo.jpg',
        folderId: picturesSubfolders[1].id,
        size: 4194304,
        extension: 'jpg'
      },
      {
        name: 'song1.mp3',
        path: '/Music/song1.mp3',
        folderId: rootFolders[2].id,
        size: 8388608,
        extension: 'mp3'
      },
      {
        name: 'video1.mp4',
        path: '/Videos/video1.mp4',
        folderId: rootFolders[3].id,
        size: 52428800,
        extension: 'mp4'
      }
    ])

    console.log('✅ Sample files created')
    console.log('🎉 Database seeding completed successfully!')

    await connection.end()
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()

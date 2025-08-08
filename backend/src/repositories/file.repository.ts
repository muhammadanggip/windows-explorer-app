import { eq } from 'drizzle-orm'
import { db } from '../database/connection'
import { files, type File, type NewFile } from '../database/schema'

export interface IFileRepository {
  findAll(): Promise<File[]>
  findById(id: number): Promise<File | null>
  findByFolderId(folderId: number): Promise<File[]>
  create(file: NewFile): Promise<File>
  update(id: number, file: Partial<NewFile>): Promise<File | null>
  delete(id: number): Promise<boolean>
}

export class FileRepository implements IFileRepository {
  async findAll(): Promise<File[]> {
    return await db.select().from(files).orderBy(files.name)
  }

  async findById(id: number): Promise<File | null> {
    const result = await db.select().from(files).where(eq(files.id, id)).limit(1)
    return result[0] || null
  }

  async findByFolderId(folderId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.folderId, folderId)).orderBy(files.name)
  }

  async create(file: NewFile): Promise<File> {
    await db.insert(files).values(file)
    // Get the inserted file by querying for it
    const result = await db.select().from(files).where(eq(files.name, file.name)).limit(1)
    return result[0]
  }

  async update(id: number, file: Partial<NewFile>): Promise<File | null> {
    await db
      .update(files)
      .set({ ...file, updatedAt: new Date() })
      .where(eq(files.id, id))
    // Get the updated file
    return await this.findById(id)
  }

  async delete(id: number): Promise<boolean> {
    await db.delete(files).where(eq(files.id, id))
    // Check if file still exists
    const file = await this.findById(id)
    return !file
  }
}

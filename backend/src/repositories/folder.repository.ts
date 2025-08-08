import { eq, and, isNull } from 'drizzle-orm'
import { db } from '../database/connection'
import { folders, type Folder, type NewFolder } from '../database/schema'

export interface IFolderRepository {
  findAll(): Promise<Folder[]>
  findById(id: number): Promise<Folder | null>
  findByParentId(parentId: number | null): Promise<Folder[]>
  findRootFolders(): Promise<Folder[]>
  create(folder: NewFolder): Promise<Folder>
  update(id: number, folder: Partial<NewFolder>): Promise<Folder | null>
  delete(id: number): Promise<boolean>
  getFolderTree(): Promise<Folder[]>
}

export class FolderRepository implements IFolderRepository {
  async findAll(): Promise<Folder[]> {
    return await db.select().from(folders).orderBy(folders.name)
  }

  async findById(id: number): Promise<Folder | null> {
    const result = await db.select().from(folders).where(eq(folders.id, id)).limit(1)
    return result[0] || null
  }

  async findByParentId(parentId: number | null): Promise<Folder[]> {
    const condition = parentId === null ? isNull(folders.parentId) : eq(folders.parentId, parentId)
    return await db.select().from(folders).where(condition).orderBy(folders.name)
  }

  async findRootFolders(): Promise<Folder[]> {
    return await db.select().from(folders).where(eq(folders.isRoot, true)).orderBy(folders.name)
  }

  async create(folder: NewFolder): Promise<Folder> {
    await db.insert(folders).values(folder)
    // Get the inserted folder by querying for it
    const result = await db.select().from(folders).where(eq(folders.name, folder.name)).limit(1)
    return result[0]
  }

  async update(id: number, folder: Partial<NewFolder>): Promise<Folder | null> {
    await db
      .update(folders)
      .set({ ...folder, updatedAt: new Date() })
      .where(eq(folders.id, id))
    // Get the updated folder
    return await this.findById(id)
  }

  async delete(id: number): Promise<boolean> {
    await db.delete(folders).where(eq(folders.id, id))
    // Check if folder still exists
    const folder = await this.findById(id)
    return !folder
  }

  async getFolderTree(): Promise<Folder[]> {
    // Get all folders and build the tree structure
    const allFolders = await this.findAll()
    return this.buildTree(allFolders)
  }

  private buildTree(folders: Folder[], parentId: number | null = null): Folder[] {
    return folders
      .filter(folder => folder.parentId === parentId)
      .map(folder => ({
        ...folder,
        subfolders: this.buildTree(folders, folder.id)
      }))
  }
}

import { IFolderRepository } from '../repositories/folder.repository'
import { IFileRepository } from '../repositories/file.repository'
import type { Folder, NewFolder } from '../database/schema'

export interface FolderWithSubfolders extends Folder {
  subfolders: FolderWithSubfolders[]
}

export interface FolderWithContent extends Folder {
  subfolders: Folder[]
  files: any[]
}

export interface SearchResult {
  folders: Folder[]
  files: any[]
}

export interface IFolderService {
  getAllFolders(): Promise<Folder[]>
  getFolderById(id: number): Promise<Folder | null>
  getFolderTree(): Promise<FolderWithSubfolders[]>
  getFolderContent(folderId: number): Promise<FolderWithContent | null>
  getSubfolders(parentId: number | null): Promise<Folder[]>
  createFolder(folder: NewFolder): Promise<Folder>
  updateFolder(id: number, folder: Partial<NewFolder>): Promise<Folder | null>
  deleteFolder(id: number): Promise<boolean>
  searchFoldersAndFiles(query: string): Promise<SearchResult>
}

export class FolderService implements IFolderService {
  constructor(
    private folderRepository: IFolderRepository,
    private fileRepository: IFileRepository
  ) {}

  async getAllFolders(): Promise<Folder[]> {
    return await this.folderRepository.findAll()
  }

  async getFolderById(id: number): Promise<Folder | null> {
    return await this.folderRepository.findById(id)
  }

  async getFolderTree(): Promise<FolderWithSubfolders[]> {
    const allFolders = await this.folderRepository.findAll()
    return this.buildTree(allFolders)
  }

  async getFolderContent(folderId: number): Promise<FolderWithContent | null> {
    const folder = await this.folderRepository.findById(folderId)
    if (!folder) return null

    const [subfolders, files] = await Promise.all([
      this.folderRepository.findByParentId(folderId),
      this.fileRepository.findByFolderId(folderId)
    ])

    return {
      ...folder,
      subfolders,
      files
    }
  }

  async getSubfolders(parentId: number | null): Promise<Folder[]> {
    return await this.folderRepository.findByParentId(parentId)
  }

  async createFolder(folder: NewFolder): Promise<Folder> {
    // Validate folder path
    if (!folder.path) {
      throw new Error('Folder path is required')
    }

    // Check if folder already exists
    const existingFolders = await this.folderRepository.findAll()
    const pathExists = existingFolders.some(f => f.path === folder.path)
    if (pathExists) {
      throw new Error('Folder with this path already exists')
    }

    return await this.folderRepository.create(folder)
  }

  async updateFolder(id: number, folder: Partial<NewFolder>): Promise<Folder | null> {
    const existingFolder = await this.folderRepository.findById(id)
    if (!existingFolder) {
      throw new Error('Folder not found')
    }

    return await this.folderRepository.update(id, folder)
  }

  async deleteFolder(id: number): Promise<boolean> {
    const folder = await this.folderRepository.findById(id)
    if (!folder) {
      throw new Error('Folder not found')
    }

    // Check if folder has subfolders or files
    const [subfolders, files] = await Promise.all([
      this.folderRepository.findByParentId(id),
      this.fileRepository.findByFolderId(id)
    ])

    if (subfolders.length > 0 || files.length > 0) {
      throw new Error('Cannot delete folder with subfolders or files')
    }

    return await this.folderRepository.delete(id)
  }

  async searchFoldersAndFiles(query: string): Promise<SearchResult> {
    const searchQuery = query.toLowerCase().trim()
    
    if (!searchQuery) {
      return { folders: [], files: [] }
    }

    // Search folders
    const allFolders = await this.folderRepository.findAll()
    const matchingFolders = allFolders.filter(folder => 
      folder.name.toLowerCase().includes(searchQuery) ||
      folder.path.toLowerCase().includes(searchQuery)
    )

    // Search files
    const allFiles = await this.fileRepository.findAll()
    const matchingFiles = allFiles.filter(file => 
      file.name.toLowerCase().includes(searchQuery) ||
      file.extension?.toLowerCase().includes(searchQuery)
    )

    return {
      folders: matchingFolders,
      files: matchingFiles
    }
  }

  private buildTree(folders: Folder[], parentId: number | null = null): FolderWithSubfolders[] {
    return folders
      .filter(folder => folder.parentId === parentId)
      .map(folder => ({
        ...folder,
        subfolders: this.buildTree(folders, folder.id)
      }))
  }
}

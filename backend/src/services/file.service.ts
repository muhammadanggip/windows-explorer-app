import { IFileRepository } from '../repositories/file.repository'
import { IFolderRepository } from '../repositories/folder.repository'
import type { File, NewFile } from '../database/schema'

export interface IFileService {
  getAllFiles(): Promise<File[]>
  getFileById(id: number): Promise<File | null>
  getFilesByFolderId(folderId: number): Promise<File[]>
  createFile(file: NewFile): Promise<File>
  updateFile(id: number, file: Partial<NewFile>): Promise<File | null>
  deleteFile(id: number): Promise<boolean>
}

export class FileService implements IFileService {
  constructor(
    private fileRepository: IFileRepository,
    private folderRepository: IFolderRepository
  ) {}

  async getAllFiles(): Promise<File[]> {
    return await this.fileRepository.findAll()
  }

  async getFileById(id: number): Promise<File | null> {
    return await this.fileRepository.findById(id)
  }

  async getFilesByFolderId(folderId: number): Promise<File[]> {
    return await this.fileRepository.findByFolderId(folderId)
  }

  async createFile(file: NewFile): Promise<File> {
    // Validate that the parent folder exists
    const parentFolder = await this.folderRepository.findById(file.folderId)
    if (!parentFolder) {
      throw new Error('Parent folder not found')
    }

    // Check if file with same path already exists
    const allFiles = await this.fileRepository.findAll()
    const pathExists = allFiles.some(f => f.path === file.path)
    if (pathExists) {
      throw new Error('File with this path already exists')
    }

    return await this.fileRepository.create(file)
  }

  async updateFile(id: number, file: Partial<NewFile>): Promise<File | null> {
    const existingFile = await this.fileRepository.findById(id)
    if (!existingFile) {
      throw new Error('File not found')
    }

    // If folderId is being updated, validate that the new folder exists
    if (file.folderId) {
      const parentFolder = await this.folderRepository.findById(file.folderId)
      if (!parentFolder) {
        throw new Error('Parent folder not found')
      }
    }

    // If path is being updated, validate it
    if (file.path) {
      const allFiles = await this.fileRepository.findAll()
      const pathExists = allFiles.some(f => f.path === file.path && f.id !== id)
      if (pathExists) {
        throw new Error('File with this path already exists')
      }
    }

    return await this.fileRepository.update(id, file)
  }

  async deleteFile(id: number): Promise<boolean> {
    const file = await this.fileRepository.findById(id)
    if (!file) {
      throw new Error('File not found')
    }

    return await this.fileRepository.delete(id)
  }
}

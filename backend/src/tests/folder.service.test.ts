import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FolderService } from '../services/folder.service'
import { FolderRepository } from '../repositories/folder.repository'
import { FileRepository } from '../repositories/file.repository'
import type { Folder, NewFolder } from '../database/schema'

// Mock repositories
const mockFolderRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByParentId: vi.fn(),
  findRootFolders: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getFolderTree: vi.fn()
}

const mockFileRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByFolderId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
}

describe('FolderService', () => {
  let folderService: FolderService

  beforeEach(() => {
    vi.clearAllMocks()
    folderService = new FolderService(
      mockFolderRepository as any,
      mockFileRepository as any
    )
  })

  describe('getAllFolders', () => {
    it('should return all folders', async () => {
      const mockFolders: Folder[] = [
        { id: 1, name: 'Documents', path: '/Documents', parentId: null, isRoot: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ]
      mockFolderRepository.findAll.mockResolvedValue(mockFolders)

      const result = await folderService.getAllFolders()

      expect(mockFolderRepository.findAll).toHaveBeenCalledOnce()
      expect(result).toEqual(mockFolders)
    })
  })

  describe('getFolderById', () => {
    it('should return folder by id', async () => {
      const mockFolder: Folder = { id: 1, name: 'Documents', path: '/Documents', parentId: null, isRoot: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      mockFolderRepository.findById.mockResolvedValue(mockFolder)

      const result = await folderService.getFolderById(1)

      expect(mockFolderRepository.findById).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockFolder)
    })

    it('should return null when folder not found', async () => {
      mockFolderRepository.findById.mockResolvedValue(null)

      const result = await folderService.getFolderById(999)

      expect(result).toBeNull()
    })
  })

  describe('getFolderContent', () => {
    it('should return folder content with subfolders and files', async () => {
      const mockFolder: Folder = { id: 1, name: 'Documents', path: '/Documents', parentId: null, isRoot: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      const mockSubfolders: Folder[] = [
        { id: 2, name: 'Work', path: '/Documents/Work', parentId: 1, isRoot: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ]
      const mockFiles: any[] = [
        { id: 1, name: 'document.pdf', path: '/Documents/document.pdf', folderId: 1, size: 1024, extension: 'pdf', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ]

      mockFolderRepository.findById.mockResolvedValue(mockFolder)
      mockFolderRepository.findByParentId.mockResolvedValue(mockSubfolders)
      mockFileRepository.findByFolderId.mockResolvedValue(mockFiles)

      const result = await folderService.getFolderContent(1)

      expect(result).toEqual({
        ...mockFolder,
        subfolders: mockSubfolders,
        files: mockFiles
      })
    })

    it('should return null when folder not found', async () => {
      mockFolderRepository.findById.mockResolvedValue(null)

      const result = await folderService.getFolderContent(999)

      expect(result).toBeNull()
    })
  })

  describe('createFolder', () => {
    it('should create a new folder successfully', async () => {
      const newFolder: NewFolder = {
        name: 'New Folder',
        path: '/New Folder',
        isRoot: true
      }
      const createdFolder: Folder = { ...newFolder, id: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }

      mockFolderRepository.findAll.mockResolvedValue([])
      mockFolderRepository.create.mockResolvedValue(createdFolder)

      const result = await folderService.createFolder(newFolder)

      expect(mockFolderRepository.create).toHaveBeenCalledWith(newFolder)
      expect(result).toEqual(createdFolder)
    })

    it('should throw error when folder path already exists', async () => {
      const newFolder: NewFolder = {
        name: 'New Folder',
        path: '/New Folder',
        isRoot: true
      }
      const existingFolder: Folder = { id: 1, name: 'New Folder', path: '/New Folder', parentId: null, isRoot: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }

      mockFolderRepository.findAll.mockResolvedValue([existingFolder])

      await expect(folderService.createFolder(newFolder)).rejects.toThrow('Folder with this path already exists')
    })

    it('should throw error when folder path is missing', async () => {
      const newFolder: NewFolder = {
        name: 'New Folder',
        path: '',
        isRoot: true
      }

      await expect(folderService.createFolder(newFolder)).rejects.toThrow('Folder path is required')
    })
  })

  describe('deleteFolder', () => {
    it('should delete folder when it has no subfolders or files', async () => {
      const folder: Folder = { id: 1, name: 'Empty Folder', path: '/Empty Folder', parentId: null, isRoot: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }

      mockFolderRepository.findById.mockResolvedValue(folder)
      mockFolderRepository.findByParentId.mockResolvedValue([])
      mockFileRepository.findByFolderId.mockResolvedValue([])
      mockFolderRepository.delete.mockResolvedValue(true)

      const result = await folderService.deleteFolder(1)

      expect(result).toBe(true)
      expect(mockFolderRepository.delete).toHaveBeenCalledWith(1)
    })

    it('should throw error when folder has subfolders', async () => {
      const folder: Folder = { id: 1, name: 'Folder with subfolders', path: '/Folder with subfolders', parentId: null, isRoot: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      const subfolders: Folder[] = [{ id: 2, name: 'Subfolder', path: '/Folder with subfolders/Subfolder', parentId: 1, isRoot: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]

      mockFolderRepository.findById.mockResolvedValue(folder)
      mockFolderRepository.findByParentId.mockResolvedValue(subfolders)
      mockFileRepository.findByFolderId.mockResolvedValue([])

      await expect(folderService.deleteFolder(1)).rejects.toThrow('Cannot delete folder with subfolders or files')
    })

    it('should throw error when folder not found', async () => {
      mockFolderRepository.findById.mockResolvedValue(null)

      await expect(folderService.deleteFolder(999)).rejects.toThrow('Folder not found')
    })
  })
})

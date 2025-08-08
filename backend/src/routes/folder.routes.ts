import { Router } from 'express'
import { FolderService } from '../services/folder.service'
import { FolderRepository } from '../repositories/folder.repository'
import { FileRepository } from '../repositories/file.repository'

const router = Router()
const folderRepository = new FolderRepository()
const fileRepository = new FileRepository()
const folderService = new FolderService(folderRepository, fileRepository)

// GET /api/v1/folders - Get all folders
router.get('/', async (req, res) => {
  try {
    const folders = await folderService.getAllFolders()
    res.json({
      success: true,
      data: folders,
      message: 'Folders retrieved successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// GET /api/v1/folders/tree - Get folder tree
router.get('/tree', async (req, res) => {
  try {
    console.log('🌳 Fetching folder tree...')
    const folderTree = await folderService.getFolderTree()
    console.log('✅ Folder tree fetched successfully:', folderTree.length, 'folders')
    res.json({
      success: true,
      data: folderTree,
      message: 'Folder tree retrieved successfully'
    })
  } catch (error) {
    console.error('❌ Error fetching folder tree:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// GET /api/v1/folders/:id - Get folder by ID
router.get('/:id', async (req, res) => {
  try {
    const folder = await folderService.getFolderById(Number(req.params.id))
    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      })
    }
    res.json({
      success: true,
      data: folder,
      message: 'Folder retrieved successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// GET /api/v1/folders/:id/content - Get folder content
router.get('/:id/content', async (req, res) => {
  try {
    const content = await folderService.getFolderContent(Number(req.params.id))
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      })
    }
    res.json({
      success: true,
      data: content,
      message: 'Folder content retrieved successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// GET /api/v1/folders/:id/subfolders - Get subfolders
router.get('/:id/subfolders', async (req, res) => {
  try {
    const subfolders = await folderService.getSubfolders(Number(req.params.id))
    res.json({
      success: true,
      data: subfolders,
      message: 'Subfolders retrieved successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// POST /api/v1/folders - Create folder
router.post('/', async (req, res) => {
  try {
    const folder = await folderService.createFolder(req.body)
    res.status(201).json({
      success: true,
      data: folder,
      message: 'Folder created successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// PUT /api/v1/folders/:id - Update folder
router.put('/:id', async (req, res) => {
  try {
    const folder = await folderService.updateFolder(Number(req.params.id), req.body)
    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      })
    }
    res.json({
      success: true,
      data: folder,
      message: 'Folder updated successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// DELETE /api/v1/folders/:id - Delete folder
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await folderService.deleteFolder(Number(req.params.id))
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      })
    }
    res.json({
      success: true,
      message: 'Folder deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

export { router as folderRoutes }

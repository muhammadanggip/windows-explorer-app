import { Router } from 'express'
import { FileRepository } from '../repositories/file.repository'

const router = Router()
const fileRepository = new FileRepository()

// GET /api/v1/files - Get all files
router.get('/', async (req, res) => {
  try {
    const files = await fileRepository.findAll()
    res.json({
      success: true,
      data: files,
      message: 'Files retrieved successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// GET /api/v1/files/:id - Get file by ID
router.get('/:id', async (req, res) => {
  try {
    const file = await fileRepository.findById(Number(req.params.id))
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      })
    }
    res.json({
      success: true,
      data: file,
      message: 'File retrieved successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// GET /api/v1/files/folder/:folderId - Get files by folder ID
router.get('/folder/:folderId', async (req, res) => {
  try {
    const files = await fileRepository.findByFolderId(Number(req.params.folderId))
    res.json({
      success: true,
      data: files,
      message: 'Files retrieved successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// POST /api/v1/files - Create file
router.post('/', async (req, res) => {
  try {
    const file = await fileRepository.create(req.body)
    res.status(201).json({
      success: true,
      data: file,
      message: 'File created successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// PUT /api/v1/files/:id - Update file
router.put('/:id', async (req, res) => {
  try {
    const file = await fileRepository.update(Number(req.params.id), req.body)
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      })
    }
    res.json({
      success: true,
      data: file,
      message: 'File updated successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

// DELETE /api/v1/files/:id - Delete file
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await fileRepository.delete(Number(req.params.id))
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      })
    }
    res.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
})

export { router as fileRoutes }

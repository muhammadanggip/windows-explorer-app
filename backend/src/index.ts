import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { folderRoutes } from './routes/folder.routes'
import { fileRoutes } from './routes/file.routes'
import { errorHandler } from './middleware/error.handler'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/v1/folders', folderRoutes)
app.use('/api/v1/files', fileRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Windows Explorer Backend is running' })
})

// Swagger documentation endpoint (placeholder)
app.get('/swagger', (req, res) => {
  res.json({ 
    message: 'API Documentation',
    endpoints: {
      folders: '/api/v1/folders',
      files: '/api/v1/files',
      health: '/health'
    }
  })
})

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🦊 Windows Explorer Backend is running at http://localhost:${PORT}`)
  console.log(`📚 API Documentation available at http://localhost:${PORT}/swagger`)
})

export default app

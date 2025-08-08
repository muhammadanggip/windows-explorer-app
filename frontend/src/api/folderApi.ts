import axios from 'axios'
import type { ApiResponse, Folder, FolderWithContent } from '@/types/folder'

// Use relative URL to work with Vite proxy
const API_BASE_URL = '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', error)
    return Promise.reject(error)
  }
)

export const folderApi = {
  // Get all folders
  async getAllFolders(): Promise<ApiResponse<Folder[]>> {
    try {
      const response = await api.get('/folders')
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get folder tree
  async getFolderTree(): Promise<ApiResponse<Folder[]>> {
    try {
      const response = await api.get('/folders/tree')
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get folder by ID
  async getFolderById(id: number): Promise<ApiResponse<Folder>> {
    try {
      const response = await api.get(`/folders/${id}`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get folder content (subfolders and files)
  async getFolderContent(folderId: number): Promise<ApiResponse<FolderWithContent>> {
    try {
      const response = await api.get(`/folders/${folderId}/content`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get subfolders
  async getSubfolders(folderId: number | null): Promise<ApiResponse<Folder[]>> {
    try {
      const url = folderId ? `/folders/${folderId}/subfolders` : '/folders/subfolders'
      const response = await api.get(url)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Search folders and files
  async searchFoldersAndFiles(query: string): Promise<ApiResponse<{ folders: Folder[], files: any[] }>> {
    try {
      const response = await api.get(`/folders/search?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Create folder
  async createFolder(folder: {
    name: string
    path: string
    parentId?: number
    isRoot?: boolean
  }): Promise<ApiResponse<Folder>> {
    try {
      const response = await api.post('/folders', folder)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Update folder
  async updateFolder(id: number, folder: Partial<{
    name: string
    path: string
    parentId: number
    isRoot: boolean
  }>): Promise<ApiResponse<Folder>> {
    try {
      const response = await api.put(`/folders/${id}`, folder)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Delete folder
  async deleteFolder(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/folders/${id}`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }
}

// File API operations
export const fileApi = {
  // Get all files
  async getAllFiles(): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get('/files')
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get file by ID
  async getFileById(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await api.get(`/files/${id}`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get files by folder ID
  async getFilesByFolderId(folderId: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get(`/files/folder/${folderId}`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Create file
  async createFile(file: {
    name: string
    path: string
    folderId: number
    size: number
    extension?: string
  }): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/files', file)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Update file
  async updateFile(id: number, file: Partial<{
    name: string
    path: string
    folderId: number
    size: number
    extension: string
  }>): Promise<ApiResponse<any>> {
    try {
      const response = await api.put(`/files/${id}`, file)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Delete file
  async deleteFile(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/files/${id}`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }
}

function handleApiError(error: any): ApiResponse<any> {
  if (error.response) {
    // Server responded with error status
    return {
      success: false,
      error: error.response.data?.error || `HTTP ${error.response.status}: ${error.response.statusText}`
    }
  } else if (error.request) {
    // Request was made but no response received
    return {
      success: false,
      error: 'No response from server. Please check your connection.'
    }
  } else {
    // Something else happened
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    }
  }
}

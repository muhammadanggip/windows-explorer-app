import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { folderApi, fileApi } from '@/api/folderApi'
import type { Folder, File, FolderWithContent, Breadcrumb } from '@/types/folder'

export const useFolderStore = defineStore('folder', () => {
  // State
  const folderTree = ref<Folder[]>([])
  const folderContent = ref<Map<number, FolderWithContent>>(new Map())
  const expandedFolders = ref<Set<number>>(new Set())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getFolderById = computed(() => {
    return (id: number): Folder | null => {
      const findFolder = (folders: Folder[]): Folder | null => {
        for (const folder of folders) {
          if (folder.id === id) return folder
          if (folder.subfolders) {
            const found = findFolder(folder.subfolders)
            if (found) return found
          }
        }
        return null
      }
      return findFolder(folderTree.value)
    }
  })

  const getSubfolders = computed(() => {
    return (folderId: number): Folder[] => {
      const content = folderContent.value.get(folderId)
      return content?.subfolders || []
    }
  })

  const getFiles = computed(() => {
    return (folderId: number): File[] => {
      const content = folderContent.value.get(folderId)
      return content?.files || []
    }
  })

  const getBreadcrumbs = computed(() => {
    return (folderId: number): Breadcrumb[] => {
      const breadcrumbs: Breadcrumb[] = []
      const findPath = (folders: Folder[], targetId: number, path: Folder[] = []): boolean => {
        for (const folder of folders) {
          const currentPath = [...path, folder]
          if (folder.id === targetId) {
            breadcrumbs.push(...currentPath.map(f => ({
              id: f.id,
              name: f.name,
              path: f.path
            })))
            return true
          }
          if (folder.subfolders) {
            if (findPath(folder.subfolders, targetId, currentPath)) {
              return true
            }
          }
        }
        return false
      }
      findPath(folderTree.value, folderId)
      return breadcrumbs
    }
  })

  // Actions
  const loadFolderTree = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await folderApi.getFolderTree()
      if (response.success && response.data) {
        folderTree.value = response.data
      } else {
        error.value = response.error || 'Failed to load folder tree'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  const loadFolderContent = async (folderId: number) => {
    if (folderContent.value.has(folderId)) {
      return // Already loaded
    }

    loading.value = true
    error.value = null

    try {
      const response = await folderApi.getFolderContent(folderId)
      if (response.success && response.data) {
        folderContent.value.set(folderId, response.data)
      } else {
        error.value = response.error || 'Failed to load folder content'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  const toggleFolder = (folderId: number) => {
    if (expandedFolders.value.has(folderId)) {
      expandedFolders.value.delete(folderId)
    } else {
      expandedFolders.value.add(folderId)
    }
  }

  const searchResults = ref<{ folders: Folder[], files: any[] }>({ folders: [], files: [] })
  const isSearching = ref(false)

  const searchFoldersAndFiles = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = { folders: [], files: [] }
      return
    }

    isSearching.value = true
    error.value = null

    try {
      const response = await folderApi.searchFoldersAndFiles(query)
      if (response.success && response.data) {
        searchResults.value = response.data
      } else {
        error.value = response.error || 'Failed to search'
        searchResults.value = { folders: [], files: [] }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      searchResults.value = { folders: [], files: [] }
    } finally {
      isSearching.value = false
    }
  }

  const searchFolders = (query: string): Folder[] => {
    if (!query.trim()) return folderTree.value

    const results: Folder[] = []
    const searchInFolders = (folders: Folder[], query: string) => {
      for (const folder of folders) {
        if (folder.name.toLowerCase().includes(query.toLowerCase())) {
          results.push(folder)
        }
        if (folder.subfolders) {
          searchInFolders(folder.subfolders, query)
        }
      }
    }

    searchInFolders(folderTree.value, query)
    return results
  }

  const clearError = () => {
    error.value = null
  }

  // CRUD Operations for Folders
  const createFolder = async (folderData: {
    name: string
    path: string
    parentId?: number
    isRoot?: boolean
  }) => {
    loading.value = true
    error.value = null

    try {
      const response = await folderApi.createFolder(folderData)
      if (response.success && response.data) {
        // Refresh folder tree after creating
        await loadFolderTree()
        return response.data
      } else {
        error.value = response.error || 'Failed to create folder'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateFolder = async (id: number, folderData: Partial<{
    name: string
    path: string
    parentId: number
    isRoot: boolean
  }>) => {
    loading.value = true
    error.value = null

    try {
      const response = await folderApi.updateFolder(id, folderData)
      if (response.success && response.data) {
        // Refresh folder tree after updating
        await loadFolderTree()
        // Clear cached content for this folder
        folderContent.value.delete(id)
        return response.data
      } else {
        error.value = response.error || 'Failed to update folder'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteFolder = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await folderApi.deleteFolder(id)
      if (response.success) {
        // Refresh folder tree after deleting
        await loadFolderTree()
        // Clear cached content for this folder
        folderContent.value.delete(id)
        return true
      } else {
        error.value = response.error || 'Failed to delete folder'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return false
    } finally {
      loading.value = false
    }
  }

  // CRUD Operations for Files
  const createFile = async (fileData: {
    name: string
    path: string
    folderId: number
    size: number
    extension?: string
  }) => {
    loading.value = true
    error.value = null

    try {
      const response = await fileApi.createFile(fileData)
      if (response.success && response.data) {
        // Clear cached content for the parent folder
        folderContent.value.delete(fileData.folderId)
        return response.data
      } else {
        error.value = response.error || 'Failed to create file'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateFile = async (id: number, fileData: Partial<{
    name: string
    path: string
    folderId: number
    size: number
    extension: string
  }>) => {
    loading.value = true
    error.value = null

    try {
      const response = await fileApi.updateFile(id, fileData)
      if (response.success && response.data) {
        // Clear cached content for the parent folder
        if (fileData.folderId) {
          folderContent.value.delete(fileData.folderId)
        }
        return response.data
      } else {
        error.value = response.error || 'Failed to update file'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteFile = async (id: number, folderId: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await fileApi.deleteFile(id)
      if (response.success) {
        // Clear cached content for the parent folder
        folderContent.value.delete(folderId)
        return true
      } else {
        error.value = response.error || 'Failed to delete file'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    folderTree,
    folderContent,
    expandedFolders,
    loading,
    error,
    searchResults,
    isSearching,
    
    // Getters
    getFolderById,
    getSubfolders,
    getFiles,
    getBreadcrumbs,
    
    // Actions
    loadFolderTree,
    loadFolderContent,
    toggleFolder,
    searchFolders,
    searchFoldersAndFiles,
    clearError,
    
    // CRUD Operations
    createFolder,
    updateFolder,
    deleteFolder,
    createFile,
    updateFile,
    deleteFile
  }
})

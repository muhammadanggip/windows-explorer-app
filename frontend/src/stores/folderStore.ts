import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { folderApi } from '@/api/folderApi'
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

  return {
    // State
    folderTree,
    folderContent,
    expandedFolders,
    loading,
    error,
    
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
    clearError
  }
})

<template>
  <div id="app">
    <header class="app-header">
      <h1>Infokes Windows Explorer</h1>
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search folders and files..."
          @input="handleSearch"
        />
        <Search class="search-icon" />
      </div>
    </header>
    
    <main class="explorer-container">
      <aside class="folder-panel">
        <div class="panel-header">
          <h2>Folders</h2>
          <button @click="refreshFolders" class="refresh-btn">
            <RefreshCw class="icon" />
          </button>
        </div>
        <div class="folder-tree">
          <FolderTree 
            :folders="filteredFolders" 
            :selected-folder="selectedFolder"
            :expanded-folders="folderStore.expandedFolders"
            @select-folder="selectFolder"
            @toggle-folder="toggleFolder"
          />
        </div>
      </aside>
      
      <section class="content-panel">
        <div class="panel-header">
          <div class="header-left">
            <div class="breadcrumb">
              <span v-for="(crumb, index) in breadcrumbs" :key="index">
                <span 
                  v-if="index > 0" 
                  class="breadcrumb-separator"
                >/</span>
                <button 
                  @click="navigateToFolder(crumb.id)"
                  class="breadcrumb-item"
                  :class="{ active: crumb.id === selectedFolder?.id }"
                >
                  {{ crumb.name }}
                </button>
              </span>
            </div>
          </div>
          
          <div v-if="selectedFolder" class="header-actions">
            <button @click="showCreateFolderModal = true" class="action-btn" title="Create Folder">
              <Plus class="icon" />
            </button>
            <button @click="showCreateFileModal = true" class="action-btn" title="Create File">
              <File class="icon" />
            </button>
          </div>
        </div>
        
        <div class="content-area">
          <!-- Search Results -->
          <div v-if="hasSearchResults" class="search-results">
            <div class="content-header">
              <h3>Search Results for "{{ searchQuery }}"</h3>
              <div class="search-stats">
                <span>{{ searchResults.folders.length }} folders, {{ searchResults.files.length }} files</span>
              </div>
            </div>
            
            <!-- Search Results - Folders -->
            <div v-if="searchResults.folders.length > 0" class="search-section">
              <h4>Folders</h4>
              <div class="search-folders-grid">
                <div 
                  v-for="folder in searchResults.folders" 
                  :key="folder.id"
                  class="folder-item"
                  @click="selectFolder(folder)"
                >
                  <Folder class="folder-icon" />
                  <div class="folder-info">
                    <span class="folder-name">{{ folder.name }}</span>
                    <span class="folder-path">{{ folder.path }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Search Results - Files -->
            <div v-if="searchResults.files.length > 0" class="search-section">
              <h4>Files</h4>
              <div class="search-files-grid">
                <div 
                  v-for="file in searchResults.files" 
                  :key="file.id"
                  class="file-item"
                >
                  <File class="file-icon" />
                  <div class="file-info">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    <span class="file-path">{{ file.path }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Normal Folder Content -->
          <div v-else-if="!selectedFolder" class="empty-state">
            <FolderOpen class="empty-icon" />
            <p>Select a folder from the left panel to view its contents</p>
          </div>
          
          <div v-else class="folder-content">
            <div class="content-header">
              <h3>Subfolders ({{ subfolders.length }})</h3>
            </div>
            
            <div class="subfolders-grid">
              <div 
                v-for="folder in subfolders" 
                :key="folder.id"
                class="folder-item"
              >
                <div class="folder-content" @click="selectFolder(folder)">
                  <Folder class="folder-icon" />
                  <span class="folder-name">{{ folder.name }}</span>
                </div>
                <button 
                  @click.stop="handleDelete('folder', folder.id, folder.name)"
                  class="delete-btn"
                  title="Delete folder"
                >
                  <Trash2 class="icon" />
                </button>
              </div>
            </div>
            
            <div v-if="showFiles" class="content-header">
              <h3>Files ({{ files.length }})</h3>
            </div>
            
            <div v-if="showFiles" class="files-grid">
              <div 
                v-for="file in files" 
                :key="file.id"
                class="file-item"
              >
                <div class="file-content">
                  <File class="file-icon" />
                  <div class="file-info">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  </div>
                </div>
                <button 
                  @click.stop="handleDelete('file', file.id, file.name, selectedFolder?.id)"
                  class="delete-btn"
                  title="Delete file"
                >
                  <Trash2 class="icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <!-- CRUD Modals -->
    <CreateFolderModal
      :is-open="showCreateFolderModal"
      :parent-folder="selectedFolder"
      :loading="folderStore.loading"
      @close="showCreateFolderModal = false"
      @create="handleCreateFolder"
    />
    
    <CreateFileModal
      :is-open="showCreateFileModal"
      :parent-folder="selectedFolder"
      :loading="folderStore.loading"
      @close="showCreateFileModal = false"
      @create="handleCreateFile"
    />
    
    <DeleteConfirmModal
      :is-open="showDeleteModal"
      :item-name="deleteItem?.name || ''"
      :is-folder="deleteItem?.type === 'folder'"
      :has-children="false"
      :loading="folderStore.loading"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Folder, FolderOpen, File, Search, RefreshCw, Plus, Trash2, Edit3 } from 'lucide-vue-next'
import { useFolderStore } from '@/stores/folderStore'
import FolderTree from '@/components/FolderTree.vue'
import CreateFolderModal from '@/components/CreateFolderModal.vue'
import CreateFileModal from '@/components/CreateFileModal.vue'
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue'
import type { Folder as FolderType } from '@/types/folder'

const folderStore = useFolderStore()

// Reactive data
const selectedFolder = ref<FolderType | null>(null)
const searchQuery = ref('')
const showFiles = ref(true)

// Modal states
const showCreateFolderModal = ref(false)
const showCreateFileModal = ref(false)
const showDeleteModal = ref(false)
const deleteItem = ref<{ type: 'folder' | 'file'; id: number; name: string; folderId?: number } | null>(null)

// Computed properties
const filteredFolders = computed(() => {
  if (!searchQuery.value) return folderStore.folderTree
  
  return folderStore.searchFolders(searchQuery.value)
})

const searchResults = computed(() => {
  return folderStore.searchResults
})

const hasSearchResults = computed(() => {
  return searchQuery.value && (
    searchResults.value.folders.length > 0 || 
    searchResults.value.files.length > 0
  )
})

const subfolders = computed(() => {
  if (!selectedFolder.value) return []
  return folderStore.getSubfolders(selectedFolder.value.id)
})

const files = computed(() => {
  if (!selectedFolder.value) return []
  return folderStore.getFiles(selectedFolder.value.id)
})

const breadcrumbs = computed(() => {
  if (!selectedFolder.value) return []
  return folderStore.getBreadcrumbs(selectedFolder.value.id)
})

// Methods
const selectFolder = (folder: FolderType) => {
  selectedFolder.value = folder
  folderStore.loadFolderContent(folder.id)
}

const toggleFolder = (folderId: number) => {
  folderStore.toggleFolder(folderId)
}

const navigateToFolder = (folderId: number) => {
  const folder = folderStore.getFolderById(folderId)
  if (folder) {
    selectFolder(folder)
  }
}

const refreshFolders = async () => {
  await folderStore.loadFolderTree()
}

const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    await folderStore.searchFoldersAndFiles(searchQuery.value)
  } else {
    folderStore.searchResults = { folders: [], files: [] }
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// CRUD Methods
const handleCreateFolder = async (data: { name: string; parentId?: number }) => {
  const path = data.parentId 
    ? `${selectedFolder.value?.path}/${data.name}`
    : `/${data.name}`
  
  const result = await folderStore.createFolder({
    name: data.name,
    path,
    parentId: data.parentId,
    isRoot: !data.parentId
  })
  
  if (result) {
    showCreateFolderModal.value = false
  }
}

const handleCreateFile = async (data: { name: string; size: number; folderId: number; extension?: string }) => {
  const path = `${selectedFolder.value?.path}/${data.name}`
  
  const result = await folderStore.createFile({
    name: data.name,
    path,
    folderId: data.folderId,
    size: data.size,
    extension: data.extension
  })
  
  if (result) {
    showCreateFileModal.value = false
  }
}

const handleDelete = (type: 'folder' | 'file', id: number, name: string, folderId?: number) => {
  deleteItem.value = { type, id, name, folderId }
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deleteItem.value) return
  
  let success = false
  
  if (deleteItem.value.type === 'folder') {
    success = await folderStore.deleteFolder(deleteItem.value.id)
  } else {
    success = await folderStore.deleteFile(deleteItem.value.id, deleteItem.value.folderId!)
  }
  
  if (success) {
    showDeleteModal.value = false
    deleteItem.value = null
  }
}

// Lifecycle
onMounted(async () => {
  await folderStore.loadFolderTree()
})

// Watch for folder tree changes
watch(() => folderStore.folderTree, (newTree) => {
  if (newTree.length > 0 && !selectedFolder.value) {
    // Auto-select first root folder
    selectFolder(newTree[0])
  }
})
</script>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  position: relative;
}

#app::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
  z-index: 0;
}

.app-header {
  background: linear-gradient(135deg, #236eca 0%, #2360c2 50%, #1e40af 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar input {
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.9rem;
  width: 300px;
  backdrop-filter: blur(10px);
}

.search-bar input::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  width: 1rem;
  height: 1rem;
}

.explorer-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-top: none;
  position: relative;
  z-index: 1;
}

.folder-panel {
  width: 300px;
  background: rgba(255, 255, 255, 1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  margin: 0;
  border-top: none;
  border-left: none;
  border-bottom: none;
  position: relative;
  z-index: 1;
}

.content-panel {
  flex: 1;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0;
  border-top: none;
  border-right: none;
  border-bottom: none;
  position: relative;
  z-index: 1;
}

.panel-header {
  padding: 1rem;
  border-bottom: none;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  position: relative;
  z-index: 2;
  gap: 1rem;
}

.panel-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.3);
}

.header-left {
  flex: 1;
}

.panel-header h2 {
  margin: 0.4rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(51, 65, 85, 0.9);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
}

.action-btn .icon {
  width: 1rem;
  height: 1rem;
  color: rgba(51, 65, 85, 0.8);
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
}

.icon {
  width: 1rem;
  height: 1rem;
  color: rgba(51, 65, 85, 0.8);
}

.folder-tree {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(51, 65, 85, 0.7);
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  color: rgba(51, 65, 85, 0.5);
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: rgba(51, 65, 85, 0.6);
}

.breadcrumb-item {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(51, 65, 85, 0.7);
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.breadcrumb-item:hover {
  background-color: rgba(51, 65, 85, 0.1);
  color: rgba(51, 65, 85, 0.9);
}

.breadcrumb-item.active {
  color: #475569;
  font-weight: 600;
}

.content-header {
  margin-bottom: 1rem;
}

.content-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(51, 65, 85, 0.9);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.subfolders-grid,
.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.folder-item,
.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.folder-item:hover,
.file-item:hover {
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.2);
}

.folder-content,
.file-content {
  display: contents;
  align-items: center;
  flex: 1;
  cursor: pointer;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 4px;
  padding: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
}

.folder-item:hover .delete-btn,
.file-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  transform: scale(1.1);
}

.delete-btn .icon {
  width: 0.9rem;
  height: 0.9rem;
  color: #ef4444;
}

.folder-icon,
.file-icon {
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.75rem;
  color: #3b82f6;
}

.file-icon {
  color: #666;
}

.folder-name,
.file-name {
  font-weight: 500;
  color: rgba(51, 65, 85, 0.9);
  flex: 1;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05);
}

.file-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.file-size {
  font-size: 0.8rem;
  color: rgba(51, 65, 85, 0.7);
  margin-top: 0.25rem;
}

/* Search Results Styles */
.search-results {
  padding: 1rem;
}

.search-stats {
  font-size: 0.9rem;
  color: rgba(51, 65, 85, 0.7);
  margin-top: 0.5rem;
}

.search-section {
  margin-bottom: 2rem;
}

.search-section h4 {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(51, 65, 85, 0.8);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
}

.search-folders-grid,
.search-files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.search-folders-grid .folder-item,
.search-files-grid .file-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.folder-info,
.file-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.folder-path,
.file-path {
  font-size: 0.75rem;
  color: rgba(51, 65, 85, 0.6);
  margin-top: 0.25rem;
}
</style>

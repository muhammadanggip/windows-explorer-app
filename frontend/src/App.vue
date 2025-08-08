<template>
  <div id="app">
    <header class="app-header">
      <h1>Windows Explorer</h1>
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
          <h2>{{ selectedFolder ? selectedFolder.name : 'Select a folder' }}</h2>
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
        
        <div class="content-area">
          <div v-if="!selectedFolder" class="empty-state">
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
                @click="selectFolder(folder)"
              >
                <Folder class="folder-icon" />
                <span class="folder-name">{{ folder.name }}</span>
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
                <File class="file-icon" />
                <div class="file-info">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Folder, FolderOpen, File, Search, RefreshCw } from 'lucide-vue-next'
import { useFolderStore } from '@/stores/folderStore'
import FolderTree from '@/components/FolderTree.vue'
import type { Folder as FolderType } from '@/types/folder'

const folderStore = useFolderStore()

// Reactive data
const selectedFolder = ref<FolderType | null>(null)
const searchQuery = ref('')
const showFiles = ref(true)

// Computed properties
const filteredFolders = computed(() => {
  if (!searchQuery.value) return folderStore.folderTree
  
  return folderStore.searchFolders(searchQuery.value)
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

const handleSearch = () => {
  // Search is handled by computed property
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
  align-items: center;
  margin: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  position: relative;
  z-index: 2;
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

.panel-header h2 {
  margin: 0.4rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(51, 65, 85, 0.9);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
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
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
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
</style>

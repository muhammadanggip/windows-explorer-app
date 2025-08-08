<template>
  <div class="folder-node">
    <div 
      class="folder-item"
      :class="{ 
        'selected': isSelected,
        'expanded': isExpanded
      }"
      @click="handleFolderClick"
    >
      <div class="folder-content">
        <button 
          v-if="hasSubfolders"
          class="expand-button"
          @click.stop="handleToggle"
          :class="{ 'expanded': isExpanded }"
        >
          <ChevronRight class="expand-icon" />
        </button>
        <div v-else class="expand-placeholder"></div>
        
        <Folder class="folder-icon" />
        <span class="folder-name">{{ folder.name }}</span>
      </div>
    </div>
    
    <div v-if="hasSubfolders && isExpanded" class="subfolders">
      <ul class="subfolder-list">
        <li v-for="subfolder in folder.subfolders" :key="subfolder.id" class="subfolder-item">
          <FolderTreeNode 
            :folder="subfolder"
            :selected-folder="selectedFolder"
            :expanded-folders="expandedFolders"
            @select-folder="$emit('selectFolder', $event)"
            @toggle-folder="$emit('toggleFolder', $event)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Folder, ChevronRight } from 'lucide-vue-next'
import type { Folder as FolderType } from '@/types/folder'

interface Props {
  folder: FolderType
  selectedFolder: FolderType | null
  expandedFolders: Set<number>
}

interface Emits {
  (e: 'selectFolder', folder: FolderType): void
  (e: 'toggleFolder', folderId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed properties
const isSelected = computed(() => {
  return props.selectedFolder?.id === props.folder.id
})

const isExpanded = computed(() => {
  return props.expandedFolders.has(props.folder.id)
})

const hasSubfolders = computed(() => {
  return props.folder.subfolders && props.folder.subfolders.length > 0
})

// Methods
const handleFolderClick = () => {
  emit('selectFolder', props.folder)
}

const handleToggle = () => {
  emit('toggleFolder', props.folder.id)
}
</script>

<style scoped>
.folder-node {
  width: 100%;
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.folder-item:hover {
  background-color: #f0f0f0;
}

.folder-item.selected {
  background-color: #e3f2fd;
  color: #1976d2;
}

.folder-content {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
}

.expand-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 2px;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.expand-button.expanded {
  transform: rotate(90deg);
}

.expand-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: #666;
}

.expand-placeholder {
  width: 1.25rem;
}

.folder-icon {
  width: 1rem;
  height: 1rem;
  color: #667eea;
  flex-shrink: 0;
}

.folder-name {
  font-size: 0.9rem;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subfolders {
  margin-left: 1.5rem;
}

.subfolder-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.subfolder-item {
  margin: 0;
}
</style>

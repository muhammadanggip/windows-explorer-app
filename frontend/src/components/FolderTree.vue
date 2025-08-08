<template>
  <div class="folder-tree">
    <div v-if="folders.length === 0" class="empty-state">
      <p>No folders found</p>
    </div>
    
    <ul v-else class="tree-list">
      <li v-for="folder in folders" :key="folder.id" class="tree-item">
        <FolderTreeNode 
          :folder="folder"
          :selected-folder="selectedFolder"
          :expanded-folders="expandedFolders"
          @select-folder="$emit('selectFolder', $event)"
          @toggle-folder="$emit('toggleFolder', $event)"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FolderTreeNode from './FolderTreeNode.vue'
import type { Folder } from '@/types/folder'

interface Props {
  folders: Folder[]
  selectedFolder: Folder | null
  expandedFolders: Set<number>
}

interface Emits {
  (e: 'selectFolder', folder: Folder): void
  (e: 'toggleFolder', folderId: number): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.folder-tree {
  width: 100%;
}

.empty-state {
  padding: 1rem;
  text-align: center;
  color: #666;
}

.tree-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tree-item {
  margin: 0;
}
</style>

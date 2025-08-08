<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Create New File</h3>
        <button @click="closeModal" class="close-btn">
          <X class="icon" />
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="fileName">File Name:</label>
          <input
            id="fileName"
            v-model="formData.name"
            type="text"
            placeholder="Enter file name (e.g., document.txt)"
            required
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="fileSize">File Size (bytes):</label>
          <input
            id="fileSize"
            v-model.number="formData.size"
            type="number"
            min="0"
            placeholder="Enter file size in bytes"
            required
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label>Parent Folder:</label>
          <div class="parent-info">
            <span>{{ parentFolder?.name || 'Unknown' }}</span>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closeModal" :disabled="loading" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" :disabled="loading || !formData.name.trim() || formData.size <= 0" class="btn-primary">
            <span v-if="loading">Creating...</span>
            <span v-else>Create File</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import type { Folder } from '@/types/folder'

interface Props {
  isOpen: boolean
  parentFolder?: Folder | null
  loading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'create', data: { name: string; size: number; folderId: number; extension?: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = ref({
  name: '',
  size: 0
})

const fileExtension = computed(() => {
  const name = formData.value.name
  const lastDotIndex = name.lastIndexOf('.')
  return lastDotIndex > 0 ? name.substring(lastDotIndex + 1) : undefined
})

const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  if (!formData.value.name.trim() || formData.value.size <= 0 || !props.parentFolder) return
  
  const path = `${props.parentFolder.path}/${formData.value.name}`
  
  emit('create', {
    name: formData.value.name.trim(),
    size: formData.value.size,
    folderId: props.parentFolder.id,
    extension: fileExtension.value
  })
}

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    formData.value.name = ''
    formData.value.size = 0
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(51, 65, 85, 0.9);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(51, 65, 85, 0.1);
}

.icon {
  width: 1.2rem;
  height: 1.2rem;
  color: rgba(51, 65, 85, 0.7);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: rgba(51, 65, 85, 0.8);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.parent-info {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  color: rgba(51, 65, 85, 0.8);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.8);
  color: rgba(51, 65, 85, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.9);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

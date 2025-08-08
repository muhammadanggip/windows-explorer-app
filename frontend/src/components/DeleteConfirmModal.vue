<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Confirm Delete</h3>
        <button @click="closeModal" class="close-btn">
          <X class="icon" />
        </button>
      </div>
      
      <div class="modal-body">
        <div class="warning-icon">
          <AlertTriangle class="icon" />
        </div>
        
        <div class="confirm-message">
          <p>Are you sure you want to delete <strong>{{ itemName }}</strong>?</p>
          <p v-if="isFolder && hasChildren" class="warning-text">
            This folder contains subfolders and/or files. Deleting it will remove all contents.
          </p>
          <p v-else-if="isFolder" class="info-text">
            This action cannot be undone.
          </p>
        </div>
        
        <div class="form-actions">
          <button @click="closeModal" :disabled="loading" class="btn-secondary">
            Cancel
          </button>
          <button @click="handleConfirm" :disabled="loading" class="btn-danger">
            <span v-if="loading">Deleting...</span>
            <span v-else>Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, AlertTriangle } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  itemName: string
  isFolder?: boolean
  hasChildren?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const closeModal = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
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
  text-align: center;
}

.warning-icon {
  margin-bottom: 1rem;
}

.warning-icon .icon {
  width: 3rem;
  height: 3rem;
  color: #ef4444;
}

.confirm-message {
  margin-bottom: 2rem;
}

.confirm-message p {
  margin: 0.5rem 0;
  color: rgba(51, 65, 85, 0.8);
  line-height: 1.5;
}

.warning-text {
  color: #ef4444 !important;
  font-size: 0.9rem;
  font-weight: 500;
}

.info-text {
  color: rgba(51, 65, 85, 0.6) !important;
  font-size: 0.9rem;
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
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

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import FolderTree from '@/components/FolderTree.vue'
import type { Folder } from '@/types/folder'

describe('FolderTree', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
  })

  const createMockFolder = (id: number, name: string, parentId: number | null = null, subfolders: Folder[] = []): Folder => ({
    id,
    name,
    path: `/${name}`,
    parentId,
    isRoot: parentId === null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subfolders
  })

  it('renders empty state when no folders provided', () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: [],
        selectedFolder: null,
        expandedFolders: new Set()
      },
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('No folders found')
  })

  it('renders folder list when folders are provided', () => {
    const folders = [
      createMockFolder(1, 'Documents'),
      createMockFolder(2, 'Pictures')
    ]

    const wrapper = mount(FolderTree, {
      props: {
        folders,
        selectedFolder: null,
        expandedFolders: new Set()
      },
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(false)
    expect(wrapper.find('.tree-list').exists()).toBe(true)
    expect(wrapper.findAll('.tree-item')).toHaveLength(2)
  })

  it('emits selectFolder event when folder is clicked', async () => {
    const folders = [createMockFolder(1, 'Documents')]
    const wrapper = mount(FolderTree, {
      props: {
        folders,
        selectedFolder: null,
        expandedFolders: new Set()
      },
      global: {
        plugins: [pinia]
      }
    })

    await wrapper.find('.folder-item').trigger('click')

    expect(wrapper.emitted('selectFolder')).toBeTruthy()
    expect(wrapper.emitted('selectFolder')?.[0]).toEqual([folders[0]])
  })

  it('emits toggleFolder event when expand button is clicked', async () => {
    const subfolders = [createMockFolder(2, 'Work')]
    const folders = [createMockFolder(1, 'Documents', null, subfolders)]

    const wrapper = mount(FolderTree, {
      props: {
        folders,
        selectedFolder: null,
        expandedFolders: new Set()
      },
      global: {
        plugins: [pinia]
      }
    })

    await wrapper.find('.expand-button').trigger('click')

    expect(wrapper.emitted('toggleFolder')).toBeTruthy()
    expect(wrapper.emitted('toggleFolder')?.[0]).toEqual([1])
  })

  it('shows expand button for folders with subfolders', () => {
    const subfolders = [createMockFolder(2, 'Work')]
    const folders = [createMockFolder(1, 'Documents', null, subfolders)]

    const wrapper = mount(FolderTree, {
      props: {
        folders,
        selectedFolder: null,
        expandedFolders: new Set()
      },
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('.expand-button').exists()).toBe(true)
  })

  it('shows placeholder for folders without subfolders', () => {
    const folders = [createMockFolder(1, 'Documents')]

    const wrapper = mount(FolderTree, {
      props: {
        folders,
        selectedFolder: null,
        expandedFolders: new Set()
      },
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('.expand-placeholder').exists()).toBe(true)
  })

  it('applies selected class to selected folder', () => {
    const folders = [createMockFolder(1, 'Documents')]
    const selectedFolder = folders[0]

    const wrapper = mount(FolderTree, {
      props: {
        folders,
        selectedFolder,
        expandedFolders: new Set()
      },
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('.folder-item.selected').exists()).toBe(true)
  })

  it('applies expanded class to expanded folder', () => {
    const subfolders = [createMockFolder(2, 'Work')]
    const folders = [createMockFolder(1, 'Documents', null, subfolders)]
    const expandedFolders = new Set([1])

    const wrapper = mount(FolderTree, {
      props: {
        folders,
        selectedFolder: null,
        expandedFolders
      },
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('.folder-item.expanded').exists()).toBe(true)
  })

  it('shows subfolders when folder is expanded', () => {
    const subfolders = [createMockFolder(2, 'Work')]
    const folders = [createMockFolder(1, 'Documents', null, subfolders)]
    const expandedFolders = new Set([1])

    const wrapper = mount(FolderTree, {
      props: {
        folders,
        selectedFolder: null,
        expandedFolders
      },
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('.subfolders').exists()).toBe(true)
    expect(wrapper.find('.subfolder-list').exists()).toBe(true)
  })

  it('hides subfolders when folder is not expanded', () => {
    const subfolders = [createMockFolder(2, 'Work')]
    const folders = [createMockFolder(1, 'Documents', null, subfolders)]
    const expandedFolders = new Set()

    const wrapper = mount(FolderTree, {
      props: {
        folders,
        selectedFolder: null,
        expandedFolders
      },
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('.subfolders').exists()).toBe(false)
  })
})

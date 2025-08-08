export interface Folder {
  id: number
  name: string
  path: string
  parentId: number | null
  isRoot: boolean
  createdAt: string
  updatedAt: string
  subfolders?: Folder[]
}

export interface File {
  id: number
  name: string
  path: string
  folderId: number
  size: number
  extension: string | null
  createdAt: string
  updatedAt: string
}

export interface FolderWithContent extends Folder {
  subfolders: Folder[]
  files: File[]
}

export interface Breadcrumb {
  id: number
  name: string
  path: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

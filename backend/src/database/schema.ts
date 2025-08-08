import { mysqlTable, serial, varchar, text, timestamp, int, boolean } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'

export const folders = mysqlTable('folders', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  path: text('path').notNull().unique(),
  parentId: int('parent_id'),
  isRoot: boolean('is_root').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const files = mysqlTable('files', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  path: text('path').notNull().unique(),
  folderId: int('folder_id').notNull(),
  size: int('size').default(0),
  extension: varchar('extension', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Relations
export const foldersRelations = relations(folders, ({ many, one }) => ({
  subfolders: many(folders, { relationName: 'parentChild' }),
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
    relationName: 'parentChild'
  }),
  files: many(files)
}))

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id]
  })
}))

export type Folder = typeof folders.$inferSelect
export type NewFolder = typeof folders.$inferInsert
export type File = typeof files.$inferSelect
export type NewFile = typeof files.$inferInsert

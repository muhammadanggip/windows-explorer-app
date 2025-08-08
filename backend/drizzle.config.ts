import { defineConfig } from 'drizzle-kit'
import { config } from './src/config/config'

// Parse the database URL to extract connection details
const url = new URL(config.database.url)

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1)
  },
  verbose: true,
  strict: true
})

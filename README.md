# Windows Explorer Web App

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety and development experience
- **MySQL** - Database
- **Drizzle ORM** - Database schema management and queries
- **CORS** - Cross-origin resource sharing

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Composition API** - Vue 3's composition-based API
- **Pinia** - State management
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Lucide Vue Next** - Icon library
- **Axios** - HTTP client

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd windows-explorer-app
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies (From root)
cd backend
npm install

# Install frontend dependencies (From root)
cd frontend
npm install
```

### 3. Database Setup
1. Create a MySQL database named `windows_explorer`
2. Copy `.env.example` to `.env` in the backend directory
3. Update the database connection string in `.env`:
```env
DATABASE_URL=mysql://username:password@localhost:3306/windows_explorer
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 4. Database Migration & Seeding
```bash
# From the root directory
npm run db:setup
npm run db:migrate
npm run db:seed
```

### 5. Start Development Servers
```bash

# start them separately:
# Backend (from root)
cd backend
npm run dev
http://localhost:3000

#Frontend (from root)
cd frontend
npm run dev
http://localhost:5173
```

## Project Structure

```
windows-explorer-app/
├── backend/                 # Backend application
│   ├── src/
│   │   ├── database/       # Database schema and connection
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── index.ts        # Main entry point
│   ├── drizzle.config.ts   # Drizzle ORM configuration
│   └── package.json
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── stores/         # Pinia stores
│   │   ├── types/          # TypeScript type definitions
│   │   ├── api/            # API client
│   │   └── App.vue         # Main application component
│   ├── vite.config.ts      # Vite configuration
│   └── package.json
├── package.json            # Root package.json (monorepo)
└── README.md
```

## API Endpoints

### Folders
- `GET /api/v1/folders/tree` - Get hierarchical folder structure
- `GET /api/v1/folders/:id` - Get folder by ID
- `POST /api/v1/folders` - Create new folder
- `PUT /api/v1/folders/:id` - Update folder
- `DELETE /api/v1/folders/:id` - Delete folder

### Files
- `GET /api/v1/files` - Get all files
- `GET /api/v1/files/:id` - Get file by ID
- `POST /api/v1/files` - Create new file
- `PUT /api/v1/files/:id` - Update file
- `DELETE /api/v1/files/:id` - Delete file

## Database Schema

### Folders Table
- `id` - Primary key
- `name` - Folder name
- `path` - Full path to folder
- `parentId` - Parent folder ID (nullable for root folders)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Files Table
- `id` - Primary key
- `name` - File name
- `path` - Full path to file
- `size` - File size in bytes
- `folderId` - Parent folder ID
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp




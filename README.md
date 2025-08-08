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

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
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
# Start both backend and frontend (from root directory)
npm run dev

# Or start them separately:
npm run dev:backend  # Backend on http://localhost:3000
npm run dev:frontend # Frontend on http://localhost:5173
```

## 📁 Project Structure

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

## UI/UX Features

### Glassmorphism Design
- Translucent panels with backdrop blur effects
- Layered shadows for depth and dimension
- Smooth hover animations and transitions
- Modern gradient backgrounds

### Responsive Layout
- Dual-panel design that adapts to screen size
- Collapsible folder tree for mobile devices
- Touch-friendly interface elements

### Interactive Elements
- Hover effects on folders and files
- Smooth transitions and animations
- Visual feedback for user actions

## 🔧 Available Scripts

### Root Directory
```bash
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run build            # Build both applications
npm run build:backend    # Build backend only
npm run build:frontend   # Build frontend only
npm run test             # Run tests for both
npm run db:setup         # Setup database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
```

### Backend Directory
```bash
npm run dev              # Start development server
npm run start            # Start production server
npm run build            # Build TypeScript
npm run test             # Run tests
```

### Frontend Directory
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
```

## 📊 API Endpoints

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

### Health & Documentation
- `GET /health` - Health check endpoint
- `GET /swagger` - API documentation

## 🗄️ Database Schema

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

## 🚀 Deployment

### Backend Deployment
1. Build the backend: `npm run build:backend`
2. Set production environment variables
3. Deploy to your preferred hosting service (Heroku, Vercel, etc.)

### Frontend Deployment
1. Build the frontend: `npm run build:frontend`
2. Deploy the `dist` folder to a static hosting service
3. Update API base URL for production




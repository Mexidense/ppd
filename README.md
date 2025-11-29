### PPD: Pay-per-document

A Next.js application for managing pay-per-document transactions using Supabase and MinIO.

## ⚡ Quick Start

**New to this project?** Check out the [5-Minute Quick Start Guide](./QUICKSTART.md) →

## 🚀 Detailed Setup

### Prerequisites
- Node.js 20+
- Docker Desktop
- A Supabase account ([sign up here](https://supabase.com))

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Follow the instructions in [`backend/README.md`](./backend/README.md)
   - Create your `.env.local` file with credentials (see [`backend/SETUP.md`](./backend/SETUP.md))

3. **Start Docker (MinIO):**
   ```bash
   docker-compose up -d
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ppd/
├── app/
│   ├── api/          # Next.js API routes
│   │   ├── documents/    # Document endpoints
│   │   ├── purchases/    # Purchase endpoints
│   │   └── stats/        # Statistics endpoints
│   ├── library/      # My library page
│   ├── published/    # Published docs page
│   ├── layout.tsx    # Root layout with sidebar
│   ├── page.tsx      # Home page (all documents)
│   └── globals.css   # Global styles (dark theme)
├── backend/
│   ├── storage/      # MinIO/S3 configuration
│   ├── supabase/     # Supabase setup
│   │   ├── migrations/  # SQL migration files
│   │   ├── config.ts    # Supabase client
│   │   ├── documents.ts # Document operations
│   │   ├── purchases.ts # Purchase operations
│   │   ├── stats.ts     # Statistics operations
│   │   ├── tags.ts      # Tag operations
│   │   └── search.ts    # Search functionality
│   ├── API.md        # API documentation
│   ├── DOCKER.md     # Docker/MinIO guide
│   ├── STATS.md      # Statistics API guide
│   ├── TAGS.md       # Tags system guide
│   └── test-api.sh   # API test script
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── sidebar.tsx   # Navigation sidebar
│   ├── header.tsx    # Page header with wallet button
│   ├── wallet-provider.tsx  # BSV wallet management
│   ├── wallet-button.tsx    # Wallet connect/disconnect button
│   ├── theme-provider.tsx   # Dark/light theme provider
│   ├── theme-toggle.tsx     # Theme toggle button
│   └── document-card.tsx    # Document card component
├── frontend/
│   ├── README.md     # Frontend documentation
│   └── BSV_SDK.md    # BSV SDK integration guide
├── lib/
│   ├── utils.ts      # Utility functions
│   └── bsv-utils.ts  # BSV blockchain utilities
├── docker-compose.yml   # MinIO setup
└── QUICKSTART.md     # Quick start guide
```

## 🗄️ Database & Storage

### Database (Supabase/PostgreSQL)
- **documents**: Store document metadata (path, hash, cost)
- **purchases**: Track document purchases with blockchain transactions

See [`backend/README.md`](./backend/README.md) for detailed database schema.

### File Storage (MinIO)
- S3-compatible object storage
- Runs locally via Docker
- Console UI at [http://localhost:9001](http://localhost:9001)

See [`backend/DOCKER.md`](./backend/DOCKER.md) for MinIO setup and configuration.

## 🌐 API Endpoints

### Documents
- `GET /api/documents` - List all documents (or search with ?title= and/or ?tags= params)
- `GET /api/documents/[id]` - Get document by ID
- `POST /api/documents/upload` - Upload file and create document
- `DELETE /api/documents/[id]` - Delete document

### Purchases
- `POST /api/purchases` - Create purchase record
- `GET /api/purchases` - List all purchases
- `GET /api/purchases/buyer/[address]` - Get purchases by buyer

### Statistics
- `GET /api/stats/total` - Get total aggregated stats (with date range filters)
- `GET /api/stats/daily` - Get daily aggregated stats (with date range filters)
- `GET /api/stats/documents/[id]` - Get stats for specific document

See [API Documentation](./backend/API.md) for detailed usage and examples.

## 🐳 Local Development with Docker

This project uses MinIO (S3-compatible storage) for file storage:

```bash
# Start MinIO
docker-compose up -d

# Access MinIO Console
open http://localhost:9001
# Username: minioadmin
# Password: minioadmin123

# Start Next.js dev server
npm run dev
```

See [Docker Setup Guide](./backend/DOCKER.md) for more details.

## 🎨 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons

### Backend
- **Supabase** - PostgreSQL database
- **MinIO** - S3-compatible file storage
- **Next.js API Routes** - REST API
- **@bsv/sdk** - Bitcoin SV blockchain integration

## 📚 Documentation

### Getting Started
- [**Quick Start**](./QUICKSTART.md) - Get started in 5 minutes ⚡
- [Environment Variables](./backend/SETUP.md) - How to configure your environment

### Backend
- [Backend Setup Guide](./backend/README.md) - Complete guide to setting up Supabase
- [API Documentation](./backend/API.md) - API endpoints and usage examples
- [Docker Guide](./backend/DOCKER.md) - MinIO setup and troubleshooting
- [Statistics API](./backend/STATS.md) - Stats endpoints guide
- [Tags System](./backend/TAGS.md) - Tag management guide
- [Search](./backend/SEARCH.md) - Document search guide

### Frontend
- [Frontend Guide](./frontend/README.md) - UI components and pages
- [BSV SDK Integration](./frontend/BSV_SDK.md) - Wallet and blockchain functionality
- [shadcn/ui](https://ui.shadcn.com/) - Component library docs

## 🧪 Testing

Test all API endpoints:

```bash
cd backend
./test-api.sh
```

Or manually test with cURL (see [API.md](./backend/API.md) for examples).

## 🖥️ Development

```bash
# Start MinIO
docker-compose up -d

# Start Next.js dev server
npm run dev

# Open browser
open http://localhost:3000
```

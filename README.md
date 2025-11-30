### PPD: Pay-per-document

A Next.js application for managing pay-per-document transactions using Supabase and BSV blockchain.

## ⚡ Quick Start

**New to this project?** Check out the [5-Minute Quick Start Guide](./QUICKSTART.md) →

## 🚀 Detailed Setup

### Prerequisites
- Node.js 20+
- A Supabase account ([sign up here](https://supabase.com))
- BSV Wallet

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Follow the instructions in [`backend/README.md`](./backend/README.md)
   - Create your `.env` file with credentials (see [`backend/SETUP.md`](./backend/SETUP.md))
   - Run the database migrations in your Supabase project

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

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
│   ├── supabase/     # Supabase setup
│   │   ├── migrations/  # SQL migration files
│   │   ├── config.ts    # Supabase client
│   │   ├── documents.ts # Document operations
│   │   ├── purchases.ts # Purchase operations
│   │   ├── stats.ts     # Statistics operations
│   │   ├── tags.ts      # Tag operations
│   │   └── search.ts    # Search functionality
│   ├── API.md        # API documentation
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
└── QUICKSTART.md     # Quick start guide
```

## 🗄️ Database

### Supabase/PostgreSQL
- **documents**: Store document metadata and file data (BYTEA)
- **purchases**: Track document purchases with blockchain transactions
- **tags**: Tag system for document categorization

Files are stored directly in the database as binary data (BYTEA column).

See [`backend/README.md`](./backend/README.md) for detailed database schema.

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

## 💻 Local Development

```bash
# Start Next.js dev server
npm run dev

# Open browser
open http://localhost:3000
```

## 🎨 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons

### Backend
- **Supabase** - PostgreSQL database (including file storage)
- **Next.js API Routes** - REST API
- **@bsv/sdk** - Bitcoin SV blockchain integration
- **@bsv/auth-express-middleware** - BSV authentication
- **@bsv/payment-express-middleware** - BSV payment processing

## 📚 Documentation

### Getting Started
- [**Quick Start**](./QUICKSTART.md) - Get started in 5 minutes ⚡
- [Environment Variables](./backend/SETUP.md) - How to configure your environment

### Backend
- [Backend Setup Guide](./backend/README.md) - Complete guide to setting up Supabase
- [API Documentation](./backend/API.md) - API endpoints and usage examples
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
# Start Next.js dev server
npm run dev

# Open browser
open http://localhost:3000
```

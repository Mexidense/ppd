# PPD - Pay Per Document 💰📄

A decentralized pay-per-document marketplace built with Next.js, Supabase, and Bitcoin SV (BSV) blockchain. Upload documents, set prices, and get paid in cryptocurrency.

**Live Demo:** [https://ppd-three.vercel.app](https://ppd-three.vercel.app)

---

## 🌟 Features

- **📤 Upload & Sell** - Upload PDF documents and set your price
- **💳 Crypto Payments** - Secure payments with Bitcoin SV
- **🔐 Wallet Integration** - Connect your BSV wallet
- **👁️ Secure Access** - Only buyers can view purchased documents  
- **📊 Analytics** - Track sales, revenue, and document performance
- **🏷️ Tags & Search** - Organize and discover documents
- **📈 Creator Dashboard** - Detailed insights for content creators
- **🎨 Modern UI** - Dark mode, responsive design

---

## ⚡ Quick Start

### Prerequisites

- Node.js 20+
- Supabase account ([sign up free](https://supabase.com))
- BSV wallet (for payments)

### 1. Clone & Install

```bash
git clone <your-repo>
cd ppd
npm install
```

### 2. Database Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in dashboard
3. Run these migrations in order:

```bash
# Copy and run in Supabase SQL Editor:
backend/supabase/migrations/001_create_documents_table.sql
backend/supabase/migrations/002_create_purchases_table.sql
backend/supabase/migrations/003_create_tags_system.sql
backend/supabase/migrations/004_create_row_level_security.sql
```

### 3. Environment Variables

Create `.env.local`:

```env
# Supabase (from https://app.supabase.com/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role Key (Required for admin operations like delete)
# IMPORTANT: Keep this secret! Never expose to client-side code
# Get from: https://app.supabase.com/project/_/settings/api (under "service_role" section)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Backend Wallet (generates from setup command)
BACKEND_PRIVATE_KEY=your-backend-private-key
STORAGE_URL=https://storage.babbage.systems
NETWORK=main
```

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` is required for document deletion to work properly. This key bypasses Row Level Security (RLS) policies and should only be used in secure server-side contexts.

### 4. Generate Backend Wallet

```bash
npm run setup:wallet
```

This creates a backend wallet and adds `PRIVATE_KEY` to `.env`.

### 5. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### 6. (Optional) Start Wallet Server

For testing payments locally:

```bash
npm run wallet-server
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│          Next.js Frontend                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Home   │ │ Upload  │ │ Viewer  │   │
│  │  Page   │ │  Page   │ │  Page   │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└────────────────┬─────────────────────────┘
                 │
      ┌──────────┼──────────┐
      │          │          │
      ▼          ▼          ▼
┌──────────┐ ┌──────┐ ┌──────────┐
│ Supabase │ │ BSV  │ │   API    │
│ Database │ │ SDK  │ │  Routes  │
└──────────┘ └──────┘ └──────────┘
```

### Tech Stack

**Frontend:**
- Next.js 16 (App Router) + React 19
- TypeScript + Tailwind CSS
- shadcn/ui components
- BSV SDK for wallet integration

**Backend:**
- Supabase (PostgreSQL database)
- Next.js API Routes
- BSV blockchain integration
- Payment & authentication middleware

---

## 📁 Project Structure

```
ppd/
├── app/                          # Next.js pages
│   ├── page.tsx                 # Home/marketplace
│   ├── upload/page.tsx          # Upload documents
│   ├── view/[id]/page.tsx       # View purchased docs
│   ├── published/page.tsx       # Creator's docs
│   ├── library/page.tsx         # User's purchases
│   └── creator/stats/page.tsx   # Analytics
│
├── pages/api/                    # API endpoints
│   ├── documents/               # CRUD + purchase
│   ├── purchases/               # Purchase history
│   ├── stats/                   # Analytics data
│   └── tags/                    # Tag management
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui
│   ├── document-card.tsx        # Document display
│   ├── wallet-provider.tsx      # Wallet state
│   ├── wallet-button.tsx        # Connect UI
│   └── upload-document.tsx      # Upload form
│
├── backend/supabase/            # Database layer
│   ├── migrations/              # SQL migrations
│   ├── documents.ts             # Document queries
│   ├── purchases.ts             # Purchase queries
│   ├── stats.ts                 # Analytics queries
│   └── tags.ts                  # Tag queries
│
└── lib/                         # Utilities
    ├── wallet.ts                # Frontend wallet
    ├── wallet-server.ts         # Backend wallet
    └── middleware.ts            # Auth & payments
```

---

## 🗄️ Database Schema

### `documents`
Stores document metadata and binary file data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Document title |
| hash | VARCHAR(255) | SHA-256 hash (unique) |
| cost | FLOAT | Price in satoshis |
| address_owner | VARCHAR(255) | Creator's BSV address |
| file_data | BYTEA | Binary PDF data |
| file_size | INTEGER | Size in bytes |
| mime_type | VARCHAR(100) | File type |
| created_at | TIMESTAMP | Upload time |

### `purchases`
Tracks document purchases with blockchain transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| address_buyer | VARCHAR(255) | Buyer's BSV address |
| doc_id | UUID | FK to documents.id |
| transaction_id | VARCHAR(255) | BSV transaction hash |
| created_at | TIMESTAMP | Purchase time |

### `tags` & `document_tags`
Many-to-many relationship for document categorization.

---

## 📡 API Endpoints

### Documents

**List/Search Documents**
```bash
GET /api/documents
GET /api/documents?title=react
GET /api/documents?tags=tutorial,beginner
```

**Get Document Details**
```bash
GET /api/documents/[id]
```

**Upload Document**
```bash
POST /api/documents
Content-Type: multipart/form-data

Fields:
- file: PDF file
- title: Document title
- cost: Price in satoshis
- address_owner: Creator's BSV address
- tags: JSON array of tag names
```

**View/Download Document**
```bash
GET /api/documents/[id]/view?buyer=[address]
```

**Purchase Document**
```bash
POST /api/documents/[id]/purchase
Headers:
- x-bsv-payment: Payment transaction data
```

**Delete Document**
```bash
DELETE /api/documents/[id]
```

### Purchases

**Get User's Purchases**
```bash
GET /api/purchases/buyer/[address]
```

### Statistics

**Creator Analytics**
```bash
GET /api/stats/creator/[address]
```

### Tags

**List All Tags**
```bash
GET /api/tags
```

**Create Tag**
```bash
POST /api/tags
Body: { "name": "tutorial" }
```

---

## 🔐 Wallet System

The app uses **two separate wallets**:

### 1. Backend Wallet (Server-Side)
**Purpose:** Receives payments from buyers

**Setup:**
```bash
npm run setup:wallet
```

This generates a private key and saves it to `.env` as `PRIVATE_KEY`. Add it to Vercel as `BACKEND_PRIVATE_KEY`.

**How it works:**
- Runs in Next.js API routes
- Uses BSV payment middleware
- Automatically receives payments
- No separate server needed

### 2. User Wallet (Client-Side)
**Purpose:** Users make payments from their wallet

**For Development:**
```bash
npm run wallet-server
```

This starts a local wallet server on `localhost:3321`.

**For Production:**
Users need their own BSV wallet with JSON-API support configured for your domain.

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables**

In Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BACKEND_PRIVATE_KEY=your-backend-private-key
STORAGE_URL=https://storage.babbage.systems
NETWORK=main
```

4. **Deploy**

```bash
vercel --prod
```

### Enable Supabase Row Level Security

Run in Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Public read purchases" ON purchases FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read document_tags" ON document_tags FOR SELECT USING (true);

-- Public write policies
CREATE POLICY "Anyone can upload" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can purchase" ON purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create tags" ON tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can tag documents" ON document_tags FOR INSERT WITH CHECK (true);
```

---

## 💻 Development

### Available Scripts

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run setup:wallet # Generate backend wallet
npm run wallet-server # Start local wallet server
```

### Development Workflow

```bash
# Terminal 1: Main app
npm run dev

# Terminal 2: Wallet server (for testing payments)
npm run wallet-server

# Terminal 3: Watch logs
# Check console for errors
```

---

## 🧪 Testing

### Manual API Testing

```bash
# List documents
curl http://localhost:3000/api/documents

# Upload document
curl -X POST http://localhost:3000/api/documents \
  -F "file=@document.pdf" \
  -F "title=My Document" \
  -F "cost=1000" \
  -F "address_owner=03abc..." \
  -F 'tags=["tutorial","react"]'

# Search documents
curl "http://localhost:3000/api/documents?title=react&tags=tutorial"

# Get wallet info
curl http://localhost:3000/api/wallet-info
```

### Test Wallet Connection

1. Start wallet server: `npm run wallet-server`
2. Visit app: `http://localhost:3000`
3. Click "Connect Wallet"
4. Should see green badge with wallet address

---

## 🔧 Troubleshooting

### Database Connection Failed

**Problem:** 500 error when loading documents

**Solution:**
- Check `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure migrations are run
- Check RLS policies are created

### Wallet Connection Failed

**Problem:** "No wallet detected" error

**Solution:**
- Make sure wallet server is running: `npm run wallet-server`
- Check port 3321 is not blocked
- Verify CORS is configured (for deployed app)
- Look at browser console for detailed errors

### Document Upload Fails

**Problem:** Upload returns error

**Solution:**
- Check file is PDF format
- Verify file size < 50MB
- Ensure `file_data` column exists in database
- Check backend wallet is configured

### Cannot View Own Documents

**Problem:** "Wallet not connected" on view page

**Solution:**
- Connect wallet first (top-right button)
- Wallet must be running: `npm run wallet-server`
- Check wallet address matches document owner

### 500 Internal Server Error

**Solution:**
- Check terminal logs: `npm run dev`
- Verify all environment variables are set
- Test Supabase connection
- Check API route imports

---

## 📚 Key Concepts

### Payment Flow

1. User clicks "Purchase" on document
2. Frontend requests payment info from backend
3. Backend returns payment derivation prefix
4. User's wallet creates payment transaction
5. Frontend sends signed transaction to backend
6. Backend payment middleware validates
7. Backend wallet receives payment
8. Purchase record created in database
9. User can now view document

### Access Control

- **Document Owner:** Can view anytime
- **Buyers:** Can view after purchasing
- **Others:** Must purchase first
- Access verified via BSV wallet address

### Tag System

- Documents support multiple tags
- Search by title and/or tags
- Case-insensitive matching
- Auto-complete suggestions

### File Storage

- Files stored as binary (BYTEA) in database
- SHA-256 hash for integrity
- Served securely through API
- Access control via wallet verification

---

## 🎯 Features Explained

### Creator Dashboard
- Total documents published
- Total sales and revenue
- Daily sales charts
- Top performing documents
- Filter by date range

### Document Management
- Upload PDF documents
- Set price in satoshis
- Add tags for categorization
- Generate shareable payment links
- Delete own documents

### Marketplace
- Browse all documents
- Search by title
- Filter by tags
- View document details
- Purchase with BSV
- My Library view for purchases

### Wallet Integration
- Auto-connect on app load
- Connect/disconnect manually
- Persistent session
- Transaction signing
- Payment verification

---

## 🛠️ Advanced Configuration

### Custom Wallet Port

```env
NEXT_PUBLIC_WALLET_HOST=localhost:3001
```

### Test vs Main Network

```env
NETWORK=test  # For testnet
NETWORK=main  # For mainnet
```

### Custom Storage URL

```env
STORAGE_URL=https://your-storage-provider.com
```

---

## 📊 Analytics

The creator dashboard provides:

- **Total Documents:** Number of published docs
- **Total Purchases:** Total sales count
- **Total Revenue:** Earnings in satoshis
- **Average Price:** Mean document price
- **Daily Stats:** Sales over time chart
- **Top Documents:** Best performing content

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📖 PDF Viewing Approaches

The app now uses **react-pdf** (built on PDF.js) for better PDF rendering instead of iframes. Here are the different approaches:

### ✅ Current: React-PDF (Recommended)

**Pros:**
- ✨ Native React component
- 🎨 Full styling control
- 📱 Better mobile support
- 🔍 Built-in zoom and navigation
- 📄 Page-by-page rendering
- 🎯 Text selection and search
- 🔒 More secure (no iframe sandboxing issues)

**Cons:**
- 📦 Larger bundle size (~500KB)
- 🚀 Requires worker configuration

### Alternative Approaches:

#### 1. **Iframe (Previous Implementation)**
```tsx
<iframe src={pdfUrl} className="w-full h-full" />
```
- ✅ Simple, native browser support
- ❌ Limited control over UI
- ❌ Browser compatibility issues
- ❌ No zoom/navigation controls

#### 2. **Object/Embed Tags**
```tsx
<object data={pdfUrl} type="application/pdf" />
```
- ✅ Native HTML element
- ❌ Similar limitations to iframe
- ❌ Poor mobile support

#### 3. **PDF.js Directly (Advanced)**
```tsx
// More control but more complex setup
import * as pdfjsLib from 'pdfjs-dist';
// Manual canvas rendering
```
- ✅ Maximum control
- ❌ More complex implementation
- ❌ Requires manual UI building

#### 4. **Third-Party Services**
- PDF.js Express (commercial)
- PSPDFKit (commercial)
- ✅ Enterprise features
- ❌ Licensing costs

### Configuration

The app uses the unpkg CDN for the PDF.js worker:
```tsx
pdfjs.GlobalWorkerOptions.workerSrc = 
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

For production, consider self-hosting the worker file for better performance and reliability.

### Switching Back to Iframe

If you prefer the iframe approach, simply replace the `PDFViewer` component in `app/view/[id]/page.tsx`:

```tsx
// Instead of:
<PDFViewer url={pdfUrl} title={documentMetadata?.title} onDownload={handleDownload} />

// Use:
<div className="w-full h-full">
  <iframe src={pdfUrl} className="w-full h-full border-0" title={documentMetadata?.title || 'Document'} />
</div>
```

---

## 🔧 Troubleshooting

### Documents Not Displaying in Viewer

If documents aren't displaying properly in the viewer page, check the following:

#### 1. **Check Browser Console Logs**
Open the browser console (F12) and look for:
- "PDF magic bytes check" - Should show `%PDF` (indicates valid PDF data)
- "Received blob" - Should show file size and type
- "PDF header check" - Should show `%PDF-`

#### 2. **Verify Database Storage**
The PDF files are stored as BYTEA in Supabase. Check:
```bash
# In Supabase SQL Editor, check a document's file_data:
SELECT id, title, file_size, 
       length(file_data) as stored_bytes,
       substring(file_data, 1, 4) as file_header
FROM documents 
LIMIT 1;
```
- `stored_bytes` should match `file_size`
- `file_header` should show hex bytes starting with `25504446` (which is %PDF in hex)

#### 3. **API Response Check**
Test the view API endpoint:
```bash
# Check if the API returns valid PDF data
curl -v "http://localhost:3000/api/documents/[DOC_ID]/view?buyer=[WALLET_ADDRESS]" > test.pdf

# Verify it's a valid PDF
file test.pdf  # Should show "PDF document"
```

#### 4. **Browser Compatibility**
Some browsers don't support inline PDF viewing in iframes:
- ✅ Chrome/Edge: Full support
- ⚠️ Firefox: May require PDF.js
- ⚠️ Safari: Limited iframe PDF support
- 💡 The app now includes a fallback download option for unsupported browsers

#### 5. **Common Issues & Fixes**

**Issue: "Received empty file data"**
- Cause: Document uploaded but file_data is NULL or empty
- Fix: Re-upload the document

**Issue: "Invalid PDF file format"**
- Cause: File data corrupted during storage/retrieval
- Fix: Check the hex string conversion in `backend/supabase/documents.ts`
- Verify: `\\x` prefix is correct for BYTEA hex format

**Issue: "Failed to display PDF"**
- Cause: Browser security restrictions
- Fix: Use the download button instead

#### 6. **Enable Debug Mode**
Check the following files for detailed console logs:
- `app/view/[id]/page.tsx` - Frontend PDF loading
- `pages/api/documents/[id]/view.ts` - API endpoint
- `backend/supabase/document-files.ts` - Database retrieval

#### 7. **Test Upload & Retrieval**
```bash
# 1. Upload a simple test PDF
# 2. Check the console logs during upload
# 3. Navigate to the viewer page
# 4. Check the console logs during viewing
# 5. Compare file sizes: upload vs download
```

### Still Having Issues?

1. Check that your Supabase database migrations ran successfully
2. Verify Row Level Security policies allow document access
3. Ensure your BSV wallet is properly connected
4. Try clearing browser cache and reloading

---

## 📄 License

MIT License - Feel free to use this project for your own purposes.

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - PostgreSQL database
- [BSV SDK](https://github.com/bitcoin-sv/ts-sdk) - Bitcoin SV integration
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

## 📞 Support

- 📖 Check code comments for implementation details
- 🐛 Open GitHub issues for bugs
- 💡 Feature requests welcome
- 📧 Contact via GitHub

---

**Built with ❤️ using Next.js, Bitcoin SV, and Supabase**

🚀 **[Live Demo](https://ppd-three.vercel.app)** | 💻 **[GitHub](https://github.com/your-repo)**

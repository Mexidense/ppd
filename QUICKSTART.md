# 🚀 Quick Start Guide

Get your PPD (Pay-Per-Document) application up and running in minutes!

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. In Supabase dashboard, go to **SQL Editor**
3. Run the migrations:
   - Copy and run `backend/supabase/migrations/001_create_documents_table.sql`
   - Copy and run `backend/supabase/migrations/002_create_purchases_table.sql`

### Step 3: Configure Environment Variables

Create `.env` in the project root:

```env
# Supabase (get from: https://app.supabase.com/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# BSV Wallet
PRIVATE_KEY=your_wallet_private_key_hex
NETWORK=main
STORAGE_URL=https://storage.babbage.systems
```

### Step 4: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🧪 Test Your Setup

### Option 1: Use the Test Script

```bash
cd backend
./test-api.sh
```

This will test all API endpoints automatically.

### Option 2: Manual Testing with cURL

**1. Upload a document:**
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@/path/to/file.pdf" \
  -F "cost=9.99"
```

**2. List documents:**
```bash
curl http://localhost:3000/api/documents
```

**3. Create a purchase:**
```bash
curl -X POST http://localhost:3000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "address_owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "doc_id": "YOUR_DOCUMENT_ID",
    "transaction_id": "0xabc123"
  }'
```

---

## 📂 What You Just Set Up

✅ **Database**: Supabase PostgreSQL (with file storage in BYTEA columns)  
✅ **API**: REST endpoints for documents, purchases, and viewing  
✅ **Backend**: Helper functions for database and BSV operations  
✅ **BSV Integration**: Blockchain payments and authentication  

---

## 🎯 Next Steps

### 1. Explore the API
- Read [API Documentation](./backend/API.md)
- Test endpoints with Postman or Insomnia

### 2. Build the Frontend
- Create upload forms in `app/page.tsx`
- Display document lists
- Implement purchase flows

### 3. Add Authentication
- Implement wallet connection (e.g., MetaMask)
- Add authentication middleware
- Secure API endpoints

### 4. Enhance Features
- Add file type validation
- Implement file size limits
- Add thumbnail generation
- Create admin dashboard

---

## 🐛 Troubleshooting

### Database Issues

**Can't connect to Supabase:**
- Verify your `.env` file exists
- Check credentials in Supabase dashboard
- Ensure tables are created (run migrations)

**Foreign key errors:**
- Make sure you ran migrations in order
- Document must exist before creating a purchase

### API Issues

**500 Internal Server Error:**
- Verify environment variables are loaded
- Check console logs: `npm run dev`
- Ensure Supabase connection is working

**File upload fails:**
- Check file size limits (default: 10MB in Next.js body parser)
- Verify the `file_data` column exists in your documents table
- Check that you've run all migrations

---

## 📚 Documentation

- [Backend Setup](./backend/README.md) - Detailed Supabase setup
- [API Docs](./backend/API.md) - All endpoints with examples
- [Environment Setup](./backend/SETUP.md) - Configuration guide
- [BSV SDK Guide](./frontend/BSV_SDK.md) - Wallet and blockchain integration

---

## 💡 Tips

1. **Use Supabase Dashboard** to:
   - View table data and uploaded files
   - Run SQL queries
   - Monitor API usage
   - Check storage usage

2. **Generate a BSV wallet** for the backend:
   ```bash
   npm run setup:wallet
   ```

3. **Check the logs** when something goes wrong:
   ```bash
   # Next.js logs
   # Check terminal where npm run dev is running
   ```

---

## 🎉 You're All Set!

Your PPD application is now running with:
- ✅ Database with file storage (Supabase)
- ✅ BSV blockchain integration
- ✅ REST API (Next.js)
- ✅ Document upload and viewing

Start testing the app or explore the codebase! 🚀


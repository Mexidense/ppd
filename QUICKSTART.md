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

Create `.env.local` in the project root:

```env
# Supabase (get from: https://app.supabase.com/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# MinIO (use defaults for local development)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=documents
```

### Step 4: Start Docker (MinIO)

```bash
docker-compose up -d
```

Verify it's running:
- MinIO Console: [http://localhost:9001](http://localhost:9001)
- Login: `minioadmin` / `minioadmin123`

### Step 5: Start Development Server

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

✅ **Database**: Supabase PostgreSQL with two tables  
✅ **Storage**: MinIO (S3-compatible) running in Docker  
✅ **API**: 7 REST endpoints for documents and purchases  
✅ **Backend**: Helper functions for database operations  

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

### Docker Issues

**MinIO won't start:**
```bash
docker-compose logs minio
```

**Port already in use:**
```bash
# Check what's using port 9000
lsof -i :9000

# Or change the port in docker-compose.yml
```

### Database Issues

**Can't connect to Supabase:**
- Verify your `.env.local` file exists
- Check credentials in Supabase dashboard
- Ensure tables are created

**Foreign key errors:**
- Make sure you ran migrations in order
- Document must exist before creating a purchase

### API Issues

**500 Internal Server Error:**
- Check if MinIO is running: `docker-compose ps`
- Verify environment variables are loaded
- Check console logs: `npm run dev`

**File upload fails:**
- Ensure MinIO is running
- Check bucket exists (login to http://localhost:9001)
- Verify file size (default limit: 4.5MB in Next.js)

---

## 📚 Documentation

- [Backend Setup](./backend/README.md) - Detailed Supabase setup
- [API Docs](./backend/API.md) - All endpoints with examples
- [Docker Guide](./backend/DOCKER.md) - MinIO configuration
- [Environment Setup](./backend/SETUP.md) - Configuration guide

---

## 💡 Tips

1. **Use the MinIO Console** ([http://localhost:9001](http://localhost:9001)) to:
   - Browse uploaded files
   - Manually upload/download files
   - View storage usage

2. **Use Supabase Dashboard** to:
   - View table data
   - Run SQL queries
   - Monitor API usage

3. **Check the logs** when something goes wrong:
   ```bash
   # Docker logs
   docker-compose logs -f
   
   # Next.js logs
   # Check terminal where npm run dev is running
   ```

---

## 🎉 You're All Set!

Your PPD application is now running with:
- ✅ Database (Supabase)
- ✅ File Storage (MinIO)
- ✅ REST API (Next.js)

Start building your frontend or test the API endpoints! 🚀


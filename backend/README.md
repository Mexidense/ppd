# Backend - Supabase Setup

This directory contains the backend configuration and database migrations for the PPD (Pay-Per-Document) project using Supabase.

## 📁 Directory Structure

```
backend/
├── supabase/
│   ├── config.ts          # Supabase client configuration
│   └── migrations/
│       ├── 001_create_documents_table.sql
│       └── 002_create_purchases_table.sql
└── README.md
```

## 🗄️ Database Schema

### Documents Table
Stores document metadata including path, hash, cost, and owner.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `path` | VARCHAR(500) | File path or location of the document |
| `hash` | VARCHAR(255) | Unique hash of the document for verification |
| `cost` | FLOAT | Cost associated with the document (must be >= 0) |
| `address_owner` | VARCHAR(255) | Blockchain address of the document owner/uploader (optional) |
| `created_at` | TIMESTAMP | Auto-generated timestamp |
| `updated_at` | TIMESTAMP | Auto-updated timestamp |

**Indexes:**
- `idx_documents_hash` - Fast lookups by hash
- `idx_documents_path` - Fast searches by path
- `idx_documents_address_owner` - Fast lookups by owner

### Purchases Table
Stores purchase records linking buyers to documents via blockchain transactions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `address_buyer` | VARCHAR(255) | Blockchain address of the buyer/purchaser |
| `doc_id` | UUID | Foreign key to documents table |
| `transaction_id` | VARCHAR(255) | Unique blockchain transaction identifier |
| `created_at` | TIMESTAMP | Auto-generated timestamp |

**Indexes:**
- `idx_purchases_address_buyer` - Fast lookups by buyer address
- `idx_purchases_doc_id` - Fast lookups by document
- `idx_purchases_transaction_id` - Fast lookups by transaction
- `idx_purchases_created_at` - Sorted by creation date
- `idx_purchases_buyer_doc` - Composite index for buyer+document queries

**Relationships:**
- `doc_id` references `documents(id)` with CASCADE delete

## 🚀 Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new account or sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: ppd (or your preferred name)
   - Database Password: (choose a strong password)
   - Region: (select closest to your users)
4. Wait for the project to be created (~2 minutes)

### 2. Get Your Supabase Credentials

1. Go to your project's settings: `Settings > API`
2. Copy the following values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

### 3. Configure Environment Variables

1. Create a `.env.local` file in the root of your project:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
   ```

### 4. Run Database Migrations

There are two ways to run the migrations:

#### Option A: Using Supabase SQL Editor (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `backend/supabase/migrations/001_create_documents_table.sql`
5. Paste into the SQL Editor and click "Run"
6. Repeat steps 3-5 for `002_create_purchases_table.sql`

#### Option B: Using Supabase CLI (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

### 5. Verify Setup

1. Go to "Table Editor" in your Supabase dashboard
2. You should see two tables:
   - `documents`
   - `purchases`
3. Click on each table to verify the columns match the schema above

## 📝 Usage Examples

### Import the Supabase Client

```typescript
import { supabase } from '@/backend/supabase/config';
```

### Insert a Document

```typescript
const { data, error } = await supabase
  .from('documents')
  .insert({
    path: '/documents/contract.pdf',
    hash: 'abc123def456...',
    cost: 9.99
  })
  .select()
  .single();

if (error) {
  console.error('Error inserting document:', error);
} else {
  console.log('Document created:', data);
}
```

### Query Documents

```typescript
// Get all documents
const { data, error } = await supabase
  .from('documents')
  .select('*');

// Get document by hash
const { data, error } = await supabase
  .from('documents')
  .select('*')
  .eq('hash', 'abc123def456...')
  .single();
```

### Record a Purchase

```typescript
const { data, error } = await supabase
  .from('purchases')
  .insert({
    address_buyer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    doc_id: 'uuid-of-document',
    transaction_id: '0xabcdef123456...'
  })
  .select()
  .single();
```

### Query Purchases

```typescript
// Get all purchases by a buyer
const { data, error } = await supabase
  .from('purchases')
  .select(`
    *,
    documents (*)
  `)
  .eq('address_buyer', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');

// Get all purchases for a document
const { data, error } = await supabase
  .from('purchases')
  .select('*')
  .eq('doc_id', 'uuid-of-document');
```

## 🔒 Security Considerations

1. **Row Level Security (RLS)**: Consider enabling RLS in Supabase for additional security
2. **API Keys**: Never commit your `.env.local` file to version control
3. **Service Role Key**: Use the anon key in client-side code, save the service role key for server-side operations only

## 🛠️ Development Tips

- Use the Supabase Table Editor to manually test data insertion
- Check the "Database > Logs" section for query performance
- Use the API documentation auto-generated by Supabase
- Consider using TypeScript types generated from your schema:
  ```bash
  supabase gen types typescript --project-id your-project-ref > types/supabase.ts
  ```

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)


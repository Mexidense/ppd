# Document Upload Feature

This document describes the newly implemented document upload feature for the Pay Per Document (PPD) application.

## Overview

Users can now upload PDF documents to the platform, set a price in satoshis, and publish them for sale. The documents are stored in MinIO (S3-compatible storage) and metadata is stored in Supabase.

## Components Created/Updated

### 1. Backend API Endpoint (`/pages/api/documents/index.ts`)

**Added POST method** to handle document uploads:

- Accepts multipart/form-data with file upload
- Validates PDF file type (only PDFs allowed)
- Maximum file size: 50MB
- Uploads file to MinIO storage
- Creates document record in Supabase database
- Returns document details with file information

**Request Format:**
```
POST /api/documents
Content-Type: multipart/form-data

Fields:
- file: PDF file (required)
- title: Document title (required)
- cost: Price in satoshis (required)
- address_owner: Owner's wallet address/identity key (required)
- description: Document description (optional)
- tags: Comma-separated tags (optional)
```

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "id": "uuid",
    "title": "Document Title",
    "path": "uploads/filename.pdf",
    "hash": "sha256-hash",
    "cost": 1000,
    "address_owner": "wallet-address",
    "created_at": "timestamp",
    "fileSize": 12345,
    "fileName": "unique-filename.pdf"
  }
}
```

### 2. Upload Component (`/components/upload-document.tsx`)

A React component that provides a user-friendly form for uploading documents:

**Features:**
- File upload with drag-and-drop support
- PDF validation (type and size)
- Form validation for required fields
- Real-time file size display
- BSV conversion display for cost
- Owner address display from wallet
- Success/error message handling
- Automatic redirect after successful upload

**Fields:**
- **PDF File** (required) - Max 50MB
- **Title** (required) - Document title
- **Cost** (required) - Price in satoshis
- **Description** (optional) - Document description
- **Owner Address** (auto-filled from wallet)

### 3. Upload Page (`/app/upload/page.tsx`)

A dedicated page at `/upload` route that displays the upload component.

### 4. Updated Published Page (`/app/published/page.tsx`)

**Improvements:**
- Now uses actual wallet address from `useWallet()` hook
- Shows only documents owned by the connected wallet
- "Upload Document" button navigates to `/upload` page
- Shows message when wallet is not connected
- Auto-refreshes when wallet connection changes

### 5. Updated Header (`/components/header.tsx`)

**New Navigation:**
- **Library** - Browse all documents (home page)
- **Published** - View your published documents
- **Upload** - Upload new documents

Active route is highlighted with default button style.

## Database Schema

Documents are stored with the following fields:

```sql
documents (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  path TEXT NOT NULL,          -- MinIO object path
  hash TEXT NOT NULL,           -- SHA-256 hash of file
  cost INTEGER NOT NULL,        -- Price in satoshis
  address_owner TEXT,           -- Owner's wallet address/identity key
  description TEXT,             -- Optional description
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Storage

Files are stored in MinIO with:
- Unique UUID-based filenames
- Original filename stored in metadata
- SHA-256 hash for integrity verification
- Content-Type set to `application/pdf`

## Dependencies

Added package:
- `formidable` - For handling multipart/form-data file uploads
- `@types/formidable` - TypeScript definitions

## Security Considerations

1. **File Type Validation** - Only PDF files are allowed
2. **File Size Limit** - 50MB maximum to prevent abuse
3. **Owner Verification** - Owner address is set from connected wallet
4. **Hash Verification** - SHA-256 hash stored for file integrity
5. **Unique Filenames** - UUIDs prevent filename collisions

## Usage Flow

1. User connects wallet
2. User navigates to `/upload` or clicks "Upload Document" button
3. User selects PDF file and fills in details:
   - Title
   - Cost (in satoshis)
   - Optional description
4. Form validates input
5. File is uploaded to MinIO
6. Document record is created in Supabase
7. User is redirected to home page
8. Document appears in the library for purchase

## Next Steps / Future Enhancements

- [ ] Add tag support during upload
- [ ] Image/thumbnail generation for documents
- [ ] Bulk upload support
- [ ] Edit document details after upload
- [ ] Delete/unpublish documents
- [ ] Document preview before upload
- [ ] Progress indicator for large files
- [ ] Draft/publish workflow
- [ ] Categories in addition to tags
- [ ] Document analytics (views, purchases)


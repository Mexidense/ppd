# API Documentation

This document describes the available API endpoints for the PPD (Pay-Per-Document) application.

## Base URL

```
http://localhost:3000/api
```

---

## 📄 Documents Endpoints

### 1. List All Documents

Get a list of all documents in the system.

**Endpoint:** `GET /api/documents`

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "path": "uploads/file.pdf",
      "hash": "sha256-hash",
      "cost": 9.99,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/documents
```

---

### 2. Get Document by ID

Retrieve a specific document by its ID.

**Endpoint:** `GET /api/documents/[id]`

**Parameters:**
- `id` (path parameter): Document UUID

**Response:**
```json
{
  "document": {
    "id": "uuid",
    "path": "uploads/file.pdf",
    "hash": "sha256-hash",
    "cost": 9.99,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/documents/YOUR_DOCUMENT_ID
```

---

### 3. Upload Document

Upload a file and create a document record.

**Endpoint:** `POST /api/documents/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `title` (required): Title of the document
- `file` (required): File to upload
- `cost` (required): Cost of the document (number, >= 0)
- `address_owner` (optional): Blockchain address of the document owner

**Response:**
```json
{
  "document": {
    "id": "uuid",
    "title": "My Document",
    "path": "uploads/abc123.pdf",
    "hash": "sha256-hash",
    "cost": 9.99,
    "address_owner": "0x...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "upload": {
    "fileName": "abc123.pdf",
    "size": 1024000,
    "hash": "sha256-hash"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "title=My Important Document" \
  -F "file=@/path/to/your/document.pdf" \
  -F "cost=9.99" \
  -F "address_owner=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('title', 'My Document');
formData.append('file', fileInput.files[0]);
formData.append('cost', '9.99');
formData.append('address_owner', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');

const response = await fetch('http://localhost:3000/api/documents/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result);
```

---

### 4. Delete Document

Delete a document and its associated file from storage.

**Endpoint:** `DELETE /api/documents/[id]`

**Parameters:**
- `id` (path parameter): Document UUID

**Response:**
```json
{
  "message": "Document deleted successfully",
  "documentId": "uuid"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/documents/YOUR_DOCUMENT_ID
```

---

## 💰 Purchases Endpoints

### 1. Create Purchase

Record a new purchase transaction.

**Endpoint:** `POST /api/purchases`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "address_buyer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "doc_id": "document-uuid",
  "transaction_id": "0xabc123def456..."
}
```

**Response:**
```json
{
  "purchase": {
    "id": "uuid",
    "address_buyer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "doc_id": "document-uuid",
    "transaction_id": "0xabc123def456...",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "document": {
    "id": "document-uuid",
    "cost": 9.99,
    "path": "uploads/file.pdf"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "address_buyer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "doc_id": "YOUR_DOCUMENT_ID",
    "transaction_id": "0xabc123def456"
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3000/api/purchases', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    address_buyer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    doc_id: 'document-uuid',
    transaction_id: '0xabc123def456...',
  }),
});

const result = await response.json();
console.log(result);
```

---

### 2. List All Purchases

Get all purchases (admin endpoint).

**Endpoint:** `GET /api/purchases`

**Response:**
```json
{
  "purchases": [
    {
      "id": "uuid",
      "address_buyer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "doc_id": "document-uuid",
      "transaction_id": "0xabc123def456...",
      "created_at": "2024-01-01T00:00:00Z",
      "documents": {
        "id": "document-uuid",
        "path": "uploads/file.pdf",
        "hash": "sha256-hash",
        "cost": 9.99
      }
    }
  ],
  "count": 1
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/purchases
```

---

### 3. Get Purchases by Buyer

Get all purchases for a specific wallet address.

**Endpoint:** `GET /api/purchases/buyer/[address]`

**Parameters:**
- `address` (path parameter): Buyer wallet address

**Response:**
```json
{
  "purchases": [
    {
      "id": "uuid",
      "address_buyer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "doc_id": "document-uuid",
      "transaction_id": "0xabc123def456...",
      "created_at": "2024-01-01T00:00:00Z",
      "documents": {
        "id": "document-uuid",
        "path": "uploads/file.pdf",
        "hash": "sha256-hash",
        "cost": 9.99
      }
    }
  ],
  "count": 1,
  "buyer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/purchases/buyer/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

---

## 📊 Statistics Endpoints

### 1. Get Total Statistics

Get aggregated statistics with total purchases count and total revenue.

**Endpoint:** `GET /api/stats/total`

**Query Parameters:**
- `start_date` (optional): Start date for filtering (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
- `end_date` (optional): End date for filtering (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)

**Response:**
```json
{
  "stats": {
    "total_purchases": 15,
    "total_revenue": 149.85,
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  }
}
```

**cURL Examples:**
```bash
# Get all-time stats
curl http://localhost:3000/api/stats/total

# Get stats for specific date range
curl "http://localhost:3000/api/stats/total?start_date=2024-01-01&end_date=2024-01-31"

# Get stats from a specific date onwards
curl "http://localhost:3000/api/stats/total?start_date=2024-01-01"
```

**JavaScript Example:**
```javascript
// Get stats for January 2024
const startDate = '2024-01-01';
const endDate = '2024-01-31';

const response = await fetch(
  `http://localhost:3000/api/stats/total?start_date=${startDate}&end_date=${endDate}`
);

const result = await response.json();
console.log(result.stats);
```

---

### 2. Get Daily Statistics

Get aggregated statistics grouped by day (purchases count and revenue per day).

**Endpoint:** `GET /api/stats/daily`

**Query Parameters:**
- `start_date` (optional): Start date for filtering (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
- `end_date` (optional): End date for filtering (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)

**Response:**
```json
{
  "stats": [
    {
      "date": "2024-01-15",
      "purchases_count": 5,
      "revenue": 49.95
    },
    {
      "date": "2024-01-16",
      "purchases_count": 3,
      "revenue": 29.97
    },
    {
      "date": "2024-01-17",
      "purchases_count": 7,
      "revenue": 69.93
    }
  ],
  "count": 3
}
```

**cURL Examples:**
```bash
# Get all-time daily stats
curl http://localhost:3000/api/stats/daily

# Get daily stats for specific date range
curl "http://localhost:3000/api/stats/daily?start_date=2024-01-01&end_date=2024-01-31"

# Get last 7 days
curl "http://localhost:3000/api/stats/daily?start_date=2024-01-10"
```

**JavaScript Example:**
```javascript
// Get daily stats for the last 30 days
const endDate = new Date().toISOString().split('T')[0];
const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];

const response = await fetch(
  `http://localhost:3000/api/stats/daily?start_date=${startDate}&end_date=${endDate}`
);

const result = await response.json();
console.log(result.stats);

// Use for charts
result.stats.forEach(day => {
  console.log(`${day.date}: ${day.purchases_count} purchases, $${day.revenue}`);
});
```

---

### 3. Get Document Statistics

Get statistics for a specific document (purchases count and revenue).

**Endpoint:** `GET /api/stats/documents/[id]`

**Parameters:**
- `id` (path parameter): Document UUID

**Query Parameters:**
- `start_date` (optional): Start date for filtering
- `end_date` (optional): End date for filtering

**Response:**
```json
{
  "document_id": "uuid",
  "stats": {
    "purchases_count": 8,
    "total_revenue": 79.92
  }
}
```

**cURL Example:**
```bash
# Get stats for a specific document
curl http://localhost:3000/api/stats/documents/YOUR_DOCUMENT_ID

# Get stats with date range
curl "http://localhost:3000/api/stats/documents/YOUR_DOCUMENT_ID?start_date=2024-01-01&end_date=2024-01-31"
```

---

## ⚠️ Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created (successful creation)
- `400` - Bad Request (invalid input)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## 🧪 Testing the API

### Using cURL

1. **Start MinIO:**
   ```bash
   docker-compose up -d
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Upload a document:**
   ```bash
   curl -X POST http://localhost:3000/api/documents/upload \
     -F "file=@test.pdf" \
     -F "cost=9.99"
   ```

4. **List documents:**
   ```bash
   curl http://localhost:3000/api/documents
   ```

5. **Create a purchase:**
   ```bash
   curl -X POST http://localhost:3000/api/purchases \
     -H "Content-Type: application/json" \
     -d '{
       "address_buyer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
       "doc_id": "YOUR_DOCUMENT_ID",
       "transaction_id": "0xabc123"
     }'
   ```

### Using Postman or Insomnia

1. Import the endpoints using the documentation above
2. Set base URL to `http://localhost:3000/api`
3. For file uploads, use the "form-data" body type
4. For purchases, use "JSON" body type

---

## 🔐 Security Notes

- The current API has no authentication for simplicity
- For production, implement authentication middleware
- Validate wallet signatures for purchase creation
- Add rate limiting to prevent abuse
- Implement file size limits for uploads
- Validate file types before upload

---

## 📚 Additional Resources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [MinIO JavaScript SDK](https://min.io/docs/minio/linux/developers/javascript/API.html)


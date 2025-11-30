# Creator Stats API

## Endpoint

`GET /api/stats/creator/[address]`

Get comprehensive statistics for a creator's documents and purchases.

## Parameters

- **address** (path parameter, required): The blockchain address of the creator
- **days** (query parameter, optional): Number of days for daily stats (default: 7)

## Response Format

```json
{
  "stats": {
    "totalDocuments": 5,
    "totalPurchases": 23,
    "totalRevenue": 115000,
    "averagePrice": 5000,
    "dailyStats": [
      {
        "date": "2024-01-01",
        "purchases": 3,
        "revenue": 15000
      },
      ...
    ]
  }
}
```

## Response Fields

- **totalDocuments**: Total number of documents published by the creator
- **totalPurchases**: Total number of purchases across all creator's documents
- **totalRevenue**: Total revenue in satoshis from all purchases
- **averagePrice**: Average price per document (total of all document prices / number of documents)
- **dailyStats**: Array of daily statistics for the requested period
  - **date**: Date in YYYY-MM-DD format
  - **purchases**: Number of purchases on that day
  - **revenue**: Revenue in satoshis on that day

## Example Request

```bash
GET /api/stats/creator/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?days=30
```

## Error Responses

- **400 Bad Request**: Missing or invalid creator address
- **405 Method Not Allowed**: Only GET method is supported
- **500 Internal Server Error**: Database or server error

## Implementation Details

The endpoint:
1. Fetches all documents owned by the creator
2. Retrieves all purchases for those documents
3. Calculates aggregate statistics (total purchases, revenue, average price)
4. Groups purchases by day for the requested time period
5. Returns zero-filled daily stats for days with no purchases

## Usage in Frontend

```typescript
const response = await fetch(`/api/stats/creator/${walletAddress}?days=7`);
const { stats } = await response.json();

// stats.totalDocuments - number of documents
// stats.totalPurchases - total purchases
// stats.totalRevenue - revenue in sats
// stats.averagePrice - average document price
// stats.dailyStats - array for charts
```


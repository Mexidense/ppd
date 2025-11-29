# Statistics API

This document provides detailed information about the statistics endpoints and their usage.

## Overview

The statistics API provides aggregated data about purchases and revenue. All endpoints support optional date range filtering using query parameters.

## Endpoints

### 1. Total Statistics

**Endpoint:** `GET /api/stats/total`

Returns aggregated statistics across all purchases.

**Query Parameters:**
- `start_date` (optional): ISO format date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
- `end_date` (optional): ISO format date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)

**Response Fields:**
- `total_purchases`: Total number of purchases
- `total_revenue`: Sum of all purchase values
- `start_date`: Echo of the filter parameter (if provided)
- `end_date`: Echo of the filter parameter (if provided)

**Example Response:**
```json
{
  "stats": {
    "total_purchases": 42,
    "total_revenue": 419.58,
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  }
}
```

### 2. Daily Statistics

**Endpoint:** `GET /api/stats/daily`

Returns statistics grouped by day.

**Query Parameters:**
- `start_date` (optional): ISO format date
- `end_date` (optional): ISO format date

**Response Fields:**
- `stats`: Array of daily statistics
  - `date`: Date in YYYY-MM-DD format
  - `purchases_count`: Number of purchases on that day
  - `revenue`: Total revenue for that day
- `count`: Number of days returned

**Example Response:**
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
      "purchases_count": 8,
      "revenue": 79.92
    }
  ],
  "count": 2
}
```

### 3. Document Statistics

**Endpoint:** `GET /api/stats/documents/[id]`

Returns statistics for a specific document.

**Path Parameters:**
- `id`: Document UUID

**Query Parameters:**
- `start_date` (optional): ISO format date
- `end_date` (optional): ISO format date

**Response Fields:**
- `document_id`: ID of the document
- `stats`:
  - `purchases_count`: Number of times the document was purchased
  - `total_revenue`: Total revenue from this document

**Example Response:**
```json
{
  "document_id": "123e4567-e89b-12d3-a456-426614174000",
  "stats": {
    "purchases_count": 12,
    "total_revenue": 119.88
  }
}
```

## Date Range Filtering

All statistics endpoints support date range filtering through query parameters.

### Date Format

Dates should be in ISO 8601 format:
- Date only: `YYYY-MM-DD` (e.g., `2024-01-15`)
- Date and time: `YYYY-MM-DDTHH:mm:ss` (e.g., `2024-01-15T14:30:00`)
- With timezone: `YYYY-MM-DDTHH:mm:ssZ` (e.g., `2024-01-15T14:30:00Z`)

### Examples

**All-time statistics:**
```bash
curl http://localhost:3000/api/stats/total
```

**Specific date range:**
```bash
curl "http://localhost:3000/api/stats/total?start_date=2024-01-01&end_date=2024-01-31"
```

**From a specific date onwards:**
```bash
curl "http://localhost:3000/api/stats/total?start_date=2024-01-01"
```

**Up to a specific date:**
```bash
curl "http://localhost:3000/api/stats/total?end_date=2024-01-31"
```

## Use Cases

### 1. Dashboard KPIs

Get overall statistics for display in a dashboard:

```javascript
const response = await fetch('/api/stats/total');
const { stats } = await response.json();

// Display on dashboard
console.log(`Total Purchases: ${stats.total_purchases}`);
console.log(`Total Revenue: $${stats.total_revenue}`);
```

### 2. Monthly Revenue Chart

Get daily statistics for charting:

```javascript
const startDate = '2024-01-01';
const endDate = '2024-01-31';

const response = await fetch(
  `/api/stats/daily?start_date=${startDate}&end_date=${endDate}`
);
const { stats } = await response.json();

// Use with Chart.js, Recharts, etc.
const chartData = stats.map(day => ({
  date: day.date,
  revenue: day.revenue,
  purchases: day.purchases_count
}));
```

### 3. Document Performance

Track which documents are selling well:

```javascript
const documentId = 'your-document-id';

const response = await fetch(`/api/stats/documents/${documentId}`);
const { stats } = await response.json();

console.log(`Purchases: ${stats.purchases_count}`);
console.log(`Revenue: $${stats.total_revenue}`);
console.log(`Avg per purchase: $${stats.total_revenue / stats.purchases_count}`);
```

### 4. Last 7 Days Trend

```javascript
const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);

const response = await fetch(
  `/api/stats/daily?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
);

const { stats } = await response.json();
console.log('Last 7 days:', stats);
```

### 5. Compare Periods

Compare this month vs last month:

```javascript
async function getMonthStats(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = new Date(year, month, 0).toISOString().split('T')[0];
  
  const response = await fetch(
    `/api/stats/total?start_date=${start}&end_date=${end}`
  );
  return await response.json();
}

const thisMonth = await getMonthStats(2024, 1);
const lastMonth = await getMonthStats(2023, 12);

console.log('Growth:', 
  ((thisMonth.stats.total_revenue - lastMonth.stats.total_revenue) / 
   lastMonth.stats.total_revenue * 100).toFixed(2) + '%'
);
```

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Error message",
  "details": "Detailed information"
}
```

**Common Errors:**

- `400 Bad Request`: Invalid date format or start_date > end_date
- `404 Not Found`: Document doesn't exist (document stats endpoint)
- `500 Internal Server Error`: Database or server error

## Performance Considerations

1. **Large Date Ranges**: Querying large date ranges may take longer. Consider:
   - Caching results for frequently accessed ranges
   - Paginating daily stats if needed
   - Using server-side aggregation

2. **High Volume**: For high-traffic applications:
   - Implement caching (Redis, etc.)
   - Create database views for common queries
   - Consider pre-computing daily aggregates

3. **Real-time Updates**: Stats are calculated on-demand:
   - Results reflect the current state of the database
   - No caching is implemented by default
   - Consider implementing cache invalidation strategies

## Database Queries

The statistics endpoints use the following approach:

1. **Total Stats**: Fetches all purchases with joined documents, calculates sum in application
2. **Daily Stats**: Fetches all purchases, groups by date in application
3. **Document Stats**: Uses count query + single document lookup

For better performance at scale, consider:
- Creating materialized views
- Implementing database-level aggregations
- Using PostgreSQL's window functions
- Adding appropriate indexes

## Future Enhancements

Potential improvements to the statistics API:

- [ ] Add grouping by week, month, year
- [ ] Add buyer/owner statistics
- [ ] Add document category breakdown
- [ ] Add moving averages
- [ ] Add growth rate calculations
- [ ] Add export to CSV/Excel
- [ ] Add real-time WebSocket updates
- [ ] Add caching layer
- [ ] Add pagination for daily stats


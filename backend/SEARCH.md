# Document Search

The PPD application provides a powerful search capability for finding documents by title and/or tags.

## Endpoint

**`GET /api/documents`**

Search documents using title and/or tag filters via query parameters.

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | No* | Search term for document title (partial match, case-insensitive) |
| `tags` | string | No* | Comma-separated list of tag names |

*At least one parameter must be provided.

## Response Format

```json
{
  "documents": [
    {
      "id": "uuid",
      "title": "Document Title",
      "path": "uploads/file.pdf",
      "hash": "sha256-hash",
      "cost": 9.99,
      "address_owner": "0x...",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "tags": [
        { "id": "tag-uuid", "name": "tag-name" }
      ]
    }
  ],
  "count": 1,
  "filters": {
    "title": "search term",
    "tags": ["tag1", "tag2"]
  }
}
```

## Search Behavior

### Title Search
- **Partial match**: Matches documents containing the search term anywhere in the title
- **Case-insensitive**: "React" matches "react", "REACT", "React Tutorial"
- **Substring**: "tut" matches "Tutorial", "ututorial", "tutorial guide"

### Tag Search
- **OR logic**: Returns documents that have **at least one** of the specified tags
- **Exact match**: Tag names must match exactly (case-sensitive)
- **Multiple tags**: `tags=javascript,react,typescript` finds documents with ANY of these tags

### Combined Search
When both title and tags are provided:
- Documents must match the title filter **AND** have at least one of the tags
- Results are sorted by creation date (newest first)

## Usage Examples

### 1. Search by Title Only

```bash
# Find all documents with "react" in the title
curl "http://localhost:3000/api/documents?title=react"

# Find documents with "getting started"
curl "http://localhost:3000/api/documents?title=getting%20started"
```

```javascript
const response = await fetch('/api/documents?title=react');
const { documents, count } = await response.json();
console.log(`Found ${count} documents about React`);
```

### 2. Search by Tags Only

```bash
# Find all tutorial documents
curl "http://localhost:3000/api/documents?tags=tutorial"

# Find documents tagged with either "javascript" or "typescript"
curl "http://localhost:3000/api/documents?tags=javascript,typescript"

# Multiple tags
curl "http://localhost:3000/api/documents?tags=tutorial,beginner,react"
```

```javascript
// Find all beginner tutorials
const response = await fetch('/api/documents?tags=beginner,tutorial');
const { documents } = await response.json();

documents.forEach(doc => {
  console.log(`${doc.title} - $${doc.cost}`);
  console.log(`Tags: ${doc.tags.map(t => t.name).join(', ')}`);
});
```

### 3. Combined Search (Title + Tags)

```bash
# Find React documents that are tutorials or for beginners
curl "http://localhost:3000/api/documents?title=react&tags=tutorial,beginner"
```

```javascript
// Advanced search: React tutorials for beginners
const title = 'react';
const tags = ['tutorial', 'beginner'];

const response = await fetch(
  `/api/documents?title=${encodeURIComponent(title)}&tags=${tags.join(',')}`
);

const { documents, count, filters } = await response.json();
console.log(`Found ${count} documents matching:`, filters);
```

### 4. Building a Search UI

```typescript
async function searchDocuments(title: string, selectedTags: string[]) {
  const params = new URLSearchParams();
  
  if (title) {
    params.append('title', title);
  }
  
  if (selectedTags.length > 0) {
    params.append('tags', selectedTags.join(','));
  }
  
  if (params.toString() === '') {
    return { documents: [], count: 0 };
  }
  
  const response = await fetch(`/api/documents?${params}`);
  return await response.json();
}

// Usage in React component
const [searchTitle, setSearchTitle] = useState('');
const [selectedTags, setSelectedTags] = useState<string[]>([]);
const [results, setResults] = useState([]);

const handleSearch = async () => {
  const data = await searchDocuments(searchTitle, selectedTags);
  setResults(data.documents);
};
```

### 5. Tag-Based Filtering

```javascript
// Get all documents with specific tags
async function getDocumentsByTags(tags: string[]) {
  const response = await fetch(
    `/api/documents?tags=${tags.join(',')}`
  );
  return await response.json();
}

// Find all JavaScript-related documents
const jsDocuments = await getDocumentsByTags(['javascript', 'js', 'node']);

// Find all tutorial content
const tutorials = await getDocumentsByTags(['tutorial', 'guide', 'howto']);
```

### 6. Autocomplete Search

```javascript
// Real-time search as user types
let searchTimeout;

function handleSearchInput(value: string) {
  clearTimeout(searchTimeout);
  
  if (value.length < 2) {
    return; // Wait for at least 2 characters
  }
  
  searchTimeout = setTimeout(async () => {
    const response = await fetch(
      `/api/documents?title=${encodeURIComponent(value)}`
    );
    const { documents } = await response.json();
    
    // Update autocomplete suggestions
    displaySuggestions(documents);
  }, 300); // Debounce 300ms
}
```

## Advanced Use Cases

### Faceted Search

```typescript
// Get documents and available tags for filtering
async function facetedSearch(title: string, selectedTags: string[]) {
  // Get search results
  const results = await searchDocuments(title, selectedTags);
  
  // Collect all unique tags from results
  const allTags = new Set<string>();
  results.documents.forEach(doc => {
    doc.tags.forEach(tag => allTags.add(tag.name));
  });
  
  return {
    documents: results.documents,
    count: results.count,
    availableTags: Array.from(allTags),
  };
}
```

### Search with Pagination

```typescript
// Client-side pagination
function paginateResults(documents: any[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    results: documents.slice(start, end),
    page,
    pageSize,
    totalPages: Math.ceil(documents.length / pageSize),
    total: documents.length,
  };
}

const searchResults = await searchDocuments('react', ['tutorial']);
const page1 = paginateResults(searchResults.documents, 1, 10);
```

### Search Analytics

```typescript
// Track search queries
async function trackSearch(title?: string, tags?: string[]) {
  const response = await searchDocuments(title, tags);
  
  // Log search metrics
  console.log('Search Query:', {
    title,
    tags,
    resultCount: response.count,
    timestamp: new Date().toISOString(),
  });
  
  return response;
}
```

## Performance Tips

1. **Use specific tags**: More specific tags return fewer, more relevant results
2. **Limit tag count**: Searching with 3-5 tags is optimal
3. **Title length**: Keep search terms 2+ characters for better performance
4. **Caching**: Consider caching popular searches client-side
5. **Debouncing**: Debounce real-time search by 300-500ms

## Error Handling

```javascript
async function safeSearch(title?: string, tags?: string[]) {
  try {
    const params = new URLSearchParams();
    if (title) params.append('title', title);
    if (tags?.length) params.append('tags', tags.join(','));
    
    if (params.toString() === '') {
      return { error: 'At least one search parameter required' };
    }
    
    const response = await fetch(`/api/documents?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || 'Search failed' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    return { error: 'Network error' };
  }
}
```

## Common Patterns

### 1. Search Bar with Tag Filters

```typescript
interface SearchState {
  query: string;
  selectedTags: string[];
  results: Document[];
  loading: boolean;
}

function SearchComponent() {
  const [state, setState] = useState<SearchState>({
    query: '',
    selectedTags: [],
    results: [],
    loading: false,
  });
  
  const handleSearch = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    const data = await searchDocuments(
      state.query,
      state.selectedTags
    );
    
    setState(prev => ({
      ...prev,
      results: data.documents,
      loading: false,
    }));
  };
  
  // UI implementation...
}
```

### 2. Related Documents

```typescript
// Find related documents based on current document's tags
async function getRelatedDocuments(currentDoc: Document, limit = 5) {
  const tagNames = currentDoc.tags.map(t => t.name);
  
  const response = await searchDocuments(undefined, tagNames);
  
  // Filter out current document and limit results
  return response.documents
    .filter(doc => doc.id !== currentDoc.id)
    .slice(0, limit);
}
```

### 3. Category Pages

```typescript
// Create category pages based on tags
const categories = {
  tutorials: ['tutorial', 'guide', 'howto'],
  beginnerContent: ['beginner', 'intro', 'getting-started'],
  advanced: ['advanced', 'expert', 'deep-dive'],
};

async function getCategoryDocuments(category: keyof typeof categories) {
  const tags = categories[category];
  return await searchDocuments(undefined, tags);
}
```

## Future Enhancements

Potential improvements to the search system:
- [ ] Full-text search across document content
- [ ] Fuzzy matching for typos
- [ ] Search ranking/relevance scores
- [ ] Search suggestions/autocomplete
- [ ] Search history
- [ ] Saved searches
- [ ] Boolean operators (AND, OR, NOT)
- [ ] Date range filtering
- [ ] Price range filtering
- [ ] Sort options (relevance, date, price, title)
- [ ] Search result highlighting


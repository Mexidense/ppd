# Tags System

The PPD application includes a simple but powerful tag system for categorizing and organizing documents.

## Overview

The tag system uses a many-to-many relationship between documents and tags:
- A document can have multiple tags
- A tag can be applied to multiple documents
- Tags are reusable across all documents

## Database Schema

### Tables

**tags:**
- `id` (UUID): Unique identifier
- `name` (VARCHAR): Tag name (unique)
- `created_at` (TIMESTAMP): Creation timestamp

**document_tags** (junction table):
- `document_id` (UUID): Foreign key to documents
- `tag_id` (UUID): Foreign key to tags
- `created_at` (TIMESTAMP): When the tag was added to the document

## Helper Functions

All tag operations are available in `backend/supabase/tags.ts`:

### Tag Management

```typescript
import {
  createTag,
  getAllTags,
  getTagById,
  getTagByName,
  deleteTag,
  getOrCreateTag,
} from '@/backend/supabase';

// Create a new tag
const { data: tag, error } = await createTag('tutorial');

// Get all tags
const { data: allTags, error } = await getAllTags();

// Get tag by ID
const { data: tag, error } = await getTagById('tag-uuid');

// Get tag by name
const { data: tag, error } = await getTagByName('tutorial');

// Delete a tag (also removes all associations)
const { error } = await deleteTag('tag-uuid');

// Get existing tag or create if it doesn't exist
const { data: tag, error } = await getOrCreateTag('new-tag');
```

### Document-Tag Associations

```typescript
import {
  addTagToDocument,
  removeTagFromDocument,
  getDocumentTags,
  setDocumentTags,
} from '@/backend/supabase';

// Add a tag to a document
const { data, error } = await addTagToDocument(
  'document-uuid',
  'tag-uuid'
);

// Remove a tag from a document
const { error } = await removeTagFromDocument(
  'document-uuid',
  'tag-uuid'
);

// Get all tags for a document
const { data: tags, error } = await getDocumentTags('document-uuid');

// Set all tags for a document (replaces existing)
const { error } = await setDocumentTags(
  'document-uuid',
  ['tag-uuid-1', 'tag-uuid-2', 'tag-uuid-3']
);
```

### Querying by Tags

```typescript
import { getDocumentsByTag } from '@/backend/supabase';

// Get all documents with a specific tag
const { data: documents, error } = await getDocumentsByTag('tag-uuid');
```

## Usage Examples

### 1. Create and Apply Tags

```typescript
// Create tags
const { data: tutorial } = await createTag('tutorial');
const { data: beginner } = await createTag('beginner');
const { data: pdf } = await createTag('pdf');

// Apply tags to a document
await addTagToDocument(docId, tutorial.id);
await addTagToDocument(docId, beginner.id);
await addTagToDocument(docId, pdf.id);
```

### 2. Tag Input with Auto-Create

```typescript
// User enters tags as comma-separated values
const userTags = 'tutorial, beginner, advanced';
const tagNames = userTags.split(',').map(t => t.trim());

const tagIds: string[] = [];

for (const name of tagNames) {
  const { data: tag } = await getOrCreateTag(name);
  if (tag) {
    tagIds.push(tag.id);
  }
}

// Apply all tags to document
await setDocumentTags(documentId, tagIds);
```

### 3. Display Tags for a Document

```typescript
const { data: tags } = await getDocumentTags(documentId);

// Display tags
console.log('Tags:', tags.map(t => t.name).join(', '));
// Output: Tags: tutorial, beginner, pdf
```

### 4. Filter Documents by Tag

```typescript
// Get all tutorial documents
const { data: tutorials } = await getDocumentsByTag(tutorialTagId);

console.log(`Found ${tutorials.length} tutorial documents`);
```

### 5. Update Document Tags

```typescript
// Get current tags
const { data: currentTags } = await getDocumentTags(documentId);
console.log('Current:', currentTags.map(t => t.name));

// Replace with new tags
const newTagIds = ['tag-1', 'tag-2', 'tag-3'];
await setDocumentTags(documentId, newTagIds);

// Verify
const { data: updatedTags } = await getDocumentTags(documentId);
console.log('Updated:', updatedTags.map(t => t.name));
```

## Best Practices

### 1. Tag Naming

- Use lowercase for consistency
- Use hyphens for multi-word tags: `web-development`, `machine-learning`
- Keep tags short and descriptive
- Avoid special characters

### 2. Tag Organization

Consider creating tag categories:
- **Type**: `pdf`, `video`, `audio`, `text`
- **Level**: `beginner`, `intermediate`, `advanced`
- **Topic**: `javascript`, `python`, `blockchain`
- **Purpose**: `tutorial`, `reference`, `guide`

### 3. Preventing Tag Proliferation

- Use `getOrCreateTag()` to reuse existing tags
- Implement tag suggestions in the UI
- Periodically review and merge similar tags
- Limit the number of tags per document (5-10 recommended)

### 4. Performance

- Tags are indexed for fast lookups
- Cascade deletes ensure data integrity
- Consider caching popular tags
- Use batch operations when tagging multiple documents

## Example: Complete Tagging Workflow

```typescript
async function createAndTagDocument(
  title: string,
  filePath: string,
  cost: number,
  tagNames: string[]
) {
  // 1. Create document
  const { data: doc, error: docError } = await createDocument(
    title,
    filePath,
    'hash123',
    cost
  );

  if (docError || !doc) {
    throw new Error('Failed to create document');
  }

  // 2. Get or create tags
  const tagIds: string[] = [];
  for (const name of tagNames) {
    const { data: tag } = await getOrCreateTag(name.toLowerCase().trim());
    if (tag) {
      tagIds.push(tag.id);
    }
  }

  // 3. Apply tags to document
  const { error: tagError } = await setDocumentTags(doc.id, tagIds);

  if (tagError) {
    throw new Error('Failed to apply tags');
  }

  // 4. Return document with tags
  const { data: tags } = await getDocumentTags(doc.id);

  return {
    ...doc,
    tags: tags?.map(t => t.name) || [],
  };
}

// Usage
const document = await createAndTagDocument(
  'Getting Started with React',
  'uploads/react-guide.pdf',
  9.99,
  ['tutorial', 'react', 'javascript', 'beginner']
);

console.log(document);
// {
//   id: 'uuid',
//   title: 'Getting Started with React',
//   ...
//   tags: ['tutorial', 'react', 'javascript', 'beginner']
// }
```

## Frontend Integration

### Search by Tags

```typescript
// Allow users to filter documents by tags
async function searchDocumentsByTags(tagNames: string[]) {
  const results = new Map();

  for (const tagName of tagNames) {
    // Get tag
    const { data: tag } = await getTagByName(tagName);
    if (!tag) continue;

    // Get documents with this tag
    const { data: docs } = await getDocumentsByTag(tag.id);
    
    // Merge results
    docs?.forEach(doc => results.set(doc.id, doc));
  }

  return Array.from(results.values());
}
```

### Tag Cloud / Popular Tags

```typescript
async function getPopularTags(limit: number = 10) {
  // This requires a custom query or view
  // For now, get all tags and count their usage
  const { data: allTags } = await getAllTags();
  
  const tagCounts = await Promise.all(
    allTags.map(async (tag) => {
      const { data } = await getDocumentsByTag(tag.id);
      return {
        ...tag,
        count: data?.length || 0,
      };
    })
  );

  return tagCounts
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
```

## Future Enhancements

Potential improvements:
- [ ] Add tag descriptions
- [ ] Add tag colors/icons
- [ ] Implement tag hierarchies (parent/child tags)
- [ ] Add tag aliases (synonyms)
- [ ] Create tag categories
- [ ] Add tag popularity metrics
- [ ] Implement tag autocomplete API endpoint
- [ ] Add tag analytics (most used, trending)


import { supabase } from './config';

export interface SearchFilters {
  title?: string;
  tags?: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  path: string;
  hash: string;
  cost: number;
  address_owner?: string;
  created_at?: string;
  updated_at?: string;
  tags?: Array<{ id: string; name: string }>;
}

/**
 * Search documents by title and/or tags
 * @param filters Search filters
 * @returns Documents matching the search criteria
 */
export async function searchDocuments(
  filters: SearchFilters
): Promise<{ data: SearchResult[] | null; error: any }> {
  try {
    const { title, tags } = filters;

    // If searching by tags, we need to find documents that have those tags
    if (tags && tags.length > 0) {
      // Get tag IDs from tag names
      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', tags);

      if (tagError) {
        return { data: null, error: tagError };
      }

      if (!tagData || tagData.length === 0) {
        // No tags found, return empty result
        return { data: [], error: null };
      }

      const tagIds = tagData.map((tag) => tag.id);

      // Get documents that have at least one of these tags
      const { data: docTagsData, error: docTagsError } = await supabase
        .from('document_tags')
        .select('document_id')
        .in('tag_id', tagIds);

      if (docTagsError) {
        return { data: null, error: docTagsError };
      }

      // Get unique document IDs
      const documentIds = [
        ...new Set(docTagsData?.map((dt) => dt.document_id) || []),
      ];

      if (documentIds.length === 0) {
        return { data: [], error: null };
      }

      // Build query for documents
      let query = supabase
        .from('documents')
        .select('*')
        .in('id', documentIds);

      // Add title filter if provided
      if (title && title.trim()) {
        query = query.ilike('title', `%${title.trim()}%`);
      }

      const { data: documents, error: docsError } = await query.order(
        'created_at',
        { ascending: false }
      );

      if (docsError) {
        return { data: null, error: docsError };
      }

      // Fetch tags for each document
      const results: SearchResult[] = await Promise.all(
        documents.map(async (doc) => {
          const { data: docTags } = await supabase
            .from('document_tags')
            .select(
              `
              tags (id, name)
            `
            )
            .eq('document_id', doc.id);

          const tags = docTags?.map((dt: any) => dt.tags).filter(Boolean) || [];

          return {
            ...doc,
            tags,
          };
        })
      );

      return { data: results, error: null };
    }

    // If only searching by title (no tags)
    if (title && title.trim()) {
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .ilike('title', `%${title.trim()}%`)
        .order('created_at', { ascending: false });

      if (docsError) {
        return { data: null, error: docsError };
      }

      // Fetch tags for each document
      const results: SearchResult[] = await Promise.all(
        documents.map(async (doc) => {
          const { data: docTags } = await supabase
            .from('document_tags')
            .select(
              `
              tags (id, name)
            `
            )
            .eq('document_id', doc.id);

          const tags = docTags?.map((dt: any) => dt.tags).filter(Boolean) || [];

          return {
            ...doc,
            tags,
          };
        })
      );

      return { data: results, error: null };
    }

    // No filters provided, return all documents with tags
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (docsError) {
      return { data: null, error: docsError };
    }

    // Fetch tags for each document
    const results: SearchResult[] = await Promise.all(
      documents.map(async (doc) => {
        const { data: docTags } = await supabase
          .from('document_tags')
          .select(
            `
            tags (id, name)
          `
          )
          .eq('document_id', doc.id);

        const tags = docTags?.map((dt: any) => dt.tags).filter(Boolean) || [];

        return {
          ...doc,
          tags,
        };
      })
    );

    return { data: results, error: null };
  } catch (error) {
    console.error('Error searching documents:', error);
    return { data: null, error };
  }
}


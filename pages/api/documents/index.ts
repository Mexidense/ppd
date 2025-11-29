import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllDocuments } from '../../../backend/supabase/documents';
import { searchDocuments, SearchFilters } from '../../../backend/supabase/search';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, tags } = req.query;

    // If search parameters provided, use search function
    if (title || tags) {
      const filters: SearchFilters = {};
      
      if (title && typeof title === 'string') {
        filters.title = title;
      }
      
      if (tags) {
        filters.tags = Array.isArray(tags) ? tags as string[] : [tags as string];
      }

      const { documents, count, error } = await searchDocuments(filters);

      if (error) {
        return res.status(500).json({ error: 'Failed to search documents', details: error });
      }

      return res.status(200).json({ documents, count });
    }

    // Otherwise return all documents
    const { data, error } = await getAllDocuments();

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch documents', details: error });
    }

    return res.status(200).json({ documents: data || [], count: data?.length || 0 });
  } catch (error: any) {
    console.error('Error in documents API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}


import { NextApiRequest, NextApiResponse } from 'next';
import { searchDocuments } from '@/backend/supabase/search';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, tags } = req.query;

    // Parse tags if provided as comma-separated string
    let tagsArray: string[] | undefined;
    if (tags && typeof tags === 'string') {
      tagsArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const { data, error } = await searchDocuments({
      title: title as string | undefined,
      tags: tagsArray,
    });

    if (error) {
      console.error('Error searching documents:', error);
      return res.status(500).json({ error: 'Failed to search documents' });
    }

    return res.status(200).json({
      documents: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Error in search endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


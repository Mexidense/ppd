import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentByHash } from '@/backend/supabase/documents';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { link } = req.query;

    if (!link || typeof link !== 'string') {
      return res.status(400).json({ error: 'Document hash is required' });
    }

    // Use hash to get document
    const { data: document, error } = await getDocumentByHash(link);

    if (error) {
      console.error('Error fetching document by hash:', error);
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Return document without sensitive data (file_data)
    const { file_data, ...documentWithoutFileData } = document as any;

    return res.status(200).json({ document: documentWithoutFileData });
  } catch (error) {
    console.error('Error in document link API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


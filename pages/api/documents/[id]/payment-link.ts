import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentHash } from '@/backend/supabase/documents';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const { data, error } = await getDocumentHash(id);

    if (error) {
      console.error('Error getting document hash:', error);
      return res.status(500).json({ error: 'Failed to get document hash' });
    }

    if (!data?.hash) {
      return res.status(500).json({ error: 'Document hash not found' });
    }

    // Return the full URL using the hash
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const fullUrl = `${protocol}://${host}/pay/${data.hash}`;

    return res.status(200).json({ 
      hash: data.hash,
      full_url: fullUrl 
    });
  } catch (error) {
    console.error('Error in payment link API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentById, deleteDocument } from '../../../../backend/supabase/documents';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid document ID' });
  }

  if (req.method === 'GET') {
    // Get single document
    const { data, error } = await getDocumentById(id);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch document', details: error });
    }

    if (!data) {
      return res.status(404).json({ error: 'Document not found' });
    }

    return res.status(200).json({ document: data });
  }

  if (req.method === 'DELETE') {
    // Delete document
    const { error } = await deleteDocument(id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete document', details: error });
    }

    return res.status(200).json({ message: 'Document deleted successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


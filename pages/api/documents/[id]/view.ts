import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentById } from '../../../../backend/supabase/documents';
import { checkPurchase } from '../../../../backend/supabase/purchases';
import { getPresignedUrl } from '../../../../backend/storage/file-operations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { buyer } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    if (!buyer || typeof buyer !== 'string') {
      return res.status(400).json({ error: 'Buyer address required' });
    }

    // Get document details
    const { data: document, error: docError } = await getDocumentById(id);
    
    if (docError || !document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user owns or has purchased the document
    const isOwner = document.address_owner === buyer;
    const { purchased, error: purchaseError } = await checkPurchase(buyer, id);

    if (purchaseError && purchaseError.code !== 'PGRST116') {
      console.error('Error checking purchase:', purchaseError);
    }

    // Allow access if owner or purchased
    if (!isOwner && !purchased) {
      return res.status(403).json({ error: 'Access denied. You must purchase this document first.' });
    }

    // Generate presigned URL for the document (valid for 1 hour)
    const downloadUrl = await getPresignedUrl(document.path, 3600);

    return res.status(200).json({ 
      url: downloadUrl,
      title: document.title,
      path: document.path
    });

  } catch (error: any) {
    console.error('Error in document view API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}


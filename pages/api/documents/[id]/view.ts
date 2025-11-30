import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentById } from '../../../../backend/supabase/documents';
import { checkPurchase } from '../../../../backend/supabase/purchases';
import { getDocumentFile } from '../../../../backend/supabase/document-files';

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

    // Get the file data from database
    const { data: fileData, mimeType, error: fileError } = await getDocumentFile(id);

    if (fileError) {
      console.error('Error fetching file from database:', fileError);
      return res.status(500).json({ error: 'Database error while fetching file', details: fileError.message });
    }

    if (!fileData) {
      console.error('File data is null for document:', id);
      return res.status(404).json({ error: 'File data not found. This document may not have been uploaded correctly.' });
    }

    if (fileData.length === 0) {
      console.error('File data is empty for document:', id);
      return res.status(404).json({ error: 'File data is empty.' });
    }

    console.log(`Serving file for document ${id}: ${fileData.length} bytes, type: ${mimeType}`);

    // Set headers for PDF display
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', fileData.length);
    res.setHeader('Content-Disposition', `inline; filename="${document.title}.pdf"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    // Send the file
    return res.status(200).send(fileData);

  } catch (error: any) {
    console.error('Error in document view API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}


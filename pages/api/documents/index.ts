import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllDocuments, createDocument } from '../../../backend/supabase/documents';
import { searchDocuments, SearchFilters } from '../../../backend/supabase/search';
import { uploadFile } from '../../../backend/storage/file-operations';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle file uploads
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return handleUpload(req, res);
  }
  
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

async function handleUpload(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB max file size
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    // Extract fields
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
    const cost = Array.isArray(fields.cost) ? fields.cost[0] : fields.cost;
    const addressOwner = Array.isArray(fields.address_owner) ? fields.address_owner[0] : fields.address_owner;

    // Validate required fields
    if (!title || !cost) {
      return res.status(400).json({ error: 'Title and cost are required' });
    }

    // Get the uploaded file
    const fileArray = files.file;
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = fileArray[0];
    
    // Validate file type (PDF only)
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Upload to MinIO
    const uploadResult = await uploadFile(
      fileBuffer,
      file.originalFilename || 'document.pdf',
      file.mimetype || 'application/pdf'
    );

    // Create document record in database
    const { data: document, error: dbError } = await createDocument(
      title,
      uploadResult.path,
      uploadResult.hash,
      parseInt(cost),
      addressOwner
    );

    if (dbError || !document) {
      return res.status(500).json({ 
        error: 'Failed to create document record', 
        details: dbError 
      });
    }

    // If tags are provided, we could add them here
    // (requires tag creation logic which seems to exist in backend/supabase/tags.ts)

    // Clean up temporary file
    try {
      fs.unlinkSync(file.filepath);
    } catch (e) {
      console.error('Failed to delete temp file:', e);
    }

    return res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        ...document,
        fileSize: uploadResult.size,
        fileName: uploadResult.fileName
      }
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to upload document' 
    });
  }
}


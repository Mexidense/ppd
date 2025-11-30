import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllDocuments, createDocument } from '../../../backend/supabase/documents';
import { searchDocuments, SearchFilters } from '../../../backend/supabase/search';
import { getOrCreateTag, setDocumentTags } from '../../../backend/supabase/tags';
import formidable from 'formidable';
import fs from 'fs';
import { createHash } from 'crypto';

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
    const tagsJson = Array.isArray(fields.tags) ? fields.tags[0] : fields.tags;

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
    
    console.log('File uploaded:', {
      originalFilename: file.originalFilename,
      size: fileBuffer.length,
      mimetype: file.mimetype
    });
    
    // Calculate file hash
    const hash = createHash('sha256').update(fileBuffer).digest('hex');
    
    console.log('File hash calculated:', hash);
    
    // Create document record in database with file data
    const { data: document, error: dbError } = await createDocument(
      title,
      fileBuffer,
      hash,
      parseInt(cost),
      addressOwner,
      file.mimetype || 'application/pdf'
    );
    
    console.log('Document creation result:', { 
      success: !!document, 
      error: dbError,
      documentId: document?.id 
    });

    // Clean up temporary file
    try {
      fs.unlinkSync(file.filepath);
    } catch (e) {
      console.error('Failed to delete temp file:', e);
    }

    if (dbError || !document) {
      console.error('Database error:', dbError);
      return res.status(500).json({ 
        error: 'Failed to create document record', 
        details: dbError 
      });
    }

    console.log('Document created successfully:', document.id);

    // Handle tags if provided
    if (tagsJson) {
      try {
        const tagNames = JSON.parse(tagsJson) as string[];
        console.log('Processing tags:', tagNames);

        if (Array.isArray(tagNames) && tagNames.length > 0) {
          // Get or create tags and collect their IDs
          const tagIds: string[] = [];
          
          for (const tagName of tagNames) {
            const { data: tag, error: tagError } = await getOrCreateTag(tagName.trim().toLowerCase());
            
            if (tag) {
              tagIds.push(tag.id);
            } else {
              console.error('Failed to get/create tag:', tagName, tagError);
            }
          }

          // Associate tags with the document
          if (tagIds.length > 0) {
            const { error: setTagsError } = await setDocumentTags(document.id, tagIds);
            
            if (setTagsError) {
              console.error('Failed to set document tags:', setTagsError);
              // Don't fail the upload, just log the error
            } else {
              console.log('Successfully added', tagIds.length, 'tags to document');
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing or processing tags:', parseError);
        // Don't fail the upload, just log the error
      }
    }

    return res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        title: document.title,
        cost: document.cost,
        hash: document.hash,
        file_size: fileBuffer.length,
        created_at: document.created_at
      }
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to upload document' 
    });
  }
}


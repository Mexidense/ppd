import { supabase, Document } from './config';
import { supabaseAdmin } from './server-config';

/**
 * Create a new document with file data
 */
export async function createDocument(
  title: string,
  fileData: Buffer,
  hash: string,
  cost: number,
  addressOwner?: string,
  mimeType: string = 'application/pdf'
): Promise<{ data: Document | null; error: any }> {
  console.log('Creating document in DB:', {
    title,
    hash,
    cost,
    fileSize: fileData.length,
    addressOwner,
    mimeType
  });

  // Supabase REST API requires base64 string for BYTEA columns
  // We need to prefix with \x for hex or just use the buffer directly
  // The REST API will handle the encoding
  const base64Data = `\\x${fileData.toString('hex')}`;
  
  console.log('Converted to hex string for BYTEA, length:', base64Data.length);

  const { data, error } = await supabase
    .from('documents')
    .insert({
      title,
      file_data: base64Data,
      file_size: fileData.length,
      hash,
      cost,
      address_owner: addressOwner,
      mime_type: mimeType,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
  } else {
    console.log('Document created successfully:', data?.id);
  }

  return { data, error };
}

/**
 * Get a document by ID with tags
 */
export async function getDocumentById(
  id: string
): Promise<{ data: Document | null; error: any }> {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      document_tags (
        tags (
          id,
          name
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return { data, error };
  }

  // Transform to include tags array
  const document = {
    ...data,
    tags: data.document_tags?.map((dt: any) => dt.tags).filter(Boolean) || []
  };

  // Remove document_tags from the response
  delete (document as any).document_tags;

  return { data: document as Document, error: null };
}

/**
 * Get a document by hash with tags
 */
export async function getDocumentByHash(
  hash: string
): Promise<{ data: Document | null; error: any }> {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      document_tags (
        tags (
          id,
          name
        )
      )
    `)
    .eq('hash', hash)
    .single();

  if (error || !data) {
    return { data, error };
  }

  // Transform to include tags array
  const document = {
    ...data,
    tags: data.document_tags?.map((dt: any) => dt.tags).filter(Boolean) || []
  };

  // Remove document_tags from the response
  delete (document as any).document_tags;

  return { data: document as Document, error: null };
}

/**
 * Get all documents with their tags
 */
export async function getAllDocuments(): Promise<{
  data: Document[] | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      document_tags (
        tags (
          id,
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error };
  }

  // Transform the nested structure to include tags array
  const documents = data?.map((doc: any) => ({
    ...doc,
    tags: doc.document_tags?.map((dt: any) => dt.tags).filter(Boolean) || []
  }));

  // Remove document_tags from the response
  documents?.forEach((doc: any) => delete doc.document_tags);

  return { data: documents, error: null };
}

/**
 * Update a document's cost
 */
export async function updateDocumentCost(
  id: string,
  newCost: number
): Promise<{ data: Document | null; error: any }> {
  const { data, error } = await supabase
    .from('documents')
    .update({ cost: newCost })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete a document (uses admin client to bypass RLS)
 */
export async function deleteDocument(
  id: string
): Promise<{ error: any }> {
  // Use admin client to bypass RLS for deletion
  const { error } = await supabaseAdmin
    .from('documents')
    .delete()
    .eq('id', id);

  return { error };
}

/**
 * Search documents by path (partial match)
 */
export async function searchDocumentsByPath(
  searchTerm: string
): Promise<{ data: Document[] | null; error: any }> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .ilike('path', `%${searchTerm}%`)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get all documents by owner address with tags
 */
export async function getDocumentsByOwner(
  addressOwner: string
): Promise<{ data: Document[] | null; error: any }> {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      document_tags (
        tags (
          id,
          name
        )
      )
    `)
    .eq('address_owner', addressOwner)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error };
  }

  // Transform the nested structure to include tags array
  const documents = data?.map((doc: any) => ({
    ...doc,
    tags: doc.document_tags?.map((dt: any) => dt.tags).filter(Boolean) || []
  }));

  // Remove document_tags from the response
  documents?.forEach((doc: any) => delete doc.document_tags);

  return { data: documents, error: null };
}

/**
 * Get document hash for payment link (just returns the hash from document ID)
 */
export async function getDocumentHash(
  docId: string
): Promise<{ data: { hash: string } | null; error: any }> {
  const { data, error } = await supabase
    .from('documents')
    .select('hash')
    .eq('id', docId)
    .single();

  if (error || !data) {
    return { data: null, error };
  }

  return { data: { hash: data.hash }, error: null };
}


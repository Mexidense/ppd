import { supabase, Document } from './config';

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
 * Get a document by ID
 */
export async function getDocumentById(
  id: string
): Promise<{ data: Document | null; error: any }> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

/**
 * Get a document by hash
 */
export async function getDocumentByHash(
  hash: string
): Promise<{ data: Document | null; error: any }> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('hash', hash)
    .single();

  return { data, error };
}

/**
 * Get all documents
 */
export async function getAllDocuments(): Promise<{
  data: Document[] | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
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
 * Delete a document
 */
export async function deleteDocument(
  id: string
): Promise<{ error: any }> {
  const { error } = await supabase
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
 * Get all documents by owner address
 */
export async function getDocumentsByOwner(
  addressOwner: string
): Promise<{ data: Document[] | null; error: any }> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('address_owner', addressOwner)
    .order('created_at', { ascending: false });

  return { data, error };
}


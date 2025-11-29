import { supabase, Document } from './config';

/**
 * Create a new document
 */
export async function createDocument(
  title: string,
  path: string,
  hash: string,
  cost: number,
  addressOwner?: string
): Promise<{ data: Document | null; error: any }> {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      title,
      path,
      hash,
      cost,
      address_owner: addressOwner,
    })
    .select()
    .single();

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


import { supabase, Tag, DocumentTag } from './config';

/**
 * Create a new tag
 */
export async function createTag(
  name: string
): Promise<{ data: Tag | null; error: any }> {
  const { data, error } = await supabase
    .from('tags')
    .insert({ name })
    .select()
    .single();

  return { data, error };
}

/**
 * Get all tags
 */
export async function getAllTags(): Promise<{
  data: Tag[] | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });

  return { data, error };
}

/**
 * Get tag by ID
 */
export async function getTagById(
  id: string
): Promise<{ data: Tag | null; error: any }> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

/**
 * Get tag by name
 */
export async function getTagByName(
  name: string
): Promise<{ data: Tag | null; error: any }> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('name', name)
    .single();

  return { data, error };
}

/**
 * Delete a tag
 */
export async function deleteTag(id: string): Promise<{ error: any }> {
  const { error } = await supabase.from('tags').delete().eq('id', id);

  return { error };
}

/**
 * Add tag to document
 */
export async function addTagToDocument(
  documentId: string,
  tagId: string
): Promise<{ data: DocumentTag | null; error: any }> {
  const { data, error } = await supabase
    .from('document_tags')
    .insert({
      document_id: documentId,
      tag_id: tagId,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Remove tag from document
 */
export async function removeTagFromDocument(
  documentId: string,
  tagId: string
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('document_tags')
    .delete()
    .eq('document_id', documentId)
    .eq('tag_id', tagId);

  return { error };
}

/**
 * Get all tags for a document
 */
export async function getDocumentTags(
  documentId: string
): Promise<{ data: Tag[] | null; error: any }> {
  const { data, error } = await supabase
    .from('document_tags')
    .select(`
      tags (*)
    `)
    .eq('document_id', documentId);

  if (error) {
    return { data: null, error };
  }

  // Extract tags from nested structure
  const tags = data?.map((item: any) => item.tags).filter(Boolean) || [];

  return { data: tags, error: null };
}

/**
 * Get all documents with a specific tag
 */
export async function getDocumentsByTag(
  tagId: string
): Promise<{ data: any[] | null; error: any }> {
  const { data, error } = await supabase
    .from('document_tags')
    .select(`
      documents (*)
    `)
    .eq('tag_id', tagId);

  if (error) {
    return { data: null, error };
  }

  // Extract documents from nested structure
  const documents = data?.map((item: any) => item.documents).filter(Boolean) || [];

  return { data: documents, error: null };
}

/**
 * Set tags for a document (replaces existing tags)
 */
export async function setDocumentTags(
  documentId: string,
  tagIds: string[]
): Promise<{ error: any }> {
  // First, remove all existing tags
  const { error: deleteError } = await supabase
    .from('document_tags')
    .delete()
    .eq('document_id', documentId);

  if (deleteError) {
    return { error: deleteError };
  }

  // If no tags provided, we're done
  if (tagIds.length === 0) {
    return { error: null };
  }

  // Add new tags
  const documentTags = tagIds.map((tagId) => ({
    document_id: documentId,
    tag_id: tagId,
  }));

  const { error: insertError } = await supabase
    .from('document_tags')
    .insert(documentTags);

  return { error: insertError };
}

/**
 * Get or create tag by name (useful for tag input)
 */
export async function getOrCreateTag(
  name: string
): Promise<{ data: Tag | null; error: any }> {
  // Try to find existing tag
  const { data: existingTag, error: findError } = await getTagByName(name);

  if (existingTag) {
    return { data: existingTag, error: null };
  }

  // If not found and error is not "not found", return error
  if (findError && findError.code !== 'PGRST116') {
    return { data: null, error: findError };
  }

  // Create new tag
  return await createTag(name);
}


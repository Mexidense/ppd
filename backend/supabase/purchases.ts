import { supabase, Purchase } from './config';

/**
 * Create a new purchase record
 */
export async function createPurchase(
  addressBuyer: string,
  docId: string,
  transactionId: string
): Promise<{ data: Purchase | null; error: any }> {
  const { data, error } = await supabase
    .from('purchases')
    .insert({
      address_buyer: addressBuyer,
      doc_id: docId,
      transaction_id: transactionId,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Get all purchases by buyer address
 */
export async function getPurchasesByBuyer(
  addressBuyer: string
): Promise<{ data: any[] | null; error: any }> {
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      *,
      documents (*)
    `)
    .eq('address_buyer', addressBuyer)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get all purchases for a specific document
 */
export async function getPurchasesByDocument(
  docId: string
): Promise<{ data: Purchase[] | null; error: any }> {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('doc_id', docId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get a purchase by transaction ID
 */
export async function getPurchaseByTransactionId(
  transactionId: string
): Promise<{ data: Purchase | null; error: any }> {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('transaction_id', transactionId)
    .single();

  return { data, error };
}

/**
 * Check if an address has purchased a specific document
 */
export async function checkPurchase(
  addressBuyer: string,
  docId: string
): Promise<{ purchased: boolean; error: any }> {
  const { data, error } = await supabase
    .from('purchases')
    .select('id')
    .eq('address_buyer', addressBuyer)
    .eq('doc_id', docId)
    .single();

  return { purchased: !!data, error: error?.code === 'PGRST116' ? null : error };
}

/**
 * Get all purchases (admin function)
 */
export async function getAllPurchases(): Promise<{
  data: any[] | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      *,
      documents (*)
    `)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get purchase statistics for a document
 */
export async function getDocumentPurchaseStats(
  docId: string
): Promise<{ count: number; totalRevenue: number; error: any }> {
  // First get the count of purchases
  const { count, error: countError } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('doc_id', docId);

  if (countError) {
    return { count: 0, totalRevenue: 0, error: countError };
  }

  // Get the document cost
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('cost')
    .eq('id', docId)
    .single();

  if (docError) {
    return { count: 0, totalRevenue: 0, error: docError };
  }

  const totalRevenue = (count || 0) * (doc?.cost || 0);

  return { count: count || 0, totalRevenue, error: null };
}


import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please set environment variables.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (you can generate these from Supabase CLI later)
export interface Document {
  id: string;
  path: string;
  hash: string;
  cost: number;
  address_owner?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Purchase {
  id?: string;
  address_buyer: string;
  doc_id: string;
  transaction_id: string;
  created_at?: string;
}


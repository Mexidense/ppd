import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllTags, createTag } from '../../../backend/supabase/tags';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get all tags
    try {
      const { data: tags, error } = await getAllTags();

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch tags', details: error });
      }

      return res.status(200).json({ tags: tags || [] });
    } catch (error: any) {
      console.error('Error in tags API:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Create a new tag
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Tag name is required' });
      }

      const { data: tag, error } = await createTag(name.trim().toLowerCase());

      if (error) {
        // Check if it's a duplicate error
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Tag already exists' });
        }
        return res.status(500).json({ error: 'Failed to create tag', details: error });
      }

      return res.status(201).json({ tag });
    } catch (error: any) {
      console.error('Error creating tag:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


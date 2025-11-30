-- Enable Row Level Security on all tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DOCUMENTS TABLE POLICIES
-- ============================================

-- Allow public READ access to documents (browse marketplace)
CREATE POLICY "Public can view documents metadata"
    ON documents
    FOR SELECT
    USING (true);

-- Allow anyone to INSERT documents (upload)
CREATE POLICY "Anyone can upload documents"
    ON documents
    FOR INSERT
    WITH CHECK (true);

-- Allow owners to UPDATE their documents
CREATE POLICY "Owners can update their documents"
    ON documents
    FOR UPDATE
    USING (address_owner = current_setting('request.jwt.claims', true)::json->>'address')
    WITH CHECK (address_owner = current_setting('request.jwt.claims', true)::json->>'address');

-- Allow owners to DELETE their documents
CREATE POLICY "Owners can delete their documents"
    ON documents
    FOR DELETE
    USING (address_owner = current_setting('request.jwt.claims', true)::json->>'address');

-- ============================================
-- PURCHASES TABLE POLICIES
-- ============================================

-- Allow public READ access to purchases (for checking if purchased)
CREATE POLICY "Public can view purchases"
    ON purchases
    FOR SELECT
    USING (true);

-- Allow anyone to INSERT purchases (record payment)
CREATE POLICY "Anyone can create purchases"
    ON purchases
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- TAGS TABLE POLICIES
-- ============================================

-- Allow public READ access to tags
CREATE POLICY "Public can view tags"
    ON tags
    FOR SELECT
    USING (true);

-- Allow anyone to INSERT tags
CREATE POLICY "Anyone can create tags"
    ON tags
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- DOCUMENT_TAGS TABLE POLICIES
-- ============================================

-- Allow public READ access to document-tag relationships
CREATE POLICY "Public can view document tags"
    ON document_tags
    FOR SELECT
    USING (true);

-- Allow anyone to INSERT document-tag relationships
CREATE POLICY "Anyone can tag documents"
    ON document_tags
    FOR INSERT
    WITH CHECK (true);

-- Add comments explaining the policies
COMMENT ON POLICY "Public can view documents metadata" ON documents IS 
    'Allows anyone to browse the document marketplace without authentication';

COMMENT ON POLICY "Anyone can upload documents" ON documents IS 
    'Allows anyone to upload documents. Authentication happens at the application level via BSV signatures';

COMMENT ON POLICY "Public can view purchases" ON purchases IS 
    'Allows checking if a document has been purchased by a specific address';

COMMENT ON POLICY "Anyone can create purchases" ON purchases IS 
    'Allows recording purchases. Payment validation happens in the API middleware';


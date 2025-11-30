-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    hash VARCHAR(255) NOT NULL UNIQUE,
    cost FLOAT NOT NULL CHECK (cost >= 0),
    address_owner VARCHAR(255),
    file_data BYTEA NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(hash);

-- Create index on address_owner for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_address_owner ON documents(address_owner);

-- Add comment to table
COMMENT ON TABLE documents IS 'Stores document metadata and file data';
COMMENT ON COLUMN documents.id IS 'Unique identifier for the document (UUID)';
COMMENT ON COLUMN documents.title IS 'Title or name of the document';
COMMENT ON COLUMN documents.hash IS 'SHA-256 hash of the document for verification';
COMMENT ON COLUMN documents.cost IS 'Cost in satoshis to purchase the document';
COMMENT ON COLUMN documents.address_owner IS 'Blockchain address of the document owner/uploader';
COMMENT ON COLUMN documents.file_data IS 'Binary data of the uploaded PDF file';
COMMENT ON COLUMN documents.file_size IS 'Size of the file in bytes';
COMMENT ON COLUMN documents.mime_type IS 'MIME type of the file (default: application/pdf)';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


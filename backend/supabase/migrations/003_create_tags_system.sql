-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on tag name for faster lookups
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Create document_tags junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS document_tags (
    document_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Composite primary key
    PRIMARY KEY (document_id, tag_id),
    
    -- Foreign key constraints
    CONSTRAINT fk_document_tags_document_id
        FOREIGN KEY (document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_document_tags_tag_id
        FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_document_tags_document_id ON document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_tag_id ON document_tags(tag_id);

-- Add comments
COMMENT ON TABLE tags IS 'Stores available tags for categorizing documents';
COMMENT ON COLUMN tags.id IS 'Unique identifier for the tag';
COMMENT ON COLUMN tags.name IS 'Tag name (must be unique)';

COMMENT ON TABLE document_tags IS 'Junction table linking documents to their tags (many-to-many relationship)';
COMMENT ON COLUMN document_tags.document_id IS 'Reference to the document';
COMMENT ON COLUMN document_tags.tag_id IS 'Reference to the tag';


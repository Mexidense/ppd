-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address_buyer VARCHAR(255) NOT NULL,
    doc_id UUID NOT NULL,
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Foreign key constraint to documents table
    CONSTRAINT fk_purchases_doc_id 
        FOREIGN KEY (doc_id) 
        REFERENCES documents(id) 
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_purchases_address_buyer ON purchases(address_buyer);
CREATE INDEX IF NOT EXISTS idx_purchases_doc_id ON purchases(doc_id);
CREATE INDEX IF NOT EXISTS idx_purchases_transaction_id ON purchases(transaction_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_doc ON purchases(address_buyer, doc_id);

-- Add comments to table and columns
COMMENT ON TABLE purchases IS 'Stores purchase records linking buyers to documents via blockchain transactions';
COMMENT ON COLUMN purchases.id IS 'Unique identifier for the purchase record';
COMMENT ON COLUMN purchases.address_buyer IS 'Blockchain address of the document buyer/purchaser';
COMMENT ON COLUMN purchases.doc_id IS 'Reference to the document that was purchased';
COMMENT ON COLUMN purchases.transaction_id IS 'Unique blockchain transaction identifier';
COMMENT ON COLUMN purchases.created_at IS 'Timestamp when the purchase was recorded';


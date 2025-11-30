-- Check actual document data
SELECT 
  id,
  title,
  cost,
  address_owner,
  file_size,
  mime_type,
  CASE 
    WHEN file_data IS NULL THEN 'NULL'
    WHEN LENGTH(file_data) = 0 THEN 'EMPTY (0 bytes)'
    ELSE 'HAS DATA (' || LENGTH(file_data) || ' bytes)'
  END as file_data_status,
  created_at
FROM documents
ORDER BY created_at DESC;


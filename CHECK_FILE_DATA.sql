-- Check if documents have file_data
SELECT 
  id,
  title,
  path,
  file_size,
  mime_type,
  CASE 
    WHEN file_data IS NULL THEN 'NULL'
    WHEN LENGTH(file_data) = 0 THEN 'EMPTY'
    ELSE 'HAS DATA (' || LENGTH(file_data) || ' bytes)'
  END as file_data_status,
  address_owner,
  created_at
FROM documents
ORDER BY created_at DESC
LIMIT 10;


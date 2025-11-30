import { supabase } from './config';

/**
 * Get document file data
 */
export async function getDocumentFile(
  docId: string
): Promise<{ data: Buffer | null; mimeType: string; error: any }> {
  console.log('Fetching file data for document:', docId);
  
  const { data, error } = await supabase
    .from('documents')
    .select('file_data, mime_type, file_size')
    .eq('id', docId)
    .single();

  if (error) {
    console.error('Supabase error fetching file:', error);
    return { data: null, mimeType: 'application/pdf', error };
  }

  if (!data) {
    console.error('No data returned from Supabase for document:', docId);
    return { data: null, mimeType: 'application/pdf', error: new Error('No document data found') };
  }

  console.log('File data info:', {
    hasFileData: !!data.file_data,
    fileSize: data.file_size,
    mimeType: data.mime_type,
    fileDataType: data.file_data ? typeof data.file_data : 'null',
    fileDataLength: data.file_data ? (data.file_data.length || 'N/A') : 'N/A'
  });

  // Convert the data to Buffer if it's not already
  let fileBuffer: Buffer | null = null;
  
  if (data.file_data) {
    try {
      // Supabase JS client returns BYTEA in different formats
      if (Buffer.isBuffer(data.file_data)) {
        console.log('Data is already a buffer');
        fileBuffer = data.file_data;
      } else if (data.file_data instanceof Uint8Array) {
        console.log('Converting Uint8Array to buffer');
        fileBuffer = Buffer.from(data.file_data);
      } else if (typeof data.file_data === 'string') {
        // Could be hex string (starting with \x) or base64
        if (data.file_data.startsWith('\\x')) {
          console.log('Converting hex string to buffer...');
          // Remove \x prefix and convert hex to buffer
          const hexString = data.file_data.substring(2);
          fileBuffer = Buffer.from(hexString, 'hex');
        } else {
          console.log('Converting base64 string to buffer...');
          fileBuffer = Buffer.from(data.file_data, 'base64');
        }
      } else if (typeof data.file_data === 'object' && data.file_data !== null) {
        // Handle different JSON representations
        if ('type' in data.file_data && data.file_data.type === 'Buffer' && 'data' in data.file_data) {
          // Format: {"type":"Buffer","data":[37,80,68...]}
          console.log('Converting Buffer JSON representation to buffer');
          fileBuffer = Buffer.from(data.file_data.data as number[]);
        } else if (Array.isArray(data.file_data)) {
          // Format: [37,80,68,...]
          console.log('Converting array to buffer');
          fileBuffer = Buffer.from(data.file_data);
        } else {
          // Format: {"0":37,"1":80,"2":68...}
          console.log('Converting object with numeric keys to buffer');
          const values = Object.keys(data.file_data)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(key => data.file_data[key]);
          fileBuffer = Buffer.from(values);
        }
      }
      
      console.log('Converted file buffer length:', fileBuffer?.length, 'bytes');
      
      if (fileBuffer && fileBuffer.length !== data.file_size) {
        console.warn(`Buffer size mismatch! Expected ${data.file_size}, got ${fileBuffer.length}`);
      }
    } catch (conversionError) {
      console.error('Error converting file data to buffer:', conversionError);
      return { data: null, mimeType: 'application/pdf', error: conversionError };
    }
  } else {
    console.warn('No file_data in database for document:', docId);
  }
  
  return { 
    data: fileBuffer, 
    mimeType: data.mime_type || 'application/pdf', 
    error: null 
  };
}


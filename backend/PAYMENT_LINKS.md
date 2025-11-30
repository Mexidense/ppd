# Payment Links Feature

## Overview

The Payment Links feature allows document creators to generate unique, shareable links that enable anyone to directly purchase their documents without browsing the marketplace. The links use the document's unique hash as the identifier, making them permanent and verifiable. This is ideal for sharing documents on social media, email, or embedding in websites.

## How It Works

### For Document Creators

1. **Generate Payment Link**
   - Go to the "Published docs" page
   - Find your document in the list
   - Click the "Copy Link" button
   - The payment link using your document's hash is copied to your clipboard
   - The link is automatically copied to your clipboard

2. **Share the Link**
   - Share the copied link anywhere: social media, email, messaging apps
   - Example link format: `https://yoursite.com/pay/{document-hash}`

### For Buyers

1. **Access the Link**
   - Click on the shared payment link
   - You'll be taken directly to the document payment page

2. **Purchase the Document**
   - Connect your BSV wallet (if not already connected)
   - Review the document details
   - Click "Purchase Now" on the document card
   - Approve the transaction in your wallet
   - Instant access to view and download the document

## Technical Implementation

### Database Schema

**Uses existing `hash` column** from documents table:
- SHA-256 hash of document content
- Already unique and indexed
- Permanent identifier for the document
- No additional migration needed

### API Endpoints

#### Get Payment Link (Hash)
`POST /api/documents/[id]/payment-link`

Retrieves the document's hash for use as a payment link.

**Response:**
```json
{
  "hash": "sha256-hash-of-document",
  "full_url": "https://yoursite.com/pay/sha256-hash-of-document"
}
```

#### Get Document by Hash
`GET /api/documents/link/[hash]`

Retrieves document information by its hash.

**Response:**
```json
{
  "document": {
    "id": "uuid",
    "title": "Document Title",
    "cost": 1000,
    "hash": "sha256-hash",
    "tags": [...],
    "created_at": "2024-11-30T10:30:00Z",
    "address_owner": "..."
  }
}
```

### Routes

#### Payment Page
`/pay/[hash]` - Dynamic route that displays the document and purchase option

### Functions (documents.ts)

```typescript
// Get document hash for payment link
getDocumentHash(docId: string): Promise<{ hash: string }>

// Get document by hash (already exists)
getDocumentByHash(hash: string): Promise<Document>
```

## Security Considerations

1. **Unique Links**: Each link uses the document's SHA-256 hash (256 bits of entropy)
2. **Immutable**: Hash never changes, providing permanent document identifier
3. **Verifiable**: Hash can be used to verify document integrity
4. **No Sensitive Data**: API endpoint doesn't expose file data
5. **Standard Purchase Flow**: Same secure payment process as marketplace purchases

## Features

✅ **Hash-Based Links**: Uses existing SHA-256 document hash  
✅ **Permanent Links**: Never expire or change  
✅ **One-Click Copy**: Clipboard integration for easy sharing  
✅ **Visual Feedback**: "Copied" confirmation message  
✅ **Direct Access**: Buyers go straight to purchase page  
✅ **Verifiable**: Hash proves document authenticity  
✅ **Mobile Friendly**: Works on all devices  
✅ **Accessibility**: Proper ARIA labels and keyboard navigation  

## Use Cases

- **Content Creators**: Share documents directly with your audience
- **Email Marketing**: Include direct purchase links in newsletters
- **Social Media**: Post purchase links on Twitter, Facebook, etc.
- **Embedded Sales**: Add purchase links to your website or blog
- **Affiliate Marketing**: Share specific document purchase links
- **Course Materials**: Distribute purchase links to students

## Future Enhancements

- Analytics tracking (clicks, conversions)
- Custom vanity URLs
- Time-limited links
- Discount codes for specific links
- Link expiration dates
- QR code generation for physical media

---

**Created**: November 30, 2024  
**Last Updated**: November 30, 2024


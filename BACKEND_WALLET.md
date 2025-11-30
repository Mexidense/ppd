# Backend Wallet Setup for Production

The backend wallet is a server-side BSV wallet that receives payments when users purchase documents. It runs within Vercel's serverless functions (not as a separate server).

## How It Works

```
User Desktop Wallet → Creates Payment Transaction → Backend Wallet Receives → Document Access Granted
```

The backend wallet:
- Receives payments through BRC-29 payment protocol
- Uses `@bsv/wallet-toolbox` and `@bsv/payment-express-middleware`
- Stores data in Babbage Storage System
- Runs as part of your API routes (serverless functions)

## Setup Steps

### 1. Generate Backend Wallet (Local)

If you haven't already created a backend wallet:

```bash
npm run setup:wallet
```

This creates a `.env` file with your backend wallet's private key.

### 2. Fund the Backend Wallet

Your backend wallet needs some BSV to operate. Use the funding script:

```bash
# Make sure your desktop wallet is running
npm run setup:wallet
```

This will:
- Display your backend wallet's address
- Create a transaction from your desktop wallet to fund it
- Show the transaction on WhatsOnChain

**Recommended funding:** At least 10,000 satoshis to start

### 3. Add Private Key to Vercel

Copy the `PRIVATE_KEY` from your local `.env` file:

```bash
# Via Vercel CLI
vercel env add BACKEND_PRIVATE_KEY
# Paste the private key hex when prompted
# Select: Production, Preview, Development (all)

# Or via Vercel Dashboard
# Settings → Environment Variables → Add
# Key: BACKEND_PRIVATE_KEY
# Value: your_private_key_hex
```

⚠️ **Important:** Use `BACKEND_PRIVATE_KEY` in Vercel, not `PRIVATE_KEY` (to avoid confusion with other keys)

### 4. Verify Backend Wallet in Production

After deployment, test the backend wallet:

```bash
# Get backend wallet identity
curl https://ppd-three.vercel.app/api/wallet-info
```

Should return:
```json
{
  "identityKey": "03a1b2c3d4e5f6..."
}
```

This confirms your backend wallet is initialized correctly.

## Understanding the Payment Flow

### When a User Purchases a Document:

1. **User clicks "Purchase"** → Frontend initiates purchase
2. **First Request (402)** → Backend sends derivation prefix
3. **User Wallet Signs** → Creates payment transaction
4. **Second Request (Payment)** → Sends signed transaction with header
5. **Payment Middleware** → Validates and accepts payment
6. **Backend Wallet** → Receives the funds via BRC-29
7. **Purchase Record** → Created in Supabase
8. **Document Access** → Granted to user

### Backend Wallet's Role:

```typescript
// Payment middleware uses your backend wallet
const paymentMiddleware = createPaymentMiddleware({
  wallet: await wallet,  // Your backend wallet
  calculateRequestPrice: (req) => documentCost
});
```

The middleware:
- Provides derivation prefix to the buyer
- Validates incoming payment transactions
- Internalizes the payment to your backend wallet
- Confirms payment acceptance

## Monitoring & Maintenance

### Check Backend Wallet Balance

You can add an API endpoint to check balance (optional):

```typescript
// pages/api/wallet-balance.ts
import { wallet } from '../../lib/wallet-server';

export default async function handler(req, res) {
  const w = await wallet;
  const balance = await w.getBalance();
  return res.json({ balance });
}
```

### View Transactions

All payments received by your backend wallet can be tracked:
1. Check Supabase `purchases` table for transaction IDs
2. View on WhatsOnChain: `https://whatsonchain.com/tx/TXID`

### Refunding the Backend Wallet

If you need to empty the backend wallet (withdraw funds):

```typescript
// Create a script to send funds back to your desktop wallet
// Similar to setupWallet.ts but in reverse
```

## Security Considerations

### Private Key Storage
- ✅ Store `BACKEND_PRIVATE_KEY` in Vercel environment variables (encrypted)
- ✅ Never commit private keys to git
- ✅ Keep backup of private key in secure location
- ❌ Don't share private key or expose in client-side code

### Key Separation
- Backend wallet = Server-side operations only
- User wallets = Client-side, never touches server
- Private keys never transmitted over network

### Access Control
- Backend wallet only accessible via API routes
- Payment middleware validates all transactions
- BRC-29 protocol ensures authentic payments

## Troubleshooting

### Error: "BACKEND_PRIVATE_KEY not found"
**Solution:** Add the environment variable to Vercel:
```bash
vercel env add BACKEND_PRIVATE_KEY
```

### Error: "Wallet initialization failed"
**Possible causes:**
1. Invalid private key hex format
2. Storage service unreachable
3. Network issues with Babbage Storage

**Check Vercel logs:**
```bash
vercel logs --follow
```

### Payment Not Received
**Check:**
1. Transaction ID in Supabase `purchases` table
2. View transaction on WhatsOnChain
3. Verify payment middleware is processing correctly
4. Check Vercel function logs for errors

### Backend Wallet Runs Out of Funds
**Note:** The backend wallet receives payments, so it shouldn't run out of funds under normal operation. If you're testing and funds decrease:
1. Check for unexpected transactions
2. Review API logs for unusual activity
3. Fund the wallet again using `setupWallet.ts`

## Testing Locally vs Production

### Local Development
```bash
# Uses local .env file
npm run dev

# Backend wallet reads from .env:
# PRIVATE_KEY=your_local_key
```

### Production (Vercel)
```bash
# Uses Vercel environment variables
vercel --prod

# Backend wallet reads from Vercel:
# BACKEND_PRIVATE_KEY=your_production_key
```

**Best Practice:** Use different wallets for development and production!

## Migration & Backup

### Backup Your Backend Wallet
1. Export private key: `echo $BACKEND_PRIVATE_KEY > backup.txt`
2. Store securely (password manager, encrypted vault)
3. Never store in plain text on disk

### Migrate to New Wallet
1. Generate new wallet: `npm run setup:wallet`
2. Update Vercel environment variable
3. Fund new wallet
4. Deploy with new key
5. Monitor for successful payments

### Export Transaction History
Query Supabase for all transactions:
```sql
SELECT * FROM purchases 
WHERE created_at >= '2024-01-01'
ORDER BY created_at DESC;
```

## Advanced Configuration

### Custom Storage URL
If using a different storage provider:
```bash
vercel env add STORAGE_URL
# Enter: https://your-storage-provider.com
```

### Different Network (Testnet)
For testing on testnet:
```bash
vercel env add NETWORK
# Enter: test
```

**Warning:** Make sure your frontend and backend use the same network!

## Summary Checklist

Before deploying:
- [ ] Backend wallet generated (`npm run setup:wallet`)
- [ ] Backend wallet funded (minimum 10,000 sats)
- [ ] `BACKEND_PRIVATE_KEY` added to Vercel
- [ ] `STORAGE_URL` configured (or using default)
- [ ] `NETWORK` set correctly (main or test)
- [ ] Test payment flow after deployment
- [ ] Monitor Vercel logs for wallet initialization
- [ ] Verify `/api/wallet-info` returns identity key

After deployment:
- [ ] Test a document purchase end-to-end
- [ ] Verify transaction appears on WhatsOnChain
- [ ] Check Supabase for purchase record
- [ ] Document your backend wallet address for records

---

**Your Backend Wallet:** Runs automatically in Vercel serverless functions
**Your Desktop Wallet:** Users connect from their browser to localhost
**Both work together:** Users pay from their wallet → Your backend wallet receives → Everyone's happy! 🎉


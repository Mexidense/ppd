# Wallet Connection Guide

## Understanding the Wallet Error

When you see this error:
```
POST http://localhost:3321/getPublicKey net::ERR_BLOCKED_BY_CLIENT
Wallet connection error: TypeError: Failed to fetch
```

**This is NOT a Next.js or deployment issue!** This happens because:
1. The frontend tries to connect to a BSV wallet on `localhost:3321`
2. There's no wallet running on your computer
3. The browser blocks the request

---

## Two Solutions

### Solution 1: Run a Local Wallet Server (Quick Testing) 🚀

**Perfect for:** Testing the full app functionality without installing a full wallet

#### Step 1: Make sure you have a wallet setup
```bash
# If you haven't already
npm run setup:wallet
```

This creates a `.env` file with `PRIVATE_KEY`.

#### Step 2: Start the wallet server
```bash
npm run wallet-server
```

You should see:
```
✅ Wallet initialized
🔑 Identity: 03a1b2c3d4e5f6...
🚀 BSV Wallet Server running on http://localhost:3321

✅ CORS enabled for:
   - https://ppd-three.vercel.app
   - http://localhost:3000

💡 Now you can connect your wallet at https://ppd-three.vercel.app/
```

#### Step 3: Test the connection
1. Visit https://ppd-three.vercel.app/
2. Click "Connect Wallet"
3. Should connect successfully! ✅

#### Step 4: Keep it running
Leave the wallet server running in a terminal while you test the app.

---

### Solution 2: Use a Full BSV Wallet (Production Use) 💼

**Perfect for:** Real transactions with actual BSV

You need a BSV wallet that supports JSON-API. Options include:

#### Option A: Yours Wallet
1. Download from https://yours.org
2. Enable JSON-API in settings
3. Set port to 3321
4. Add CORS origin: `https://ppd-three.vercel.app`

#### Option B: Custom Wallet Setup
If you have your own BSV wallet software:

1. **Enable JSON-API** on port 3321
2. **Configure CORS** in the wallet's config file:
   ```json
   {
     "jsonApi": {
       "port": 3321,
       "cors": {
         "allowedOrigins": [
           "https://ppd-three.vercel.app",
           "http://localhost:3000"
         ]
       }
     }
   }
   ```

3. **Restart the wallet** to apply changes

---

## CORS Configuration - Where and Why

### ❌ NOT in Next.js

The CORS error is **NOT** related to your Next.js API routes. Don't add CORS middleware to your Next.js project for this issue.

### ✅ In Your Wallet Software

The wallet needs to accept requests from your web app's domain.

**Flow:**
```
Browser (https://ppd-three.vercel.app)
  ↓ makes request to
Wallet Server (http://localhost:3321)
  ↓ checks CORS
Allowed? → Returns wallet info
Blocked? → CORS error
```

---

## Troubleshooting

### Error: `ERR_BLOCKED_BY_CLIENT`

**Causes:**
1. No wallet server running → Start `npm run wallet-server`
2. Ad blocker blocking localhost → Disable temporarily
3. Browser security policy → Try different browser

**Fix:** Start the wallet server first, then try connecting.

### Error: `Failed to fetch`

**Causes:**
1. Wallet not running on port 3321
2. Wrong port configuration
3. CORS not configured

**Fix:**
```bash
# Check what's running on port 3321
lsof -i :3321

# If nothing, start the wallet server
npm run wallet-server
```

### Wallet Connects but Can't Create Transactions

**This is expected with the mock wallet server!**

The script I created (`npm run wallet-server`) is a **simplified testing server**. It allows wallet connection but creates mock transactions.

**For real transactions:**
- Use a full BSV wallet (Solution 2)
- Or implement full transaction creation in the wallet server script

---

## For Production Users

### What to Tell Your Users:

> **To purchase documents, you need a BSV wallet:**
> 
> 1. Install a BSV wallet with JSON-API support
> 2. Configure it to allow `https://ppd-three.vercel.app`
> 3. Run the wallet on port 3321
> 4. Connect your wallet in the app
> 
> See [WALLET_SETUP.md](./WALLET_SETUP.md) for detailed instructions.

### User Flow:

```
1. User visits your app ✅
2. User browses documents ✅ (no wallet needed)
3. User clicks "Purchase" 
4. App prompts: "Connect Wallet"
5. If no wallet: Error message with setup link
6. If wallet configured: Connection succeeds ✅
7. User completes purchase ✅
```

---

## Summary

| Scenario | Solution | When to Use |
|----------|----------|-------------|
| Testing locally | `npm run wallet-server` | Development & testing |
| Testing purchases | `npm run wallet-server` | Basic transaction testing |
| Production use | Full BSV wallet | Real money transactions |
| Just browsing | No wallet needed! | Viewing documents only |

---

## Quick Commands

```bash
# Setup wallet (first time only)
npm run setup:wallet

# Run wallet server for testing
npm run wallet-server

# In another terminal, run your app
npm run dev

# Or test with deployed version
# Just start wallet server, then visit:
# https://ppd-three.vercel.app/
```

---

## Next.js CORS (Optional)

If you need to enable CORS for your **API routes** (different issue), use the `lib/cors.ts` utility:

```typescript
import { withCors } from '@/lib/cors';

export default withCors(handler, [
  'https://ppd-three.vercel.app'
]);
```

But this is **NOT needed** for the wallet connection issue!

---

**TL;DR:** Run `npm run wallet-server` and keep it running while testing your app. That's it! 🎉


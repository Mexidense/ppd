# PPD Application Architecture

## Overview

This app uses a **dual wallet architecture** - one for the backend (server-side) and one for each user (client-side). Understanding this is crucial for deployment and usage.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Deployment                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Frontend (Next.js Pages)                              │    │
│  │  - Runs in user's browser                              │    │
│  │  - Tries to connect to localhost:3321                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│  ┌────────────────────────┼───────────────────────────────┐    │
│  │  Backend API (Serverless Functions)                     │    │
│  │  - /api/documents                                       │    │
│  │  - /api/wallet-info ✅ (uses backend wallet)           │    │
│  │  - Runs on Vercel infrastructure                       │    │
│  │  - Has BACKEND_PRIVATE_KEY env var                     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ User visits site
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    User's Computer                               │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Browser                                                │    │
│  │  - Loads https://ppd-three.vercel.app                  │    │
│  │  - Tries to connect to → http://localhost:3321 ❌      │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│  ┌────────────────────────┼───────────────────────────────┐    │
│  │  BSV Desktop Wallet (Optional)                          │    │
│  │  - Runs on localhost:3321                               │    │
│  │  - JSON-API enabled                                     │    │
│  │  - CORS: https://ppd-three.vercel.app                  │    │
│  │  - User needs to install & configure this!             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Two Wallet Systems Explained

### 1. Backend Wallet (Server-Side) ✅

**Purpose:** Receives payments from buyers

**Location:** Runs inside Vercel serverless functions

**Configuration:**
- Environment variable: `BACKEND_PRIVATE_KEY`
- No separate server needed
- Automatically initializes when API routes are called

**How it works:**
```typescript
// lib/wallet-server.ts
const privateKeyHex = process.env.BACKEND_PRIVATE_KEY;
const wallet = new Wallet(signer, services);

// Used in API routes:
const paymentMiddleware = createPaymentMiddleware({
  wallet: await wallet,  // Backend wallet receives payments here
  calculateRequestPrice: (req) => documentCost
});
```

**Testing:**
```bash
# This works because backend wallet is properly configured
curl https://ppd-three.vercel.app/api/wallet-info
# Returns: { "identityKey": "03abc..." }
```

### 2. User Desktop Wallet (Client-Side) ⚠️

**Purpose:** Users make payments from their own wallet

**Location:** Runs on each user's local computer

**Configuration:**
- Each user must install a BSV wallet
- Must enable JSON-API on port 3321
- Must configure CORS to allow your domain

**How it works:**
```typescript
// lib/wallet.ts (runs in browser)
const walletHost = process.env.NEXT_PUBLIC_WALLET_HOST || "localhost";
const w = new WalletClient("json-api", walletHost);
// ↑ This connects to http://localhost:3321 on USER'S computer
```

**Testing:**
```bash
# This FAILS if user doesn't have a wallet running
# Browser console shows:
# "Error: Failed to fetch http://localhost:3321/getPublicKey"
# ↑ This is EXPECTED behavior!
```

## The Localhost Error is NORMAL ✅

When you visit `https://ppd-three.vercel.app/` and see:

```
Network Error: GET http://localhost:3321/getPublicKey failed
```

**This is expected!** It means:
- ✅ The app is correctly trying to connect to a local wallet
- ❌ You don't have a BSV wallet running on your computer
- 🔧 This is a **user requirement**, not a deployment issue

## Deployment Checklist

### ✅ Required in Vercel:
- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `BACKEND_PRIVATE_KEY`

### ❌ NOT Required in Vercel:
- [ ] `NEXT_PUBLIC_WALLET_HOST` (defaults to localhost - correct!)
- [ ] Desktop wallet deployment (users provide their own!)
- [ ] Wallet server deployment (not needed - runs in Vercel functions!)

## User Journey

### New User Without Wallet:

1. Visit `https://ppd-three.vercel.app/`
2. Click "Connect Wallet" button
3. See error: "Desktop wallet not found"
4. Click "Learn more" to get setup instructions
5. Install BSV wallet with JSON-API
6. Configure CORS
7. Retry connection → Success! ✅

### User With Wallet:

1. Start BSV wallet on localhost:3321
2. Visit `https://ppd-three.vercel.app/`
3. Click "Connect Wallet"
4. Connection succeeds immediately ✅
5. Can now purchase documents

## Payment Flow

```
1. User clicks "Purchase Document" ($100 sats)
   ↓
2. Browser calls: POST /api/documents/[id]/purchase
   ↓
3. Backend returns: 402 Payment Required
   + Header: x-bsv-payment-derivation-prefix
   ↓
4. User's LOCAL wallet creates payment transaction
   - Connects to localhost:3321
   - Signs transaction
   - Returns signed TX
   ↓
5. Browser sends: POST /api/documents/[id]/purchase
   + Header: x-bsv-payment (signed transaction)
   ↓
6. Backend wallet RECEIVES payment
   - Payment middleware validates
   - Internalizes transaction
   - Confirms payment
   ↓
7. Purchase recorded in Supabase
   ↓
8. User can now view document ✅
```

## Common Misconceptions

### ❌ Misconception #1:
"I need to deploy a wallet server to Vercel"

**✅ Reality:**
The backend wallet runs automatically in your API routes. No separate server needed!

### ❌ Misconception #2:
"The localhost:3321 error means my deployment is broken"

**✅ Reality:**
The error is expected if the user doesn't have a local wallet. It's a **user prerequisite**, not a bug!

### ❌ Misconception #3:
"I need to add NEXT_PUBLIC_WALLET_HOST to Vercel"

**✅ Reality:**
Leave it unset! It defaults to `localhost`, which is correct - each user connects to their own wallet.

### ❌ Misconception #4:
"All users need to configure something in Vercel"

**✅ Reality:**
Users configure their LOCAL wallet, not Vercel. You (the developer) configure Vercel once.

## Testing Different Scenarios

### Test 1: Backend Wallet (Should Work)
```bash
curl https://ppd-three.vercel.app/api/wallet-info
# Expected: { "identityKey": "03..." }
# ✅ This confirms backend wallet is working
```

### Test 2: Frontend Without Local Wallet (Expected Error)
```bash
# Open browser console at https://ppd-three.vercel.app/
# Click "Connect Wallet"
# Expected: "No BSV wallet found on localhost..."
# ✅ This is CORRECT behavior - no wallet running
```

### Test 3: Frontend With Local Wallet (Should Work)
```bash
# 1. Start BSV wallet with JSON-API on port 3321
# 2. Configure CORS: https://ppd-three.vercel.app
# 3. Open https://ppd-three.vercel.app/
# 4. Click "Connect Wallet"
# Expected: "Wallet connected: 03a1b2..."
# ✅ This confirms user wallet connection works
```

## Frequently Asked Questions

### Q: Should I deploy anything else besides the Next.js app?
**A:** No! Everything runs in Vercel (frontend + API routes).

### Q: Why does /api/wallet-info work but the frontend wallet doesn't?
**A:** They're different wallets!
- `/api/wallet-info` = Backend wallet (in Vercel)
- Frontend = User's desktop wallet (on their computer)

### Q: Do I need to configure NEXT_PUBLIC_WALLET_HOST?
**A:** No! Leave it as default (`localhost`). Users connect to their own machine.

### Q: Can users use the app without a desktop wallet?
**A:** They can browse documents, but need a wallet to purchase. Consider adding browser extension wallet support (Panda Wallet, HandCash) as an alternative.

### Q: The localhost:3321 error appears in production. Is this bad?
**A:** No! It's expected. It means users need to set up their wallet. This is by design.

## Summary

| Component | Location | Configuration | Status |
|-----------|----------|--------------|---------|
| Backend Wallet | Vercel Functions | `BACKEND_PRIVATE_KEY` | ✅ Working |
| Frontend App | Vercel Edge | Standard Next.js env vars | ✅ Working |
| User Wallet | User's Computer | User must configure | ⚠️ User's responsibility |
| Database | Supabase | `NEXT_PUBLIC_SUPABASE_*` | ✅ Working |

## Next Steps

1. ✅ Verify backend wallet: `curl https://ppd-three.vercel.app/api/wallet-info`
2. ⚠️ To test purchases: Set up YOUR desktop wallet following `WALLET_SETUP.md`
3. 📝 Share `WALLET_SETUP.md` with users who want to purchase documents
4. 🎉 Your deployment is complete!

---

**Key Takeaway:** The `localhost:3321` error is **not a deployment issue** - it's an indicator that users need to set up their local wallet. Your deployment is complete and working correctly!


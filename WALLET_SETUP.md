# Desktop Wallet Setup for Deployed App

This guide explains how to use your BSV desktop wallet with the deployed Vercel app at https://ppd-three.vercel.app/

## Overview

The app connects to your local BSV desktop wallet via the JSON-API interface. When you visit the deployed app in your browser, it will attempt to connect to a wallet running on your local machine (`localhost`).

## Prerequisites

1. **BSV Desktop Wallet** with JSON-API support
   - Examples: MetaNet Client, BSV Wallet with JSON-API enabled
   - Must be running on your local machine
   - Must have JSON-API interface enabled

2. **CORS Configuration** - Your wallet must allow requests from the Vercel domain

## Setup Steps

### 1. Configure Your Desktop Wallet

Make sure your BSV wallet:
- Is running and listening on the default port
- Has the JSON-API interface enabled
- Has CORS configured to allow requests from `https://ppd-three.vercel.app`

#### CORS Configuration Example

Add the following to your wallet's CORS allowed origins:
```
https://ppd-three.vercel.app
```

The exact configuration method depends on your wallet software. Common options:
- Config file: `cors_allowed_origins = ["https://ppd-three.vercel.app"]`
- CLI flag: `--cors-allowed-origins https://ppd-three.vercel.app`
- Environment variable: `CORS_ALLOWED_ORIGINS=https://ppd-three.vercel.app`

### 2. Handle HTTPS/HTTP Mixed Content

**Important**: Since Vercel serves your app over HTTPS, you may encounter browser security restrictions if your local wallet only supports HTTP.

#### Solution Options:

**Option A: Use HTTPS for Local Wallet (Recommended)**
- Configure your wallet to use HTTPS (self-signed certificate is ok for local)
- Most modern wallets support this

**Option B: Browser Override (Development Only)**
- In Chrome: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
  - Add `http://localhost:PORT`
  - Restart browser
- In Firefox: Visit the wallet URL directly first to accept the security warning

**Option C: Use Localhost Development**
- Run the app locally with `npm run dev`
- Connect to your wallet via HTTP (no mixed content issues)

### 3. Set Environment Variable (Optional)

If your wallet runs on a non-standard host or port, you can configure it:

Create a `.env.local` file in the project root:
```bash
NEXT_PUBLIC_WALLET_HOST=localhost:3001
```

Then deploy to Vercel with:
```bash
vercel env add NEXT_PUBLIC_WALLET_HOST
```

### 4. Test the Connection

1. Start your BSV desktop wallet
2. Visit https://ppd-three.vercel.app/
3. Click "Connect Wallet" button
4. Check the browser console for connection status

Expected console output:
```
Initializing BSV wallet...
Connecting to wallet at: localhost
Wallet initialized successfully. Identity key: 03a1b2c3...
```

## Troubleshooting

### Connection Fails

**Error**: "Failed to connect wallet"

**Solutions**:
1. Ensure wallet is running: Check that your BSV wallet is active
2. Check CORS: Verify `https://ppd-three.vercel.app` is allowed
3. Check browser console: Look for specific error messages
4. Test wallet API: Try accessing `http://localhost:PORT/v1/identity` directly

### Mixed Content Blocked

**Error**: "Mixed Content: The page was loaded over HTTPS, but requested an insecure resource"

**Solutions**:
1. Enable HTTPS on your local wallet (best solution)
2. Use browser flags to allow insecure content (development only)
3. Run the app locally with `npm run dev` for development

### CORS Error

**Error**: "Access to fetch at 'http://localhost' from origin 'https://ppd-three.vercel.app' has been blocked by CORS policy"

**Solutions**:
1. Add the Vercel domain to your wallet's CORS configuration
2. Restart your wallet after changing CORS settings
3. Check wallet logs for CORS-related errors

## Security Considerations

### Desktop Wallet Security
- Your private keys never leave your local machine
- The app only requests public information and signatures
- All transactions are signed locally by your wallet

### Browser Security
- Always verify you're on the correct domain: `https://ppd-three.vercel.app`
- Never share your private keys or seed phrases
- Review transaction details before signing

### CORS Security
- Only add trusted domains to your wallet's CORS configuration
- Regularly review and update allowed origins
- Remove unused domains from CORS settings

## Alternative: Browser Extension Wallet

If desktop wallet setup is complex, consider using a browser extension wallet:
- Panda Wallet
- HandCash Connect

These integrate seamlessly without CORS or HTTPS concerns.

## Development Workflow

For local development:
```bash
# 1. Start your desktop wallet
# 2. Run the app locally
npm run dev

# 3. Access at http://localhost:3000
# 4. Connect wallet (no CORS/HTTPS issues)
```

For production:
```bash
# 1. Configure wallet CORS
# 2. Enable HTTPS on wallet (if needed)
# 3. Deploy to Vercel
vercel --prod

# 4. Test connection at https://ppd-three.vercel.app
```

## Need Help?

If you continue to have connection issues:

1. Check browser console (F12) for detailed error messages
2. Check wallet logs for connection attempts
3. Test the wallet API endpoint directly in your browser
4. Verify firewall settings allow local connections

## Next Steps

After successfully connecting your wallet:
- Upload documents
- Create payment links
- View your analytics at `/creator/stats`
- Manage your published documents at `/published`


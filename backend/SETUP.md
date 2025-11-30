# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the root of your project with the following variables:

```env
# Supabase Configuration
# Get these values from your Supabase project settings
# https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# BSV Wallet Configuration
PRIVATE_KEY=your_wallet_private_key_hex
NETWORK=main
STORAGE_URL=https://storage.babbage.systems
```

## How to Get Your Credentials

### Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on the ⚙️ Settings icon in the sidebar
4. Go to **API** section
5. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### BSV Wallet

To set up your backend wallet:

```bash
npm run setup:wallet
```

This will generate a new wallet and save the private key to your `.env` file.

⚠️ **Important**: Never commit your `.env` file to version control!


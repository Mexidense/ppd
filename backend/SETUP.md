# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# Supabase Configuration
# Get these values from your Supabase project settings
# https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# MinIO Configuration (for local development)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=documents
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

### MinIO (Local Development)

The default values above work with the included `docker-compose.yml` file. For production:
1. Use your production S3-compatible storage credentials
2. Update `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, and `MINIO_SECRET_KEY`
3. Set `MINIO_USE_SSL=true` for production

⚠️ **Important**: Never commit your `.env.local` file to version control!


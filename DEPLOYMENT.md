# Deployment Guide

This guide covers deploying the Pay Per Document (PPD) app to Vercel and configuring it for production use.

## Quick Deploy to Vercel

### 1. Initial Deployment

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

### 2. Environment Variables

Set up the following environment variables in Vercel:

#### Required Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend Wallet (for server-side operations)
PRIVATE_KEY=your_backend_wallet_private_key_hex
STORAGE_URL=https://storage.babbage.systems
NETWORK=main
```

#### Optional Variables
```bash
# If your desktop wallet runs on a custom host/port
NEXT_PUBLIC_WALLET_HOST=localhost:3001
```

### 3. Add Environment Variables to Vercel

Via CLI:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add PRIVATE_KEY
vercel env add STORAGE_URL
vercel env add NETWORK
```

Or via Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with its value
4. Select the environments (Production, Preview, Development)

## Post-Deployment Setup

### 1. Desktop Wallet Configuration

For users to connect their desktop wallets to your deployed app, see [WALLET_SETUP.md](./WALLET_SETUP.md) for detailed instructions.

**Quick checklist:**
- [ ] Desktop wallet is running with JSON-API enabled
- [ ] CORS is configured to allow `https://ppd-three.vercel.app`
- [ ] Wallet supports HTTPS or browser is configured for mixed content

### 2. Supabase Configuration

Ensure your Supabase project is properly configured:

```bash
# Run migrations (if not already done)
cd backend/supabase/migrations
# Execute each migration file in your Supabase SQL editor
```

**Tables to verify:**
- `documents` - Stores document metadata
- `purchases` - Tracks document purchases
- `tags` - Document tagging system
- `document_tags` - Many-to-many relationship

**RLS Policies:**
- Ensure Row Level Security is enabled
- Configure policies for public read access
- Configure policies for authenticated writes

### 3. Verify API Endpoints

Test the deployed API endpoints:

```bash
# Get all documents
curl https://ppd-three.vercel.app/api/documents

# Get wallet info (should return backend wallet address)
curl https://ppd-three.vercel.app/api/wallet-info

# Get tags
curl https://ppd-three.vercel.app/api/tags
```

## Domain Configuration

### Using Custom Domain

1. **Add domain in Vercel:**
   ```bash
   vercel domains add yourdomain.com
   ```

2. **Update DNS records** as instructed by Vercel

3. **Update wallet CORS:**
   - Add your custom domain to wallet CORS configuration
   - Example: `https://yourdomain.com`

4. **Update documentation:**
   - Update WALLET_SETUP.md with your domain
   - Update any hardcoded URLs in the codebase

## Monitoring and Maintenance

### 1. Check Logs

View deployment logs:
```bash
vercel logs
```

View function logs:
```bash
vercel logs --follow
```

### 2. Monitor Performance

- Check Vercel Analytics dashboard
- Monitor API response times
- Track error rates

### 3. Regular Updates

```bash
# Pull latest changes
git pull origin main

# Deploy to preview
vercel

# Review preview deployment
# If all looks good, deploy to production
vercel --prod
```

## Scaling Considerations

### Vercel Limits

**Free Plan:**
- 100 GB bandwidth
- 100k serverless function executions
- 100 GB-hrs serverless function execution time

**Pro Plan:**
- 1 TB bandwidth
- Unlimited serverless function executions
- 1000 GB-hrs serverless function execution time

### Supabase Limits

**Free Plan:**
- 500 MB database space
- 2 GB bandwidth
- 50k monthly active users

**Pro Plan:**
- 8 GB database space
- 250 GB bandwidth
- Unlimited monthly active users

### Optimization Tips

1. **Enable caching:**
   - Set appropriate cache headers for API responses
   - Use Vercel Edge Caching for static content

2. **Optimize images:**
   - Use Next.js Image component
   - Enable image optimization

3. **Database queries:**
   - Add indexes to frequently queried fields
   - Use connection pooling
   - Implement pagination for large datasets

## Security Checklist

- [ ] Environment variables are properly configured
- [ ] Supabase RLS policies are enabled
- [ ] API routes validate input
- [ ] CORS is properly configured
- [ ] HTTPS is enforced (automatic on Vercel)
- [ ] Backend wallet private key is secure
- [ ] Rate limiting is implemented (if needed)

## Troubleshooting

### Deployment Fails

**Check:**
1. Build logs in Vercel dashboard
2. Environment variables are set correctly
3. Dependencies are installed properly
4. TypeScript compilation errors

### API Endpoints Return Errors

**Check:**
1. Supabase connection
2. Environment variables
3. Function logs
4. Database migrations

### Wallet Connection Issues

**See:** [WALLET_SETUP.md](./WALLET_SETUP.md) for detailed troubleshooting

## Rollback Procedure

If a deployment causes issues:

```bash
# List deployments
vercel ls

# Promote a previous deployment to production
vercel promote <deployment-url>
```

Or via Vercel Dashboard:
1. Go to Deployments
2. Find the working deployment
3. Click "Promote to Production"

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          vercel pull --yes --environment=production --token=$VERCEL_TOKEN
          vercel build --prod --token=$VERCEL_TOKEN
          vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

## Performance Tips

1. **Enable Edge Functions** for faster response times globally
2. **Use ISR** (Incremental Static Regeneration) for document pages
3. **Implement caching** for frequently accessed data
4. **Optimize bundle size** by analyzing with `npm run build`

## Support

For more help:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [BSV SDK Documentation](https://www.npmjs.com/package/@bsv/sdk)

---

**Current Deployment:** https://ppd-three.vercel.app/
**Status:** ✅ Live


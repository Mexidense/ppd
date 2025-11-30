# MinIO Setup Instructions

## Error: SignatureDoesNotMatch

If you're getting the error "The request signature we calculated does not match the signature you provided", it means your MinIO credentials don't match.

## Quick Fix

### 1. Check if MinIO is running:

```bash
docker ps
```

If you don't see `ppd-minio` container, start it:

```bash
docker-compose up -d
```

### 2. Update your `.env` file:

Make sure your `.env` file has these exact values to match the docker-compose.yml:

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=documents
```

### 3. Restart your Next.js server:

Stop the dev server (Ctrl+C) and start it again:

```bash
npm run dev
```

## Verify MinIO is Working

1. **Access MinIO Console:**
   - Open http://localhost:9001
   - Login with:
     - Username: `minioadmin`
     - Password: `minioadmin123`

2. **Check the bucket:**
   - You should see a bucket called `documents`
   - If not, create it manually through the UI

## Alternative: Use Different Credentials

If you want to use custom credentials:

1. **Update `docker-compose.yml`:**

```yaml
environment:
  MINIO_ROOT_USER: your_custom_user
  MINIO_ROOT_PASSWORD: your_custom_password
```

2. **Update `.env` file:**

```env
MINIO_ACCESS_KEY=your_custom_user
MINIO_SECRET_KEY=your_custom_password
```

3. **Restart everything:**

```bash
docker-compose down
docker-compose up -d
npm run dev
```

## Troubleshooting

### Check MinIO logs:

```bash
docker logs ppd-minio
```

### Recreate MinIO container:

```bash
docker-compose down -v  # WARNING: This deletes all stored files
docker-compose up -d
```

### Test MinIO connection:

Use the MinIO client (mc):

```bash
docker run --rm -it --network host minio/mc:latest \
  alias set local http://localhost:9000 minioadmin minioadmin123

docker run --rm -it --network host minio/mc:latest \
  ls local
```

## Production Setup

For production, always use:
- Strong passwords
- SSL/HTTPS (set `MINIO_USE_SSL=true`)
- Different credentials than defaults
- Private buckets with access controls


# Docker Setup Guide

This guide explains how to set up and use MinIO (S3-compatible storage) with Docker for local development.

## 🐳 Prerequisites

- Docker installed ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## 🚀 Quick Start

### 1. Start MinIO

From the project root, run:

```bash
docker-compose up -d
```

This will:
- Start MinIO server on port `9000` (API)
- Start MinIO Console UI on port `9001`
- Create a default bucket called `documents`
- Set the bucket to allow public downloads

### 2. Verify MinIO is Running

Check the container status:

```bash
docker-compose ps
```

You should see:
```
NAME                IMAGE               STATUS              PORTS
ppd-minio          minio/minio:latest  Up X seconds        0.0.0.0:9000->9000/tcp, 0.0.0.0:9001->9001/tcp
```

### 3. Access MinIO Console

Open your browser and go to: [http://localhost:9001](http://localhost:9001)

**Default Credentials:**
- Username: `minioadmin`
- Password: `minioadmin123`

## 📋 Docker Commands

### Start Services

```bash
# Start in detached mode (background)
docker-compose up -d

# Start with logs visible
docker-compose up
```

### Stop Services

```bash
# Stop containers but keep data
docker-compose stop

# Stop and remove containers (keeps volumes/data)
docker-compose down

# Stop, remove containers AND delete all data
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs minio
```

### Restart Services

```bash
docker-compose restart
```

## 🗂️ MinIO Console Features

Once logged into the MinIO Console at http://localhost:9001:

1. **Buckets**: View and manage your storage buckets
2. **Object Browser**: Upload, download, and delete files
3. **Access Keys**: Create additional access credentials
4. **Monitoring**: View metrics and usage statistics

## 📦 Storage Locations

### Docker Volume

MinIO data is stored in a Docker volume named `ppd_minio_data`. This persists data between container restarts.

**View volumes:**
```bash
docker volume ls
```

**Inspect volume:**
```bash
docker volume inspect ppd_minio_data
```

### Bucket Structure

Files uploaded through the API are stored in:
```
documents/
  └── uploads/
      ├── uuid1.pdf
      ├── uuid2.docx
      └── uuid3.jpg
```

## 🔧 Configuration

### Default Settings (Local Development)

These are set in `docker-compose.yml`:

- **API Port**: 9000
- **Console Port**: 9001
- **Access Key**: minioadmin
- **Secret Key**: minioadmin123
- **Default Bucket**: documents

### Changing Credentials

Edit `docker-compose.yml`:

```yaml
environment:
  MINIO_ROOT_USER: your-username
  MINIO_ROOT_PASSWORD: your-secure-password
```

Then update your `.env.local`:

```env
MINIO_ACCESS_KEY=your-username
MINIO_SECRET_KEY=your-secure-password
```

Restart the containers:
```bash
docker-compose down
docker-compose up -d
```

## 🧪 Testing the Setup

### 1. Check MinIO Health

```bash
curl http://localhost:9000/minio/health/live
```

Expected response: `200 OK`

### 2. Test File Upload via API

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@test.pdf" \
  -F "cost=9.99"
```

### 3. View Uploaded Files

1. Go to http://localhost:9001
2. Login with credentials
3. Navigate to **Buckets** → **documents** → **uploads**
4. You should see your uploaded files

## 🐛 Troubleshooting

### Port Already in Use

If ports 9000 or 9001 are already in use:

1. Find what's using the port:
   ```bash
   lsof -i :9000
   lsof -i :9001
   ```

2. Kill the process or change ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "9002:9000"  # Use 9002 instead of 9000
     - "9003:9001"  # Use 9003 instead of 9001
   ```

3. Update `.env.local`:
   ```env
   MINIO_PORT=9002
   ```

### Container Won't Start

Check logs:
```bash
docker-compose logs minio
```

Common issues:
- Docker daemon not running
- Insufficient disk space
- Conflicting container names

### Connection Refused

If your app can't connect to MinIO:

1. Verify MinIO is running:
   ```bash
   docker-compose ps
   ```

2. Check network connectivity:
   ```bash
   curl http://localhost:9000/minio/health/live
   ```

3. Verify environment variables in `.env.local`

### Reset Everything

To completely reset MinIO:

```bash
# Stop and remove everything
docker-compose down -v

# Remove the volume
docker volume rm ppd_minio_data

# Start fresh
docker-compose up -d
```

## 🚀 Production Deployment

For production, consider:

1. **Use managed S3 service**: AWS S3, DigitalOcean Spaces, etc.
2. **Enable SSL/TLS**: Set `MINIO_USE_SSL=true`
3. **Strong credentials**: Use complex access keys
4. **Private buckets**: Don't allow public access
5. **Backup strategy**: Implement regular backups
6. **Access control**: Use IAM policies

### Example Production Config

```env
MINIO_ENDPOINT=your-s3-endpoint.com
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your-production-access-key
MINIO_SECRET_KEY=your-production-secret-key
MINIO_BUCKET_NAME=production-documents
```

## 📚 Additional Resources

- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MinIO JavaScript SDK](https://min.io/docs/minio/linux/developers/javascript/API.html)
- [S3 API Compatibility](https://docs.min.io/docs/aws-s3-compatibility.html)


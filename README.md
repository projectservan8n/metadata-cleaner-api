# Metadata Cleaner API

A REST API service that removes metadata from files using ExifTool. Perfect for privacy-focused applications and n8n workflows.

## Features

- 🧹 Remove metadata from images, PDFs, documents, and more
- 📤 Support for file uploads and base64 encoded files
- 🔒 Privacy-focused - no files are stored permanently
- 🚀 Fast and efficient processing
- 📊 File size comparison (before/after)
- 🐳 Docker support for easy deployment

## API Endpoints

### Health Check
```
GET /health
```

### Clear Metadata
```
POST /clear-metadata
```

#### Option 1: File Upload
```bash
curl -X POST \
  -F "file=@your-file.jpg" \
  https://your-api.railway.app/clear-metadata
```

#### Option 2: Base64 JSON
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "file": "base64-encoded-file-data",
    "filename": "image.jpg"
  }' \
  https://your-api.railway.app/clear-metadata
```

## Response Format

```json
{
  "success": true,
  "message": "Metadata cleared successfully",
  "originalSize": 2048576,
  "cleanedSize": 2035821,
  "savedBytes": 12755,
  "file": "base64-encoded-clean-file",
  "timestamp": "2025-07-12T10:30:00.000Z"
}
```

## Usage with n8n

```javascript
// In your n8n Code Node
const response = await $http.request({
  method: 'POST',
  url: 'https://your-metadata-api.railway.app/clear-metadata',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    file: item.json.fileData, // base64 encoded
    filename: item.json.filename
  }
});

item.json.cleanFile = response.file;
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Install ExifTool:
```bash
# macOS
brew install exiftool

# Ubuntu/Debian
sudo apt-get install exiftool

# Windows
# Download from https://exiftool.org/
```

3. Run the server:
```bash
npm run dev
```

## Docker Development

```bash
# Build image
docker build -t metadata-cleaner-api .

# Run container
docker run -p 3000:3000 metadata-cleaner-api
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (production/development)

## File Size Limits

- Maximum file size: 50MB
- Supported formats: All formats supported by ExifTool

## Security

- No files are stored permanently
- Temporary files are automatically cleaned up
- Non-root user in Docker container
- CORS enabled for web applications

# 📸 Product Photo Upload Feature

## Overview

Sellers can now upload product photos to make their listings more attractive and trustworthy. The system supports:

- ✅ Multiple photos per product (no strict limit)
- ✅ JPG, PNG, WebP formats
- ✅ Max 5MB per photo
- ✅ Secure file storage
- ✅ Direct serving from backend
- ✅ No external dependencies

---

## How It Works

### 1. **Upload Photo** (Seller)
```bash
curl -X POST http://localhost:8000/api/upload-photo \
  -F "file=@nike_shoe.jpg"
```

**Response:**
```json
{
  "status": "success",
  "message": "Photo uploaded successfully",
  "photo_url": "/uploads/products/a1b2c3d4_1678901234.jpg",
  "file_size_kb": 450.5
}
```

**Key Points:**
- Returns a `photo_url` that can be used immediately
- Photos stored in `backend/uploads/products/` directory
- Unique filename format: `{uuid}_{timestamp}.{extension}`

### 2. **Use Photo in Payment Link**
```bash
curl -X POST http://localhost:8000/api/create-payment-link \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nike Air Max",
    "price": 4500,
    "description": "Brand new shoes",
    "seller_phone": "254712345678",
    "seller_name": "Brian Kipchoge",
    "category": "Shoes",
    "photos": [
      "/uploads/products/a1b2c3d4_1678901234.jpg",
      "/uploads/products/e5f6g7h8_1678901235.jpg"
    ]
  }'
```

### 3. **Display Photos** (Frontend)
```html
<img src="/uploads/products/a1b2c3d4_1678901234.jpg" alt="Product photo">
```

---

## API Endpoints

### `POST /api/upload-photo`

**Upload a product photo**

**Request:**
```
Content-Type: multipart/form-data
Body: file (binary)
```

**Response:**
```json
{
  "status": "success",
  "message": "Photo uploaded successfully",
  "photo_url": "/uploads/products/unique_filename.jpg",
  "file_size_kb": 450.5
}
```

**Constraints:**
- **Formats:** JPG, PNG, WebP
- **Max size:** 5MB
- **Required:** Yes

**Error Responses:**

```json
{
  "detail": "Invalid file type. Allowed: JPG, PNG, WebP. Got: image/gif"
}
```

```json
{
  "detail": "File too large: 7.5MB (max 5MB)"
}
```

---

## Product Model Update

The `Product` model now includes a `photos` field:

```python
class Product(BaseModel):
    name: str                    # Product name
    price: float                 # Price in KES
    description: str             # Description
    seller_phone: str            # M-Pesa number
    seller_name: str             # Seller name
    category: str                # Product category
    seller_location: Location    # GPS location
    photos: List[str]            # NEW: List of photo URLs
```

**Example:**
```json
{
  "name": "Nike Air Max",
  "price": 4500,
  "description": "Brand new shoes, size 42",
  "seller_phone": "254712345678",
  "seller_name": "Brian Kipchoge",
  "category": "Shoes",
  "photos": [
    "/uploads/products/nike_front.jpg",
    "/uploads/products/nike_side.jpg",
    "/uploads/products/nike_box.jpg"
  ]
}
```

---

## Database Schema

### Updated Orders Table
```sql
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    product_name TEXT,
    product_price REAL,
    product_description TEXT,
    product_category TEXT,
    seller_phone TEXT,
    seller_name TEXT,
    seller_location_lat REAL,
    seller_location_lon REAL,
    buyer_phone TEXT,
    buyer_name TEXT,
    product_photos TEXT,           -- NEW: JSON string of photo URLs
    status TEXT,
    payment_link TEXT,
    payhero_ref TEXT,
    fraud_risk_score INTEGER,
    fraud_risk_level TEXT,
    fraud_flags TEXT,
    created_at TIMESTAMP,
    paid_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP
);
```

**Example stored value:**
```
product_photos = '["/uploads/products/photo1.jpg", "/uploads/products/photo2.jpg"]'
```

---

## Workflow: Seller Uploads Photos

### Step 1: Upload Multiple Photos
```javascript
// JavaScript example
const photos = [];

// Upload photo 1
const formData1 = new FormData();
formData1.append('file', fileInput1.files[0]);
const res1 = await fetch('/api/upload-photo', {
  method: 'POST',
  body: formData1
});
const data1 = await res1.json();
photos.push(data1.photo_url);  // "/uploads/products/..."

// Upload photo 2
const formData2 = new FormData();
formData2.append('file', fileInput2.files[0]);
const res2 = await fetch('/api/upload-photo', {
  method: 'POST',
  body: formData2
});
const data2 = await res2.json();
photos.push(data2.photo_url);  // "/uploads/products/..."

console.log('Photos ready:', photos);
```

### Step 2: Create Payment Link with Photos
```javascript
const product = {
  name: "Nike Air Max",
  price: 4500,
  description: "Brand new shoes, size 42",
  seller_phone: "254712345678",
  seller_name: "Brian Kipchoge",
  category: "Shoes",
  photos: photos  // Array of uploaded photo URLs
};

const response = await fetch('/api/create-payment-link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(product)
});

const order = await response.json();
console.log('Payment link:', order.payment_link);
console.log('Photos stored:', product.photos);
```

---

## Frontend Integration

### Simple Upload Form
```html
<form id="uploadForm">
  <input type="file" id="photo1" accept="image/*" required>
  <input type="file" id="photo2" accept="image/*">
  <input type="file" id="photo3" accept="image/*">
  <button type="button" onclick="uploadPhotos()">Upload Photos</button>
</form>

<script>
  const uploadedPhotos = [];

  async function uploadPhotos() {
    const fileInputs = [
      document.getElementById('photo1'),
      document.getElementById('photo2'),
      document.getElementById('photo3')
    ];

    for (const input of fileInputs) {
      if (!input.files[0]) continue;
      
      const formData = new FormData();
      formData.append('file', input.files[0]);

      try {
        const response = await fetch('/api/upload-photo', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        if (data.status === 'success') {
          uploadedPhotos.push(data.photo_url);
          console.log('✅ Uploaded:', data.photo_url);
          console.log(`Size: ${data.file_size_kb}KB`);
        }
      } catch (error) {
        alert('❌ Upload failed: ' + error.message);
      }
    }

    console.log('All photos uploaded:', uploadedPhotos);
  }
</script>
```

### Display Photos in Product Listing
```html
<div class="product-gallery">
  <div class="main-photo">
    <img id="mainPhoto" src="" alt="Product">
  </div>
  
  <div class="photo-thumbnails">
    <!-- Thumbnails will be generated here -->
  </div>
</div>

<script>
  function displayPhotos(photoUrls) {
    const main = document.getElementById('mainPhoto');
    const thumbnails = document.querySelector('.photo-thumbnails');
    
    // Set main image to first photo
    if (photoUrls.length > 0) {
      main.src = photoUrls[0];
    }
    
    // Create thumbnail buttons
    photoUrls.forEach((url, index) => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = `Photo ${index + 1}`;
      img.onclick = () => main.src = url;
      img.style.cursor = 'pointer';
      thumbnails.appendChild(img);
    });
  }

  // Example usage
  const photoUrls = [
    "/uploads/products/nike_front.jpg",
    "/uploads/products/nike_side.jpg"
  ];
  displayPhotos(photoUrls);
</script>
```

---

## Security Features

### ✅ File Type Validation
- Only allows: **JPG, PNG, WebP**
- Checks MIME type on upload
- Prevents malicious file uploads

### ✅ File Size Validation
- Max **5MB per file**
- Prevents disk space abuse
- Efficient storage usage

### ✅ Secure Filename Generation
- Uses UUID + timestamp
- Prevents filename collision
- No user-controlled filenames

### ✅ Path Traversal Prevention
- Validates file is in uploads directory
- Prevents `../` attacks
- Secure file serving

### ✅ CORS Protection
- Only frontend domains can upload
- Backend validates origin
- Prevents abuse from external sites

---

## File Organization

```
backend/
├── uploads/
│   └── products/
│       ├── a1b2c3d4_1678901234.jpg
│       ├── e5f6g7h8_1678901235.jpg
│       ├── i9j0k1l2_1678901236.png
│       └── m3n4o5p6_1678901237.webp
├── app/
├── main.py
└── database.py
```

**Notes:**
- Directory created automatically on first upload
- Never commit `uploads/` to git (add to `.gitignore`)
- In production, use cloud storage (S3, Cloudinary, etc)

---

## Production Deployment

### Manual Upload (Current MVP)
```bash
# Files stored locally in backend/uploads/products/
# Only suitable for low-volume or testing
```

### Cloud Storage (Recommended for Scale)

**Option 1: AWS S3**
```python
import boto3

s3 = boto3.client('s3', 
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY'),
    aws_secret_access_key=os.getenv('AWS_SECRET_KEY')
)

# Upload to S3
s3.upload_fileobj(
    file_content,
    'soko-pay-products',
    f'products/{unique_filename}'
)

# Return S3 URL
photo_url = f"https://soko-pay-products.s3.amazonaws.com/products/{unique_filename}"
```

**Option 2: Cloudinary**
```python
import cloudinary.uploader

response = cloudinary.uploader.upload(
    file_content,
    folder='soko-pay/products'
)

photo_url = response['secure_url']
```

**Option 3: Google Cloud Storage**
```python
from google.cloud import storage

client = storage.Client()
bucket = client.bucket('soko-pay-products')
blob = bucket.blob(f'products/{unique_filename}')
blob.upload_from_string(file_content)

photo_url = blob.public_url
```

---

## Testing

### Manual Test with cURL
```bash
# Create test image (1x1 red pixel)
python -c "
from PIL import Image
img = Image.new('RGB', (1, 1), color='red')
img.save('test.jpg')
"

# Upload
curl -X POST http://localhost:8000/api/upload-photo \
  -F "file=@test.jpg"

# Response:
# {
#   "status": "success",
#   "message": "Photo uploaded successfully",
#   "photo_url": "/uploads/products/abc123.jpg",
#   "file_size_kb": 0.5
# }
```

### Python Test
```python
import requests
from pathlib import Path

# Create test file
test_file = Path('test_photo.jpg')
test_file.write_bytes(b'fake jpeg data')  # Would be real image in practice

# Upload
with open(test_file, 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/upload-photo',
        files={'file': f}
    )

print(response.json())
# {
#   "status": "success",
#   "photo_url": "/uploads/products/...",
#   "file_size_kb": 0.1
# }

# Cleanup
test_file.unlink()
```

### Test Error Cases
```bash
# Test 1: Invalid file type (GIF)
curl -X POST http://localhost:8000/api/upload-photo \
  -F "file=@image.gif"
# Error: "Invalid file type. Allowed: JPG, PNG, WebP. Got: image/gif"

# Test 2: Too large (>5MB)
# Create 6MB file
dd if=/dev/zero of=large.jpg bs=1M count=6

curl -X POST http://localhost:8000/api/upload-photo \
  -F "file=@large.jpg"
# Error: "File too large: 6.0MB (max 5MB)"

# Test 3: Missing file
curl -X POST http://localhost:8000/api/upload-photo
# Error: "Field required" (or 422 Unprocessable Entity)
```

---

## Troubleshooting

### Upload Returns 500 Error
```
Error: "Error uploading photo: [Errno 2] No such file or directory"
```

**Solution:** Ensure `uploads/products/` directory exists. The system creates it automatically, but if permissions are wrong:

```bash
mkdir -p backend/uploads/products
chmod 755 backend/uploads
chmod 755 backend/uploads/products
```

### Files Not Visible on Frontend
```
Cannot GET /uploads/products/photo.jpg
```

**Solution:** Ensure static files are mounted in `main.py`:

```python
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

### Permission Denied on Upload
```
Error uploading photo: [Errno 13] Permission denied
```

**Solution:** Check file permissions:

```bash
ls -la backend/uploads/
# drwxr-xr-x user group uploads

# If not writable:
chmod 755 backend/uploads/products
```

---

## What's Next

### Coming Soon
- [ ] Image compression (reduce file size)
- [ ] Image resizing (thumbnails, previews)
- [ ] Image optimization (WebP conversion)
- [ ] Drag-and-drop upload UI
- [ ] Image cropping tool
- [ ] Multiple simultaneous uploads

### Optional Enhancements
- [ ] AWS S3 integration
- [ ] Cloudinary CDN
- [ ] Google Cloud Storage
- [ ] Watermarking
- [ ] EXIF data stripping
- [ ] Virus scanning

---

## API Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload-photo` | POST | Upload product photo (JPG, PNG, WebP, max 5MB) |
| `/api/create-payment-link` | POST | Create order with photos |
| `/uploads/products/{filename}` | GET | Serve product photo |

---

**Built for Soko Pay - Valentine's Hackathon 2026** 📸

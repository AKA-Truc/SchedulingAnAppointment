# Cloudinary Integration for Hospital Images

This document describes the Cloudinary integration implemented for managing hospital images, including logos, gallery images, and certificates.

## Features Implemented

### 1. Backend Services (NestJS)

#### CloudinaryService (`src/cloudinary/cloudinary.service.ts`)
- **Hospital Logo Upload**: Optimized logo upload with automatic resizing (300x300px)
- **Hospital Gallery Upload**: Multiple image upload with categorization (exterior, interior, facility, equipment)
- **Hospital Certificate Upload**: Certificate/achievement image upload
- **Image Optimization**: Automatic WebP conversion and quality optimization
- **Image Deletion**: Delete images by public_id
- **Context-based Search**: Retrieve images by hospital ID and type

#### Hospital Controller Updates (`src/hospital/hospital.controller.ts`)
New endpoints added:
- `POST /hospital/:id/upload-logo` - Upload hospital logo
- `POST /hospital/:id/upload-gallery` - Upload gallery images (max 5 per request)
- `POST /hospital/:id/upload-certificate` - Upload certificates
- `GET /hospital/:id/images` - Get all hospital images
- `DELETE /hospital/:id/images/:publicId` - Delete specific image

#### Database Schema Updates (`prisma/postgre/schema.prisma`)
Added fields to Hospital model:
```prisma
model Hospital {
  // ... existing fields
  gallery        String?       // JSON array of gallery image URLs
  certificates   String?       // JSON array of certificate data
  rating         Float?        // Hospital rating
  reviews        Int?          // Number of reviews
  verified       Boolean?      @default(true) // Hospital verification status
  totalBeds      Int?          // Total number of beds
  totalNurses    Int?          // Total number of nurses
}
```

### 2. Frontend Integration (Next.js)

#### Hospital Service Updates (`src/services/hospitalService.ts`)
New RTK Query endpoints:
- `uploadHospitalLogo` - Upload hospital logo
- `uploadHospitalGallery` - Upload multiple gallery images
- `uploadHospitalCertificate` - Upload certificate images
- `getHospitalImages` - Retrieve hospital images
- `deleteHospitalImage` - Delete hospital images

#### Image Gallery Component (`src/components/ui/image-gallery.tsx`)
- **Responsive Grid Layout**: 2-4 columns based on screen size
- **Full-Screen Gallery**: Modal view with navigation
- **Cloudinary Optimization**: Automatic image optimization with URL transformations
- **Thumbnail Navigation**: Quick image switching
- **Lazy Loading**: Optimized image loading with Next.js Image component

#### Updated Pages
1. **Facilities List** (`src/app/facilities/page.tsx`):
   - Uses gallery images as primary image source
   - Falls back to logo, then placeholder
   - Real-time image loading from API

2. **Hospital Detail** (`src/app/facilities/[id]/page.tsx`):
   - New "Hình ảnh" tab with full gallery
   - Integrated HospitalGallery component
   - Map integration with image optimization

## Setup Instructions

### 1. Environment Variables
Create or update your `.env` file:
```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Database Migration
Run the Prisma migration to add new fields:
```bash
cd SchedulingAnAppointment
npx prisma migrate dev --name add_hospital_images_fields
npx prisma generate
```

### 3. Install Dependencies
Dependencies should already be installed, but if needed:
```bash
# Backend
npm install cloudinary multer @types/multer

# Frontend (already included in Next.js)
# No additional dependencies required
```

## Usage Examples

### 1. Upload Hospital Logo (Backend)
```typescript
// Using the service directly
const uploadResult = await this.cloudinaryService.uploadHospitalLogo(
  file, // Express.Multer.File
  hospitalId // number
);

// API endpoint
POST /hospital/1/upload-logo
Content-Type: multipart/form-data
Body: { logo: [file] }
```

### 2. Upload Gallery Images (Frontend)
```typescript
const [uploadGallery] = useUploadHospitalGalleryMutation();

const handleGalleryUpload = async (files: File[]) => {
  try {
    const result = await uploadGallery({
      hospitalId: 1,
      imageFiles: files,
      imageType: 'exterior'
    }).unwrap();
    console.log('Gallery uploaded:', result.data.images);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### 3. Display Hospital Gallery
```tsx
import { HospitalGallery } from '@/components/ui/image-gallery';

function HospitalPage({ hospital }) {
  return (
    <div>
      <h2>Hospital Gallery</h2>
      <HospitalGallery hospital={hospital} />
    </div>
  );
}
```

## Image Optimization

### Automatic Transformations
All images are automatically optimized:
- **Format**: WebP conversion for better compression
- **Quality**: Auto quality adjustment
- **Sizing**: Appropriate dimensions for different use cases
  - Logo: 300x300px
  - Gallery: 800x600px for full view, 300x300px for thumbnails
  - Certificates: 600x800px

### URL Structure
Optimized URLs follow this pattern:
```
https://res.cloudinary.com/{cloud_name}/image/upload/w_300,h_300,c_fill,f_webp,q_auto/{public_id}
```

### Context Tags
Images are tagged with context for easy retrieval:
- `hospital_id={id}|type=logo`
- `hospital_id={id}|type=gallery|category={exterior|interior|facility|equipment}`
- `hospital_id={id}|type=certificate`

## API Endpoints

### Hospital Image Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/hospital/:id/upload-logo` | Upload hospital logo | Yes |
| POST | `/hospital/:id/upload-gallery` | Upload gallery images | Yes |
| POST | `/hospital/:id/upload-certificate` | Upload certificate | Yes |
| GET | `/hospital/:id/images` | Get hospital images | No |
| DELETE | `/hospital/:id/images/:publicId` | Delete image | Yes |

### Request/Response Examples

#### Upload Logo
```typescript
// Request
FormData {
  logo: File
}

// Response
{
  message: "Hospital logo uploaded successfully",
  code: 200,
  data: {
    logoUrl: "https://res.cloudinary.com/...",
    publicId: "hospital_1_logo",
    hospital: Hospital
  }
}
```

#### Get Hospital Images
```typescript
// Response
{
  message: "Hospital images retrieved successfully",
  code: 200,
  data: {
    logo: "https://res.cloudinary.com/.../logo",
    gallery: ["https://res.cloudinary.com/.../img1", "..."],
    certificates: ["https://res.cloudinary.com/.../cert1", "..."]
  }
}
```

## Testing

### HTTP Tests
Use the provided test file:
```bash
# Run tests with REST Client (VS Code extension)
# Open: test-hospital-cloudinary.http
```

### Manual Testing
1. **Upload Images**: Use the API endpoints to upload different types of images
2. **View Gallery**: Navigate to hospital detail page to see the gallery
3. **Optimization**: Check network tab to verify WebP format and optimized sizes
4. **Responsive**: Test gallery on different screen sizes

## Performance Considerations

### Frontend Optimizations
- **Lazy Loading**: Images load only when visible
- **Responsive Images**: Different sizes for different viewports
- **Progressive Loading**: Thumbnail → Full resolution
- **Caching**: Browser and CDN caching via Cloudinary

### Backend Optimizations
- **Async Processing**: Image uploads are processed asynchronously
- **Error Handling**: Comprehensive error handling for failed uploads
- **Validation**: File type and size validation before upload
- **Context Indexing**: Images are indexed by hospital ID for fast retrieval

## Future Enhancements

### Planned Features
1. **Bulk Upload**: Upload multiple images at once via admin panel
2. **Image Moderation**: Automatic content moderation
3. **Advanced Gallery**: 360° views, video support
4. **Analytics**: Image view tracking and analytics
5. **Mobile App**: React Native integration
6. **Admin Dashboard**: Image management interface

### Database Optimization
Consider creating separate tables for better performance:
```sql
CREATE TABLE hospital_images (
  id SERIAL PRIMARY KEY,
  hospital_id INTEGER REFERENCES hospitals(hospital_id),
  image_url TEXT NOT NULL,
  image_type VARCHAR(50), -- 'logo', 'gallery', 'certificate'
  category VARCHAR(50), -- 'exterior', 'interior', etc.
  public_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check Cloudinary credentials
   - Verify file size limits (default: 10MB)
   - Ensure proper Content-Type headers

2. **Images Don't Load**
   - Verify Cloudinary URLs are accessible
   - Check CORS settings
   - Validate public_id format

3. **Optimization Issues**
   - Confirm WebP support in browser
   - Check transformation parameters
   - Verify Cloudinary plan limits

### Debug Mode
Enable debug logging:
```typescript
// In CloudinaryService
console.log('Uploading to Cloudinary:', {
  folder: options?.folder,
  publicId: options?.public_id,
  transformation: options?.transformation
});
```

## Security Considerations

### File Validation
- File type restrictions (JPEG, PNG, WebP only)
- File size limits (configurable)
- Malware scanning (Cloudinary Add-on available)

### Access Control
- Authentication required for uploads/deletes
- Role-based permissions (admin only for hospital images)
- Rate limiting on upload endpoints

### Data Privacy
- Images stored on Cloudinary CDN
- GDPR compliance through Cloudinary
- Option to delete images permanently

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Cloudinary documentation: https://cloudinary.com/documentation
3. Contact the development team

## Version History

- **v1.0.0**: Initial implementation with basic upload/download
- **v1.1.0**: Added gallery component and image optimization
- **v1.2.0**: Enhanced with certificates and context tagging 
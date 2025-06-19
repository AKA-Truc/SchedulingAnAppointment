import { Injectable } from '@nestjs/common';
import cloudinary from './cloudinary.config';
import { UploadApiResponse } from 'cloudinary';

export interface CloudinaryUploadOptions {
    context?: string;
    public_id?: string;
    folder?: string;
    transformation?: any;
}

@Injectable()
export class CloudinaryService {
    // Generic file upload method
    async uploadFile(
        file: Express.Multer.File,
        options?: CloudinaryUploadOptions,
    ): Promise<UploadApiResponse> {
        const originalName = file.originalname;
        const cleanedName = originalName.replace(/\s+/g, '_').replace(/\.[^/.]+$/, '');
        const finalPublicId = `${Date.now()}_${cleanedName}`;

        const base64File = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

        return cloudinary.uploader.upload(base64File, {
            folder: options?.folder || 'uploads',
            resource_type: 'auto',
            public_id: options?.public_id ?? finalPublicId,
            use_filename: true,
            unique_filename: false,
            access_mode: 'public',
            context: options?.context,
            transformation: options?.transformation,
        });
    }

    // Hospital logo upload with optimization
    async uploadHospitalLogo(
        file: Express.Multer.File,
        hospitalId: number,
    ): Promise<UploadApiResponse> {
        return this.uploadFile(file, {
            folder: 'hospitals/logos',
            public_id: `hospital_${hospitalId}_logo`,
            context: `hospital_id=${hospitalId}|type=logo`,
            transformation: [
                { width: 300, height: 300, crop: 'fill', quality: 'auto' },
                { format: 'webp' }
            ],
        });
    }

    // Hospital gallery images upload
    async uploadHospitalGallery(
        file: Express.Multer.File,
        hospitalId: number,
        imageType: 'exterior' | 'interior' | 'facility' | 'equipment' = 'facility',
    ): Promise<UploadApiResponse> {
        return this.uploadFile(file, {
            folder: `hospitals/gallery/${hospitalId}`,
            public_id: `hospital_${hospitalId}_${imageType}_${Date.now()}`,
            context: `hospital_id=${hospitalId}|type=gallery|category=${imageType}`,
            transformation: [
                { width: 800, height: 600, crop: 'fill', quality: 'auto' },
                { format: 'webp' }
            ],
        });
    }

    // Hospital certificate/achievement images
    async uploadHospitalCertificate(
        file: Express.Multer.File,
        hospitalId: number,
    ): Promise<UploadApiResponse> {
        return this.uploadFile(file, {
            folder: `hospitals/certificates/${hospitalId}`,
            context: `hospital_id=${hospitalId}|type=certificate`,
            transformation: [
                { width: 600, height: 800, crop: 'fit', quality: 'auto' },
                { format: 'webp' }
            ],
        });
    }

    // Doctor certificates (existing functionality)
    async uploadDoctorCertificate(
        file: Express.Multer.File,
        doctorId: number,
    ): Promise<UploadApiResponse> {
        return this.uploadFile(file, {
            folder: 'doctor-certificates',
            public_id: `doctor_${doctorId}_cert_${Date.now()}`,
            context: `doctor_id=${doctorId}|type=certificate`,
        });
    }

    // Delete image by public_id
    async deleteImage(publicId: string): Promise<any> {
        return cloudinary.uploader.destroy(publicId);
    }

    // Get optimized image URL with transformations
    getOptimizedImageUrl(
        publicId: string,
        options?: {
            width?: number;
            height?: number;
            quality?: string;
            format?: string;
            crop?: string;
        }
    ): string {
        return cloudinary.url(publicId, {
            width: options?.width || 'auto',
            height: options?.height || 'auto',
            crop: options?.crop || 'fill',
            quality: options?.quality || 'auto',
            format: options?.format || 'webp',
            secure: true,
        });
    }

    // Get all images by context (e.g., hospital_id=1)
    async getImagesByContext(context: string): Promise<any> {
        return cloudinary.search
            .expression(`context:${context}`)
            .sort_by('created_at', 'desc')
            .max_results(50)
            .execute();
    }

    // Get hospital images (logo + gallery)
    async getHospitalImages(hospitalId: number): Promise<{
        logo?: string;
        gallery: string[];
        certificates: string[];
    }> {
        const results = await this.getImagesByContext(`hospital_id=${hospitalId}`);
        
        const images = {
            logo: undefined as string | undefined,
            gallery: [] as string[],
            certificates: [] as string[],
        };

        results.resources?.forEach((resource: any) => {
            const context = resource.context?.custom || {};
            if (context.type === 'logo') {
                images.logo = resource.secure_url;
            } else if (context.type === 'gallery') {
                images.gallery.push(resource.secure_url);
            } else if (context.type === 'certificate') {
                images.certificates.push(resource.secure_url);
            }
        });

        return images;
    }
}

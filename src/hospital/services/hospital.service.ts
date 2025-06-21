import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHospital, UpdateHospital } from '../DTO';
import { Hospital, Prisma } from '@prisma/client';
import { HospitalFilterDto } from '../DTO/HospitalFilter.dto';


@Injectable()
export class HospitalService {
  constructor(private readonly prisma: PrismaService) { }

  async createHospital(data: CreateHospital) {
    const emailExists = await this.prisma.hospital.findFirst({
      where: { email: data.email },
    });

    if (emailExists) {
      throw new BadRequestException('Email already exists.');
    }

    return this.prisma.hospital.create({ data });
  }

  async getAllHospitals(page = 1, limit = 10, filters?: {
    search?: string;
    type?: string;
    location?: string;
    specialty?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.type) {
      where.type = { contains: filters.type, mode: 'insensitive' };
    }

    if (filters?.location) {
      where.address = { contains: filters.location, mode: 'insensitive' };
    }

    // TODO: Add specialty filtering when Doctor-Hospital-Specialty relationship is set up
    // if (filters?.specialty) {
    //   where.doctors = {
    //     some: {
    //       specialty: {
    //         name: { contains: filters.specialty, mode: 'insensitive' }
    //       }
    //     }
    //   };
    // }

    const [hospitals, total] = await Promise.all([
      this.prisma.hospital.findMany({
        skip,
        take: limit,
        where,
        include: {
          doctors: {
            include: {
              specialty: true,
            },
          },
          achievements: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.hospital.count({ where }),
    ]);

    // Add computed fields for frontend
    const enrichedHospitals = hospitals.map(hospital => ({
      ...hospital,
      totalDoctors: hospital.doctors.length,
      totalBeds: hospital.totalBeds || null,
      totalNurses: hospital.totalNurses || null,
      rating: hospital.rating || 4.0,
      reviews: hospital.reviews || 0,
      verified: hospital.verified || true,
      specialties: hospital.doctors.map(d => d.specialty?.name).filter(Boolean),
    }));

    return {
      data: enrichedHospitals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getHospitalById(id: number) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { hospitalId: id },
      include: {
        doctors: true,
        achievements: true,
      },
    });

    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }

    return hospital;
  }

  async filterHospital(
    filter: HospitalFilterDto,
    skip: number = 0,
    take: number = 10
  ): Promise<Hospital[]> {
    return this.prisma.hospital.findMany({
      where: {
        ...(filter.type && { type: filter.type }),
        ...(filter.name && { name: { contains: filter.name, mode: 'insensitive' } }),
      },
      skip,
      take,
      orderBy: {
        name: 'asc', // Sắp xếp theo tên bệnh viện cho dễ đọc (có thể thay đổi)
      },
    });
  }


  async searchHospital(params: {
    skip?: number;
    take?: number;
    where?: Prisma.HospitalWhereInput;
  }): Promise<Hospital[]> {
    const { skip, take, where } = params;
    return this.prisma.hospital.findMany({
      skip,
      take,
      where,
    });
  }

  async updateHospital(id: number, dto: UpdateHospital) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { hospitalId: id },
    });

    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }

    if (dto.email && dto.email !== hospital.email) {
      const emailExists = await this.prisma.hospital.findFirst({
        where: { email: dto.email },
      });
      if (emailExists) {
        throw new BadRequestException('Email already exists.');
      }
    }

    return this.prisma.hospital.update({
      where: { hospitalId: id },
      data: dto,
    });
  }

  async deleteHospital(id: number) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { hospitalId: id },
    });

    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }

    const doctorsCount = await this.prisma.doctor.count({
      where: { hospitalId: id },
    });

    if (doctorsCount > 0) {
      throw new BadRequestException(
        'Cannot delete hospital with existing doctors.',
      );
    }

    return this.prisma.hospital.delete({
      where: { hospitalId: id },
    });
  }

  // New methods for frontend requirements
  async searchByLocation(latitude: number, longitude: number, radius: number, limit: number = 20) {
    // Simple radius search - in production you might want to use PostGIS or similar
    // This is a basic implementation using coordinate bounds
    const latRange = radius / 111; // Approximate km to degree conversion
    const lngRange = radius / (111 * Math.cos(latitude * Math.PI / 180));

    return this.prisma.hospital.findMany({
      where: {
        AND: [
          { latitude: { gte: latitude - latRange, lte: latitude + latRange } },
          { longitude: { gte: longitude - lngRange, lte: longitude + lngRange } },
        ],
      },
      take: limit,
      include: {
        doctors: {
          include: {
            specialty: true,
          },
        },
        achievements: true,
      },
    });
  }

  async getHospitalsBySpecialty(specialtyId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [hospitals, total] = await Promise.all([
      this.prisma.hospital.findMany({
        where: {
          doctors: {
            some: {
              specialtyId: specialtyId,
            },
          },
        },
        skip,
        take: limit,
        include: {
          doctors: {
            include: {
              specialty: true,
            },
          },
          achievements: true,
        },
      }),
      this.prisma.hospital.count({
        where: {
          doctors: {
            some: {
              specialtyId: specialtyId,
            },
          },
        },
      }),
    ]);

    return {
      data: hospitals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getNearbyHospitals(latitude: number, longitude: number, limit: number = 10) {
    // Get hospitals within 50km radius by default
    return this.searchByLocation(latitude, longitude, 50, limit);
  }

  async getFeaturedHospitals(limit: number = 6) {
    return this.prisma.hospital.findMany({
      take: limit,
      where: {
        // You can add criteria for featured hospitals (e.g., verified, high rating, etc.)
        verified: true,
      },
      include: {
        doctors: {
          include: {
            specialty: true,
          },
        },
        achievements: true,
      },
      orderBy: [
        { rating: 'desc' },
        { reviews: 'desc' },
      ],
    });
  }

  async getHospitalStatistics() {
    const [totalHospitals, publicHospitals, privateHospitals] = await Promise.all([
      this.prisma.hospital.count(),
      this.prisma.hospital.count({ where: { type: { contains: 'công', mode: 'insensitive' } } }),
      this.prisma.hospital.count({ where: { type: { contains: 'tư', mode: 'insensitive' } } }),
    ]);

    // Get average rating manually since the field might not exist in schema
    const hospitals = await this.prisma.hospital.findMany({
      select: { rating: true },
      where: { rating: { not: null } },
    });

    const averageRating = hospitals.length > 0 
      ? hospitals.reduce((sum: number, h: any) => sum + (h.rating || 0), 0) / hospitals.length 
      : 0;

    return {
      totalHospitals,
      publicHospitals,
      privateHospitals,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    };
  }

  async updateCoordinates(id: number, latitude: number, longitude: number) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { hospitalId: id },
    });

    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }

    return this.prisma.hospital.update({
      where: { hospitalId: id },
      data: {
        latitude,
        longitude,
      },
    });
  }

  // Image-related methods for Cloudinary integration
  async addGalleryImages(hospitalId: number, imageUrls: string[]) {
    // For now, we'll store gallery images as a JSON array in a new field
    // In a real application, you might want to create a separate HospitalGallery table
    const hospital = await this.getHospitalById(hospitalId);
    
    const existingGallery = hospital.gallery ? JSON.parse(hospital.gallery as string) : [];
    const updatedGallery = [...existingGallery, ...imageUrls];

    return this.prisma.hospital.update({
      where: { hospitalId },
      data: { 
        gallery: JSON.stringify(updatedGallery),
      },
    });
  }

  async addCertificate(hospitalId: number, certificateData: {
    title: string;
    description?: string;
    imageUrl: string;
    publicId: string;
  }) {
    // For now, we'll store certificates as JSON in the database
    // In a real application, you might want to create a separate HospitalCertificates table
    const hospital = await this.getHospitalById(hospitalId);
    
    const existingCertificates = hospital.certificates ? JSON.parse(hospital.certificates as string) : [];
    const newCertificate = {
      id: Date.now().toString(),
      ...certificateData,
      createdAt: new Date().toISOString(),
    };
    
    const updatedCertificates = [...existingCertificates, newCertificate];

    return this.prisma.hospital.update({
      where: { hospitalId },
      data: { 
        certificates: JSON.stringify(updatedCertificates),
      },
    });
  }

  async removeGalleryImage(hospitalId: number, imageUrl: string) {
    const hospital = await this.getHospitalById(hospitalId);
    
    const existingGallery = hospital.gallery ? JSON.parse(hospital.gallery as string) : [];
    const updatedGallery = existingGallery.filter((url: string) => url !== imageUrl);

    return this.prisma.hospital.update({
      where: { hospitalId },
      data: { 
        gallery: JSON.stringify(updatedGallery),
      },
    });
  }

  async removeCertificate(hospitalId: number, certificateId: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { hospitalId },
    });

    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${hospitalId} not found`);
    }

    // Assuming certificates are stored as JSON string
    // This implementation depends on your certificate storage structure
    // You might need to adjust based on your actual database schema
    return hospital;
  }

  // New method for creating hospital with media
  async createHospitalWithMedia(
    hospitalData: CreateHospital,
    logoUrl?: string,
    galleryUrls?: string[]
  ) {
    const emailExists = await this.prisma.hospital.findFirst({
      where: { email: hospitalData.email },
    });

    if (emailExists) {
      throw new BadRequestException('Email already exists.');
    }

    const createData: any = {
      ...hospitalData,
      ...(logoUrl && { logo: logoUrl }),
      ...(galleryUrls && galleryUrls.length > 0 && { 
        gallery: JSON.stringify(galleryUrls) 
      }),
    };

    return this.prisma.hospital.create({ 
      data: createData,
      include: {
        doctors: true,
        achievements: true,
      },
    });
  }

  // New method for updating hospital with media
  async updateHospitalWithMedia(
    id: number,
    hospitalData: UpdateHospital,
    logoUrl?: string,
    galleryUrls?: string[]
  ) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { hospitalId: id },
    });

    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }

    if (hospitalData.email && hospitalData.email !== hospital.email) {
      const emailExists = await this.prisma.hospital.findFirst({
        where: { email: hospitalData.email },
      });
      if (emailExists) {
        throw new BadRequestException('Email already exists.');
      }
    }

    const updateData: any = {
      ...hospitalData,
      ...(logoUrl && { logo: logoUrl }),
    };

    // Handle gallery images - append to existing or replace
    if (galleryUrls && galleryUrls.length > 0) {
      const existingGallery = hospital.gallery ? JSON.parse(hospital.gallery) : [];
      const newGallery = [...existingGallery, ...galleryUrls];
      updateData.gallery = JSON.stringify(newGallery);
    }

    return this.prisma.hospital.update({
      where: { hospitalId: id },
      data: updateData,
      include: {
        doctors: true,
        achievements: true,
      },
    });
  }
}

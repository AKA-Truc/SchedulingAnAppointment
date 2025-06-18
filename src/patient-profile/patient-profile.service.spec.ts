import { Test, TestingModule } from '@nestjs/testing';
import { PatientProfileService } from './patient-profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PatientProfileService', () => {
  let service: PatientProfileService;
  let prismaService: PrismaService;

  const mockProfile = {
    profileId: 1,
    userId: 1,
    gender: 'male',
    dateOfBirth: new Date('1990-01-01'),
    address: '123 Test St',
    insurance: 'Test Insurance',
    allergies: 'None',
    chronicDiseases: 'None',
    obstetricHistory: 'None',
    surgicalHistory: 'None',
    familyHistory: 'None',
    socialHistory: 'None',
    medicationHistory: 'None',
    user: {
      id: 1,
      email: 'test@test.com',
      name: 'Test User'
    }
  };

  const mockPrismaService = {
    patientProfile: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientProfileService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PatientProfileService>(PatientProfileService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      userId: 1,
      gender: 'male',
      dateOfBirth: new Date('1990-01-01'),
      address: '123 Test St',
      insurance: 'Test Insurance'
    };

    it('should create a patient profile successfully', async () => {
      mockPrismaService.patientProfile.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.patientProfile.create.mockResolvedValueOnce(mockProfile);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProfile);
      expect(mockPrismaService.patientProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: createDto.userId,
          gender: createDto.gender,
          dateOfBirth: createDto.dateOfBirth,
        }),
        include: { user: true },
      });
    });

    it('should throw BadRequestException if profile already exists', async () => {
      mockPrismaService.patientProfile.findUnique.mockResolvedValueOnce(mockProfile);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated patient profiles', async () => {
      const mockProfiles = [mockProfile];
      const totalProfiles = 1;
      const page = 1;
      const limit = 10;

      mockPrismaService.patientProfile.findMany.mockResolvedValueOnce(mockProfiles);
      mockPrismaService.patientProfile.count.mockResolvedValueOnce(totalProfiles);

      const result = await service.findAll(page, limit);

      expect(result).toEqual({
        data: mockProfiles,
        meta: {
          total: totalProfiles,
          page,
          limit,
          totalPages: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a patient profile by ID', async () => {
      mockPrismaService.patientProfile.findUnique.mockResolvedValueOnce(mockProfile);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockPrismaService.patientProfile.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      gender: 'female',
      insurance: 'Updated Insurance',
    };

    it('should update a patient profile successfully', async () => {
      mockPrismaService.patientProfile.findUnique.mockResolvedValueOnce(mockProfile);
      mockPrismaService.patientProfile.update.mockResolvedValueOnce({
        ...mockProfile,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(result).toEqual({
        ...mockProfile,
        ...updateDto,
      });
      expect(mockPrismaService.patientProfile.update).toHaveBeenCalledWith({
        where: { profileId: 1 },
        data: expect.objectContaining(updateDto),
      });
    });

    it('should throw NotFoundException if profile to update not found', async () => {
      mockPrismaService.patientProfile.findUnique.mockResolvedValueOnce(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PatientProfileController } from './patient-profile.controller';
import { PatientProfileService } from './patient-profile.service';
import { BadRequestException } from '@nestjs/common';
import * as xlsx from 'xlsx';

jest.mock('xlsx');

describe('PatientProfileController', () => {
  let controller: PatientProfileController;
  let patientProfileService: PatientProfileService;

  const mockPatientProfile = {
    profileId: 1,
    userId: 1,
    gender: 'male',
    dateOfBirth: new Date('1990-01-01'),
    address: '123 Test St',
    insurance: 'Test Insurance',
    user: {
      id: 1,
      email: 'test@test.com',
      name: 'Test User'
    }
  };

  const mockPatientProfileService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getHealthAnalytics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientProfileController],
      providers: [
        {
          provide: PatientProfileService,
          useValue: mockPatientProfileService,
        },
      ],
    }).compile();

    controller = module.get<PatientProfileController>(PatientProfileController);
    patientProfileService = module.get<PatientProfileService>(PatientProfileService);
  });

  describe('importPatientProfiles', () => {
    const mockFile: Express.Multer.File = {
      buffer: Buffer.from('test'),
      fieldname: 'file',
      originalname: 'test.xlsx',
      encoding: '7bit',
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 100,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    const mockXlsxData = [
      {
        'User ID': 1,
        'Gender': 'male',
        'Date of Birth': '1990-01-01',
        'Address': '123 Test St',
        'Insurance': 'Test Insurance'
      }
    ];

    it('should successfully import patient profiles', async () => {
      (xlsx.read as jest.Mock).mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      });
      (xlsx.utils.sheet_to_json as jest.Mock).mockReturnValue(mockXlsxData);
      mockPatientProfileService.create.mockResolvedValueOnce(mockPatientProfile);

      const result = await controller.importPatientProfiles(mockFile);

      expect(result).toEqual(expect.objectContaining({
        total: 1,
        imported: 1,
        failed: 0,
        results: expect.arrayContaining([
          expect.objectContaining({
            success: true,
            userId: 1
          })
        ])
      }));
    });

    it('should handle validation errors during import', async () => {
      const invalidData = [{
        'User ID': 'invalid', // Should be a number
        'Gender': 'invalid',
        'Date of Birth': 'invalid-date'
      }];

      (xlsx.read as jest.Mock).mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      });
      (xlsx.utils.sheet_to_json as jest.Mock).mockReturnValue(invalidData);

      const result = await controller.importPatientProfiles(mockFile);

      expect(result).toEqual(expect.objectContaining({
        total: 1,
        imported: 0,
        failed: 1,
        results: expect.arrayContaining([
          expect.objectContaining({
            success: false,
            error: expect.any(String)
          })
        ])
      }));
    });

    it('should handle service errors during import', async () => {
      (xlsx.read as jest.Mock).mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      });
      (xlsx.utils.sheet_to_json as jest.Mock).mockReturnValue(mockXlsxData);
      mockPatientProfileService.create.mockRejectedValueOnce(new Error('Database error'));

      const result = await controller.importPatientProfiles(mockFile);

      expect(result).toEqual(expect.objectContaining({
        total: 1,
        imported: 0,
        failed: 1,
        results: expect.arrayContaining([
          expect.objectContaining({
            success: false,
            error: expect.any(String)
          })
        ])
      }));
    });
  });
  describe('getHealthAnalytics', () => {
    const mockAnalytics = {
      visitStats: {
        totalVisits: 10,
        visitsByMonth: [],
        averageVisitsPerMonth: 2,
        lastVisitDate: new Date()
      },
      costAnalysis: {
        totalCost: 1000,
        costByMonth: [],
        averageCostPerVisit: 100,
        costByPaymentMethod: []
      },
      medicalHistory: {
        appointments: []
      }
    };

    it('should return health analytics for a patient', async () => {
      mockPatientProfileService.getHealthAnalytics.mockResolvedValueOnce(mockAnalytics);

      const result = await controller.getHealthAnalytics(1);

      expect(result).toEqual(mockAnalytics);
      expect(mockPatientProfileService.getHealthAnalytics).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException for invalid patient ID', async () => {
      mockPatientProfileService.getHealthAnalytics.mockRejectedValueOnce(
        new BadRequestException('Patient not found')
      );

      await expect(controller.getHealthAnalytics(999)).rejects.toThrow(BadRequestException);
    });
  });
});

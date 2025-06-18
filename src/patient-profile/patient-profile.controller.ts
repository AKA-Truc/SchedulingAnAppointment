// src/patient-profile/patient-profile.controller.ts
import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Res,
  BadRequestException,
  Param,
  ParseIntPipe,
  Body,
  Delete,
  Query,
  Put,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as xlsx from 'xlsx';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PatientProfileService } from './patient-profile.service';
import { PatientImportRowDto } from './DTO/PatientImportRow.dto';
import { CreatePatientProfile } from './DTO/CreatePatientProfile.dto';
import { UpdatePatientProfile } from './DTO/UpdatePatientProfile.dto';

@ApiTags('Patient Profile')
@Controller('patient-profile')
export class PatientProfileController {
  constructor(
    private readonly patientProfileService: PatientProfileService,
  ) {}
  @Post('import')
  @ApiOperation({
    summary: 'Bulk import patient profiles from Excel/CSV',
    description: 'Import multiple patient profiles at once using an Excel or CSV file.'
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'An Excel (.xlsx/.xls) or CSV file containing patient profile data',
        },
      },
      required: ['file']
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Patient profiles successfully imported',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total number of rows processed' },
        imported: { type: 'number', description: 'Number of profiles successfully imported' },
        failed: { type: 'number', description: 'Number of profiles that failed to import' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              userId: { type: 'number', nullable: true },
              error: { type: 'string', nullable: true }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid file format or data' })
  
  async importPatientProfiles(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{
    total: number;
    imported: number;
    failed: number;
    results: Array<{ success: boolean; userId?: number; error?: string }>;
  }> {
    // Parse workbook
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[];

    const results: Array<{ success: boolean; userId?: number; error?: string }> = [];

    for (const raw of rawRows) {
      // 1) Map to DTO
      const dto = plainToInstance(PatientImportRowDto, {
        userId: raw['User ID'],
        gender: raw['Gender'],
        dateOfBirth: raw['Date of Birth'],
        address: raw['Address'],
        insurance: raw['Insurance'],
        allergies: raw['Allergies'],
        chronicDiseases: raw['Chronic Diseases'],
        obstetricHistory: raw['Obstetric History'],
        surgicalHistory: raw['Surgical History'],
        familyHistory: raw['Family History'],
        socialHistory: raw['Social History'],
        medicationHistory: raw['Medication History'],
      });

      // 2) Validate
      const errors = await validate(dto);
      if (errors.length) {
        const errMsgs = errors
          .map(e => Object.values(e.constraints || {}).join(', '))
          .join('; ');
        results.push({
          success: false,
          userId: dto.userId,
          error: `Validation failed: ${errMsgs}`,
        });
        continue;
      }

      // 3) Save via service
      try {
        const created = await this.patientProfileService.create({
          userId: dto.userId,
          gender: dto.gender,
          dateOfBirth: new Date(dto.dateOfBirth),
          address: dto.address,
          insurance: dto.insurance,
          allergies: dto.allergies,
          chronicDiseases: dto.chronicDiseases,
          obstetricHistory: dto.obstetricHistory,
          surgicalHistory: dto.surgicalHistory,
          familyHistory: dto.familyHistory,
          socialHistory: dto.socialHistory,
          medicationHistory: dto.medicationHistory,
        });
        results.push({ success: true, userId: created.userId });
      } catch (err: any) {
        results.push({
          success: false,
          userId: dto.userId,
          error: err.message || 'Unknown error',
        });
      }
    }

    return {
      total: rawRows.length,
      imported: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }
  @Get('export')
  @ApiOperation({
    summary: 'Export patient profiles to Excel',
    description: 'Exports all patient profiles to an Excel file with detailed information'
  })
  @ApiResponse({
    status: 200,
    description: 'Excel file containing patient profiles',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error during file generation' })
  async exportPatientProfiles(@Res() res: Response): Promise<void> {
    // Fetch up to 1000 profiles
    const { data: profiles } = await this.patientProfileService.findAll(1, 1000);

    // Map to sheet rows
    const sheetData = profiles.map(p => ({
      'User ID': p.userId,
      'Gender': p.gender,
      'Date of Birth': p.dateOfBirth,
      'Address': p.address,
      'Insurance': p.insurance,
      'Allergies': p.allergies,
      'Chronic Diseases': p.chronicDiseases,
      'Obstetric History': p.obstetricHistory,
      'Surgical History': p.surgicalHistory,
      'Family History': p.familyHistory,
      'Social History': p.socialHistory,
      'Medication History': p.medicationHistory,
    }));

    const worksheet = xlsx.utils.json_to_sheet(sheetData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Patient Profiles');

    const buffer = xlsx.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="patient-profiles.xlsx"',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }

  @Get(':id/health-analytics')
  @ApiOperation({
    summary: 'Get patient health analytics',
    description: 'Retrieves comprehensive health analytics including visits, costs, and medical history for a patient'
  })
  @ApiResponse({
    status: 200,
    description: 'The health analytics data has been successfully retrieved',
    schema: {
      type: 'object',
      properties: {
        visitStats: {
          type: 'object',
          properties: {
            totalVisits: { type: 'number' },
            visitsByMonth: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'string' },
                  count: { type: 'number' }
                }
              }
            },
            averageVisitsPerMonth: { type: 'number' },
            lastVisitDate: { type: 'string', format: 'date-time' }
          }
        },
        costAnalysis: {
          type: 'object',
          properties: {
            totalCost: { type: 'number' },
            costByMonth: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'string' },
                  amount: { type: 'number' }
                }
              }
            },
            averageCostPerVisit: { type: 'number' },
            costByPaymentMethod: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  method: { type: 'string' },
                  amount: { type: 'number' }
                }
              }
            }
          }
        },
        medicalHistory: {
          type: 'object',
          properties: {
            appointments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string', format: 'date-time' },
                  doctorName: { type: 'string' },
                  hospitalName: { type: 'string' },
                  diagnosis: { type: 'string' },
                  prescriptions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        medicineName: { type: 'string' },
                        dosage: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }      }
    }
  })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  @ApiParam({ name: 'id', description: 'Patient profile ID', type: 'number' })
  async getHealthAnalytics(@Param('id', ParseIntPipe) id: number) {
    return this.patientProfileService.getHealthAnalytics(id);
  }

  @Get(':id/visit-stats')
  @ApiOperation({
    summary: 'Get patient visit statistics',
    description: 'Retrieves statistics about patient visits including total visits, monthly distribution, and trends'
  })
  @ApiResponse({
    status: 200,
    description: 'Visit statistics successfully retrieved',
    schema: {
      type: 'object',
      properties: {
        totalVisits: { type: 'number' },
        visitsByMonth: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string' },
              count: { type: 'number' }
            }
          }
        },
        averageVisitsPerMonth: { type: 'number' },
        lastVisitDate: { type: 'string', format: 'date-time' }      }
    }
  })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  @ApiParam({ name: 'id', description: 'Patient profile ID', type: 'number' })
  async getVisitStats(@Param('id', ParseIntPipe) id: number) {
    const analytics = await this.patientProfileService.getHealthAnalytics(id);
    return analytics.visitStats;
  }

  @Get(':id/cost-analysis')
  @ApiOperation({
    summary: 'Get patient cost analysis',
    description: 'Analyzes patient healthcare costs including total costs, monthly spending, and payment methods'
  })
  @ApiResponse({
    status: 200,
    description: 'Cost analysis successfully retrieved',
    schema: {
      type: 'object',
      properties: {
        totalCost: { type: 'number' },
        costByMonth: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string' },
              amount: { type: 'number' }
            }
          }
        },
        averageCostPerVisit: { type: 'number' },
        costByPaymentMethod: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              method: { type: 'string' },
              amount: { type: 'number' }
            }
          }
        }      }
    }
  })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  @ApiParam({ name: 'id', description: 'Patient profile ID', type: 'number' })
  async getCostAnalysis(@Param('id', ParseIntPipe) id: number) {
    const analytics = await this.patientProfileService.getHealthAnalytics(id);
    return analytics.costAnalysis;
  }

  @Get(':id/medical-history')
  @ApiOperation({
    summary: 'Get patient medical history timeline',
    description: 'Retrieves chronological medical history including appointments, diagnoses, and prescriptions'
  })
  @ApiResponse({
    status: 200,
    description: 'Medical history successfully retrieved',
    schema: {
      type: 'object',
      properties: {
        appointments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date-time' },
              doctorName: { type: 'string' },
              hospitalName: { type: 'string' },
              diagnosis: { type: 'string' },
              prescriptions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    medicineName: { type: 'string' },
                    dosage: { type: 'string' }
                  }
                }
              }
            }
          }
        }      }
    }
  })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  @ApiParam({ name: 'id', description: 'Patient profile ID', type: 'number' })
  async getMedicalHistory(@Param('id', ParseIntPipe) id: number) {
    const analytics = await this.patientProfileService.getHealthAnalytics(id);
    return analytics.medicalHistory;
  }
  @Post()
  @ApiOperation({
    summary: 'Create a new patient profile',
    description: 'Creates a new patient profile with the provided data',
  })
  @ApiResponse({
    status: 201,
    description: 'Patient profile successfully created',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or profile already exists' })
  async create(@Body() createDto: CreatePatientProfile) {
    return this.patientProfileService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all patient profiles',
    description: 'Retrieves a paginated list of all patient profiles'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of patient profiles'
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.patientProfileService.findAll(page, limit);
  }
  @Get(':id')
  @ApiOperation({
    summary: 'Get a patient profile by ID',
    description: 'Retrieves a patient profile by their unique identifier',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Patient profile found',
  })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patientProfileService.findOne(id);
  }
  @Put(':id')
  @ApiOperation({
    summary: 'Update a patient profile',
    description: 'Updates an existing patient profile with the provided data',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Patient profile successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePatientProfile,
  ) {
    return this.patientProfileService.update(id, updateDto);
  }
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a patient profile',
    description: 'Deletes an existing patient profile',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Patient profile successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Patient profile not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientProfileService.remove(id);
  }
}

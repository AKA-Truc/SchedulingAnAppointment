// src/patient-profile/patient-profile.controller.ts
import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as xlsx from 'xlsx';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PatientProfileService } from './patient-profile.service';
import { PatientImportRowDto } from './DTO/PatientImportRow.dto';

@ApiTags('Patient Profile')
@Controller('patient-profile')
export class PatientProfileController {
  constructor(
    private readonly patientProfileService: PatientProfileService,
  ) {}

  @Post('import')
  @ApiOperation({ summary: 'Bulk import patient profiles from Excel/CSV' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'An Excel (.xlsx/.xls) or CSV file',
        },
      },
    },
  })
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
  @ApiOperation({ summary: 'Export patient profiles to Excel' })
  async exportPatientProfiles(@Res() res: Response): Promise<void> {
    // Fetch up to 1000 profiles
    const { data: profiles } = await this.patientProfileService.findAll(1, 1000);

    // Map to sheet rows
    const sheetData = profiles.map(p => ({
      'User ID': p.userId,
      'Insurance': p.insurance,
      'Allergies': p.allergies,
      'Chronic Diseases': p.chronicDiseases,
      'Obstetric History': p.obstetricHistory,
      'Surgical History': p.surgicalHistory,
      'Family History': p.familyHistory,
      'Social History': p.socialHistory,
      'Medication History': p.medicationHistory,
      // Export các trường chung nếu có trong user
      ...(p.user && {
        'Gender': p.user.gender ?? '',
        'Date of Birth': p.user.dateOfBirth ?? '',
        'Address': p.user.address ?? '',
      })
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
}

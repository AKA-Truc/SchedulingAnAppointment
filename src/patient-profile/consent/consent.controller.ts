import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard as JwtAuthGuard } from '../../auth/guard/auth.guard';
import { User } from '../../auth/decorators/user.decorator';
import { ConsentService } from './consent.service';
import { CreateConsentDto } from './dto/create-consent.dto';

@ApiTags('patient-consent')
@Controller('patient/consent')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new consent record' })
  @ApiResponse({ status: 201, description: 'Consent record created successfully.' })
  async createConsent(@User('userId') userId: number, @Body() createConsentDto: CreateConsentDto) {
    return this.consentService.createConsent(userId, createConsentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all consent records for the patient' })
  async getConsents(@User('userId') userId: number) {
    return this.consentService.getPatientConsents(userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active consent records for the patient' })
  async getActiveConsents(@User('userId') userId: number) {
    return this.consentService.getActiveConsents(userId);
  }

  @Put(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw a consent' })
  async withdrawConsent(@Param('id') id: string) {
    return this.consentService.updateConsentStatus(+id, 'WITHDRAWN');
  }

  @Put(':id/deny')
  @ApiOperation({ summary: 'Deny a consent' })
  async denyConsent(@Param('id') id: string) {
    return this.consentService.updateConsentStatus(+id, 'DENIED');
  }
}

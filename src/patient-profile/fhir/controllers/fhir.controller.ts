import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { FHIRService } from '../services/fhir.service';
import { FHIRPatient, FHIRObservation, FHIRCondition } from '../interfaces/fhir-resources.interface';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('FHIR')
@Controller('fhir')
export class FHIRController {
    constructor(private readonly fhirService: FHIRService) { }

    // Patient Resource Endpoints
    @Get('Patient/:id')
    @ApiOperation({ summary: 'Get a patient by ID' })
    @ApiResponse({ status: 200, description: 'Patient resource', type: Object })
    async getPatient(@Param('id') id: string): Promise<FHIRPatient> {
        return this.fhirService.getPatient(id);
    }

    @Get('Patient')
    @ApiOperation({ summary: 'Search patients' })
    @ApiResponse({ status: 200, description: 'Array of patient resources', type: [Object] })
    async searchPatients(
        @Query('name') name?: string,
        @Query('birthDate') birthDate?: string,
        @Query('gender') gender?: string,
    ): Promise<FHIRPatient[]> {
        return this.fhirService.searchPatients({ name, birthDate, gender });
    }

    // Observation Resource Endpoints
    @Post('Observation')
    @ApiOperation({ summary: 'Create an observation' })
    @ApiResponse({ status: 201, description: 'Created observation resource', type: Object })
    async createObservation(@Body() observation: FHIRObservation): Promise<FHIRObservation> {
        return this.fhirService.createObservation(observation);
    }

    @Get('Observation/:id')
    @ApiOperation({ summary: 'Get an observation by ID' })
    @ApiResponse({ status: 200, description: 'Observation resource', type: Object })
    async getObservation(@Param('id') id: string): Promise<FHIRObservation> {
        return this.fhirService.getObservation(id);
    }

    @Get('Observation')
    @ApiOperation({ summary: 'Search observations for a patient' })
    @ApiResponse({ status: 200, description: 'Array of observation resources', type: [Object] })
    async searchObservations(@Query('patient') patientId: string): Promise<FHIRObservation[]> {
        return this.fhirService.searchObservations(patientId);
    }

    // Condition Resource Endpoints
    @Post('Condition')
    @ApiOperation({ summary: 'Create a condition' })
    @ApiResponse({ status: 201, description: 'Created condition resource', type: Object })
    async createCondition(@Body() condition: FHIRCondition): Promise<FHIRCondition> {
        return this.fhirService.createCondition(condition);
    }

    @Get('Condition/:id')
    @ApiOperation({ summary: 'Get a condition by ID' })
    @ApiResponse({ status: 200, description: 'Condition resource', type: Object })
    async getCondition(@Param('id') id: string): Promise<FHIRCondition> {
        return this.fhirService.getCondition(id);
    }

    @Get('Condition')
    @ApiOperation({ summary: 'Search conditions for a patient' })
    @ApiResponse({ status: 200, description: 'Array of condition resources', type: [Object] })
    async searchConditions(@Query('patient') patientId: string): Promise<FHIRCondition[]> {
        return this.fhirService.searchConditions(patientId);
    }

    // Sync Endpoint
    @Post('sync/:patientId')
    @ApiOperation({ summary: 'Sync patient data with external EHR/HIS' })
    @ApiResponse({ status: 200, description: 'Patient data synchronized successfully' })
    async syncPatient(@Param('patientId') patientId: string): Promise<void> {
        return this.fhirService.syncPatientWithExternalSystem(patientId);
    }
}

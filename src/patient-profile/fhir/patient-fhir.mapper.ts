import { Injectable } from '@nestjs/common';
import { PatientProfile } from '@prisma/client';
import { FHIRPatient } from './interfaces/fhir-resources.interface';

@Injectable()
export class PatientFHIRMapper {
  mapToFHIR(profile: any): FHIRPatient {
    const user = profile.user || {};
    const patient: FHIRPatient = {
      resourceType: 'Patient',
      id: profile.profileId.toString(),
      active: true,
      gender: this.mapGender(user.gender),
      birthDate: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : undefined,      // Note: Add name mapping once we have name fields in PatientProfile
      address: user.address ? [{ use: 'home', text: user.address }] : undefined,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/patient-chronicles',
          extension: [
            {
              url: 'allergies',
              valueString: profile.allergies ?? undefined
            },
            {
              url: 'chronicDiseases', 
              valueString: profile.chronicDiseases ?? undefined
            },
            {
              url: 'obstetricHistory',
              valueString: profile.obstetricHistory ?? undefined
            }
          ]
        }
      ]
    };
    return patient;
  }
  private mapGender(gender: string): 'male' | 'female' | 'other' | 'unknown' {
    const genderMap: Record<string, 'male' | 'female' | 'other' | 'unknown'> = {
      'Male': 'male',
      'Female': 'female',
      'Other': 'other',
      'Unknown': 'unknown'
    };
    return genderMap[gender] || 'unknown';
  }
}

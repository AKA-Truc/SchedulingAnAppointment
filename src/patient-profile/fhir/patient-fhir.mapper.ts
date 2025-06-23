import { Injectable } from '@nestjs/common';
import { PatientProfile } from '@prisma/client';
import { FHIRPatient } from './interfaces/fhir-resources.interface';

@Injectable()
export class PatientFHIRMapper {
  mapToFHIR(profile: PatientProfile): FHIRPatient {
    const patient: FHIRPatient = {
      resourceType: 'Patient',
      id: profile.profileId.toString(),
      active: true,
      gender: this.mapGender(profile.gender),
      birthDate: profile.dateOfBirth.toISOString().split('T')[0],      // Note: Add name mapping once we have name fields in PatientProfile
      address: [{
        use: 'home',
        text: profile.address
      }],
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/patient-chronicles',
          extension: [
            {
              url: 'allergies',
              valueString: profile.allergies
            },
            {
              url: 'chronicDiseases', 
              valueString: profile.chronicDiseases
            },
            {
              url: 'obstetricHistory',
              valueString: profile.obstetricHistory
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

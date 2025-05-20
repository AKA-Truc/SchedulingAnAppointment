import { Test, TestingModule } from '@nestjs/testing';
import { PatientProfileService } from './patient-profile.service';

describe('PatientProfileService', () => {
  let service: PatientProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientProfileService],
    }).compile();

    service = module.get<PatientProfileService>(PatientProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

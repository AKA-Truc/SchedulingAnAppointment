import { Test, TestingModule } from '@nestjs/testing';
import { PatientProfileController } from './patient-profile.controller';

describe('PatientProfileController', () => {
  let controller: PatientProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientProfileController],
    }).compile();

    controller = module.get<PatientProfileController>(PatientProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

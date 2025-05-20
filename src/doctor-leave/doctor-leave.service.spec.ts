import { Test, TestingModule } from '@nestjs/testing';
import { DoctorLeaveService } from './doctor-leave.service';

describe('DoctorLeaveService', () => {
  let service: DoctorLeaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoctorLeaveService],
    }).compile();

    service = module.get<DoctorLeaveService>(DoctorLeaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

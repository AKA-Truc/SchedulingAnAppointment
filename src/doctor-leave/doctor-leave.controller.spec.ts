import { Test, TestingModule } from '@nestjs/testing';
import { DoctorLeaveController } from './doctor-leave.controller';

describe('DoctorLeaveController', () => {
  let controller: DoctorLeaveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorLeaveController],
    }).compile();

    controller = module.get<DoctorLeaveController>(DoctorLeaveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

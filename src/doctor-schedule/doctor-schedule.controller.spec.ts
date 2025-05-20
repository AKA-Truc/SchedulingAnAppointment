import { Test, TestingModule } from '@nestjs/testing';
import { DoctorScheduleController } from './doctor-schedule.controller';

describe('DoctorScheduleController', () => {
  let controller: DoctorScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorScheduleController],
    }).compile();

    controller = module.get<DoctorScheduleController>(DoctorScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

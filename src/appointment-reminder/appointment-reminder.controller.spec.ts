import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentReminderController } from './appointment-reminder.controller';

describe('AppointmentReminderController', () => {
  let controller: AppointmentReminderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentReminderController],
    }).compile();

    controller = module.get<AppointmentReminderController>(AppointmentReminderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

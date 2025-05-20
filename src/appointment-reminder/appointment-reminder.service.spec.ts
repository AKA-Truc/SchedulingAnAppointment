import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentReminderService } from './appointment-reminder.service';

describe('AppointmentReminderService', () => {
  let service: AppointmentReminderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentReminderService],
    }).compile();

    service = module.get<AppointmentReminderService>(AppointmentReminderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

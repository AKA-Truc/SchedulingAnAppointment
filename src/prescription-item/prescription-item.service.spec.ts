import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionItemService } from './prescription-item.service';

describe('PrescriptionItemService', () => {
  let service: PrescriptionItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrescriptionItemService],
    }).compile();

    service = module.get<PrescriptionItemService>(PrescriptionItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

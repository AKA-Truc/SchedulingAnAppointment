import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionItemController } from './prescription-item.controller';

describe('PrescriptionItemController', () => {
  let controller: PrescriptionItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrescriptionItemController],
    }).compile();

    controller = module.get<PrescriptionItemController>(PrescriptionItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ParkingOfferController } from './parking-offer.controller';
import { ParkingOfferService } from './parking-offer.service';

describe('ParkingOfferController', () => {
  let controller: ParkingOfferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParkingOfferController],
      providers: [ParkingOfferService],
    }).compile();

    controller = module.get<ParkingOfferController>(ParkingOfferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

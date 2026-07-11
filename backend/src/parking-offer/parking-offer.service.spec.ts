import { Test, TestingModule } from '@nestjs/testing';
import { ParkingOfferService } from './parking-offer.service';

describe('ParkingOfferService', () => {
  let service: ParkingOfferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParkingOfferService],
    }).compile();

    service = module.get<ParkingOfferService>(ParkingOfferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

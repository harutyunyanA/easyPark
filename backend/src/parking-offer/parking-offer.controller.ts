import { Controller } from '@nestjs/common';
import { ParkingOfferService } from './parking-offer.service';

@Controller('parking-offer')
export class ParkingOfferController {
  constructor(private readonly parkingOfferService: ParkingOfferService) {}
}

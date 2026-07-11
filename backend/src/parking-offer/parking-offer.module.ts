import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingOfferService } from './parking-offer.service';
import { ParkingOfferController } from './parking-offer.controller';
import { ParkingOffer } from './entity/parking-offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingOffer])],
  controllers: [ParkingOfferController],
  providers: [ParkingOfferService],
  exports: [ParkingOfferService],
})
export class ParkingOfferModule {}

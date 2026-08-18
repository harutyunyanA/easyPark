import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { CreateCarDto, UpdateCarDto } from './dto/createCar.dto';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  getUserCars(@CurrentUser('userId') userId: number) {
    return this.carsService.findAllByOwner(userId);
  }
  
  @Get('/brands')
  getCarBrands() {
    return this.carsService.getCarBrands();
  }

  @Get('/colors')
  getCarColors() {
    return this.carsService.getCarColors()
  }

  @Post()
  addCar(@CurrentUser('userId') userId: number, @Body() body: CreateCarDto) {
    return this.carsService.addCar(userId, body);
  }

  @Get(':id')
  findCar(
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.carsService.findCarById(userId, id);
  }

  @Patch(':id')
  updateCar(
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCarDto,
  ) {
    return this.carsService.updateCar(userId, id, body);
  }

  @Delete(':id')
  removeCar(
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.carsService.removeCar(userId, id);
  }

  @Patch(':id/default')
  setDefault(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.carsService.setDefault(userId, id);
  }
}

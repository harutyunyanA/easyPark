import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from './entities/car.entity';
import { CarBrand } from './entities/brand.entity';
import { ConfigService } from '@nestjs/config';
import { CreateCarDto, UpdateCarDto } from './dto/createCar.dto';
import { CarColor } from './carsColors';

@Injectable()
export class CarsService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Car)
    private carRepository: Repository<Car>,

    @InjectRepository(CarBrand)
    private carBrandRepository: Repository<CarBrand>,
  ) {}

  private flattenCar({ brandId, brand, ...car }: Car) {
    return { ...car, brand: brand.brand };
  }

  async findAllByOwner(ownerId: number) {
    const cars = await this.carRepository.find({
      where: { ownerId },
      order: { createdAt: 'ASC', id: 'ASC' },
    });

    return cars.map((car) => this.flattenCar(car));
  }

  async addCar(ownerId: number, car: CreateCarDto) {
    const cars = await this.findAllByOwner(ownerId);

    const limit = Number(this.configService.getOrThrow('CARS_LIMIT_PER_USER'));
    if (cars.length >= limit) {
      throw new ForbiddenException('Cars limit per user reached');
    }

    const brandExists = await this.carBrandRepository.existsBy({
      id: car.brandId,
    });
    if (!brandExists) {
      throw new NotFoundException(`Brand #${car.brandId} not found`);
    }

    const plate = car.plate.trim().toUpperCase();
    if (cars.some((c) => c.plate === plate)) {
      throw new ConflictException('Car with this plate already exists');
    }

    const isFirst = cars.length === 0;
    const makeDefault = isFirst || car.isDefault === true;

    return this.carRepository.manager.transaction(async (manager) => {
      if (makeDefault && !isFirst) {
        await manager.update(
          Car,
          { ownerId, isDefault: true },
          { isDefault: false },
        );
      }

      const newCar = manager.create(Car, {
        ownerId,
        brandId: car.brandId,
        model: car.model.trim(),
        color: car.color,
        plate,
        isDefault: makeDefault,
      });

      return manager.save(newCar);
    });
  }

  async findCarById(ownerId: number, carId: number) {
    const car = await this.carRepository.findOne({
      where: { ownerId, id: carId },
    });

    if (!car) {
      throw new NotFoundException(`Car #${carId} not found`);
    }

    return this.flattenCar(car);
  }

  async updateCar(ownerId: number, carId: number, body: UpdateCarDto) {
    const car = await this.carRepository.findOne({
      where: { ownerId, id: carId },
    });
    if (!car) {
      throw new NotFoundException(`Car #${carId} not found`);
    }

    if (body.brandId !== undefined && body.brandId !== car.brandId) {
      const brandExists = await this.carBrandRepository.existsBy({
        id: body.brandId,
      });
      if (!brandExists) {
        throw new NotFoundException(`Brand #${body.brandId} not found`);
      }
      car.brandId = body.brandId;
    }

    if (body.plate !== undefined) {
      const plate = body.plate.trim().toUpperCase();
      if (
        plate !== car.plate &&
        (await this.carRepository.existsBy({ ownerId, plate }))
      ) {
        throw new ConflictException('Car with this plate already exists');
      }
      car.plate = plate;
    }

    if (body.model !== undefined) {
      car.model = body.model.trim();
    }
    if (body.color !== undefined) {
      car.color = body.color;
    }

    await this.carRepository.save(car);

    return this.findCarById(ownerId, carId);
  }

  async removeCar(ownerId: number, carId: number) {
    const car = await this.carRepository.findOne({
      where: { ownerId, id: carId },
    });
    if (!car) {
      throw new NotFoundException(`Car #${carId} not found`);
    }

    await this.carRepository.manager.transaction(async (manager) => {
      await manager.delete(Car, { id: carId, ownerId });

      if (car.isDefault) {
        const next = await manager.findOne(Car, {
          where: { ownerId },
          order: { createdAt: 'ASC', id: 'ASC' },
        });
        if (next) {
          await manager.update(Car, { id: next.id }, { isDefault: true });
        }
      }
    });
  }

  async setDefault(ownerId: number, carId: number) {
    const car = await this.carRepository.findOne({
      where: { ownerId, id: carId },
    });
    if (!car) {
      throw new NotFoundException(`Car #${carId} not found`);
    }

    if (car.isDefault) {
      return this.flattenCar(car);
    }

    await this.carRepository.manager.transaction(async (manager) => {
      await manager.update(
        Car,
        { ownerId, isDefault: true },
        { isDefault: false },
      );
      await manager.update(Car, { id: carId, ownerId }, { isDefault: true });
    });

    return this.findCarById(ownerId, carId);
  }

  async getCarBrands() {
    return await this.carBrandRepository.find();
  }

  async getCarColors() {
    return Object.values(CarColor);
  }
}

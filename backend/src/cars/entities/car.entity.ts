import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CarColor } from '../carsColors';
import { CarBrand } from './brand.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
@Index(['ownerId', 'plate'], { unique: true })
export class Car {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.cars, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  owner!: User;

  @Column()
  ownerId!: number;

  @ManyToOne(() => CarBrand, (brand) => brand.cars, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: true,
  })
  brand!: CarBrand;

  @Column()
  brandId!: number;

  @Column({ type: 'varchar', length: 100 })
  model!: string;

  @Column({ type: 'enum', enum: CarColor, default: CarColor.WHITE })
  color!: CarColor;

  @Column({ type: 'varchar', length: 16 })
  plate!: string;

  @Column({ default: false })
  isDefault!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

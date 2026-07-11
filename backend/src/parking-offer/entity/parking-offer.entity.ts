import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Car } from '../../cars/entities/car.entity';

export enum ParkingOfferStatus {
  OPEN = 'open',
  RESERVED = 'reserved',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

const decimalTransformer = {
  to: (value: number | null) => value,
  from: (value: string | null) => (value === null ? null : parseFloat(value)),
};

@Entity()
@Index(['status'])
@Index(['latitude', 'longitude'])
export class ParkingOffer {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  owner!: User;

  @Column()
  ownerId!: number;

  @ManyToOne(() => Car, { nullable: true, onDelete: 'SET NULL' })
  car!: Car | null;

  @Column({ nullable: true })
  carId!: number | null;

  @Column('decimal', {
    precision: 9,
    scale: 6,
    transformer: decimalTransformer,
  })
  latitude!: number;

  @Column('decimal', {
    precision: 9,
    scale: 6,
    transformer: decimalTransformer,
  })
  longitude!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note!: string | null;

  @Column({
    type: 'enum',
    enum: ParkingOfferStatus,
    default: ParkingOfferStatus.OPEN,
  })
  status!: ParkingOfferStatus;

  @Column({ type: 'timestamptz', nullable: true })
  leavingAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

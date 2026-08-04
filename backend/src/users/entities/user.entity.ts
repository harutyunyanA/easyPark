import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Car } from '../../cars/entities/car.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', select: false, nullable: true })
  passwordHash!: string | null;

  @Column({ type: 'varchar', select: false, nullable: true })
  refreshTokenHash!: string | null;

  @Column({ length: 255 })
  name!: string;

  @Column({ nullable: true, unique: true, default: null })
  phone!: string;

  // Ключ объекта в R2 (напр. avatars/12/uuid.webp), а не готовый URL: публичный
  // домен бакета меняется (r2.dev → свой), данные при этом переписывать не надо.
  @Column({ type: 'varchar', nullable: true, default: null })
  avatarKey!: string | null;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ type: 'varchar', nullable: true, select: false })
  verificationCodeHash!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  verificationCodeExpiresAt!: Date | null;

  @Column({ default: false })
  isActive!: boolean;

  @Check(`"tokenBalance" >= 0`)
  @Column({ type: 'int', default: 5 })
  tokenBalance!: number;

  @OneToMany(() => Car, (car) => car.owner)
  cars!: Car[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

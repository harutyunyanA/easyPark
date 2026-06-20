import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ nullable: true, default: null })
  avatarURL!: string;

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

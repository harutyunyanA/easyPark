import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}
  async create(body: CreateUserDto) {
    const { email, password, name, phone, avatarURL } = body;
    const existingProfile = await this.isEmailExists(email);

    if (existingProfile) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      email,
      name,
      phone,
      avatarURL,
      passwordHash: hashedPassword,
    });

    await this.userRepository.save(newUser);

    const { passwordHash: _, ...result } = newUser;
    return result;
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    this.userRepository.merge(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`User #${id} not found`);
    }
  }

  async updatePassword(
    id: number,
    data: {
      password: string;
      currentPassword: string;
    },
  ) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: { id: true, passwordHash: true },
    });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    if (!user.passwordHash) {
      throw new BadRequestException(
        'Password change is not available for this account',
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      data.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(data.password, 10);

    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async requestEmailVerification(id: number) {
    const user = await this.findOne(id);
    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const code = randomInt(100000, 1000000).toString();
    user.verificationCodeHash = await bcrypt.hash(code, 10);
    user.verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.userRepository.save(user);

    await this.mailService.sendVerificationCode(user.email, code);

    return { message: 'Verification code sent' };
  }

  async confirmEmailVerification(id: number, code: string) {
    // verificationCodeHash скрыт через select: false — достаём явно
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        isVerified: true,
        verificationCodeHash: true,
        verificationCodeExpiresAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }
    if (
      !user.verificationCodeHash ||
      !user.verificationCodeExpiresAt ||
      user.verificationCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'Verification code expired, request a new one',
      );
    }

    const isCodeValid = await bcrypt.compare(code, user.verificationCodeHash);
    if (!isCodeValid) {
      throw new BadRequestException('Invalid verification code');
    }

    user.isVerified = true;
    user.verificationCodeHash = null;
    user.verificationCodeExpiresAt = null;
    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async isEmailExists(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }
  async findForAuth(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });
  }

  async findForRefresh(id: number) {
    return this.userRepository.findOne({
      where: { id },
      select: { id: true, email: true, refreshTokenHash: true },
    });
  }

  async updateRefreshToken(userId: number, refreshTokenHash: string | null) {
    await this.userRepository.update(userId, { refreshTokenHash });
  }

  async isPhoneExists(phone: string) {
    return await this.userRepository.findOne({ where: { phone } });
  }
}

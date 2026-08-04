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
import { randomInt, randomUUID } from 'node:crypto';
import { MailService } from '../mail/mail.service';
import { StorageService } from '../storage/storage.service';
import {
  AVATAR_CONTENT_TYPES,
  AVATAR_MAX_BYTES,
  AVATAR_UPLOAD_URL_TTL_SECONDS,
} from './dto/avatar.dto';

const AVATAR_EXTENSIONS: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly storageService: StorageService,
  ) {}
  async create(body: CreateUserDto) {
    const { email, password, name } = body;
    const existingProfile = await this.isEmailExists(email);

    if (existingProfile) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      email,
      name,
      passwordHash: hashedPassword,
    });

    await this.userRepository.save(newUser);

    const { passwordHash: _, ...result } = newUser;
    return result;
  }

  async findAll() {
    const users = await this.userRepository.find();
    return users.map((user) => this.toPublicUser(user));
  }

  async findOne(id: number) {
    return this.toPublicUser(await this.getEntity(id));
  }

  /**
   * Сырая сущность — её можно менять и сохранять. toPublicUser возвращает уже
   * не сущность (лишнее поле avatarUrl), и save() на ней упадёт, поэтому
   * внутренние мутации ходят сюда, а наружу отдаём через toPublicUser.
   */
  private async getEntity(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  /**
   * Склеивает ключ объекта с доменом бакета. Домен живёт в .env на бэке, а не
   * в бинарнике приложения: сменить r2.dev на свой домен = перезапуск сервера,
   * а не релиз в сторах и битые аватарки у всех, кто не обновился.
   */
  private toPublicUser(user: User) {
    const { avatarKey, ...rest } = user;
    return {
      ...rest,
      avatarUrl: avatarKey
        ? this.storageService.buildPublicUrl(avatarKey)
        : null,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const phoneOwner = await this.isPhoneExists(updateUserDto.phone);
      if (phoneOwner && phoneOwner.id !== id) {
        throw new ConflictException('User with this phone already exists');
      }
    }

    this.userRepository.merge(user, updateUserDto);
    return this.toPublicUser(await this.userRepository.save(user));
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
    const user = await this.getEntity(id);
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

  /**
   * Подписывает ссылку, по которой клиент грузит файл прямо в R2.
   * Трафик через бэк не идёт — только подпись.
   */
  async createAvatarUploadUrl(
    userId: number,
    contentType: (typeof AVATAR_CONTENT_TYPES)[number],
  ) {
    const key = `avatars/${userId}/${randomUUID()}.${AVATAR_EXTENSIONS[contentType]}`;
    const uploadUrl = await this.storageService.createUploadUrl(
      key,
      contentType,
      AVATAR_UPLOAD_URL_TTL_SECONDS,
    );

    return {
      key,
      uploadUrl,
      maxBytes: AVATAR_MAX_BYTES,
      expiresIn: AVATAR_UPLOAD_URL_TTL_SECONDS,
    };
  }

  /**
   * Второй шаг: клиент сообщает, что залил файл. Presigned PUT не умеет
   * ограничивать размер, поэтому реальные тип и вес проверяем здесь по HEAD,
   * а не доверяем клиенту.
   */
  async confirmAvatar(userId: number, key: string) {
    // Ключ выдавали мы, но вернулся он от клиента — иначе можно привязать себе
    // чужой объект из бакета.
    if (!key.startsWith(`avatars/${userId}/`)) {
      throw new BadRequestException('Invalid avatar key');
    }

    const user = await this.getEntity(userId);
    const meta = await this.storageService.getObjectMeta(key);
    if (!meta) {
      throw new BadRequestException('Avatar file was not uploaded');
    }

    const isAllowedType =
      !!meta.contentType &&
      (AVATAR_CONTENT_TYPES as readonly string[]).includes(meta.contentType);

    if (!isAllowedType || meta.size > AVATAR_MAX_BYTES) {
      await this.storageService.deleteObjectQuietly(key);
      throw new BadRequestException(
        `Avatar must be an image up to ${AVATAR_MAX_BYTES / 1024 / 1024} MB`,
      );
    }

    const previousKey = user.avatarKey;
    user.avatarKey = key;
    await this.userRepository.save(user);

    if (previousKey && previousKey !== key) {
      await this.storageService.deleteObjectQuietly(previousKey);
    }

    return this.toPublicUser(user);
  }

  async removeAvatar(userId: number) {
    const user = await this.getEntity(userId);
    const previousKey = user.avatarKey;

    if (previousKey) {
      user.avatarKey = null;
      await this.userRepository.save(user);
      await this.storageService.deleteObjectQuietly(previousKey);
    }

    return this.toPublicUser(user);
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

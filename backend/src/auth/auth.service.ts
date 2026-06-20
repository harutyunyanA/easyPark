import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { createHash, timingSafeEqual } from 'node:crypto';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/signIn.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtTokenPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(dto: SignInDto) {
    const user = await this.usersService.findForAuth(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { id: user.id, email: user.email };
  }

  async signIn(dto: SignInDto) {
    const user = await this.validateUser(dto);
    return this.issueTokens({ sub: user.id, email: user.email });
  }

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return this.issueTokens({ sub: user.id, email: user.email });
  }

  async refreshTokens(refreshToken: string) {
    let payload: JwtTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtTokenPayload>(
        refreshToken,
        { secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET') },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findForRefresh(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (!this.refreshMatches(refreshToken, user.refreshTokenHash)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens({ sub: user.id, email: user.email });
  }

  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out' };
  }

  private async issueTokens(payload: JwtTokenPayload) {
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    await this.usersService.updateRefreshToken(
      payload.sub,
      this.hashToken(refreshToken),
    );

    return {
      accessToken,
      refreshToken,
      userId: payload.sub,
      email: payload.email,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private refreshMatches(token: string, storedHash: string): boolean {
    const incoming = Buffer.from(this.hashToken(token));
    const stored = Buffer.from(storedHash);
    return (
      incoming.length === stored.length && timingSafeEqual(incoming, stored)
    );
  }
}

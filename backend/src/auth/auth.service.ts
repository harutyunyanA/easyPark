import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/signIn.dto';
import { JwtTokenPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async validateUser(dto: SignInDto) {
    const user = await this.usersService.findForAuth(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      id: user.id,
      email: user.email,
    };
  }

  async signIn(dto: SignInDto) {
    const user = await this.validateUser(dto);
    const tokenPayload : JwtTokenPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return {
      accessToken,
      email: user.email,
      userId: user.id,
    };
  }
}

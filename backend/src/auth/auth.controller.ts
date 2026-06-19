import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { AuthGuard } from './guards/auth.guard';
import { UsersService } from '../users/users.service';
import { CurrentUser } from './decorators/currentUser.decorator';
import { AuthUser } from './types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  singin(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getUserInfo(@CurrentUser('userId') userId: number) {
    return this.usersService.findOne(userId);
  }
}

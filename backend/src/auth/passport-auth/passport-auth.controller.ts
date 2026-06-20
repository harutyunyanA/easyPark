import { Controller, Get, NotImplementedException, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PassportLocalGuard } from '../guards/passport-local.guard';
import { Public } from '../decorators/public.decorator';

@Controller('auth-v2')
export class PassportAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UseGuards(PassportLocalGuard)
  login() {
    return "Ok"
  }

  @Get('me')
  getUserInfo() {
    throw new NotImplementedException();
  }
}

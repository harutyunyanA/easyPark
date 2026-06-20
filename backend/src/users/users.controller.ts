import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch('me')
  update(
    @CurrentUser('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser('userId') userId: number) {
    return this.usersService.remove(userId);
  }

  @Patch('me/password')
  updateUserPassword(
    @CurrentUser('userId') userId: number,
    @Body() body: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(userId, body);
  }

  @Post('me/email-verification')
  requestEmailVerification(@CurrentUser('userId') userId: number) {
    return this.usersService.requestEmailVerification(userId);
  }

  @Post('me/email-verification/confirm')
  confirmEmailVerification(
    @CurrentUser('userId') userId: number,
    @Body() body: VerifyEmailDto,
  ) {
    return this.usersService.confirmEmailVerification(userId, body.code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}

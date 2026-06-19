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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Patch(':id/password')
  updateUserPassword(@Param('id') id: string, @Body() body: UpdatePasswordDto) {
    return this.usersService.updatePassword(+id, body);
  }

  @Post(':id/email-verification')
  requestEmailVerification(@Param('id') id: string) {
    return this.usersService.requestEmailVerification(+id);
  }

  @Post(':id/email-verification/confirm')
  confirmEmailVerification(
    @Param('id') id: string,
    @Body() body: VerifyEmailDto,
  ) {
    return this.usersService.confirmEmailVerification(+id, body.code);
  }
}

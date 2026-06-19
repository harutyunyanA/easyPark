import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsStrongPassword, Matches } from 'class-validator';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['name', 'avatarURL'] as const),
) {}

// export class UpdatePhoneDto {
//   @Matches(/^\+?[0-9]{7,15}$/)
//   phone!: string;
// }

export class UpdatePasswordDto extends PickType(CreateUserDto, [
  'password',
] as const) {
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  currentPassword!: string;
}

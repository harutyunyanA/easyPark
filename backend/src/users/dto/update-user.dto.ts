import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsStrongPassword, Matches } from 'class-validator';

// Телефон при регистрации не задаётся — только в профиле, поэтому его правила
// живут здесь, а не в CreateUserDto. Аватар через этот DTO не меняется: ключ
// объекта в R2 назначает бэк, см. POST /users/me/avatar/upload-url.
export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['name'] as const),
) {
  // Принимаем только армянские номера: +374 и ровно 8 цифр национальной части
  // (мобильные 91 234567, Ереван 10 123456, регионы 232 12345).
  // Держим в синхроне с фронтом: frontend/src/components/edit-field-screen.tsx
  @IsOptional()
  @Matches(/^\+374[0-9]{8}$/, {
    message: 'phone must be an Armenian number: +374 followed by 8 digits',
  })
  phone?: string;
}

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

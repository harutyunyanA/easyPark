import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { CarColor } from '../carsColors';
import { OmitType, PartialType } from '@nestjs/mapped-types';

const ARMENIAN_PLATE_REGEX = /^(\d{2}[a-zA-Z]{2}\d{3}|\d{3}[a-zA-Z]{2}\d{2})$/;

export class CreateCarDto {
  @IsInt()
  @IsPositive()
  brandId!: number;

  @IsString()
  @MaxLength(100)
  model!: string;

  @IsString()
  @Matches(ARMENIAN_PLATE_REGEX, {
    message:
      'plate must be a valid Armenian license plate (e.g. 12AB345 or 123AB45)',
  })
  plate!: string;

  @IsOptional()
  @IsEnum(CarColor)
  color?: CarColor;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateCarDto extends PartialType(
  OmitType(CreateCarDto, ['isDefault'] as const),
) {}

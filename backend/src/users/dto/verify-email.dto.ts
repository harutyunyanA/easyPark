import { Matches } from 'class-validator';

export class VerifyEmailDto {
  @Matches(/^\d{6}$/)
  code!: string;
}

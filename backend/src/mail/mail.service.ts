import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.resend = new Resend(config.getOrThrow<string>('RESEND_API_KEY'));
    this.from = config.getOrThrow<string>('MAIL_FROM');
  }

  async sendVerificationCode(to: string, code: string) {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Код подтверждения EasyPark',
      html: `<p>Твой код подтверждения: <b>${code}</b>. Действует 10 минут.</p>`,
    });

    if (error) {
      this.logger.error(`Resend error: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }
}

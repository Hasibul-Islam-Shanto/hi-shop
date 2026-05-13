import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface SendMailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Mail<SMTPTransport.SentMessageInfo> | null = null;

  constructor(private readonly config: ConfigService) {
    const user = this.config.get<string>('EMAIL_USER');
    const pass = this.config.get<string>('EMAIL_PASS');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    } else {
      this.logger.warn(
        'MailService: EMAIL_USER / EMAIL_PASS not set — sendMail calls will be no-ops.',
      );
    }
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    if (!this.transporter) return;
    const from = this.config.get<string>('EMAIL_USER');
    await this.transporter.sendMail({
      from: `"Hi-Shop" <${from}>`,
      ...options,
    });
  }
}

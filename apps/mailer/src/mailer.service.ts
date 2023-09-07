import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { defaultResetMailTemplate } from './templates/default-reset-mail.template';

@Injectable()
export class MailerService {
  private nodemailerTransport: Mail;
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly configService: ConfigService) {
    this.nodemailerTransport = createTransport({
      service: configService.get<string>('EMAIL_SERVICE'),
      auth: {
        user: configService.get<string>('EMAIL_USER'),
        pass: configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    // Checks if tranport works properly
    this.nodemailerTransport.verify((error, success) => {
      if (error) {
        this.logger.error(
          `Nodemailer transport connection failed. Details: ${JSON.stringify(
            error.message,
          )}`,
        );
      } else if (success) {
        this.logger.log('Nodemailer is ready to send messages');
      }
    });
  }

  async sendForgotPasswordMail(
    token: string,
    recepient: string,
  ): Promise<boolean> {
    this.nodemailerTransport.sendMail(
      {
        to: recepient,
        subject: `Password reset request ${this.configService.get<string>(
          'EMAIL_RESET_URL',
        )}`,
        html: defaultResetMailTemplate(
          this.configService.get<string>('EMAIL_RESET_URL'),
          token,
        ),
      },
      (err, info) => {
        this.logger.warn(
          `Error during sending mail to ${JSON.stringify(
            info.envelope.to,
          )}: ${JSON.stringify(err.message)}`,
        );

        throw new ConflictException();
      },
    );

    return true;
  }
}

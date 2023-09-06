import { Controller } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { send_forgot_mail } from '../../../libs/common/src';

@Controller()
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @MessagePattern(send_forgot_mail)
  async sendForgotMail(
    @Payload() data: { recepient: string; token: string },
  ): Promise<boolean> {
    return this.mailerService.sendForgotPasswordMail(
      data.token,
      data.recepient,
    );
  }
}

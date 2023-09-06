import { Controller } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { send_forgot_mail } from '../../../libs/common/src';
import { SendForgotMailDto } from './dto/send-forgot-mail.dto';

@Controller()
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @MessagePattern(send_forgot_mail)
  async sendForgotMail(
    @Payload() { token, recepient }: SendForgotMailDto,
  ): Promise<boolean> {
    return this.mailerService.sendForgotPasswordMail(token, recepient);
  }
}

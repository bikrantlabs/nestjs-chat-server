import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { VerificationCodeDocument } from 'src/entities/verification-code.entity';

@Injectable()
export class EmailsService {
  constructor(private readonly mailService: MailerService) {}
  sendVerifyEmailMail(
    verificationCode: VerificationCodeDocument,
    to: string,
  ): boolean {
    try {
      this.mailService.sendMail({
        to,
        subject: 'Verify your email',
        html: `<h1>Welcome</h1>. Your verification code is: <h4>${verificationCode.code}</h4> `,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

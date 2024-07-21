import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { EmailsModule } from 'src/emails/emails.module';
import { User, UserSchema } from 'src/entities/user.entity';
import {
  VerificationCode,
  VerificationCodeSchema,
} from 'src/entities/verification-code.entity';
import { FileModule } from 'src/file/file.module';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { EmailsService } from 'src/emails/emails.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.jwt_secret_access,
      signOptions: { expiresIn: '5m' },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: VerificationCode.name, schema: VerificationCodeSchema },
    ]),

    FileModule,
    ConfigModule,
    EmailsModule,
  ],
  providers: [AuthService, EmailsService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

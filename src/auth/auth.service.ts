import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { EmailsService } from 'src/emails/emails.service';
import {
  VerificationCode,
  VerificationCodeDocument,
} from 'src/entities/verification-code.entity';
import { ReturnType } from 'src/types/return.type';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { LoginUserDto, RegisterUserDto, VerifyEmailDto } from './dto';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(VerificationCode.name)
    private verificationCodeModel: Model<VerificationCodeDocument>,
    private emailService: EmailsService,
  ) {}
  async register(
    { email, password, username }: RegisterUserDto,
    file?: Express.Multer.File,
  ): Promise<ReturnType> {
    const userExists = await this.usersService.getUser(email);
    if (userExists) {
      throw new BadRequestException('Email already registered');
    }
    let avatar: string;
    if (file) {
      // console.log(`🔥 auth.service.ts:26 ~ File Received ~`, file);
      avatar = await this.usersService.uploadAvatar(file);
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    const createdUser = await this.usersService.createUser({
      email,
      password: hash,
      username,
      avatar,
    });
    const verificationCode = await this.generateVerificationCode(
      createdUser.email,
    );
    // TODO: Send email verification mail

    const success = this.emailService.sendVerifyEmailMail(
      verificationCode,
      'nerdbikrant007@gmail.com',
    );
    if (!success)
      return {
        data: {
          message: 'Error sending verification mail',
          type: 'error',
        },
        success: false,
      };
    return {
      data: {
        message: 'Verification mail sent! Expired in 10 minutes',
        type: 'success',
      },
      success: true,
    };
  }
  async login({
    email,
    password,
  }: LoginUserDto): Promise<{ access_token: string }> {
    const user = (await this.usersService.getUser(email)).toObject();
    if (user) {
      if (!user.emailVerified) {
        throw new ForbiddenException('Email not verified');
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        const payload = { email, id: user._id };
        return {
          access_token: this.jwtService.sign(payload),
        };
      }
    }
    throw new BadRequestException('Incorrect Credentials');
  }

  async verifyEmail({ code }: VerifyEmailDto): Promise<ReturnType> {
    // Get if token verification token exists in Database const token = getVerificationCodeByToken(token),
    const _code = await this.getVerificationCodeByCode(code);
    if (!_code) {
      throw new BadRequestException('Verification Code Invalid');
    }
    if (_code && _code.expires <= new Date()) {
      throw new BadRequestException('Verification Token Expired');
    }
    const existingUser = await this.usersService.getUser(_code.email);
    if (!existingUser) {
      throw new BadRequestException('Invalid Token');
    }
    existingUser.emailVerified = new Date();
    await existingUser.save();
    await this.verificationCodeModel.deleteOne({
      _id: _code._id,
    });
    return {
      data: {
        message: 'Email verified successfully.',
        type: 'success',
      },
      success: true,
    };
  }

  async generateVerificationCode(
    email: string,
  ): Promise<VerificationCodeDocument> {
    const token = crypto.randomInt(100000, 1000000).toString();
    const expires = new Date(new Date().getTime() + 600 + 1000); // Milliseconds 10 minutes
    // Delete existing token and generate new one
    const existingToken = await this.verificationCodeModel.findOne({
      email,
    });
    if (existingToken) {
      await this.verificationCodeModel.deleteOne({
        _id: existingToken._id,
      });
    }

    const newCode = await new this.verificationCodeModel({
      email,
      code: token,
      expires,
    }).save();
    return newCode.toObject();
  }

  async getVerificationCodeByCode(code: string) {
    const token = await this.verificationCodeModel.findOne({
      code: code,
    });
    if (!token) return undefined;
    return token.toObject();
  }
}

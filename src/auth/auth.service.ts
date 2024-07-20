import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginUserDto, RegisterUserDto, VerifyEmailDto } from './dto';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import {
  VerificationToken,
  VerificationTokenDocument,
} from 'src/entities/verification-token.entity';
import { Model } from 'mongoose';
import { ReturnType } from 'src/types/return.type';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(VerificationToken.name)
    private verificationTokenModel: Model<VerificationTokenDocument>,
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
    const verificationToken = await this.generateVerificationToken(
      createdUser.email,
    );
    // TODO: Send email verification mail
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

  async verifyEmail({ token }: VerifyEmailDto) {
    // Get if token verification token exists in Database const token = getVerificationTokenByToken(token),
    // If not exists, return error
    // If token exists but expire return error
    // Get existing user from token.email
    // Set the emailVerified:true,
  }

  async generateVerificationToken(
    email: string,
  ): Promise<VerificationTokenDocument> {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 600 + 1000); // Milliseconds 10 minutes
    // Delete existing token and generate new one
    const existingToken = await this.verificationTokenModel.findOne({
      email,
    });
    if (existingToken) {
      await this.verificationTokenModel.deleteOne({
        _id: existingToken._id,
      });
    }

    const newToken = await new this.verificationTokenModel({
      email,
      token,
      expires,
    }).save();
    return newToken.toObject();
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto, RegisterUserDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { FileService } from 'src/file/file.service';
import { FileType } from 'src/file/types';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private fileService: FileService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  async register(
    { email, password, username }: RegisterUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    const userExists = await this.usersService.getUser(email);
    if (userExists) {
      throw new BadRequestException('Email already registered');
    }

    if (file) {
      // console.log(`🔥 auth.service.ts:26 ~ File Received ~`, file);
      const path = await this.fileService.saveFile(file, {
        filetype: FileType.Video,
      });
      console.log(`🔥 auth.service.ts:30 ~ Upload path ~`, path);
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    return this.usersService.createUser({
      email,
      password: hash,
      username,
    });
  }
  async login({
    email,
    password,
  }: LoginUserDto): Promise<{ access_token: string }> {
    const user = (await this.usersService.getUser(email)).toObject();
    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        const payload = { email, id: user._id };
        return {
          access_token: this.jwtService.sign(payload),
        };
      }
    }
    throw new BadRequestException('Incorrect Credentials');
    // const payload = { username: dto.email, sub: dto.password };
  }
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.getUser(username);
    if (user && user.password === pass) {
      const { ...result } = user;
      return result;
    }
    return null;
  }
}

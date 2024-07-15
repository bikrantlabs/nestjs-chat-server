import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto, RegisterUserDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  async register({
    email,
    password,
    username,
  }: RegisterUserDto): Promise<User> {
    const userExists = await this.usersService.getUser(email);
    if (userExists) {
      throw new BadRequestException('Email already registered');
    }
    // TODO: hash password
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    return this.usersService.createUser({ email, password: hash, username });
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

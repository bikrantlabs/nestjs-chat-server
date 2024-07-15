import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterUserDto } from 'src/auth/dto';
import { User, UserDocument } from 'src/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getUser(email: string): Promise<UserDocument | undefined> {
    const user = await this.userModel.findOne({
      email,
    });

    delete user.password;
    return user;
  }
  async createUser({
    email,
    password,
    username,
  }: RegisterUserDto): Promise<UserDocument> {
    const user = await new this.userModel({ email, username, password }).save();
    delete user.password;
    return user;
  }
}

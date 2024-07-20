import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterUserDto } from 'src/auth/dto';
import { User, UserDocument } from 'src/entities/user.entity';
import { FileService } from 'src/file/file.service';
import { FileType } from 'src/file/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private fileService: FileService,
  ) {}

  async getUser(email: string): Promise<UserDocument | undefined> {
    const user = await this.userModel
      .findOne({
        email,
      })
      .populate('sentFriendRequests')
      .exec();
    if (!user) return undefined;
    delete user.password;
    return user;
  }
  async createUser({
    email,
    password,
    username,
    avatar,
  }: RegisterUserDto): Promise<UserDocument> {
    const user = await new this.userModel({
      email,
      username,
      password,
      avatar,
    }).save();
    delete user.password;
    return user;
  }

  async uploadAvatar(file: Express.Multer.File, email?: string) {
    const newFilePath = await this.fileService.saveFile(file, {
      filetype: FileType.Avatar,
    });

    // Remove previous avatar and update with new if email is provided
    if (email) {
      const user = await this.userModel.findOne({
        email,
      });
      let previousAvatar: string;
      if (user && user.avatar) {
        /** /public/avatars/a.jpg */
        previousAvatar = user.avatar.split('/')[-1];
        await this.fileService.deleteFile(previousAvatar);
      }
      await this.userModel.updateOne(
        {
          email,
        },
        { avatar: newFilePath },
      );
    }
    return newFilePath;
  }

  async sendFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<UserDocument> {
    await this.userModel
      .findByIdAndUpdate(
        senderId,
        {
          $addToSet: { sentFriendRequests: receiverId },
        },
        {
          new: true,
        },
      )
      .exec();
    return await this.userModel
      .findByIdAndUpdate(
        receiverId,
        {
          $addToSet: { receivedFriendRequests: senderId },
        },
        {
          new: true,
        },
      )
      .exec();
  }
}

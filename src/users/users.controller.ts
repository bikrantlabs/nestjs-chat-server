import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Me } from './user.decorator';
import { UsersService } from './users.service';
import { SendFriendRequestDto } from './dto';
import { Model } from 'mongoose';
import { UserDocument } from 'src/entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async profile(@Me() me: UserDocument) {
    return this.usersService.getUser(me.email);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('send-friend-request')
  async sendFriendRequest(
    @Me() me: UserDocument,
    @Body() dto: SendFriendRequestDto,
  ) {
    return this.usersService.sendFriendRequest(
      me._id.toString(),
      dto.receiverId,
    );
  }
}

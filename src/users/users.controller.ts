import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Me } from './user.decorator';
import { UsersService } from './users.service';
import { AcceptFriendRequestDto, SendFriendRequestDto } from './dto';

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
  @UseGuards(AuthGuard('jwt'))
  @Post('send-friend-request')
  async acceptFriendRequest(
    @Me() me: UserDocument,
    @Body() dto: AcceptFriendRequestDto,
  ) {
    return this.usersService.acceptFriendRequest(
      me._id.toString(),
      dto.requestId,
    );
  }
}
// Kaluwa1 = 669bf0c28c8f5ad688277641

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Me } from './user.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async profile(@Me() me: { email: string; id: string }) {
    return this.usersService.getUser(me.email);
  }
}

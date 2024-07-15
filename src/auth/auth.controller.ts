import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto';
import { Response } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  // AuthGuard local is provided by nestjs/passport

  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginData = await this.authService.login(dto);
    res.cookie('Access-Token', loginData.access_token);
    console.log(`🔥 auth.controller.ts:23 ~ Login Controller ~`, loginData);
    return loginData;
  }

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async profile(@Request() req) {
    console.log(req.user);
    return req.user;
  }
}

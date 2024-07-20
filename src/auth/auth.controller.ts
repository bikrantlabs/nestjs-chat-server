import {
  Body,
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response, Express } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/file/file.service';
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private fileService: FileService,
  ) {}

  // AuthGuard local is provided by nestjs/passport
  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginData = await this.authService.login(dto);
    res.cookie('Access-Token', loginData.access_token);
    return loginData;
  }

  @Post('register')
  @UseInterceptors(
    FileInterceptor('avatar', {
      fileFilter: FileService.fileFilter,
    }),
  )
  async register(
    @Body() dto: RegisterUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.register(dto, file);
  }
}

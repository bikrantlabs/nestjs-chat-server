import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterUserDto extends LoginUserDto {
  @IsNotEmpty()
  username: string;

  @IsOptional()
  avatar?: string;

  // profilePicture: any;
}

export class VerifyEmailDto {
  token: string;
}

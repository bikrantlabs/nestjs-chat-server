import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies['Access-Token'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt_secret_access'),
    });
  }

  async validate(payload: any) {
    console.log(payload);
    return { userId: payload.id, email: payload.email };
  }
}

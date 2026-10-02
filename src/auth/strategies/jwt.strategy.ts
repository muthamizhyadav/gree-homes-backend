import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_123!',
    });
  }

  async validate(payload: any) {
    if (!payload.sub) throw new UnauthorizedException('Token payload invalid');
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      pgId: payload.pgId,
    };
  }
}
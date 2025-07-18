// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AdminUser } from '../../entities/admin-user.entity';
import { AppUser } from '../../entities/app-user.entity';

export interface JwtPayload {
  sub: number;
  email?: string;
  type: 'admin' | 'app';
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AppUser)
    private appUserRepository: Repository<AppUser>,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type === 'admin') {
      const user = await this.adminUserRepository.findOne({
        where: { id: payload.sub },
      });
      
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('관리자 계정이 비활성화되었습니다.');
      }
      
      return { ...user, type: 'admin' };
    } else {
      const user = await this.appUserRepository.findOne({
        where: { id: payload.sub },
      });
      
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('사용자 계정이 비활성화되었습니다.');
      }
      
      return { ...user, type: 'app' };
    }
  }
}
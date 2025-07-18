// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AdminUser } from '../entities/admin-user.entity';
import { AppUser } from '../entities/app-user.entity';
import { AdminAuthService } from './services/admin-auth.service';
import { AppAuthService } from './services/app-auth.service';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AppAuthController } from './controllers/app-auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser, AppUser]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
    }),
  ],
  providers: [AdminAuthService, AppAuthService, JwtStrategy],
  controllers: [AdminAuthController, AppAuthController],
  exports: [AdminAuthService, AppAuthService, JwtModule],
})
export class AuthModule {}
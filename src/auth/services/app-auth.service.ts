// src/auth/services/app-auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { AppUser, SocialProvider, AppUserStatus, Gender } from '../../entities/app-user.entity';

export interface SocialLoginDto {
  provider: SocialProvider;
  socialId: string;
  email?: string;
  name: string;
  nickname?: string;
  profileImageUrl?: string;
  birthDate?: string;
  gender?: Gender;
  phoneNumber?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface AppLoginResponse {
  user: AppUser;
  accessToken: string;
  isNewUser: boolean;
}

@Injectable()
export class AppAuthService {
  constructor(
    @InjectRepository(AppUser)
    private appUserRepository: Repository<AppUser>,
    private jwtService: JwtService,
  ) {}

  async socialLogin(socialLoginDto: SocialLoginDto, clientIp?: string): Promise<AppLoginResponse> {
    const {
      provider,
      socialId,
      email,
      name,
      nickname,
      profileImageUrl,
      birthDate,
      gender,
      phoneNumber,
      refreshToken,
    } = socialLoginDto;

    // 고유 식별자 생성 (provider + socialId)
    const uniqueSocialId = `${socialId}@${provider}`;

    // 기존 사용자 확인
    let user = await this.appUserRepository.findOne({
      where: { socialId: uniqueSocialId, provider },
    });

    let isNewUser = false;

    if (!user) {
      // 신규 사용자 생성
      user = this.appUserRepository.create({
        socialId: uniqueSocialId,
        provider,
        email,
        name,
        nickname: nickname || name,
        profileImageUrl,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender,
        phoneNumber,
        status: AppUserStatus.ACTIVE,
        refreshToken,
        tokenExpiresAt: refreshToken ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined, // 30일
      });

      user = await this.appUserRepository.save(user);
      isNewUser = true;
    } else {
      // 기존 사용자 정보 업데이트
      await this.appUserRepository.update(user.id, {
        email: email || user.email,
        name: name || user.name,
        nickname: nickname || user.nickname,
        profileImageUrl: profileImageUrl || user.profileImageUrl,
        birthDate: birthDate ? new Date(birthDate) : user.birthDate,
        gender: gender || user.gender,
        phoneNumber: phoneNumber || user.phoneNumber,
        lastLoginAt: new Date(),
        lastLoginIp: clientIp,
        refreshToken: refreshToken || user.refreshToken,
        tokenExpiresAt: refreshToken ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : user.tokenExpiresAt,
      });

      // 업데이트된 사용자 정보 다시 조회
      user = await this.appUserRepository.findOne({
        where: { id: user.id },
      });

      if (!user) {
        throw new Error('사용자 정보를 다시 조회할 수 없습니다.');
      }
    }

    // 계정 상태 확인
    if (user.status !== AppUserStatus.ACTIVE) {
      throw new UnauthorizedException('비활성화된 계정입니다.');
    }

    // JWT 토큰 생성
    const accessToken = this.generateAccessToken(user);

    return {
      user,
      accessToken,
      isNewUser,
    };
  }

  async validateUser(id: number): Promise<AppUser | null> {
    return this.appUserRepository.findOne({
      where: { id, status: AppUserStatus.ACTIVE },
    });
  }

  async updateProfile(userId: number, updateData: Partial<AppUser>): Promise<AppUser> {
    const user = await this.appUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    // 업데이트 가능한 필드만 허용
    const allowedFields = [
      'name',
      'nickname',
      'profileImageUrl',
      'birthDate',
      'gender',
      'phoneNumber',
    ];

    const filteredUpdateData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    await this.appUserRepository.update(userId, filteredUpdateData);

    const updatedUser = await this.appUserRepository.findOne({
      where: { id: userId },
    });

    if (!updatedUser) {
      throw new BadRequestException('업데이트된 사용자 정보를 조회할 수 없습니다.');
    }

    return updatedUser;
  }

  async deactivateUser(userId: number): Promise<void> {
    await this.appUserRepository.update(userId, {
      status: AppUserStatus.INACTIVE,
    });
  }

  async deleteUser(userId: number): Promise<void> {
    await this.appUserRepository.softDelete(userId);
  }

  private generateAccessToken(user: AppUser): string {
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'app' as const,
      provider: user.provider,
    };

    return this.jwtService.sign(payload);
  }

  // 사용자 통계 조회
  async getUserStats(): Promise<any> {
    const [totalUsers, activeUsers, newUsersToday] = await Promise.all([
      this.appUserRepository.count(),
      this.appUserRepository.count({
        where: { status: AppUserStatus.ACTIVE },
      }),
      this.appUserRepository.count({
        where: {
          createdAt: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
    ]);

    const providerStats = await this.appUserRepository
      .createQueryBuilder('user')
      .select('user.provider', 'provider')
      .addSelect('COUNT(*)', 'count')
      .where('user.status = :status', { status: AppUserStatus.ACTIVE })
      .groupBy('user.provider')
      .getRawMany();

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      providerStats,
    };
  }
}
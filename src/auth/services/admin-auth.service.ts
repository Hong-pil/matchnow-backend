// src/auth/services/admin-auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { AdminUser, AdminRole, AdminStatus } from '../../entities/admin-user.entity';

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminRegisterDto {
  email: string;
  password: string;
  name: string;
  role?: AdminRole;
}

export interface AdminLoginResponse {
  user: Omit<AdminUser, 'password'>;
  accessToken: string;
}

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: AdminRegisterDto): Promise<AdminLoginResponse> {
    const { email, password, name, role = AdminRole.MODERATOR } = registerDto;

    // 이메일 중복 확인
    const existingUser = await this.adminUserRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }

    // 비밀번호 해시화
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 관리자 생성
    const adminUser = this.adminUserRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
      status: AdminStatus.ACTIVE,
    });

    const savedUser = await this.adminUserRepository.save(adminUser);

    // JWT 토큰 생성
    const accessToken = this.generateAccessToken(savedUser);

    // 비밀번호 제거 후 반환
    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async login(loginDto: AdminLoginDto, clientIp?: string): Promise<AdminLoginResponse> {
    const { email, password } = loginDto;

    // 사용자 확인
    const user = await this.adminUserRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 계정 상태 확인
    if (user.status !== AdminStatus.ACTIVE) {
      throw new UnauthorizedException('비활성화된 계정입니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 로그인 정보 업데이트
    await this.adminUserRepository.update(user.id, {
      lastLoginAt: new Date(),
      lastLoginIp: clientIp,
    });

    // JWT 토큰 생성
    const accessToken = this.generateAccessToken(user);

    // 비밀번호 제거 후 반환
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async validateUser(id: number): Promise<AdminUser | null> {
    return this.adminUserRepository.findOne({
      where: { id, status: AdminStatus.ACTIVE },
    });
  }

  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.adminUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('현재 비밀번호가 일치하지 않습니다.');
    }

    // 새 비밀번호 해시화
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    await this.adminUserRepository.update(userId, {
      password: hashedNewPassword,
    });
  }

  private generateAccessToken(user: AdminUser): string {
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'admin' as const,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  // 슈퍼 관리자 계정 초기화 (최초 실행 시)
  async createSuperAdmin(): Promise<void> {
    const existingSuperAdmin = await this.adminUserRepository.findOne({
      where: { role: AdminRole.SUPER_ADMIN },
    });

    if (!existingSuperAdmin) {
      const saltRounds = 12;
      const defaultPassword = 'admin123!@#';
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

      const superAdmin = this.adminUserRepository.create({
        email: 'admin@matchnow.com',
        password: hashedPassword,
        name: '슈퍼 관리자',
        role: AdminRole.SUPER_ADMIN,
        status: AdminStatus.ACTIVE,
      });

      await this.adminUserRepository.save(superAdmin);
      console.log('🔑 슈퍼 관리자 계정이 생성되었습니다.');
      console.log('📧 이메일: admin@matchnow.com');
      console.log('🔐 비밀번호: admin123!@#');
      console.log('⚠️ 로그인 후 비밀번호를 변경해주세요.');
    }
  }
}
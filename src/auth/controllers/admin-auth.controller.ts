// src/auth/controllers/admin-auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

import { AdminAuthService, AdminLoginDto, AdminRegisterDto } from '../services/admin-auth.service';
import { AdminRole } from '../../entities/admin-user.entity';

class AdminLoginRequest implements AdminLoginDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;
}

class AdminRegisterRequest implements AdminRegisterDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;

  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  name: string;

  @IsOptional()
  @IsEnum(AdminRole, { message: '올바른 관리자 권한을 선택해주세요.' })
  role?: AdminRole;
}

class UpdatePasswordRequest {
  @IsString()
  @MinLength(8, { message: '현재 비밀번호는 최소 8자 이상이어야 합니다.' })
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: '새 비밀번호는 최소 8자 이상이어야 합니다.' })
  newPassword: string;
}

@ApiTags('Admin Authentication')
@Controller('/api/v1/admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('register')
  @ApiOperation({
    summary: '관리자 회원가입',
    description: '새로운 관리자 계정을 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '관리자 계정이 성공적으로 생성되었습니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            accessToken: { type: 'string' },
          },
        },
        message: { type: 'string', example: '관리자 계정이 생성되었습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 등록된 이메일입니다.',
  })
  @ApiBody({ type: AdminRegisterRequest })
  async register(@Body() registerDto: AdminRegisterRequest) {
    const result = await this.adminAuthService.register(registerDto);
    return {
      success: true,
      data: result,
      message: '관리자 계정이 생성되었습니다.',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '관리자 로그인',
    description: '관리자 계정으로 로그인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인이 성공했습니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            accessToken: { type: 'string' },
          },
        },
        message: { type: 'string', example: '로그인이 성공했습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '이메일 또는 비밀번호가 잘못되었습니다.',
  })
  @ApiBody({ type: AdminLoginRequest })
  async login(@Body() loginDto: AdminLoginRequest, @Request() req) {
    const clientIp = req.ip || req.connection.remoteAddress;
    const result = await this.adminAuthService.login(loginDto, clientIp);
    return {
      success: true,
      data: result,
      message: '로그인이 성공했습니다.',
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: '관리자 프로필 조회',
    description: '현재 로그인된 관리자의 프로필 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회가 성공했습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  async getProfile(@Request() req) {
    const { password, ...userWithoutPassword } = req.user;
    return {
      success: true,
      data: userWithoutPassword,
      message: '프로필 조회가 성공했습니다.',
    };
  }

  @Patch('password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: '관리자 비밀번호 변경',
    description: '현재 로그인된 관리자의 비밀번호를 변경합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호가 성공적으로 변경되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '현재 비밀번호가 일치하지 않습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiBody({ type: UpdatePasswordRequest })
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordRequest, @Request() req) {
    await this.adminAuthService.updatePassword(
      req.user.id,
      updatePasswordDto.currentPassword,
      updatePasswordDto.newPassword,
    );
    return {
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };
  }
}
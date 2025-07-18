// src/auth/controllers/app-auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Patch,
  Delete,
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
import { IsString, IsEmail, IsEnum, IsOptional, IsDateString, IsPhoneNumber } from 'class-validator';

import { AppAuthService, SocialLoginDto } from '../services/app-auth.service';
import { SocialProvider, Gender } from '../../entities/app-user.entity';

class SocialLoginRequest implements SocialLoginDto {
  @IsEnum(SocialProvider, { message: '지원하는 소셜 로그인 제공자를 선택해주세요.' })
  provider: SocialProvider;

  @IsString()
  socialId: string;

  @IsOptional()
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @IsOptional()
  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)' })
  birthDate?: string;

  @IsOptional()
  @IsEnum(Gender, { message: '올바른 성별을 선택해주세요.' })
  gender?: Gender;

  @IsOptional()
  @IsPhoneNumber('KR', { message: '올바른 한국 전화번호 형식이 아닙니다.' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}

class UpdateProfileRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @IsOptional()
  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)' })
  birthDate?: string;

  @IsOptional()
  @IsEnum(Gender, { message: '올바른 성별을 선택해주세요.' })
  gender?: Gender;

  @IsOptional()
  @IsPhoneNumber('KR', { message: '올바른 한국 전화번호 형식이 아닙니다.' })
  phoneNumber?: string;
}

@ApiTags('App User Authentication')
@Controller('/api/v1/app/auth')
export class AppAuthController {
  constructor(private readonly appAuthService: AppAuthService) {}

  @Post('social-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '소셜 로그인',
    description: '카카오, 구글, 애플 계정으로 로그인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '소셜 로그인이 성공했습니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            accessToken: { type: 'string' },
            isNewUser: { type: 'boolean' },
          },
        },
        message: { type: 'string', example: '로그인이 성공했습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '소셜 로그인에 실패했습니다.',
  })
  @ApiBody({ type: SocialLoginRequest })
  async socialLogin(@Body() socialLoginDto: SocialLoginRequest, @Request() req) {
    const clientIp = req.ip || req.connection.remoteAddress;
    const result = await this.appAuthService.socialLogin(socialLoginDto, clientIp);
    
    const message = result.isNewUser ? '회원가입이 완료되었습니다.' : '로그인이 성공했습니다.';
    
    return {
      success: true,
      data: result,
      message,
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 프로필 조회',
    description: '현재 로그인된 사용자의 프로필 정보를 조회합니다.',
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
    return {
      success: true,
      data: req.user,
      message: '프로필 조회가 성공했습니다.',
    };
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 프로필 수정',
    description: '현재 로그인된 사용자의 프로필 정보를 수정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '프로필이 성공적으로 수정되었습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiBody({ type: UpdateProfileRequest })
  async updateProfile(@Body() updateProfileDto: UpdateProfileRequest, @Request() req) {
    const updatedUser = await this.appAuthService.updateProfile(req.user.id, {
      ...updateProfileDto,
      birthDate: updateProfileDto.birthDate ? new Date(updateProfileDto.birthDate) : undefined,
    });

    return {
      success: true,
      data: updatedUser,
      message: '프로필이 성공적으로 수정되었습니다.',
    };
  }

  @Delete('deactivate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: '계정 비활성화',
    description: '현재 로그인된 사용자의 계정을 비활성화합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '계정이 성공적으로 비활성화되었습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  async deactivateAccount(@Request() req) {
    await this.appAuthService.deactivateUser(req.user.id);
    return {
      success: true,
      message: '계정이 성공적으로 비활성화되었습니다.',
    };
  }

  @Delete('delete')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: '계정 삭제',
    description: '현재 로그인된 사용자의 계정을 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '계정이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  async deleteAccount(@Request() req) {
    await this.appAuthService.deleteUser(req.user.id);
    return {
      success: true,
      message: '계정이 성공적으로 삭제되었습니다.',
    };
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 통계 조회',
    description: '앱 사용자 통계 정보를 조회합니다. (관리자용)',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 통계 조회가 성공했습니다.',
  })
  async getUserStats() {
    const stats = await this.appAuthService.getUserStats();
    return {
      success: true,
      data: stats,
      message: '사용자 통계 조회가 성공했습니다.',
    };
  }
}